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

test('taller bronce ve panel proximo beneficio PLATA', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await expect(page.getByText(/documentos para ser PLATA/)).toBeVisible()
})

test('formalizacion muestra nombres en lenguaje del taller', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.goto('/taller/formalizacion')
  await expect(page.getByText('Registrate en ARCA')).toBeVisible()
  await expect(page.getByText('Habilita tu local')).toBeVisible()
})

test('formalizacion muestra info contextual en pasos pendientes', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.goto('/taller/formalizacion')
  await expect(page.getByText('Como tramitarlo').first()).toBeVisible()
})

test('taller puede navegar a academia', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.goto('/taller/aprender')
  await expect(page).toHaveURL(/\/taller\/aprender/)
})
