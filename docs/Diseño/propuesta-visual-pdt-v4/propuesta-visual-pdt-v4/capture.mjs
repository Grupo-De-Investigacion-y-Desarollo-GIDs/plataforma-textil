// Captura screenshots de pantallas clave de PDT para propuesta visual v4
// Uso: node capture.mjs   (requiere dev server corriendo en localhost:3000)

import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const OUT_DIR = path.resolve(import.meta.dirname, 'screenshots')

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 375, height: 812 },
}

const CREDS = {
  taller: { email: 'roberto.gimenez@pdt.org.ar', password: 'pdt2026', waitFor: /\/taller/ },
  marca: { email: 'martin.echevarria@pdt.org.ar', password: 'pdt2026', waitFor: /\/marca/ },
  estado: { email: 'anabelen.torres@pdt.org.ar', password: 'pdt2026', waitFor: /\/estado/ },
  admin: { email: 'lucia.fernandez@pdt.org.ar', password: 'pdt2026', waitFor: /\/admin/ },
}

const SCREENS = {
  publicas: [
    { url: '/login', name: '01-login' },
    { url: '/registro', name: '02-registro' },
    { url: '/directorio', name: '03-directorio-publico' },
    { url: '/ayuda', name: '04-ayuda' },
  ],
  taller: [
    { url: '/taller', name: '01-dashboard' },
    { url: '/taller/formalizacion', name: '02-formalizacion' },
    { url: '/taller/pedidos', name: '03-pedidos' },
    { url: '/taller/pedidos/disponibles', name: '04-pedidos-disponibles' },
    { url: '/taller/perfil', name: '05-perfil' },
    { url: '/taller/aprender', name: '06-aprender' },
  ],
  marca: [
    { url: '/marca', name: '01-dashboard' },
    { url: '/marca/directorio', name: '02-directorio' },
    { url: '/marca/pedidos', name: '03-pedidos' },
  ],
  estado: [
    { url: '/estado', name: '01-dashboard' },
    { url: '/estado/talleres', name: '02-talleres' },
    { url: '/estado/demanda-insatisfecha', name: '03-demanda-insatisfecha' },
    { url: '/estado/exportar', name: '04-exportar' },
    { url: '/estado/sector', name: '05-sector' },
  ],
  admin: [
    { url: '/admin', name: '01-dashboard' },
    { url: '/admin/usuarios', name: '02-usuarios' },
    { url: '/admin/talleres', name: '03-talleres' },
    { url: '/admin/auditorias', name: '04-auditorias' },
    { url: '/admin/observaciones', name: '05-observaciones' },
    { url: '/admin/notificaciones', name: '06-notificaciones' },
  ],
}

async function login(page, rol) {
  const c = CREDS[rol]
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
  await page.locator('form:has(button:has-text("Ingresar")) input[name="email"]').fill(c.email)
  await page.locator('form:has(button:has-text("Ingresar")) input[name="password"]').fill(c.password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await page.waitForURL(c.waitFor, { timeout: 60000 })
}

async function captureScreens(context, viewportName, viewport) {
  for (const [section, screens] of Object.entries(SCREENS)) {
    const page = await context.newPage()
    await page.setViewportSize(viewport)

    if (section !== 'publicas') {
      try {
        await login(page, section)
      } catch (e) {
        console.error(`  [${section}] login falló:`, e.message)
        await page.close()
        continue
      }
    }

    const dir = path.join(OUT_DIR, section)
    await mkdir(dir, { recursive: true })

    for (const screen of screens) {
      const file = path.join(dir, `${screen.name}-${viewportName}.png`)
      try {
        await page.goto(`${BASE_URL}${screen.url}`, { waitUntil: 'networkidle', timeout: 30000 })
        await page.waitForTimeout(800) // dejar que terminen animaciones
        await page.screenshot({ path: file, fullPage: true })
        console.log(`  OK   ${section}/${screen.name}-${viewportName}`)
      } catch (e) {
        console.error(`  FAIL ${section}/${screen.name}-${viewportName}: ${e.message.split('\n')[0]}`)
      }
    }

    await page.close()
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })

  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    console.log(`\n=== Viewport: ${name} (${viewport.width}x${viewport.height}) ===`)
    const context = await browser.newContext({ viewport })
    await captureScreens(context, name, viewport)
    await context.close()
  }

  await browser.close()
  console.log(`\nListo. Screenshots en: ${OUT_DIR}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
