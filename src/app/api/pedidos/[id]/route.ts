import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { notificarTalleresCompatibles } from '@/compartido/lib/notificaciones'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role

    const { id } = await params

    const pedido = await prisma.pedido.findUnique({
      where: { id },
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

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // Ownership: marca dueña, taller asignado, o ADMIN
    if (role !== 'ADMIN') {
      const isMarcaOwner = pedido.marca.userId === session.user.id
      const isTallerAsignado = pedido.ordenes.some(o => o.taller.userId === session.user.id)
      if (!isMarcaOwner && !isTallerAsignado) {
        return NextResponse.json({ error: 'Sin acceso a este pedido' }, { status: 403 })
      }
    }

    // Strip internal userId fields from response
    const { marca: { userId: _mu, ...marca }, ordenes, ...rest } = pedido
    const cleanOrdenes = ordenes.map(({ taller: { userId: _tu, ...taller }, ...o }) => ({ ...o, taller }))

    return NextResponse.json({ ...rest, marca, ordenes: cleanOrdenes })
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

    // Transiciones de estado
    if (body.estado) {
      const pedidoActual = await prisma.pedido.findUnique({
        where: { id },
        select: { estado: true },
      })
      if (!pedidoActual) {
        return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
      }

      // Transiciones validas
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
        return NextResponse.json(
          { error: `No se puede pasar de ${pedidoActual.estado} a ${body.estado}` },
          { status: 400 }
        )
      }

      // Si se cancela, cascadear a ordenes no completadas
      if (body.estado === 'CANCELADO') {
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
        data: { estado: body.estado },
      })

      // Notificar talleres compatibles cuando se publica
      if (body.estado === 'PUBLICADO') {
        notificarTalleresCompatibles(id).catch(() => {})
      }

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
