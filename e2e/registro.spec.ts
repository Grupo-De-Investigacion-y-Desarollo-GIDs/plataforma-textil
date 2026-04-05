import { test, expect } from '@playwright/test'

test('registro con ?rol=TALLER arranca en paso 1 sin seleccion de rol', async ({ page }) => {
  await page.goto('/registro?rol=TALLER')
  await expect(page.getByText('Datos personales')).toBeVisible()
  // No debe mostrar la seleccion de rol
  await expect(page.getByText('Selecciona tu rol')).not.toBeVisible()
})

test('registro sin parametros muestra seleccion de rol', async ({ page }) => {
  await page.goto('/registro')
  await expect(page.getByText('Crear cuenta')).toBeVisible()
  await expect(page.getByRole('button', { name: /Taller/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Marca/ })).toBeVisible()
})

test('registro con ?rol=TALLER no muestra boton atras en paso 1', async ({ page }) => {
  await page.goto('/registro?rol=TALLER')
  await expect(page.getByText('Datos personales')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Atras' })).not.toBeVisible()
})

test('registro sin ?rol muestra boton atras en paso 1 despues de elegir rol', async ({ page }) => {
  await page.goto('/registro')
  await page.getByRole('button', { name: /Taller/ }).click()
  await expect(page.getByText('Datos personales')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Atras' })).toBeVisible()
})
