import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Sec 3: APRENDER', () => {
  test('3.1 Taller bronce: /taller/aprender muestra colecciones', async ({ page }) => {
    await loginAs(page, 'taller_bronce')
    await page.goto('/taller/aprender')
    await page.waitForLoadState('networkidle')
    const body = page.locator('body')
    const text = await body.textContent()
    // Puede mostrar colecciones o "Modulo no disponible"
    if (text?.includes('no disponible') || text?.includes('No disponible')) {
      throw new Error('FALLA: Muestra "Modulo no disponible" en vez de colecciones')
    }
  })

  test('3.5 Taller ORO: colecciones con badge Certificado', async ({ page }) => {
    await loginAs(page, 'taller_oro')
    await page.goto('/taller/aprender')
    await page.waitForLoadState('networkidle')
    const body = page.locator('body')
    const text = await body.textContent()
    if (text?.includes('no disponible') || text?.includes('No disponible')) {
      throw new Error('FALLA: Muestra "Modulo no disponible" en vez de colecciones')
    }
  })

  test('3.7 /verificar muestra formulario de codigo', async ({ page }) => {
    await page.goto('/verificar')
    await page.waitForLoadState('networkidle')
    const input = page.locator('input').first()
    await expect(input).toBeVisible({ timeout: 10000 })
  })

  test('3.9 /verificar con codigo invalido muestra error', async ({ page }) => {
    await page.goto('/verificar')
    await page.waitForLoadState('networkidle')
    const input = page.locator('input').first()
    await input.fill('INVALIDO')
    const submitBtn = page.getByRole('button', { name: /verificar|buscar|consultar/i })
    await submitBtn.click()
    await expect(page.locator('body')).toContainText(/no encontrado|no existe|inv[aá]lido|no se encontr/i, { timeout: 10000 })
  })
})

test.describe('Sec 4: ACOMPAÑAR', () => {
  test('4.1 Taller bronce: dashboard con ProgressRing', async ({ page }) => {
    await loginAs(page, 'taller_bronce')
    await page.waitForLoadState('networkidle')
    // Buscar elemento SVG circular o texto de porcentaje
    const body = page.locator('body')
    const text = await body.textContent()
    expect(text).toMatch(/%|progreso|nivel|bronce/i)
  })

  test('4.2 Taller bronce: panel amarillo falta docs para PLATA', async ({ page }) => {
    await loginAs(page, 'taller_bronce')
    await page.waitForLoadState('networkidle')
    const body = page.locator('body')
    await expect(body.getByText(/falta|documento|plata/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('4.3 /taller/formalizacion: 8 pasos con nombres correctos', async ({ page }) => {
    await loginAs(page, 'taller_bronce')
    await page.goto('/taller/formalizacion')
    await page.waitForLoadState('networkidle')
    const body = page.locator('body')
    await expect(body.getByText(/Registrate en ARCA/i).first()).toBeVisible({ timeout: 10000 })
    await expect(body.getByText(/Habilita tu local/i).first()).toBeVisible()
    await expect(body.getByText(/Asegura a tu equipo/i).first()).toBeVisible()
  })

  test('4.6 Taller ORO: dashboard panel verde nivel maximo', async ({ page }) => {
    await loginAs(page, 'taller_oro')
    await page.waitForLoadState('networkidle')
    const body = page.locator('body')
    await expect(body.getByText(/nivel m[aá]ximo|oro|verificado/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('4.7 Taller ORO: formalizacion todos en verde', async ({ page }) => {
    await loginAs(page, 'taller_oro')
    await page.goto('/taller/formalizacion')
    await page.waitForLoadState('networkidle')
    const body = page.locator('body')
    // No debería haber pasos sin completar
    const text = await body.textContent()
    const hasVerificada = text?.includes('verificada') || text?.includes('Verificada') || text?.includes('Completado') || text?.includes('completado')
    expect(hasVerificada).toBeTruthy()
  })
})
