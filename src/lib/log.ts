import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

/**
 * Registra actividad en log_actividad.
 * Se llama fire-and-forget (no bloquea la respuesta).
 */
export function logActividad(
  accion: string,
  userId?: string | null,
  detalles?: Prisma.InputJsonValue,
) {
  prisma.logActividad.create({
    data: {
      accion,
      userId: userId ?? null,
      detalles: detalles ?? undefined,
    },
  }).catch((err) => {
    console.error('Error escribiendo log:', err)
  })
}
