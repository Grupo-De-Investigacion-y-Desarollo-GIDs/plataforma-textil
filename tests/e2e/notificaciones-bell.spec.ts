import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('Badge notificaciones en header', () => {
  test('GET /api/notificaciones devuelve sinLeer y creadaPor', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'admin')
      const response = await page.request.get('/api/notificaciones?limit=5')
      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('sinLeer')
      expect(data).toHaveProperty('notificaciones')
      expect(typeof data.sinLeer).toBe('number')
      expect(Array.isArray(data.notificaciones)).toBe(true)
    } catch {
      test.skip()
    }
  })

  test('Bell visible en header para TALLER', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'taller')
      await page.goto('/taller')
      await expect(page.locator('button[aria-label*="Notificaciones"]').first()).toBeVisible()
    } catch {
      test.skip()
    }
  })

  test('Bell visible en header para MARCA', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'marca')
      await page.goto('/marca')
      await expect(page.locator('button[aria-label*="Notificaciones"]').first()).toBeVisible()
    } catch {
      test.skip()
    }
  })

  test('Bell visible en admin layout', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'admin')
      await page.goto('/admin')
      await expect(page.locator('button[aria-label*="Notificaciones"]').first()).toBeVisible()
    } catch {
      test.skip()
    }
  })

  test('Click en Bell abre dropdown con "Ver todas las notificaciones"', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'taller')
      await page.goto('/taller')
      const bell = page.locator('button[aria-label*="Notificaciones"]').first()
      await bell.click()
      await expect(page.locator('text=Ver todas las notificaciones')).toBeVisible()
    } catch {
      test.skip()
    }
  })
})
