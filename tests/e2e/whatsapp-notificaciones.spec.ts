import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

async function loginEstado(page: import('@playwright/test').Page) {
  try {
    await loginAs(page, 'estado')
  } catch {
    test.skip(true, 'ESTADO login failed')
  }
}

test.describe('F-02 WhatsApp notificaciones', () => {
  test('Magic link invalido redirige a /login con error', async ({ page }) => {
    await ensureNotProduction(page)
    await page.goto('/n/token_invalido_que_no_existe')
    await page.waitForLoadState('domcontentloaded')

    // Debe redirigir a login con parametro de error
    expect(page.url()).toContain('/login')
    expect(page.url()).toContain('error=link_invalido')
  })

  test('/cuenta muestra formulario de WhatsApp', async ({ page }) => {
    await ensureNotProduction(page)
    try {
      await loginAs(page, 'taller')
    } catch {
      test.skip(true, 'TALLER login failed')
      return
    }

    await page.goto('/cuenta')
    await page.waitForLoadState('domcontentloaded')

    // Verificar que el formulario de WhatsApp esta visible
    await expect(page.getByText('Notificaciones WhatsApp')).toBeVisible({ timeout: 30000 })
  })

  test('Registro muestra campo Telefono WhatsApp', async ({ page }) => {
    await ensureNotProduction(page)
    await page.goto('/registro')
    await page.waitForLoadState('domcontentloaded')

    // Verificar que el campo de telefono tiene la nueva etiqueta
    await expect(page.getByText('Telefono WhatsApp')).toBeVisible({ timeout: 30000 })
    await expect(page.getByText('avisos importantes por WhatsApp')).toBeVisible()
  })

  test('API /api/admin/whatsapp requiere auth', async ({ page, playwright }) => {
    await ensureNotProduction(page)
    const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000'
    const apiContext = await playwright.request.newContext({ baseURL })
    try {
      const res = await apiContext.get('/api/admin/whatsapp')
      expect(res.status()).toBe(401)
    } finally {
      await apiContext.dispose()
    }
  })

  test('API /api/cuenta requiere auth', async ({ page, playwright }) => {
    await ensureNotProduction(page)
    const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000'
    const apiContext = await playwright.request.newContext({ baseURL })
    try {
      const res = await apiContext.put('/api/cuenta', {
        data: { phone: '1123456789' },
      })
      expect(res.status()).toBe(401)
    } finally {
      await apiContext.dispose()
    }
  })
})
