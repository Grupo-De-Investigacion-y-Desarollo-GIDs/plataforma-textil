import { test, expect, type Page } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth-multirol'

// U-07 — Regla anti-incesto (bloque multi-rol).
// Un User con perfil de taller Y marca no puede cotizar/invitar a sus propios pedidos.
// Ver .claude/specs/v4-u-07-anti-incesto.md y v4-u-08-tests-e2e-multi-rol.md (§5.3).

// --- REGRESIÓN (con fixtures single-role actuales) ---
// Garantiza que el guard 3a (ocultar CotizarForm en pedido propio) NO afecta el
// flujo normal: un taller mirando el pedido de OTRA marca nunca ve el aviso
// "publicaste como marca".
test('taller viendo pedido ajeno NO ve el aviso anti-incesto', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'taller_oro')
  await page.goto('/taller/pedidos/disponibles')

  const primerPedido = page.locator('a[href^="/taller/pedidos/disponibles/"]').first()
  await expect(primerPedido).toBeVisible()
  await primerPedido.click()

  await expect(page).toHaveURL(/\/taller\/pedidos\/disponibles\/.+/)
  await expect(page.getByText('Este es un pedido que publicaste como marca')).toHaveCount(0)
})

// --- CASOS CENTRALES (User dual = Julieta Benítez, seed U-08) ---
// Estos tests son MODE-INDEPENDENT: el gating de las rutas API es por MEMBRESÍA
// (requiereRolApi → tieneAlgunRol) y la propiedad del pedido se compara por
// pedido.marca.userId === session.user.id, no por el activeMode. Por eso NO hace
// falta fijar el modo (§3.3) ni hay race con u-04, que muta activeMode en paralelo.
// Además NO mutan estado: los 403/400 retornan ANTES de crear cotización/invitación,
// así que no hay cleanup que hacer (la corrida N+1 ve el seed igual de limpio).
//
// POST autenticado: usamos page.request, que comparte las cookies de sesión del
// context tras loginAs. Los ids (pedido propio, taller propio) se resuelven desde
// la UML pública/privada porque el runner de e2e no tiene acceso directo a la DB.

// Resuelve el id de un pedido propio de Julieta desde /marca/pedidos (filtra por omId;
// sin filtro de estado lista BORRADOR y PUBLICADO por igual).
async function resolverPedidoPropio(page: Page, omId: string): Promise<string> {
  await page.goto(`/marca/pedidos?q=${encodeURIComponent(omId)}`)
  const link = page.locator('main a[href^="/marca/pedidos/"]').filter({ hasText: omId }).first()
  await expect(link).toBeVisible()
  const href = await link.getAttribute('href')
  expect(href, `no se encontró el pedido ${omId} en /marca/pedidos`).toBeTruthy()
  return href!.split('/').pop()!
}

// Resuelve el id del taller propio de Julieta (Taller La Hormiga) desde el directorio
// público, donde /perfil/[id] está keyeado por taller.id.
async function resolverTallerPropio(page: Page): Promise<string> {
  await page.goto('/directorio?q=Hormiga')
  const link = page.locator('main a[href^="/perfil/"]').filter({ hasText: 'La Hormiga' }).first()
  await expect(link).toBeVisible()
  const href = await link.getAttribute('href')
  expect(href, 'no se encontró Taller La Hormiga en el directorio').toBeTruthy()
  return href!.split('/').pop()!
}

test('cotizar un pedido propio devuelve 403 AUTO_COTIZACION', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'dual')

  // OM-2026-DUAL1 está PUBLICADO, pero el guard AUTO_COTIZACION dispara ANTES que el
  // chequeo de estado en cotizaciones/route.ts, así que el 403 es por anti-incesto.
  const pedidoId = await resolverPedidoPropio(page, 'OM-2026-DUAL1')

  const res = await page.request.post('/api/cotizaciones', {
    data: { pedidoId, precio: 250000, plazoDias: 30, proceso: 'Confección completa' },
  })
  expect(res.status()).toBe(403)
  const body = await res.json()
  expect(body.code).toBe('AUTO_COTIZACION')
})

test('invitar al taller propio devuelve 400 anti-incesto', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'dual')

  // OM-2026-DUAL2 está en BORRADOR: necesario porque el gate `estado !== 'BORRADOR'`
  // dispara ANTES que el anti-incesto en invitaciones/route.ts. Sobre un pedido
  // PUBLICADO el 400 sería por "Solo se puede invitar desde BORRADOR" (razón
  // equivocada). Verificamos el MENSAJE, no solo el status.
  const pedidoId = await resolverPedidoPropio(page, 'OM-2026-DUAL2')
  const tallerPropioId = await resolverTallerPropio(page)

  const res = await page.request.post(`/api/pedidos/${pedidoId}/invitaciones`, {
    data: { tallerIds: [tallerPropioId] },
  })
  expect(res.status()).toBe(400)
  const body = await res.json()
  expect(body.error).toContain('invitarte a vos mismo')
})

test('el listado de disponibles no incluye los pedidos propios del user dual', async ({ page }) => {
  await ensureNotProduction(page)
  await loginAs(page, 'dual')

  // DUAL1 es PUBLICADO + PUBLICO (aparecería en disponibles si no fuera propio); el
  // guard del listado lo excluye por pedido.marca.userId === session.user.id.
  const pedidoId = await resolverPedidoPropio(page, 'OM-2026-DUAL1')

  await page.goto('/taller/pedidos/disponibles')
  // La página cargó (no redirigió a login/unauthorized): el área es accesible por
  // membresía TALLER aunque Julieta esté en modo MARCA.
  await expect(page).toHaveURL(/\/taller\/pedidos\/disponibles/)

  // El pedido propio NO está listado: no hay link a su detalle.
  await expect(
    page.locator(`a[href$="/taller/pedidos/disponibles/${pedidoId}"]`)
  ).toHaveCount(0)
})
