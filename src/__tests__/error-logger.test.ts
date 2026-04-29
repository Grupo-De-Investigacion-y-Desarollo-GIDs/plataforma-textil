import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    logActividad: {
      create: vi.fn().mockResolvedValue({ id: 'log-1' }),
    },
  },
}))

import { logearError } from '@/compartido/lib/error-logger'
import { prisma } from '@/compartido/lib/prisma'

const mockCreate = prisma.logActividad.create as ReturnType<typeof vi.fn>

beforeEach(() => {
  mockCreate.mockClear()
})

describe('logearError', () => {
  it('llama a console.error con datos del error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('DB connection failed')

    logearError(error, {
      contexto: 'admin',
      ruta: '/admin/talleres',
      userId: 'user-1',
      digest: 'abc123',
    })

    expect(consoleSpy).toHaveBeenCalledWith('[error]', expect.objectContaining({
      contexto: 'admin',
      ruta: '/admin/talleres',
      userId: 'user-1',
      digest: 'abc123',
      message: 'DB connection failed',
    }))

    consoleSpy.mockRestore()
  })

  it('persiste en DB via logActividad para contextos no-publico', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    logearError(new Error('Query timeout'), {
      contexto: 'taller',
      ruta: '/taller/pedidos',
      userId: 'user-2',
      digest: 'def456',
    })

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        accion: 'ERROR_RENDER',
        userId: 'user-2',
        detalles: {
          contexto: 'taller',
          ruta: '/taller/pedidos',
          digest: 'def456',
          mensaje: 'Query timeout',
        },
      },
    })
  })

  it('NO persiste en DB para contexto publico', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    logearError(new Error('Page not found'), {
      contexto: 'publico',
      ruta: '/directorio',
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('funciona sin userId ni digest', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    logearError(new Error('Unknown error'), {
      contexto: 'marca',
      ruta: '/marca/pedidos',
    })

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        accion: 'ERROR_RENDER',
        userId: null,
        detalles: expect.objectContaining({
          contexto: 'marca',
          mensaje: 'Unknown error',
        }),
      },
    })
  })

  it('trunca stack trace a 5 lineas en console.error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Deep error')
    error.stack = Array.from({ length: 20 }, (_, i) => `line ${i}`).join('\n')

    logearError(error, { contexto: 'admin' })

    const loggedData = consoleSpy.mock.calls[0][1]
    const stackLines = loggedData.stack.split('\n')
    expect(stackLines).toHaveLength(5)

    consoleSpy.mockRestore()
  })

  it('maneja contexto estado', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    logearError(new Error('Fallo'), {
      contexto: 'estado',
      ruta: '/estado/documentos',
      userId: 'user-3',
    })

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        accion: 'ERROR_RENDER',
        userId: 'user-3',
        detalles: expect.objectContaining({
          contexto: 'estado',
        }),
      },
    })
  })
})
