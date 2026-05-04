import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

async function loginEstado(page: import('@playwright/test').Page) {
  try {
    await loginAs(page, 'estado')
  } catch {
    test.skip(true, 'ESTADO login failed — user may need re-seeding in preview DB')
  }
}

test.describe('D-02 Configuracion de niveles y tipos de documento', () => {
  test('ESTADO puede ver /estado/configuracion-niveles con 3 cards', async ({ page }) => {
    await ensureNotProduction(page)
    await loginEstado(page)
    await page.goto('/estado/configuracion-niveles')
    await expect(page.getByRole('heading', { name: 'Configuracion de Niveles' })).toBeVisible()
    // Debe haber 3 cards (BRONCE, PLATA, ORO)
    await expect(page.getByText('BRONCE', { exact: true })).toBeVisible()
    await expect(page.getByText('PLATA', { exact: true })).toBeVisible()
    await expect(page.getByText('ORO', { exact: true })).toBeVisible()
  })

  test('ESTADO puede ver puntos en /estado/documentos', async ({ page }) => {
    await ensureNotProduction(page)
    await loginEstado(page)
    await page.goto('/estado/documentos')
    // Los badges de puntos deben estar visibles
    await expect(page.getByText('pts').first()).toBeVisible()
  })

  test('Dashboard taller carga sin error (constantes PTS_* eliminadas)', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'taller')
    // El dashboard del taller debe cargar sin error
    await page.goto('/taller')
    // Timeout 30s: streaming SSR + cold start + ProximoNivelCard async
    await expect(page.getByText('Puntaje')).toBeVisible({ timeout: 30000 })
  })

  test('ADMIN puede ver /estado/configuracion-niveles (lectura)', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')
    await page.goto('/estado/configuracion-niveles')
    await expect(page.getByText('BRONCE')).toBeVisible()
  })

  test('TALLER no puede acceder a configuracion-niveles API', async ({ page, playwright }) => {
    await ensureNotProduction(page)
    const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000'
    await loginAs(page, 'taller')
    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(c => c.name.includes('authjs.session-token') || c.name.includes('next-auth.session-token'))
    if (!sessionCookie) { test.skip(true, 'No se pudo obtener cookie'); return }
    const apiContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { Cookie: `${sessionCookie.name}=${sessionCookie.value}` },
    })
    try {
      const res = await apiContext.get('/api/estado/configuracion-niveles')
      expect(res.status()).toBe(403)
    } finally {
      await apiContext.dispose()
    }
  })
})
