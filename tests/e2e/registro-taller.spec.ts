import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'

// Preview: CUIT verificacion + email + cold start exceden timeout consistentemente.
// Funciona localmente y en produccion. Flakiness de entorno preview.
test.fixme('Taller se registra y hace primer login', async ({ page }) => {
  await ensureNotProduction(page)

  const ts = Date.now()
  const email = `test-taller-${ts}@laaguja.test`
  const cuit = `20${ts.toString().slice(-8)}5`

  // Step 0: seleccionar rol TALLER
  await page.goto('/registro')
  await page.getByText('Taller', { exact: false }).filter({ hasText: 'ofrecer mis servicios' }).click()

  // Step 1: datos personales
  await page.fill('input[name="nombre"]', `Taller E2E ${ts}`)
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', 'pdt2026test')
  await page.fill('input[name="confirmPassword"]', 'pdt2026test')
  await page.fill('input[name="phone"]', '11 1234-5678')
  await page.locator('input[type="checkbox"][name="terminos"]').check()

  // Avanzar al step 2
  await page.getByRole('button', { name: 'Siguiente' }).click()

  // Step 2: datos del taller
  await page.fill('input[name="nombreEntidad"]', `Taller E2E ${ts}`)

  // CUIT: usar click + type + Tab para que react-hook-form procese el valor
  // y onBlur dispare la verificacion async
  const cuitInput = page.locator('input[name="cuit"]')
  await cuitInput.click()
  await cuitInput.pressSequentially(cuit, { delay: 20 })
  await page.keyboard.press('Tab') // blur

  // Esperar que la verificacion CUIT termine:
  // "Verificado por ARCA" (si el CUIT es valido) o
  // "No pudimos verificar" (si ARCA no responde) o
  // "Verificando CUIT" (loading) luego uno de los anteriores
  // El boton se habilita cuando cuitVerificado || cuitPendiente
  const crearCuentaBtn = page.getByRole('button', { name: 'Crear cuenta' })
  await expect(crearCuentaBtn).toBeEnabled({ timeout: 20000 })
  await crearCuentaBtn.click()

  // Debe redirigir al dashboard del taller
  // Timeout 60s: registro + CUIT verificacion + email + redirect en preview con cold start
  await expect(page).toHaveURL(/\/taller/, { timeout: 60000 })

  // Verificar que la pagina del dashboard cargo (cualquier contenido)
  await page.waitForLoadState('domcontentloaded')
})
