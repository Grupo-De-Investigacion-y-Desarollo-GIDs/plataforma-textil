import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Buscar por codigo (verificacion publica) o por id (uso interno)
    // K-05: select explicito — la pagina publica de verificacion solo lee
    // codigo/fecha/calificacion/revocado + taller y coleccion. Evita exponer
    // pdfUrl/qrCode y campos nuevos del modelo en un endpoint publico.
    const certificado = await prisma.certificado.findFirst({
      where: { OR: [{ codigo: id }, { id }] },
      select: {
        codigo: true,
        fecha: true,
        calificacion: true,
        revocado: true,
        taller: { select: { id: true, nombre: true, nivel: true } },
        coleccion: { select: { id: true, titulo: true, categoria: true } },
      },
    })

    if (!certificado) {
      return NextResponse.json({ error: 'Certificado no encontrado' }, { status: 404 })
    }

    return NextResponse.json(certificado)
  } catch (error) {
    console.error('Error en GET /api/certificados/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
