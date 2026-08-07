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

  it('leerDocLegal devuelve las versiones _WEB publicables', async () => {
    const terminos = await leerDocLegal('TERMINOS_Y_CONDICIONES')
    const privacidad = await leerDocLegal('POLITICA_DE_PRIVACIDAD')
    expect(terminos).toContain('Términos y Condiciones')
    expect(privacidad).toContain('Política de Privacidad')
    // Las _WEB traen su propio encabezado y fecha (no la inyecta el render).
    expect(terminos).toContain('Última actualización')
    expect(privacidad).toContain('Última actualización')
  })
})

// P-02: las páginas publican las _WEB TAL CUAL. Estos guards codifican los criterios de
// depuración de Sergio (LEEME.md): que la versión que se sirve no reintroduzca el aparato
// interno, los marcadores ni el detalle que solo sirve para atacar.
describe('legal — depuración de la versión publicada', () => {
  it('privacidad publicada: sin aparato interno ni marcadores', async () => {
    const p = await leerDocLegal('POLITICA_DE_PRIVACIDAD')
    // Ninguno de los 9 marcadores de definiciones pendientes sobrevive.
    expect(p).not.toMatch(/\[\s*(PENDIENTE|POR DEFINIR|A DEFINIR|MARCADOR|TODO)/i)
    // Aparato interno del documento de entrega.
    expect(p).not.toContain('Nota de estado')
    expect(p).not.toContain('Notas para la revisión')
    expect(p).not.toContain('Definiciones institucionales pendientes')
    // §11 sin enumeración de controles concretos (solo categorías).
    expect(p).not.toContain('bcrypt')
    // Sin referencia interna al ISRA ni a rutas del repositorio.
    expect(p).not.toContain('ISRA')
    // §10 sin los nombres técnicos / prefijos de seguridad de las cookies.
    expect(p).not.toContain('__Secure-')
    expect(p).not.toContain('__Host-')
    // La tabla de proveedores (art. 6 Ley 25.326) SÍ se mantiene completa.
    expect(p).toContain('| Proveedor |')
  })

  it('términos publicados: sin aparato interno', async () => {
    const t = await leerDocLegal('TERMINOS_Y_CONDICIONES')
    expect(t).not.toContain('Nota de estado')
    expect(t).not.toContain('Notas para la revisión')
    expect(t).not.toContain('Definiciones institucionales pendientes')
    expect(t).toMatch(/## 1\./)
  })
})
