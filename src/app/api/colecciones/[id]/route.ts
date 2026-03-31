import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const coleccion = await prisma.coleccion.findUnique({
      where: { id },
      include: {
        videos: { orderBy: { orden: 'asc' } },
        evaluacion: true,
      },
    })

    if (!coleccion) {
      return NextResponse.json({ error: 'Coleccion no encontrada' }, { status: 404 })
    }

    return NextResponse.json(coleccion)
  } catch (error) {
    console.error('Error en GET /api/colecciones/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo ADMIN puede modificar colecciones' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const coleccion = await prisma.coleccion.update({
      where: { id },
      data: {
        titulo: body.titulo,
        descripcion: body.descripcion,
        categoria: body.categoria,
        duracion: body.duracion,
        institucion: body.institucion,
        orden: body.orden,
        activa: body.activa,
      },
    })

    return NextResponse.json(coleccion)
  } catch (error) {
    console.error('Error en PUT /api/colecciones/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo ADMIN puede eliminar colecciones' }, { status: 403 })
    }

    const { id } = await params
    await prisma.coleccion.delete({ where: { id } })
    return NextResponse.json({ message: 'Coleccion eliminada' })
  } catch (error) {
    console.error('Error en DELETE /api/colecciones/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
