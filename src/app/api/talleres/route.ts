import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const nivel = searchParams.get('nivel')
    const proceso = searchParams.get('proceso')
    const prenda = searchParams.get('prenda')
    const zona = searchParams.get('zona')
    const q = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = {}

    if (nivel) where.nivel = nivel
    if (zona) where.zona = { contains: zona, mode: 'insensitive' }
    if (q) where.nombre = { contains: q, mode: 'insensitive' }
    if (proceso) {
      where.procesos = { some: { proceso: { nombre: { contains: proceso, mode: 'insensitive' } } } }
    }
    if (prenda) {
      where.prendas = { some: { prenda: { nombre: { contains: prenda, mode: 'insensitive' } } } }
    }

    const [talleres, total] = await Promise.all([
      prisma.taller.findMany({
        where,
        include: {
          procesos: { include: { proceso: true } },
          prendas: { include: { prenda: true } },
          user: { select: { email: true, phone: true, active: true } },
        },
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
