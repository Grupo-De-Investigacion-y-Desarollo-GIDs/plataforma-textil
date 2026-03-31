import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const userId = session.user.id!
    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [notificaciones, total, sinLeer] = await Promise.all([
      prisma.notificacion.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notificacion.count({ where: { userId } }),
      prisma.notificacion.count({ where: { userId, leida: false } }),
    ])

    return NextResponse.json({ notificaciones, total, sinLeer, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener notificaciones' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const userId = session.user.id!
    const body = await req.json()

    if (body.marcarTodas) {
      await prisma.notificacion.updateMany({ where: { userId, leida: false }, data: { leida: true } })
      return NextResponse.json({ ok: true })
    }
    if (body.id) {
      // Verificar que la notificacion pertenece al usuario
      const notif = await prisma.notificacion.findUnique({ where: { id: body.id }, select: { userId: true } })
      if (!notif || notif.userId !== userId) {
        return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })
      }
      const updated = await prisma.notificacion.update({ where: { id: body.id }, data: { leida: true } })
      return NextResponse.json(updated)
    }
    return NextResponse.json({ error: 'id o marcarTodas requerido' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar notificacion' }, { status: 500 })
  }
}
