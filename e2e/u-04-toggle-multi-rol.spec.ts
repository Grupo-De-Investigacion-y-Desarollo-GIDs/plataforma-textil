import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

// U-04: toggle "Operando como…" estilo Airbnb. Solo visible para multi-rol.
// El usuario `dual` (Julieta Benítez) tiene roles [TALLER, MARCA], activeMode TALLER.

async function abrirMenuUsuario(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Menú de usuario' }).click()
}

test('multi-rol ve el toggle y arranca en modo Taller', async ({ page }) => {
  await loginAs(page, 'dual')
  await expect(page).toHaveURL(/\/taller/)

  await abrirMenuUsuario(page)
  await expect(page.getByTestId('modo-toggle')).toBeVisible()
  await expect(page.getByTestId('modo-toggle-option-TALLER')).toBeVisible()
  await expect(page.getByTestId('modo-toggle-option-MARCA')).toBeVisible()
})

test('cambiar a Marca redirige a /marca; volver a Taller redirige a /taller', async ({ page }) => {
  await loginAs(page, 'dual')

  // → Marca
  await abrirMenuUsuario(page)
  await page.getByTestId('modo-toggle-option-MARCA').click()
  await expect(page).toHaveURL(/\/marca/)

  // → Taller
  await abrirMenuUsuario(page)
  await page.getByTestId('modo-toggle-option-TALLER').click()
  await expect(page).toHaveURL(/\/taller/)
})

test('el modo activo persiste: tras cambiar a Marca, ir a / redirige a /marca', async ({ page }) => {
  await loginAs(page, 'dual')

  await abrirMenuUsuario(page)
  await page.getByTestId('modo-toggle-option-MARCA').click()
  await expect(page).toHaveURL(/\/marca/)

  // El middleware redirige la raíz al dashboard del activeMode persistido en DB.
  await page.goto('/')
  await expect(page).toHaveURL(/\/marca/)
})

test('single-role NO ve el toggle de modo', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await abrirMenuUsuario(page)
  await expect(page.getByTestId('modo-toggle')).toHaveCount(0)
})
