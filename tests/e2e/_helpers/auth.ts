import { Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'

type Rol = 'taller' | 'marca' | 'admin' | 'estado'

// Credenciales por defecto = seed data. En CI se sobreescriben con env vars.
const defaults: Record<Rol, { email: string; password: string; rutaEsperada: RegExp }> = {
  taller: {
    email: 'roberto.gimenez@pdt.org.ar',
    password: 'pdt2026',
    rutaEsperada: /\/taller/,
  },
  marca: {
    email: 'martin.echevarria@pdt.org.ar',
    password: 'pdt2026',
    rutaEsperada: /\/marca/,
  },
  admin: {
    email: 'lucia.fernandez@pdt.org.ar',
    password: 'pdt2026',
    rutaEsperada: /\/admin/,
  },
  estado: {
    email: 'anabelen.torres@pdt.org.ar',
    password: 'pdt2026',
    rutaEsperada: /\/estado/,
  },
}

const envMap: Record<Rol, { emailVar: string; passwordVar: string }> = {
  taller: { emailVar: 'TEST_TALLER_EMAIL', passwordVar: 'TEST_TALLER_PASSWORD' },
  marca: { emailVar: 'TEST_MARCA_EMAIL', passwordVar: 'TEST_MARCA_PASSWORD' },
  admin: { emailVar: 'TEST_ADMIN_EMAIL', passwordVar: 'TEST_ADMIN_PASSWORD' },
  estado: { emailVar: 'TEST_ESTADO_EMAIL', passwordVar: 'TEST_ESTADO_PASSWORD' },
}

/**
 * Login como un rol. Si auth.setup.ts ya guardo storageState,
 * inyecta las cookies y navega via middleware redirect (~2-5s).
 * Si no existe, hace el login completo via browser (fallback local).
 */
export async function loginAs(page: Page, rol: Rol) {
  // Fast path: reusar storageState del setup project
  const authFile = path.resolve('playwright/.auth', `${rol}.json`)
  if (fs.existsSync(authFile)) {
    const state = JSON.parse(fs.readFileSync(authFile, 'utf-8'))
    if (state.cookies?.length > 0) {
      await page.context().addCookies(state.cookies)
      // Navegar a / — middleware redirige al dashboard del rol.
      // Usa waitUntil:'commit' para no esperar el render completo
      // (evita esperar las 16 queries de /estado dashboard).
      await page.goto('/', { waitUntil: 'commit' })
      await page.waitForURL(defaults[rol].rutaEsperada, { timeout: 30_000, waitUntil: 'commit' })
      return
    }
  }

  // Fallback: login completo via browser (desarrollo local sin setup project)
  const env = envMap[rol]
  const def = defaults[rol]

  const email = process.env[env.emailVar] || def.email
  const password = process.env[env.passwordVar] || def.password

  await page.goto('/login')
  await page.locator('form:has(button:has-text("Ingresar")) input[name="email"]').fill(email)
  await page.locator('form:has(button:has-text("Ingresar")) input[name="password"]').fill(password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await page.waitForURL(def.rutaEsperada, { timeout: 60_000, waitUntil: 'commit' })
}

export async function logout(page: Page) {
  // NextAuth v5 no tiene pagina /api/auth/signout con form.
  // El logout se dispara desde el boton "Cerrar sesion" en la UI.
  await page.click('button:has-text("Cerrar")')
  await page.waitForURL('/login', { timeout: 10000 })
}
