import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('Smoke test — setup basico funciona', () => {
  test('Login como admin y ver pagina de logs', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')

    // Ir directo a /admin/logs sin doble navegacion
    // (patron identico a admin-no-regression.spec.ts que pasa 100%)
    await page.goto('/admin/logs')

    // Verificar que la pagina de logs carga
    await expect(page.locator('h1').first()).toContainText('Logs')
    await page.waitForSelector('table', { timeout: 10000 })
  })

  test('Header app renderiza correctamente en dev/preview (I-01)', async ({ page }) => {
    await ensureNotProduction(page)

    // Verificar que el Header simplificado (X-05) carga correctamente
    await loginAs(page, 'taller')
    await expect(page).toHaveURL(/\/taller/)

    // El header debe mostrar tabs del taller (scoped al header) y boton de menu
    const header = page.locator('header')
    await expect(header.getByText('Mis pedidos').first()).toBeVisible()
    await expect(header.getByText('Mi perfil').first()).toBeVisible()
    await expect(page.locator('button[aria-label="Abrir menú"]')).toBeVisible()
  })

  test('ensureNotProduction bloquea URL de produccion', async ({ page }) => {
    // Este test verifica que el safety guard funciona correctamente.
    // Guardamos y restauramos la env var para simular produccion.
    const originalUrl = process.env.TEST_BASE_URL
    try {
      process.env.TEST_BASE_URL = 'https://plataforma-textil.vercel.app'
      await expect(async () => {
        await ensureNotProduction(page)
      }).rejects.toThrow('REFUSED')
    } finally {
      process.env.TEST_BASE_URL = originalUrl
    }
  })
})
