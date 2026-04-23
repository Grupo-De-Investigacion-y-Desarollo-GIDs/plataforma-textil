import { test, expect } from '@playwright/test'
import { loginAs, assertAccesoBloqueado } from './helpers/auth'

test.describe('Sec 7: MARKETPLACE', () => {
  test('7.1 Marca: /marca/pedidos muestra pedidos', async ({ page }) => {
    await loginAs(page, 'marca')
    await page.goto('/marca/pedidos')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toContainText(/pedido|orden/i, { timeout: 10000 })
  })

  test('7.2 Marca: pedido BORRADOR tiene boton Publicar', async ({ page }) => {
    await loginAs(page, 'marca')
    await page.goto('/marca/pedidos')
    await page.waitForLoadState('networkidle')
    // Click en un pedido con estado BORRADOR
    const borrador = page.getByText(/borrador/i).first()
    if (await borrador.isVisible()) {
      const row = borrador.locator('..')
      const link = row.getByRole('link').first()
      if (await link.isVisible()) {
        await link.click()
        await page.waitForLoadState('networkidle')
        await expect(page.getByText(/publicar/i).first()).toBeVisible({ timeout: 10000 })
      }
    }
  })

  test('7.3 Marca: pedido PUBLICADO muestra cotizaciones', async ({ page }) => {
    await loginAs(page, 'marca')
    await page.goto('/marca/pedidos')
    await page.waitForLoadState('networkidle')
    const publicado = page.getByText(/publicado/i).first()
    if (await publicado.isVisible()) {
      const link = page.getByRole('link', { name: /ver|detalle/i }).first()
      if (await link.isVisible()) {
        await link.click()
        await page.waitForLoadState('networkidle')
        const body = page.locator('body')
        const text = await body.textContent()
        expect(text).toMatch(/cotizaci[oó]n|cotizaciones/i)
      }
    }
  })

  test('7.6 Taller ORO: sidebar tiene Pedidos disponibles', async ({ page }) => {
    await loginAs(page, 'taller_oro')
    await page.waitForLoadState('networkidle')
    const sidebar = page.locator('nav, aside, [role="navigation"]')
    await expect(sidebar.getByText(/pedidos disponibles/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('7.7 Taller ORO: pedidos disponibles muestra pedidos', async ({ page }) => {
    await loginAs(page, 'taller_oro')
    await page.goto('/taller/pedidos/disponibles')
    await page.waitForLoadState('networkidle')
    const body = page.locator('body')
    await expect(body).not.toContainText('404')
    const text = await body.textContent()
    // Debería mostrar al menos algo de contenido
    expect(text?.length).toBeGreaterThan(100)
  })
})

test.describe('Sec 8: SEGURIDAD', () => {
  test('8.1 Taller NO puede acceder a /admin', async ({ page }) => {
    await loginAs(page, 'taller_bronce')
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  test('8.2 Taller NO puede acceder a /estado', async ({ page }) => {
    await loginAs(page, 'taller_bronce')
    await page.goto('/estado')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  test('8.3 Marca NO puede acceder a /taller', async ({ page }) => {
    await loginAs(page, 'marca')
    await page.goto('/taller')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  test('8.4 Sin sesion redirige a /login', async ({ page }) => {
    await page.goto('/taller')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 })
  })
})
