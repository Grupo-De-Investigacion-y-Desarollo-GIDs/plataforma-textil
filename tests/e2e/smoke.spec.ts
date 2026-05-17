import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('Smoke test — setup basico funciona', () => {
  test('Login como admin y ver pagina de logs', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')

    // Verificar que estamos en /admin (esperar redirect a dashboard si aplica)
    await expect(page).toHaveURL(/\/admin/)
    await page.waitForLoadState('load')

    // Navegar a /admin/logs (implementado en S-04)
    await page.goto('/admin/logs', { waitUntil: 'load' })

    // Verificar que la pagina de logs carga con la UI mejorada de S-04
    await expect(page.getByRole('heading', { name: 'Logs de Actividad' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Exportar CSV' })).toBeVisible()
  })

  test('Header app renderiza correctamente en dev/preview (I-01)', async ({ page }) => {
    await ensureNotProduction(page)

    // Verificar que el Header simplificado (X-05) carga correctamente
    await loginAs(page, 'taller')
    await expect(page).toHaveURL(/\/taller/)

    // El header debe mostrar tabs del taller (scoped al header) y boton de menu
    const header = page.locator('header')
    await expect(header.getByText('Mis pedidos')).toBeVisible()
    await expect(header.getByText('Mi perfil')).toBeVisible()
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
