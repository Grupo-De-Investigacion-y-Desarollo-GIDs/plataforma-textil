import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import {
  apiHandler,
  errorAuthRequired,
  errorResponse,
} from '@/compartido/lib/api-errors'
import { normalizarTelefonoArgentino } from '@/compartido/lib/whatsapp'

// PUT: actualiza phone y/o notificacionesWhatsapp del usuario logueado
export const PUT = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) return errorAuthRequired()

  const body = await req.json()
  const { phone, notificacionesWhatsapp } = body as {
    phone?: string
    notificacionesWhatsapp?: boolean
  }

  // Validar que al menos un campo este presente
  if (phone === undefined && notificacionesWhatsapp === undefined) {
    return errorResponse({
      code: 'INVALID_INPUT',
      message: 'Debes enviar al menos un campo para actualizar (phone o notificacionesWhatsapp)',
      status: 400,
    })
  }

  // Validar phone si se envia
  const data: { phone?: string; notificacionesWhatsapp?: boolean } = {}

  if (phone !== undefined) {
    if (typeof phone !== 'string') {
      return errorResponse({
        code: 'INVALID_INPUT',
        message: 'El telefono debe ser un texto',
        status: 400,
      })
    }

    // Permitir borrar el telefono
    if (phone.trim() === '') {
      data.phone = null as unknown as string
    } else {
      const normalizado = normalizarTelefonoArgentino(phone)
      if (!normalizado) {
        return errorResponse({
          code: 'INVALID_INPUT',
          message: 'El telefono no tiene un formato argentino valido (ej: 11 2345 6789)',
          status: 400,
        })
      }
      data.phone = normalizado
    }
  }

  if (notificacionesWhatsapp !== undefined) {
    if (typeof notificacionesWhatsapp !== 'boolean') {
      return errorResponse({
        code: 'INVALID_INPUT',
        message: 'notificacionesWhatsapp debe ser verdadero o falso',
        status: 400,
      })
    }
    data.notificacionesWhatsapp = notificacionesWhatsapp
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  })

  return NextResponse.json({ ok: true })
})
