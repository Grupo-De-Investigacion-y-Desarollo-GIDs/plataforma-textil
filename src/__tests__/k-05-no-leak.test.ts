import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── K-05 — select explicito: guard de no-leak ───────────────────────────────
//
// Verifica que cada endpoint acotado pide a Prisma EXACTAMENTE los campos que su
// caller consume — y, en particular, que NO pide los campos PII/sensibles que se
// sacaron. El `select` es lo que materialmente impide la fuga, asi que la asercion
// es sobre el argumento `select` pasado a Prisma (si volviera a `include` o sumara
// un campo sensible, el test falla).
//
// Ref: .claude/specs/v4-k-01-auditoria-endpoints.md §4.1

const mockAuth = vi.fn()
vi.mock('@/compartido/lib/auth', () => ({ auth: () => mockAuth() }))

const mockPrisma = {
  marca: { findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0) },
  taller: { findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0) },
  certificado: { findFirst: vi.fn().mockResolvedValue(null) },
}
vi.mock('@/compartido/lib/prisma', () => ({ prisma: mockPrisma }))

function getReq(url: string) {
  return new NextRequest(new URL(url, 'http://localhost'), { method: 'GET' })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('K-05 — GET /api/marcas (list): no filtra PII de mas', () => {
  it('el select de user excluye phone y name; incluye solo email + active', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
    const { GET } = await import('@/app/api/marcas/route')
    await GET(getReq('http://localhost/api/marcas?limit=10'))

    const select = mockPrisma.marca.findMany.mock.calls[0][0].select
    expect(select).toBeDefined()
    // campos que el listado admin usa
    expect(select).toMatchObject({ id: true, nombre: true, cuit: true, createdAt: true })
    expect(select.user.select).toEqual({ email: true, active: true })
    // PII que NO debe pedirse
    expect(select.user.select.phone).toBeUndefined()
    expect(select.user.select.name).toBeUndefined()
    // y la marca completa no sale (sin ubicacion/website/volumenMensual)
    expect(select.ubicacion).toBeUndefined()
    expect(select.website).toBeUndefined()
    expect(select.volumenMensual).toBeUndefined()
  })
})

describe('K-05 — GET /api/talleres (list): select por rama', () => {
  it('rama MARCA: solo {id, nombre, ubicacion, capacidadMensual}; sin user ni procesos/prendas', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'marca-1', role: 'MARCA' } })
    const { GET } = await import('@/app/api/talleres/route')
    await GET(getReq('http://localhost/api/talleres?q=ab&limit=10'))

    const select = mockPrisma.taller.findMany.mock.calls[0][0].select
    expect(select).toEqual({ id: true, nombre: true, ubicacion: true, capacidadMensual: true })
    // una MARCA no recibe PII del dueño ni el grafo de procesos/prendas
    expect(select.user).toBeUndefined()
    expect(select.procesos).toBeUndefined()
    expect(select.prendas).toBeUndefined()
  })

  it('rama ADMIN: suma cuit/nivel/createdAt + user.{email,active}; sin user.phone', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
    const { GET } = await import('@/app/api/talleres/route')
    await GET(getReq('http://localhost/api/talleres?limit=10'))

    const select = mockPrisma.taller.findMany.mock.calls[0][0].select
    expect(select).toMatchObject({ id: true, nombre: true, cuit: true, nivel: true, createdAt: true })
    expect(select.user.select).toEqual({ email: true, active: true })
    expect(select.user.select.phone).toBeUndefined()
  })
})

describe('C4 — GET /api/exportar: whitelist de tipo', () => {
  it('tipo desconocido → 400 (antes caia a CSV vacio 200)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
    const { GET } = await import('@/app/api/exportar/route')
    const res = await GET(getReq('http://localhost/api/exportar?tipo=xyz'))
    expect(res.status).toBe(400)
  })
})

describe('K-05 — GET /api/certificados/[id] (publico): no expone pdfUrl/qrCode', () => {
  it('el select trae solo lo que la pagina de verificacion renderiza', async () => {
    const { GET } = await import('@/app/api/certificados/[id]/route')
    await GET(getReq('http://localhost/api/certificados/COD-1'), { params: Promise.resolve({ id: 'COD-1' }) })

    const select = mockPrisma.certificado.findFirst.mock.calls[0][0].select
    expect(select).toMatchObject({ codigo: true, fecha: true, calificacion: true, revocado: true })
    // sensibles que NO deben salir en un endpoint publico
    expect(select.pdfUrl).toBeUndefined()
    expect(select.qrCode).toBeUndefined()
  })
})
