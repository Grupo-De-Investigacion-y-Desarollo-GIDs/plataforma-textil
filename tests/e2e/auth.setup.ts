import { test as setup } from '@playwright/test'

type Rol = 'admin' | 'taller' | 'marca' | 'estado'

const roles: { rol: Rol; emailVar: string; passwordVar: string; email: string; password: string; rutaEsperada: RegExp }[] = [
  {
    rol: 'admin',
    emailVar: 'TEST_ADMIN_EMAIL',
    passwordVar: 'TEST_ADMIN_PASSWORD',
    email: 'lucia.fernandez@pdt.org.ar',
    password: 'pdt2026',
    rutaEsperada: /\/admin/,
  },
  {
    rol: 'taller',
    emailVar: 'TEST_TALLER_EMAIL',
    passwordVar: 'TEST_TALLER_PASSWORD',
    email: 'roberto.gimenez@pdt.org.ar',
    password: 'pdt2026',
    rutaEsperada: /\/taller/,
  },
  {
    rol: 'marca',
    emailVar: 'TEST_MARCA_EMAIL',
    passwordVar: 'TEST_MARCA_PASSWORD',
    email: 'martin.echevarria@pdt.org.ar',
    password: 'pdt2026',
    rutaEsperada: /\/marca/,
  },
  {
    rol: 'estado',
    emailVar: 'TEST_ESTADO_EMAIL',
    passwordVar: 'TEST_ESTADO_PASSWORD',
    email: 'anabelen.torres@pdt.org.ar',
    password: 'pdt2026',
    rutaEsperada: /\/estado/,
  },
]

for (const { rol, emailVar, passwordVar, email, password, rutaEsperada } of roles) {
  setup(`authenticate as ${rol}`, async ({ page }) => {
    const e = process.env[emailVar] || email
    const p = process.env[passwordVar] || password

    await page.goto('/login')
    await page.locator('form:has(button:has-text("Ingresar")) input[name="email"]').fill(e)
    await page.locator('form:has(button:has-text("Ingresar")) input[name="password"]').fill(p)
    await page.getByRole('button', { name: 'Ingresar' }).click()
    // 90s: /estado tarda al cargar primera vez (16 queries en $transaction).
    // Sin waitUntil — default 'load' para que Playwright detecte la
    // navegacion client-side (router.push) correctamente.
    await page.waitForURL(rutaEsperada, { timeout: 90_000 })

    await page.context().storageState({ path: `playwright/.auth/${rol}.json` })
  })
}
