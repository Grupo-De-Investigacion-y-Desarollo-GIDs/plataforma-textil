import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('Smoke test — setup basico funciona', () => {
  test('Login como admin y ver pagina de logs', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')

    // Verificar que estamos en /admin
    await expect(page).toHaveURL(/\/admin/)

    // Navegar a /admin/logs (implementado en S-04)
    await page.goto('/admin/logs')

    // Verificar que la pagina de logs carga con la UI mejorada de S-04
    await expect(page.getByRole('heading', { name: 'Logs de Actividad' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Exportar CSV' })).toBeVisible()
  })

  test('Banner de ambiente visible en dev/preview (I-01)', async ({ page }) => {
    await ensureNotProduction(page)

    await page.goto('/login')

    // En dev/preview, el banner de ambiente debe ser visible
    // En localhost (VERCEL_ENV undefined) el banner NO aparece (por diseño)
    const baseUrl = process.env.TEST_BASE_URL ?? 'http://localhost:3000'
    if (baseUrl.includes('vercel.app')) {
      await expect(page.getByText('AMBIENTE DE PRUEBAS')).toBeVisible()
    }
    // En localhost, verificamos que la pagina de login carga correctamente
    await expect(page.getByText('Ingresar')).toBeVisible()
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
