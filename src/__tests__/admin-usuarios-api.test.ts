import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock auth (requiereRolApi pasa por auth())
vi.mock('@/compartido/lib/auth', () => ({
  auth: vi.fn(),
}))

// Mock prisma
vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}))

import { GET } from '@/app/api/admin/usuarios/route'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockFindMany = prisma.user.findMany as ReturnType<typeof vi.fn>
const mockCount = prisma.user.count as ReturnType<typeof vi.fn>
const mockGroupBy = prisma.user.groupBy as ReturnType<typeof vi.fn>

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/admin/usuarios')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return new NextRequest(url)
}

// Página de 10 filas (lo que cabía con el límite viejo) sobre una base de 23 usuarios.
const paginaDe10 = Array.from({ length: 10 }, (_, i) => ({
  id: `u-${i}`, email: `u${i}@pdt.org.ar`, name: `User ${i}`, role: i < 6 ? 'TALLER' : 'MARCA',
  active: true, createdAt: new Date('2026-08-01T10:00:00Z'), phone: null,
}))

beforeEach(() => {
  mockAuth.mockReset(); mockFindMany.mockReset(); mockCount.mockReset(); mockGroupBy.mockReset()
  mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
  mockFindMany.mockResolvedValue(paginaDe10)
  mockCount.mockResolvedValue(23)
  mockGroupBy.mockResolvedValue([
    { role: 'TALLER', _count: { _all: 13 } },
    { role: 'MARCA', _count: { _all: 9 } },
    { role: 'ADMIN', _count: { _all: 1 } },
  ])
})

describe('GET /api/admin/usuarios', () => {
  it('retorna 403 si el rol no es ADMIN', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'TALLER' } })
    const res = await GET(makeRequest())
    expect(res.status).toBe(403)
  })

  it('usa un límite real por defecto (100, no 10)', async () => {
    await GET(makeRequest())
    expect(mockFindMany.mock.calls[0][0].take).toBe(100)
  })

  it('con >10 usuarios, el total es el real (COUNT), no el largo de la página', async () => {
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(res.status).toBe(200)
    // La página trae 10 filas, pero el total refleja la base completa.
    expect(data.usuarios).toHaveLength(10)
    expect(data.total).toBe(23)
    expect(data.total).not.toBe(data.usuarios.length)
  })

  it('los contadores por rol salen del groupBy (base), no de la página', async () => {
    const res = await GET(makeRequest())
    const data = await res.json()
    // La página tiene 6 TALLER / 4 MARCA; los contadores deben ser 13 / 9 (groupBy).
    expect(data.totalTalleres).toBe(13)
    expect(data.totalMarcas).toBe(9)
    // groupBy corre sobre la misma base (where) que el count.
    expect(mockGroupBy.mock.calls[0][0].by).toEqual(['role'])
  })

  it('roles ausentes en groupBy cuentan 0', async () => {
    mockGroupBy.mockResolvedValue([{ role: 'ADMIN', _count: { _all: 1 } }])
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(data.totalTalleres).toBe(0)
    expect(data.totalMarcas).toBe(0)
  })
})
