import { describe, it, expect } from 'vitest'
import { esFlujoRelajadoEnEvento } from '@/compartido/lib/ratelimit'

describe('ratelimit — bypass en modo evento', () => {
  const on = { MODO_EVENTO: 'on' } as never
  const off = {} as never

  it('con MODO_EVENTO=on relaja los flujos del evento', () => {
    for (const k of ['login', 'pedidos', 'cotizaciones', 'upload', 'registro', 'verificarCuit', 'cuenta', 'feedback'] as const) {
      expect(esFlujoRelajadoEnEvento(k, on)).toBe(true)
    }
  })

  it('con MODO_EVENTO=on NO relaja los de costo/abuso externo', () => {
    for (const k of ['arca', 'chat', 'exportar', 'denuncias', 'passwordReset', 'magicLink', 'logError'] as const) {
      expect(esFlujoRelajadoEnEvento(k, on)).toBe(false)
    }
  })

  it('sin el flag no relaja nada (prod)', () => {
    expect(esFlujoRelajadoEnEvento('login', off)).toBe(false)
    expect(esFlujoRelajadoEnEvento('pedidos', off)).toBe(false)
    expect(esFlujoRelajadoEnEvento('login', { MODO_EVENTO: 'true' } as never)).toBe(false)
  })
})
