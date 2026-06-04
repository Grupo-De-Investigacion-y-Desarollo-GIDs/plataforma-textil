import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'

export async function GET(req: NextRequest) {
  try {
    const sesion = await requiereRolApi(['ADMIN'])
    if (sesion instanceof NextResponse) return sesion

    const { searchParams } = req.nextUrl
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 100)

    const [marcas, total] = await Promise.all([
      prisma.marca.findMany({
        include: { user: { select: { email: true, name: true, phone: true, active: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { rating: 'desc' },
      }),
      prisma.marca.count(),
    ])

    return NextResponse.json({ marcas, total, page, totalPages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ error: 'Error al obtener marcas' }, { status: 500 })
  }
}