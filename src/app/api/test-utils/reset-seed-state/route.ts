import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { isTestMutationAllowed } from '@/compartido/lib/ratelimit'

// Endpoint SOLO-CI — resetea UN usuario mutable del seed a su estado inicial.
//
// Varios e2e del bloque U mutan usuarios de forma permanente en DEV y, sin
// cleanup, la 2da corrida falla por el residuo (deuda T-05):
//   - u-09: convierte a u09.test de single-rol a multi-rol (le crea un perfil
//     MARCA). En la 2da corrida POST /me/roles da 409 y la card "Agregar rol"
//     no reaparece.
//   - u-04: el test de persistencia cambia el activeMode de julieta a MARCA y
//     no lo restaura. Como DEV persiste entre runs, el siguiente login de
//     julieta arranca en /marca y rompe las aserciones que esperan /taller.
//
// SEGURIDAD: el target NO es un userId/email arbitrario del request, sino una
// CLAVE de un allowlist cerrado (?user=u09|julieta) que mapea a un email
// hardcodeado. Una clave desconocida → 400 (no resetea nada). El llamante no
// puede elegir una cuenta arbitraria como objetivo.
//
// AISLAMIENTO: cada spec resetea SOLO su propio usuario. Con e2e en
// fullyParallel (2 workers), un reset que tocara a AMBOS usuarios haría que el
// afterEach de u-04 pisara a u09 en pleno test de u-09 (y viceversa) → falsos
// fallos. Por eso el reset es por-usuario.
//
// Doble guard: prod explícito + isTestMutationAllowed (B-04: guard DEDICADO para
// mutaciones de test, separado de isCiBypass/rate-limit; CI_BYPASS_TOKEN + header
// x-ci-bypass + VERCEL_ENV != production). Sin permiso válido devuelve 404 (no
// revela la ruta). El runner de e2e no tiene DATABASE_URL (no hay acceso directo a
// DB), por eso el cleanup va por API server-side.
const ALLOWLIST = {
  u09: 'u09.test@pdt.org.ar',
  julieta: 'julieta.benitez@pdt.org.ar',
} as const

type UserKey = keyof typeof ALLOWLIST

export async function POST(req: NextRequest) {
  // Defense-in-depth: guard de prod explícito ANTES de isCiBypass. Si alguien
  // relaja isCiBypass por motivos de rate-limit, este endpoint mutante sigue
  // bloqueado en prod. Solo VERCEL_ENV: en deploys de Vercel (incl. PREVIEW)
  // NODE_ENV es SIEMPRE 'production' (Vercel buildea Next en modo prod), así
  // que chequear NODE_ENV bloquearía el endpoint en preview —que es justo donde
  // corre el e2e—. VERCEL_ENV sí distingue preview ('preview') de prod
  // ('production'), igual que isCiBypass.
  if (process.env.VERCEL_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (!isTestMutationAllowed(req)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const key = req.nextUrl.searchParams.get('user')
  if (!key || !(key in ALLOWLIST)) {
    return NextResponse.json(
      { error: 'Bad request', detail: 'user debe ser uno de: u09, julieta' },
      { status: 400 }
    )
  }
  const email = ALLOWLIST[key as UserKey]

  if (key === 'u09') {
    // u09.test → single-rol TALLER (estado del seed, pre-U09).
    const u09 = await prisma.user.findUnique({
      where: { email },
      select: { id: true, marca: { select: { id: true } } },
    })
    if (!u09) return NextResponse.json({ ok: true, noop: true, user: key })
    await prisma.$transaction(async (tx) => {
      // La MARCA creada por el test es fresca (sin pedidos/notas); borrarla quita
      // el guard yaPoseeEntidad para que la próxima corrida vuelva a ver "Agregar rol".
      if (u09.marca) {
        await tx.marca.delete({ where: { id: u09.marca.id } })
      }
      // Estado del seed POST-U-05: single-rol TALLER con el invariante sincronizado
      // en DB (roles=[TALLER], activeMode=TALLER), NO roles=[]/null. U-05 cerró la
      // fuente: el seed ya no produce roles=[] para u09, así que el reset tampoco debe
      // re-introducir ese estado (sigue siendo single-rol → "Agregar rol" reaparece).
      await tx.user.update({
        where: { id: u09.id },
        data: { roles: { set: ['TALLER'] }, activeMode: 'TALLER', role: 'TALLER' },
      })
    })
    return NextResponse.json({ ok: true, user: key })
  }

  // key === 'julieta' → dual con activeMode TALLER (estado del seed). NO se tocan
  // sus entidades (Taller La Hormiga + Marca Benítez son parte de su seed) ni sus
  // pedidos (OM-2026-DUAL1 PUBLICADO + OM-2026-DUAL2 BORRADOR, usados por el
  // anti-incesto de U-08): este reset SOLO hace user.update, así que ambos pedidos
  // sobreviven intactos entre corridas. Solo se restaura el activeMode/role que
  // u-04 muta. roles queda [TALLER, MARCA].
  const julieta = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })
  if (!julieta) return NextResponse.json({ ok: true, noop: true, user: key })
  await prisma.user.update({
    where: { id: julieta.id },
    data: { roles: { set: ['TALLER', 'MARCA'] }, activeMode: 'TALLER', role: 'TALLER' },
  })
  return NextResponse.json({ ok: true, user: key })
}
