import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'

test.describe('API /api/feedback/by-qa — endpoints reales', () => {
  test('slug inexistente retorna 200 con issues vacio', async ({ page, request }) => {
    await ensureNotProduction(page)
    const res = await request.get('/api/feedback/by-qa/QA_v3-inexistente-test')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('issues')
    expect(Array.isArray(data.issues)).toBe(true)
    expect(data).toHaveProperty('lastUpdated')
  })

  test('OPTIONS preflight retorna 204', async ({ page, request }) => {
    await ensureNotProduction(page)
    const res = await request.fetch('/api/feedback/by-qa/QA_v3-test', {
      method: 'OPTIONS',
    })
    expect(res.status()).toBe(204)
  })

  test('slug real retorna estructura esperada', async ({ page, request }) => {
    await ensureNotProduction(page)
    const res = await request.get('/api/feedback/by-qa/QA_v3-logs-admin-auditoria')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('issues')
    expect(Array.isArray(data.issues)).toBe(true)
    expect(data).toHaveProperty('lastUpdated')
    // Si hay issues, verificar que tienen la estructura correcta
    if (data.issues.length > 0) {
      const issue = data.issues[0]
      expect(issue).toHaveProperty('number')
      expect(issue).toHaveProperty('title')
      expect(issue).toHaveProperty('state')
      expect(issue).toHaveProperty('url')
      expect(issue).toHaveProperty('labels')
    }
  })
})
