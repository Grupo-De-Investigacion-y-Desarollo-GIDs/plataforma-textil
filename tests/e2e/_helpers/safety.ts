import { Page } from '@playwright/test'

/**
 * Hard-stop si los tests estan corriendo contra produccion.
 * Llamar al principio de cada test como red de seguridad.
 */
export async function ensureNotProduction(page: Page) {
  const baseUrl = process.env.TEST_BASE_URL ?? ''

  // Bloquear si apunta al dominio de produccion (sin -dev)
  if (
    baseUrl === 'https://plataforma-textil.vercel.app' ||
    baseUrl === 'https://www.plataforma-textil.vercel.app'
  ) {
    throw new Error(
      'REFUSED: Tests no pueden correr contra produccion. ' +
      'Usa TEST_BASE_URL=https://plataforma-textil-dev.vercel.app o http://localhost:3000'
    )
  }

  // Doble check: si ya navegamos, verificar la URL actual
  const currentUrl = page.url()
  if (
    currentUrl.includes('plataforma-textil.vercel.app') &&
    !currentUrl.includes('-dev')
  ) {
    throw new Error(
      'REFUSED: Tests detectaron URL de produccion en runtime: ' + currentUrl
    )
  }
}
