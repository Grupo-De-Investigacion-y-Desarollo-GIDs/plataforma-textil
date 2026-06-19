import { test, expect, Page } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

/**
 * T-06 — Cobertura de FLUJO del formulario del taller refactorizado (W-A2..W-A5).
 *
 * El refactor del wizard `/taller/perfil/completar` (W-A) esta en prod pero solo
 * tenia unit tests de mapeo de labels; faltaba un e2e que (a) ejercite las
 * OPCIONES NUEVAS en la UI y (b) verifique que el PUT las PERSISTE.
 *
 * Diseño en dos tests, por aislamiento (la leccion de T-05 — DEV persiste entre
 * corridas, e2e corre fullyParallel con 2 workers):
 *  - Test A (UI): recorre el wizard hasta "organizacion" y prueba el control
 *    condicional de W-A2 (elegir "Organizacion mixta" revela el detalle). Solo UI,
 *    NO guarda → no muta nada. Determinista: primero elige "Modular" (detalle
 *    oculto) y luego "mixta" (detalle visible), asi no depende del estado cargado.
 *  - Test B (persistencia): PUT PARCIAL de los campos W-A escalares
 *    (organizacion/organizacionDetalle de W-A2, registroProduccion de W-A3,
 *    disponibilidad+escalabilidad de W-A4, rolesFuncionales de W-A5) y re-lee
 *    /api/talleres/me. Es el mismo patron de persistencia que usa
 *    desglose-plantilla.spec.ts (test "API PUT ... acepta plantilla"), pero con
 *    campos DISJUNTOS de `plantilla` → race-safe contra ese spec (el PUT solo
 *    toca columnas escalares; plantilla queda intacta). Valores fijos →
 *    idempotente; ningun otro test asserta estos campos del taller seed.
 */

// Avanza desde el paso 0 (bienvenida) hasta que aparezca un heading objetivo.
async function avanzarHasta(page: Page, heading: RegExp, maxClicks = 8) {
  await page.getByRole('button', { name: /empezar/i }).click()
  for (let i = 0; i < maxClicks; i++) {
    if (await page.getByRole('heading', { name: heading }).isVisible().catch(() => false)) return
    await page.getByRole('button', { name: /siguiente/i }).click()
    await page.waitForTimeout(200)
  }
  // Ultimo chequeo (puede haber llegado en el ultimo click).
  await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: 5_000 })
}

test.describe('T-06 — flujo del formulario del taller (W-A2..W-A5)', () => {
  test('UI W-A2: "Organizacion mixta" revela el campo de detalle', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'taller')
    await page.goto('/taller/perfil/completar', { waitUntil: 'load', timeout: 30_000 })

    await avanzarHasta(page, /Cómo organizan el trabajo/i)

    const detalle = page.getByPlaceholder('Ej: línea para producción en serie, modular para muestras')

    // Estado base determinista: elegir "Modular" → el detalle NO debe estar.
    await page.getByText('Modular', { exact: true }).click()
    await expect(detalle).toHaveCount(0)

    // W-A2: elegir "Organizacion mixta" → revela el input de detalle.
    await page.getByText('Organización mixta', { exact: true }).click()
    await expect(detalle).toBeVisible()
    await detalle.fill('E2E: línea para serie, modular para muestras')
    await expect(detalle).toHaveValue('E2E: línea para serie, modular para muestras')
  })

  test('persistencia: el PUT de los campos W-A se guarda y se relee', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'taller')

    const meResp = await page.request.get('/api/talleres/me')
    expect(meResp.status()).toBe(200)
    const taller = await meResp.json()
    expect(taller.id, 'el taller seed debe existir').toBeTruthy()

    // Campos W-A escalares (DISJUNTOS de plantilla → no chocan con desglose).
    const payload = {
      organizacion: 'mixta', // W-A2
      organizacionDetalle: 'E2E W-A: línea para serie, modular para muestras', // W-A2
      registroProduccion: 'sin-sistematico', // W-A3
      disponibilidad: 'sin-cambios', // W-A4 (pregunta 1 de capacidad)
      escalabilidad: 'turnos', // W-A4
      rolesFuncionales: { Corte: 2, 'Confección / costura': 3 }, // W-A5
    }
    const putResp = await page.request.put(`/api/talleres/${taller.id}`, { data: payload })
    expect(putResp.status()).toBe(200)

    // Re-leer y verificar que persistio (no quedo en memoria ni se mapeo mal).
    const me2 = await (await page.request.get('/api/talleres/me')).json()
    expect(me2.organizacion).toBe('mixta')
    expect(me2.organizacionDetalle).toBe(payload.organizacionDetalle)
    expect(me2.registroProduccion).toBe('sin-sistematico')
    expect(me2.disponibilidad).toBe('sin-cambios')
    expect(me2.escalabilidad).toBe('turnos')
    expect(me2.rolesFuncionales).toEqual(payload.rolesFuncionales)
  })
})
