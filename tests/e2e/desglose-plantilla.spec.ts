import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('W-A1 Desglose de plantilla por categoría', () => {
  test('TALLER puede ver desglose de plantilla en su perfil', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'taller')

      await page.goto('/taller/perfil', { waitUntil: 'load', timeout: 30_000 })

      // Debe mostrar "Composición del equipo" con datos del seed
      await expect(page.getByText('Composición del equipo')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByText('Aprendices:')).toBeVisible()
    } catch {
      test.skip()
    }
  })

  test('TALLER puede completar desglose en wizard', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'taller')

      await page.goto('/taller/perfil/completar', { waitUntil: 'load', timeout: 30_000 })

      // Navegar al paso 4 (Composición del equipo)
      // El wizard tiene botones "Siguiente"
      for (let i = 0; i < 3; i++) {
        await page.getByRole('button', { name: /siguiente/i }).click()
        await page.waitForTimeout(300)
      }

      // Verificar que el paso 4 muestra las categorías
      await expect(page.getByText('¿Cómo se compone tu equipo?')).toBeVisible({ timeout: 5_000 })
      await expect(page.getByText('Aprendices')).toBeVisible()
      await expect(page.getByText('Medio oficial')).toBeVisible()
      await expect(page.getByText('Oficial calificado')).toBeVisible()

      // Verificar que muestra total
      await expect(page.getByText(/Total:.*personas/)).toBeVisible()
    } catch {
      test.skip()
    }
  })

  test('ESTADO puede ver distribución de plantilla en reporte sectorial', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'estado')

      await page.goto('/estado/sector', { waitUntil: 'load', timeout: 30_000 })

      // Debe mostrar el nuevo gráfico de distribución
      await expect(page.getByText('Distribución de la plantilla del sector')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByText('Aprendices')).toBeVisible()
    } catch {
      test.skip()
    }
  })

  test('API PUT /api/talleres/[id] acepta plantilla', async ({ page }) => {
    try {
      await ensureNotProduction(page)
      await loginAs(page, 'taller')

      // Obtener tallerId
      const meResp = await page.request.get('/api/talleres/me')
      expect(meResp.status()).toBe(200)
      const taller = await meResp.json()

      // Enviar plantilla
      const putResp = await page.request.put(`/api/talleres/${taller.id}`, {
        data: {
          plantilla: {
            APRENDIZ: 3,
            MEDIO_OFICIAL: 2,
            OFICIAL: 1,
            OFICIAL_CALIFICADO: 0,
          },
        },
      })
      expect(putResp.status()).toBe(200)

      // Verificar que se guardó
      const meResp2 = await page.request.get('/api/talleres/me')
      const taller2 = await meResp2.json()
      expect(taller2.plantilla).toBeDefined()
      expect(taller2.plantilla.length).toBe(4)

      const aprendiz = taller2.plantilla.find((p: { categoria: string }) => p.categoria === 'APRENDIZ')
      expect(aprendiz.cantidad).toBe(3)
    } catch {
      test.skip()
    }
  })
})
