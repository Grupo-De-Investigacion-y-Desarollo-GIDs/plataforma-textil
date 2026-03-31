import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// POST /api/colecciones/[id]/progreso
// Body: { videosVistos: number, totalVideos: number }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const taller = await prisma.taller.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!taller) return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })

    const { id: coleccionId } = await params
    const body = await req.json()
    const { videosVistos, totalVideos } = body

    const porcentajeCompletado =
      totalVideos > 0 ? Math.round((videosVistos / totalVideos) * 100) : 0

    const progreso = await prisma.progresoCapacitacion.upsert({
      where: { tallerId_coleccionId: { tallerId: taller.id, coleccionId } },
      create: { tallerId: taller.id, coleccionId, videosVistos, porcentajeCompletado },
      update: { videosVistos, porcentajeCompletado },
    })

    return NextResponse.json(progreso)
  } catch (error) {
    console.error('Error en POST /api/colecciones/[id]/progreso:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
