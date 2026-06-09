import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth-multirol'

// U-09: un single-rol (Tomás U09, solo TALLER) suma su perfil de MARCA desde
// /cuenta y queda multi-rol (aparece el toggle de U-04). Usuario dedicado para
// no contaminar a otros tests al mutar sus roles. ARCA corre en modo mock en CI.

async function abrirMenuUsuario(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Menú de usuario' }).click()
}

// T-05: el test muta a u09.test a multi-rol de forma permanente. Sin este cleanup,
// la 2da corrida falla (el guard de POST /me/roles devuelve 409 y la card "Agregar
// rol" no reaparece). El afterEach resetea al estado del seed via endpoint SOLO-CI,
// haciendo el test idempotente. Best-effort: corre SIEMPRE (try/catch) — si fallara
// el reset no rompe el reporte, pero la idempotencia depende de que complete.
test.afterEach(async ({ page }) => {
  try {
    const res = await page.request.post('/api/_test/reset-u09')
    if (!res.ok()) {
      console.warn(`Cleanup u-09: reset devolvió ${res.status()} (idempotencia comprometida)`)
    }
  } catch (e) {
    console.warn('Cleanup u-09: reset falló', e)
  }
})

test('single-rol ve la card "Agregar rol" en /cuenta y crea su perfil de Marca', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'u09')

  // Single-rol: el toggle de U-04 todavía NO aparece.
  await abrirMenuUsuario(page)
  await expect(page.getByTestId('modo-toggle')).toHaveCount(0)
  await page.keyboard.press('Escape')

  // En /cuenta aparece la card de agregar rol (le falta MARCA).
  // Scope a <main>: React 19 streaming SSR deja brevemente una copia hidden
  // (div id="S:1") que dispara strict-mode si el locator no está scopeado.
  // Ver skill playwright-e2e §1. NO usar .first() (oculta el problema).
  await page.goto('/cuenta')
  const card = page.locator('main').getByTestId('agregar-rol-card')
  await expect(card).toBeVisible()

  // Completar nombre + CUIT (el CUIT viene pre-cargado; lo dejamos) y enviar.
  await card.getByLabel('Nombre de la marca').fill('Marca de Tomás')
  await card.getByTestId('agregar-rol-submit').click()

  // Redirige al dashboard de Marca.
  await expect(page).toHaveURL(/\/marca/, { timeout: 20000 })

  // QA #398 r3 — el redirect anterior es client-side (URL optimista). Forzamos una
  // navegación DURA a /marca: el middleware re-evalúa la cookie/JWT real. Si la
  // sesión NO se refrescó (bug), el JWT sigue single-rol TALLER y el middleware manda
  // a /unauthorized. Esto es lo que NO atrapaba el chequeo de URL optimista.
  await page.goto('/marca')
  await expect(page).toHaveURL(/\/marca/)
  await expect(page).not.toHaveURL(/unauthorized/)

  // Ahora es multi-rol: el toggle SÍ aparece y /cuenta ya no ofrece sumar rol.
  await abrirMenuUsuario(page)
  await expect(page.getByTestId('modo-toggle')).toBeVisible()
  await expect(page.getByTestId('modo-toggle-option-TALLER')).toBeVisible()
  await expect(page.getByTestId('modo-toggle-option-MARCA')).toBeVisible()

  // El cambio de modo de vuelta a Taller también funciona (la sesión tiene ambos).
  await page.getByTestId('modo-toggle-option-TALLER').click()
  await expect(page).toHaveURL(/\/taller/)
  await expect(page).not.toHaveURL(/unauthorized/)

  await page.goto('/cuenta')
  await expect(page.locator('main').getByTestId('agregar-rol-card')).toHaveCount(0)
})
