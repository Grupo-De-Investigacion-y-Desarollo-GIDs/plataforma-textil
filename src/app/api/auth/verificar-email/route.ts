import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/compartido/lib/prisma'
import { rateLimit, getClientIp } from '@/compartido/lib/ratelimit'

// GET /api/auth/verificar-email?email=user@example.com
// No requiere autenticacion — se usa durante el registro (on blur / on step transition)
export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const blocked = await rateLimit(req, 'verificarEmail', ip)
  if (blocked) return blocked

  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ disponible: false }, { status: 400 })
  }

  const exists = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  return NextResponse.json({ disponible: !exists })
}
