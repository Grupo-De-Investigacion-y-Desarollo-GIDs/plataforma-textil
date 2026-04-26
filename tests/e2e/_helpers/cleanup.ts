/**
 * Helpers de cleanup para datos creados por tests E2E.
 *
 * IMPORTANTE: Los tests corren contra Preview (I-01), que tiene su propia DB.
 * No hay riesgo de contaminar produccion.
 *
 * Estos helpers usan fetch contra la API en vez de Prisma directo,
 * porque Playwright corre en el browser, no en Node con acceso a DB.
 * Para cleanup mas agresivo, usar el seed directamente:
 *   npx prisma db seed (re-genera todos los datos del seed)
 */

import { Page } from '@playwright/test'

/**
 * Limpia un pedido de test por su OM-ID.
 * Requiere estar logueado como ADMIN.
 */
export async function limpiarPedidoTest(page: Page, omId: string) {
  const response = await page.request.delete(`/api/pedidos/${omId}`)
  if (!response.ok()) {
    console.warn(`Cleanup: no se pudo borrar pedido ${omId} (${response.status()})`)
  }
}

/**
 * Limpia un usuario de test por email.
 * Util para tests de registro que crean usuarios temporales.
 * Requiere estar logueado como ADMIN.
 */
export async function limpiarUsuarioTest(page: Page, email: string) {
  // Buscar usuario por email
  const searchRes = await page.request.get(`/api/admin/usuarios?q=${encodeURIComponent(email)}`)
  if (!searchRes.ok()) return

  const data = await searchRes.json()
  const usuario = data.usuarios?.find((u: { email: string }) => u.email === email)
  if (!usuario) return

  // Desactivar (soft delete)
  const deleteRes = await page.request.delete(`/api/admin/usuarios/${usuario.id}`)
  if (!deleteRes.ok()) {
    console.warn(`Cleanup: no se pudo desactivar usuario ${email} (${deleteRes.status()})`)
  }
}
