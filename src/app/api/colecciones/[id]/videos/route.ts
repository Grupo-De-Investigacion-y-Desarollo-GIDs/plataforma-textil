import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// POST /api/colecciones/[id]/videos — agregar video a colección
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Solo ADMIN puede agregar videos' }, { status: 403 })

    const { id: coleccionId } = await params
    const body = await req.json()

    if (!body.titulo?.trim()) return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
    if (!body.youtubeUrl?.trim()) return NextResponse.json({ error: 'La URL de YouTube es obligatoria' }, { status: 400 })

    // Calcular el próximo orden
    const maxOrden = await prisma.video.aggregate({
      where: { coleccionId },
      _max: { orden: true },
    })
    const orden = (maxOrden._max.orden ?? 0) + 1

    const video = await prisma.video.create({
      data: {
        coleccionId,
        titulo: body.titulo.trim(),
        youtubeUrl: body.youtubeUrl.trim(),
        duracion: body.duracion?.trim() || null,
        orden: body.orden ?? orden,
      },
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/colecciones/[id]/videos:', error)
    return NextResponse.json({ error: 'Error al agregar video' }, { status: 500 })
  }
}

// DELETE /api/colecciones/[id]/videos?videoId=xxx
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Solo ADMIN puede eliminar videos' }, { status: 403 })

    const { id: coleccionId } = await params
    const videoId = req.nextUrl.searchParams.get('videoId')
    if (!videoId) return NextResponse.json({ error: 'videoId requerido' }, { status: 400 })

    await prisma.video.delete({ where: { id: videoId, coleccionId } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error en DELETE /api/colecciones/[id]/videos:', error)
    return NextResponse.json({ error: 'Error al eliminar video' }, { status: 500 })
  }
}
