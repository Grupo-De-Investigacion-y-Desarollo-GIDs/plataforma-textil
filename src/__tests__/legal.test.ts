import { describe, it, expect } from 'vitest'
import { LEGAL_VERSION, TIPOS_CONSENT, leerDocLegal } from '@/compartido/lib/legal'

// P-01/P-02: version legal única + lectura de los .md fuente. Guard de que lo que se
// persiste como consentimiento (LEGAL_VERSION) y lo que se muestra salen del mismo lugar.
describe('legal — LEGAL_VERSION y docs', () => {
  it('LEGAL_VERSION es un string no vacío', () => {
    expect(typeof LEGAL_VERSION).toBe('string')
    expect(LEGAL_VERSION.length).toBeGreaterThan(0)
  })

  it('los 3 tipos de consentimiento están definidos', () => {
    expect(TIPOS_CONSENT).toEqual(['TERMINOS', 'PRIVACIDAD', 'VISIBILIDAD'])
  })

  it('leerDocLegal devuelve el contenido de los .md fuente', async () => {
    const terminos = await leerDocLegal('TERMINOS_Y_CONDICIONES')
    const privacidad = await leerDocLegal('POLITICA_DE_PRIVACIDAD')
    expect(terminos).toContain('Términos')
    expect(privacidad).toContain('Privacidad')
  })
})
