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
    const tallerId = searchParams.get('tallerId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = {}
    if (tallerId) where.tallerId = tallerId

    const [validaciones, total] = await Promise.all([
      prisma.validacion.findMany({
        where,
        include: { taller: { select: { id: true, nombre: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.validacion.count({ where }),
    ])

    return NextResponse.json({ validaciones, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener validaciones' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo ADMIN puede crear validaciones' }, { status: 403 })
    }

    const body = await req.json()
    const validacion = await prisma.validacion.create({
      data: {
        tallerId: body.tallerId,
        tipo: body.tipo,
        estado: body.estado,
        detalle: body.detalle,
        documentoUrl: body.documentoUrl,
        fechaVencimiento: body.fechaVencimiento ? new Date(body.fechaVencimiento) : undefined,
      },
    })

    return NextResponse.json(validacion, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear la validacion' }, { status: 500 })
  }
}
