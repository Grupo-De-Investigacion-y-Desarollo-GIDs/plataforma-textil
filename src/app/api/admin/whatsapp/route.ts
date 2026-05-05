import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import {
  apiHandler,
  errorAuthRequired,
  errorForbidden,
  errorNotFound,
  errorResponse,
} from '@/compartido/lib/api-errors'

// GET: devuelve mensajes WhatsApp pendientes (estado=GENERADO)
export const GET = apiHandler(async () => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()

  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && role !== 'ESTADO') return errorForbidden('ADMIN o ESTADO')

  const mensajes = await prisma.mensajeWhatsapp.findMany({
    where: { estado: 'GENERADO' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      phone: true,
      mensaje: true,
      enlaceProfundo: true,
      userId: true,
      estado: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  })

  return NextResponse.json({ mensajes })
})

// PUT: marca un mensaje como ENVIADO
export const PUT = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()

  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && role !== 'ESTADO') return errorForbidden('ADMIN o ESTADO')

  const body = await req.json()
  const { id } = body as { id?: string }

  if (!id || typeof id !== 'string') {
    return errorResponse({
      code: 'INVALID_INPUT',
      message: 'Se requiere el campo id',
      status: 400,
    })
  }

  const mensaje = await prisma.mensajeWhatsapp.findUnique({
    where: { id },
    select: { id: true, estado: true },
  })

  if (!mensaje) return errorNotFound('mensaje WhatsApp')

  await prisma.mensajeWhatsapp.update({
    where: { id },
    data: {
      estado: 'ENVIADO',
      enviadoAt: new Date(),
      enviadoPor: session.user.id,
    },
  })

  return NextResponse.json({ ok: true })
})
