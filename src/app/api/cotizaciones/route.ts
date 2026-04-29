import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { notificarCotizacion } from '@/compartido/lib/notificaciones'
import { logActividad } from '@/compartido/lib/log'
import { rateLimit } from '@/compartido/lib/ratelimit'
import { apiHandler, errorAuthRequired, errorForbidden, errorNotFound, errorConflict, errorResponse } from '@/compartido/lib/api-errors'
import { z } from 'zod'

const cotizacionSchema = z.object({
  pedidoId: z.string().min(1, 'pedidoId requerido'),
  precio: z.number().positive('El precio debe ser mayor a 0'),
  plazoDias: z.number().int().positive('El plazo debe ser al menos 1 dia'),
  proceso: z.string().min(3, 'Proceso debe tener al menos 3 caracteres'),
  mensaje: z.string().optional(),
})

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()
  const role = (session.user as { role?: string }).role
  const userId = session.user.id!

  await prisma.cotizacion.updateMany({
    where: {
      estado: 'ENVIADA',
      venceEn: { lt: new Date() },
    },
    data: { estado: 'VENCIDA' },
  })

  const { searchParams } = req.nextUrl
  const pedidoId = searchParams.get('pedidoId')
  const tallerId = searchParams.get('tallerId')

  let where: Prisma.CotizacionWhereInput = {}

  if (role === 'TALLER') {
    const taller = await prisma.taller.findUnique({ where: { userId }, select: { id: true } })
    if (!taller) return errorNotFound('taller')
    where = { tallerId: taller.id, ...(pedidoId ? { pedidoId } : {}) }
  } else if (role === 'MARCA') {
    where = {
      pedido: { marca: { userId } },
      ...(pedidoId ? { pedidoId } : {}),
    }
  } else if (role === 'ADMIN') {
    where = {
      ...(pedidoId ? { pedidoId } : {}),
      ...(tallerId ? { tallerId } : {}),
    }
  } else {
    return errorForbidden()
  }

  const cotizaciones = await prisma.cotizacion.findMany({
    where,
    include: {
      taller: { select: { id: true, nombre: true, nivel: true } },
      pedido: { select: { id: true, omId: true, tipoPrenda: true, cantidad: true, estado: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ cotizaciones })
})

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()
  const role = (session.user as { role?: string }).role

  if (role !== 'ADMIN' && role !== 'ESTADO') {
    const blocked = await rateLimit(req, 'cotizaciones', session.user.id!)
    if (blocked) return blocked
  }

  if (role !== 'TALLER') return errorForbidden('TALLER')

  const taller = await prisma.taller.findUnique({
    where: { userId: session.user.id! },
    select: { id: true, nombre: true },
  })
  if (!taller) return errorNotFound('taller')

  const body = await req.json()
  const parsed = cotizacionSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse({
      code: 'INVALID_INPUT',
      message: parsed.error.issues[0]?.message || 'Datos invalidos',
      status: 400,
    })
  }
  const data = parsed.data

  const pedido = await prisma.pedido.findUnique({
    where: { id: data.pedidoId },
    select: { id: true, estado: true, visibilidad: true, marca: { select: { userId: true, nombre: true } }, omId: true, tipoPrenda: true, cantidad: true, marcaId: true },
  })
  if (!pedido) return errorNotFound('pedido')
  if (pedido.estado !== 'PUBLICADO') {
    return errorResponse({ code: 'INVALID_INPUT', message: 'El pedido no esta disponible para cotizar', status: 400 })
  }

  if (pedido.visibilidad === 'INVITACION') {
    const invitacion = await prisma.pedidoInvitacion.findUnique({
      where: { pedidoId_tallerId: { pedidoId: data.pedidoId, tallerId: taller.id } },
    })
    if (!invitacion) return errorForbidden()
  }

  const venceEn = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const imagenes = Array.isArray(body.imagenes)
    ? body.imagenes.filter((u: unknown) => typeof u === 'string')
    : []

  try {
    const cotizacion = await prisma.cotizacion.create({
      data: {
        pedidoId: data.pedidoId,
        tallerId: taller.id,
        precio: data.precio,
        plazoDias: data.plazoDias,
        proceso: data.proceso,
        mensaje: data.mensaje ?? null,
        venceEn,
        imagenes,
      },
    })

    logActividad('COTIZACION_RECIBIDA', session.user.id, {
      pedidoId: data.pedidoId,
      cotizacionId: cotizacion.id,
      tallerId: taller.id,
      tallerNombre: taller.nombre,
    })

    notificarCotizacion('RECIBIDA', {
      cotizacion,
      taller: { nombre: taller.nombre },
      marca: { userId: pedido.marca.userId, nombre: pedido.marca.nombre },
      pedido: { omId: pedido.omId, id: pedido.id },
    })

    return NextResponse.json(cotizacion, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return errorConflict('Ya tenes una cotizacion activa para este pedido')
    }
    throw error
  }
})
