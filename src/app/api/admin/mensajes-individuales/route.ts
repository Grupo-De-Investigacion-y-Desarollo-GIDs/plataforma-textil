import { NextRequest, NextResponse } from 'next/server'
import { apiHandler, errorInvalidInput, errorNotFound, errorRateLimited } from '@/compartido/lib/api-errors'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { z } from 'zod'
import { prisma } from '@/compartido/lib/prisma'
import { logAccionAdmin } from '@/compartido/lib/log'
import { generarMensajeWhatsapp } from '@/compartido/lib/whatsapp'

const SchemaCrearMensaje = z.object({
  destinatarioId: z.string().min(1),
  titulo: z.string().min(3).max(120),
  mensaje: z.string().min(10).max(2000),
  link: z.string().url().refine(u => /^https?:\/\//.test(u), 'Solo URLs http/https').optional().or(z.literal('')),
  enviarPorWhatsapp: z.boolean().default(false),
})

export const POST = apiHandler(async (req) => {
  const sesion = await requiereRolApi(['ADMIN', 'ESTADO'])
  if (sesion instanceof NextResponse) return sesion

  // Rate limit inline: 50 mensajes/hora por admin
  const unaHoraAtras = new Date(Date.now() - 60 * 60 * 1000)
  const enviados = await prisma.notificacion.count({
    where: { createdById: sesion.userId, tipo: 'mensaje_individual', createdAt: { gte: unaHoraAtras } },
  })
  if (enviados >= 50) return errorRateLimited(3600)

  const body = await req.json()
  const parsed = SchemaCrearMensaje.safeParse(body)

  if (!parsed.success) return errorInvalidInput(parsed.error)

  const { destinatarioId, titulo, mensaje, link, enviarPorWhatsapp } = parsed.data

  const destinatario = await prisma.user.findUnique({
    where: { id: destinatarioId },
    select: { id: true, name: true, phone: true, role: true, active: true },
  })

  if (!destinatario || !destinatario.active) {
    return errorNotFound('destinatario')
  }

  const notificacion = await prisma.notificacion.create({
    data: {
      userId: destinatarioId,
      tipo: 'mensaje_individual',
      titulo,
      mensaje,
      link: link || null,
      createdById: sesion.userId,
    },
  })

  if (enviarPorWhatsapp && destinatario.phone) {
    generarMensajeWhatsapp({
      userId: destinatarioId,
      template: 'mensaje_admin',
      datos: {
        texto: titulo + '\n\n' + mensaje.slice(0, 200) + (mensaje.length > 200 ? '...' : ''),
      },
      destino: link || '/cuenta/notificaciones',
      notificacionId: notificacion.id,
    }).catch((err) => {
      console.error('[mensajes-individuales] Error generando WhatsApp:', err)
    })
  }

  logAccionAdmin('MENSAJE_INDIVIDUAL_ENVIADO', sesion.userId, {
    entidad: 'usuario',
    entidadId: destinatarioId,
    metadata: {
      titulo,
      enviadoPorWhatsapp: enviarPorWhatsapp,
      destinatarioRol: destinatario.role,
    },
  })

  return NextResponse.json({
    success: true,
    notificacionId: notificacion.id,
  })
})
