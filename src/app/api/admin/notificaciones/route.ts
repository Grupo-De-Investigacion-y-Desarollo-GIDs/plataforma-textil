import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { logActividad } from '@/compartido/lib/log'
import { sendEmail, buildComunicacionAdminEmail } from '@/compartido/lib/email'
import { generarMensajeWhatsapp } from '@/compartido/lib/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

    const body = await req.json()
    const { titulo, mensaje, tipo, canal, segmento, link } = body

    if (!titulo || !mensaje) {
      return NextResponse.json({ error: 'Título y mensaje son obligatorios' }, { status: 400 })
    }

    // Construir el filtro con typing de Prisma
    const where: Prisma.UserWhereInput = { active: true }

    if (segmento === 'talleres') {
      where.role = 'TALLER'
    } else if (segmento === 'marcas') {
      where.role = 'MARCA'
    } else if (segmento === 'talleres_bronce') {
      where.role = 'TALLER'
      where.taller = { nivel: 'BRONCE' }
    } else if (segmento === 'talleres_plata') {
      where.role = 'TALLER'
      where.taller = { nivel: 'PLATA' }
    } else if (segmento === 'talleres_oro') {
      where.role = 'TALLER'
      where.taller = { nivel: 'ORO' }
    }
    // 'todos' → sin filtro de rol

    const usuarios = await prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true },
    })

    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: 'No hay destinatarios para el segmento seleccionado' },
        { status: 400 }
      )
    }

    // batchId unico para agrupar este envio en la UI
    const batchId = randomUUID()

    await prisma.notificacion.createMany({
      data: usuarios.map(u => ({
        userId: u.id,
        tipo: tipo || 'ADMIN_ENVIO',
        titulo,
        mensaje,
        canal: canal || 'PLATAFORMA',
        link: link || null,
        createdById: session.user!.id!,
        batchId,
      })),
    })

    // Si el canal es EMAIL, enviar emails reales (fire-and-forget con logging)
    if (canal === 'EMAIL') {
      Promise.allSettled(
        usuarios.map(u =>
          sendEmail({
            to: u.email,
            ...buildComunicacionAdminEmail({
              titulo,
              mensaje,
              nombreUsuario: u.name ?? 'usuario',
            }),
          })
        )
      ).then(results => {
        const fallidos = results.filter(r => r.status === 'rejected').length
        if (fallidos > 0) {
          console.error(
            `[notificaciones] ${fallidos} emails fallaron de ${results.length} en batch ${batchId}`
          )
        }
      }).catch(err => {
        console.error('[notificaciones] Error global enviando emails:', err)
      })
    }

    // F-02: WhatsApp para cada destinatario (fire-and-forget)
    for (const u of usuarios) {
      generarMensajeWhatsapp({
        userId: u.id,
        template: 'mensaje_admin',
        datos: { texto: mensaje },
        destino: link ?? '/taller',
      }).catch(err => console.error('[F-02] Error WhatsApp mensaje_admin:', err))
    }

    await logActividad(session.user!.id!, 'NOTIFICACION_MASIVA', {
      titulo,
      segmento,
      canal,
      destinatarios: usuarios.length,
      batchId,
    })

    return NextResponse.json(
      { ok: true, enviadas: usuarios.length, batchId },
      { status: 201 }
    )
  } catch (error) {
    console.error('[notificaciones] Error en POST /api/admin/notificaciones:', error)
    return NextResponse.json({ error: 'Error al enviar notificaciones' }, { status: 500 })
  }
}
