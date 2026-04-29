import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { auth } from '@/compartido/lib/auth'
import { sendEmail, buildInvitacionCotizarEmail } from '@/compartido/lib/email'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const { tallerIds } = body as { tallerIds: string[] }

    if (!tallerIds?.length) {
      return NextResponse.json({ error: 'Seleccioná al menos un taller' }, { status: 400 })
    }

    // Verificar ownership del pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: { marca: { select: { userId: true, nombre: true } } },
    })
    if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN' && pedido.marca.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (pedido.estado !== 'BORRADOR') {
      return NextResponse.json(
        { error: 'Solo se puede invitar desde BORRADOR' },
        { status: 400 }
      )
    }

    // Pre-validar que todos los tallerIds existen y están verificados
    const talleresConUser = await prisma.taller.findMany({
      where: { id: { in: tallerIds } },
      include: { user: { select: { id: true, email: true } } },
    })

    const noVerificados = talleresConUser.filter(t => !t.verificadoAfip)
    if (noVerificados.length > 0) {
      return NextResponse.json(
        { error: `Los siguientes talleres no tienen CUIT verificado y no pueden ser invitados: ${noVerificados.map(t => t.nombre).join(', ')}` },
        { status: 400 }
      )
    }

    const idsValidos = talleresConUser.map(t => t.id)

    if (idsValidos.length === 0) {
      return NextResponse.json(
        { error: 'Ninguno de los talleres seleccionados existe' },
        { status: 400 }
      )
    }

    // Transaction: crear invitaciones + transicionar pedido a PUBLICADO con visibilidad INVITACION
    await prisma.$transaction([
      prisma.pedidoInvitacion.createMany({
        data: idsValidos.map(tallerId => ({ pedidoId: id, tallerId })),
        skipDuplicates: true,
      }),
      prisma.pedido.update({
        where: { id },
        data: {
          visibilidad: 'INVITACION',
          estado: 'PUBLICADO',
        },
      }),
    ])

    // Notificar a cada taller invitado (fire-and-forget)
    for (const taller of talleresConUser) {
      prisma.notificacion.create({
        data: {
          userId: taller.user.id,
          tipo: 'PEDIDO_INVITACION',
          titulo: `Te invitaron a cotizar: ${pedido.tipoPrenda}`,
          mensaje: `${pedido.marca.nombre} te invitó a cotizar un pedido de ${pedido.cantidad} unidades de ${pedido.tipoPrenda}.`,
          canal: 'PLATAFORMA',
          link: `/taller/pedidos/disponibles/${id}`,
        },
      }).catch((err) => console.error('[invitaciones] Error creando notificación:', err))

      sendEmail({
        to: taller.user.email,
        ...buildInvitacionCotizarEmail({
          nombreTaller: taller.nombre,
          nombreMarca: pedido.marca.nombre,
          tipoPrenda: pedido.tipoPrenda,
          cantidad: pedido.cantidad,
          pedidoUrl: `${process.env.NEXTAUTH_URL}/taller/pedidos/disponibles/${id}`,
        }),
      }).catch((err) => console.error('[invitaciones] Error enviando email:', err))
    }

    return NextResponse.json({ ok: true, invitados: idsValidos.length })
  } catch (error) {
    console.error('[invitaciones] Error en POST /api/pedidos/[id]/invitaciones:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
