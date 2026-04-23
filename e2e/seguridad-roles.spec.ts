import { test, expect } from '@playwright/test'
import { loginAs, assertAccesoBloqueado } from './helpers/auth'

test.describe('Seguridad: control de acceso por rol', () => {

  // ========== Casos que DEBEN bloquear ==========

  test('ESTADO no puede acceder a /admin general', async ({ page }) => {
    await loginAs(page, 'estado')
    await page.goto('/admin/usuarios')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  test('CONTENIDO no puede acceder a /admin/usuarios', async ({ page }) => {
    await loginAs(page, 'contenido')
    await page.goto('/admin/usuarios')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  test('CONTENIDO no puede acceder a /taller', async ({ page }) => {
    await loginAs(page, 'contenido')
    await page.goto('/taller')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  test('MARCA no puede acceder a /estado', async ({ page }) => {
    await loginAs(page, 'marca')
    await page.goto('/estado')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  test('MARCA no puede acceder a /admin', async ({ page }) => {
    await loginAs(page, 'marca')
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  test('TALLER no puede acceder a /marca', async ({ page }) => {
    await loginAs(page, 'taller_bronce')
    await page.goto('/marca')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.locator('body').textContent()
    expect(assertAccesoBloqueado(url, body)).toBeTruthy()
  })

  // ========== Casos que DEBEN permitir ==========

  test('ESTADO SÍ puede acceder a /admin/auditorias', async ({ page }) => {
    await loginAs(page, 'estado')
    await page.goto('/admin/auditorias')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin/auditorias')
  })

  test('CONTENIDO SÍ puede acceder a /admin/colecciones', async ({ page }) => {
    await loginAs(page, 'contenido')
    await page.goto('/admin/colecciones')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin/colecciones')
  })

  test('ADMIN SÍ puede acceder a /estado', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/estado')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/estado')
  })

  test('ADMIN SÍ puede acceder a /contenido', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/contenido')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/contenido')
  })

})
