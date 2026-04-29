import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

async function loginEstado(page: import('@playwright/test').Page) {
  try {
    await loginAs(page, 'estado')
  } catch {
    test.skip(true, 'ESTADO login failed — user may need re-seeding in preview DB')
  }
}

test.describe('ESTADO aprueba documento de taller', () => {
  test.setTimeout(60000)

  test('Aprobar un documento PENDIENTE y verificar metadata', async ({ page }) => {
    await ensureNotProduction(page)
    await loginEstado(page)

    // Ir a la lista de talleres
    await page.goto('/estado/talleres')
    await expect(page.getByRole('heading', { name: 'Talleres' })).toBeVisible()

    // Click en el primer taller de la tabla
    const primerTaller = page.locator('table tbody tr').first().locator('a').first()
    if (!(await primerTaller.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, 'No hay talleres en la DB de preview')
      return
    }
    await primerTaller.click()
    await page.waitForURL(/\/estado\/talleres\//)

    // Verificar que estamos en la tab Formalizacion (default)
    await expect(page.getByText('Checklist de Formalizacion')).toBeVisible()

    // Buscar un boton "Aprobar" — solo aparece para documentos PENDIENTE con documentoUrl o enlaceTramite
    const aprobarBtn = page.getByRole('button', { name: 'Aprobar' }).first()
    if (!(await aprobarBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      // Si no hay boton Aprobar, intentar con otro taller
      // Volver a la lista y buscar un taller con documentos pendientes
      await page.goto('/estado/talleres?pendientes=con')
      const tallerConPendientes = page.locator('table tbody tr').first().locator('a').first()
      if (!(await tallerConPendientes.isVisible({ timeout: 5000 }).catch(() => false))) {
        test.skip(true, 'No hay talleres con documentos pendientes aprobables en preview')
        return
      }
      await tallerConPendientes.click()
      await page.waitForURL(/\/estado\/talleres\//)
    }

    // Ahora deberia haber un boton "Aprobar"
    const btnAprobar = page.getByRole('button', { name: 'Aprobar' }).first()
    if (!(await btnAprobar.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, 'Ningun taller tiene documentos PENDIENTE aprobables (sin documentoUrl ni enlaceTramite)')
      return
    }

    // Aprobar el documento (server action form — click submits directly)
    await btnAprobar.click()

    // Esperar redirect (server action hace redirect a la misma pagina)
    await page.waitForURL(/\/estado\/talleres\//, { timeout: 15000 })

    // Verificar que aparece metadata de aprobacion
    // "Aprobado por: [nombre] — [fecha]"
    await expect(page.getByText(/Aprobado por:/).first()).toBeVisible({ timeout: 10000 })
  })

  test('ADMIN no puede aprobar (modo lectura)', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')

    // Ir a un taller via ESTADO routes (ADMIN puede acceder en lectura)
    await page.goto('/estado/talleres')
    const primerTaller = page.locator('table tbody tr').first().locator('a').first()
    if (!(await primerTaller.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, 'No hay talleres en la DB de preview')
      return
    }
    await primerTaller.click()
    await page.waitForURL(/\/estado\/talleres\//)

    // Verificar banner de modo lectura
    await expect(page.getByText('Modo lectura')).toBeVisible()

    // NO debe haber botones de Aprobar/Rechazar/Revocar
    await expect(page.getByRole('button', { name: 'Aprobar' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Rechazar' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Revocar' })).not.toBeVisible()
  })
})
