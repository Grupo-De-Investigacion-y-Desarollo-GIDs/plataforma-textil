import { test, expect } from '@playwright/test'
import { ensureNotProduction } from './_helpers/safety'
import { loginAs } from './_helpers/auth'

test.describe('Seguridad de cookies de sesion — S-01', () => {
  test('cookie de sesion tiene httpOnly=true despues del login', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')

    const cookies = await page.context().cookies()
    const session = cookies.find(c => c.name.includes('session-token'))

    expect(session).toBeDefined()
    expect(session!.httpOnly).toBe(true)
  })

  test('cookie de sesion tiene sameSite=Lax', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')

    const cookies = await page.context().cookies()
    const session = cookies.find(c => c.name.includes('session-token'))

    expect(session).toBeDefined()
    expect(session!.sameSite).toBe('Lax')
  })

  test('cookie de sesion tiene path=/', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')

    const cookies = await page.context().cookies()
    const session = cookies.find(c => c.name.includes('session-token'))

    expect(session).toBeDefined()
    expect(session!.path).toBe('/')
  })

  test('cookie de sesion tiene nombre correcto y secure en HTTPS', async ({ page }) => {
    await ensureNotProduction(page)
    await loginAs(page, 'admin')

    const cookies = await page.context().cookies()
    const session = cookies.find(c => c.name.includes('session-token'))

    expect(session).toBeDefined()
    expect(session!.name).toContain('session-token')

    // En HTTPS (CI contra Vercel preview), secure debe ser true
    const baseUrl = page.url()
    if (baseUrl.startsWith('https://')) {
      expect(session!.secure).toBe(true)
      expect(session!.name).toContain('__Secure-')
    }
  })
})
