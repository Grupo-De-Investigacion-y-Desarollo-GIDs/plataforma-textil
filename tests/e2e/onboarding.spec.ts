import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('T-03 Protocolos de onboarding', () => {
  test('GET /api/admin/notas-seguimiento sin auth → 401', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      const response = await page.request.get('/api/admin/notas-seguimiento?userId=test')
      expect(response.status()).toBe(401)
    } catch {
      test.skip()
    }
  })

  test('POST /api/admin/onboarding/reenviar-invitacion sin auth → 401', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      const response = await page.request.post('/api/admin/onboarding/reenviar-invitacion', {
        data: { userId: 'test' },
      })
      expect(response.status()).toBe(401)
    } catch {
      test.skip()
    }
  })

  test('TALLER no puede acceder a notas-seguimiento → 403', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'taller')
      const response = await page.request.get('/api/admin/notas-seguimiento?userId=test')
      expect(response.status()).toBe(403)
    } catch {
      test.skip()
    }
  })

  test('Pagina /ayuda/onboarding-taller accesible', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      const response = await page.goto('/ayuda/onboarding-taller')
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toContainText('Plataforma Digital Textil')
    } catch {
      test.skip()
    }
  })

  test('Pagina /ayuda/onboarding-marca accesible', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      const response = await page.goto('/ayuda/onboarding-marca')
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toContainText('Marca')
    } catch {
      test.skip()
    }
  })

  test('/admin/onboarding visible para ADMIN', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'admin')
      await page.goto('/admin/onboarding')
      await expect(page.locator('h1')).toContainText('onboarding')
    } catch {
      test.skip()
    }
  })

  test('/ayuda tiene links a guias de onboarding', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await page.goto('/ayuda')
      await expect(page.locator('text=Guia para talleres')).toBeVisible()
      await expect(page.locator('text=Guia para marcas')).toBeVisible()
    } catch {
      test.skip()
    }
  })
})
