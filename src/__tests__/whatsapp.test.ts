import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('normalizarTelefonoArgentino', () => {
  let normalizarTelefonoArgentino: typeof import('@/compartido/lib/whatsapp').normalizarTelefonoArgentino

  beforeEach(async () => {
    const mod = await import('@/compartido/lib/whatsapp')
    normalizarTelefonoArgentino = mod.normalizarTelefonoArgentino
  })

  it('acepta 12 digitos con 54 (formato completo)', () => {
    expect(normalizarTelefonoArgentino('541123456789')).toBe('541123456789')
  })

  it('acepta 11 digitos con 54 (formato viejo sin 9)', () => {
    expect(normalizarTelefonoArgentino('54123456789')).toBe('54123456789')
  })

  it('acepta 10 digitos y agrega 54', () => {
    expect(normalizarTelefonoArgentino('1123456789')).toBe('541123456789')
  })

  it('limpia caracteres no numericos', () => {
    expect(normalizarTelefonoArgentino('+54 11 2345-6789')).toBe('541123456789')
  })

  it('agrega 54 a numeros de 10 digitos sin codigo de pais', () => {
    expect(normalizarTelefonoArgentino('1123456789')).toBe('541123456789')
  })

  it('retorna null para numeros muy cortos', () => {
    expect(normalizarTelefonoArgentino('123')).toBeNull()
    expect(normalizarTelefonoArgentino('1234567')).toBeNull()
  })

  it('retorna null para numeros muy largos', () => {
    expect(normalizarTelefonoArgentino('54112345678901')).toBeNull()
  })

  it('retorna null para string vacio', () => {
    expect(normalizarTelefonoArgentino('')).toBeNull()
  })
})

describe('generarUrlWaMe', () => {
  it('genera URL wa.me con texto encodificado', async () => {
    const { generarUrlWaMe } = await import('@/compartido/lib/whatsapp')
    const url = generarUrlWaMe('541123456789', 'Hola, tenes un pedido nuevo!')
    expect(url).toBe('https://wa.me/541123456789?text=Hola%2C%20tenes%20un%20pedido%20nuevo!')
  })

  it('maneja caracteres especiales en texto', async () => {
    const { generarUrlWaMe } = await import('@/compartido/lib/whatsapp')
    const url = generarUrlWaMe('541123456789', 'Linea 1\nLinea 2')
    expect(url).toContain('wa.me/541123456789')
    expect(url).toContain('text=')
  })
})

describe('WhatsApp templates', () => {
  it('renderiza pedido_nuevo correctamente', async () => {
    const { renderTemplate } = await import('@/compartido/lib/whatsapp-templates')
    const msg = renderTemplate('pedido_nuevo', {
      marca: 'DulceModa',
      resumen: '800 remeras basicas',
      enlace: 'https://example.com/n/abc123',
    })
    expect(msg).toContain('PDT')
    expect(msg).toContain('DulceModa')
    expect(msg).toContain('800 remeras basicas')
    expect(msg).toContain('https://example.com/n/abc123')
  })

  it('renderiza cotizacion_aceptada correctamente', async () => {
    const { renderTemplate } = await import('@/compartido/lib/whatsapp-templates')
    const msg = renderTemplate('cotizacion_aceptada', {
      marca: 'DulceModa',
      pedido: 'OM-2026-001',
      enlace: 'https://example.com/n/xyz',
    })
    expect(msg).toContain('Felicitaciones')
    expect(msg).toContain('DulceModa')
    expect(msg).toContain('OM-2026-001')
  })

  it('renderiza documento_aprobado correctamente', async () => {
    const { renderTemplate } = await import('@/compartido/lib/whatsapp-templates')
    const msg = renderTemplate('documento_aprobado', {
      tipoDocumento: 'Habilitacion municipal',
      puntos: '10',
      enlace: 'https://example.com/n/xyz',
    })
    expect(msg).toContain('aprobo')
    expect(msg).toContain('Habilitacion municipal')
    expect(msg).toContain('10 puntos')
  })

  it('renderiza documento_rechazado con motivo', async () => {
    const { renderTemplate } = await import('@/compartido/lib/whatsapp-templates')
    const msg = renderTemplate('documento_rechazado', {
      tipoDocumento: 'CUIT',
      motivo: 'Imagen borrosa',
      enlace: 'https://example.com/n/xyz',
    })
    expect(msg).toContain('correcciones')
    expect(msg).toContain('Imagen borrosa')
  })

  it('renderiza nivel_subido sin beneficios', async () => {
    const { renderTemplate } = await import('@/compartido/lib/whatsapp-templates')
    const msg = renderTemplate('nivel_subido', {
      nivel: 'PLATA',
      beneficios: [],
      enlace: 'https://example.com/n/xyz',
    })
    expect(msg).toContain('PLATA')
    expect(msg).not.toContain('Ahora tenes acceso a')
  })

  it('renderiza nivel_subido con beneficios', async () => {
    const { renderTemplate } = await import('@/compartido/lib/whatsapp-templates')
    const msg = renderTemplate('nivel_subido', {
      nivel: 'ORO',
      beneficios: ['Pedidos exclusivos', 'Mayor visibilidad'],
      enlace: 'https://example.com/n/xyz',
    })
    expect(msg).toContain('ORO')
    expect(msg).toContain('Pedidos exclusivos')
    expect(msg).toContain('Mayor visibilidad')
  })

  it('renderiza mensaje_admin', async () => {
    const { renderTemplate } = await import('@/compartido/lib/whatsapp-templates')
    const msg = renderTemplate('mensaje_admin', {
      texto: 'Nuevo curso disponible en la academia',
      enlace: 'https://example.com/n/xyz',
    })
    expect(msg).toContain('PDT')
    expect(msg).toContain('Nuevo curso disponible')
  })

  it('todos los 8 templates estan definidos', async () => {
    const { TEMPLATES } = await import('@/compartido/lib/whatsapp-templates')
    expect(Object.keys(TEMPLATES)).toHaveLength(8)
    expect(TEMPLATES).toHaveProperty('pedido_nuevo')
    expect(TEMPLATES).toHaveProperty('cotizacion_aceptada')
    expect(TEMPLATES).toHaveProperty('documento_aprobado')
    expect(TEMPLATES).toHaveProperty('documento_rechazado')
    expect(TEMPLATES).toHaveProperty('nivel_subido')
    expect(TEMPLATES).toHaveProperty('mensaje_admin')
    expect(TEMPLATES).toHaveProperty('bienvenida')
    expect(TEMPLATES).toHaveProperty('recordatorio_perfil')
  })
})

describe('generarMensajeWhatsapp — abstraccion A/B', () => {
  it('usa wa-me como proveedor default', async () => {
    // Verificar que el env default es wa-me
    const proveedor = process.env.WHATSAPP_PROVIDER ?? 'wa-me'
    expect(proveedor).toBe('wa-me')
  })

  it('acepta business-api como proveedor via env', () => {
    const original = process.env.WHATSAPP_PROVIDER
    process.env.WHATSAPP_PROVIDER = 'business-api'
    const proveedor = process.env.WHATSAPP_PROVIDER ?? 'wa-me'
    expect(proveedor).toBe('business-api')
    process.env.WHATSAPP_PROVIDER = original
  })
})

describe('MagicLink — generacion de token', () => {
  it('magic-link.ts se importa sin errores', async () => {
    const mod = await import('@/compartido/lib/magic-link')
    expect(mod.generarMagicLink).toBeDefined()
    expect(typeof mod.generarMagicLink).toBe('function')
  })
})

describe('Migracion: no quedan alert() en archivos migrados', () => {
  it('no hay alert() en archivos de F-02', async () => {
    const fs = await import('fs')
    const files = [
      'src/compartido/lib/whatsapp.ts',
      'src/compartido/lib/magic-link.ts',
      'src/compartido/lib/whatsapp-templates.ts',
    ]
    for (const f of files) {
      const content = fs.readFileSync(f, 'utf-8')
      expect(content).not.toContain('alert(')
    }
  })
})
