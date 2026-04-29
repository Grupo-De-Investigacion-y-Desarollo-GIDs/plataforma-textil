import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { notificarCotizacion } from '@/compartido/lib/notificaciones'
import { logActividad } from '@/compartido/lib/log'
import { apiHandler, errorAuthRequired, errorNotFound, errorForbidden, errorResponse } from '@/compartido/lib/api-errors'

export const PUT = apiHandler(async (req: NextRequest, ctx) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()
  const role = (session.user as { role?: string }).role
  const userId = session.user.id!
  const { id } = await ctx.params!

  const cotizacion = await prisma.cotizacion.findUnique({
    where: { id: id as string },
    include: {
      pedido: {
        include: { marca: { select: { userId: true, nombre: true } } },
      },
      taller: { select: { id: true, userId: true, nombre: true } },
    },
  })

  if (!cotizacion) return errorNotFound('cotizacion')

  const body = await req.json()
  const accion = body.accion as string

  // --- ACEPTAR ---
  if (accion === 'ACEPTAR') {
    const isMarcaOwner = cotizacion.pedido.marca.userId === userId
    if (role !== 'ADMIN' && !isMarcaOwner) return errorForbidden()
    if (cotizacion.estado !== 'ENVIADA') {
      return errorResponse({ code: 'INVALID_INPUT', message: 'Solo se puede aceptar una cotizacion en estado ENVIADA', status: 400 })
    }
    if (cotizacion.venceEn < new Date()) {
      return errorResponse({ code: 'INVALID_INPUT', message: 'La cotizacion vencio', status: 400 })
    }

    const moId = `MO-${new Date().getFullYear()}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`

    const ordenCreada = await prisma.$transaction(async (tx) => {
      await tx.cotizacion.update({ where: { id: id as string }, data: { estado: 'ACEPTADA' } })
      await tx.cotizacion.updateMany({
        where: { pedidoId: cotizacion.pedidoId, id: { not: id as string }, estado: 'ENVIADA' },
        data: { estado: 'RECHAZADA' },
      })
      const orden = await tx.ordenManufactura.create({
        data: {
          moId,
          pedidoId: cotizacion.pedidoId,
          tallerId: cotizacion.tallerId,
          proceso: cotizacion.proceso,
          precio: cotizacion.precio,
          plazoDias: cotizacion.plazoDias,
          cotizacionId: cotizacion.id,
        },
      })
      await tx.pedido.update({
        where: { id: cotizacion.pedidoId },
        data: { estado: 'EN_EJECUCION', montoTotal: { increment: cotizacion.precio } },
      })
      return orden
    })

    logActividad('COTIZACION_ACEPTADA', userId, { pedidoId: cotizacion.pedidoId, cotizacionId: id, tallerNombre: cotizacion.taller.nombre })
    logActividad('ORDEN_CREADA', userId, { pedidoId: cotizacion.pedidoId, ordenId: ordenCreada.id, tallerId: cotizacion.tallerId, tallerNombre: cotizacion.taller.nombre })

    notificarCotizacion('ACEPTADA', {
      cotizacion,
      taller: { nombre: cotizacion.taller.nombre, userId: cotizacion.taller.userId },
      marca: { nombre: cotizacion.pedido.marca.nombre },
      pedido: { omId: cotizacion.pedido.omId, id: cotizacion.pedidoId },
    })

    const rechazadas = await prisma.cotizacion.findMany({
      where: { pedidoId: cotizacion.pedidoId, id: { not: id as string }, estado: 'RECHAZADA' },
      include: { taller: { select: { nombre: true, userId: true, user: { select: { email: true } } } } },
    })
    for (const cot of rechazadas) {
      notificarCotizacion('RECHAZADA', {
        cotizacion: cot,
        taller: { nombre: cot.taller.nombre, userId: cot.taller.userId },
        marca: { nombre: cotizacion.pedido.marca.nombre },
        pedido: { omId: cotizacion.pedido.omId, id: cotizacion.pedidoId },
      })
    }

    return NextResponse.json({ ok: true, moId })
  }

  // --- RECHAZAR ---
  if (accion === 'RECHAZAR') {
    const isMarcaOwner = cotizacion.pedido.marca.userId === userId
    if (role !== 'ADMIN' && !isMarcaOwner) return errorForbidden()
    if (cotizacion.estado !== 'ENVIADA') {
      return errorResponse({ code: 'INVALID_INPUT', message: 'Solo se puede rechazar una cotizacion en estado ENVIADA', status: 400 })
    }

    await prisma.cotizacion.update({ where: { id: id as string }, data: { estado: 'RECHAZADA' } })

    logActividad('COTIZACION_RECHAZADA', userId, { pedidoId: cotizacion.pedidoId, cotizacionId: id, tallerNombre: cotizacion.taller.nombre })

    notificarCotizacion('RECHAZADA', {
      cotizacion,
      taller: { nombre: cotizacion.taller.nombre, userId: cotizacion.taller.userId },
      marca: { nombre: cotizacion.pedido.marca.nombre },
      pedido: { omId: cotizacion.pedido.omId, id: cotizacion.pedidoId },
    })

    return NextResponse.json({ ok: true })
  }

  // --- RETIRAR ---
  if (accion === 'RETIRAR') {
    const isTallerOwner = cotizacion.taller.userId === userId
    if (role !== 'ADMIN' && !isTallerOwner) return errorForbidden()
    if (cotizacion.estado !== 'ENVIADA') {
      return errorResponse({ code: 'INVALID_INPUT', message: 'Solo se puede retirar una cotizacion en estado ENVIADA', status: 400 })
    }

    await prisma.cotizacion.update({ where: { id: id as string }, data: { estado: 'RECHAZADA' } })

    return NextResponse.json({ ok: true })
  }

  return errorResponse({ code: 'INVALID_INPUT', message: 'Accion invalida. Usar ACEPTAR, RECHAZAR o RETIRAR', status: 400 })
})
