import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { isCiBypass } from '@/compartido/lib/ratelimit'

// Endpoint SOLO-CI — resetea u09.test a single-rol TALLER (estado del seed).
//
// El e2e u-09 muta a u09.test de single-rol a multi-rol (le crea un perfil MARCA)
// de forma permanente. Sin reset, el test pasa la 1ra corrida y falla la 2da: el
// guard de POST /api/usuarios/me/roles devuelve 409 (ya posee MARCA) y la card
// "Agregar rol" no reaparece (deuda T-05). El afterEach del spec llama a este
// endpoint para devolverlo al estado del seed → test idempotente.
//
// Triple guard via isCiBypass: exige CI_BYPASS_TOKEN configurado + header
// x-ci-bypass coincidente + VERCEL_ENV != production. Sin bypass válido devuelve
// 404 (no revela que la ruta existe). El runner de e2e no tiene acceso directo a
// la DB (no hay DATABASE_URL en e2e.yml), por eso el cleanup va por API server-side.
const U09_EMAIL = 'u09.test@pdt.org.ar'

export async function POST(req: NextRequest) {
  // Defense-in-depth: guard de prod explícito ANTES de isCiBypass. Si alguien
  // relaja isCiBypass por motivos de rate-limit, este endpoint mutante sigue
  // bloqueado en prod. Cubre además el caso no-Vercel (VERCEL_ENV ausente) vía
  // NODE_ENV. Ver deuda B-04 (isCiBypass con doble responsabilidad).
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (!isCiBypass(req)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const user = await prisma.user.findUnique({
    where: { email: U09_EMAIL },
    select: { id: true, marca: { select: { id: true } } },
  })
  if (!user) return NextResponse.json({ ok: true, noop: true })

  await prisma.$transaction(async (tx) => {
    // La MARCA creada por el test es fresca (sin pedidos/notas); borrarla quita el
    // guard yaPoseeEntidad para que la próxima corrida vuelva a ver "Agregar rol".
    if (user.marca) {
      await tx.marca.delete({ where: { id: user.marca.id } })
    }
    // Volver al estado exacto del seed: single-rol pre-U04 (roles=[] normalizado a
    // [role] por rolesEfectivos), activeMode null, role TALLER.
    await tx.user.update({
      where: { id: user.id },
      data: { roles: { set: [] }, activeMode: null, role: 'TALLER' },
    })
  })

  return NextResponse.json({ ok: true })
}
