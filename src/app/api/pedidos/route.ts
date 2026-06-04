import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { logActividad } from '@/compartido/lib/log'
import { rateLimit } from '@/compartido/lib/ratelimit'
import { apiHandler, errorNotFound, errorResponse } from '@/compartido/lib/api-errors'

function generateOmId() {
  const year = new Date().getFullYear()
  const code = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
  return `OM-${year}-${code}`
}

export const GET = apiHandler(async (req: NextRequest) => {
  const sesion = await requiereRolApi(['ADMIN', 'MARCA'])
  if (sesion instanceof NextResponse) return sesion

  const role = sesion.role
  const { searchParams } = req.nextUrl
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const estado = searchParams.get('estado')
  const marcaId = searchParams.get('marcaId')

  const where: Record<string, unknown> = {}
  if (estado) where.estado = estado
  if (role === 'ADMIN') {
    if (marcaId) where.marcaId = marcaId
  } else {
    // role === 'MARCA' (garantizado por el gate de requiereRolApi)
    const marca = await prisma.marca.findUnique({
      where: { userId: sesion.userId },
      select: { id: true },
    })
    if (!marca) return errorNotFound('marca')
    where.marcaId = marca.id
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
  // Solo rol MARCA crea pedidos via API. La accion admin sobre pedidos se
  // canaliza por Prisma Studio, no por endpoint (ver DECISIONS.md).
  const sesion = await requiereRolApi(['MARCA'])
  if (sesion instanceof NextResponse) return sesion

  const blocked = await rateLimit(req, 'pedidos', sesion.userId)
  if (blocked) return blocked

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

  const marca = await prisma.marca.findUnique({
    where: { userId: sesion.userId },
    select: { id: true, userId: true },
  })
  if (!marca) return errorNotFound('marca')
  const resolvedMarcaId = marca.id
  const ownerUserId = marca.userId

  // U-06: clasificacion automatica del pedido (bloque multi-rol). Si el dueno del
  // pedido tambien tiene un Taller -> SUBCONTRATACION; si solo tiene Marca ->
  // COMERCIAL. Invisible al cliente y autoritativa: no se acepta `tipo` del body.
  const ownerTaller = await prisma.taller.findFirst({
    where: { userId: ownerUserId },
    select: { id: true },
  })
  const tipo = ownerTaller ? 'SUBCONTRATACION' : 'COMERCIAL'

  const pedido = await prisma.pedido.create({
    data: {
      omId: body.omId || generateOmId(),
      marcaId: resolvedMarcaId,
      tipo,
      tipoPrenda: body.tipoPrenda,
      cantidad: Math.round(cantidad),
      fechaObjetivo: body.fechaObjetivo ? new Date(body.fechaObjetivo) : undefined,
      estado: 'BORRADOR',
      montoTotal: Number.isFinite(montoTotal) && montoTotal >= 0 ? montoTotal : 0,
      descripcion: typeof body.descripcion === 'string' ? body.descripcion.trim() || null : undefined,
      imagenes: Array.isArray(body.imagenes) ? body.imagenes.filter((u: unknown) => typeof u === 'string') : undefined,
      procesosRequeridos: Array.isArray(body.procesosRequeridos) ? body.procesosRequeridos.filter((u: unknown) => typeof u === 'string') : undefined,
    },
  })

  logActividad('CRUD_PEDIDO_CREADO', sesion.userId, { pedidoId: pedido.id, omId: pedido.omId, marcaId: resolvedMarcaId })

  return NextResponse.json(pedido, { status: 201 })
})
