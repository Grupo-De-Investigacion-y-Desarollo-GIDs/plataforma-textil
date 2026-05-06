import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockAuth = vi.fn()
vi.mock('@/compartido/lib/auth', () => ({ auth: () => mockAuth() }))

const mockPrisma = {
  taller: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), count: vi.fn() },
  pedido: { findUnique: vi.fn(), update: vi.fn() },
  pedidoInvitacion: { findUnique: vi.fn(), createMany: vi.fn() },
  cotizacion: { create: vi.fn(), updateMany: vi.fn(), findMany: vi.fn() },
  notificacion: { create: vi.fn() },
  $transaction: vi.fn(),
}
vi.mock('@/compartido/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/compartido/lib/notificaciones', () => ({ notificarCotizacion: vi.fn() }))
vi.mock('@/compartido/lib/log', () => ({ logActividad: vi.fn() }))
vi.mock('@/compartido/lib/ratelimit', () => ({ rateLimit: vi.fn().mockResolvedValue(null) }))
vi.mock('@/compartido/lib/email', () => ({
  sendEmail: vi.fn().mockReturnValue({ catch: vi.fn() }),
  buildInvitacionCotizarEmail: vi.fn().mockReturnValue({ subject: 'test', html: 'test' }),
}))

function makeRequest(url: string, body?: unknown) {
  return new NextRequest(new URL(url, 'http://localhost'), {
    method: body ? 'POST' : 'GET',
    ...(body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
})

// ─── POST /api/cotizaciones — guard verificadoAfip ───────────────────────────

describe('POST /api/cotizaciones — verificadoAfip guard', () => {
  it('rechaza taller no verificado con 403 TALLER_NO_VERIFICADO', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'TALLER' } })
    mockPrisma.taller.findUnique.mockResolvedValue({
      id: 't1', nombre: 'Taller Test', verificadoAfip: false,
    })

    const { POST } = await import('@/app/api/cotizaciones/route')
    const req = makeRequest('http://localhost/api/cotizaciones', {
      pedidoId: 'p1', precio: 5000, plazoDias: 15, proceso: 'Corte y confeccion',
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.error.code).toBe('TALLER_NO_VERIFICADO')
    expect(body.error.message).toContain('verificado')
    // No deberia haber creado cotizacion
    expect(mockPrisma.cotizacion.create).not.toHaveBeenCalled()
  })

  it('permite taller verificado pasar al flujo normal', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'TALLER' } })
    mockPrisma.taller.findUnique.mockResolvedValue({
      id: 't1', nombre: 'Taller OK', verificadoAfip: true,
    })
    mockPrisma.pedido.findUnique.mockResolvedValue({
      id: 'p1', estado: 'PUBLICADO', visibilidad: 'PUBLICO',
      marca: { userId: 'mu1', nombre: 'Marca X' },
      omId: 'OM-2026-001', tipoPrenda: 'Remera', cantidad: 100, marcaId: 'mi1',
    })
    mockPrisma.cotizacion.create.mockResolvedValue({
      id: 'c1', pedidoId: 'p1', tallerId: 't1', precio: 5000,
      plazoDias: 15, proceso: 'Corte', estado: 'ENVIADA',
    })

    const { POST } = await import('@/app/api/cotizaciones/route')
    const req = makeRequest('http://localhost/api/cotizaciones', {
      pedidoId: 'p1', precio: 5000, plazoDias: 15, proceso: 'Corte y confeccion',
    })

    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(mockPrisma.cotizacion.create).toHaveBeenCalled()
  })
})

// ─── GET /api/talleres — solo verificados ────────────────────────────────────

describe('GET /api/talleres — filtro verificadoAfip', () => {
  it('rechaza requests sin autenticacion', async () => {
    mockAuth.mockResolvedValue(null)

    const { GET } = await import('@/app/api/talleres/route')
    const req = makeRequest('http://localhost/api/talleres')

    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('pasa verificadoAfip: true en el where (MARCA)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'mu1', role: 'MARCA' } })
    mockPrisma.taller.findMany.mockResolvedValue([])
    mockPrisma.taller.count.mockResolvedValue(0)

    const { GET } = await import('@/app/api/talleres/route')
    const req = makeRequest('http://localhost/api/talleres?q=test')

    await GET(req)

    const callArgs = mockPrisma.taller.findMany.mock.calls[0][0]
    expect(callArgs.where.verificadoAfip).toBe(true)
  })

  it('ADMIN puede filtrar por nivel', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'au1', role: 'ADMIN' } })
    mockPrisma.taller.findMany.mockResolvedValue([])
    mockPrisma.taller.count.mockResolvedValue(0)

    const { GET } = await import('@/app/api/talleres/route')
    const req = makeRequest('http://localhost/api/talleres?nivel=ORO&q=Test')

    await GET(req)

    const callArgs = mockPrisma.taller.findMany.mock.calls[0][0]
    expect(callArgs.where.verificadoAfip).toBe(true)
    expect(callArgs.where.nivel).toBe('ORO')
    expect(callArgs.where.nombre).toEqual({ contains: 'Test', mode: 'insensitive' })
  })

  it('MARCA no puede filtrar por nivel', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'mu1', role: 'MARCA' } })
    mockPrisma.taller.findMany.mockResolvedValue([])
    mockPrisma.taller.count.mockResolvedValue(0)

    const { GET } = await import('@/app/api/talleres/route')
    const req = makeRequest('http://localhost/api/talleres?nivel=ORO')

    await GET(req)

    const callArgs = mockPrisma.taller.findMany.mock.calls[0][0]
    expect(callArgs.where.nivel).toBeUndefined()
  })
})

// ─── POST /api/pedidos/[id]/invitaciones — talleres verificados ──────────────

describe('POST /api/pedidos/[id]/invitaciones — verificadoAfip guard', () => {
  it('rechaza invitacion si algun taller no esta verificado', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'mu1', role: 'MARCA' } })
    mockPrisma.pedido.findUnique.mockResolvedValue({
      id: 'p1', estado: 'BORRADOR', marca: { userId: 'mu1', nombre: 'Marca' },
    })
    mockPrisma.taller.findMany.mockResolvedValue([
      { id: 't1', nombre: 'Taller A', verificadoAfip: true, user: { id: 'u1', email: 'a@test.com' } },
      { id: 't2', nombre: 'Taller B', verificadoAfip: false, user: { id: 'u2', email: 'b@test.com' } },
    ])

    const { POST } = await import('@/app/api/pedidos/[id]/invitaciones/route')
    const req = makeRequest('http://localhost/api/pedidos/p1/invitaciones', {
      tallerIds: ['t1', 't2'],
    })

    const res = await POST(req, { params: Promise.resolve({ id: 'p1' }) })
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('Taller B')
    expect(body.error).toContain('verificado')
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('permite invitacion si todos los talleres estan verificados', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'mu1', role: 'MARCA' } })
    mockPrisma.pedido.findUnique.mockResolvedValue({
      id: 'p1', estado: 'BORRADOR', marca: { userId: 'mu1', nombre: 'Marca' },
      tipoPrenda: 'Remera', cantidad: 100,
    })
    mockPrisma.taller.findMany.mockResolvedValue([
      { id: 't1', nombre: 'Taller A', verificadoAfip: true, user: { id: 'u1', email: 'a@test.com' } },
    ])
    mockPrisma.pedidoInvitacion.createMany.mockResolvedValue({ count: 1 })
    mockPrisma.$transaction.mockResolvedValue([{}, {}])
    mockPrisma.notificacion.create.mockReturnValue(Promise.resolve({}))

    const { POST } = await import('@/app/api/pedidos/[id]/invitaciones/route')
    const req = makeRequest('http://localhost/api/pedidos/p1/invitaciones', {
      tallerIds: ['t1'],
    })

    const res = await POST(req, { params: Promise.resolve({ id: 'p1' }) })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(mockPrisma.$transaction).toHaveBeenCalled()
  })
})
