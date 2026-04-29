import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { Prisma } from '@prisma/client'
import { logActividad } from '@/compartido/lib/log'
import { verificarCuit } from '@/compartido/lib/afip'
import { sendEmail, buildBienvenidaEmail } from '@/compartido/lib/email'
import { rateLimit, getClientIp } from '@/compartido/lib/ratelimit'
import { apiHandler, errorResponse, errorConflict } from '@/compartido/lib/api-errors'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
  role: z.enum(['TALLER', 'MARCA']),
  name: z.string().trim().min(1).optional(),
  nombre: z.string().trim().min(1).optional(),
  phone: z.string().trim().optional(),
  tallerData: z.object({
    nombre: z.string().trim().min(1, 'Nombre de taller requerido'),
    cuit: z.string().trim().min(1, 'CUIT requerido'),
    ubicacion: z.string().trim().min(1, 'Ubicacion requerida').optional().nullable(),
    capacidadMensual: z.number().int().min(0).optional(),
  }).optional(),
  marcaData: z.object({
    nombre: z.string().trim().min(1, 'Nombre de marca requerido'),
    cuit: z.string().trim().min(1, 'CUIT requerido'),
    ubicacion: z.string().trim().min(1, 'Ubicacion requerida').optional().nullable(),
    tipo: z.string().trim().min(1, 'Tipo requerido').optional().nullable(),
  }).optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'TALLER' && !data.tallerData) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['tallerData'], message: 'Datos de taller requeridos' })
  }
  if (data.role === 'MARCA' && !data.marcaData) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['marcaData'], message: 'Datos de marca requeridos' })
  }
})

export const POST = apiHandler(async (req: NextRequest) => {
  const ip = getClientIp(req)
  const blocked = await rateLimit(req, 'registro', ip)
  if (blocked) return blocked

  const raw = await req.json()
  const normalized = {
    ...raw,
    tallerData: raw.tallerData ?? raw.taller,
    marcaData: raw.marcaData ?? raw.marca,
    email: typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : raw.email,
    phone: typeof raw.phone === 'string' ? raw.phone.trim() : raw.phone,
  }

  const parsed = registerSchema.safeParse(normalized)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || 'Datos invalidos'
    return errorResponse({ code: 'INVALID_INPUT', message, status: 400 })
  }

  const data = parsed.data

  // Verificar CUIT con AfipSDK server-side
  const ERRORES_CUIT_INVALIDO = ['inexistente', 'inactivo', 'invalido']
  let cuitVerificado = false
  const cuitToVerify = data.tallerData?.cuit || data.marcaData?.cuit
  if (cuitToVerify) {
    try {
      const afipResult = await verificarCuit(cuitToVerify)
      if (afipResult.valid) {
        cuitVerificado = true
      } else if (afipResult.error) {
        const errorLower = afipResult.error.toLowerCase()
        const esCuitInvalido = ERRORES_CUIT_INVALIDO.some(e => errorLower.includes(e))
        if (esCuitInvalido) {
          return errorResponse({ code: 'INVALID_INPUT', message: afipResult.error, status: 400 })
        }
      }
    } catch {
      console.error('AFIP no disponible durante registro, permitiendo continuar')
    }
  }

  const exists = await prisma.user.findUnique({ where: { email: data.email } })
  if (exists) {
    return errorConflict('El email ya esta registrado')
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name || data.nombre || null,
        phone: data.phone || null,
        role: data.role,
        ...(data.role === 'TALLER' && data.tallerData
          ? {
              taller: {
                create: {
                  nombre: data.tallerData.nombre,
                  cuit: data.tallerData.cuit,
                  ubicacion: data.tallerData.ubicacion || null,
                  capacidadMensual: data.tallerData.capacidadMensual || 0,
                  verificadoAfip: cuitVerificado,
                },
              },
            }
          : {}),
        ...(data.role === 'MARCA' && data.marcaData
          ? {
              marca: {
                create: {
                  nombre: data.marcaData.nombre,
                  cuit: data.marcaData.cuit,
                  ubicacion: data.marcaData.ubicacion || null,
                  tipo: data.marcaData.tipo || null,
                  verificadoAfip: cuitVerificado,
                },
              },
            }
          : {}),
      },
      select: { id: true, email: true, name: true, role: true },
    })

    logActividad('AUTH_REGISTRO', user.id, { email: data.email, role: data.role })

    if (data.role === 'TALLER') {
      const nuevoTaller = await prisma.taller.findUnique({ where: { userId: user.id }, select: { id: true } })
      if (nuevoTaller) {
        const tiposDoc = await prisma.tipoDocumento.findMany({
          where: { activo: true },
          select: { id: true, nombre: true },
        })
        await prisma.validacion.createMany({
          data: tiposDoc.map(td => ({
            tallerId: nuevoTaller.id,
            tipo: td.nombre,
            tipoDocumentoId: td.id,
            estado: 'NO_INICIADO' as const,
          })),
        })
      }
    }

    const nombre = data.name || data.nombre || data.email
    sendEmail({ to: data.email, ...buildBienvenidaEmail({ nombre, role: data.role }) }).catch(() => {})

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[]) ?? []
      if (target.includes('cuit')) return errorConflict('El CUIT ingresado ya esta registrado')
      if (target.includes('email')) return errorConflict('El email ya esta registrado')
      return errorConflict()
    }
    throw error
  }
})
