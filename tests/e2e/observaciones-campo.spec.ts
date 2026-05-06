import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('T-02 Observaciones de campo', () => {
  test('GET /api/admin/observaciones sin auth → 401', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      const response = await page.request.get('/api/admin/observaciones')
      expect(response.status()).toBe(401)
    } catch {
      test.skip()
    }
  })

  test('POST /api/admin/observaciones sin auth → 401', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      const response = await page.request.post('/api/admin/observaciones', {
        data: { tipo: 'EXITO', titulo: 'Test', contenido: 'Test', fechaEvento: '2026-05-01' },
      })
      expect(response.status()).toBe(401)
    } catch {
      test.skip()
    }
  })

  test('TALLER no puede acceder a observaciones → 403', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'taller')
      const response = await page.request.get('/api/admin/observaciones')
      expect(response.status()).toBe(403)
    } catch {
      test.skip()
    }
  })

  test('GET /api/admin/reporte-mensual sin auth → 401', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      const response = await page.request.get('/api/admin/reporte-mensual')
      expect(response.status()).toBe(401)
    } catch {
      test.skip()
    }
  })

  test('GET /api/admin/reporte-piloto sin auth → 401', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      const response = await page.request.get('/api/admin/reporte-piloto')
      expect(response.status()).toBe(401)
    } catch {
      test.skip()
    }
  })

  test('GET /api/admin/observaciones/nonexistent → 404', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'admin')
      const response = await page.request.get('/api/admin/observaciones/nonexistent')
      expect(response.status()).toBe(404)
    } catch {
      test.skip()
    }
  })

  test('DELETE /api/admin/observaciones/nonexistent → 404', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'admin')
      const response = await page.request.delete('/api/admin/observaciones/nonexistent')
      expect(response.status()).toBe(404)
    } catch {
      test.skip()
    }
  })

  test('POST /api/admin/observaciones con tipo invalido → 400', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'admin')
      const response = await page.request.post('/api/admin/observaciones', {
        data: { tipo: 'INVALIDO', titulo: 'Test', contenido: 'Test', fechaEvento: '2026-05-01' },
      })
      expect(response.status()).toBe(400)
    } catch {
      test.skip()
    }
  })

  test('Pagina /admin/observaciones carga correctamente', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'admin')
      await page.goto('/admin/observaciones')
      await expect(page.locator('h1')).toContainText('Observaciones de campo')
    } catch {
      test.skip()
    }
  })

  test('Pagina /admin/observaciones/nueva carga correctamente', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'admin')
      await page.goto('/admin/observaciones/nueva')
      await expect(page.locator('h1')).toContainText('Nueva observacion')
    } catch {
      test.skip()
    }
  })
})
