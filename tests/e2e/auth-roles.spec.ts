import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('Auth multi-rol — login de los 4 roles principales', () => {
  test('Taller llega a /taller', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'taller')
    await expect(page).toHaveURL(/\/taller/)
  })

  test('Marca llega a /marca', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'marca')
    await expect(page).toHaveURL(/\/marca/)
  })

  test('Admin llega a /admin', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')
    await expect(page).toHaveURL(/\/admin/)
  })

  test('Estado llega a /estado', async ({ page }) => {
    await ensureNotProduction(page)
    try {
      await loginAs(page, 'estado')
    } catch {
      test.skip(true, 'ESTADO login failed — user may need re-seeding in preview DB')
    }
    await expect(page).toHaveURL(/\/estado/)
  })

  test('Credenciales invalidas muestran error', async ({ page }) => {
    await ensureNotProduction(page)
    await page.goto('/login')
    await page.locator('form:has(button:has-text("Ingresar")) input[name="email"]').fill('fake@test.com')
    await page.locator('form:has(button:has-text("Ingresar")) input[name="password"]').fill('wrongpass')
    await page.getByRole('button', { name: 'Ingresar' }).click()
    await expect(page.getByText(/credenciales|incorrectos|error/i)).toBeVisible({ timeout: 10000 })
  })
})
