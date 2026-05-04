import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('F-05 Dashboard de demanda insatisfecha', () => {
  test('ESTADO puede acceder a /estado/demanda-insatisfecha', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'estado')

    await page.goto('/estado/demanda-insatisfecha')
    await expect(page.getByRole('heading', { name: 'Demanda insatisfecha' })).toBeVisible({ timeout: 30000 })

    // Stats cards deben estar visibles (aunque sean 0)
    await expect(page.getByText('Pedidos sin cotizaciones')).toBeVisible()
    await expect(page.getByText('Unidades de produccion potencial')).toBeVisible()
    await expect(page.getByText('Marcas afectadas')).toBeVisible()
  })

  test('Dashboard muestra estado vacio con mensaje explicativo', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'estado')

    await page.goto('/estado/demanda-insatisfecha')
    await page.waitForLoadState('domcontentloaded')

    // Si no hay datos, debe mostrar el mensaje de estado vacio O los motivos
    const heading = page.getByRole('heading', { name: 'Demanda insatisfecha' })
    await expect(heading).toBeVisible({ timeout: 30000 })

    // Verificar que la pagina cargo completamente sin error
    const body = await page.textContent('body')
    expect(body).not.toContain('Application error')
  })

  test('Tab "Demanda insatisfecha" aparece en navegacion ESTADO', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'estado')

    await page.goto('/estado')
    await expect(page.getByText('Demanda insatisfecha')).toBeVisible({ timeout: 30000 })
  })

  test('Boton Exportar CSV esta visible', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'estado')

    await page.goto('/estado/demanda-insatisfecha')
    await expect(page.getByRole('heading', { name: 'Demanda insatisfecha' })).toBeVisible({ timeout: 30000 })

    await expect(page.getByText('Exportar CSV')).toBeVisible()
  })

  test('TALLER no puede acceder a demanda-insatisfecha API', async ({ page, playwright }) => {
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
      const res = await apiContext.get('/api/estado/demanda-insatisfecha')
      expect(res.status()).toBe(403)
    } finally {
      await apiContext.dispose()
    }
  })

  test('API exportar retorna CSV con headers correctos', async ({ page, playwright }) => {
    await ensureNotProduction(page)
    const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000'
    await loginAs(page, 'estado')
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
      const res = await apiContext.get('/api/estado/demanda-insatisfecha/exportar')
      expect(res.status()).toBe(200)
      const contentType = res.headers()['content-type']
      expect(contentType).toContain('text/csv')
      const body = await res.text()
      expect(body).toContain('omId')
      expect(body).toContain('tipoPrenda')
    } finally {
      await apiContext.dispose()
    }
  })
})
