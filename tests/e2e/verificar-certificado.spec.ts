import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'

/**
 * B-07 — Verificacion publica de certificados (/verificar).
 *
 * El endpoint GET /api/certificados/[id] devuelve `taller` y `coleccion` como
 * OBJETOS ({id,nombre,nivel} / {id,titulo,categoria}). La pagina los tipaba como
 * string y renderizaba {resultado.taller} directo -> "Objects are not valid as a
 * React child" apenas existiera 1 certificado. Hoy prod/dev = 0 certificados, asi
 * que la rama de exito nunca se ejercito. Este spec la cubre mockeando la respuesta
 * con la forma REAL del endpoint (no depende de data en DB).
 *
 * El segundo test recupera la conducta del huerfano e2e/ (codigo invalido -> error),
 * contra el endpoint real (404 -> "no encontrado").
 */
test.describe('B-07 — verificacion publica de certificados', () => {
  test('renderiza taller y coleccion como TEXTO (no [object Object])', async ({ page }) => {
    await ensureNotProduction(page)

    // Forma REAL del endpoint: taller/coleccion son objetos con select explicito.
    await page.route('**/api/certificados/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          codigo: 'CERT-TEST-2026-00001',
          taller: { id: 't1', nombre: 'Taller de Prueba SRL', nivel: 'ORO' },
          coleccion: { id: 'c1', titulo: 'Costura Industrial', categoria: 'TECNICA' },
          fecha: '2026-01-15T00:00:00.000Z',
          calificacion: 92,
          revocado: false,
        }),
      }),
    )

    await page.goto('/verificar', { waitUntil: 'load', timeout: 30_000 })
    // Scope a <main>: React 19 streaming SSR deja una copia del form en un div
    // hidden durante la hidratacion (skill playwright-e2e §1) -> getByPlaceholder
    // sin scope matchea 2 inputs (strict-mode flaky).
    const main = page.locator('main')
    await main.getByPlaceholder('Ej: CERT-SST-2025-00001').fill('CERT-TEST-2026-00001')
    await main.getByRole('button', { name: 'Verificar' }).click()

    await expect(main.getByText('Certificado Válido')).toBeVisible({ timeout: 10_000 })
    // El fix B-07: nombre del taller y titulo de la coleccion renderizan como texto.
    await expect(main.getByText('Taller de Prueba SRL')).toBeVisible()
    await expect(main.getByText('Costura Industrial')).toBeVisible()
    // Guard de regresion: el objeto serializado NUNCA debe aparecer.
    await expect(page.locator('body')).not.toContainText('[object Object]')
  })

  test('codigo invalido muestra "Certificado no encontrado"', async ({ page }) => {
    await ensureNotProduction(page)
    await page.goto('/verificar', { waitUntil: 'load', timeout: 30_000 })
    const main = page.locator('main')
    await main.getByPlaceholder('Ej: CERT-SST-2025-00001').fill('CERT-INEXISTENTE-ZZZ')
    await main.getByRole('button', { name: 'Verificar' }).click()
    await expect(main.getByText('Certificado no encontrado')).toBeVisible({ timeout: 15_000 })
  })
})
