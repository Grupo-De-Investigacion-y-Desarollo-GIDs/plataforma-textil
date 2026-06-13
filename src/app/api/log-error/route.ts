import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { logearError } from '@/compartido/lib/error-logger'
import { rateLimit, getClientIp } from '@/compartido/lib/ratelimit'

export async function POST(req: NextRequest) {
  try {
    // K (§4.3): rate-limit por IP — endpoint anonimo, evita flood de logs.
    const blocked = await rateLimit(req, 'logError', getClientIp(req))
    if (blocked) return blocked

    const session = await auth()
    const body = await req.json()

    logearError(
      new Error(body.mensaje ?? 'Unknown error'),
      {
        contexto: body.contexto ?? 'publico',
        ruta: body.ruta,
        userId: session?.user?.id,
        digest: body.digest,
      }
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
