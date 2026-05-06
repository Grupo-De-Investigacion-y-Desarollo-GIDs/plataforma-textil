import { NextRequest, NextResponse } from 'next/server'
import { apiHandler, errorAuthRequired, errorForbidden, errorNotFound, errorInvalidInput } from '@/compartido/lib/api-errors'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { z } from 'zod'
import { sendEmail, buildInvitacionRegistroEmail } from '@/compartido/lib/email'
import { logAccionAdmin } from '@/compartido/lib/log'

const Schema = z.object({
  userId: z.string().min(1),
})

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) return errorAuthRequired()
  if (!['ADMIN', 'ESTADO'].includes(session.user.role)) {
    return errorForbidden('ADMIN o ESTADO')
  }

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return errorInvalidInput(parsed.error)

  const destinatario = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, email: true, name: true, active: true },
  })

  if (!destinatario || !destinatario.active) {
    return errorNotFound('usuario')
  }

  const { subject, html } = buildInvitacionRegistroEmail({
    nombreDestinatario: destinatario.name ?? 'Usuario',
    nombreReferente: session.user.name ?? 'Equipo PDT',
    cargoReferente: 'OIT/UNTREF',
  })

  const resultado = await sendEmail({
    to: destinatario.email,
    subject,
    html,
  })

  await logAccionAdmin('INVITACION_REGISTRO_REENVIADA', session.user.id, {
    entidad: 'usuario',
    entidadId: destinatario.id,
    metadata: { email: destinatario.email, exito: resultado.exito },
  })

  return NextResponse.json({ success: resultado.exito, email: destinatario.email })
})
