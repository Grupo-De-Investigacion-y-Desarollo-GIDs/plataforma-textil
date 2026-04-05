import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test('taller ve su nivel en el dashboard', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await expect(page.getByText('BRONCE')).toBeVisible()
})

test('taller puede navegar a formalizacion', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.goto('/taller/formalizacion')
  await expect(page.getByText('Registrate en ARCA')).toBeVisible()
})

test('taller puede navegar a academia', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.goto('/taller/aprender')
  await expect(page).toHaveURL(/\/taller\/aprender/)
})
