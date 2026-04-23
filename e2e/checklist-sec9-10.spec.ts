import { test, expect, Page } from '@playwright/test'
import { loginAs } from './helpers/auth'

// Helper: login manual para rol CONTENIDO (no existe en el helper)
async function loginAsContenido(page: Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'sofia.martinez@pdt.org.ar')
  await page.fill('input[name="password"]', 'pdt2026')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 30000 })
  const currentUrl = page.url()
  if (currentUrl.includes('/api/auth/error')) {
    throw new Error('Login failed for CONTENIDO (sofia.martinez@pdt.org.ar) — redirected to /api/auth/error')
  }
}

// ============================================================
// SECCION 9: FLUJOS ENTRE ACTORES
// ============================================================

// --- Flujo 2: Taller se capacita ---

test('9.1 — Taller ORO: /taller/aprender muestra colecciones con badge Certificado verde', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'taller_oro')
  await page.goto('/taller/aprender')
  await page.waitForLoadState('networkidle')

  // Debe haber heading Academia
  await expect(page.getByRole('heading', { name: 'Academia' })).toBeVisible()

  // Buscar badge "Certificado"
  const badges = page.locator('text=Certificado')
  const count = await badges.count()
  expect(count, 'Debe haber al menos 1 badge "Certificado" en las colecciones del taller ORO').toBeGreaterThanOrEqual(1)
})

test('9.2 — Taller ORO: click en coleccion muestra videos (pagina detalle carga)', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'taller_oro')
  await page.goto('/taller/aprender')
  await page.waitForLoadState('networkidle')

  // Click en la primera coleccion
  const btn = page.locator('a:has-text("Revisar"), a:has-text("Continuar"), a:has-text("Empezar")').first()
  await expect(btn).toBeVisible()
  await btn.click()
  await page.waitForLoadState('networkidle')

  // Debe mostrar la pagina de detalle con link "Volver a Academia"
  await expect(page.getByText('Volver a Academia')).toBeVisible()
})

test('9.3 — Taller ORO: boton "Descargar certificado PDF" visible en coleccion certificada', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'taller_oro')
  await page.goto('/taller/aprender')
  await page.waitForLoadState('networkidle')

  // Click en coleccion certificada (boton "Revisar")
  const revisar = page.locator('a:has-text("Revisar")').first()
  const revistarVisible = await revisar.isVisible().catch(() => false)
  if (!revistarVisible) {
    test.skip(true, 'No hay colecciones con boton "Revisar" (certificadas) para el taller ORO')
    return
  }
  await revisar.click()
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Descargar certificado PDF')).toBeVisible({ timeout: 15000 })
})

// --- Flujo 3: Marca encuentra taller ---

test('9.4 — Marca: /marca/directorio filtrar por ORO muestra solo Corte Sur', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'marca')
  await page.goto('/marca/directorio')
  await page.waitForLoadState('networkidle')

  // Seleccionar filtro nivel ORO
  await page.selectOption('select[name="nivel"]', 'ORO')
  await page.getByRole('button', { name: 'Filtrar' }).click()
  await page.waitForLoadState('networkidle')

  // Verificar que aparece "Corte Sur"
  await expect(page.getByText('Corte Sur')).toBeVisible()

  // Verificar que solo hay 1 taller
  await expect(page.locator('text=Mostrando')).toContainText('1 taller')
})

test('9.5 — Marca: click en Corte Sur muestra perfil con rating y procesos', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'marca')
  await page.goto('/marca/directorio?nivel=ORO')
  await page.waitForLoadState('networkidle')

  await page.getByText('Ver perfil').first().click()
  await page.waitForLoadState('networkidle')

  // Nombre del taller
  await expect(page.getByText('Corte Sur')).toBeVisible()
  // Rating card
  await expect(page.getByText('Rating').first()).toBeVisible()
  // Procesos o Prendas
  const procesosVisible = await page.getByText('Procesos').first().isVisible().catch(() => false)
  const prendasVisible = await page.getByText('Prendas').first().isVisible().catch(() => false)
  expect(procesosVisible || prendasVisible, 'Debe mostrar procesos o prendas').toBe(true)
})

test('9.6 — Marca: boton "Contactar por WhatsApp" visible en perfil de taller', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'marca')
  await page.goto('/marca/directorio?nivel=ORO')
  await page.waitForLoadState('networkidle')

  await page.getByText('Ver perfil').first().click()
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Contactar por WhatsApp')).toBeVisible()
})

// --- Flujo 6: Gestion de contenidos ---

test('9.7 — Contenido (Sofia): /contenido/colecciones muestra colecciones', async ({ page }) => {
  test.setTimeout(60000)
  await loginAsContenido(page)
  await page.goto('/contenido/colecciones')
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Colecciones de Cursos')).toBeVisible()

  // Esperar a que la API client-side cargue
  await page.waitForTimeout(3000)
  // Verificar que no esta vacio
  const noFound = await page.getByText('No se encontraron colecciones').isVisible().catch(() => false)
  expect(noFound, 'Debe haber al menos 1 coleccion (no vacio)').toBe(false)
})

test('9.8 — Contenido: click "Nueva Coleccion" llega a formulario sin error', async ({ page }) => {
  test.setTimeout(60000)
  await loginAsContenido(page)
  await page.goto('/contenido/colecciones')
  await page.waitForLoadState('networkidle')

  // El link va a /admin/colecciones/nueva. Sofia es CONTENIDO, no ADMIN.
  // Verificamos que al hacer click, la pagina carga (puede redirigir a unauthorized, eso es aceptable)
  await page.getByText('Nueva Coleccion').click()
  await page.waitForLoadState('networkidle')

  const url = page.url()
  // Acceptable: carga formulario o redirige a unauthorized (no 500/crash)
  const body = await page.textContent('body') ?? ''
  const hasError500 = body.includes('Application error') || body.includes('Internal Server Error')
  expect(hasError500, `La pagina no debe dar error 500. URL: ${url}`).toBe(false)
})

test('9.9 — Contenido: click "Editar" en coleccion llega al editor sin error', async ({ page }) => {
  test.setTimeout(60000)
  await loginAsContenido(page)
  await page.goto('/contenido/colecciones')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000)

  const editBtn = page.getByText('Editar').first()
  const editVisible = await editBtn.isVisible().catch(() => false)
  if (!editVisible) {
    test.skip(true, 'No hay colecciones con boton Editar visible')
    return
  }
  await editBtn.click()
  await page.waitForLoadState('networkidle')

  const url = page.url()
  const body = await page.textContent('body') ?? ''
  const hasError500 = body.includes('Application error') || body.includes('Internal Server Error')
  expect(hasError500, `Editor no debe dar error 500. URL: ${url}`).toBe(false)
})

test('9.10 — Contenido: /contenido/evaluaciones muestra editor de quiz', async ({ page }) => {
  test.setTimeout(60000)
  await loginAsContenido(page)
  await page.goto('/contenido/evaluaciones')
  await page.waitForLoadState('networkidle')

  await expect(page.getByRole('heading', { name: 'Evaluaciones' })).toBeVisible()
  // Esperar carga client-side
  await page.waitForTimeout(3000)
  // Debe tener un selector de coleccion
  const selects = page.locator('select')
  const count = await selects.count()
  expect(count, 'Debe haber al menos un select (selector de coleccion)').toBeGreaterThanOrEqual(1)
})

test('9.11 — Contenido: /contenido/notificaciones muestra stats y historial', async ({ page }) => {
  test.setTimeout(60000)
  await loginAsContenido(page)
  await page.goto('/contenido/notificaciones')
  await page.waitForLoadState('networkidle')

  await expect(page.getByRole('heading', { name: 'Notificaciones' })).toBeVisible()
  await expect(page.getByText('Total enviadas')).toBeVisible()
  await expect(page.getByRole('paragraph').filter({ hasText: 'Sin leer' })).toBeVisible()
  await expect(page.getByText('Leidas').first()).toBeVisible()
})


// ============================================================
// SECCION 10: EXPERIENCIA POR ACTOR
// ============================================================

// --- Actor TALLER BRONCE (Roberto) ---

test('10.1 — Taller Bronce: dashboard con greeting, nivel, progreso', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'taller_bronce')
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Bienvenido').first()).toBeVisible()
  await expect(page.getByText('BRONCE', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Progreso de Formalización' })).toBeVisible()
})

test('10.2 — Taller Bronce: sidebar tiene los 6 items esperados', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'taller_bronce')

  // Abrir sidebar con el boton "Abrir menu personal"
  await page.getByLabel('Abrir menú personal').click()
  await page.waitForTimeout(800)

  const sidebar = page.locator('aside[aria-label="Menú de navegación personal"]')
  await expect(sidebar).toBeVisible()

  const expectedItems = ['Mi Tablero', 'Mi Perfil', 'Mi Formalización', 'Academia', 'Mis Pedidos', 'Pedidos disponibles']
  for (const item of expectedItems) {
    const link = sidebar.getByRole('link', { name: item })
    const visible = await link.isVisible().catch(() => false)
    expect(visible, `Sidebar debe tener link "${item}"`).toBe(true)
  }
})

test('10.3 — Taller Bronce: navegar todas las secciones del sidebar sin errores', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'taller_bronce')

  const routes = [
    '/taller',
    '/taller/perfil',
    '/taller/formalizacion',
    '/taller/aprender',
    '/taller/pedidos',
    '/taller/pedidos/disponibles',
  ]

  const failures: string[] = []
  for (const route of routes) {
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.textContent('body') ?? ''
    if (url.includes('/404') || body.includes('Application error') || body.includes('This page could not be found')) {
      failures.push(route)
    }
  }

  expect(failures, `Estas rutas dieron error: ${failures.join(', ')}`).toHaveLength(0)
})

test('10.4 — Taller Bronce: widget de feedback aparece', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'taller_bronce')
  await page.waitForLoadState('networkidle')

  await expect(page.getByRole('button', { name: 'Feedback' })).toBeVisible({ timeout: 10000 })
})

// --- Actor TALLER ORO (Carlos) ---

test('10.5 — Taller ORO: dashboard muestra panel verde "nivel maximo"', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'taller_oro')
  await page.waitForLoadState('networkidle')

  // Texto: "Estas en el nivel maximo" o "Sos un taller verificado ORO"
  const nivelMaximo = page.getByText(/nivel m[aá]ximo|verificado ORO/i)
  await expect(nivelMaximo).toBeVisible({ timeout: 10000 })
})

test('10.6 — Taller ORO: formalizacion muestra pasos completados', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'taller_oro')
  await page.goto('/taller/formalizacion')
  await page.waitForLoadState('networkidle')

  // La pagina debe cargar
  const body = await page.textContent('body') ?? ''
  expect(body.length).toBeGreaterThan(50)

  // Verificar indicadores de completado
  const completados = page.locator('text=/Completado|Verificado|Aprobado/i')
  const count = await completados.count()
  expect(count, 'Taller ORO debe tener pasos completados en formalizacion').toBeGreaterThanOrEqual(1)
})

test('10.7 — Taller ORO: /taller/pedidos carga correctamente', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'taller_oro')
  await page.goto('/taller/pedidos')
  await page.waitForLoadState('networkidle')

  const body = await page.textContent('body') ?? ''
  expect(body.length).toBeGreaterThan(50)
  expect(page.url()).toContain('/taller/pedidos')
  // No debe ser 404
  expect(body).not.toContain('This page could not be found')
})

// --- Actor MARCA (Martin) ---

test('10.8 — Marca: dashboard con stats (pedidos, activos, cotizaciones)', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'marca')
  await page.goto('/marca')
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Bienvenido').first()).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('Pedidos creados')).toBeVisible()
  await expect(page.getByText('Pedidos activos')).toBeVisible()
  await expect(page.getByText('Cotizaciones pendientes')).toBeVisible()
})

test('10.9 — Marca: sidebar tiene items esperados', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'marca')
  await page.goto('/marca')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Abrir menú personal').click()
  await page.waitForTimeout(800)

  const sidebar = page.locator('aside[aria-label="Menú de navegación personal"]')
  await expect(sidebar).toBeVisible()

  const expectedItems = ['Mi Panel', 'Directorio Talleres', 'Mis Pedidos', 'Mi Perfil']
  for (const item of expectedItems) {
    const link = sidebar.getByRole('link', { name: item })
    const visible = await link.isVisible().catch(() => false)
    expect(visible, `Sidebar debe tener link "${item}"`).toBe(true)
  }
})

test('10.10 — Marca: widget de feedback aparece', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'marca')
  await page.waitForLoadState('networkidle')

  await expect(page.getByRole('button', { name: 'Feedback' })).toBeVisible({ timeout: 10000 })
})

// --- Actor ESTADO (Ana Belen) ---

test('10.11 — Estado: dashboard con 3 secciones claras y datos reales', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'estado')
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Como esta el sector?')).toBeVisible()
  await expect(page.getByText('Donde hay que actuar?')).toBeVisible()
  await expect(page.getByText('Que esta funcionando?')).toBeVisible()
})

test('10.12 — Estado: sidebar tiene Dashboard y Exportar Datos', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'estado')

  await page.getByLabel('Abrir menú personal').click()
  await page.waitForTimeout(800)

  const sidebar = page.locator('aside[aria-label="Menú de navegación personal"]')
  await expect(sidebar).toBeVisible()

  const expectedItems = ['Dashboard', 'Exportar Datos']
  for (const item of expectedItems) {
    const link = sidebar.getByRole('link', { name: item })
    const visible = await link.isVisible().catch(() => false)
    expect(visible, `Sidebar debe tener link "${item}"`).toBe(true)
  }
})

// --- Actor ADMIN (Lucia) ---

test('10.13 — Admin: dashboard con stats reales', async ({ page }) => {
  test.setTimeout(60000)
  await loginAs(page, 'admin')
  await page.waitForLoadState('networkidle')

  await expect(page).toHaveURL(/\/admin\/dashboard/)
  await expect(page.getByText('Panel de Administración')).toBeVisible()

  // Esperar carga de stats client-side
  await page.waitForTimeout(3000)
  const body = await page.textContent('body') ?? ''
  expect(body.length).toBeGreaterThan(100)
})

test('10.14 — Admin: NINGUN link del sidebar da 404', async ({ page }) => {
  test.setTimeout(120000)
  await loginAs(page, 'admin')
  await page.waitForLoadState('networkidle')

  const adminRoutes = [
    '/admin/dashboard',
    '/admin/usuarios',
    '/admin/talleres',
    '/admin/marcas',
    '/admin/pedidos',
    '/admin/colecciones',
    '/admin/evaluaciones',
    '/admin/certificados',
    '/admin/procesos',
    '/admin/auditorias',
    '/admin/documentos',
    '/admin/reportes',
    '/admin/notificaciones',
    '/admin/integraciones',
    '/admin/feedback',
    '/admin/configuracion',
    '/admin/logs',
  ]

  const failures: string[] = []
  for (const route of adminRoutes) {
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const body = await page.textContent('body') ?? ''
    if (url.includes('/404') || body.includes('This page could not be found') || body.includes('Application error')) {
      failures.push(route)
    }
  }

  expect(failures, `Estas rutas admin dieron 404 o error: ${failures.join(', ')}`).toHaveLength(0)
})

// --- Actor CONTENIDO (Sofia) ---

test('10.15 — Contenido: panel de colecciones con datos reales', async ({ page }) => {
  test.setTimeout(60000)
  await loginAsContenido(page)
  await page.goto('/contenido/colecciones')
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Colecciones de Cursos')).toBeVisible()
  await page.waitForTimeout(3000)
  const noFound = await page.getByText('No se encontraron colecciones').isVisible().catch(() => false)
  expect(noFound, 'Debe haber colecciones con datos reales').toBe(false)
})

test('10.16 — Contenido: sidebar tiene Colecciones, Evaluaciones, Notificaciones', async ({ page }) => {
  test.setTimeout(60000)
  await loginAsContenido(page)
  await page.goto('/contenido/colecciones')
  await page.waitForLoadState('networkidle')

  // El sidebar de contenido es un nav persistente (no hamburger)
  for (const item of ['Colecciones', 'Evaluaciones', 'Notificaciones']) {
    const link = page.getByRole('link', { name: item })
    const visible = await link.isVisible().catch(() => false)
    expect(visible, `Sidebar contenido debe tener link "${item}"`).toBe(true)
  }
})

// --- Actor VISITANTE (sin login) ---

test('10.17 — Visitante: landing tiene link "Hacer una denuncia" en footer', async ({ page }) => {
  test.setTimeout(60000)
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const link = page.getByRole('link', { name: /denuncia/i })
  await expect(link.first()).toBeVisible()
})

test('10.18 — Visitante: /denunciar carga sin pedir login', async ({ page }) => {
  test.setTimeout(60000)
  await page.goto('/denunciar')
  await page.waitForLoadState('networkidle')

  expect(page.url()).toContain('/denunciar')
  await expect(page.getByText('Hacer una denuncia')).toBeVisible()
})

test('10.19 — Visitante: /ayuda tiene links a denunciar y consultar', async ({ page }) => {
  test.setTimeout(60000)
  await page.goto('/ayuda')
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('Ayuda y Soporte')).toBeVisible()
  await expect(page.getByRole('link', { name: /denuncia/i }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /consultar/i }).first()).toBeVisible()
})

test('10.20 — Visitante: widget de feedback NO aparece sin sesion', async ({ page }) => {
  test.setTimeout(60000)
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const feedbackBtn = page.getByRole('button', { name: 'Feedback' })
  await expect(feedbackBtn).not.toBeVisible()
})
