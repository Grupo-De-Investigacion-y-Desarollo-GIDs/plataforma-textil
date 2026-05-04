import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

async function loginEstado(page: import('@playwright/test').Page) {
  try {
    await loginAs(page, 'estado')
  } catch {
    // ESTADO user may not exist or have stale credentials in preview DB
    test.skip(true, 'ESTADO login failed — user may need re-seeding in preview DB')
  }
}

test.describe('D-01 Roles ESTADO — flujos principales', () => {
  test('ESTADO puede acceder a /estado/talleres y ver listado', async ({ page }) => {
    await ensureNotProduction(page)
    await loginEstado(page)
    await page.goto('/estado/talleres')
    await expect(page.getByRole('heading', { name: 'Talleres' })).toBeVisible()
    // Debe haber al menos 1 taller en la tabla (seed data)
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })

  test('ESTADO puede acceder a /estado/documentos', async ({ page }) => {
    await ensureNotProduction(page)
    await loginEstado(page)
    await page.goto('/estado/documentos')
    await expect(page.getByRole('heading', { name: 'Tipos de Documento' })).toBeVisible()
  })

  test('ESTADO puede acceder a /estado/auditorias', async ({ page }) => {
    await ensureNotProduction(page)
    await loginEstado(page)
    await page.goto('/estado/auditorias')
    await expect(page.getByRole('heading', { name: 'Auditorias' })).toBeVisible()
  })

  test('ESTADO sidebar muestra 9 items', async ({ page }) => {
    await ensureNotProduction(page)
    await loginEstado(page)
    // Abrir sidebar hamburger
    const menuBtn = page.locator('button[aria-label="Abrir menú"]').or(page.locator('button[aria-label="Menu"]'))
    if (await menuBtn.isVisible()) {
      await menuBtn.click()
    }
    // Contar items de navegacion en el sidebar
    // 9 items: Dashboard, Talleres, Documentos, Auditorias, Niveles, Diagnostico Sector, Exportar Datos, Notificaciones, Mi Cuenta
    const navItems = page.locator('nav ul li')
    await expect(navItems).toHaveCount(9)
  })

  test('ESTADO ve tabs Formalizacion/Historial/Datos en detalle taller', async ({ page }) => {
    await ensureNotProduction(page)
    await loginEstado(page)
    await page.goto('/estado/talleres')
    // Click en el primer taller
    await page.locator('table tbody tr').first().locator('a').click()
    await page.waitForURL(/\/estado\/talleres\//)
    // Verificar los 3 tabs
    await expect(page.getByRole('link', { name: /Formalizacion/ })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Historial' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Datos del taller' })).toBeVisible()
  })

  test('ADMIN puede acceder a /estado/talleres/[id] en modo lectura', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')
    await page.goto('/estado/talleres')
    // Timeout 30s: streaming SSR + cold start en preview
    await page.locator('table tbody tr').first().locator('a').click({ timeout: 30000 })
    await page.waitForURL(/\/estado\/talleres\//, { timeout: 30000 })
    // Debe ver el banner de modo lectura
    await expect(page.locator('text=Modo lectura')).toBeVisible({ timeout: 30000 })
    // NO debe ver botones de Aprobar/Rechazar/Revocar
    await expect(page.getByRole('button', { name: 'Aprobar' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Rechazar' })).not.toBeVisible()
  })

  test('TALLER no puede acceder a /estado/talleres', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'taller')
    await page.goto('/estado/talleres')
    // Debe redirigir a unauthorized
    await expect(page).toHaveURL(/\/unauthorized/)
  })

  test('ADMIN recibe 403 al POST /api/tipos-documento', async ({ page, playwright }) => {
    await ensureNotProduction(page)
    const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000'

    // Login como admin para obtener cookie
    await loginAs(page, 'admin')
    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(c => c.name.includes('authjs.session-token') || c.name.includes('next-auth.session-token'))
    if (!sessionCookie) {
      test.skip(true, 'No se pudo obtener cookie de sesion')
      return
    }

    const apiContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: {
        Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
      },
    })

    try {
      const res = await apiContext.post('/api/tipos-documento', {
        data: { nombre: 'Test-D01', label: 'Test', nivelMinimo: 'BRONCE' },
      })
      expect(res.status()).toBe(403)
      const body = await res.json()
      expect(body.code).toBe('INSUFFICIENT_ROLE')
    } finally {
      await apiContext.dispose()
    }
  })

  test('Dashboard ESTADO no tiene links a /admin/', async ({ page }) => {
    await ensureNotProduction(page)
    await loginEstado(page)
    // El dashboard es /estado (la pagina a la que redirige el login)
    await page.goto('/estado')
    await page.waitForLoadState('domcontentloaded')
    // Buscar todos los links en el main content
    const links = await page.locator('main a[href]').all()
    for (const link of links) {
      const href = await link.getAttribute('href')
      if (href) {
        expect(href, `Link "${await link.textContent()}" apunta a ruta admin`).not.toMatch(/^\/admin/)
      }
    }
  })
})
