import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'

// POST /api/colecciones/[id]/progreso
// Body: { videosVistos: number, totalVideos: number }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sesion = await requiereRolApi(['TALLER'])
    if (sesion instanceof NextResponse) return sesion

    const taller = await prisma.taller.findFirst({
      where: { userId: sesion.userId },
      select: { id: true },
    })
    if (!taller) return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })

    const { id: coleccionId } = await params
    const body = await req.json()
    const { videosVistos: videosVistosRaw } = body

    // Contar videos reales de la colección (server-side, no confiar en el cliente)
    const coleccion = await prisma.coleccion.findUnique({
      where: { id: coleccionId },
      select: { _count: { select: { videos: true } } },
    })
    if (!coleccion) {
      return NextResponse.json({ error: 'Colección no encontrada' }, { status: 404 })
    }
    const totalVideos = coleccion._count.videos

    // Clampar el input del cliente al rango válido
    const videosVistos = Math.min(
      Math.max(0, Number(videosVistosRaw) || 0),
      totalVideos
    )

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
