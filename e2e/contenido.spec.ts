import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test('admin puede acceder a /contenido/colecciones', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/contenido/colecciones')
  await expect(page.getByRole('heading', { name: 'Colecciones' })).toBeVisible()
})

test('taller no puede acceder a /contenido', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.goto('/contenido')
  await expect(page).toHaveURL(/\/unauthorized/)
})
