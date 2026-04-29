import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { logActividad } from '@/compartido/lib/log'
import { rateLimit } from '@/compartido/lib/ratelimit'
import { apiHandler, errorAuthRequired, errorForbidden, errorNotFound, errorResponse } from '@/compartido/lib/api-errors'

function generateOmId() {
  const year = new Date().getFullYear()
  const code = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
  return `OM-${year}-${code}`
}

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()

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
    if (!marca) return errorNotFound('marca')
    where.marcaId = marca.id
  } else {
    return errorForbidden()
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
})

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()
  const role = (session.user as { role?: string }).role

  if (role !== 'ADMIN' && role !== 'ESTADO') {
    const blocked = await rateLimit(req, 'pedidos', session.user.id!)
    if (blocked) return blocked
  }

  const body = await req.json()
  const cantidad = Number(body.cantidad)
  const montoTotal = Number(body.montoTotal || 0)
  if (!body.tipoPrenda || !Number.isFinite(cantidad) || cantidad <= 0) {
    return errorResponse({ code: 'INVALID_INPUT', message: 'Tipo de prenda y cantidad son requeridos', status: 400 })
  }

  if (body.fechaObjetivo) {
    const fecha = new Date(body.fechaObjetivo)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    if (fecha < hoy) {
      return errorResponse({ code: 'INVALID_INPUT', message: 'La fecha objetivo no puede ser anterior a hoy', status: 400 })
    }
  }

  let resolvedMarcaId = ''
  if (role === 'MARCA') {
    const marca = await prisma.marca.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!marca) return errorNotFound('marca')
    resolvedMarcaId = marca.id
  } else if (role === 'ADMIN') {
    if (!body.marcaId) {
      return errorResponse({ code: 'INVALID_INPUT', message: 'marcaId requerido', status: 400 })
    }
    resolvedMarcaId = body.marcaId
  } else {
    return errorForbidden()
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
      descripcion: typeof body.descripcion === 'string' ? body.descripcion.trim() || null : undefined,
      imagenes: Array.isArray(body.imagenes) ? body.imagenes.filter((u: unknown) => typeof u === 'string') : undefined,
      procesosRequeridos: Array.isArray(body.procesosRequeridos) ? body.procesosRequeridos.filter((u: unknown) => typeof u === 'string') : undefined,
    },
  })

  logActividad('CRUD_PEDIDO_CREADO', session.user.id, { pedidoId: pedido.id, omId: pedido.omId, marcaId: resolvedMarcaId })

  return NextResponse.json(pedido, { status: 201 })
})
