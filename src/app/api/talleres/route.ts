import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'

// Campos que MARCA puede ver (contacto comercial, sin nivel ni PII de user)
const selectMarca = {
  id: true,
  nombre: true,
  cuit: true,
  ubicacion: true,
  provincia: true,
  partido: true,
  descripcion: true,
  capacidadMensual: true,
  trabajadoresRegistrados: true,
  fundado: true,
  verificadoAfip: true,
  verificadoAfipAt: true,
  rating: true,
  pedidosCompletados: true,
  ontimeRate: true,
  portfolioFotos: true,
  prendaPrincipal: true,
  procesos: { include: { proceso: true } },
  prendas: { include: { prenda: true } },
} as const

// Campos completos para ADMIN/ESTADO (incluye nivel, PII, metricas internas)
const selectAdmin = {
  ...selectMarca,
  nivel: true,
  puntaje: true,
  tipoInscripcionAfip: true,
  categoriaMonotributo: true,
  estadoCuitAfip: true,
  actividadesAfip: true,
  domicilioFiscalAfip: true,
  empleadosRegistradosSipa: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { email: true, phone: true, active: true } },
} as const

export async function GET(req: NextRequest) {
  const sesion = await requiereRolApi(['ADMIN', 'ESTADO', 'MARCA'])
  if (sesion instanceof NextResponse) return sesion

  const esAdmin = sesion.role === 'ADMIN' || sesion.role === 'ESTADO'

  try {
    const { searchParams } = req.nextUrl
    const proceso = searchParams.get('proceso')
    const prenda = searchParams.get('prenda')
    const provincia = searchParams.get('provincia')
    const q = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = { verificadoAfip: true }

    // Filtro por nivel solo para ADMIN/ESTADO
    if (esAdmin) {
      const nivel = searchParams.get('nivel')
      if (nivel) where.nivel = nivel
    }

    if (provincia) where.provincia = { contains: provincia, mode: 'insensitive' }
    if (q) where.nombre = { contains: q, mode: 'insensitive' }
    if (proceso) {
      where.procesos = { some: { proceso: { nombre: { contains: proceso, mode: 'insensitive' } } } }
    }
    if (prenda) {
      where.prendas = { some: { prenda: { nombre: { contains: prenda, mode: 'insensitive' } } } }
    }

    const include = esAdmin ? selectAdmin : selectMarca

    const [talleres, total] = await Promise.all([
      prisma.taller.findMany({
        where,
        include,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { puntaje: 'desc' },
      }),
      prisma.taller.count({ where }),
    ])

    return NextResponse.json({ talleres, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Error en GET /api/talleres:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
