import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { notificarCotizacion } from '@/compartido/lib/notificaciones'
import { z } from 'zod'

const cotizacionSchema = z.object({
  pedidoId: z.string().min(1, 'pedidoId requerido'),
  precio: z.number().positive('El precio debe ser mayor a 0'),
  plazoDias: z.number().int().positive('El plazo debe ser al menos 1 dia'),
  proceso: z.string().min(3, 'Proceso debe tener al menos 3 caracteres'),
  mensaje: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    const userId = session.user.id!

    // Vencimiento lazy: marcar cotizaciones vencidas
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
      if (!taller) return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })
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
      return NextResponse.json({ error: 'Rol no autorizado' }, { status: 403 })
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
  } catch (error) {
    console.error('Error en GET /api/cotizaciones:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role

    if (role !== 'TALLER') {
      return NextResponse.json({ error: 'Solo talleres pueden cotizar' }, { status: 403 })
    }

    const taller = await prisma.taller.findUnique({
      where: { userId: session.user.id! },
      select: { id: true, nombre: true },
    })
    if (!taller) return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })

    const body = await req.json()
    const parsed = cotizacionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }
    const data = parsed.data

    // Verificar que el pedido existe y esta PUBLICADO
    const pedido = await prisma.pedido.findUnique({
      where: { id: data.pedidoId },
      include: { marca: { select: { userId: true, nombre: true } } },
    })
    if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    if (pedido.estado !== 'PUBLICADO') {
      return NextResponse.json({ error: 'El pedido no esta disponible para cotizar' }, { status: 400 })
    }

    // Calcular vencimiento: 7 dias desde ahora
    const venceEn = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

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
        },
      })

      // Notificar a la marca (fire-and-forget)
      notificarCotizacion('RECIBIDA', {
        cotizacion,
        taller: { nombre: taller.nombre },
        marca: { userId: pedido.marca.userId, nombre: pedido.marca.nombre },
        pedido: { omId: pedido.omId },
      })

      return NextResponse.json(cotizacion, { status: 201 })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Ya tenes una cotizacion activa para este pedido' },
          { status: 409 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error en POST /api/cotizaciones:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
