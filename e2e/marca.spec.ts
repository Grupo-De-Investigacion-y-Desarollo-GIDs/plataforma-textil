import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test('marca puede ver el directorio de talleres', async ({ page }) => {
  await loginAs(page, 'marca')
  await page.goto('/marca/directorio')
  await expect(page.getByText('Corte Sur')).toBeVisible()
})

test('marca puede crear un pedido', async ({ page }) => {
  await loginAs(page, 'marca')
  await page.goto('/marca/pedidos/nuevo')
  await expect(page).toHaveURL(/\/marca\/pedidos\/nuevo/)
})
