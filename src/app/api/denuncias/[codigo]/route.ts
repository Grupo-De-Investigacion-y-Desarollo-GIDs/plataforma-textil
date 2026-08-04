import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { getFeatureFlag } from '@/compartido/lib/features'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  try {
    if (!await getFeatureFlag('denuncias')) {
      return NextResponse.json({ error: 'Funcionalidad no disponible' }, { status: 503 })
    }
    const { codigo } = await params
    const denuncia = await prisma.denuncia.findUnique({
      where: { codigo },
      select: { codigo: true, tipo: true, estado: true, createdAt: true, anonima: true },
    })
    if (!denuncia) return NextResponse.json({ error: 'Denuncia no encontrada' }, { status: 404 })
    return NextResponse.json(denuncia)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener denuncia' }, { status: 500 })
  }
}
