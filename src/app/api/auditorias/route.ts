import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'

// K-05/§6.8: el GET (list) era codigo muerto — el panel admin/estado de auditorias
// lee Prisma server-side, no este endpoint. Se elimino. El POST (alta) sigue vivo.

export async function POST(req: NextRequest) {
  try {
    const sesion = await requiereRolApi(['ADMIN', 'ESTADO'])
    if (sesion instanceof NextResponse) return sesion

    const body = await req.json()
    const auditoria = await prisma.auditoria.create({
      data: {
        tallerId: body.tallerId,
        inspectorId: body.inspectorId,
        fecha: body.fecha ? new Date(body.fecha) : null,
        tipo: body.tipo || 'PRIMERA_VISITA',
        prioridad: body.prioridad,
      },
    })
    return NextResponse.json(auditoria, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear auditoria' }, { status: 500 })
  }
}
