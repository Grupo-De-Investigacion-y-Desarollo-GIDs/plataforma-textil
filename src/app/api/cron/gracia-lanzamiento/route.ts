import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { logActividad } from '@/compartido/lib/log'
import { sendEmail, buildLanzamientoGraciaEmail } from '@/compartido/lib/email'

// Email de LANZAMIENTO de la gracia (Etapa 2.3-B1). NO es parte del cron: es un one-off
// que Gerardo dispara UNA vez, manualmente, poco después de promover B0 a prod (cuando
// el backfill ya arrancó el reloj de 60 días de los talleres existentes sin verificar).
//
// Avisa a los talleres EN_GRACIA "tenés 60 días desde hoy para verificar tu CUIT". NO
// toca `inicioGracia` (el reloj ya lo arrancó el backfill de B0) — solo notifica.
//
// Protegido con el mismo `CRON_SECRET`. Requiere POST + `?confirmar=SI` para evitar un
// disparo accidental (mandaría un email masivo). No es idempotente: dispararlo dos veces
// manda dos emails. Por eso es manual y una sola vez — ver el runbook.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function autorizado(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function POST(req: NextRequest) {
  if (!autorizado(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const confirmar = req.nextUrl.searchParams.get('confirmar')
  if (confirmar !== 'SI') {
    return NextResponse.json(
      { error: 'Falta confirmación', hint: 'Agregá ?confirmar=SI para disparar el envío masivo (one-off).' },
      { status: 400 },
    )
  }

  const talleres = await prisma.taller.findMany({
    where: { estadoCuenta: 'EN_GRACIA' },
    select: { id: true, nombre: true, user: { select: { email: true } } },
  })

  let enviados = 0
  let sinEmail = 0
  let errores = 0

  for (const taller of talleres) {
    const email = taller.user?.email
    if (!email) {
      sinEmail++
      continue
    }
    try {
      await sendEmail({ to: email, ...buildLanzamientoGraciaEmail({ nombreTaller: taller.nombre }) })
      enviados++
    } catch (err) {
      errores++
      console.error('[CRON gracia-lanzamiento] error en taller', taller.id, err)
    }
  }

  const resumen = {
    ok: true,
    destinatarios: talleres.length,
    enviados,
    sinEmail,
    errores,
    at: new Date().toISOString(),
  }

  console.log('[CRON gracia-lanzamiento]', JSON.stringify(resumen))
  logActividad('CRON_GRACIA_LANZAMIENTO', null, resumen)

  return NextResponse.json(resumen)
}
