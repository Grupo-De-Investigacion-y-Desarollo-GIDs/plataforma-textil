import { test as setup, expect } from '@playwright/test'

type Rol = 'admin' | 'taller' | 'marca' | 'estado'

const roles: { rol: Rol; emailVar: string; passwordVar: string; email: string; password: string }[] = [
  {
    rol: 'admin',
    emailVar: 'TEST_ADMIN_EMAIL',
    passwordVar: 'TEST_ADMIN_PASSWORD',
    email: 'lucia.fernandez@pdt.org.ar',
    password: 'pdt2026',
  },
  {
    rol: 'taller',
    emailVar: 'TEST_TALLER_EMAIL',
    passwordVar: 'TEST_TALLER_PASSWORD',
    email: 'roberto.gimenez@pdt.org.ar',
    password: 'pdt2026',
  },
  {
    rol: 'marca',
    emailVar: 'TEST_MARCA_EMAIL',
    passwordVar: 'TEST_MARCA_PASSWORD',
    email: 'martin.echevarria@pdt.org.ar',
    password: 'pdt2026',
  },
  {
    rol: 'estado',
    emailVar: 'TEST_ESTADO_EMAIL',
    passwordVar: 'TEST_ESTADO_PASSWORD',
    email: 'anabelen.torres@pdt.org.ar',
    password: 'pdt2026',
  },
]

for (const { rol, emailVar, passwordVar, email, password } of roles) {
  setup(`authenticate as ${rol}`, async ({ page }) => {
    const e = process.env[emailVar] || email
    const p = process.env[passwordVar] || password

    // Login via API directa — bypasa el form React y router.push()
    // que causa race conditions con RSC payload fetch de paginas pesadas.
    const csrfRes = await page.request.get('/api/auth/csrf')
    const { csrfToken } = await csrfRes.json()

    await page.request.post('/api/auth/callback/credentials', {
      form: { email: e, password: p, csrfToken },
    })

    // Verificar que la sesion quedo establecida
    const sessionRes = await page.request.get('/api/auth/session')
    const session = await sessionRes.json()
    expect(session?.user, `Login failed for ${rol} (email: ${e})`).toBeTruthy()

    await page.context().storageState({ path: `playwright/.auth/${rol}.json` })
  })
}
