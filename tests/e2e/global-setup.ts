import { limpiarRateLimit } from './_helpers/redis-cleanup'

/**
 * Limpia todas las keys de rate limiting antes de correr los tests.
 * Evita que runs consecutivos de CI se contaminen entre si
 * (comparten IP del runner de GitHub Actions).
 */
export default async function globalSetup() {
  if (!process.env.UPSTASH_REDIS_REST_URL) return
  await limpiarRateLimit('rl:*')
}
