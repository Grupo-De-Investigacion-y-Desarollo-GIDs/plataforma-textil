import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth-multirol'

// U-08 caso #7 — Vista /cuenta para multi-rol vs single-rol.
// /cuenta es la página del USUARIO (no del rol activo): muestra TODOS sus perfiles.
// Multi-rol → "Roles: A, B" + "Rol activo: X" (líneas separadas) + cards de ambos
// perfiles + SIN card "agregar rol". Single-rol → "Rol: X" (singular) + SÍ ofrece
// agregar el rol faltante.
//
// MODE-INDEPENDENT: /cuenta lista los perfiles sea cual sea el activeMode, así que
// es seguro en paralelo con u-04 (que togglea a Julieta). No mutan estado.
// Single-rol: usamos taller_bronce (Roberto), un single-rol estable y read-only —
// NO u09, que u-09 muta a dual en paralelo.

// Scope a <main>: React 19 streaming SSR deja una copia hidden fuera de <main>;
// scopear evita strict-mode (ver skill playwright-e2e §1).

test('multi-rol: /cuenta muestra "Roles: TALLER, MARCA" y "Rol activo:" en líneas separadas', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'dual')

  await page.goto('/cuenta')
  const main = page.locator('main')
  await expect(main.getByText('Roles:', { exact: true })).toBeVisible()
  await expect(main.getByText('TALLER, MARCA')).toBeVisible()
  // El valor de "Rol activo:" puede ser TALLER o MARCA según el toggle concurrente
  // de u-04; solo verificamos la etiqueta separada (no asumimos el modo).
  await expect(main.getByText('Rol activo:', { exact: true })).toBeVisible()
})

test('multi-rol: /cuenta muestra las cards de Taller La Hormiga y Marca Benítez', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'dual')

  await page.goto('/cuenta')
  const main = page.locator('main')
  await expect(main.getByRole('heading', { name: 'Taller La Hormiga' })).toBeVisible()
  await expect(main.getByRole('heading', { name: 'Marca Benítez' })).toBeVisible()
})

test('multi-rol: /cuenta NO muestra la card "agregar rol"', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'dual')

  await page.goto('/cuenta')
  await expect(page.locator('main').getByTestId('agregar-rol-card')).toHaveCount(0)
})

test('single-rol: /cuenta muestra "Rol:" (singular) y SÍ ofrece agregar rol', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'taller_bronce')

  await page.goto('/cuenta')
  const main = page.locator('main')
  // Rama singular: "Rol:" presente, sin "Roles:" ni "Rol activo:".
  await expect(main.getByText('Rol:', { exact: true })).toBeVisible()
  await expect(main.getByText('Roles:', { exact: true })).toHaveCount(0)
  // Single-rol TALLER sin perfil de marca → ofrece sumar el rol faltante.
  await expect(main.getByTestId('agregar-rol-card')).toBeVisible()
})
