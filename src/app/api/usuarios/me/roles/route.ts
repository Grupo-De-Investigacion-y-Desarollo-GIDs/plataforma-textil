import { NextRequest, NextResponse } from 'next/server'
import type { UserRole } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import {
  apiHandler,
  errorAuthRequired,
  errorConflict,
  errorResponse,
} from '@/compartido/lib/api-errors'
import { rolesEfectivos } from '@/compartido/lib/roles'
import { crearEntidadParaRol } from '@/compartido/lib/crear-entidad-rol'
import {
  consultarPadron,
  errorBloqueaRegistro,
  mensajeErrorArca,
  type DatosArca,
} from '@/compartido/lib/arca'
import { logActividad } from '@/compartido/lib/log'

// U-09: agrega un segundo rol de USUARIO (solo TALLER ⇄ MARCA). Crea la entidad
// correspondiente (verificada por CUIT) y expande User.roles[] de forma explícita
// (rolesEfectivos ∪ {nuevo}), manteniendo la invariante role == activeMode.
// Los roles de equipo (ADMIN/ESTADO/CONTENIDO) NO se auto-asignan: el enum los rechaza.
const bodySchema = z.object({
  rol: z.enum(['TALLER', 'MARCA']),
  nombre: z.string().trim().min(1, 'Nombre requerido'),
  cuit: z.string().trim().min(1, 'CUIT requerido'),
})

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) return errorAuthRequired()

  const raw = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return errorResponse({
      code: 'INVALID_INPUT',
      message: parsed.error.issues[0]?.message ?? 'Datos invalidos',
      status: 400,
    })
  }
  const { rol, nombre, cuit } = parsed.data

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      roles: true,
      role: true,
      taller: { select: { id: true } },
      marca: { select: { id: true } },
    },
  })
  if (!user) return errorAuthRequired()

  // Roles que YA tiene (normalizado: roles[] vacío de un single-rol pre-U04 → [role]).
  const rolesActuales = rolesEfectivos({ roles: user.roles, role: user.role })

  // 409 si ya posee el rol (por membresía o porque la entidad ya existe).
  const yaPoseeEntidad = (rol === 'TALLER' && user.taller) || (rol === 'MARCA' && user.marca)
  if (rolesActuales.includes(rol) || yaPoseeEntidad) {
    return errorConflict('Ya tenes ese perfil')
  }

  // Verificar CUIT con ARCA (mismo path que el registro primario).
  let verificado = false
  let datosArca: DatosArca | undefined
  const resultado = await consultarPadron(cuit)
  if (resultado.exitosa && resultado.datos) {
    verificado = true
    datosArca = resultado.datos
  } else if (resultado.error && errorBloqueaRegistro(resultado.error)) {
    return errorResponse({
      code: 'INVALID_INPUT',
      message: mensajeErrorArca(resultado.error),
      status: 400,
    })
  }
  // ARCA_NO_RESPONDE / AFIPSDK_ERROR → continuar sin verificación (modo defensivo).

  // Unión EXPLÍCITA, nunca push: un single-rol pre-U04 tiene roles=[] en DB y
  // su rol original solo vive en User.role. rolesEfectivos lo recupera.
  const nuevosRoles = Array.from(new Set([...rolesActuales, rol])) as UserRole[]

  const entidad = await prisma.$transaction(async (tx) => {
    const e = await crearEntidadParaRol(tx, {
      userId: user.id,
      rol,
      nombre,
      cuit,
      verificadoAfip: verificado,
      datosArca,
    })
    await tx.user.update({
      where: { id: user.id },
      data: {
        roles: { set: nuevosRoles },
        activeMode: rol, // queda activo en el nuevo perfil
        role: rol, // invariante role == activeMode
      },
    })
    return e
  })

  logActividad('ROL_AGREGADO', user.id, { rol, entidadId: entidad.id })

  return NextResponse.json({ rol, entidadId: entidad.id, roles: nuevosRoles, activeMode: rol })
})
