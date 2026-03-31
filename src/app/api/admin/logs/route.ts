import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    const accion = searchParams.get('accion')

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (accion) where.accion = { contains: accion, mode: 'insensitive' }

    const [logs, total] = await Promise.all([
      prisma.logActividad.findMany({
        where,
        include: { user: { select: { email: true, name: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.logActividad.count({ where }),
    ])

    return NextResponse.json({ logs, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener logs' }, { status: 500 })
  }
}
