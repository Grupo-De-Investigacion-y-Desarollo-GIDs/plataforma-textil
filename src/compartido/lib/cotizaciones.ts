import { prisma } from './prisma'

// Fuente única de verdad para "¿este taller puede cotizar este pedido?".
// La usan POST /api/cotizaciones (crear cotización) y POST /api/upload/imagenes
// contexto `cotizacion` (donde entityId = pedidoId y la cotización aún no
// existe — por eso el gate es ELEGIBILIDAD para cotizar el pedido, no ownership
// de una cotización). Criterio extraído sin cambios de cotizaciones/route.ts.

export type MotivoNoCotizable =
  | 'PEDIDO_NO_ENCONTRADO'
  | 'AUTO_COTIZACION'
  | 'PEDIDO_NO_DISPONIBLE'
  | 'NO_INVITADO'

export interface PedidoCotizable {
  id: string
  estado: string
  visibilidad: string
  marca: { userId: string; nombre: string }
  omId: string
  tipoPrenda: string
  cantidad: number
  marcaId: string
}

export type ResultadoElegibilidad =
  | { ok: true; pedido: PedidoCotizable }
  | { ok: false; motivo: MotivoNoCotizable }

/**
 * Elegibilidad de un taller para cotizar un pedido:
 *  - el pedido existe
 *  - no es del propio caller (no auto-cotización)
 *  - está PUBLICADO
 *  - si la visibilidad es INVITACION, el taller debe estar invitado
 *
 * Devuelve el pedido (con los campos que el caller necesita downstream) cuando
 * es elegible, o el motivo de rechazo para que cada caller lo mapee a su
 * respuesta (POST /api/cotizaciones preserva sus códigos; el upload usa 403).
 */
export async function elegibilidadCotizar(
  callerUserId: string,
  tallerId: string,
  pedidoId: string,
): Promise<ResultadoElegibilidad> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    select: {
      id: true,
      estado: true,
      visibilidad: true,
      marca: { select: { userId: true, nombre: true } },
      omId: true,
      tipoPrenda: true,
      cantidad: true,
      marcaId: true,
    },
  })
  if (!pedido) return { ok: false, motivo: 'PEDIDO_NO_ENCONTRADO' }
  if (pedido.marca.userId === callerUserId) return { ok: false, motivo: 'AUTO_COTIZACION' }
  if (pedido.estado !== 'PUBLICADO') return { ok: false, motivo: 'PEDIDO_NO_DISPONIBLE' }
  if (pedido.visibilidad === 'INVITACION') {
    const invitacion = await prisma.pedidoInvitacion.findUnique({
      where: { pedidoId_tallerId: { pedidoId, tallerId } },
    })
    if (!invitacion) return { ok: false, motivo: 'NO_INVITADO' }
  }
  return { ok: true, pedido: pedido as PedidoCotizable }
}
