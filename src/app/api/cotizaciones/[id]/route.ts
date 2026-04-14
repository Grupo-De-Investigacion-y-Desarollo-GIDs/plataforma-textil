import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { notificarCotizacion } from '@/compartido/lib/notificaciones'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    const userId = session.user.id!
    const { id } = await params

    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id },
      include: {
        pedido: {
          include: { marca: { select: { userId: true, nombre: true } } },
        },
        taller: { select: { id: true, userId: true, nombre: true } },
      },
    })

    if (!cotizacion) return NextResponse.json({ error: 'Cotizacion no encontrada' }, { status: 404 })

    const body = await req.json()
    const accion = body.accion as string

    // --- ACEPTAR (solo MARCA duena del pedido o ADMIN) ---
    if (accion === 'ACEPTAR') {
      const isMarcaOwner = cotizacion.pedido.marca.userId === userId
      if (role !== 'ADMIN' && !isMarcaOwner) {
        return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
      }
      if (cotizacion.estado !== 'ENVIADA') {
        return NextResponse.json({ error: 'Solo se puede aceptar una cotizacion en estado ENVIADA' }, { status: 400 })
      }
      if (cotizacion.venceEn < new Date()) {
        return NextResponse.json({ error: 'La cotizacion vencio' }, { status: 400 })
      }

      // Generar moId con formato existente
      const moId = `MO-${new Date().getFullYear()}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`

      // Transaccion atomica: 4 operaciones
      await prisma.$transaction([
        prisma.cotizacion.update({
          where: { id },
          data: { estado: 'ACEPTADA' },
        }),
        prisma.cotizacion.updateMany({
          where: {
            pedidoId: cotizacion.pedidoId,
            id: { not: id },
            estado: 'ENVIADA',
          },
          data: { estado: 'RECHAZADA' },
        }),
        prisma.ordenManufactura.create({
          data: {
            moId,
            pedidoId: cotizacion.pedidoId,
            tallerId: cotizacion.tallerId,
            proceso: cotizacion.proceso,
            precio: cotizacion.precio,
            plazoDias: cotizacion.plazoDias,
            cotizacionId: cotizacion.id,
          },
        }),
        prisma.pedido.update({
          where: { id: cotizacion.pedidoId },
          data: { estado: 'EN_EJECUCION' },
        }),
      ])

      // Despues del commit: notificaciones fire-and-forget
      notificarCotizacion('ACEPTADA', {
        cotizacion,
        taller: { nombre: cotizacion.taller.nombre, userId: cotizacion.taller.userId },
        marca: { nombre: cotizacion.pedido.marca.nombre },
        pedido: { omId: cotizacion.pedido.omId },
      })

      // Notificar a talleres rechazados
      const rechazadas = await prisma.cotizacion.findMany({
        where: {
          pedidoId: cotizacion.pedidoId,
          id: { not: id },
          estado: 'RECHAZADA',
        },
        include: {
          taller: { select: { nombre: true, userId: true, user: { select: { email: true } } } },
        },
      })
      for (const cot of rechazadas) {
        notificarCotizacion('RECHAZADA', {
          cotizacion: cot,
          taller: { nombre: cot.taller.nombre, userId: cot.taller.userId },
          marca: { nombre: cotizacion.pedido.marca.nombre },
          pedido: { omId: cotizacion.pedido.omId },
        })
      }

      return NextResponse.json({ ok: true, moId })
    }

    // --- RECHAZAR (solo MARCA duena o ADMIN) ---
    if (accion === 'RECHAZAR') {
      const isMarcaOwner = cotizacion.pedido.marca.userId === userId
      if (role !== 'ADMIN' && !isMarcaOwner) {
        return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
      }
      if (cotizacion.estado !== 'ENVIADA') {
        return NextResponse.json({ error: 'Solo se puede rechazar una cotizacion en estado ENVIADA' }, { status: 400 })
      }

      await prisma.cotizacion.update({ where: { id }, data: { estado: 'RECHAZADA' } })

      notificarCotizacion('RECHAZADA', {
        cotizacion,
        taller: { nombre: cotizacion.taller.nombre, userId: cotizacion.taller.userId },
        marca: { nombre: cotizacion.pedido.marca.nombre },
        pedido: { omId: cotizacion.pedido.omId },
      })

      return NextResponse.json({ ok: true })
    }

    // --- RETIRAR (solo TALLER dueno de la cotizacion) ---
    if (accion === 'RETIRAR') {
      const isTallerOwner = cotizacion.taller.userId === userId
      if (role !== 'ADMIN' && !isTallerOwner) {
        return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
      }
      if (cotizacion.estado !== 'ENVIADA') {
        return NextResponse.json({ error: 'Solo se puede retirar una cotizacion en estado ENVIADA' }, { status: 400 })
      }

      await prisma.cotizacion.update({ where: { id }, data: { estado: 'RECHAZADA' } })

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Accion invalida. Usar ACEPTAR, RECHAZAR o RETIRAR' }, { status: 400 })
  } catch (error) {
    console.error('Error en PUT /api/cotizaciones/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
