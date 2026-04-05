import { Page, expect } from '@playwright/test'

export async function loginAs(page: Page, role: 'admin' | 'taller_bronce' | 'taller_oro' | 'marca' | 'estado') {
  const credentials = {
    admin: { email: 'lucia.fernandez@pdt.org.ar', password: 'pdt2026' },
    taller_bronce: { email: 'roberto.gimenez@pdt.org.ar', password: 'pdt2026' },
    taller_oro: { email: 'carlos.mendoza@pdt.org.ar', password: 'pdt2026' },
    marca: { email: 'martin.echevarria@pdt.org.ar', password: 'pdt2026' },
    estado: { email: 'anabelen.torres@pdt.org.ar', password: 'pdt2026' },
  }
  const { email, password } = credentials[role]

  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.getByRole('button', { name: 'Ingresar' }).click()

  // Esperar a que salga de /login (sea al dashboard o a /api/auth/error)
  await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 30000 })

  // Si fue a /api/auth/error, es un problema conocido de NextAuth v5 + Next.js 16 en dev
  // En ese caso, salteamos el test
  const currentUrl = page.url()
  if (currentUrl.includes('/api/auth/error')) {
    // Intentar login via cookie approach: navegar directo y ver si funciona
    // Si no, el test se skipea con un mensaje claro
    throw new Error(
      `Login failed for ${role} (${email}) — redirected to /api/auth/error. ` +
      `This is a known issue with NextAuth v5 + Next.js 16 in dev mode. ` +
      `Tests work in production. Run against the production URL with: ` +
      `BASE_URL=https://plataforma-textil.vercel.app npx playwright test`
    )
  }
}
