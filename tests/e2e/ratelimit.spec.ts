import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'
import { limpiarRateLimit } from './_helpers/redis-cleanup'

// Limpiar todos los ambientes para evitar contaminacion entre tests
const FB_CLEANUP = 'rl:*:fb:*'
const LOGIN_CLEANUP = 'rl:*:login:*'

test.describe.serial('Rate limiting — S-02', () => {
  // Limpiar antes de la suite para que el login no este rate-limited
  test.beforeAll(async () => {
    if (!process.env.UPSTASH_REDIS_REST_URL) return
    await limpiarRateLimit(LOGIN_CLEANUP)
    await limpiarRateLimit(FB_CLEANUP)
  })

  test.afterAll(async () => {
    if (!process.env.UPSTASH_REDIS_REST_URL) return
    await limpiarRateLimit(FB_CLEANUP)
  })

  test('login funciona despues del wrapper de rate limit', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')
    expect(page.url()).toContain('/admin')
  })

  test('11 POSTs a /api/feedback retorna 429 con Retry-After', async ({ page, request }) => {
    await ensureNotProduction(page)
    test.skip(!process.env.UPSTASH_REDIS_REST_URL, 'Requiere UPSTASH_REDIS_REST_URL')

    // Limpiar rate limit previo
    await limpiarRateLimit(FB_CLEANUP)

    // Enviar 11 requests con body invalido (no crea issues reales)
    // Rate limit se evalua ANTES de validar body
    let lastStatus = 0
    let retryAfter = ''
    let bodyText = ''

    for (let i = 0; i < 11; i++) {
      const res = await request.post('/api/feedback', {
        data: { invalid: true },
      })
      lastStatus = res.status()
      if (lastStatus === 429) {
        retryAfter = res.headers()['retry-after'] || ''
        bodyText = await res.text()
        break
      }
    }

    expect(lastStatus).toBe(429)
    expect(retryAfter).toBeTruthy()
    expect(parseInt(retryAfter)).toBeGreaterThan(0)
    expect(bodyText).toContain('Demasiadas solicitudes')

    // Cleanup inmediato
    await limpiarRateLimit(FB_CLEANUP)
  })

  test('despues del cleanup el rate limit se resetea', async ({ page, request }) => {
    await ensureNotProduction(page)
    test.skip(!process.env.UPSTASH_REDIS_REST_URL, 'Requiere UPSTASH_REDIS_REST_URL')

    // Limpiar cualquier residual
    await limpiarRateLimit(FB_CLEANUP)

    // Una request debe pasar (no 429)
    const res = await request.post('/api/feedback', {
      data: { invalid: true },
    })

    expect(res.status()).not.toBe(429)
  })
})
