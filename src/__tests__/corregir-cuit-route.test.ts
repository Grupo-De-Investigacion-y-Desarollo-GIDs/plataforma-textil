import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Endpoint POST /api/arca/corregir-cuit/[id]: auth DUAL (dueño o ESTADO/ADMIN), validación de
// CUIT y mapeo de los códigos del helper a HTTP status. El helper corregirYVerificarCuit va
// mockeado (su lógica se testea en corregir-cuit-helper.test.ts).

const { mockAuth, mockFindUnique, mockCYV } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockFindUnique: vi.fn(),
  mockCYV: vi.fn(),
}))

vi.mock('@/compartido/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/compartido/lib/prisma', () => ({
  prisma: { taller: { findUnique: mockFindUnique } },
}))
vi.mock('@/compartido/lib/arca', () => ({
  corregirYVerificarCuit: mockCYV,
  mensajeErrorArca: (c: string) => `msg:${c}`,
}))

import { POST } from '@/app/api/arca/corregir-cuit/[id]/route'

const ctx = (id: string) => ({ params: Promise.resolve({ id }) })
function req(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/arca/corregir-cuit/t1', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFindUnique.mockResolvedValue({ userId: 'owner-1' })
  mockCYV.mockResolvedValue({ exitosa: true, duracionMs: 10 })
})

describe('POST /api/arca/corregir-cuit/[id] — auth dual', () => {
  it('401 sin sesión', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await POST(req({ cuit: '20111111112' }), ctx('t1'))
    expect(res.status).toBe(401)
    expect(mockCYV).not.toHaveBeenCalled()
  })

  it('404 si el taller no existe', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', activeMode: 'TALLER' } })
    mockFindUnique.mockResolvedValue(null)
    const res = await POST(req({ cuit: '20111111112' }), ctx('t1'))
    expect(res.status).toBe(404)
  })

  it('403 si no es dueño ni ESTADO/ADMIN', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'ajeno', activeMode: 'TALLER' } })
    mockFindUnique.mockResolvedValue({ userId: 'owner-1' })
    const res = await POST(req({ cuit: '20111111112' }), ctx('t1'))
    expect(res.status).toBe(403)
    expect(mockCYV).not.toHaveBeenCalled()
  })

  it('dueño del taller -> autorizado, 200 exitosa', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'owner-1', activeMode: 'TALLER' } })
    const res = await POST(req({ cuit: '20-11111111-2' }), ctx('t1'))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.exitosa).toBe(true)
    // El cuit llega normalizado (sin guiones) al helper.
    expect(mockCYV).toHaveBeenCalledWith('t1', '20111111112', 'owner-1')
  })

  it('ESTADO sobre taller ajeno -> autorizado (override de COORD)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'coord-1', activeMode: 'ESTADO' } })
    mockFindUnique.mockResolvedValue({ userId: 'owner-1' })
    const res = await POST(req({ cuit: '20111111112' }), ctx('t1'))
    expect(res.status).toBe(200)
    expect(mockCYV).toHaveBeenCalled()
  })
})

describe('POST /api/arca/corregir-cuit/[id] — validación y mapeo de códigos', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { id: 'owner-1', activeMode: 'TALLER' } })
  })

  it('400 si el CUIT no tiene 11 dígitos', async () => {
    const res = await POST(req({ cuit: '123' }), ctx('t1'))
    expect(res.status).toBe(400)
    expect(mockCYV).not.toHaveBeenCalled()
  })

  it('409 YA_VERIFICADO (gating)', async () => {
    mockCYV.mockResolvedValue({ exitosa: false, error: 'YA_VERIFICADO', duracionMs: 0 })
    const res = await POST(req({ cuit: '20111111112' }), ctx('t1'))
    const data = await res.json()
    expect(res.status).toBe(409)
    expect(data.codigo).toBe('YA_VERIFICADO')
  })

  it('409 CUIT_EN_USO (colisión) sin filtrar datos del otro taller', async () => {
    mockCYV.mockResolvedValue({ exitosa: false, error: 'CUIT_EN_USO', duracionMs: 0 })
    const res = await POST(req({ cuit: '20111111112' }), ctx('t1'))
    const data = await res.json()
    expect(res.status).toBe(409)
    expect(data.codigo).toBe('CUIT_EN_USO')
    expect(data.mensaje).not.toMatch(/owner|taller-|id/i)
  })

  it('200 exitosa:false con mensaje ARCA cuando el CUIT no valida', async () => {
    mockCYV.mockResolvedValue({ exitosa: false, error: 'CUIT_INEXISTENTE', duracionMs: 30 })
    const res = await POST(req({ cuit: '20111111112' }), ctx('t1'))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.exitosa).toBe(false)
    expect(data.mensaje).toBe('msg:CUIT_INEXISTENTE')
  })
})
