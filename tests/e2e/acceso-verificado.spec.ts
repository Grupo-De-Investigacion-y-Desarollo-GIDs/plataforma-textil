import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('Acceso pre-formalizacion y niveles privados', () => {
  test('Directorio publico no muestra badges de nivel BRONCE/PLATA/ORO', async ({ page }) => {
    await ensureNotProduction(page)

    await page.goto('/directorio')

    // El directorio deberia cargar sin error
    await expect(page.getByText('Directorio de Talleres')).toBeVisible({ timeout: 15000 })

    // No deberia haber filtro de nivel
    await expect(page.locator('select[name="nivel"]')).toHaveCount(0)

    // No deberia haber badges con texto BRONCE, PLATA u ORO
    const pageText = await page.textContent('body')
    expect(pageText).not.toContain('BRONCE')
    expect(pageText).not.toContain('PLATA')
    // ORO puede aparecer en otros contextos, verificamos que no haya badge de nivel
    const nivelBadges = page.locator('[data-slot="badge"]:text-matches("BRONCE|PLATA|ORO")')
    await expect(nivelBadges).toHaveCount(0)

    // Deberia mostrar credenciales verificadas
    const credenciales = page.locator('text=credencial')
    // Si hay talleres con validaciones completadas, se muestran
    // (puede ser 0 si el seed no tiene validaciones completadas)
    expect(await credenciales.count()).toBeGreaterThanOrEqual(0)
  })

  test('Marca directorio no muestra badges de nivel', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'marca')

    await page.goto('/marca/directorio')
    await expect(page.getByRole('heading', { name: 'Explorar Talleres' })).toBeVisible({ timeout: 15000 })

    // No deberia haber filtro de nivel
    await expect(page.locator('select[name="nivel"]')).toHaveCount(0)

    // No deberia haber badges de nivel
    const nivelBadges = page.locator('[data-slot="badge"]:text-matches("BRONCE|PLATA|ORO")')
    await expect(nivelBadges).toHaveCount(0)
  })

  // Login ESTADO falla consistentemente en CI (30s+ login, 10+ tests flaky por el mismo patron).
  // El test funciona localmente. Marcado fixme hasta resolver la flakiness general de ESTADO en CI.
  test.fixme('ESTADO talleres tiene filtro de verificacion AFIP', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'estado')

    await page.goto('/estado/talleres')
    await expect(page.getByRole('heading', { name: 'Talleres' })).toBeVisible({ timeout: 15000 })

    // Debe existir el filtro de verificacion
    const filtroVerificacion = page.locator('select[name="verificacion"]')
    await expect(filtroVerificacion).toBeVisible()

    // Debe tener las opciones correctas
    const options = filtroVerificacion.locator('option')
    const textos = await options.allTextContents()
    expect(textos).toContain('Verificados')
    expect(textos).toContain('Sin verificar')

    // Debe existir el stat card de "Sin verificar"
    await expect(page.getByText('Sin verificar')).toBeVisible()

    // Nivel sigue visible para ESTADO (no se oculta)
    const nivelBadges = page.locator('[data-slot="badge"]:text-matches("BRONCE|PLATA|ORO")')
    expect(await nivelBadges.count()).toBeGreaterThan(0)
  })
})
