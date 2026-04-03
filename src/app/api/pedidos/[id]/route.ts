import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        marca: { select: { id: true, nombre: true } },
        ordenes: {
          include: {
            taller: { select: { id: true, nombre: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Error en GET /api/pedidos/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const role = (session.user as { role?: string }).role

    // Ownership check: solo la marca dueña o ADMIN
    const existing = await prisma.pedido.findUnique({
      where: { id },
      select: { marca: { select: { userId: true } } },
    })
    if (!existing) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    if (existing.marca.userId !== session.user.id && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin acceso a este pedido' }, { status: 403 })
    }

    const body = await req.json()

    // Si se intenta cambiar el estado, solo se permite → CANCELADO
    if (body.estado) {
      const pedidoActual = await prisma.pedido.findUnique({
        where: { id },
        select: { estado: true },
      })

      if (body.estado !== 'CANCELADO') {
        return NextResponse.json(
          { error: 'Solo se permite cancelar manualmente. El resto de estados se calcula automáticamente.' },
          { status: 400 }
        )
      }

      if (pedidoActual?.estado === 'COMPLETADO' || pedidoActual?.estado === 'CANCELADO') {
        return NextResponse.json(
          { error: `No se puede cancelar un pedido en estado ${pedidoActual.estado}` },
          { status: 400 }
        )
      }

      // Cancelar pedido + cascadear a ordenes no completadas
      const [pedido] = await prisma.$transaction([
        prisma.pedido.update({
          where: { id },
          data: { estado: 'CANCELADO' },
        }),
        prisma.ordenManufactura.updateMany({
          where: {
            pedidoId: id,
            estado: { notIn: ['COMPLETADO', 'CANCELADO'] },
          },
          data: { estado: 'CANCELADO' },
        }),
      ])

      return NextResponse.json(pedido)
    }

    const pedido = await prisma.pedido.update({
      where: { id },
      data: {
        progresoTotal: body.progresoTotal,
        fechaObjetivo: body.fechaObjetivo ? new Date(body.fechaObjetivo) : undefined,
        montoTotal: body.montoTotal,
      },
    })

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Error en PUT /api/pedidos/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
