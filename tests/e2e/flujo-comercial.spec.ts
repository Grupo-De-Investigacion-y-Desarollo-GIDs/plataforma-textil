import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('Flujo comercial completo', () => {
  // Timeout largo: este test hace login/logout 3 veces + crea datos
  test.setTimeout(120000)

  test('Marca crea pedido → taller cotiza → marca acepta', async ({ page }) => {
    await ensureNotProduction(page)

    const ts = Date.now()
    const tipoPrenda = `E2E-Test-${ts}`

    // ═══════════════════════════════════════════
    // PASO 1: Marca crea pedido (BORRADOR)
    // ═══════════════════════════════════════════
    await loginAs(page, 'marca')

    await page.goto('/marca/pedidos/nuevo')
    await page.getByLabel(/tipo de prenda/i).fill(tipoPrenda)
    await page.getByLabel(/cantidad/i).fill('500')
    await page.getByLabel(/descripcion/i).fill('Test E2E — pedido temporal para flujo comercial')

    // Seleccionar un proceso si hay disponibles
    const primerProceso = page.locator('button[data-testid^="proceso-"]').first()
    if (await primerProceso.isVisible({ timeout: 2000 }).catch(() => false)) {
      await primerProceso.click()
    }

    await page.click('button[data-action="crear-pedido"]')

    // Esperar redirect a la lista de pedidos con mensaje de exito
    await expect(page).toHaveURL(/\/marca\/pedidos\?created=1/, { timeout: 15000 })
    await expect(page.getByText('Pedido creado correctamente')).toBeVisible()

    // ═══════════════════════════════════════════
    // PASO 2: Marca publica el pedido
    // ═══════════════════════════════════════════
    // Encontrar nuestro pedido (el mas reciente, primero en la lista)
    const pedidoLink = page.locator(`a:has-text("${tipoPrenda}")`).first()
    await expect(pedidoLink).toBeVisible()
    await pedidoLink.click()

    // Estamos en /marca/pedidos/[id]
    await page.waitForURL(/\/marca\/pedidos\/[\w-]+$/, { timeout: 10000 })
    const pedidoUrl = page.url()

    // Verificar que el boton de publicar esta visible (estado BORRADOR)
    await expect(page.locator('button[data-action="publicar"]')).toBeVisible()

    // Publicar — el componente usa window.confirm()
    page.on('dialog', dialog => dialog.accept())
    await page.click('button[data-action="publicar"]')

    // Esperar que el boton de publicar desaparezca (confirma que paso a PUBLICADO)
    await expect(page.locator('button[data-action="publicar"]')).not.toBeVisible({ timeout: 15000 })

    await page.context().clearCookies()
    await page.goto('/login')

    // ═══════════════════════════════════════════
    // PASO 3: Taller cotiza el pedido
    // ═══════════════════════════════════════════
    await loginAs(page, 'taller')

    await page.goto('/taller/pedidos/disponibles')

    // Buscar nuestro pedido por tipoPrenda
    const pedidoDisponible = page.getByText(tipoPrenda).first()
    await expect(pedidoDisponible).toBeVisible({ timeout: 10000 })

    // Click "Ver y cotizar"
    const pedidoCard = page.locator(`a:has-text("Ver y cotizar")`).filter({
      has: page.getByText(tipoPrenda),
    }).first()
    // Si el link esta en la misma Card que el texto, buscar por hermano
    // La estructura es: Card > div > Link "Ver y cotizar"
    // Alternativa: buscar el link mas cercano al texto de nuestro pedido
    // Buscar directamente dentro del container que tiene nuestro tipoPrenda
    const container = page.locator('div').filter({ hasText: tipoPrenda }).locator('a:has-text("Ver y cotizar")').first()
    await container.click()

    await page.waitForURL(/\/taller\/pedidos\/disponibles\//, { timeout: 10000 })

    // Completar cotizacion
    await page.getByLabel(/precio/i).fill('15000')
    await page.getByLabel(/plazo/i).fill('15')
    await page.getByLabel(/proceso/i).fill('Corte y confeccion')
    // Mensaje es un textarea sin label component — usar selector directo
    await page.locator('textarea').fill('Cotizacion E2E — test automatizado')

    await page.click('button[data-action="enviar-cotizacion"]')

    // El form redirige a /taller/pedidos (no hay toast)
    await expect(page).toHaveURL(/\/taller\/pedidos$/, { timeout: 15000 })

    await page.context().clearCookies()
    await page.goto('/login')

    // ═══════════════════════════════════════════
    // PASO 4: Marca acepta la cotizacion
    // ═══════════════════════════════════════════
    await loginAs(page, 'marca')
    await page.goto(pedidoUrl)

    // La seccion de cotizaciones debe mostrar nuestra cotizacion
    // Usar .first() porque runs anteriores pueden haber dejado cotizaciones en la DB
    await expect(page.getByText('Cotizacion E2E').first()).toBeVisible({ timeout: 10000 })

    // Click en "Aceptar" (primer paso del two-step)
    // .first() en caso de multiples cotizaciones ENVIADA de runs anteriores
    await page.locator('button[data-action="aceptar-cotizacion"]').first().click()

    // Click en "Confirmar" (segundo paso)
    await page.click('button[data-action="confirmar-aceptacion"]')

    // Despues de router.refresh(), la cotizacion debe mostrar badge ACEPTADA
    await expect(page.locator('[data-estado="ACEPTADA"]')).toBeVisible({ timeout: 15000 })
  })
})
