import { handlers } from '@/compartido/lib/auth'
import { NextRequest } from 'next/server'
import { rateLimit, getClientIp } from '@/compartido/lib/ratelimit'

// GET no cambia — NextAuth lo maneja como siempre
export const GET = handlers.GET

// POST wrapeado para rate limiting en login y magic links
export async function POST(req: NextRequest) {
  const path = req.nextUrl.pathname
  const ip = getClientIp(req)

  if (path === '/api/auth/callback/credentials') {
    const blocked = await rateLimit(req, 'login', ip)
    if (blocked) return blocked
  }

  if (path === '/api/auth/signin/email') {
    const blocked = await rateLimit(req, 'magicLink', ip)
    if (blocked) return blocked
  }

  return handlers.POST(req)
}
