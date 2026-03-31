import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const categoria = searchParams.get('categoria')

    const where: Record<string, unknown> = {}
    if (categoria) where.categoria = categoria

    const [colecciones, total] = await Promise.all([
      prisma.coleccion.findMany({
        where,
        include: {
          _count: { select: { videos: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { orden: 'asc' },
      }),
      prisma.coleccion.count({ where }),
    ])

    return NextResponse.json({ colecciones, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener colecciones' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Solo ADMIN puede crear colecciones' }, { status: 403 })

    const body = await req.json()
    if (!body.titulo?.trim()) return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })

    const coleccion = await prisma.coleccion.create({
      data: {
        titulo: body.titulo.trim(),
        descripcion: body.descripcion?.trim() || null,
        categoria: body.categoria?.trim() || null,
        institucion: body.institucion?.trim() || null,
        duracion: body.duracion?.trim() || null,
        activa: body.activa ?? false,
      },
    })

    return NextResponse.json(coleccion, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/colecciones:', error)
    return NextResponse.json({ error: 'Error al crear colección' }, { status: 500 })
  }
}
