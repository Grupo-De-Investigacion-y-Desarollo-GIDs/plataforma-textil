import { test, expect } from '@playwright/test'

test('landing carga correctamente', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Plataforma Digital Textil' })).toBeVisible()
})

test('directorio publico carga sin login', async ({ page }) => {
  await page.goto('/directorio')
  await expect(page).toHaveURL('/directorio')
  await expect(page).not.toHaveURL(/\/login/)
})

test('pagina de verificar carga sin login', async ({ page }) => {
  await page.goto('/verificar')
  await expect(page.getByRole('heading', { name: 'Verificar Certificado' })).toBeVisible()
})
