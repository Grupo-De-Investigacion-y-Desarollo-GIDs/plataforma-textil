import { describe, it, expect } from 'vitest'
import { modoRegistro, emailPermitido, esEmailDeTest } from '@/compartido/lib/registro-gate'

// Spec v4-a: gate de registro por ambiente + allowlist. Helper puro.
describe('registro-gate — modoRegistro', () => {
  it('production → abierto (no-op, ignora el flag)', () => {
    expect(modoRegistro({ VERCEL_ENV: 'production', MODO_EVENTO: 'on' } as never)).toBe('abierto')
  })
  it('preview + MODO_EVENTO=on → evento', () => {
    expect(modoRegistro({ VERCEL_ENV: 'preview', MODO_EVENTO: 'on' } as never)).toBe('evento')
  })
  it('preview sin flag → allowlist', () => {
    expect(modoRegistro({ VERCEL_ENV: 'preview' } as never)).toBe('allowlist')
  })
  it('MODO_EVENTO con valor != "on" → allowlist', () => {
    expect(modoRegistro({ VERCEL_ENV: 'preview', MODO_EVENTO: 'true' } as never)).toBe('allowlist')
    expect(modoRegistro({ VERCEL_ENV: 'development', MODO_EVENTO: 'ON' } as never)).toBe('allowlist')
  })
})

describe('registro-gate — emailPermitido', () => {
  it('email exacto: match y no-match', () => {
    expect(emailPermitido('ana@oit.org', 'ana@oit.org, otro@x.com')).toBe(true)
    expect(emailPermitido('nadie@x.com', 'ana@oit.org')).toBe(false)
  })
  it('dominio @x.com: match por sufijo y no-match', () => {
    expect(emailPermitido('quien@ciaindumentaria.com.ar', '@ciaindumentaria.com.ar')).toBe(true)
    expect(emailPermitido('quien@otro.com', '@ciaindumentaria.com.ar')).toBe(false)
  })
  it('allowlist vacía ⇒ false (deny by default)', () => {
    expect(emailPermitido('cualquiera@x.com', '')).toBe(false)
    expect(emailPermitido('cualquiera@x.com', '   ,  ')).toBe(false)
  })
  it('normaliza mayúsculas/espacios en email y en CSV', () => {
    expect(emailPermitido('  ANA@OIT.org ', ' Ana@Oit.Org ')).toBe(true)
    expect(emailPermitido('X@CIA.com', ' @cia.com ')).toBe(true)
  })
  it('dominio sin @ inicial se trata como email exacto (no matchea)', () => {
    expect(emailPermitido('quien@oit.org', 'oit.org')).toBe(false)
  })
})

describe('registro-gate — esEmailDeTest (TLDs reservados)', () => {
  it('permite los TLDs de test que usan los e2e (.test) y otros reservados', () => {
    expect(esEmailDeTest('test-taller-123@laaguja.test')).toBe(true)
    expect(esEmailDeTest('x@dulcemoda.test')).toBe(true)
    expect(esEmailDeTest('a@b.example')).toBe(true)
    expect(esEmailDeTest('a@b.invalid')).toBe(true)
  })
  it('NO trata como test un email real', () => {
    expect(esEmailDeTest('persona@gmail.com')).toBe(false)
    expect(esEmailDeTest('x@ciaindumentaria.com.ar')).toBe(false)
    expect(esEmailDeTest('x@testing.com')).toBe(false)
  })
})
