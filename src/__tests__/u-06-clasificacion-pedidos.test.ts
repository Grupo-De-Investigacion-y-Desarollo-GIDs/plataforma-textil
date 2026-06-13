import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// U-06 — Clasificacion automatica de pedidos (COMERCIAL / SUBCONTRATACION).
// El campo Pedido.tipo es invisible en UI, asi que el caso real se cubre a nivel
// unidad mockeando prisma: taller.findFirst -> null = COMERCIAL; -> {id} =
// SUBCONTRATACION. No hace falta fixture dual real para ejercitar ambas ramas.
// Ver .claude/specs/v4-u-06-clasificacion-pedidos.md

const mockAuth = vi.fn()
vi.mock('@/compartido/lib/auth', () => ({ auth: () => mockAuth() }))

const mockPrisma = {
  marca: { findUnique: vi.fn() },
  taller: { findFirst: vi.fn() },
  pedido: { create: vi.fn() },
}
vi.mock('@/compartido/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/compartido/lib/log', () => ({ logActividad: vi.fn() }))
vi.mock('@/compartido/lib/ratelimit', () => ({ rateLimit: vi.fn().mockResolvedValue(null) }))

function makeRequest(url: string, body: unknown) {
  return new NextRequest(new URL(url, 'http://localhost'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
  mockPrisma.pedido.create.mockResolvedValue({ id: 'p1', omId: 'OM-2026-XXXX' })
})

describe('POST /api/pedidos — clasificacion automatica (U-06)', () => {
  it('marca SIN taller publica -> tipo COMERCIAL', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'mu1', role: 'MARCA' } })
    mockPrisma.marca.findUnique.mockResolvedValue({ id: 'mi1', userId: 'mu1' })
    mockPrisma.taller.findFirst.mockResolvedValue(null) // dueño no tiene taller

    const { POST } = await import('@/app/api/pedidos/route')
    const res = await POST(makeRequest('http://localhost/api/pedidos', {
      tipoPrenda: 'Remera', cantidad: 100,
    }))

    expect(res.status).toBe(201)
    const createArgs = mockPrisma.pedido.create.mock.calls[0][0]
    expect(createArgs.data.tipo).toBe('COMERCIAL')
    // se clasifico mirando el userId del dueño de la marca
    expect(mockPrisma.taller.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'mu1' } })
    )
  })

  it('marca CON taller (usuario dual) publica -> tipo SUBCONTRATACION', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'mu1', role: 'MARCA' } })
    mockPrisma.marca.findUnique.mockResolvedValue({ id: 'mi1', userId: 'mu1' })
    mockPrisma.taller.findFirst.mockResolvedValue({ id: 't1' }) // dueño tambien es taller

    const { POST } = await import('@/app/api/pedidos/route')
    const res = await POST(makeRequest('http://localhost/api/pedidos', {
      tipoPrenda: 'Buzo', cantidad: 50,
    }))

    expect(res.status).toBe(201)
    const createArgs = mockPrisma.pedido.create.mock.calls[0][0]
    expect(createArgs.data.tipo).toBe('SUBCONTRATACION')
  })

  it('ignora un `tipo` enviado por el cliente (clasificacion autoritativa)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'mu1', role: 'MARCA' } })
    mockPrisma.marca.findUnique.mockResolvedValue({ id: 'mi1', userId: 'mu1' })
    mockPrisma.taller.findFirst.mockResolvedValue(null)

    const { POST } = await import('@/app/api/pedidos/route')
    const res = await POST(makeRequest('http://localhost/api/pedidos', {
      tipoPrenda: 'Remera', cantidad: 100, tipo: 'SUBCONTRATACION', // intento de spoof
    }))

    expect(res.status).toBe(201)
    const createArgs = mockPrisma.pedido.create.mock.calls[0][0]
    // el server clasifica por el dueño, no por el body -> COMERCIAL
    expect(createArgs.data.tipo).toBe('COMERCIAL')
  })
})
