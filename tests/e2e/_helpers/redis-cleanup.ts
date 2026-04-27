import { Redis } from '@upstash/redis'

/**
 * Limpia keys de rate limiting por patron.
 *
 * NOTA: KEYS es seguro aca porque la DB de tests es chica.
 * Si la DB crece, migrar a SCAN.
 */
export async function limpiarRateLimit(pattern: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return

  const redis = new Redis({ url, token })
  const keys = await redis.keys(pattern)
  if (keys.length > 0) await redis.del(...keys)
}
