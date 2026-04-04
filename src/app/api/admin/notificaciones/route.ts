import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { logActividad } from '@/compartido/lib/log'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

    const body = await req.json()
    const { titulo, mensaje, tipo, canal, segmento } = body

    if (!titulo || !mensaje) {
      return NextResponse.json({ error: 'Titulo y mensaje son obligatorios' }, { status: 400 })
    }

    // Buscar usuarios del segmento
    const where: Record<string, unknown> = { active: true }
    if (segmento === 'talleres') where.role = 'TALLER'
    else if (segmento === 'marcas') where.role = 'MARCA'

    const usuarios = await prisma.user.findMany({
      where,
      select: { id: true },
    })

    if (usuarios.length === 0) {
      return NextResponse.json({ error: 'No hay usuarios en el segmento seleccionado' }, { status: 400 })
    }

    // Crear una notificación por usuario
    await prisma.notificacion.createMany({
      data: usuarios.map(u => ({
        userId: u.id,
        tipo: tipo || 'ADMIN_ENVIO',
        titulo,
        mensaje,
        canal: canal || 'PLATAFORMA',
      })),
    })

    await logActividad(session.user.id!, 'NOTIFICACION_MASIVA', {
      titulo,
      segmento,
      canal,
      destinatarios: usuarios.length,
    })

    return NextResponse.json({ ok: true, enviadas: usuarios.length }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/admin/notificaciones:', error)
    return NextResponse.json({ error: 'Error al enviar notificaciones' }, { status: 500 })
  }
}
