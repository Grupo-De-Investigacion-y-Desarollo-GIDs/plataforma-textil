import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { logActividad } from '@/compartido/lib/log'
import { planificarAccionGracia, clasificarGracia } from '@/compartido/lib/gracia'
import { sincronizarTaller } from '@/compartido/lib/arca'
import {
  sendEmail,
  buildRecordatorioCuitEmail,
  buildCuentaInactivaEmail,
} from '@/compartido/lib/email'

// Cron diario de la gracia de CUIT (Etapa 2.3-B1). Vercel lo invoca según
// `vercel.json#crons` con `Authorization: Bearer ${CRON_SECRET}`.
//
// Qué hace cada corrida, sobre los talleres con estadoCuenta = EN_GRACIA:
//   - REINTENTO ARCA (Pieza D del circuito CUIT V4): ANTES de clasificar, para cada taller
//     sin verificar con CUIT, reintenta `sincronizarTaller(force=true)`. Si ARCA valida, el
//     taller se reactiva solo (datosReactivacion) y sale de la gracia SIN recibir el email
//     ni inactivarse esa corrida. Autocura el caso "CUIT correcto que falló por ARCA caído
//     al registrarse". Reintento DIARIO sin backoff (población de piloto chica); un fallo de
//     ARCA (no responde / CUIT malo) NO es error del cron: cae al flujo normal de abajo.
//   - RECORDATORIO (ventana [50,60), sin recordatorio previo): manda el email día ~50
//     y sella `recordatorioCuitEnviadoAt` (idempotencia: no re-envía).
//   - INACTIVAR (>=60 días): estadoCuenta=INACTIVA + inactivadaAt=NOW + email de inactivación.
//     El filtro por EN_GRACIA hace la inactivación un no-op repetible (idempotencia).
//
// La DECISIÓN vive en `planificarAccionGracia` (pura, testeada con fechas fabricadas);
// esta route solo EJECUTA. La ventana (no el día exacto) tolera corridas perdidas.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function autorizado(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  // Sin secret configurado, rechazar (no dejar el endpoint abierto por omisión).
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!autorizado(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const ahora = new Date()

  const talleres = await prisma.taller.findMany({
    where: { estadoCuenta: 'EN_GRACIA' },
    select: {
      id: true,
      nombre: true,
      cuit: true,
      verificadoAfip: true,
      estadoCuenta: true,
      inicioGracia: true,
      recordatorioCuitEnviadoAt: true,
      user: { select: { email: true } },
    },
  })

  let recordatorios = 0
  let inactivaciones = 0
  let sinEmail = 0
  let errores = 0
  let reintentosArca = 0      // Pieza D: cuántos talleres se reintentaron contra ARCA
  let reactivacionesAuto = 0  // Pieza D: cuántos validaron en el reintento y se reactivaron

  for (const taller of talleres) {
    const email = taller.user?.email

    // Aislar cada taller: si uno falla (DB/email/ARCA), no aborta el resto del batch.
    try {
      // Pieza D — reintento ARCA antes de clasificar. Un fallo de ARCA (no responde o CUIT
      // malo) devuelve { exitosa:false } SIN lanzar => no cuenta como error del cron; solo un
      // error real (DB) cae al catch. Si valida, `sincronizarTaller` ya dejó el taller ACTIVA
      // (datosReactivacion) => `continue` sin recordatorio ni inactivación esta corrida.
      if (!taller.verificadoAfip && taller.cuit) {
        reintentosArca++
        const rescate = await sincronizarTaller(taller.id, true)
        if (rescate.exitosa) {
          reactivacionesAuto++
          continue
        }
      }

      const accion = planificarAccionGracia(taller, ahora)
      if (accion === 'NADA') continue

      if (accion === 'RECORDATORIO') {
        const { diasRestantes } = clasificarGracia(taller, ahora)
        // Sellar ANTES de mandar (idempotencia): si el email falla, no se reintenta en la
        // próxima corrida — evita spam por reintentos. El copy es "estimulante", no crítico.
        await prisma.taller.update({
          where: { id: taller.id },
          data: { recordatorioCuitEnviadoAt: ahora },
        })
        if (email) {
          await sendEmail({
            to: email,
            ...buildRecordatorioCuitEmail({ nombreTaller: taller.nombre, diasRestantes }),
          })
        } else {
          sinEmail++
        }
        recordatorios++
      } else if (accion === 'INACTIVAR') {
        await prisma.taller.update({
          where: { id: taller.id },
          data: { estadoCuenta: 'INACTIVA', inactivadaAt: ahora },
        })
        if (email) {
          await sendEmail({
            to: email,
            ...buildCuentaInactivaEmail({ nombreTaller: taller.nombre }),
          })
        } else {
          sinEmail++
        }
        inactivaciones++
      }
    } catch (err) {
      errores++
      console.error('[CRON gracia-cuit] error en taller', taller.id, err)
    }
  }

  const resumen = {
    ok: true,
    evaluados: talleres.length,
    reintentosArca,
    reactivacionesAuto,
    recordatorios,
    inactivaciones,
    sinEmail,
    errores,
    at: ahora.toISOString(),
  }

  console.log('[CRON gracia-cuit]', JSON.stringify(resumen))
  logActividad('CRON_GRACIA_CUIT', null, resumen)

  return NextResponse.json(resumen)
}
