import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('Paginas 404 — Not Found', () => {
  test('Ruta inexistente global muestra 404', async ({ page }) => {
    await ensureNotProduction(page)

    // Login necesario: middleware redirige a /login para rutas no-publicas sin sesion
    await loginAs(page, 'admin')

    await page.goto('/ruta-inexistente-e2e-test')
    await expect(page.getByText('Pagina no encontrada')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Volver al inicio')).toBeVisible()
  })

  test('Ruta inexistente en /admin muestra 404 con contexto admin', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')

    await page.goto('/admin/ruta-inexistente-e2e-test')
    await expect(page.getByText('Pagina no encontrada')).toBeVisible({ timeout: 10000 })

    const volverBtn = page.getByRole('link', { name: 'Volver al inicio' })
    await expect(volverBtn).toBeVisible()
    await volverBtn.click()
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })
  })

  test('Ruta inexistente en /taller muestra 404', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'taller')

    await page.goto('/taller/ruta-inexistente-e2e-test')
    await expect(page.getByText('Pagina no encontrada')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Volver al inicio')).toBeVisible()
  })

  test('Ruta inexistente en /marca muestra 404', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'marca')

    await page.goto('/marca/ruta-inexistente-e2e-test')
    await expect(page.getByText('Pagina no encontrada')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Volver al inicio')).toBeVisible()
  })
})
