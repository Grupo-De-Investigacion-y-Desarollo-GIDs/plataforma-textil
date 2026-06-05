import { NextRequest, NextResponse } from 'next/server'
import type { UserRole } from '@prisma/client'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import {
  apiHandler,
  errorAuthRequired,
  errorForbidden,
  errorResponse,
} from '@/compartido/lib/api-errors'
import { rolesEfectivos } from '@/compartido/lib/roles'

const MODOS_VALIDOS: UserRole[] = ['TALLER', 'MARCA', 'ESTADO', 'ADMIN', 'CONTENIDO']

// U-04: cambia el modo activo del usuario (multi-rol).
// Doble validacion de seguridad: el modo solicitado DEBE estar en User.roles[]
// LEIDO DE LA DB (autoritativo), nunca se confia en la sesion/cliente. Cambiar
// el modo NO otorga permisos nuevos: solo elige entre roles que el user YA tiene.
export const PATCH = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) return errorAuthRequired()

  const body = (await req.json().catch(() => null)) as { modo?: unknown } | null
  const modo = body?.modo

  if (typeof modo !== 'string' || !MODOS_VALIDOS.includes(modo as UserRole)) {
    return errorResponse({
      code: 'INVALID_INPUT',
      message: 'Debes enviar un modo valido',
      status: 400,
    })
  }
  const modoSolicitado = modo as UserRole

  // Membresia CONTRA LA DB (no la sesion): roles[] efectivos, con fallback a
  // [role] para usuarios sin roles[] poblado (single-role pre-U04).
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { roles: true, role: true },
  })
  if (!user) return errorAuthRequired()

  const rolesDb = rolesEfectivos({ roles: user.roles, role: user.role })
  if (!rolesDb.includes(modoSolicitado)) {
    return errorForbidden(modoSolicitado)
  }

  // Persistir + mantener invariante role == activeMode (back-compat U-03).
  await prisma.user.update({
    where: { id: session.user.id },
    data: { activeMode: modoSolicitado, role: modoSolicitado },
  })

  return NextResponse.json({ activeMode: modoSolicitado })
})
