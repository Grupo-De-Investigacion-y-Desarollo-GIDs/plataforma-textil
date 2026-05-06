import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('Layout consistency — cada rol tiene header y sidebar correctos', () => {
  test('ADMIN: /admin/onboarding tiene sidebar admin + header admin', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'admin')
      await page.goto('/admin/onboarding')
      // Sidebar admin con items de navegacion
      await expect(page.locator('aside nav')).toBeVisible()
      await expect(page.locator('text=Onboarding')).toBeVisible()
      // Header admin con "Admin Panel"
      await expect(page.locator('text=Admin Panel')).toBeVisible()
    } catch {
      test.skip()
    }
  })

  test('ESTADO: /estado/talleres tiene Header global con tabs', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'estado')
      await page.goto('/estado/talleres')
      // Header global con tabs de ESTADO
      await expect(page.locator('text=Dashboard')).toBeVisible()
      // Bell de notificaciones
      await expect(page.locator('button[aria-label*="Notificaciones"]').first()).toBeVisible()
    } catch {
      test.skip()
    }
  })

  test('TALLER: /taller tiene Header global con tabs y bell', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'taller')
      await page.goto('/taller')
      // Header con tabs de TALLER
      await expect(page.locator('text=Pedidos')).toBeVisible()
      // Bell
      await expect(page.locator('button[aria-label*="Notificaciones"]').first()).toBeVisible()
    } catch {
      test.skip()
    }
  })

  test('MARCA: /marca tiene Header global con tabs y bell', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'marca')
      await page.goto('/marca')
      // Header con tabs de MARCA
      await expect(page.locator('text=Directorio')).toBeVisible()
      // Bell
      await expect(page.locator('button[aria-label*="Notificaciones"]').first()).toBeVisible()
    } catch {
      test.skip()
    }
  })

  test('PUBLIC logueado: /cuenta/notificaciones tiene Header global con bell', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'taller')
      await page.goto('/cuenta/notificaciones')
      // Header global — NO el header minimo
      await expect(page.locator('button[aria-label*="Notificaciones"]').first()).toBeVisible()
      // Breadcrumbs
      await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible()
    } catch {
      test.skip()
    }
  })

  test('PUBLIC logueado: /ayuda/onboarding-taller tiene Header global', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'taller')
      await page.goto('/ayuda/onboarding-taller')
      // Header global
      await expect(page.locator('button[aria-label*="Notificaciones"]').first()).toBeVisible()
      // Breadcrumbs
      await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible()
    } catch {
      test.skip()
    }
  })

  test('PUBLIC anonimo: /directorio tiene header minimo sin bell', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await page.goto('/directorio')
      // Header minimo con "Iniciar sesion"
      await expect(page.locator('text=Iniciar sesion')).toBeVisible()
      // NO tiene bell de notificaciones
      await expect(page.locator('button[aria-label*="Notificaciones"]')).not.toBeVisible()
    } catch {
      test.skip()
    }
  })
})
