import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { logActividad } from '@/lib/log'
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

export async function POST(req: NextRequest) {
  try {
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
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const data = parsed.data

    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) {
      return NextResponse.json({ error: 'El email ya esta registrado' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

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
                },
              },
            }
          : {}),
      },
      select: { id: true, email: true, name: true, role: true },
    })

    logActividad('AUTH_REGISTRO', user.id, { email: data.email, role: data.role })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[]) ?? []
      if (target.includes('cuit')) {
        return NextResponse.json({ error: 'El CUIT ingresado ya está registrado' }, { status: 409 })
      }
      if (target.includes('email')) {
        return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Ya existe un registro con esos datos' }, { status: 409 })
    }
    console.error('Error en POST /api/auth/registro:', error)
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 })
  }
}
