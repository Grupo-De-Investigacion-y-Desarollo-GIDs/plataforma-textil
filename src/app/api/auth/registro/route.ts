import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { Prisma } from '@prisma/client'
import { logActividad } from '@/compartido/lib/log'
import { consultarPadron, errorBloqueaRegistro, mensajeErrorArca, type DatosArca } from '@/compartido/lib/arca'
import { sendEmail, buildBienvenidaEmail } from '@/compartido/lib/email'
import { rateLimit, getClientIp } from '@/compartido/lib/ratelimit'
import { estadoCuentaInicial } from '@/compartido/lib/gracia'
import { LEGAL_VERSION, TIPOS_CONSENT } from '@/compartido/lib/legal'
import { apiHandler, errorResponse, errorConflict } from '@/compartido/lib/api-errors'
import { modoRegistro, emailPermitido, esEmailDeTest } from '@/compartido/lib/registro-gate'
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
    // Normalizar a dígitos al GUARDAR (guiones/espacios fuera): el @unique de cuit compara
    // strings exactos — "20-X..." y "20X..." coexistirían como cuentas distintas del mismo
    // CUIT. Un valor que no queda en 11 dígitos lo corta ARCA (consultarPadron -> CUIT_INEXISTENTE
    // -> errorBloqueaRegistro), asi que no hace falta refine acá.
    cuit: z.string().trim().min(1, 'CUIT requerido').transform(c => c.replace(/\D/g, '')),
    ubicacion: z.string().trim().min(1, 'Ubicacion requerida').optional().nullable(),
    capacidadMensual: z.number().int().min(0).optional(),
  }).optional(),
  marcaData: z.object({
    nombre: z.string().trim().min(1, 'Nombre de marca requerido'),
    cuit: z.string().trim().min(1, 'CUIT requerido').transform(c => c.replace(/\D/g, '')),
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

  // Gate de registro por ambiente (spec v4-a). En production es 'abierto' (no-op).
  // Fuera de prod: 'allowlist' (solo REGISTRO_ALLOWLIST) salvo MODO_EVENTO=on. Corre
  // ANTES de ARCA para no gastar una consulta al padrón en un registro que se rechaza.
  const modoReg = modoRegistro()
  if (modoReg === 'allowlist' && !emailPermitido(data.email) && !esEmailDeTest(data.email)) {
    return errorResponse({
      code: 'REGISTRO_RESTRINGIDO',
      message: 'El registro en este ambiente de pruebas esta limitado. Escribi a soporte si necesitas acceso.',
      status: 403,
    })
  }

  // Verificar CUIT con ARCA via arca.ts
  let cuitVerificado = false
  let datosArca: DatosArca | undefined
  const cuitToVerify = data.tallerData?.cuit || data.marcaData?.cuit
  if (cuitToVerify) {
    const resultado = await consultarPadron(cuitToVerify)
    if (resultado.exitosa && resultado.datos) {
      cuitVerificado = true
      datosArca = resultado.datos
    } else if (resultado.error && errorBloqueaRegistro(resultado.error)) {
      return errorResponse({ code: 'INVALID_INPUT', message: mensajeErrorArca(resultado.error), status: 400 })
    }
    // ARCA_NO_RESPONDE / AFIPSDK_ERROR → continuar sin verificación (modo defensivo)
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
        // U-05: invariante multi-rol — todo user nuevo sale con roles=[role] y
        // activeMode=role (role==activeMode, role ∈ roles). Cierra la fuente para que
        // el dato no se desincronice (ver spec v4-u-05). NO usar push: setear el array.
        roles: [data.role],
        activeMode: data.role,
        // MITIGACION #307 (temporal): marcar emailVerified al crear la cuenta para
        // no bloquear el onboarding. El paso "Verificar email" del checklist
        // (onboarding.ts) gatea con !!user.emailVerified y, sin flujo de verificacion
        // implementado, quedaba en false para siempre. Revertir cuando exista el
        // flujo real (endpoint /api/auth/send-verification + magic link).
        emailVerified: new Date(),
        ...(data.role === 'TALLER' && data.tallerData
          ? {
              taller: {
                create: {
                  nombre: datosArca?.nombre || data.tallerData.nombre,
                  cuit: data.tallerData.cuit,
                  ubicacion: data.tallerData.ubicacion || null,
                  capacidadMensual: data.tallerData.capacidadMensual || 0,
                  verificadoAfip: cuitVerificado,
                  verificadoAfipAt: cuitVerificado ? new Date() : null,
                  // Estado inicial de gracia (2.3-B0): { estadoCuenta, inicioGracia }.
                  ...estadoCuentaInicial(cuitVerificado, new Date()),
                  tipoInscripcionAfip: datosArca?.tipoInscripcion ?? null,
                  categoriaMonotributo: datosArca?.categoriaMonotributo ?? null,
                  estadoCuitAfip: datosArca?.estadoCuit ?? null,
                  fechaInscripcionAfip: datosArca?.fechaInscripcion ?? null,
                  actividadesAfip: datosArca?.actividades ?? [],
                  domicilioFiscalAfip: datosArca?.domicilioFiscal ?? undefined,
                },
              },
            }
          : {}),
        ...(data.role === 'MARCA' && data.marcaData
          ? {
              marca: {
                create: {
                  nombre: datosArca?.nombre || data.marcaData.nombre,
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
    // Marca de registro sintético para el barrido de limpieza post-evento (spec v4-a §2.4).
    if (modoReg === 'evento') {
      logActividad('REGISTRO_MODO_EVENTO', user.id, { email: data.email, role: data.role })
    }

    // P-01: persistir el consentimiento (el front exige los 3 checkboxes; se registran
    // los 3 tipos con la version legal vigente). @@unique evita duplicados en reintentos.
    await prisma.consentimiento.createMany({
      data: TIPOS_CONSENT.map(tipo => ({ userId: user.id, tipo, version: LEGAL_VERSION })),
      skipDuplicates: true,
    })

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
