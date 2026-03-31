import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { logActividad } from '@/lib/log'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Cargar validación con taller para verificar ownership
    const existing = await prisma.validacion.findUnique({
      where: { id },
      include: { taller: { select: { userId: true } } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Validación no encontrada' }, { status: 404 })
    }

    const role = session.user.role
    const isOwner = existing.taller.userId === session.user.id

    // Solo ADMIN puede cambiar estado (aprobar/rechazar)
    // Taller solo puede modificar sus propias validaciones (subir docs)
    if (role !== 'ADMIN' && !isOwner) {
      return NextResponse.json({ error: 'Sin permisos para esta validación' }, { status: 403 })
    }

    const body = await req.json()

    // Talleres no pueden cambiar el estado (evita self-approve)
    const data: Record<string, unknown> = {
      detalle: body.detalle,
      documentoUrl: body.documentoUrl,
      fechaVencimiento: body.fechaVencimiento ? new Date(body.fechaVencimiento) : undefined,
    }

    if (role === 'ADMIN') {
      data.estado = body.estado
    }

    const validacion = await prisma.validacion.update({
      where: { id },
      data,
    })

    if (role === 'ADMIN' && body.estado) {
      logActividad('ADMIN_VALIDACION_' + body.estado, session.user.id, { validacionId: id, tallerId: existing.taller.userId })
    }

    return NextResponse.json(validacion)
  } catch (error) {
    console.error('Error en PUT /api/validaciones/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
