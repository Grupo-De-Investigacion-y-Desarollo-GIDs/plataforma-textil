import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import { logActividad } from './log'

// Si Redis no esta configurado, rateLimit() falla abierto (permite todo)
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null

// Prefijo por ambiente para que dev y prod no compartan contadores
const env = process.env.VERCEL_ENV ?? 'development'

// analytics: false — ahorra 33% de comandos Redis (3→2 por call).
// Los bloqueos ya se registran con logActividad en la DB.
function crearLimiters() {
  if (!redis) return null
  return {
    login: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: false,
      prefix: `rl:${env}:login`,
    }),
    verificarCuit: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: false,
      prefix: `rl:${env}:cuit`,
    }),
    cotizaciones: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      analytics: false,
      prefix: `rl:${env}:cot`,
    }),
    pedidos: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: false,
      prefix: `rl:${env}:ped`,
    }),
    denuncias: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: false,
      prefix: `rl:${env}:den`,
    }),
    feedback: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '15 m'),
      analytics: false,
      prefix: `rl:${env}:fb`,
    }),
    upload: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      analytics: false,
      prefix: `rl:${env}:upl`,
    }),
    registro: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: false,
      prefix: `rl:${env}:reg`,
    }),
    magicLink: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: false,
      prefix: `rl:${env}:magic`,
    }),
    chat: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 h'),
      analytics: false,
      prefix: `rl:${env}:chat`,
    }),
  } as const
}

const limiters = crearLimiters()

export type LimiterKey = keyof NonNullable<typeof limiters>

/**
 * Obtiene la IP del cliente. Prioriza x-real-ip (seteado por Vercel edge,
 * un solo valor confiable) sobre x-forwarded-for (puede contener cadena
 * de proxies: "client, proxy1, proxy2").
 */
export function getClientIp(req: NextRequest): string {
  return req.headers.get('x-real-ip')
    ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? '127.0.0.1'
}

/**
 * Aplica rate limiting a una request.
 * Retorna NextResponse con 429 si se excede el limite, null si pasa.
 *
 * Si Redis no esta configurado o esta caido, falla abierto (permite la
 * request) para no romper la plataforma.
 */
export async function rateLimit(
  req: NextRequest,
  limiterKey: LimiterKey,
  identifier: string
): Promise<NextResponse | null> {
  if (!limiters) return null

  try {
    const limiter = limiters[limiterKey]
    const { success, limit, remaining, reset } = await limiter.limit(identifier)

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)

      logActividad('RATE_LIMIT_EXCEEDED', null, {
        endpoint: limiterKey,
        identifier,
        limit,
        resetAt: new Date(reset).toISOString(),
      })

      return NextResponse.json(
        {
          error: 'Demasiadas solicitudes',
          message: `Espera ${retryAfter} segundos antes de intentar de nuevo.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(reset),
          },
        }
      )
    }

    return null
  } catch (error) {
    // Redis caido → fail open (permitir la request)
    console.error('Rate limit error (failing open):', error)
    return null
  }
}
