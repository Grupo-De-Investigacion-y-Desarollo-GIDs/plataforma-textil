import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth-multirol'

// U-04: toggle "Operando como…" estilo Airbnb. Solo visible para multi-rol.
// El usuario `dual` (Julieta Benítez) tiene roles [TALLER, MARCA], activeMode TALLER.

// SERIAL: los 4 tests comparten un único usuario mutable (julieta) y mutan su
// activeMode en DB. Bajo fullyParallel se pisarían entre sí (un test la pone en
// MARCA mientras otro espera TALLER). En serie + afterEach que la resetea, cada
// test arranca del estado de seed limpio.
test.describe.configure({ mode: 'serial' })

async function abrirMenuUsuario(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Menú de usuario' }).click()
}

// T-05: el test de persistencia muta el activeMode de julieta a MARCA en DB y no
// lo restaura. Como DEV persiste entre runs, sin este cleanup el siguiente login de
// julieta arranca en /marca y rompe las aserciones que esperan /taller. El afterEach
// la devuelve a su estado de seed (activeMode TALLER) via endpoint SOLO-CI.
// Resetea SOLO julieta (allowlist) → no toca u09 ni contamina a u-09 en paralelo.
// Best-effort: corre SIEMPRE (try/catch).
test.afterEach(async ({ page }) => {
  try {
    const res = await page.request.post('/api/test-utils/reset-seed-state?user=julieta')
    if (!res.ok()) {
      console.warn(`Cleanup u-04: reset devolvió ${res.status()} (idempotencia comprometida)`)
    }
  } catch (e) {
    console.warn('Cleanup u-04: reset falló', e)
  }
})

test('multi-rol ve el toggle y arranca en modo Taller', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'dual')
  await expect(page).toHaveURL(/\/taller/)

  await abrirMenuUsuario(page)
  await expect(page.getByTestId('modo-toggle')).toBeVisible()
  await expect(page.getByTestId('modo-toggle-option-TALLER')).toBeVisible()
  await expect(page.getByTestId('modo-toggle-option-MARCA')).toBeVisible()
})

test('cambiar a Marca redirige a /marca; volver a Taller redirige a /taller', async ({ page }) => {
  await ensureNotProduction(page)
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

// FIX B-05 (PR fix(b-05)): el clobbering de cookie en rolling JWT está resuelto.
// El middleware ahora lee el JWT read-only (no re-emite Set-Cookie en cada nav) y los
// endpoints de modo/rol setean la cookie actualizada server-side en la misma response,
// así que ninguna lectura concurrente la pisa. ESTE test es la validación del fix:
// cambiar a Marca y hard-navegar a / debe redirigir a /marca (la cookie refleja la DB).
test('el modo activo persiste: tras cambiar a Marca, ir a / redirige a /marca', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'dual')

  await abrirMenuUsuario(page)
  await page.getByTestId('modo-toggle-option-MARCA').click()
  await expect(page).toHaveURL(/\/marca/)

  // El middleware redirige la raíz al dashboard del activeMode persistido en DB.
  await page.goto('/')
  await expect(page).toHaveURL(/\/marca/)
})

// FIX B-05 — validación MULTI-TAB (decisión 4). Dos pestañas comparten el cookie jar.
// Tab 1 cambia a Marca; tab 2 venía con la sesión montada haciendo lecturas/navegación
// (la presión concurrente que ANTES pisaba la cookie: el middleware re-emitía el token
// viejo en cada nav). Con el middleware read-only + cookie server-side, la cookie
// compartida refleja MARCA y ninguna lectura de tab 2 la revierte. SERIAL + mismo
// afterEach de reset(julieta) que el resto del archivo.
test('multi-tab: cambiar a Marca en una pestaña persiste pese a lecturas de otra', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'dual')
  await expect(page).toHaveURL(/\/taller/)

  // Tab 2: misma sesión (cookie jar compartido). Monta la app y navega → lecturas.
  const tab2 = await page.context().newPage()
  await tab2.goto('/taller')
  await expect(tab2).toHaveURL(/\/taller/)

  // Tab 1: cambiar a Marca. La cookie se setea server-side en la response del toggle.
  await abrirMenuUsuario(page)
  await page.getByTestId('modo-toggle-option-MARCA').click()
  await expect(page).toHaveURL(/\/marca/)

  // Tab 2: hard-nav a / — la cookie compartida ya refleja MARCA → cae en /marca.
  await tab2.goto('/')
  await expect(tab2).toHaveURL(/\/marca/)

  // Tab 1: hard-nav a / — persiste en /marca (no fue pisada por las lecturas de tab 2).
  await page.goto('/')
  await expect(page).toHaveURL(/\/marca/)

  await tab2.close()
})

test('single-role NO ve el toggle de modo', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'taller_bronce')
  await abrirMenuUsuario(page)
  await expect(page.getByTestId('modo-toggle')).toHaveCount(0)
})
