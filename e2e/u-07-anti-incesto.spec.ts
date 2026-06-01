import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

// U-07 — Regla anti-incesto (bloque multi-rol).
// Un User con perfil de taller Y marca no puede cotizar/invitar a sus propios pedidos.
// Ver .claude/specs/v4-u-07-anti-incesto.md

// --- REGRESIÓN (con fixtures single-role actuales) ---
// Garantiza que el guard 3a (ocultar CotizarForm en pedido propio) NO afecta el
// flujo normal: un taller mirando el pedido de OTRA marca nunca ve el aviso
// "publicaste como marca".
test('taller viendo pedido ajeno NO ve el aviso anti-incesto', async ({ page }) => {
  await loginAs(page, 'taller_oro')
  await page.goto('/taller/pedidos/disponibles')

  const primerPedido = page.locator('a[href^="/taller/pedidos/disponibles/"]').first()
  await expect(primerPedido).toBeVisible()
  await primerPedido.click()

  await expect(page).toHaveURL(/\/taller\/pedidos\/disponibles\/.+/)
  await expect(page.getByText('Este es un pedido que publicaste como marca')).toHaveCount(0)
})

// --- CASOS CENTRALES (requieren fixture multi-rol) ---
// El seed actual es single-role: ningún User tiene Taller Y Marca a la vez.
// Estos tests se completan en U-08, cuando exista el seed dual (v4-u-02-schema-multi-rol).
// Se dejan como `fixme` para que queden trackeados y se activen al llegar el fixture.

test.fixme('cotizar pedido propio devuelve 403 AUTO_COTIZACION', async () => {
  // TODO(U-08): requiere User dual (taller+marca). POST /api/cotizaciones sobre
  // un pedido cuya marca.userId === session.user.id → 403 code AUTO_COTIZACION.
})

test.fixme('invitar al taller propio devuelve 400', async () => {
  // TODO(U-08): requiere User dual. POST /api/pedidos/[id]/invitaciones incluyendo
  // el taller del propio dueño del pedido → 400 "No podés invitarte a vos mismo...".
})

test.fixme('listado de disponibles no incluye los pedidos propios del user dual', async () => {
  // TODO(U-08): requiere User dual. /taller/pedidos/disponibles no debe listar
  // pedidos cuya marca.userId === session.user.id.
})
