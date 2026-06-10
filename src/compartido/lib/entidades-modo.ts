import { cache } from 'react'
import { prisma } from '@/compartido/lib/prisma'
import type { UserRole } from '@prisma/client'

/**
 * B-03: lectura única de los perfiles operativos (Taller/Marca) de un usuario.
 *
 * Envuelta en `cache()` de React → dentro de UN mismo request, varias llamadas con
 * el mismo `userId` comparten una sola ejecución (deduplicación). Antes el layout
 * (`construirEntidadesModo`) y `cuenta/page.tsx` consultaban taller/marca por
 * separado, con selects distintos, así que NO se deduplicaban. Ahora ambos pasan
 * por este helper con el mismo `select` (superset) → 1 par de queries por request.
 *
 * El select es el superset de lo que necesitan los consumidores: `nombre` (toggle
 * + cards), `cuit` (pre-llenado de "agregar rol") y `puntaje` (F-01, % del taller).
 */
export const getPerfilesUsuario = cache(async (userId: string) => {
  const [taller, marca] = await Promise.all([
    prisma.taller.findFirst({
      where: { userId },
      select: { cuit: true, nombre: true, puntaje: true },
    }),
    prisma.marca.findFirst({
      where: { userId },
      select: { cuit: true, nombre: true },
    }),
  ])
  return { taller, marca }
})

/**
 * U-04: arma el mapa de nombres amables de entidad por rol, para el toggle
 * "Operando como…" (ej. { TALLER: 'Taller La Aguja', MARCA: 'Amapola' }).
 *
 * Server-only (usa Prisma). Solo consulta para usuarios multi-rol: single-role
 * no muestra el toggle, así que devuelve {} sin pegarle a la DB. Comparte la
 * lectura cacheada (`getPerfilesUsuario`) con `cuenta/page.tsx` cuando ambos
 * corren en el mismo request (B-03).
 */
export async function construirEntidadesModo(
  userId: string,
  roles: UserRole[]
): Promise<Partial<Record<UserRole, string>>> {
  if (!roles || roles.length <= 1) return {}

  const { taller, marca } = await getPerfilesUsuario(userId)

  const entidades: Partial<Record<UserRole, string>> = {}
  if (roles.includes('TALLER') && taller?.nombre) entidades.TALLER = taller.nombre
  if (roles.includes('MARCA') && marca?.nombre) entidades.MARCA = marca.nombre

  return entidades
}
