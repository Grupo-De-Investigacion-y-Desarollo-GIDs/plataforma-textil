import { test as setup } from '@playwright/test'

type Rol = 'admin' | 'taller' | 'marca' | 'estado'

const roles: {
  rol: Rol
  emailVar: string
  passwordVar: string
  email: string
  password: string
  targetPath: string
}[] = [
  {
    rol: 'admin',
    emailVar: 'TEST_ADMIN_EMAIL',
    passwordVar: 'TEST_ADMIN_PASSWORD',
    email: 'lucia.fernandez@pdt.org.ar',
    password: 'pdt2026',
    targetPath: '/admin',
  },
  {
    rol: 'taller',
    emailVar: 'TEST_TALLER_EMAIL',
    passwordVar: 'TEST_TALLER_PASSWORD',
    email: 'roberto.gimenez@pdt.org.ar',
    password: 'pdt2026',
    targetPath: '/taller',
  },
  {
    rol: 'marca',
    emailVar: 'TEST_MARCA_EMAIL',
    passwordVar: 'TEST_MARCA_PASSWORD',
    email: 'martin.echevarria@pdt.org.ar',
    password: 'pdt2026',
    targetPath: '/marca',
  },
  {
    rol: 'estado',
    emailVar: 'TEST_ESTADO_EMAIL',
    passwordVar: 'TEST_ESTADO_PASSWORD',
    email: 'anabelen.torres@pdt.org.ar',
    password: 'pdt2026',
    // Ruta liviana — /estado tiene 16 queries en $transaction,
    // /estado/talleres es mas rapido y confirma sesion igual
    targetPath: '/estado/talleres',
  },
]

for (const { rol, emailVar, passwordVar, email, password, targetPath } of roles) {
  setup(`authenticate as ${rol}`, async ({ page }) => {
    const e = process.env[emailVar] || email
    const p = process.env[passwordVar] || password

    // Paso 1: login via form
    await page.goto('/login')
    await page.locator('form:has(button:has-text("Ingresar")) input[name="email"]').fill(e)
    await page.locator('form:has(button:has-text("Ingresar")) input[name="password"]').fill(p)
    await page.getByRole('button', { name: 'Ingresar' }).click()

    // Paso 2: esperar que URL salga de /login (el login completó)
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
      timeout: 30_000,
      waitUntil: 'commit',
    })

    // Paso 3: navegación full-page al target (evita client-side RSC hang)
    await page.goto(targetPath, { waitUntil: 'load', timeout: 60_000 })

    // Paso 4: guardar storageState
    await page.context().storageState({ path: `playwright/.auth/${rol}.json` })
  })
}
