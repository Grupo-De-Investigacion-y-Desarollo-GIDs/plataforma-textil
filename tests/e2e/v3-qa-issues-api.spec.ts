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

test.describe('API /api/feedback/all-qa-v3 — endpoint agregado', () => {
  test('GET retorna 200 con estructura { counts, global, lastUpdated }', async ({ page, request }) => {
    await ensureNotProduction(page)
    const res = await request.get('/api/feedback/all-qa-v3')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('counts')
    expect(data).toHaveProperty('global')
    expect(data).toHaveProperty('lastUpdated')
    expect(typeof data.counts).toBe('object')
    expect(data.global).toHaveProperty('open')
    expect(data.global).toHaveProperty('closed')
    expect(data.global).toHaveProperty('total')
    expect(data.global).toHaveProperty('porVerificador')
    expect(data.global).toHaveProperty('porPerfil')
  })

  test('OPTIONS preflight retorna 204 con CORS', async ({ page, request }) => {
    await ensureNotProduction(page)
    const res = await request.fetch('/api/feedback/all-qa-v3', {
      method: 'OPTIONS',
    })
    expect(res.status()).toBe(204)
  })
})
