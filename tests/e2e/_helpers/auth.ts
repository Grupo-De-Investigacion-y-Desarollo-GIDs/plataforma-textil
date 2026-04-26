import { Page } from '@playwright/test'

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

export async function loginAs(page: Page, rol: Rol) {
  const env = envMap[rol]
  const def = defaults[rol]

  const email = process.env[env.emailVar] || def.email
  const password = process.env[env.passwordVar] || def.password

  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(def.rutaEsperada, { timeout: 15000 })
}

export async function logout(page: Page) {
  // NextAuth v5 no tiene pagina /api/auth/signout con form.
  // El logout se dispara desde el boton "Cerrar sesion" en la UI.
  await page.click('button:has-text("Cerrar")')
  await page.waitForURL('/login', { timeout: 10000 })
}
