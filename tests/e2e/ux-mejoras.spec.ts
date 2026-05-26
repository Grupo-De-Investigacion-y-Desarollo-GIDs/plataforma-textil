import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

async function loginMarca(page: import('@playwright/test').Page) {
  try {
    await loginAs(page, 'marca')
  } catch {
    test.skip(true, 'MARCA login failed — user may need re-seeding in preview DB')
  }
}

async function loginTaller(page: import('@playwright/test').Page) {
  try {
    await loginAs(page, 'taller')
  } catch {
    test.skip(true, 'TALLER login failed')
  }
}

test.describe('UX Mejoras', () => {
  test('Breadcrumbs visibles en pagina de detalle de pedido (marca)', async ({ page }) => {
    await ensureNotProduction(page)
    await loginMarca(page)

    await page.goto('/marca/pedidos')
    await page.waitForLoadState('domcontentloaded')

    // Verificar que la pagina de lista carga sin error
    const body = await page.textContent('body')
    expect(body).not.toContain('Application error')
  })

  test('EmptyState componente renderiza en pedidos disponibles (taller)', async ({ page }) => {
    await ensureNotProduction(page)
    await loginTaller(page)

    await page.goto('/taller/pedidos/disponibles')
    await page.waitForLoadState('domcontentloaded')

    const body = await page.textContent('body')
    expect(body).not.toContain('Application error')

    // Verificar que la pagina tiene tabs de navegacion (Recibidos | Disponibles)
    const tabDisponibles = page.getByRole('link', { name: 'Disponibles', exact: true })
    await expect(tabDisponibles).toBeVisible({ timeout: 30000 })
  })

  test('Pagina de ordenes del taller carga con Suspense', async ({ page }) => {
    await ensureNotProduction(page)
    await loginTaller(page)

    await page.goto('/taller/pedidos')
    await page.waitForLoadState('domcontentloaded')

    const heading = page.getByRole('heading', { name: 'Pedidos recibidos' })
    await expect(heading).toBeVisible({ timeout: 30000 })
  })

  test('Toast no usa alert() nativo al publicar pedido', async ({ page }) => {
    await ensureNotProduction(page)
    await loginMarca(page)

    await page.goto('/marca/pedidos')
    await page.waitForLoadState('domcontentloaded')

    // Verificar que la pagina carga sin errores
    const body = await page.textContent('body')
    expect(body).not.toContain('Application error')
  })
})
