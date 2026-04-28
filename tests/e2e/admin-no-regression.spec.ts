import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('D-01 Admin no-regression — verificar que ADMIN no se rompio', () => {
  test('ADMIN puede acceder a /admin/talleres/[id] sin error', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')
    await page.goto('/admin/talleres')
    await expect(page.locator('h1')).toContainText('Talleres')
    // Click en el primer taller
    const firstRow = page.locator('table tbody tr, [data-testid="data-table"] tbody tr').first()
    const link = firstRow.locator('a').first()
    if (await link.isVisible()) {
      await link.click()
      await page.waitForURL(/\/admin\/talleres\//)
      // Debe ver banner que redirige a vista ESTADO
      await expect(page.locator('text=formalizacion')).toBeVisible()
      // NO debe ver tab Formalizacion (fue movido a ESTADO)
      await expect(page.getByRole('link', { name: 'Formalizacion' })).not.toBeVisible()
    }
  })

  test('ADMIN /admin/documentos devuelve 404 (mudada a ESTADO)', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')
    const response = await page.goto('/admin/documentos')
    // Next.js devuelve 404 o muestra pagina de error
    if (response) {
      expect(response.status()).toBe(404)
    }
  })

  test('ADMIN puede ver /admin/logs con acciones ESTADO', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')
    await page.goto('/admin/logs')
    await expect(page.locator('h1')).toContainText('Logs')
    // La tabla debe cargar sin error
    await page.waitForSelector('table', { timeout: 10000 })
  })

  test('ADMIN puede acceder a /estado/talleres (lectura)', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')
    await page.goto('/estado/talleres')
    // No debe redirigir a unauthorized
    await expect(page).not.toHaveURL(/\/unauthorized/)
    await expect(page.locator('h1')).toContainText('Talleres')
  })

  test('ADMIN GET /api/tipos-documento sigue funcionando', async ({ page, playwright }) => {
    await ensureNotProduction(page)
    const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000'

    await loginAs(page, 'admin')
    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(c => c.name.includes('authjs.session-token') || c.name.includes('next-auth.session-token'))
    if (!sessionCookie) {
      test.skip(true, 'No se pudo obtener cookie de sesion')
      return
    }

    const apiContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: {
        Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
      },
    })

    try {
      const res = await apiContext.get('/api/tipos-documento')
      expect(res.status()).toBe(200)
      const body = await res.json()
      expect(Array.isArray(body)).toBe(true)
    } finally {
      await apiContext.dispose()
    }
  })
})
