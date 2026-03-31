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

    const where: Record<string, unknown> = {}
    if (estado) where.estado = estado

    const [denuncias, total] = await Promise.all([
      prisma.denuncia.findMany({
        where,
        include: { taller: { select: { nombre: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.denuncia.count({ where }),
    ])

    return NextResponse.json({ denuncias, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener denuncias' }, { status: 500 })
  }
}

// POST queda publico para denuncias anonimas
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const count = await prisma.denuncia.count()
    const codigo = `DEN-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`

    const denuncia = await prisma.denuncia.create({
      data: {
        tipo: body.tipo,
        tallerId: body.tallerId || null,
        descripcion: body.descripcion,
        anonima: body.anonima ?? true,
        codigo,
        evidenciaUrl: body.evidenciaUrl,
      },
    })
    return NextResponse.json(denuncia, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear denuncia' }, { status: 500 })
  }
}
