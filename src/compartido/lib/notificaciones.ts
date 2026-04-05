import { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { getFeatureFlag } from './features'
import { sendEmail, buildCotizacionRecibidaEmail, buildCotizacionAceptadaEmail, buildCotizacionRechazadaEmail, buildPedidoDisponibleEmail } from './email'

interface NotificacionData {
  cotizacion: { id: string; precio: number; plazoDias: number; proceso: string }
  taller: { nombre: string; userId?: string }
  marca: { nombre: string; userId?: string }
  pedido: { omId: string }
}

export function notificarCotizacion(
  tipo: 'RECIBIDA' | 'ACEPTADA' | 'RECHAZADA',
  data: NotificacionData,
) {
  const titulos = {
    RECIBIDA: 'Nueva cotizacion recibida',
    ACEPTADA: 'Tu cotizacion fue aceptada',
    RECHAZADA: 'Cotizacion no seleccionada',
  }
  const mensajes = {
    RECIBIDA: `${data.taller.nombre} cotizo tu pedido ${data.pedido.omId}: $${data.cotizacion.precio} en ${data.cotizacion.plazoDias} dias.`,
    ACEPTADA: `${data.marca.nombre} acepto tu cotizacion para el pedido ${data.pedido.omId}. Precio: $${data.cotizacion.precio}.`,
    RECHAZADA: `La marca ${data.marca.nombre} selecciono otra cotizacion para el pedido ${data.pedido.omId}.`,
  }

  // Destino: RECIBIDA va a la marca, ACEPTADA/RECHAZADA va al taller
  const destinoUserId = tipo === 'RECIBIDA' ? data.marca.userId : data.taller.userId
  if (!destinoUserId) return

  // 1. Crear notificacion in-app (canal PLATAFORMA)
  prisma.notificacion.create({
    data: {
      userId: destinoUserId,
      tipo: 'COTIZACION',
      titulo: titulos[tipo],
      mensaje: mensajes[tipo],
      canal: 'PLATAFORMA',
    },
  }).catch((err) => console.error('Error creando notificacion:', err))

  // 2. Enviar email fire-and-forget
  prisma.user.findUnique({
    where: { id: destinoUserId },
    select: { email: true },
  }).then((user) => {
    if (!user?.email) return
    const builders = {
      RECIBIDA: () => buildCotizacionRecibidaEmail({
        nombreMarca: data.marca.nombre,
        nombreTaller: data.taller.nombre,
        proceso: data.cotizacion.proceso,
        precio: data.cotizacion.precio,
        plazoDias: data.cotizacion.plazoDias,
      }),
      ACEPTADA: () => buildCotizacionAceptadaEmail({
        nombreTaller: data.taller.nombre,
        nombreMarca: data.marca.nombre,
        proceso: data.cotizacion.proceso,
        precio: data.cotizacion.precio,
        plazoDias: data.cotizacion.plazoDias,
      }),
      RECHAZADA: () => buildCotizacionRechazadaEmail({
        nombreTaller: data.taller.nombre,
        nombreMarca: data.marca.nombre,
        proceso: data.cotizacion.proceso,
      }),
    }
    sendEmail({ to: user.email, ...builders[tipo]() }).catch(() => {})
  }).catch(() => {})
}

export async function notificarTalleresCompatibles(pedidoId: string): Promise<void> {
  if (!await getFeatureFlag('matching_notificaciones')) return

  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { marca: { select: { nombre: true } } },
  })
  if (!pedido) return

  const whereClause: Prisma.TallerWhereInput = {
    nivel: { in: ['PLATA', 'ORO'] },
    capacidadMensual: { gte: pedido.cantidad },
    user: { active: true },
    ...(pedido.tipoPrendaId
      ? { prendas: { some: { prendaId: pedido.tipoPrendaId } } }
      : {}),
  }

  const talleres = await prisma.taller.findMany({
    where: whereClause,
    include: { user: { select: { id: true, email: true } } },
    orderBy: { puntaje: 'desc' },
    take: 20,
  })

  if (talleres.length === 0) return

  for (const taller of talleres) {
    prisma.notificacion.create({
      data: {
        userId: taller.user.id,
        tipo: 'PEDIDO_DISPONIBLE',
        titulo: `Nuevo pedido disponible: ${pedido.tipoPrenda}`,
        mensaje: `${pedido.marca.nombre} publico un pedido de ${pedido.cantidad} unidades de ${pedido.tipoPrenda}. Podes cotizar!`,
        canal: 'PLATAFORMA',
      },
    }).catch(() => {})

    sendEmail({
      to: taller.user.email!,
      ...buildPedidoDisponibleEmail({
        nombreTaller: taller.nombre,
        nombreMarca: pedido.marca.nombre,
        tipoPrenda: pedido.tipoPrenda,
        cantidad: pedido.cantidad,
        pedidoUrl: `${process.env.NEXTAUTH_URL}/taller/pedidos/disponibles/${pedido.id}`,
      }),
    }).catch(() => {})
  }
}
