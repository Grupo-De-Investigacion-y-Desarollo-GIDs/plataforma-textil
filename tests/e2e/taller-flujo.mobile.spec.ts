import { test, expect, Page } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

/**
 * M-03 / Bloque B — Flujo CRITICO del taller en viewport mobile.
 *
 * Corre SOLO en los projects mobile (mobile-chrome 393px, mobile-small 320px)
 * via testMatch /\.mobile\.spec\.ts$/. El project chromium (desktop) lo IGNORA.
 *
 * Estos tests son la red de seguridad de los fixes de #431. Cada assert
 * protege un fix concreto: si una regresion vuelve a romper el layout mobile,
 * estos tests la cazan (la leccion de T-04: sin e2e, un fix se rompe en silencio).
 * Por eso NO usan try/catch + test.skip() en los asserts que cubren los fixes.
 */

// El bug que arreglan los fixes es desborde horizontal en pantalla chica.
// Este check es la columna vertebral de la regresion mobile.
async function expectNoHorizontalOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(
    () => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
  )
  expect(overflow, `desborde horizontal en ${label}`).toBeLessThanOrEqual(1)
}

test.describe('M-03 mobile — flujo critico del taller (regresion #431)', () => {
  test('FIX 3 — login: input y boton magic-link se apilan, sin desborde', async ({ page }) => {
    await ensureNotProduction(page)
    await page.goto('/login', { waitUntil: 'load', timeout: 30_000 })

    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible()
    await expectNoHorizontalOverflow(page, '/login')

    // FIX 3: el form magic-link es flex-col en mobile → el boton "Enviar link"
    // queda DEBAJO del input (en desktop estarian lado a lado, misma y).
    const input = page.locator('input[placeholder="Tu email para recibir un link"]')
    const boton = page.getByRole('button', { name: 'Enviar link' })
    await expect(input).toBeVisible()
    await expect(boton).toBeVisible()
    const bi = await input.boundingBox()
    const bb = await boton.boundingBox()
    expect(bi, 'bbox input magic-link').not.toBeNull()
    expect(bb, 'bbox boton magic-link').not.toBeNull()
    // boton arranca por debajo del fondo del input (apilado)
    expect(bb!.y, 'boton magic-link debe estar debajo del input').toBeGreaterThan(bi!.y + bi!.height - 4)
  })

  test('FIX 2 — dashboard: hamburguesa visible y KPIs en 1 columna', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'taller')
    await page.goto('/taller', { waitUntil: 'load', timeout: 30_000 })

    // Nav mobile: la hamburguesa (lg:hidden) esta visible (en desktop estaria oculta)
    await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeVisible()

    // F-05 (RESUELTA): /taller ya no desborda a 320px. La fuente real era la fila
    // de "colecciones recomendadas" (titulo sin truncar) + el contenedor de toasts;
    // ambos acotados. Este assert es ahora la red de regresion de F-05.
    await expectNoHorizontalOverflow(page, '/taller')

    // FIX 2: los KPIs secundarios apilan en 1 columna (grid-cols-1 sm:grid-cols-2).
    // En mobile (<640px) "Capacidad" queda DEBAJO de "Formalizacion", misma x.
    // Si regresara a grid-cols-2 sin breakpoint, quedarian lado a lado (misma y).
    // Scope a <main> + toHaveCount(1): el dashboard es server component con
    // streaming SSR (React 19) que duplica texto transitoriamente durante la
    // hidratacion; toHaveCount(1) espera a que el duplicado se resuelva.
    const main = page.locator('main')
    const form = main.getByText('documentos completados')
    const cap = main.getByText('prendas/mes')
    // timeout amplio: el server component puede tardar en streamear + hidratar
    // en cold start de CI; toHaveCount(1) reintenta hasta que el duplicado cede.
    await expect(form).toHaveCount(1, { timeout: 15_000 })
    await expect(cap).toHaveCount(1, { timeout: 15_000 })
    await expect(form).toBeVisible()
    await expect(cap).toBeVisible()
    const bf = await form.boundingBox()
    const bc = await cap.boundingBox()
    expect(bf, 'bbox KPI formalizacion').not.toBeNull()
    expect(bc, 'bbox KPI capacidad').not.toBeNull()
    expect(bc!.y, 'KPI Capacidad debe estar debajo de Formalizacion (1 columna)').toBeGreaterThan(bf!.y + 4)
    expect(Math.abs(bc!.x - bf!.x), 'KPIs deben compartir columna (misma x)').toBeLessThanOrEqual(2)
  })

  test('FIX 1a+1b — wizard: botones de equipo wrapean, nav sticky, navegable', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'taller')
    await page.goto('/taller/perfil/completar', { waitUntil: 'load', timeout: 30_000 })
    await expectNoHorizontalOverflow(page, 'wizard paso 0')

    // Paso 0 → 1 (maquinaria)
    await page.getByRole('button', { name: /empezar/i }).click()
    await expect(page.getByText(/Qué máquinas/)).toBeVisible({ timeout: 10_000 })

    // Paso 1 → 2 (equipo: los 5 botones de tamaño)
    await page.getByRole('button', { name: /siguiente/i }).click()
    await expect(page.getByText('Contanos sobre tu equipo de trabajo')).toBeVisible({ timeout: 10_000 })

    // FIX 1a: los 5 botones de tamaño de equipo se ven todos y WRAPEAN
    // (grid-cols-3 en mobile). El 5º ("+20") cae en una 2ª fila → y mayor que el 1º.
    const labels = ['1-2', '3-5', '6-10', '11-20', '+20']
    for (const l of labels) {
      await expect(page.getByRole('button', { name: l, exact: true })).toBeVisible()
    }
    await expectNoHorizontalOverflow(page, 'wizard paso equipo')
    const b1 = await page.getByRole('button', { name: '1-2', exact: true }).boundingBox()
    const b5 = await page.getByRole('button', { name: '+20', exact: true }).boundingBox()
    expect(b1, 'bbox boton 1-2').not.toBeNull()
    expect(b5, 'bbox boton +20').not.toBeNull()
    expect(b5!.y, 'el 5º boton de equipo debe wrapear a una 2ª fila').toBeGreaterThan(b1!.y + 4)

    // FIX 1b: la nav Atras/Siguiente es sticky en mobile. El paso "Equipo" es
    // mas alto que el viewport, asi que al scrollear DENTRO del paso (no hasta
    // el footer, que liberaria el sticky) la nav queda pegada al borde inferior.
    // Sin el fix (nav estatica al final), tras scrollear estaria fuera de vista.
    await page.evaluate(() => window.scrollTo(0, 200))
    await page.waitForTimeout(300)
    const siguiente = page.getByRole('button', { name: /siguiente/i })
    await expect(siguiente).toBeVisible()
    const vp = page.viewportSize()!
    const bs = await siguiente.boundingBox()
    expect(bs, 'bbox boton Siguiente tras scroll').not.toBeNull()
    expect(bs!.y, 'Siguiente debe quedar en la mitad inferior (sticky)').toBeGreaterThan(vp.height * 0.5)
    expect(bs!.y + bs!.height, 'Siguiente debe estar dentro del viewport (pegada abajo)').toBeLessThanOrEqual(vp.height + 2)

    // Navegable en mobile: avanzar al paso 3 (composicion del equipo)
    await siguiente.click()
    await expect(page.getByText('¿Cómo se compone tu equipo?')).toBeVisible({ timeout: 10_000 })
  })

  test('FIX 4 — entrada al flujo de cotizacion sin desborde en mobile', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'taller')
    await page.goto('/taller/pedidos/disponibles', { waitUntil: 'load', timeout: 30_000 })

    // El listado de pedidos disponibles (entrada al flujo de cotizar) no desborda
    // en mobile, sea con pedidos, banner de no-verificado o empty-state.
    await expectNoHorizontalOverflow(page, '/taller/pedidos/disponibles')

    // Best-effort: si hay un pedido abrible, el detalle + form de cotizar
    // tampoco desbordan (CotizarForm ya es responsive — FIX 4 sin cambios).
    const detalle = page.locator('a[href*="/taller/pedidos/disponibles/"]').first()
    if (await detalle.count() > 0 && await detalle.isVisible().catch(() => false)) {
      await detalle.click()
      await page.waitForLoadState('load')
      await expectNoHorizontalOverflow(page, 'detalle pedido / cotizar')
    }
  })
})
