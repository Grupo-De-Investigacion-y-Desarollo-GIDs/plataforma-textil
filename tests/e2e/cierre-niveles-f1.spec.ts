import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth-multirol'

// CIERRE NIVELES — regresión de la fuga F-1.
// Decisión 3.7/3.8 del master + Narrativa V4: los niveles internos BRONCE/PLATA/ORO
// NUNCA se muestran crudos al TALLER — al usuario se le muestra la ETAPA vía
// nivelAEtapa() (Etapa inicial / En proceso de formalización / Formalización
// consolidada). F-1 era el bloque "Historial de nivel" del dashboard, que renderizaba
// "BRONCE → PLATA" crudo. Ver .claude/specs/v4-x-07-08-09-discovery.md.
//
// Red de regresión: el dashboard del taller NO debe exponer los strings del enum.
// Usamos taller_oro (Carlos Mendoza / Corte Sur SRL): el seed le da DOS pasos de
// recorrido (BRONCE→PLATA→ORO), así que su dashboard renderiza el bloque
// "Historial de tu recorrido" (requiere length > 1) — la superficie exacta de F-1.
test('el dashboard del taller no expone los niveles crudos BRONCE/PLATA/ORO', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'taller_oro')
  await expect(page).toHaveURL(/\/taller/)

  const main = page.locator('main')

  // Las etapas (lenguaje de usuario) SÍ están presentes: confirma que la página
  // de formalización cargó y que el copy es el correcto.
  await expect(main).toContainText('Formalización consolidada')

  // Ningún nombre crudo del enum debe ser visible en la superficie del taller
  // (ni en el subtítulo, ni en el banner de cambio, ni en el "Historial de tu recorrido").
  // Word-boundary + mayúsculas exactas: evita falsos positivos como "Plataforma"
  // (no es \bPLATA\b) o palabras con "oro" en minúscula.
  await expect(main).not.toContainText(/\b(BRONCE|PLATA|ORO)\b/)
})
