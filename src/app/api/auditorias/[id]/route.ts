import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'

// K-05/§6.8: el GET de detalle era codigo muerto — el panel de auditorias lee Prisma
// server-side (informe-client solo usa el PUT). Se elimino. El PUT sigue vivo.

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sesion = await requiereRolApi(['ADMIN', 'ESTADO'])
    if (sesion instanceof NextResponse) return sesion

    const { id } = await params
    const body = await req.json()
    const auditoria = await prisma.auditoria.update({
      where: { id },
      data: {
        estado: body.estado,
        resultado: body.resultado,
        hallazgos: body.hallazgos,
        fecha: body.fecha ? new Date(body.fecha) : undefined,
      },
    })

    // Crear acciones correctivas nuevas si se enviaron
    if (body.nuevaAccion?.descripcion) {
      await prisma.accionCorrectiva.create({
        data: {
          auditoriaId: id,
          descripcion: body.nuevaAccion.descripcion,
          plazo: body.nuevaAccion.plazo ? new Date(body.nuevaAccion.plazo) : null,
        },
      })
    }

    return NextResponse.json(auditoria)
  } catch (error) {
    console.error('Error en PUT /api/auditorias/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
