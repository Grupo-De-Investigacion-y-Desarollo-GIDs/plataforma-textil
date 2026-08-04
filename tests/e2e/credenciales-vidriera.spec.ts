import { test, expect } from '@playwright/test'
import { loginAs } from './_helpers/auth-multirol'

// Regresión V4 #4 / master 3.10 (QA #448, Bug 1 CRÍTICO): la sección "Credenciales" de
// la vidriera debe mostrar SOLO Etapa + ARCA. Las validaciones del recorrido de
// formalización (ART, Habilitación municipal, Empleados registrados, Bomberos, Plan de
// seguridad e higiene, Nómina digital) son PRIVADAS — viven en Mi recorrido y NUNCA
// deben aparecer en la vidriera (ni al taller, ni a las marcas).
//
// Red de regresión pedida por Sergio: comparar DOS talleres en distinto estado —
//   - taller_oro (Corte Sur): TODAS las validaciones del recorrido COMPLETADO
//   - taller_bronce (La Aguja): SOLO CUIT
// Credenciales debe ser idéntico entre ambos (solo Etapa + ARCA), sin filtrar el
// recorrido del taller "avanzado".

// Labels inequívocos del recorrido (evito 'ART' por ser substring de otras palabras).
const RECORRIDO_PRIVADO = [
  'Habilitación municipal',
  'Empleados registrados',
  'Habilitación de bomberos',
  'Plan de seguridad e higiene',
  'Nómina digital',
]

async function assertCredencialesSinRecorrido(page: import('@playwright/test').Page) {
  // Scope a <main> (React 19 streaming SSR duplica nodos ocultos fuera de main).
  const main = page.locator('main')
  // ARCA presente (ambos talleres están verificados).
  await expect(main.getByText('Verificado por ARCA')).toBeVisible()
  // NINGUNA validación del recorrido, en ninguna parte de la vidriera.
  for (const label of RECORRIDO_PRIVADO) {
    await expect(main.getByText(label)).toHaveCount(0)
  }
}

test.describe('Vidriera · Credenciales = solo Etapa + ARCA (no filtra el recorrido)', () => {
  test('taller con TODAS las validaciones (Oro) NO las expone en Credenciales', async ({ page }) => {
    await loginAs(page, 'taller_oro')
    await page.goto('/taller/perfil/vidriera', { waitUntil: 'load' })
    // Etapa visible (Oro → "Formalización consolidada").
    await expect(page.locator('main').getByText('Formalización consolidada')).toBeVisible()
    await assertCredencialesSinRecorrido(page)
  })

  test('taller con SOLO CUIT (Bronce): Credenciales idéntico (Etapa + ARCA)', async ({ page }) => {
    await loginAs(page, 'taller_bronce')
    await page.goto('/taller/perfil/vidriera', { waitUntil: 'load' })
    // Etapa visible (Bronce → "Etapa inicial").
    await expect(page.locator('main').getByText('Etapa inicial')).toBeVisible()
    await assertCredencialesSinRecorrido(page)
  })
})
