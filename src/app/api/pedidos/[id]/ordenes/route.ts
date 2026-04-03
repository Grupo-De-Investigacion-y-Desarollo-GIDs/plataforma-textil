import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'

async function checkPedidoAccess(pedidoId: string, userId: string, role: string | undefined) {
  if (role === 'ADMIN') return true
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    select: { marca: { select: { userId: true } } },
  })
  return pedido?.marca.userId === userId
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role

    const { id } = await params
    if (!(await checkPedidoAccess(id, session.user.id!, role))) {
      return NextResponse.json({ error: 'Sin acceso a este pedido' }, { status: 403 })
    }

    const ordenes = await prisma.ordenManufactura.findMany({
      where: { pedidoId: id },
      include: {
        taller: { select: { id: true, nombre: true, nivel: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(ordenes)
  } catch (error) {
    console.error('Error en GET /api/pedidos/[id]/ordenes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role

    const { id } = await params
    if (!(await checkPedidoAccess(id, session.user.id!, role))) {
      return NextResponse.json({ error: 'Sin acceso a este pedido' }, { status: 403 })
    }

    const body = await req.json()
    const orden = await prisma.ordenManufactura.create({
      data: {
        moId: body.moId,
        pedidoId: id,
        tallerId: body.tallerId,
        proceso: body.proceso,
        procesoId: body.procesoId ?? null,
        estado: body.estado,
        precio: body.precio,
        plazoDias: body.plazoDias,
      },
    })

    // Auto-transicionar pedido de BORRADOR → EN_EJECUCION al asignar primer taller
    const pedido = await prisma.pedido.findUnique({ where: { id }, select: { estado: true } })
    if (pedido?.estado === 'BORRADOR') {
      await prisma.pedido.update({ where: { id }, data: { estado: 'EN_EJECUCION' } })
    }

    return NextResponse.json(orden, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/pedidos/[id]/ordenes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
