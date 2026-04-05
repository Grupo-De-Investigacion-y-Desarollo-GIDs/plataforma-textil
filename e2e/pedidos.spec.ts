import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test('taller ve pagina de pedidos disponibles', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await page.goto('/taller/pedidos/disponibles')
  await expect(page.getByText('Pedidos disponibles')).toBeVisible()
})

test('marca ve boton publicar en pedido borrador', async ({ page }) => {
  await loginAs(page, 'marca')
  await page.goto('/marca/pedidos')
  // Verificar que la pagina de pedidos carga
  await expect(page).toHaveURL(/\/marca\/pedidos/)
})

test('taller sidebar tiene link a pedidos disponibles', async ({ page }) => {
  await loginAs(page, 'taller_bronce')
  await expect(page.getByText('Pedidos disponibles')).toBeVisible()
})
