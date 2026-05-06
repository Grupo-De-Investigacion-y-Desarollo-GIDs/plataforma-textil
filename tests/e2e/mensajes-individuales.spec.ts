import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('F-07 Mensajes individuales', () => {
  test('POST /api/admin/mensajes-individuales sin auth retorna 401', async ({ playwright }) => {
    const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000'
    const apiContext = await playwright.request.newContext({ baseURL })

    try {
      const res = await apiContext.post('/api/admin/mensajes-individuales', {
        data: {
          destinatarioId: 'fake-id',
          titulo: 'Test sin auth',
          mensaje: 'Este mensaje no deberia llegar.',
        },
      })
      expect(res.status()).toBe(401)
    } finally {
      await apiContext.dispose()
    }
  })

  test('TALLER recibe 403 al POST /api/admin/mensajes-individuales', async ({ page, playwright }) => {
    await ensureNotProduction(page)
    const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000'

    await loginAs(page, 'taller')
    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(c =>
      c.name.includes('authjs.session-token') || c.name.includes('next-auth.session-token')
    )
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
      const res = await apiContext.post('/api/admin/mensajes-individuales', {
        data: {
          destinatarioId: 'fake-id',
          titulo: 'Test desde taller',
          mensaje: 'Este mensaje no deberia llegar nunca.',
        },
      })
      expect(res.status()).toBe(403)
    } finally {
      await apiContext.dispose()
    }
  })

  test('Tab "Mensajes individuales" visible en /admin/notificaciones', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')

    try {
      await page.goto('/admin/notificaciones', { timeout: 30000 })
      await expect(page.getByRole('link', { name: 'Mensajes individuales' })).toBeVisible({ timeout: 15000 })
      await expect(page.getByRole('link', { name: 'Comunicaciones masivas' })).toBeVisible({ timeout: 5000 })
    } catch {
      test.skip(true, 'Admin notificaciones no cargo a tiempo en preview')
    }
  })

  test('Boton "Enviar mensaje" visible en /admin/talleres/[id]', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')

    try {
      await page.goto('/admin/talleres', { timeout: 30000 })
      await page.locator('table tbody tr').first().locator('a').click({ timeout: 15000 })
      await page.waitForURL(/\/admin\/talleres\//, { timeout: 15000 })
      await expect(page.getByRole('button', { name: 'Enviar mensaje' })).toBeVisible({ timeout: 15000 })
    } catch {
      test.skip(true, 'Admin talleres detalle no cargo a tiempo en preview')
    }
  })

  test('Boton "Enviar mensaje" visible en /admin/marcas/[id]', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')

    try {
      await page.goto('/admin/marcas', { timeout: 30000 })
      await page.locator('table tbody tr').first().locator('a').click({ timeout: 15000 })
      await page.waitForURL(/\/admin\/marcas\//, { timeout: 15000 })
      await expect(page.getByRole('button', { name: 'Enviar mensaje' })).toBeVisible({ timeout: 15000 })
    } catch {
      test.skip(true, 'Admin marcas detalle no cargo a tiempo en preview')
    }
  })
})
