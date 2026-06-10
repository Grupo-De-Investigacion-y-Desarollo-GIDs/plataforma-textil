import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs, assertAccesoBloqueado } from './_helpers/auth-multirol'

// U-08 caso #4 — Gating de áreas para el user dual.
// El acceso a /taller y /marca es por MEMBRESÍA en roles[] (middleware →
// tieneAlgunRol; requiereRol en el layout), NO por activeMode. Por eso un dual
// (Julieta: [TALLER, MARCA]) entra a AMBAS áreas sin importar su modo activo, y un
// single-rol queda bloqueado en el área que no le corresponde.
//
// MODE-INDEPENDENT: no asumimos ni fijamos activeMode (§3.3); navegamos explícito.
// No mutan estado → seguros en paralelo (incl. con u-04 toggleando a Julieta).

test('dual entra a /taller (sin redirect a login/unauthorized)', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'dual')

  await page.goto('/taller')
  await expect(page).toHaveURL(/\/taller/)
  await expect(page).not.toHaveURL(/unauthorized|login/)
  await expect(page.locator('main')).toBeVisible()
})

test('dual entra a /marca (sin redirect a login/unauthorized)', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'dual')

  await page.goto('/marca')
  await expect(page).toHaveURL(/\/marca/)
  await expect(page).not.toHaveURL(/unauthorized|login/)
  await expect(page.locator('main')).toBeVisible()
})

test('single-rol (taller) entra a /taller pero /marca queda bloqueado', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'taller_bronce')

  // Su propia área: accesible.
  await page.goto('/taller')
  await expect(page).toHaveURL(/\/taller/)
  await expect(page).not.toHaveURL(/unauthorized|login/)

  // Área de marca: el middleware lo manda a /unauthorized (no es miembro MARCA).
  await page.goto('/marca')
  const body = await page.locator('body').textContent()
  expect(assertAccesoBloqueado(page.url(), body)).toBe(true)
})
