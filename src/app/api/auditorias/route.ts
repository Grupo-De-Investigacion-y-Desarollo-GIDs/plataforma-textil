import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN' && role !== 'ESTADO') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const estado = searchParams.get('estado')
    const tallerId = searchParams.get('tallerId')

    const where: Record<string, unknown> = {}
    if (estado) where.estado = estado
    if (tallerId) where.tallerId = tallerId

    const [auditorias, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,
        include: { taller: { select: { nombre: true, nivel: true } }, acciones: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditoria.count({ where }),
    ])

    return NextResponse.json({ auditorias, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener auditorias' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN' && role !== 'ESTADO') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await req.json()
    const auditoria = await prisma.auditoria.create({
      data: {
        tallerId: body.tallerId,
        inspectorId: body.inspectorId,
        fecha: body.fecha ? new Date(body.fecha) : null,
        tipo: body.tipo || 'PRIMERA_VISITA',
        prioridad: body.prioridad,
      },
    })
    return NextResponse.json(auditoria, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear auditoria' }, { status: 500 })
  }
}
