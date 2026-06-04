import { describe, it, expect } from 'vitest'
import { modoActivo, rolesEfectivos, tieneAlgunRol } from '@/compartido/lib/roles'
import authConfig from '@/compartido/lib/auth.config'

// U-03 — gating por MEMBRESÍA en roles[] (decisión D1/A) + invariante role==activeMode.

describe('roles.ts — membresía', () => {
  it('single-role [TALLER] accede a área taller, no a marca', () => {
    const u = { role: 'TALLER', roles: ['TALLER'], activeMode: 'TALLER' }
    expect(tieneAlgunRol(u, ['TALLER'])).toBe(true)
    expect(tieneAlgunRol(u, ['MARCA'])).toBe(false)
  })

  it('multi-rol [TALLER, MARCA] accede a ambas áreas', () => {
    const u = { role: 'TALLER', roles: ['TALLER', 'MARCA'], activeMode: 'TALLER' }
    expect(tieneAlgunRol(u, ['TALLER'])).toBe(true)
    expect(tieneAlgunRol(u, ['MARCA'])).toBe(true)
    expect(tieneAlgunRol(u, ['ESTADO'])).toBe(false)
  })

  it('ESTADO/ADMIN: un ADMIN entra a área estado (lista permitidos)', () => {
    const admin = { role: 'ADMIN', roles: ['ADMIN'], activeMode: 'ADMIN' }
    expect(tieneAlgunRol(admin, ['ESTADO', 'ADMIN'])).toBe(true)
  })

  it('fallback: roles[] vacío usa [activeMode]', () => {
    const u = { role: 'MARCA', roles: [], activeMode: 'MARCA' }
    expect(rolesEfectivos(u)).toEqual(['MARCA'])
    expect(tieneAlgunRol(u, ['MARCA'])).toBe(true)
    expect(tieneAlgunRol(u, ['TALLER'])).toBe(false)
  })

  it('fallback: roles[] ausente y activeMode null usa [role] (sesión vieja)', () => {
    const u = { role: 'TALLER', roles: undefined, activeMode: null }
    expect(rolesEfectivos(u)).toEqual(['TALLER'])
    expect(tieneAlgunRol(u, ['TALLER'])).toBe(true)
  })

  it('sin ningún rol → sin membresía', () => {
    const u = { role: null, roles: [], activeMode: null }
    expect(rolesEfectivos(u)).toEqual([])
    expect(tieneAlgunRol(u, ['ADMIN'])).toBe(false)
  })
})

describe('roles.ts — modoActivo', () => {
  it('usa activeMode cuando existe', () => {
    expect(modoActivo({ role: 'TALLER', activeMode: 'MARCA' })).toBe('MARCA')
  })
  it('cae a role cuando activeMode es null', () => {
    expect(modoActivo({ role: 'TALLER', activeMode: null })).toBe('TALLER')
  })
})

describe('auth.config.ts — callbacks multi-rol (invariante role==activeMode)', () => {
  const jwt = authConfig.callbacks!.jwt!
  const session = authConfig.callbacks!.session!

  // Helper para invocar el callback jwt con los args mínimos que usa.
  const callJwt = (token: Record<string, unknown>, user: unknown) =>
    jwt({ token, user } as never) as Promise<Record<string, unknown>>

  it('jwt normaliza roles[] desde role cuando la DB trae roles=[]', async () => {
    const token = await callJwt({}, {
      id: 'u1', role: 'TALLER', roles: [], activeMode: null, registroCompleto: true,
    })
    expect(token.roles).toEqual(['TALLER'])
    expect(token.activeMode).toBe('TALLER')
    // Invariante de back-compat
    expect(token.role).toBe('TALLER')
    expect(token.role).toBe(token.activeMode)
  })

  it('jwt preserva roles[] reales de un multi-rol', async () => {
    const token = await callJwt({}, {
      id: 'u2', role: 'TALLER', roles: ['TALLER', 'MARCA'], activeMode: 'TALLER', registroCompleto: true,
    })
    expect(token.roles).toEqual(['TALLER', 'MARCA'])
    expect(token.activeMode).toBe('TALLER')
    expect(token.role).toBe(token.activeMode)
  })

  it('session expone roles[]+activeMode y mantiene role==activeMode', async () => {
    const sess = await (session as never as (a: {
      session: { user: Record<string, unknown> }
      token: Record<string, unknown>
    }) => Promise<{ user: Record<string, unknown> }>)({
      session: { user: {} },
      token: { id: 'u3', role: 'MARCA', roles: ['MARCA', 'TALLER'], activeMode: 'MARCA', registroCompleto: true },
    })
    expect(sess.user.roles).toEqual(['MARCA', 'TALLER'])
    expect(sess.user.activeMode).toBe('MARCA')
    expect(sess.user.role).toBe('MARCA')
    expect(sess.user.role).toBe(sess.user.activeMode)
  })

  it('session de token viejo (sin roles/activeMode) cae a token.role', async () => {
    const sess = await (session as never as (a: {
      session: { user: Record<string, unknown> }
      token: Record<string, unknown>
    }) => Promise<{ user: Record<string, unknown> }>)({
      session: { user: {} },
      token: { id: 'u4', role: 'ESTADO', registroCompleto: true },
    })
    expect(sess.user.role).toBe('ESTADO')
    expect(sess.user.roles).toEqual([])
    expect(sess.user.activeMode).toBe(null)
  })
})
