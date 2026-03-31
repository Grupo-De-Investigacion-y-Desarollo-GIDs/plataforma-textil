import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  try {
    const { codigo } = await params

    const certificado = await prisma.certificado.findUnique({
      where: { codigo },
      include: {
        taller: { select: { id: true, nombre: true, nivel: true } },
        coleccion: { select: { id: true, titulo: true, categoria: true } },
      },
    })

    if (!certificado) {
      return NextResponse.json({ error: 'Certificado no encontrado' }, { status: 404 })
    }

    return NextResponse.json(certificado)
  } catch (error) {
    console.error('Error en GET /api/certificados/[codigo]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
