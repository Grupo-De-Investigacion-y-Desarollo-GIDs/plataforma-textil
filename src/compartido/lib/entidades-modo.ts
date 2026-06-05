import { prisma } from '@/compartido/lib/prisma'
import type { UserRole } from '@prisma/client'

/**
 * U-04: arma el mapa de nombres amables de entidad por rol, para el toggle
 * "Operando como…" (ej. { TALLER: 'Taller La Aguja', MARCA: 'Amapola' }).
 *
 * Server-only (usa Prisma). Solo consulta para usuarios multi-rol: single-role
 * no muestra el toggle, así que devuelve {} sin pegarle a la DB.
 */
export async function construirEntidadesModo(
  userId: string,
  roles: UserRole[]
): Promise<Partial<Record<UserRole, string>>> {
  if (!roles || roles.length <= 1) return {}

  const entidades: Partial<Record<UserRole, string>> = {}

  if (roles.includes('TALLER')) {
    const taller = await prisma.taller.findFirst({
      where: { userId },
      select: { nombre: true },
    })
    if (taller?.nombre) entidades.TALLER = taller.nombre
  }

  if (roles.includes('MARCA')) {
    const marca = await prisma.marca.findFirst({
      where: { userId },
      select: { nombre: true },
    })
    if (marca?.nombre) entidades.MARCA = marca.nombre
  }

  return entidades
}
