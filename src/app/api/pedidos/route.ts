import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { logActividad } from '@/lib/log'

function generateOmId() {
  const year = new Date().getFullYear()
  const code = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
  return `OM-${year}-${code}`
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const role = (session.user as { role?: string }).role
    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const estado = searchParams.get('estado')
    const marcaId = searchParams.get('marcaId')

    const where: Record<string, unknown> = {}
    if (estado) where.estado = estado
    if (role === 'ADMIN') {
      if (marcaId) where.marcaId = marcaId
    } else if (role === 'MARCA') {
      const marca = await prisma.marca.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
      if (!marca) {
        return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 })
      }
      where.marcaId = marca.id
    } else {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        include: {
          marca: { select: { id: true, nombre: true } },
          _count: { select: { ordenes: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pedido.count({ where }),
    ])

    return NextResponse.json({ pedidos, total, page, totalPages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const role = (session.user as { role?: string }).role

    const body = await req.json()
    const cantidad = Number(body.cantidad)
    const montoTotal = Number(body.montoTotal || 0)
    if (!body.tipoPrenda || !Number.isFinite(cantidad) || cantidad <= 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    let resolvedMarcaId = ''
    if (role === 'MARCA') {
      const marca = await prisma.marca.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
      if (!marca) {
        return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 })
      }
      resolvedMarcaId = marca.id
    } else if (role === 'ADMIN') {
      if (!body.marcaId) {
        return NextResponse.json({ error: 'marcaId requerido' }, { status: 400 })
      }
      resolvedMarcaId = body.marcaId
    } else {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const pedido = await prisma.pedido.create({
      data: {
        omId: body.omId || generateOmId(),
        marcaId: resolvedMarcaId,
        tipoPrenda: body.tipoPrenda,
        cantidad: Math.round(cantidad),
        fechaObjetivo: body.fechaObjetivo ? new Date(body.fechaObjetivo) : undefined,
        estado: role === 'ADMIN' ? body.estado : 'BORRADOR',
        montoTotal: Number.isFinite(montoTotal) && montoTotal >= 0 ? montoTotal : 0,
      },
    })

    logActividad('CRUD_PEDIDO_CREADO', session.user.id, { pedidoId: pedido.id, omId: pedido.omId, marcaId: resolvedMarcaId })

    return NextResponse.json(pedido, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 })
  }
}
