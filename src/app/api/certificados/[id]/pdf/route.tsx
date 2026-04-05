import { NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { CertificadoPDF } from '@/compartido/componentes/pdf/certificado-pdf'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const certificado = await prisma.certificado.findUnique({
    where: { id },
    include: {
      taller: { select: { id: true, nombre: true, userId: true } },
      coleccion: { select: { titulo: true, institucion: true } },
    },
  })

  if (!certificado) {
    return NextResponse.json({ error: 'Certificado no encontrado' }, { status: 404 })
  }

  // Verificar ownership: taller propio o ADMIN
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && certificado.taller.userId !== session.user.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  // Generar PDF on-demand
  const pdfBuffer = await renderToBuffer(
    <CertificadoPDF
      nombreTaller={certificado.taller.nombre}
      nombreCurso={certificado.coleccion.titulo}
      calificacion={certificado.calificacion}
      codigo={certificado.codigo}
      fecha={certificado.fecha}
      institucion={certificado.coleccion.institucion ?? 'OIT Argentina · UNTREF'}
    />
  )

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${certificado.codigo}.pdf"`,
    },
  })
}
