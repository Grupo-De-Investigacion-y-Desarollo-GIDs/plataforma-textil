import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    pedido: { findUnique: vi.fn() },
    taller: { findMany: vi.fn() },
    notificacion: { create: vi.fn().mockResolvedValue({ id: 'n1' }) },
  },
}))

vi.mock('@/compartido/lib/features', () => ({
  getFeatureFlag: vi.fn(),
}))

vi.mock('@/compartido/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
  buildPedidoDisponibleEmail: vi.fn().mockReturnValue({ subject: 'test', html: '<p>test</p>' }),
  buildCotizacionRecibidaEmail: vi.fn(),
  buildCotizacionAceptadaEmail: vi.fn(),
  buildCotizacionRechazadaEmail: vi.fn(),
}))

const mockRegistrarMotivo = vi.fn().mockResolvedValue(undefined)
vi.mock('@/compartido/lib/demanda-insatisfecha', () => ({
  registrarMotivoNoMatch: (...args: unknown[]) => mockRegistrarMotivo(...args),
}))

import { notificarTalleresCompatibles } from '@/compartido/lib/notificaciones'
import { prisma } from '@/compartido/lib/prisma'
import { getFeatureFlag } from '@/compartido/lib/features'

const mockGetFlag = getFeatureFlag as ReturnType<typeof vi.fn>
const mockPedidoFind = prisma.pedido.findUnique as ReturnType<typeof vi.fn>
const mockTallerFind = prisma.taller.findMany as ReturnType<typeof vi.fn>
const mockNotifCreate = prisma.notificacion.create as ReturnType<typeof vi.fn>

const PEDIDO = {
  id: 'pedido-1',
  omId: 'OM-2026-001',
  marcaId: 'marca-1',
  tipoPrenda: 'Remera basica',
  tipoPrendaId: null,
  cantidad: 500,
  procesosRequeridos: [],
  marca: { nombre: 'DulceModa' },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetFlag.mockResolvedValue(true)
  mockPedidoFind.mockResolvedValue(PEDIDO)
})

describe('notificarTalleresCompatibles — F-05 integration', () => {
  it('no hace nada si feature flag esta desactivado', async () => {
    mockGetFlag.mockResolvedValue(false)
    await notificarTalleresCompatibles('pedido-1')
    expect(mockPedidoFind).not.toHaveBeenCalled()
  })

  it('no hace nada si pedido no existe', async () => {
    mockPedidoFind.mockResolvedValue(null)
    await notificarTalleresCompatibles('pedido-inexistente')
    expect(mockTallerFind).not.toHaveBeenCalled()
  })

  it('registra MotivoNoMatch cuando no hay talleres compatibles', async () => {
    mockTallerFind.mockResolvedValueOnce([])

    await notificarTalleresCompatibles('pedido-1')
    // fire-and-forget — wait for microtask
    await vi.waitFor(() => expect(mockRegistrarMotivo).toHaveBeenCalledOnce())

    expect(mockRegistrarMotivo).toHaveBeenCalledWith(PEDIDO)
    expect(mockNotifCreate).not.toHaveBeenCalled()
  })

  it('notifica talleres cuando hay matches (sin crear MotivoNoMatch)', async () => {
    mockTallerFind.mockResolvedValueOnce([
      {
        id: 'taller-1',
        nombre: 'Taller Fenix',
        user: { id: 'user-1', email: 'fenix@test.com' },
        procesos: [],
      },
    ])

    await notificarTalleresCompatibles('pedido-1')

    expect(mockNotifCreate).toHaveBeenCalledOnce()
    expect(mockRegistrarMotivo).not.toHaveBeenCalled()
  })

  it('filtra talleres por procesosRequeridos', async () => {
    const pedidoConProcesos = { ...PEDIDO, procesosRequeridos: ['CONFECCION'] }
    mockPedidoFind.mockResolvedValue(pedidoConProcesos)

    mockTallerFind.mockResolvedValueOnce([
      {
        id: 'taller-1',
        nombre: 'Taller Confeccion',
        user: { id: 'u1', email: 't1@test.com' },
        procesos: [{ proceso: { nombre: 'Confeccion' } }],
      },
      {
        id: 'taller-2',
        nombre: 'Taller Corte',
        user: { id: 'u2', email: 't2@test.com' },
        procesos: [{ proceso: { nombre: 'Corte' } }],
      },
    ])

    await notificarTalleresCompatibles('pedido-1')

    // Solo taller-1 debio recibir notificacion (tiene Confeccion)
    expect(mockNotifCreate).toHaveBeenCalledOnce()
    const notifData = mockNotifCreate.mock.calls[0][0].data
    expect(notifData.userId).toBe('u1')
  })

  it('registra MotivoNoMatch cuando procesosRequeridos excluye a todos', async () => {
    const pedidoConProcesos = { ...PEDIDO, procesosRequeridos: ['ESTAMPADO_DIGITAL'] }
    mockPedidoFind.mockResolvedValue(pedidoConProcesos)

    mockTallerFind.mockResolvedValueOnce([
      {
        id: 'taller-1',
        nombre: 'Taller Confeccion',
        user: { id: 'u1', email: 't1@test.com' },
        procesos: [{ proceso: { nombre: 'Confeccion' } }],
      },
    ])

    await notificarTalleresCompatibles('pedido-1')
    await vi.waitFor(() => expect(mockRegistrarMotivo).toHaveBeenCalledOnce())

    expect(mockNotifCreate).not.toHaveBeenCalled()
  })
})
