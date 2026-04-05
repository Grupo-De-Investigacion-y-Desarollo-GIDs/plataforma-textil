import { NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { OrdenPDF } from '@/compartido/componentes/pdf/orden-pdf'

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

  const orden = await prisma.ordenManufactura.findUnique({
    where: { id },
    include: {
      taller: { select: { nombre: true, cuit: true, nivel: true, userId: true } },
      pedido: {
        select: {
          tipoPrenda: true,
          cantidad: true,
          omId: true,
          marca: { select: { nombre: true, userId: true } },
        },
      },
    },
  })

  if (!orden) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  // Verificar ownership: taller asignado, marca dueña del pedido, o ADMIN
  const role = (session.user as { role?: string }).role
  const userId = session.user.id
  if (role !== 'ADMIN') {
    const esTaller = orden.taller.userId === userId
    const esMarca = orden.pedido.marca.userId === userId
    if (!esTaller && !esMarca) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }
  }

  const pdfBuffer = await renderToBuffer(
    <OrdenPDF
      moId={orden.moId}
      nombreTaller={orden.taller.nombre}
      cuitTaller={orden.taller.cuit}
      nivelTaller={orden.taller.nivel}
      nombreMarca={orden.pedido.marca.nombre}
      tipoPrenda={orden.pedido.tipoPrenda}
      cantidad={orden.pedido.cantidad}
      proceso={orden.proceso}
      precio={orden.precio}
      plazoDias={orden.plazoDias}
      fechaAcuerdo={orden.createdAt}
    />
  )

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="acuerdo-${orden.moId}.pdf"`,
    },
  })
}
