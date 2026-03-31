import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const marca = await prisma.marca.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true, phone: true, avatar: true } },
        pedidos: { select: { id: true, omId: true, estado: true, tipoPrenda: true, cantidad: true, fechaCreacion: true } },
      },
    })

    if (!marca) {
      return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 })
    }

    return NextResponse.json(marca)
  } catch (error) {
    console.error('Error en GET /api/marcas/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const role = (session.user as { role?: string }).role

    // Ownership check: solo el dueño o ADMIN
    const existing = await prisma.marca.findUnique({ where: { id }, select: { userId: true } })
    if (!existing) return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 })
    if (existing.userId !== session.user.id && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin acceso a esta marca' }, { status: 403 })
    }

    const body = await req.json()

    const marca = await prisma.marca.update({
      where: { id },
      data: {
        nombre: body.nombre,
        ubicacion: body.ubicacion,
        tipo: body.tipo,
        website: body.website,
        volumenMensual: body.volumenMensual,
        frecuenciaCompra: body.frecuenciaCompra,
      },
    })

    return NextResponse.json(marca)
  } catch (error) {
    console.error('Error en PUT /api/marcas/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
