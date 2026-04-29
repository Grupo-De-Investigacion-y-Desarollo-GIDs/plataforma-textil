import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { notificarTalleresCompatibles } from '@/compartido/lib/notificaciones'
import { logActividad } from '@/compartido/lib/log'
import { apiHandler, errorAuthRequired, errorNotFound, errorForbidden, errorResponse } from '@/compartido/lib/api-errors'

export const GET = apiHandler(async (_req: NextRequest, ctx) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()
  const role = (session.user as { role?: string }).role

  const { id } = await ctx.params!

  const pedido = await prisma.pedido.findUnique({
    where: { id: id as string },
    include: {
      marca: { select: { id: true, nombre: true, userId: true } },
      ordenes: {
        include: {
          taller: { select: { id: true, nombre: true, userId: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!pedido) return errorNotFound('pedido')

  if (role !== 'ADMIN') {
    const isMarcaOwner = pedido.marca.userId === session.user.id
    const isTallerAsignado = pedido.ordenes.some(o => o.taller.userId === session.user.id)
    if (!isMarcaOwner && !isTallerAsignado) return errorForbidden()
  }

  const { marca: { userId: _mu, ...marca }, ordenes, ...rest } = pedido
  const cleanOrdenes = ordenes.map(({ taller: { userId: _tu, ...taller }, ...o }) => ({ ...o, taller }))

  return NextResponse.json({ ...rest, marca, ordenes: cleanOrdenes })
})

export const PUT = apiHandler(async (req: NextRequest, ctx) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()

  const { id } = await ctx.params!
  const role = (session.user as { role?: string }).role

  const existing = await prisma.pedido.findUnique({
    where: { id: id as string },
    select: { marca: { select: { userId: true } } },
  })
  if (!existing) return errorNotFound('pedido')
  if (existing.marca.userId !== session.user.id && role !== 'ADMIN') return errorForbidden()

  const body = await req.json()

  if (body.estado) {
    const pedidoActual = await prisma.pedido.findUnique({
      where: { id: id as string },
      select: { estado: true },
    })
    if (!pedidoActual) return errorNotFound('pedido')

    const transiciones: Record<string, string[]> = {
      BORRADOR: ['PUBLICADO', 'CANCELADO'],
      PUBLICADO: ['CANCELADO'],
      EN_EJECUCION: ['ESPERANDO_ENTREGA', 'CANCELADO'],
      ESPERANDO_ENTREGA: ['COMPLETADO', 'CANCELADO'],
      COMPLETADO: [],
      CANCELADO: [],
    }

    const permitidas = transiciones[pedidoActual.estado] ?? []
    if (!permitidas.includes(body.estado)) {
      return errorResponse({
        code: 'INVALID_INPUT',
        message: `No se puede pasar de ${pedidoActual.estado} a ${body.estado}`,
        status: 400,
      })
    }

    if (body.estado === 'CANCELADO') {
      const [pedido] = await prisma.$transaction([
        prisma.pedido.update({
          where: { id: id as string },
          data: { estado: 'CANCELADO' },
        }),
        prisma.ordenManufactura.updateMany({
          where: {
            pedidoId: id as string,
            estado: { notIn: ['COMPLETADO', 'CANCELADO'] },
          },
          data: { estado: 'CANCELADO' },
        }),
      ])
      logActividad('PEDIDO_CANCELADO', session.user.id, { pedidoId: id })
      return NextResponse.json(pedido)
    }

    const pedido = await prisma.pedido.update({
      where: { id: id as string },
      data: { estado: body.estado },
    })

    if (body.estado === 'PUBLICADO') {
      logActividad('PEDIDO_PUBLICADO', session.user.id, { pedidoId: id })
      notificarTalleresCompatibles(id as string).catch(() => {})
    }

    if (body.estado === 'COMPLETADO') {
      logActividad('PEDIDO_COMPLETADO', session.user.id, { pedidoId: id })
    }

    return NextResponse.json(pedido)
  }

  const pedido = await prisma.pedido.update({
    where: { id: id as string },
    data: {
      progresoTotal: body.progresoTotal,
      fechaObjetivo: body.fechaObjetivo ? new Date(body.fechaObjetivo) : undefined,
      montoTotal: body.montoTotal,
    },
  })

  return NextResponse.json(pedido)
})
