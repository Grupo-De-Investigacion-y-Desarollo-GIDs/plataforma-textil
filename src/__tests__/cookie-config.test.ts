import { describe, it, expect } from 'vitest'
import authConfig from '@/compartido/lib/auth.config'

describe('auth.config.ts — configuración de sesión', () => {
  it('strategy es jwt', () => {
    expect(authConfig.session?.strategy).toBe('jwt')
  })

  it('maxAge es 7 días (604800 segundos)', () => {
    expect(authConfig.session?.maxAge).toBe(7 * 24 * 60 * 60)
  })

  it('updateAge es 24 horas (86400 segundos)', () => {
    expect(authConfig.session?.updateAge).toBe(24 * 60 * 60)
  })
})

describe('auth.config.ts — cookies de sesión', () => {
  const sessionToken = authConfig.cookies?.sessionToken

  it('sessionToken.options.httpOnly es true', () => {
    expect(sessionToken?.options?.httpOnly).toBe(true)
  })

  it('sessionToken.options.sameSite es lax', () => {
    expect(sessionToken?.options?.sameSite).toBe('lax')
  })

  it('sessionToken.options.path es /', () => {
    expect(sessionToken?.options?.path).toBe('/')
  })

  it('nombre de sessionToken contiene session-token', () => {
    expect(sessionToken?.name).toContain('session-token')
  })
})

describe('auth.config.ts — cookie CSRF', () => {
  const csrfToken = authConfig.cookies?.csrfToken

  it('csrfToken.options.httpOnly es true', () => {
    expect(csrfToken?.options?.httpOnly).toBe(true)
  })

  it('csrfToken.options.sameSite es lax', () => {
    expect(csrfToken?.options?.sameSite).toBe('lax')
  })

  it('nombre de csrfToken contiene csrf-token', () => {
    expect(csrfToken?.name).toContain('csrf-token')
  })
})
