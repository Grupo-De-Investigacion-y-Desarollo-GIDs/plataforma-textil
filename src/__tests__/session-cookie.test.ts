import { describe, it, expect, beforeAll } from 'vitest'

// B-05: helper único de cookie de sesión (encode/decode + merge del delta de modo/rol).
// El secret se lee lazy en el helper, así que basta setearlo antes de los tests.
beforeAll(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret-b05-deadbeefdeadbeefdeadbeef'
})

import {
  encodeSessionToken,
  decodeSessionToken,
  mergeSessionDelta,
  SESSION_COOKIE_NAME,
} from '@/compartido/lib/session-cookie'

describe('session-cookie — nombre/salt', () => {
  it('SESSION_COOKIE_NAME coincide con el patrón de auth.config (session-token)', () => {
    expect(SESSION_COOKIE_NAME).toContain('session-token')
  })
})

describe('session-cookie — round-trip encode→decode', () => {
  it('preserva el payload del token de sesión', async () => {
    const token = {
      id: 'u1',
      sub: 'u1',
      role: 'MARCA',
      roles: ['TALLER', 'MARCA'],
      activeMode: 'MARCA',
      registroCompleto: true,
    }
    const jwe = await encodeSessionToken(token)
    expect(typeof jwe).toBe('string')

    const back = await decodeSessionToken(jwe)
    expect(back).not.toBeNull()
    expect(back!.id).toBe('u1')
    expect(back!.role).toBe('MARCA')
    expect(back!.roles).toEqual(['TALLER', 'MARCA'])
    expect(back!.activeMode).toBe('MARCA')
    expect(back!.registroCompleto).toBe(true)
  })

  it('decode de basura/cookie ausente → null (no throw)', async () => {
    expect(await decodeSessionToken(undefined)).toBeNull()
    expect(await decodeSessionToken('')).toBeNull()
    expect(await decodeSessionToken('no-es-un-jwe-valido')).toBeNull()
  })
})

describe('session-cookie — mergeSessionDelta (semántica del callback jwt update)', () => {
  const base = { id: 'u1', role: 'TALLER', roles: ['TALLER'], activeMode: 'TALLER' }

  it('cambia activeMode dentro de roles existentes (toggle) + invariante role==activeMode', () => {
    const out = mergeSessionDelta(
      { ...base, roles: ['TALLER', 'MARCA'] },
      { activeMode: 'MARCA' },
    )
    expect(out.activeMode).toBe('MARCA')
    expect(out.role).toBe('MARCA') // invariante
    expect(out.roles).toEqual(['TALLER', 'MARCA']) // sin cambios
  })

  it('NO cambia activeMode a un rol que no se posee', () => {
    const out = mergeSessionDelta({ ...base }, { activeMode: 'MARCA' })
    expect(out.activeMode).toBe('TALLER') // rechazado: MARCA no está en roles
    expect(out.role).toBe('TALLER')
  })

  it('expande roles con un rol OPERATIVO (agregar rol)', () => {
    const out = mergeSessionDelta({ ...base }, { roles: ['MARCA'], activeMode: 'MARCA' })
    expect(out.roles).toEqual(['TALLER', 'MARCA'])
    expect(out.activeMode).toBe('MARCA')
    expect(out.role).toBe('MARCA')
  })

  it('ANTI-ESCALACIÓN: un intento de sumar ADMIN/ESTADO/CONTENIDO NO pasa', () => {
    const out = mergeSessionDelta({ ...base }, { roles: ['ADMIN'], activeMode: 'ADMIN' })
    // ADMIN no es operativo → no se suma; activeMode ADMIN tampoco se acepta
    expect(out.roles).toEqual(['TALLER'])
    expect(out.activeMode).toBe('TALLER')
    expect(out.role).toBe('TALLER')
  })

  it('ANTI-ESCALACIÓN: filtra team roles pero acepta el operativo del mismo delta', () => {
    const out = mergeSessionDelta({ ...base }, { roles: ['ESTADO', 'MARCA'], activeMode: 'MARCA' })
    expect(out.roles).toEqual(['TALLER', 'MARCA']) // ESTADO filtrado, MARCA sumado
    expect(out.activeMode).toBe('MARCA')
  })

  it('preserva un team role PREEXISTENTE en el token (no lo borra al expandir)', () => {
    // Un user que ya tenía ADMIN (asignado en login desde DB) + suma MARCA: ADMIN se conserva.
    const out = mergeSessionDelta(
      { id: 'u2', role: 'ADMIN', roles: ['ADMIN'], activeMode: 'ADMIN' },
      { roles: ['MARCA'], activeMode: 'MARCA' },
    )
    expect(out.roles).toEqual(['ADMIN', 'MARCA'])
    expect(out.activeMode).toBe('MARCA')
  })

  it('no muta el token de entrada', () => {
    const input = { ...base, roles: ['TALLER'] }
    const snapshot = JSON.stringify(input)
    mergeSessionDelta(input, { roles: ['MARCA'], activeMode: 'MARCA' })
    expect(JSON.stringify(input)).toBe(snapshot)
  })
})
