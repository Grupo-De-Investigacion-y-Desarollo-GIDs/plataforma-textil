import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { logAccionAdmin } from '@/compartido/lib/log'
import { aplicarNivel } from '@/compartido/lib/nivel'
import { apiHandler, errorAuthRequired, errorNotFound, errorForbidden } from '@/compartido/lib/api-errors'

export const PUT = apiHandler(async (req: NextRequest, ctx) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()

  const { id } = await ctx.params!

  const existing = await prisma.validacion.findUnique({
    where: { id: id as string },
    include: { taller: { select: { userId: true } } },
  })

  if (!existing) return errorNotFound('validacion')

  const role = session.user.role
  const isOwner = existing.taller.userId === session.user.id

  if (role !== 'ESTADO' && !isOwner) {
    return errorForbidden('ESTADO')
  }

  const body = await req.json()

  const data: Record<string, unknown> = {
    detalle: body.detalle,
    documentoUrl: body.documentoUrl,
    fechaVencimiento: body.fechaVencimiento ? new Date(body.fechaVencimiento) : undefined,
  }

  if (role === 'ESTADO' && body.estado) {
    data.estado = body.estado
    data.aprobadoPor = session.user.id
    data.aprobadoEn = new Date()
  }

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
    where: { id: id as string },
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
      entidadId: id as string,
      motivo: body.detalle || undefined,
      metadata: { tallerId: existing.tallerId, tipoDocumento: existing.tipo },
    })
    aplicarNivel(existing.tallerId, session.user.id!)
  }

  return NextResponse.json(validacion)
})
