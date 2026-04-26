import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma antes de importar el modulo
vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    logActividad: {
      create: vi.fn().mockResolvedValue({ id: 'log-1' }),
    },
  },
}))

import { logActividad, logAccionAdmin } from '@/compartido/lib/log'
import { prisma } from '@/compartido/lib/prisma'

const mockCreate = prisma.logActividad.create as ReturnType<typeof vi.fn>

beforeEach(() => {
  mockCreate.mockClear()
})

describe('logActividad (generico)', () => {
  it('crea un log con accion y userId', () => {
    logActividad('TEST_ACTION', 'user-1')
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        accion: 'TEST_ACTION',
        userId: 'user-1',
        detalles: undefined,
      },
    })
  })

  it('acepta detalles como JSON generico', () => {
    logActividad('COTIZACION_RECIBIDA', 'user-2', { pedidoId: 'ped-1', monto: 5000 })
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        accion: 'COTIZACION_RECIBIDA',
        userId: 'user-2',
        detalles: { pedidoId: 'ped-1', monto: 5000 },
      },
    })
  })

  it('funciona sin userId (sistema)', () => {
    logActividad('SYSTEM_EVENT')
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        accion: 'SYSTEM_EVENT',
        userId: null,
        detalles: undefined,
      },
    })
  })

  it('funciona con userId null', () => {
    logActividad('SYSTEM_EVENT', null)
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        accion: 'SYSTEM_EVENT',
        userId: null,
        detalles: undefined,
      },
    })
  })

  it('no lanza error si prisma falla (fire-and-forget)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockCreate.mockRejectedValueOnce(new Error('DB down'))

    // No deberia lanzar
    logActividad('WILL_FAIL', 'user-1')

    // Esperar a que el catch se ejecute
    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error escribiendo log:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })
})

describe('logAccionAdmin (tipado)', () => {
  it('llama a logActividad con el shape correcto de LogAdminDetails', () => {
    logAccionAdmin('VALIDACION_APROBADA', 'admin-1', {
      entidad: 'validacion',
      entidadId: 'val-123',
      metadata: { tallerId: 'taller-1', tipoDocumento: 'CUIT' },
    })

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        accion: 'VALIDACION_APROBADA',
        userId: 'admin-1',
        detalles: {
          entidad: 'validacion',
          entidadId: 'val-123',
          metadata: { tallerId: 'taller-1', tipoDocumento: 'CUIT' },
        },
      },
    })
  })

  it('incluye motivo cuando se proporciona', () => {
    logAccionAdmin('CERTIFICADO_REVOCADO', 'admin-1', {
      entidad: 'certificado',
      entidadId: 'cert-1',
      motivo: 'Documento vencido',
      metadata: { tallerId: 'taller-1' },
    })

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        accion: 'CERTIFICADO_REVOCADO',
        userId: 'admin-1',
        detalles: {
          entidad: 'certificado',
          entidadId: 'cert-1',
          motivo: 'Documento vencido',
          metadata: { tallerId: 'taller-1' },
        },
      },
    })
  })

  it('incluye cambios cuando se proporcionan', () => {
    logAccionAdmin('ADMIN_USUARIO_EDITADO', 'admin-1', {
      entidad: 'usuario',
      entidadId: 'user-99',
      cambios: { role: 'ESTADO', active: false },
    })

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        accion: 'ADMIN_USUARIO_EDITADO',
        userId: 'admin-1',
        detalles: {
          entidad: 'usuario',
          entidadId: 'user-99',
          cambios: { role: 'ESTADO', active: false },
        },
      },
    })
  })

  it('requiere entidad y entidadId (verificacion de tipo en compilacion)', () => {
    // Este test verifica que la funcion se llama correctamente con los campos requeridos.
    // La verificacion de tipos es en compilacion — si entidad o entidadId faltaran,
    // TypeScript daria error antes de llegar aca.
    logAccionAdmin('DATOS_EXPORTADOS', 'admin-1', {
      entidad: 'exportacion',
      entidadId: 'talleres',
      metadata: { formato: 'csv' },
    })

    const callArgs = mockCreate.mock.calls[0][0]
    expect(callArgs.data.detalles).toHaveProperty('entidad', 'exportacion')
    expect(callArgs.data.detalles).toHaveProperty('entidadId', 'talleres')
  })
})
