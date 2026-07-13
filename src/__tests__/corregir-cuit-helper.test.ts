import { describe, it, expect, vi, beforeEach } from 'vitest'

// Unit del helper corregirYVerificarCuit (Piezas A+B del circuito CUIT V4). Corre ARCA en modo
// MOCK (ARCA_PROVIDER=mock -> consultarPadron short-circuitea a mockConsulta, que valida cualquier
// CUIT salvo 00000000000 -> INEXISTENTE y 11111111111 -> INACTIVO). Prisma y el log van mockeados.

const { mockFindUnique, mockTransaction, mockTxFindFirst, mockTxUpdate, mockLog } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockTransaction: vi.fn(),
  mockTxFindFirst: vi.fn(),
  mockTxUpdate: vi.fn(),
  mockLog: vi.fn(),
}))

vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    taller: { findUnique: mockFindUnique },
    $transaction: mockTransaction,
  },
}))
vi.mock('@/compartido/lib/log', () => ({ logActividad: mockLog }))

import { corregirYVerificarCuit } from '@/compartido/lib/arca'

const OK_CUIT = '20111111112'   // no-reservado -> mock valida
const BAD_CUIT = '11111111111'  // reservado -> mock CUIT_INACTIVO

beforeEach(() => {
  vi.clearAllMocks()
  process.env.ARCA_PROVIDER = 'mock'
  mockTxFindFirst.mockResolvedValue(null) // sin colisión por defecto
  mockTxUpdate.mockResolvedValue({})
  // $transaction ejecuta el callback con un tx que expone taller.findFirst/update.
  mockTransaction.mockImplementation(async (fn: (tx: unknown) => unknown) =>
    fn({ taller: { findFirst: mockTxFindFirst, update: mockTxUpdate } }),
  )
})

describe('corregirYVerificarCuit', () => {
  it('corrige-y-valida: persiste cuit nuevo + verificadoAfip + reactivación (ACTIVA)', async () => {
    mockFindUnique.mockResolvedValue({ id: 't1', cuit: '20000000001', verificadoAfip: false })

    const r = await corregirYVerificarCuit('t1', OK_CUIT, 'user-taller')

    expect(r.exitosa).toBe(true)
    expect(mockTxUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 't1' },
        data: expect.objectContaining({
          cuit: OK_CUIT,
          verificadoAfip: true,
          estadoCuenta: 'ACTIVA',
          inicioGracia: null,
          inactivadaAt: null,
          recordatorioCuitEnviadoAt: null,
        }),
      }),
    )
  })

  it('audita CUIT_CORREGIDO con actor, cuit anterior y nuevo', async () => {
    mockFindUnique.mockResolvedValue({ id: 't1', cuit: '20000000001', verificadoAfip: false })

    await corregirYVerificarCuit('t1', OK_CUIT, 'user-estado')

    expect(mockLog).toHaveBeenCalledWith('CUIT_CORREGIDO', 'user-estado', {
      tallerId: 't1',
      cuitAnterior: '20000000001',
      cuitNuevo: OK_CUIT,
      exitosa: true,
    })
  })

  it('gating: taller ya verificado -> YA_VERIFICADO, sin llamar a ARCA ni persistir', async () => {
    mockFindUnique.mockResolvedValue({ id: 't1', cuit: '20000000001', verificadoAfip: true })

    const r = await corregirYVerificarCuit('t1', OK_CUIT, 'user-taller')

    expect(r.exitosa).toBe(false)
    expect(r.error).toBe('YA_VERIFICADO')
    expect(mockTransaction).not.toHaveBeenCalled()
    expect(mockLog).not.toHaveBeenCalled()
  })

  it('colisión @unique (findFirst encuentra otro taller) -> CUIT_EN_USO, no persiste ni audita', async () => {
    mockFindUnique.mockResolvedValue({ id: 't1', cuit: '20000000001', verificadoAfip: false })
    mockTxFindFirst.mockResolvedValue({ id: 'otro-taller' })

    const r = await corregirYVerificarCuit('t1', OK_CUIT, 'user-taller')

    expect(r.exitosa).toBe(false)
    expect(r.error).toBe('CUIT_EN_USO')
    expect(mockTxUpdate).not.toHaveBeenCalled()
    expect(mockLog).not.toHaveBeenCalled()
  })

  it('colisión por constraint (update tira P2002) -> CUIT_EN_USO', async () => {
    mockFindUnique.mockResolvedValue({ id: 't1', cuit: '20000000001', verificadoAfip: false })
    mockTxUpdate.mockRejectedValue(Object.assign(new Error('unique'), { code: 'P2002' }))

    const r = await corregirYVerificarCuit('t1', OK_CUIT, 'user-taller')

    expect(r.error).toBe('CUIT_EN_USO')
    expect(mockLog).not.toHaveBeenCalled()
  })

  it('reintento sin cambiar el número (mismo cuit, ARCA ahora valida) reactiva', async () => {
    mockFindUnique.mockResolvedValue({ id: 't1', cuit: OK_CUIT, verificadoAfip: false })

    const r = await corregirYVerificarCuit('t1', OK_CUIT, 'user-taller')

    expect(r.exitosa).toBe(true)
    expect(mockTxUpdate).toHaveBeenCalled()
    expect(mockLog).toHaveBeenCalledWith('CUIT_CORREGIDO', 'user-taller',
      expect.objectContaining({ cuitAnterior: OK_CUIT, cuitNuevo: OK_CUIT }))
  })

  it('ARCA rechaza el CUIT (reservado inactivo) -> no persiste, devuelve el código de ARCA', async () => {
    mockFindUnique.mockResolvedValue({ id: 't1', cuit: '20000000001', verificadoAfip: false })

    const r = await corregirYVerificarCuit('t1', BAD_CUIT, 'user-taller')

    expect(r.exitosa).toBe(false)
    expect(r.error).toBe('CUIT_INACTIVO')
    expect(mockTransaction).not.toHaveBeenCalled()
    expect(mockLog).not.toHaveBeenCalled()
  })

  it('taller inexistente -> TALLER_NO_ENCONTRADO', async () => {
    mockFindUnique.mockResolvedValue(null)

    const r = await corregirYVerificarCuit('nope', OK_CUIT, 'user-taller')

    expect(r.error).toBe('TALLER_NO_ENCONTRADO')
  })
})
