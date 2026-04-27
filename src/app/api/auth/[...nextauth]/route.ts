import { handlers } from '@/compartido/lib/auth'
import { NextRequest } from 'next/server'
import { rateLimit, getClientIp } from '@/compartido/lib/ratelimit'

// GET no cambia — NextAuth lo maneja como siempre
export const GET = handlers.GET

// POST wrapeado para rate limiting en login
export async function POST(req: NextRequest) {
  if (req.nextUrl.pathname === '/api/auth/callback/credentials') {
    const ip = getClientIp(req)
    const blocked = await rateLimit(req, 'login', ip)
    if (blocked) return blocked
  }
  return handlers.POST(req)
}
