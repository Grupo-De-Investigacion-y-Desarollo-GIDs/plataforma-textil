import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test('feedback widget aparece para usuario logueado', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await expect(page.getByRole('button', { name: 'Feedback' })).toBeVisible()
})

test('feedback widget NO aparece sin sesion', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Feedback' })).not.toBeVisible()
})

test('feedback widget abre panel al click', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.getByRole('button', { name: 'Feedback' }).click()
  await expect(page.getByText('Contanos tu experiencia')).toBeVisible()
})

test('feedback widget valida mensaje corto', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.getByRole('button', { name: 'Feedback' }).click()
  await page.getByText('🐛 Algo no funciona').click()
  await page.fill('textarea', 'corto')
  await page.getByRole('button', { name: 'Enviar feedback' }).click()
  await expect(page.getByText('al menos 10 caracteres')).toBeVisible()
})
