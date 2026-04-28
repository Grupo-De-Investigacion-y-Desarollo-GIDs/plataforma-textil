import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { logAccionAdmin } from '@/compartido/lib/log'
import { aplicarNivel } from '@/compartido/lib/nivel'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.validacion.findUnique({
      where: { id },
      include: { taller: { select: { userId: true } } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Validación no encontrada' }, { status: 404 })
    }

    const role = session.user.role
    const isOwner = existing.taller.userId === session.user.id

    // ESTADO puede cambiar estado (aprobar/rechazar/revocar)
    // ADMIN puede ver pero NO puede cambiar estado (403)
    // Taller owner puede modificar sus propias validaciones (subir docs)
    if (role !== 'ESTADO' && !isOwner) {
      return NextResponse.json(
        {
          error: role === 'ADMIN'
            ? 'Esta acción requiere rol ESTADO. Los administradores no pueden aprobar/rechazar documentos.'
            : 'Sin permisos para esta validación',
          code: 'INSUFFICIENT_ROLE',
          rolesRequeridos: ['ESTADO'],
        },
        { status: 403 }
      )
    }

    const body = await req.json()

    const data: Record<string, unknown> = {
      detalle: body.detalle,
      documentoUrl: body.documentoUrl,
      fechaVencimiento: body.fechaVencimiento ? new Date(body.fechaVencimiento) : undefined,
    }

    // Solo ESTADO puede cambiar el estado (evita self-approve por taller y bloquea ADMIN)
    if (role === 'ESTADO' && body.estado) {
      data.estado = body.estado
      data.aprobadoPor = session.user.id
      data.aprobadoEn = new Date()
    }

    // Talleres pueden marcar trámite externo como realizado (NO_INICIADO -> PENDIENTE)
    if (isOwner && body.marcarRealizado && existing.estado === 'NO_INICIADO') {
      const tipoDoc = await prisma.tipoDocumento.findFirst({
        where: { nombre: existing.tipo, activo: true },
        select: { enlaceTramite: true },
      })
      if (tipoDoc?.enlaceTramite) {
        data.estado = 'PENDIENTE'
      }
    }

    const validacion = await prisma.validacion.update({
      where: { id },
      data,
    })

    if (role === 'ESTADO' && body.estado) {
      const accion = body.estado === 'COMPLETADO'
        ? 'ESTADO_VALIDACION_APROBADA'
        : body.estado === 'RECHAZADO'
          ? 'ESTADO_VALIDACION_RECHAZADA'
          : body.estado === 'NO_INICIADO'
            ? 'ESTADO_VALIDACION_REVOCADA'
            : `ESTADO_VALIDACION_${body.estado}`
      logAccionAdmin(accion, session.user.id!, {
        entidad: 'validacion',
        entidadId: id,
        motivo: body.detalle || undefined,
        metadata: { tallerId: existing.tallerId, tipoDocumento: existing.tipo },
      })
      aplicarNivel(existing.tallerId, session.user.id!)
    }

    return NextResponse.json(validacion)
  } catch (error) {
    console.error('Error en PUT /api/validaciones/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
