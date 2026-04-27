import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'
import { limpiarRateLimit } from './_helpers/redis-cleanup'

// Timeout mayor para tests que hacen multiples requests + cleanup Redis
test.describe('Rate limiting — S-02', () => {
  test('login funciona despues del wrapper de rate limit', async ({ page }) => {
    await ensureNotProduction(page)
    // Limpiar login keys acumuladas de runs anteriores de CI
    await limpiarRateLimit('rl:*:login:*')
    await loginAs(page, 'admin')
    expect(page.url()).toContain('/admin')
  })

  test('feedback rate limit retorna 429 despues de 10 requests', async ({ page, request }) => {
    test.setTimeout(60000) // 60s para 11 requests + cleanup
    await ensureNotProduction(page)
    test.skip(!process.env.UPSTASH_REDIS_REST_URL, 'Requiere UPSTASH_REDIS_REST_URL')

    await limpiarRateLimit('rl:*:fb:*')
    await limpiarRateLimit('rl:*:login:*') // No contaminar login de otros tests

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

    await limpiarRateLimit('rl:*:fb:*')
  })

  test('magic link rate limit retorna 429 despues de 5 requests', async ({ page, request }) => {
    test.setTimeout(60000)
    await ensureNotProduction(page)
    test.skip(!process.env.UPSTASH_REDIS_REST_URL, 'Requiere UPSTASH_REDIS_REST_URL')

    await limpiarRateLimit('rl:*:magic:*')
    await limpiarRateLimit('rl:*:login:*')

    let lastStatus = 0
    let retryAfter = ''

    for (let i = 0; i < 6; i++) {
      const res = await request.post('/api/auth/signin/email', {
        data: { email: 'test-ratelimit@example.com', csrfToken: 'fake' },
      })
      lastStatus = res.status()
      if (lastStatus === 429) {
        retryAfter = res.headers()['retry-after'] || ''
        break
      }
    }

    expect(lastStatus).toBe(429)
    expect(retryAfter).toBeTruthy()

    await limpiarRateLimit('rl:*:magic:*')
  })
})
