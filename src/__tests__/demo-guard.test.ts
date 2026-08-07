import { describe, it, expect } from 'vitest'
import { esCuentaDemo, DOMINIO_DEMO, MENSAJE_CUENTA_DEMO } from '@/compartido/lib/demo'

describe('demo — esCuentaDemo', () => {
  it('reconoce las cuentas demo por el dominio @pdt.org.ar', () => {
    expect(esCuentaDemo('demo.taller1@pdt.org.ar')).toBe(true)
    expect(esCuentaDemo('carlos.mendoza@pdt.org.ar')).toBe(true)
    expect(esCuentaDemo('demo.gracia@pdt.org.ar')).toBe(true)
  })
  it('normaliza mayúsculas y espacios', () => {
    expect(esCuentaDemo('  DEMO.MARCA1@PDT.ORG.AR ')).toBe(true)
  })
  it('NO marca como demo a un usuario real', () => {
    expect(esCuentaDemo('persona@gmail.com')).toBe(false)
    expect(esCuentaDemo('taller@ciaindumentaria.com.ar')).toBe(false)
    // no matchea por substring: el dominio va como sufijo
    expect(esCuentaDemo('x@pdt.org.ar.evil.com')).toBe(false)
  })
  it('tolera null/undefined', () => {
    expect(esCuentaDemo(null)).toBe(false)
    expect(esCuentaDemo(undefined)).toBe(false)
    expect(esCuentaDemo('')).toBe(false)
  })
  it('expone dominio y mensaje', () => {
    expect(DOMINIO_DEMO).toBe('@pdt.org.ar')
    expect(MENSAJE_CUENTA_DEMO).toMatch(/demostración/i)
  })
})
