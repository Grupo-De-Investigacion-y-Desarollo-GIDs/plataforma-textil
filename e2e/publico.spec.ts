import { test, expect } from '@playwright/test'

test('landing carga correctamente', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Plataforma Digital Textil')).toBeVisible()
})

test('directorio publico carga sin login', async ({ page }) => {
  await page.goto('/directorio')
  await expect(page).toHaveURL('/directorio')
  await expect(page).not.toHaveURL(/\/login/)
})

test('verificar certificado con codigo invalido muestra error', async ({ page }) => {
  await page.goto('/verificar?code=INVALIDO')
  await expect(page.getByText(/no encontrado/i)).toBeVisible()
})
