import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test('admin ve tab Features en configuracion', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/admin/configuracion')
  await expect(page.getByRole('button', { name: 'Features' })).toBeVisible()
})

test('admin puede abrir tab Features y ver toggles E1 y E2', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/admin/configuracion')
  await page.getByRole('button', { name: 'Features' }).click()
  await expect(page.getByText('Escenario 1')).toBeVisible()
  await expect(page.getByText('Escenario 2')).toBeVisible()
})

test('admin ve banner en construccion en email', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/admin/integraciones/email')
  await expect(page.getByText('Configuracion en construccion').first()).toBeVisible()
})
