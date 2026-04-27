import { Redis } from '@upstash/redis'

/**
 * Limpia keys de rate limiting por patron con timeout de 5 segundos.
 * Si Redis no responde a tiempo, continua sin error (cleanup best-effort).
 *
 * Usa SCAN en lugar de KEYS para ser safe con DBs grandes.
 */
export async function limpiarRateLimit(pattern: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return

  const redis = new Redis({ url, token })

  const cleanup = async () => {
    let cursor: string | number = 0
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 })
      cursor = nextCursor
      if (keys.length > 0) await redis.del(...keys)
    } while (cursor !== 0 && cursor !== '0')
  }

  const timeout = new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error('Redis cleanup timeout (5s)')), 5000)
  )

  try {
    await Promise.race([cleanup(), timeout])
  } catch {
    // Cleanup best-effort — si falla, el test continua
  }
}
