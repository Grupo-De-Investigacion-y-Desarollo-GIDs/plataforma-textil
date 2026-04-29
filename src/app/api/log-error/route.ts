import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { logearError } from '@/compartido/lib/error-logger'

export async function POST(req: NextRequest) {
  try {
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
