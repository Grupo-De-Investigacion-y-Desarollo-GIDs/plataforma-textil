import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

// U-09: un single-rol (Tomás U09, solo TALLER) suma su perfil de MARCA desde
// /cuenta y queda multi-rol (aparece el toggle de U-04). Usuario dedicado para
// no contaminar a otros tests al mutar sus roles. ARCA corre en modo mock en CI.

async function abrirMenuUsuario(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Menú de usuario' }).click()
}

test('single-rol ve la card "Agregar rol" en /cuenta y crea su perfil de Marca', async ({ page }) => {
  await loginAs(page, 'u09')

  // Single-rol: el toggle de U-04 todavía NO aparece.
  await abrirMenuUsuario(page)
  await expect(page.getByTestId('modo-toggle')).toHaveCount(0)
  await page.keyboard.press('Escape')

  // En /cuenta aparece la card de agregar rol (le falta MARCA).
  await page.goto('/cuenta')
  const card = page.getByTestId('agregar-rol-card')
  await expect(card).toBeVisible()

  // Completar nombre + CUIT (el CUIT viene pre-cargado; lo dejamos) y enviar.
  await page.getByLabel('Nombre de la marca').fill('Marca de Tomás')
  await page.getByTestId('agregar-rol-submit').click()

  // Redirige al dashboard de Marca.
  await expect(page).toHaveURL(/\/marca/, { timeout: 20000 })

  // Ahora es multi-rol: el toggle SÍ aparece y /cuenta ya no ofrece sumar rol.
  await abrirMenuUsuario(page)
  await expect(page.getByTestId('modo-toggle')).toBeVisible()
  await expect(page.getByTestId('modo-toggle-option-TALLER')).toBeVisible()
  await expect(page.getByTestId('modo-toggle-option-MARCA')).toBeVisible()
  await page.keyboard.press('Escape')

  await page.goto('/cuenta')
  await expect(page.getByTestId('agregar-rol-card')).toHaveCount(0)
})
