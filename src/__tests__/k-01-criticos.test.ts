import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── K-01 — Hotfix de los 3 criticos C1/C2/C3 ────────────────────────────────
// Fugas anonimas que cerramos:
//   C1  GET /api/marcas/[id]      — PII (email/telefono/CUIT) + pedidos sin auth
//   C2  GET /api/talleres/[id]    — PII del dueño sin auth
//   C3  GET /api/colecciones/[id] — answer-key (evaluacion.preguntas[].correcta)
// Estos tests son el embrion del patron K-02 (matriz 401/403/200 + no-leak).

const mockAuth = vi.fn()
vi.mock('@/compartido/lib/auth', () => ({ auth: () => mockAuth() }))

const mockPrisma = {
  marca: { findUnique: vi.fn() },
  taller: { findUnique: vi.fn() },
  coleccion: { findUnique: vi.fn() },
}
vi.mock('@/compartido/lib/prisma', () => ({ prisma: mockPrisma }))

function getReq(url: string) {
  return new NextRequest(new URL(url, 'http://localhost'), { method: 'GET' })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

// ─── C1 — GET /api/marcas/[id] ───────────────────────────────────────────────

describe('C1 — GET /api/marcas/[id]: cierra fuga de PII anonima', () => {
  const marca = {
    id: 'm1', userId: 'mu1', nombre: 'Marca X', cuit: '30700000001',
    user: { email: 'dueno@marca.com', name: 'Dueño', phone: '+5491100000000', avatar: null },
    pedidos: [],
  }

  it('anonimo → 401 y el body no filtra PII', async () => {
    mockAuth.mockResolvedValue(null)
    const { GET } = await import('@/app/api/marcas/[id]/route')
    const res = await GET(getReq('http://localhost/api/marcas/m1'), { params: Promise.resolve({ id: 'm1' }) })
    const body = await res.json()
    expect(res.status).toBe(401)
    expect(JSON.stringify(body)).not.toContain('30700000001')
    expect(JSON.stringify(body)).not.toContain('dueno@marca.com')
  })

  it('usuario logueado que NO es dueño ni supervision → 403, sin PII', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'otro', role: 'TALLER' } })
    mockPrisma.marca.findUnique.mockResolvedValue(marca)
    const { GET } = await import('@/app/api/marcas/[id]/route')
    const res = await GET(getReq('http://localhost/api/marcas/m1'), { params: Promise.resolve({ id: 'm1' }) })
    const body = await res.json()
    expect(res.status).toBe(403)
    expect(JSON.stringify(body)).not.toContain('30700000001')
    expect(JSON.stringify(body)).not.toContain('dueno@marca.com')
  })

  it('dueño de la marca → 200', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'mu1', role: 'MARCA' } })
    mockPrisma.marca.findUnique.mockResolvedValue(marca)
    const { GET } = await import('@/app/api/marcas/[id]/route')
    const res = await GET(getReq('http://localhost/api/marcas/m1'), { params: Promise.resolve({ id: 'm1' }) })
    expect(res.status).toBe(200)
  })

  it('ADMIN → 200 (supervision)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1', role: 'ADMIN' } })
    mockPrisma.marca.findUnique.mockResolvedValue(marca)
    const { GET } = await import('@/app/api/marcas/[id]/route')
    const res = await GET(getReq('http://localhost/api/marcas/m1'), { params: Promise.resolve({ id: 'm1' }) })
    expect(res.status).toBe(200)
  })
})

// ─── C2 — GET /api/talleres/[id] ─────────────────────────────────────────────

describe('C2 — GET /api/talleres/[id]: cierra fuga de PII anonima', () => {
  const taller = {
    id: 't1', userId: 'tu1', nombre: 'Taller X',
    user: { email: 'dueno@taller.com', phone: '+5491100000001', name: 'Titular' },
    procesos: [], prendas: [], maquinaria: [], certificaciones: [], validaciones: [],
  }

  it('anonimo → 401 y el body no filtra PII', async () => {
    mockAuth.mockResolvedValue(null)
    const { GET } = await import('@/app/api/talleres/[id]/route')
    const res = await GET(getReq('http://localhost/api/talleres/t1'), { params: Promise.resolve({ id: 't1' }) })
    const body = await res.json()
    expect(res.status).toBe(401)
    expect(JSON.stringify(body)).not.toContain('dueno@taller.com')
  })

  it('usuario logueado que NO es dueño ni supervision → 403, sin PII', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'otro', role: 'MARCA' } })
    mockPrisma.taller.findUnique.mockResolvedValue(taller)
    const { GET } = await import('@/app/api/talleres/[id]/route')
    const res = await GET(getReq('http://localhost/api/talleres/t1'), { params: Promise.resolve({ id: 't1' }) })
    const body = await res.json()
    expect(res.status).toBe(403)
    expect(JSON.stringify(body)).not.toContain('dueno@taller.com')
  })

  it('dueño del taller → 200', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'tu1', role: 'TALLER' } })
    mockPrisma.taller.findUnique.mockResolvedValue(taller)
    const { GET } = await import('@/app/api/talleres/[id]/route')
    const res = await GET(getReq('http://localhost/api/talleres/t1'), { params: Promise.resolve({ id: 't1' }) })
    expect(res.status).toBe(200)
  })

  it('ESTADO → 200 (supervision)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'estado1', role: 'ESTADO' } })
    mockPrisma.taller.findUnique.mockResolvedValue(taller)
    const { GET } = await import('@/app/api/talleres/[id]/route')
    const res = await GET(getReq('http://localhost/api/talleres/t1'), { params: Promise.resolve({ id: 't1' }) })
    expect(res.status).toBe(200)
  })
})

// ─── C3 — GET /api/colecciones/[id] ──────────────────────────────────────────

describe('C3 — GET /api/colecciones/[id]: cierra fuga del answer-key', () => {
  const coleccion = {
    id: 'c1', titulo: 'Curso', activa: true,
    videos: [{ id: 'v1', titulo: 'Video', orden: 1 }],
  }

  it('anonimo → 401', async () => {
    mockAuth.mockResolvedValue(null)
    const { GET } = await import('@/app/api/colecciones/[id]/route')
    const res = await GET(getReq('http://localhost/api/colecciones/c1'), { params: Promise.resolve({ id: 'c1' }) })
    expect(res.status).toBe(401)
  })

  it('TALLER (sin rol de contenido) → 403', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'tu1', role: 'TALLER' } })
    const { GET } = await import('@/app/api/colecciones/[id]/route')
    const res = await GET(getReq('http://localhost/api/colecciones/c1'), { params: Promise.resolve({ id: 'c1' }) })
    expect(res.status).toBe(403)
    // No debe haber consultado la coleccion: el gate corta antes.
    expect(mockPrisma.coleccion.findUnique).not.toHaveBeenCalled()
  })

  it('ADMIN → 200 y el response NO incluye evaluacion (answer-key)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1', role: 'ADMIN' } })
    mockPrisma.coleccion.findUnique.mockResolvedValue(coleccion)
    const { GET } = await import('@/app/api/colecciones/[id]/route')
    const res = await GET(getReq('http://localhost/api/colecciones/c1'), { params: Promise.resolve({ id: 'c1' }) })
    const body = await res.json()
    expect(res.status).toBe(200)
    // K-05: el query usa `select` explicito (antes `include`). Ninguno debe pedir
    // evaluacion (de ahi salia preguntas[].correcta).
    const queryArg = mockPrisma.coleccion.findUnique.mock.calls[0][0]
    expect(queryArg.include?.evaluacion).toBeUndefined()
    expect(queryArg.select?.evaluacion).toBeUndefined()
    // Y el body no contiene ni la relacion ni el campo correcta.
    expect(body.evaluacion).toBeUndefined()
    expect(JSON.stringify(body)).not.toContain('correcta')
  })

  it('CONTENIDO → 200', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'cont1', role: 'CONTENIDO' } })
    mockPrisma.coleccion.findUnique.mockResolvedValue(coleccion)
    const { GET } = await import('@/app/api/colecciones/[id]/route')
    const res = await GET(getReq('http://localhost/api/colecciones/c1'), { params: Promise.resolve({ id: 'c1' }) })
    expect(res.status).toBe(200)
  })
})
