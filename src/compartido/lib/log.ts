import { prisma } from '@/compartido/lib/prisma'
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

// --- Wrapper tipado para acciones sensibles del admin ---

type EntidadAfectada = 'taller' | 'marca' | 'usuario' | 'pedido' | 'cotizacion'
  | 'validacion' | 'certificado' | 'coleccion' | 'configuracion' | 'exportacion'
  | 'nota' | 'rag' | 'denuncia'

interface LogAdminDetails {
  entidad: EntidadAfectada
  entidadId: string
  motivo?: string
  cambios?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

/**
 * Wrapper tipado para acciones sensibles del admin.
 * Fuerza entidad y entidadId como campos requeridos.
 * Internamente usa logActividad (fire-and-forget).
 */
export function logAccionAdmin(
  accion: string,
  userId: string,
  detalles: LogAdminDetails
) {
  logActividad(accion, userId, detalles as unknown as Prisma.InputJsonValue)
}
