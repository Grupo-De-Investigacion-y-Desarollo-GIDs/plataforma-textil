import { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { getFeatureFlag } from './features'
import { sendEmail, buildCotizacionRecibidaEmail, buildCotizacionAceptadaEmail, buildCotizacionRechazadaEmail, buildPedidoDisponibleEmail } from './email'
import { registrarMotivoNoMatch } from './demanda-insatisfecha'
import { generarMensajeWhatsapp } from './whatsapp'

interface NotificacionData {
  cotizacion: { id: string; precio: number; plazoDias: number; proceso: string }
  taller: { nombre: string; userId?: string }
  marca: { nombre: string; userId?: string }
  pedido: { omId: string; id: string }
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
      link: tipo === 'RECIBIDA'
        ? `/marca/pedidos/${data.pedido.id}`
        : tipo === 'ACEPTADA'
          ? `/taller/pedidos`
          : tipo === 'RECHAZADA'
            ? `/taller/pedidos`
            : null,
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

  // 3. WhatsApp solo para ACEPTADA (F-02)
  if (tipo === 'ACEPTADA' && data.taller.userId) {
    generarMensajeWhatsapp({
      userId: data.taller.userId,
      template: 'cotizacion_aceptada',
      datos: { marca: data.marca.nombre, pedido: data.pedido.omId },
      destino: '/taller/pedidos',
    }).catch(err => console.error('[F-02] Error WhatsApp cotizacion_aceptada:', err))
  }
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

  // Incluir procesos para filtrar por procesosRequeridos
  const talleresQuery = await prisma.taller.findMany({
    where: whereClause,
    include: {
      user: { select: { id: true, email: true } },
      procesos: { select: { proceso: { select: { nombre: true } } } },
    },
    orderBy: { puntaje: 'desc' },
    take: 50, // traer mas para filtrar por proceso luego
  })

  // Filtrar por procesosRequeridos (si el pedido los tiene)
  const talleres = pedido.procesosRequeridos.length > 0
    ? talleresQuery.filter(t => {
        const procesosDelTaller = t.procesos.map(p => p.proceso.nombre.toUpperCase())
        return pedido.procesosRequeridos.every(pr =>
          procesosDelTaller.some(pt => pt.includes(pr.toUpperCase()))
        )
      }).slice(0, 20)
    : talleresQuery.slice(0, 20)

  if (talleres.length === 0) {
    // F-05: registrar motivo de no-match (fire-and-forget)
    registrarMotivoNoMatch(pedido).catch(err =>
      console.error('[F-05] Error registrando motivo no-match:', err)
    )
    return
  }

  for (const taller of talleres) {
    prisma.notificacion.create({
      data: {
        userId: taller.user.id,
        tipo: 'PEDIDO_DISPONIBLE',
        titulo: `Nuevo pedido disponible: ${pedido.tipoPrenda}`,
        mensaje: `${pedido.marca.nombre} publico un pedido de ${pedido.cantidad} unidades de ${pedido.tipoPrenda}. Podes cotizar!`,
        canal: 'PLATAFORMA',
        link: `/taller/pedidos/disponibles/${pedidoId}`,
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

    // F-02: WhatsApp
    generarMensajeWhatsapp({
      userId: taller.user.id,
      template: 'pedido_nuevo',
      datos: { marca: pedido.marca.nombre, resumen: `${pedido.cantidad} ${pedido.tipoPrenda}` },
      destino: `/taller/pedidos/disponibles/${pedidoId}`,
    }).catch(err => console.error('[F-02] Error WhatsApp pedido_nuevo:', err))
  }
}
