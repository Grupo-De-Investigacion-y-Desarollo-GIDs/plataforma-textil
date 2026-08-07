import { describe, it, expect } from 'vitest'
import { LEGAL_VERSION, TIPOS_CONSENT, leerDocLegal, soloCuerpoLegal } from '@/compartido/lib/legal'

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

// P-02: publicación solo-cuerpo — extracción por estructura (no por línea fija).
describe('legal — soloCuerpoLegal', () => {
  const md = [
    '# Título del Documento',
    '',
    '> **Nota de estado.** Preámbulo interno que NO se publica.',
    '',
    '## 1. Primera sección',
    'Contenido uno.',
    '',
    '## 2. Segunda sección',
    'Contenido dos.',
    '',
    '## Definiciones institucionales pendientes',
    'Apéndice interno que NO se publica.',
    '',
    '## Notas para la revisión',
    'Tampoco.',
  ].join('\n')

  it('conserva título + secciones numeradas y agrega "Última actualización"', () => {
    const out = soloCuerpoLegal(md)
    expect(out).toContain('# Título del Documento')
    expect(out).toContain(`Última actualización: ${LEGAL_VERSION}`)
    expect(out).toContain('## 1. Primera sección')
    expect(out).toContain('## 2. Segunda sección')
  })

  it('recorta el preámbulo (Nota de estado) y los apéndices no numerados', () => {
    const out = soloCuerpoLegal(md)
    expect(out).not.toContain('Nota de estado')
    expect(out).not.toContain('Definiciones institucionales pendientes')
    expect(out).not.toContain('Notas para la revisión')
  })

  it('los .md reales quedan sin preámbulo ni apéndices', async () => {
    for (const doc of ['TERMINOS_Y_CONDICIONES', 'POLITICA_DE_PRIVACIDAD'] as const) {
      const out = soloCuerpoLegal(await leerDocLegal(doc))
      expect(out).not.toContain('Nota de estado')
      expect(out).not.toContain('Notas para la revisión')
      expect(out).toMatch(/## 1\./)
    }
  })
})
