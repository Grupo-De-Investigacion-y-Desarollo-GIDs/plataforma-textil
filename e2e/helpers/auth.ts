import { Page } from '@playwright/test'

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
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(taller|marca|estado|admin)/)
}
