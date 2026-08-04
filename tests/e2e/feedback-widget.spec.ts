import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

/**
 * T-04 — Recupera la cobertura del FeedbackWidget, la UNICA conducta que vivia
 * solo en el huerfano `e2e/feedback.spec.ts` (directorio que Playwright nunca
 * corrio). NO es una migracion literal: el huerfano asertaba "el widget NO
 * aparece sin sesion", lo cual HOY es FALSO — el widget se monta en el root
 * layout (`src/app/layout.tsx`), asi que aparece para anonimos Y logueados (con
 * la rama `!autenticado` que pide nombre + rol). Este spec asserta el estado real.
 *
 * Idempotente: NO envia feedback (no muta DB). Solo abre el panel y ejercita la
 * validacion client-side. storageState via loginAs (patron del skill playwright-e2e).
 */
test.describe('FeedbackWidget — boton flotante de feedback del piloto', () => {
  test('logueado: aparece, abre el panel y valida mensaje corto', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'taller')

    // El boton flotante (no es un link de nav: getByRole 'button' lo distingue
    // del link "Feedback" del sidebar admin).
    const boton = page.getByRole('button', { name: 'Feedback' })
    await expect(boton).toBeVisible()
    await boton.click()

    // Panel abierto.
    await expect(page.getByText('Contanos tu experiencia')).toBeVisible()

    // Validacion client-side: enviar sin tipo ni mensaje pide tipo + 10 caracteres.
    await page.getByRole('button', { name: 'Enviar feedback' }).click()
    await expect(page.getByText(/al menos 10 caracteres/i)).toBeVisible()
  })

  test('anonimo: aparece igual (montado en root layout) y el panel pide nombre + rol', async ({ page }) => {
    await ensureNotProduction(page)
    await page.goto('/', { waitUntil: 'load', timeout: 30_000 })

    const boton = page.getByRole('button', { name: 'Feedback' })
    await expect(boton).toBeVisible()
    await boton.click()

    await expect(page.getByText('Contanos tu experiencia')).toBeVisible()
    // Rama !autenticado: campos de identificacion del auditor anonimo.
    await expect(page.getByText('Tu nombre')).toBeVisible()
    await expect(page.getByText('Rol que estás probando')).toBeVisible()
  })
})
