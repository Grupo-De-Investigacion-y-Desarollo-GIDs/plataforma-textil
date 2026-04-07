import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Sec 1: REGISTRAR', () => {
  test('1.1 /registro?rol=TALLER arranca en Datos personales', async ({ page }) => {
    await page.goto('/registro?rol=TALLER')
    await expect(page.locator('body')).not.toContainText('Selecciona tu rol', { timeout: 10000 })
  })

  test('1.2 /registro sin params muestra seleccion de rol', async ({ page }) => {
    await page.goto('/registro')
    const body = page.locator('body')
    await expect(body.getByText(/taller|marca/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('1.3 Paso 1 con ?rol=TALLER NO tiene boton Atras', async ({ page }) => {
    await page.goto('/registro?rol=TALLER')
    await page.waitForLoadState('networkidle')
    const atras = page.getByRole('button', { name: /atr[aá]s|volver|anterior/i })
    await expect(atras).toHaveCount(0)
  })

  test('1.5 /login muestra formulario email+password', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /ingresar/i })).toBeVisible()
  })

  test('1.6 Login Carlos llega a /taller', async ({ page }) => {
    await loginAs(page, 'taller_oro')
    await expect(page).toHaveURL(/\/taller/, { timeout: 15000 })
  })

  test('1.7 Login Martin llega a /marca', async ({ page }) => {
    await loginAs(page, 'marca')
    await expect(page).toHaveURL(/\/marca/, { timeout: 15000 })
  })

  test('1.8 /acceso-rapido muestra 7 botones', async ({ page }) => {
    await page.goto('/acceso-rapido')
    await page.waitForLoadState('networkidle')
    const buttons = page.locator('button').filter({ hasText: /.+/ })
    const count = await buttons.count()
    expect(count).toBeGreaterThanOrEqual(7)
  })
})

test.describe('Sec 2: ENCONTRAR', () => {
  test('2.1 /directorio carga sin login, muestra talleres', async ({ page }) => {
    await page.goto('/directorio')
    await page.waitForLoadState('networkidle')
    const cards = page.locator('[class*="card"], [class*="Card"], article, [data-testid*="taller"]').or(page.getByRole('link', { name: /ver perfil/i }))
    await expect(cards.first()).toBeVisible({ timeout: 15000 })
  })

  test('2.5 Click Ver perfil llega a /perfil/[id]', async ({ page }) => {
    await page.goto('/directorio')
    await page.waitForLoadState('networkidle')
    const verPerfil = page.getByRole('link', { name: /ver perfil/i }).first()
    await expect(verPerfil).toBeVisible({ timeout: 15000 })
    await verPerfil.click()
    await expect(page).toHaveURL(/\/perfil\//, { timeout: 15000 })
  })

  test('2.6 Perfil muestra info y link Volver', async ({ page }) => {
    await page.goto('/directorio')
    await page.waitForLoadState('networkidle')
    const verPerfil = page.getByRole('link', { name: /ver perfil/i }).first()
    await verPerfil.click()
    await page.waitForLoadState('networkidle')
    const body = page.locator('body')
    await expect(body.getByText(/volver/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('2.7 Marca: /marca/directorio carga', async ({ page }) => {
    await loginAs(page, 'marca')
    await page.goto('/marca/directorio')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).not.toContainText('No autorizado', { timeout: 10000 })
    await expect(page.locator('body')).not.toContainText('404', { timeout: 5000 })
  })
})
