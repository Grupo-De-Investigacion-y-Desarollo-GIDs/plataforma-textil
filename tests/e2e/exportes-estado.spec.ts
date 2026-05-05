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

test.describe('F-04 Exportes del Estado', () => {
  test('ESTADO puede acceder a /estado/exportar', async ({ page }) => {
    await ensureNotProduction(page)
    await loginEstado(page)

    await page.goto('/estado/exportar')
    await expect(page.getByRole('heading', { name: 'Exportar Reportes' })).toBeVisible({ timeout: 30000 })

    // Verificar que hay tarjetas de reportes
    await expect(page.getByText('Talleres')).toBeVisible()
    await expect(page.getByText('Marcas')).toBeVisible()
    await expect(page.getByText('Informe mensual completo')).toBeVisible()
  })

  test('Botones CSV y Excel visibles en cada tarjeta', async ({ page }) => {
    await ensureNotProduction(page)
    await loginEstado(page)

    await page.goto('/estado/exportar')
    await expect(page.getByRole('heading', { name: 'Exportar Reportes' })).toBeVisible({ timeout: 30000 })

    // Cada tarjeta tiene botones CSV y Excel
    const csvButtons = page.getByRole('button', { name: 'CSV' })
    const excelButtons = page.getByRole('button', { name: 'Excel' })
    expect(await csvButtons.count()).toBeGreaterThan(0)
    expect(await excelButtons.count()).toBeGreaterThan(0)
  })

  test('API exportar CSV retorna content-type correcto', async ({ page, playwright }) => {
    await ensureNotProduction(page)
    const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000'
    try {
      await loginAs(page, 'estado')
    } catch {
      test.skip(true, 'ESTADO login failed')
      return
    }
    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(c =>
      c.name.includes('authjs.session-token') || c.name.includes('next-auth.session-token')
    )
    if (!sessionCookie) { test.skip(true, 'No se pudo obtener cookie'); return }
    const apiContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { Cookie: `${sessionCookie.name}=${sessionCookie.value}` },
    })
    try {
      const res = await apiContext.get('/api/estado/exportar?tipo=resumen&formato=csv')
      expect(res.status()).toBe(200)
      const contentType = res.headers()['content-type']
      expect(contentType).toContain('text/csv')
      const body = await res.text()
      expect(body).toContain('Metrica')
    } finally {
      await apiContext.dispose()
    }
  })

  test('TALLER no puede acceder a exportar API', async ({ page, playwright }) => {
    await ensureNotProduction(page)
    const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000'
    await loginAs(page, 'taller')
    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(c =>
      c.name.includes('authjs.session-token') || c.name.includes('next-auth.session-token')
    )
    if (!sessionCookie) { test.skip(true, 'No se pudo obtener cookie'); return }
    const apiContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { Cookie: `${sessionCookie.name}=${sessionCookie.value}` },
    })
    try {
      const res = await apiContext.get('/api/estado/exportar?tipo=talleres&formato=csv')
      expect(res.status()).toBe(403)
    } finally {
      await apiContext.dispose()
    }
  })

  test('Breadcrumbs visibles en pagina exportar', async ({ page }) => {
    await ensureNotProduction(page)
    await loginEstado(page)

    await page.goto('/estado/exportar')
    await page.waitForLoadState('domcontentloaded')

    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
    await expect(breadcrumb).toBeVisible({ timeout: 30000 })
  })
})
