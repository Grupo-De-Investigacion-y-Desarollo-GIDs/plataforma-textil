import { Redis } from '@upstash/redis'

/**
 * Limpia keys de rate limiting por patron.
 *
 * Usa SCAN en lugar de KEYS para ser safe con DBs grandes.
 * El patron soporta wildcards de Redis (ej: rl:*:fb:*).
 */
export async function limpiarRateLimit(pattern: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return

  const redis = new Redis({ url, token })
  let cursor = 0
  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 })
    cursor = nextCursor
    if (keys.length > 0) await redis.del(...keys)
  } while (cursor !== 0)
}
