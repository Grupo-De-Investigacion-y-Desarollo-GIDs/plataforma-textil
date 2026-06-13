import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/compartido/lib/prisma'
import { requiereRolApi } from '@/compartido/lib/permisos'
import { notificarCotizacion } from '@/compartido/lib/notificaciones'
import { logActividad } from '@/compartido/lib/log'
import { rateLimit } from '@/compartido/lib/ratelimit'
import { apiHandler, errorForbidden, errorNotFound, errorConflict, errorResponse } from '@/compartido/lib/api-errors'
import { elegibilidadCotizar } from '@/compartido/lib/cotizaciones'
import { z } from 'zod'

const cotizacionSchema = z.object({
  pedidoId: z.string().min(1, 'pedidoId requerido'),
  precio: z.number().positive('El precio debe ser mayor a 0'),
  plazoDias: z.number().int().positive('El plazo debe ser al menos 1 dia'),
  proceso: z.string().min(3, 'Proceso debe tener al menos 3 caracteres'),
  mensaje: z.string().optional(),
})

export const GET = apiHandler(async (req: NextRequest) => {
  const sesion = await requiereRolApi(['TALLER', 'MARCA', 'ADMIN'])
  if (sesion instanceof NextResponse) return sesion
  const role = sesion.role
  const userId = sesion.userId

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
  } else {
    // role === 'ADMIN' (garantizado por el gate de requiereRolApi)
    where = {
      ...(pedidoId ? { pedidoId } : {}),
      ...(tallerId ? { tallerId } : {}),
    }
  }

  const cotizaciones = await prisma.cotizacion.findMany({
    where,
    include: {
      taller: { select: { id: true, nombre: true } },
      pedido: { select: { id: true, omId: true, tipoPrenda: true, cantidad: true, estado: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ cotizaciones })
})

export const POST = apiHandler(async (req: NextRequest) => {
  // Solo rol TALLER puede cotizar.
  const sesion = await requiereRolApi(['TALLER'])
  if (sesion instanceof NextResponse) return sesion

  const blocked = await rateLimit(req, 'cotizaciones', sesion.userId)
  if (blocked) return blocked

  const taller = await prisma.taller.findUnique({
    where: { userId: sesion.userId },
    select: { id: true, nombre: true, verificadoAfip: true },
  })
  if (!taller) return errorNotFound('taller')

  if (!taller.verificadoAfip) {
    return errorResponse({
      code: 'TALLER_NO_VERIFICADO',
      message: 'Para cotizar, primero necesitás completar la validación de CUIT.',
      status: 403,
    })
  }

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

  // Elegibilidad del taller para cotizar el pedido (fuente única compartida con
  // el upload de imágenes de cotización). Mapeo a los mismos códigos/estados.
  const elegible = await elegibilidadCotizar(sesion.userId, taller.id, data.pedidoId)
  if (!elegible.ok) {
    switch (elegible.motivo) {
      case 'PEDIDO_NO_ENCONTRADO':
        return errorNotFound('pedido')
      case 'AUTO_COTIZACION':
        return errorResponse({
          code: 'AUTO_COTIZACION',
          message: 'No podés cotizar un pedido que publicaste como marca.',
          status: 403,
        })
      case 'PEDIDO_NO_DISPONIBLE':
        return errorResponse({ code: 'INVALID_INPUT', message: 'El pedido no esta disponible para cotizar', status: 400 })
      case 'NO_INVITADO':
        return errorForbidden()
    }
  }
  const pedido = elegible.pedido

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

    logActividad('COTIZACION_RECIBIDA', sesion.userId, {
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
