import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { EstadoPedido } from '@prisma/client'

const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  PENDIENTE: ['EN_EJECUCION', 'CANCELADO'],
  EN_EJECUCION: ['COMPLETADO', 'CANCELADO'],
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const role = (session.user as { role?: string }).role
    const { id } = await params

    const orden = await prisma.ordenManufactura.findUnique({
      where: { id },
      include: { taller: { select: { userId: true } } },
    })

    if (!orden) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

    // Solo el taller asignado o ADMIN puede modificar
    if (role !== 'ADMIN' && orden.taller.userId !== session.user.id) {
      return NextResponse.json({ error: 'Sin acceso a esta orden' }, { status: 403 })
    }

    const body = await req.json()
    const { estado, progreso } = body

    // Validar transición de estado
    if (estado && estado !== orden.estado) {
      const permitidos = TRANSICIONES_VALIDAS[orden.estado] ?? []
      if (!permitidos.includes(estado)) {
        return NextResponse.json(
          { error: `No se puede pasar de ${orden.estado} a ${estado}` },
          { status: 400 }
        )
      }
    }

    // Actualizar la orden
    const data: Record<string, unknown> = {}
    if (estado) data.estado = estado
    if (progreso !== undefined) {
      data.progreso = Math.min(100, Math.max(0, Number(progreso)))
      // Si progreso llega a 100, marcar como COMPLETADO automáticamente
      if (data.progreso === 100 && orden.estado === 'EN_EJECUCION') {
        data.estado = 'COMPLETADO'
      }
    }

    const ordenActualizada = await prisma.ordenManufactura.update({
      where: { id },
      data,
    })

    // Recalcular estado del pedido padre
    const todasLasOrdenes = await prisma.ordenManufactura.findMany({
      where: { pedidoId: orden.pedidoId },
      select: { estado: true, progreso: true },
    })

    const activas = todasLasOrdenes.filter((o) => o.estado !== 'CANCELADO')
    const todasCompletadas = activas.length > 0 && activas.every((o) => o.estado === 'COMPLETADO')
    const hayEjecucion = activas.some((o) => o.estado === 'EN_EJECUCION')
    const progresoTotal =
      activas.length > 0
        ? Math.round(activas.reduce((sum, o) => sum + o.progreso, 0) / activas.length)
        : 0

    let estadoPedido: EstadoPedido | undefined
    if (todasCompletadas) estadoPedido = EstadoPedido.COMPLETADO
    else if (hayEjecucion) estadoPedido = EstadoPedido.EN_EJECUCION

    await prisma.pedido.update({
      where: { id: orden.pedidoId },
      data: {
        progresoTotal,
        ...(estadoPedido ? { estado: estadoPedido } : {}),
      },
    })

    return NextResponse.json(ordenActualizada)
  } catch (error) {
    console.error('Error en PUT /api/ordenes/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
