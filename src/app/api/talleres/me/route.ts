import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const taller = await prisma.taller.findUnique({
      where: { userId: session.user.id! },
      include: { maquinaria: true },
    })

    if (!taller) return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })

    return NextResponse.json(taller)
  } catch (error) {
    console.error('Error en GET /api/talleres/me:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
