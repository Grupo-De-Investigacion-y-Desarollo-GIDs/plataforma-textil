import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test('estado ve las 3 secciones del dashboard', async ({ page }) => {
  await loginAs(page, 'estado')
  await expect(page.getByText('Como esta el sector?')).toBeVisible()
  await expect(page.getByText('Donde hay que actuar?')).toBeVisible()
  await expect(page.getByText('Que esta funcionando?')).toBeVisible()
})

test('estado ve distribucion por nivel', async ({ page }) => {
  await loginAs(page, 'estado')
  await expect(page.getByText('Distribucion por nivel')).toBeVisible()
  await expect(page.getByText('Bronce')).toBeVisible()
})

test('taller no puede acceder a /estado', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.goto('/estado')
  await expect(page).toHaveURL(/\/unauthorized/)
})
