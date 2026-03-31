import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  try {
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
