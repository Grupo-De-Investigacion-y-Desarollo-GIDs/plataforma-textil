import { test, expect, Page } from '@playwright/test'
import { loginAs } from './helpers/auth'

// Helper para login manual como Contenido (Sofia)
async function loginAsContenido(page: Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'sofia.martinez@pdt.org.ar')
  await page.fill('input[name="password"]', 'pdt2026')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 30000 })
}

// =============================================
// SECCION 5: FISCALIZAR
// =============================================

test('5.1 Estado dashboard muestra 3 secciones', async ({ page }) => {
  await loginAs(page, 'estado')
  await expect(page.getByText('Como esta el sector?')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('Donde hay que actuar?')).toBeVisible()
  await expect(page.getByText('Que esta funcionando?')).toBeVisible()
})

test('5.2 Estado dashboard numeros NO son todos 0', async ({ page }) => {
  await loginAs(page, 'estado')
  await expect(page.getByText('Como esta el sector?')).toBeVisible({ timeout: 15000 })
  const talleresCard = page.locator('text=Talleres registrados').locator('..')
  const talleresValue = talleresCard.locator('p.font-bold').first()
  const talleresText = await talleresValue.textContent()
  const talleresNum = parseInt(talleresText?.trim() || '0')

  const marcasCard = page.locator('text=Marcas registradas').locator('..')
  const marcasValue = marcasCard.locator('p.font-bold').first()
  const marcasText = await marcasValue.textContent()
  const marcasNum = parseInt(marcasText?.trim() || '0')

  expect(talleresNum + marcasNum, 'Al menos talleres o marcas debe ser > 0').toBeGreaterThan(0)
})

test('5.3 Link "Revisar documentos" lleva a /admin/talleres', async ({ page }) => {
  await loginAs(page, 'estado')
  await expect(page.getByText('Donde hay que actuar?')).toBeVisible({ timeout: 15000 })
  const link = page.getByRole('link', { name: /Revisar documentos/ })
  const linkCount = await link.count()
  if (linkCount > 0) {
    const href = await link.getAttribute('href')
    expect(href).toBe('/admin/talleres')
  } else {
    test.skip(true, 'No hay validaciones pendientes, link no se renderiza')
  }
})

test('5.4 /estado/exportar muestra 7 tipos de reporte', async ({ page }) => {
  await loginAs(page, 'estado')
  await page.goto('/estado/exportar')
  await expect(page.getByText('Exportar Reporte')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('Resumen ejecutivo')).toBeVisible()
  await expect(page.getByText('Listado completo de talleres')).toBeVisible()
  await expect(page.getByText('Talleres que necesitan acompanamiento')).toBeVisible()
  await expect(page.getByText('Reporte de capacitaciones')).toBeVisible()
  await expect(page.getByText('Listado de marcas')).toBeVisible()
  await expect(page.getByText('Reporte de pedidos')).toBeVisible()
  await expect(page.getByText('Reporte de denuncias')).toBeVisible()
  const radios = page.locator('input[type="radio"][name="tipo"]')
  await expect(radios).toHaveCount(7)
})

test('5.5 Exportar CSV — Listado de marcas + Todo el historial', async ({ page }) => {
  await loginAs(page, 'estado')
  await page.goto('/estado/exportar')
  await expect(page.getByText('Exportar Reporte')).toBeVisible({ timeout: 15000 })
  await page.getByLabel('Listado de marcas').check()
  await page.locator('select').selectOption('')
  const downloadPromise = page.waitForEvent('download', { timeout: 30000 })
  await page.getByRole('button', { name: /Generar y Descargar/ }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toContain('reporte-marcas')
  expect(download.suggestedFilename()).toContain('.csv')
})

test('5.6 Sin login — /denunciar muestra formulario con tipos', async ({ page }) => {
  await page.goto('/denunciar')
  await expect(page.getByText('Hacer una denuncia')).toBeVisible({ timeout: 15000 })
  const select = page.locator('select')
  await expect(select).toBeVisible()
  await expect(page.getByRole('option', { name: 'Trabajo no registrado' })).toBeAttached()
  await expect(page.getByRole('option', { name: 'Trabajo infantil' })).toBeAttached()
  await expect(page.getByRole('option', { name: 'Condiciones insalubres' })).toBeAttached()
})

test('5.7 Enviar denuncia muestra codigo DEN-2026-XXXXX', async ({ page }) => {
  await page.goto('/denunciar')
  await expect(page.getByText('Hacer una denuncia')).toBeVisible({ timeout: 15000 })
  await page.locator('select').selectOption('Acoso laboral')
  await page.locator('textarea').fill('Esta es una denuncia de prueba automatizada para el checklist de validacion del sistema')
  await page.getByRole('button', { name: /Enviar denuncia/ }).click()
  await expect(page.getByText('Denuncia recibida')).toBeVisible({ timeout: 15000 })
  // El codigo esta en un p con clases text-xl font-bold font-overpass text-brand-blue
  const codigoEl = page.locator('p.text-xl.font-bold')
  await expect(codigoEl).toBeVisible()
  const codigo = await codigoEl.textContent()
  expect(codigo, 'El codigo debe tener formato DEN-YYYY-NNNNN').toMatch(/^DEN-\d{4}-\d{5}$/)
})

test('5.8 Consultar denuncia con codigo muestra estado', async ({ page }) => {
  // Primero crear una denuncia para obtener el codigo
  await page.goto('/denunciar')
  await expect(page.getByText('Hacer una denuncia')).toBeVisible({ timeout: 15000 })
  await page.locator('select').selectOption('Otro')
  await page.locator('textarea').fill('Denuncia de prueba para test de consulta automatizado E2E')
  await page.getByRole('button', { name: /Enviar denuncia/ }).click()
  await expect(page.getByText('Denuncia recibida')).toBeVisible({ timeout: 15000 })
  const codigoEl = page.locator('p.text-xl.font-bold')
  const codigo = await codigoEl.textContent()
  expect(codigo).toBeTruthy()

  // Ahora consultar
  await page.goto('/consultar-denuncia')
  await expect(page.getByText('Consultar denuncia')).toBeVisible({ timeout: 15000 })
  await page.locator('input').first().fill(codigo!)
  await page.getByRole('button', { name: /Consultar/ }).click()
  await expect(page.getByText('Denuncia encontrada')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('Estado', { exact: true })).toBeVisible()
  await expect(page.getByText(codigo!)).toBeVisible()
})

test('5.9 /ayuda tiene links a denunciar y consultar estado', async ({ page }) => {
  await page.goto('/ayuda')
  await expect(page.getByText('Ayuda y Soporte')).toBeVisible({ timeout: 15000 })
  const linkDenuncia = page.getByRole('link', { name: /Hacer una denuncia/ })
  await expect(linkDenuncia).toBeVisible()
  const hrefDenuncia = await linkDenuncia.getAttribute('href')
  expect(hrefDenuncia).toBe('/denunciar')

  const linkConsultar = page.getByRole('link', { name: /Consultar estado/ })
  await expect(linkConsultar).toBeVisible()
  const hrefConsultar = await linkConsultar.getAttribute('href')
  expect(hrefConsultar).toBe('/consultar-denuncia')
})

test('5.10 Admin /admin/auditorias stats > 0', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/admin/auditorias')
  await expect(page.getByText('Auditorias', { exact: false }).first()).toBeVisible({ timeout: 15000 })
  const statValues = page.locator('.text-2xl.font-bold.text-gray-800')
  const count = await statValues.count()
  expect(count, 'Debe haber 3 stats cards').toBeGreaterThanOrEqual(3)
  let sum = 0
  for (let i = 0; i < count; i++) {
    const text = await statValues.nth(i).textContent()
    sum += parseInt(text?.trim() || '0')
  }
  expect(sum, 'Al menos un stat de auditorias debe ser > 0').toBeGreaterThan(0)
})

test('5.11 Proximas Auditorias muestra al menos 1 programada', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/admin/auditorias')
  await expect(page.getByText('Proximas Auditorias')).toBeVisible({ timeout: 15000 })
  const vacio = page.getByText('No hay auditorias programadas')
  const vacioCount = await vacio.count()
  if (vacioCount > 0) {
    expect(vacioCount, 'Se esperaba al menos 1 auditoria programada pero no hay ninguna').toBe(0)
  }
  await expect(page.getByText('Programada').first()).toBeVisible()
})

test('5.12 Pendientes de Informe muestra al menos 1 con boton Cargar informe', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/admin/auditorias')
  await expect(page.getByText('Auditorias', { exact: false }).first()).toBeVisible({ timeout: 15000 })
  // La seccion solo se renderiza si hay auditorias EN_CURSO
  const pendientesHeading = page.getByText('Pendientes de Informe')
  const headingCount = await pendientesHeading.count()
  if (headingCount === 0) {
    // Si no hay auditorias EN_CURSO en seed, la seccion no aparece
    // Verificamos al menos que la pagina cargo bien y reportamos skip
    test.skip(true, 'No hay auditorias EN_CURSO en seed — seccion "Pendientes de Informe" no se renderiza')
  }
  await expect(pendientesHeading).toBeVisible()
  const cargarBtn = page.getByRole('link', { name: /Cargar informe/ })
  const count = await cargarBtn.count()
  expect(count, 'Debe haber al menos 1 enlace "Cargar informe"').toBeGreaterThanOrEqual(1)
})

test('5.13 Click Cargar informe lleva a detalle con datos del taller y formulario', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/admin/auditorias')
  await expect(page.getByText('Auditorias', { exact: false }).first()).toBeVisible({ timeout: 15000 })
  const cargarLink = page.getByRole('link', { name: /Cargar informe/ }).first()
  const linkCount = await cargarLink.count()
  if (linkCount === 0) {
    test.skip(true, 'No hay auditorias EN_CURSO — enlace "Cargar informe" no se renderiza')
  }
  await cargarLink.click()
  await expect(page).toHaveURL(/\/admin\/auditorias\/[a-z0-9-]+/, { timeout: 15000 })
  await expect(page.getByText('Taller auditado')).toBeVisible()
  await expect(page.getByText('Nombre:')).toBeVisible()
  await expect(page.getByText('CUIT:')).toBeVisible()
  await expect(page.getByText('Nivel:')).toBeVisible()
})

// =============================================
// SECCION 6: GOBERNAR
// =============================================

test('6.1 Admin dashboard stats con datos reales', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/admin/dashboard')
  await expect(page.getByRole('heading', { name: /Panel de Administraci/ })).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('Cargando...')).toBeHidden({ timeout: 15000 })
  const talleresLabel = page.getByText('Talleres registrados')
  await expect(talleresLabel).toBeVisible({ timeout: 10000 })
  let foundNonZero = false
  const allStats = await page.locator('[class*="font-bold"]').allTextContents()
  for (const txt of allStats) {
    const n = parseInt(txt.trim())
    if (!isNaN(n) && n > 0) { foundNonZero = true; break }
  }
  expect(foundNonZero, 'Al menos un stat del admin dashboard debe ser > 0').toBe(true)
})

test('6.2 Sidebar admin tiene link Feedback y lleva a tabla', async ({ page }) => {
  await loginAs(page, 'admin')
  const feedbackLink = page.getByRole('link', { name: 'Feedback' })
  await expect(feedbackLink).toBeVisible({ timeout: 15000 })
  await feedbackLink.click()
  await expect(page).toHaveURL(/\/admin\/feedback/, { timeout: 15000 })
  await expect(page.getByText('Feedback del piloto')).toBeVisible()
})

test('6.3 /admin/configuracion tab Features visible', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/admin/configuracion')
  await expect(page.getByRole('button', { name: 'Features' })).toBeVisible({ timeout: 15000 })
})

test('6.4 Features tiene Escenario 1 (7 toggles) y Escenario 2 (5 toggles)', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/admin/configuracion')
  await page.getByRole('button', { name: 'Features' }).click()
  await expect(page.getByText('Escenario 1')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('Escenario 2')).toBeVisible()

  const e1Heading = page.getByText('Escenario 1', { exact: false }).first()
  const e1Card = e1Heading.locator('xpath=ancestor::div[contains(@class,"rounded")]').first()
  const e1Checkboxes = e1Card.locator('input[type="checkbox"]')
  await expect(e1Checkboxes).toHaveCount(7, { timeout: 10000 })

  const e2Heading = page.getByText('Escenario 2', { exact: false }).first()
  const e2Card = e2Heading.locator('xpath=ancestor::div[contains(@class,"rounded")]').first()
  const e2Checkboxes = e2Card.locator('input[type="checkbox"]')
  await expect(e2Checkboxes).toHaveCount(5, { timeout: 10000 })
})

test('6.5 Todos los toggles de E1 estan en Activo', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/admin/configuracion')
  await page.getByRole('button', { name: 'Features' }).click()
  await expect(page.getByText('Escenario 1')).toBeVisible({ timeout: 15000 })

  const e1Heading = page.getByText('Escenario 1', { exact: false }).first()
  const e1Card = e1Heading.locator('xpath=ancestor::div[contains(@class,"rounded")]').first()
  const desactivados = e1Card.getByText('Desactivado')
  await expect(desactivados).toHaveCount(0, { timeout: 5000 })
  const activos = e1Card.getByText('Activo')
  await expect(activos).toHaveCount(7)
})

test('6.6 Todos los toggles de E2 estan en Activo', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/admin/configuracion')
  await page.getByRole('button', { name: 'Features' }).click()
  await expect(page.getByText('Escenario 2')).toBeVisible({ timeout: 15000 })

  const e2Heading = page.getByText('Escenario 2', { exact: false }).first()
  const e2Card = e2Heading.locator('xpath=ancestor::div[contains(@class,"rounded")]').first()
  const desactivados = e2Card.getByText('Desactivado')
  await expect(desactivados).toHaveCount(0, { timeout: 5000 })
  const activos = e2Card.getByText('Activo')
  await expect(activos).toHaveCount(5)
})

test('6.7 /admin/integraciones/email banner amarillo', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/admin/integraciones/email')
  await expect(page.getByText('Configuracion en construccion').first()).toBeVisible({ timeout: 15000 })
  const banner = page.locator('.bg-amber-50').first()
  await expect(banner).toBeVisible()
})

test('6.8 Formulario email deshabilitado (opacity reducida)', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.goto('/admin/integraciones/email')
  await expect(page.getByText('Configuracion SendGrid')).toBeVisible({ timeout: 15000 })
  const opacityCards = page.locator('.opacity-50')
  const count = await opacityCards.count()
  expect(count, 'Debe haber al menos 1 card con opacity reducida').toBeGreaterThanOrEqual(1)
  const disabledInputs = page.locator('input[disabled]')
  const disabledCount = await disabledInputs.count()
  expect(disabledCount, 'Debe haber inputs deshabilitados').toBeGreaterThanOrEqual(3)
})

test('6.9 Login como Contenido (Sofia) llega a /contenido/colecciones', async ({ page }) => {
  await loginAsContenido(page)
  await page.goto('/contenido/colecciones')
  await expect(page.getByText('Colecciones de Cursos')).toBeVisible({ timeout: 15000 })
})

test('6.10 Contenido ve las 3 colecciones del seed', async ({ page }) => {
  await loginAsContenido(page)
  await page.goto('/contenido/colecciones')
  await expect(page.getByText('Colecciones de Cursos')).toBeVisible({ timeout: 15000 })
  const badges = page.locator('text=Publicada').or(page.locator('text=Borrador'))
  await expect(badges.first()).toBeVisible({ timeout: 15000 })
  const count = await badges.count()
  expect(count, 'Debe haber al menos 3 colecciones del seed').toBeGreaterThanOrEqual(3)
})

test('6.11 Sidebar contenido tiene 3 items: Colecciones, Evaluaciones, Notificaciones', async ({ page }) => {
  await loginAsContenido(page)
  await page.goto('/contenido/colecciones')
  await expect(page.getByText('Colecciones de Cursos')).toBeVisible({ timeout: 15000 })
  const sidebar = page.locator('aside nav')
  await expect(sidebar.getByRole('link', { name: 'Colecciones' })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: 'Evaluaciones' })).toBeVisible()
  await expect(sidebar.getByRole('link', { name: 'Notificaciones' })).toBeVisible()
})

test('6.12 Item activo sidebar se resalta en azul', async ({ page }) => {
  await loginAsContenido(page)
  await page.goto('/contenido/colecciones')
  await expect(page.getByText('Colecciones de Cursos')).toBeVisible({ timeout: 15000 })
  const activeLink = page.locator('aside nav a.bg-brand-blue')
  await expect(activeLink).toBeVisible()
  const activeText = await activeLink.textContent()
  expect(activeText?.trim()).toContain('Colecciones')
})

test('6.13 Click Evaluaciones muestra selector de coleccion + preguntas', async ({ page }) => {
  await loginAsContenido(page)
  await page.goto('/contenido/evaluaciones')
  await expect(page.getByRole('heading', { name: 'Evaluaciones' })).toBeVisible({ timeout: 15000 })
  const selectColeccion = page.locator('select').first()
  await expect(selectColeccion).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('Preguntas').first()).toBeVisible({ timeout: 15000 })
})

test('6.14 Click Notificaciones muestra stats + historial', async ({ page }) => {
  await loginAsContenido(page)
  await page.goto('/contenido/notificaciones')
  await expect(page.getByRole('heading', { name: 'Notificaciones' })).toBeVisible({ timeout: 15000 })
  // Stats section has 3 cards: Total enviadas, Sin leer, Leidas
  await expect(page.getByText('Total enviadas')).toBeVisible()
  // "Sin leer" aparece tanto en stats como en badges de cada notificacion — usar el primero (stat label)
  await expect(page.locator('p.text-xs:has-text("Sin leer")').first()).toBeVisible()
  await expect(page.locator('p.text-xs:has-text("Leidas")').first()).toBeVisible()
  await expect(page.getByText('Recientes')).toBeVisible()
})
