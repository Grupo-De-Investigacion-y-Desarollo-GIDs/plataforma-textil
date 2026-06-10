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
// rol" no reaparece). El afterEach resetea al estado del seed via endpoint SOLO-CI
// (reset-seed-state, sin parámetros), haciendo el test idempotente. Best-effort:
// corre SIEMPRE (try/catch) — si fallara el reset no rompe el reporte, pero la
// idempotencia depende de que complete.
test.afterEach(async ({ page }) => {
  try {
    // Resetea SOLO u09 (allowlist). No toca julieta → no contamina a u-04 que
    // corre en paralelo (fullyParallel, 2 workers).
    const res = await page.request.post('/api/test-utils/reset-seed-state?user=u09')
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
  // El submit encadena: POST /me/roles (crea la Marca en DB) -> session update
  // (POST /api/auth/session) -> router.push('/marca'). En preview con cold-start
  // ese encadenado puede pasar de 20s y el chequeo de URL optimista (cumulativo)
  // se volvía flaky. Esperamos determinísticamente la respuesta del POST pesado
  // (/me/roles) antes de aguardar el redirect, así el timeout no acumula latencias.
  await card.getByLabel('Nombre de la marca').fill('Marca de Tomás')
  const rolesResp = page.waitForResponse(
    (r) => r.url().includes('/api/usuarios/me/roles') && r.request().method() === 'POST',
    { timeout: 30000 }
  )
  await card.getByTestId('agregar-rol-submit').click()
  await rolesResp

  // Redirige al dashboard de Marca (client-side, ya disparado el update de sesión).
  await expect(page).toHaveURL(/\/marca/, { timeout: 20000 })

  // NOTA: NO se hace un hard-nav a /marca acá para verificar la cookie/JWT real.
  // Esa validación (que el activeMode/roles persistan en una navegación DURA) está
  // BLOQUEADA por B-05 (clobbering de cookie en rolling JWT): una lectura de sesión
  // concurrente puede pisar la cookie actualizada con el estado single-rol previo,
  // y per B-05 re-navegar NO la recupera → /unauthorized intermitente. Es el MISMO
  // race que u-04 "el modo activo persiste" (fixme→B-05), que es el dueño canónico
  // de esa aserción. Acá nos quedamos con la cobertura confiable del alta de rol:
  // /me/roles 200 + redirect optimista + el toggle multi-rol (sesión client optimista).

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
