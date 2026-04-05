import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test('taller puede loguearse y llega al dashboard', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await expect(page).toHaveURL(/\/taller/)
})

test('marca puede loguearse y llega al directorio', async ({ page }) => {
  await loginAs(page, 'marca')
  await expect(page).toHaveURL(/\/marca/)
})

test('estado puede loguearse y llega al dashboard', async ({ page }) => {
  await loginAs(page, 'estado')
  await expect(page).toHaveURL(/\/estado/)
})

test('admin puede loguearse y llega al panel', async ({ page }) => {
  await loginAs(page, 'admin')
  await expect(page).toHaveURL(/\/admin/)
})

test('usuario sin sesion es redirigido al login', async ({ page }) => {
  await page.goto('/taller')
  await expect(page).toHaveURL(/\/login/)
})

test('taller no puede acceder a /admin', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/unauthorized/)
})
