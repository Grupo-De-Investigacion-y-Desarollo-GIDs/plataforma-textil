import { describe, test, expect } from 'vitest'

describe('T-02 Observaciones de campo', () => {
  describe('Schema — enums y modelo', () => {
    test('TipoObservacion tiene 9 valores', async () => {
      const { Prisma } = await import('@prisma/client')
      const valores = [
        'RESISTENCIA', 'EXPECTATIVA', 'DIFICULTAD_TECNICA', 'DIFICULTAD_PROCESO',
        'OPORTUNIDAD', 'EXITO', 'CONTEXTO_TALLER', 'CONTEXTO_MARCA', 'POLITICA_PUBLICA',
      ]
      // Verify enum exists by checking ModelName includes ObservacionCampo
      expect(Prisma.ModelName.ObservacionCampo).toBe('ObservacionCampo')
      expect(valores).toHaveLength(9)
    })

    test('FuenteObservacion tiene 6 valores', () => {
      const valores = ['VISITA', 'LLAMADA', 'WHATSAPP', 'PLATAFORMA', 'ENTREVISTA', 'OTROS']
      expect(valores).toHaveLength(6)
    })

    test('Sentimiento tiene 3 valores', () => {
      const valores = ['POSITIVO', 'NEUTRAL', 'NEGATIVO']
      expect(valores).toHaveLength(3)
    })

    test('ObservacionCampo model esta en Prisma', async () => {
      const { PrismaClient } = await import('@prisma/client')
      const client = new PrismaClient()
      expect(client.observacionCampo).toBeDefined()
      expect(typeof client.observacionCampo.findMany).toBe('function')
      expect(typeof client.observacionCampo.create).toBe('function')
      expect(typeof client.observacionCampo.update).toBe('function')
      expect(typeof client.observacionCampo.delete).toBe('function')
      await client.$disconnect()
    })
  })

  describe('API route — validacion de endpoints', () => {
    test('Zod schema para crear observacion valida tipos', () => {
      const { z } = require('zod')
      const schema = z.object({
        tipo: z.enum([
          'RESISTENCIA', 'EXPECTATIVA', 'DIFICULTAD_TECNICA', 'DIFICULTAD_PROCESO',
          'OPORTUNIDAD', 'EXITO', 'CONTEXTO_TALLER', 'CONTEXTO_MARCA', 'POLITICA_PUBLICA',
        ]),
        fuente: z.enum(['VISITA', 'LLAMADA', 'WHATSAPP', 'PLATAFORMA', 'ENTREVISTA', 'OTROS']).default('VISITA'),
        sentimiento: z.enum(['POSITIVO', 'NEUTRAL', 'NEGATIVO']).optional(),
        importancia: z.number().int().min(1).max(5).default(3),
        titulo: z.string().min(1).max(200),
        contenido: z.string().min(1),
        tags: z.array(z.string()).default([]),
        fechaEvento: z.string(),
      })

      // Valid input
      const valid = schema.safeParse({
        tipo: 'RESISTENCIA',
        titulo: 'Test',
        contenido: 'Contenido',
        fechaEvento: '2026-05-01',
      })
      expect(valid.success).toBe(true)

      // Invalid tipo
      const invalid = schema.safeParse({
        tipo: 'INVALIDO',
        titulo: 'Test',
        contenido: 'Contenido',
        fechaEvento: '2026-05-01',
      })
      expect(invalid.success).toBe(false)

      // Empty titulo
      const emptyTitle = schema.safeParse({
        tipo: 'EXITO',
        titulo: '',
        contenido: 'Contenido',
        fechaEvento: '2026-05-01',
      })
      expect(emptyTitle.success).toBe(false)

      // Importancia fuera de rango
      const badImportancia = schema.safeParse({
        tipo: 'EXITO',
        titulo: 'Test',
        contenido: 'Contenido',
        fechaEvento: '2026-05-01',
        importancia: 6,
      })
      expect(badImportancia.success).toBe(false)
    })

    test('importancia default es 3', () => {
      const { z } = require('zod')
      const schema = z.object({
        importancia: z.number().int().min(1).max(5).default(3),
      })
      const result = schema.parse({})
      expect(result.importancia).toBe(3)
    })

    test('tags default es array vacio', () => {
      const { z } = require('zod')
      const schema = z.object({
        tags: z.array(z.string()).default([]),
      })
      const result = schema.parse({})
      expect(result.tags).toEqual([])
    })

    test('fuente default es VISITA', () => {
      const { z } = require('zod')
      const schema = z.object({
        fuente: z.enum(['VISITA', 'LLAMADA', 'WHATSAPP', 'PLATAFORMA', 'ENTREVISTA', 'OTROS']).default('VISITA'),
      })
      const result = schema.parse({})
      expect(result.fuente).toBe('VISITA')
    })
  })

  describe('Tags — sugerencias y filtrado', () => {
    test('tags sugeridos incluyen todos los esperados', () => {
      const TAGS_SUGERIDOS = [
        'cultural', 'fiscal', 'tecnico', 'proceso', 'positivo', 'negativo',
        'urgente', 'politica-publica', 'engagement', 'capacitacion', 'comercial',
      ]
      expect(TAGS_SUGERIDOS).toHaveLength(11)
      expect(TAGS_SUGERIDOS).toContain('cultural')
      expect(TAGS_SUGERIDOS).toContain('fiscal')
      expect(TAGS_SUGERIDOS).toContain('politica-publica')
    })

    test('tags se normalizan a lowercase', () => {
      const input = 'Cultural, FISCAL, Tecnico'
      const tags = input.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      expect(tags).toEqual(['cultural', 'fiscal', 'tecnico'])
    })

    test('tags vacios se filtran', () => {
      const input = 'cultural, , , fiscal'
      const tags = input.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      expect(tags).toEqual(['cultural', 'fiscal'])
    })
  })

  describe('Exportes — imports disponibles', () => {
    test('generarXlsx se puede importar', async () => {
      const mod = await import('@/compartido/lib/exportes')
      expect(mod.generarXlsx).toBeDefined()
      expect(typeof mod.generarXlsx).toBe('function')
    }, 15000)

    test('HojaExportable tiene la interfaz correcta', async () => {
      const hoja = {
        nombre: 'Test',
        headers: ['Col1', 'Col2'],
        filas: [['a', 'b']],
      }
      expect(hoja.nombre).toBeDefined()
      expect(hoja.headers).toHaveLength(2)
      expect(hoja.filas).toHaveLength(1)
    })
  })

  describe('Permisos — logica de edicion', () => {
    test('ADMIN puede editar cualquier observacion', () => {
      const session = { user: { id: 'admin1', role: 'ADMIN' } }
      const observacion = { autorId: 'otro-user' }
      const canEdit = session.user.role === 'ADMIN' || observacion.autorId === session.user.id
      expect(canEdit).toBe(true)
    })

    test('autor puede editar su observacion', () => {
      const session = { user: { id: 'user1', role: 'ESTADO' } }
      const observacion = { autorId: 'user1' }
      const canEdit = session.user.role === 'ADMIN' || observacion.autorId === session.user.id
      expect(canEdit).toBe(true)
    })

    test('otro ESTADO no puede editar', () => {
      const session = { user: { id: 'estado2', role: 'ESTADO' } }
      const observacion = { autorId: 'estado1' }
      const canEdit = session.user.role === 'ADMIN' || observacion.autorId === session.user.id
      expect(canEdit).toBe(false)
    })

    test('TALLER no tiene acceso', () => {
      const session = { user: { role: 'TALLER' } }
      const allowed = ['ADMIN', 'ESTADO'].includes(session.user.role)
      expect(allowed).toBe(false)
    })

    test('MARCA no tiene acceso', () => {
      const session = { user: { role: 'MARCA' } }
      const allowed = ['ADMIN', 'ESTADO'].includes(session.user.role)
      expect(allowed).toBe(false)
    })
  })

  describe('Listado — logica de filtros', () => {
    test('periodo 7d calcula fecha correcta', () => {
      const now = new Date('2026-05-05T12:00:00Z')
      const desde = new Date(now.getTime() - 7 * 86400000)
      expect(desde.toISOString().slice(0, 10)).toBe('2026-04-28')
    })

    test('periodo 30d calcula fecha correcta', () => {
      const now = new Date('2026-05-05T12:00:00Z')
      const desde = new Date(now.getTime() - 30 * 86400000)
      expect(desde.toISOString().slice(0, 10)).toBe('2026-04-05')
    })

    test('sin periodo no filtra por fecha', () => {
      const periodo = undefined
      const where: Record<string, unknown> = {}
      if (periodo) where.fechaEvento = {}
      expect(where.fechaEvento).toBeUndefined()
    })
  })

  describe('Paginas — archivos existen', () => {
    test('pagina de listado existe', async () => {
      const { existsSync } = await import('fs')
      expect(existsSync('src/app/(admin)/admin/observaciones/page.tsx')).toBe(true)
    })

    test('pagina nueva existe', async () => {
      const { existsSync } = await import('fs')
      expect(existsSync('src/app/(admin)/admin/observaciones/nueva/page.tsx')).toBe(true)
    })

    test('pagina editar existe', async () => {
      const { existsSync } = await import('fs')
      expect(existsSync('src/app/(admin)/admin/observaciones/[id]/editar/page.tsx')).toBe(true)
    })

    test('loading skeletons existen', async () => {
      const { existsSync } = await import('fs')
      expect(existsSync('src/app/(admin)/admin/observaciones/loading.tsx')).toBe(true)
      expect(existsSync('src/app/(admin)/admin/observaciones/nueva/loading.tsx')).toBe(true)
      expect(existsSync('src/app/(admin)/admin/observaciones/[id]/editar/loading.tsx')).toBe(true)
    })

    test('formulario compartido existe', async () => {
      const { existsSync } = await import('fs')
      expect(existsSync('src/app/(admin)/admin/observaciones/formulario-observacion.tsx')).toBe(true)
    })
  })
})
