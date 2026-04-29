import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'

test('Marca se registra y hace primer login', async ({ page }) => {
  await ensureNotProduction(page)

  const ts = Date.now()
  const email = `test-marca-${ts}@dulcemoda.test`
  const cuit = `30${ts.toString().slice(-8)}7`

  // Step 0: seleccionar rol MARCA
  await page.goto('/registro')
  await page.getByText('Marca', { exact: false }).filter({ hasText: 'busco talleres' }).click()

  // Step 1: datos personales
  await page.fill('input[name="nombre"]', `Marca E2E ${ts}`)
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', 'pdt2026test')
  await page.fill('input[name="confirmPassword"]', 'pdt2026test')
  await page.locator('input[type="checkbox"][name="terminos"]').check()

  await page.getByRole('button', { name: 'Siguiente' }).click()

  // Step 2: datos de la marca
  await page.fill('input[name="nombreEntidad"]', `Marca E2E ${ts}`)

  const cuitInput = page.locator('input[name="cuit"]')
  await cuitInput.click()
  await cuitInput.pressSequentially(cuit, { delay: 20 })
  await page.keyboard.press('Tab') // blur triggers verificacion

  const crearCuentaBtn = page.getByRole('button', { name: 'Crear cuenta' })
  await expect(crearCuentaBtn).toBeEnabled({ timeout: 20000 })
  await crearCuentaBtn.click()

  // Debe redirigir al dashboard de marca
  await expect(page).toHaveURL(/\/marca/, { timeout: 30000 })
})
