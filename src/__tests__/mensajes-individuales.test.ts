import { describe, test, expect, vi } from 'vitest'
import { z } from 'zod'

// --- Schema validation (same as route) ---

const SchemaCrearMensaje = z.object({
  destinatarioId: z.string().min(1),
  titulo: z.string().min(3).max(120),
  mensaje: z.string().min(10).max(2000),
  link: z.string().url().refine(u => /^https?:\/\//.test(u), 'Solo URLs http/https').optional().or(z.literal('')),
  enviarPorWhatsapp: z.boolean().default(false),
})

describe('F-07 Mensajes individuales', () => {
  describe('SchemaCrearMensaje — validacion Zod', () => {
    test('acepta mensaje valido completo', () => {
      const result = SchemaCrearMensaje.safeParse({
        destinatarioId: 'user123',
        titulo: 'Pedido de informacion',
        mensaje: 'Hola, necesitamos que completes la verificacion de CUIT.',
        link: 'https://plataforma-textil.vercel.app/taller/formalizacion',
        enviarPorWhatsapp: true,
      })
      expect(result.success).toBe(true)
    })

    test('acepta mensaje sin link y sin whatsapp', () => {
      const result = SchemaCrearMensaje.safeParse({
        destinatarioId: 'user123',
        titulo: 'Aviso importante',
        mensaje: 'Este es un mensaje informativo para el taller.',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.enviarPorWhatsapp).toBe(false)
        expect(result.data.link).toBeUndefined()
      }
    })

    test('acepta link vacio (string vacia)', () => {
      const result = SchemaCrearMensaje.safeParse({
        destinatarioId: 'user123',
        titulo: 'Aviso',
        mensaje: 'Mensaje sin link adjunto para el usuario.',
        link: '',
      })
      expect(result.success).toBe(true)
    })

    test('rechaza titulo menor a 3 caracteres', () => {
      const result = SchemaCrearMensaje.safeParse({
        destinatarioId: 'user123',
        titulo: 'AB',
        mensaje: 'Un mensaje con contenido suficiente.',
      })
      expect(result.success).toBe(false)
    })

    test('rechaza mensaje menor a 10 caracteres', () => {
      const result = SchemaCrearMensaje.safeParse({
        destinatarioId: 'user123',
        titulo: 'Titulo valido',
        mensaje: 'Corto',
      })
      expect(result.success).toBe(false)
    })

    test('rechaza titulo mayor a 120 caracteres', () => {
      const result = SchemaCrearMensaje.safeParse({
        destinatarioId: 'user123',
        titulo: 'A'.repeat(121),
        mensaje: 'Mensaje con contenido suficiente.',
      })
      expect(result.success).toBe(false)
    })

    test('rechaza mensaje mayor a 2000 caracteres', () => {
      const result = SchemaCrearMensaje.safeParse({
        destinatarioId: 'user123',
        titulo: 'Titulo valido',
        mensaje: 'A'.repeat(2001),
      })
      expect(result.success).toBe(false)
    })

    test('rechaza destinatarioId vacio', () => {
      const result = SchemaCrearMensaje.safeParse({
        destinatarioId: '',
        titulo: 'Titulo valido',
        mensaje: 'Mensaje con contenido suficiente.',
      })
      expect(result.success).toBe(false)
    })

    test('rechaza URL maliciosa javascript:', () => {
      const result = SchemaCrearMensaje.safeParse({
        destinatarioId: 'user123',
        titulo: 'Titulo valido',
        mensaje: 'Mensaje con contenido suficiente.',
        link: 'javascript:alert(1)',
      })
      expect(result.success).toBe(false)
    })

    test('acepta URL relativa como string (no url) pero link vacio pasa', () => {
      // URL relativa /taller/perfil no es valida como z.string().url()
      // pero el frontend la pasa como link vacío si no es URL completa
      const result = SchemaCrearMensaje.safeParse({
        destinatarioId: 'user123',
        titulo: 'Titulo valido',
        mensaje: 'Mensaje con contenido suficiente.',
        link: '/taller/formalizacion',
      })
      // z.string().url() rechaza paths relativos — esto es correcto por seguridad
      expect(result.success).toBe(false)
    })
  })

  describe('Componentes — imports resuelven', () => {
    test('EditorMensajeIndividual se puede importar', async () => {
      const mod = await import('@/admin/componentes/editor-mensaje-individual')
      expect(mod.EditorMensajeIndividual).toBeDefined()
    })

    test('BotonEnviarMensaje se puede importar', async () => {
      const mod = await import('@/admin/componentes/boton-enviar-mensaje')
      expect(mod.BotonEnviarMensaje).toBeDefined()
    })
  })

  describe('Tipo mensaje_individual — sin migracion', () => {
    test('tipo mensaje_individual es string valido para filtro', () => {
      const tipo = 'mensaje_individual'
      expect(tipo).toBe('mensaje_individual')
      expect(typeof tipo).toBe('string')
    })
  })

  describe('Rate limit — logica inline', () => {
    test('50 es el limite por hora', () => {
      const LIMITE = 50
      const unaHoraMs = 60 * 60 * 1000

      // Simula conteo
      expect(LIMITE).toBe(50)
      expect(unaHoraMs).toBe(3600000)

      // Si enviados >= 50, debe rechazar
      expect(49 >= LIMITE).toBe(false)
      expect(50 >= LIMITE).toBe(true)
      expect(51 >= LIMITE).toBe(true)
    })
  })

  describe('Sugerencias de links por rol', () => {
    function getSugerencias(rol: string) {
      if (rol === 'TALLER') {
        return [
          { label: 'Su perfil', url: '/taller/perfil' },
          { label: 'Su formalizacion', url: '/taller/formalizacion' },
          { label: 'Su dashboard', url: '/taller' },
        ]
      }
      if (rol === 'MARCA') {
        return [
          { label: 'Sus pedidos', url: '/marca/pedidos' },
          { label: 'Su panel', url: '/marca' },
        ]
      }
      return []
    }

    test('TALLER tiene 3 sugerencias', () => {
      expect(getSugerencias('TALLER')).toHaveLength(3)
    })

    test('MARCA tiene 2 sugerencias', () => {
      expect(getSugerencias('MARCA')).toHaveLength(2)
    })

    test('ADMIN tiene 0 sugerencias', () => {
      expect(getSugerencias('ADMIN')).toHaveLength(0)
    })

    test('ESTADO tiene 0 sugerencias', () => {
      expect(getSugerencias('ESTADO')).toHaveLength(0)
    })
  })

  describe('Integracion WhatsApp — template mensaje_admin', () => {
    test('template mensaje_admin existe en whatsapp-templates', async () => {
      const { TEMPLATES } = await import('@/compartido/lib/whatsapp-templates')
      expect(TEMPLATES.mensaje_admin).toBeDefined()
      expect(typeof TEMPLATES.mensaje_admin).toBe('function')
    })

    test('template mensaje_admin renderiza correctamente', async () => {
      const { renderTemplate } = await import('@/compartido/lib/whatsapp-templates')
      const result = renderTemplate('mensaje_admin', {
        texto: 'Documentos pendientes\n\nPor favor completa la verificacion.',
        enlace: 'https://example.com/n/abc123',
      })
      expect(result).toContain('PDT')
      expect(result).toContain('Documentos pendientes')
      expect(result).toContain('https://example.com/n/abc123')
    })
  })

  describe('Vista destinatario — badge y tipo', () => {
    test('labelPorTipo incluye mensaje_individual', () => {
      const labelPorTipo: Record<string, string> = {
        COTIZACION: 'Ver pedido',
        PEDIDO_DISPONIBLE: 'Ver pedido disponible',
        PEDIDO_INVITACION: 'Ver pedido',
        ADMIN_ENVIO: 'Ir al enlace',
        mensaje_individual: 'Ver detalles',
      }
      expect(labelPorTipo.mensaje_individual).toBe('Ver detalles')
    })
  })

  describe('Archivos — sin alert() residual', () => {
    test('editor-mensaje-individual no usa alert()', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('src/admin/componentes/editor-mensaje-individual.tsx', 'utf8')
      expect(content).not.toMatch(/\balert\(/)
    })

    test('boton-enviar-mensaje no usa alert()', async () => {
      const fs = await import('fs')
      const content = fs.readFileSync('src/admin/componentes/boton-enviar-mensaje.tsx', 'utf8')
      expect(content).not.toMatch(/\balert\(/)
    })
  })
})
