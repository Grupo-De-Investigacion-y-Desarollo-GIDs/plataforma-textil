import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── Post-deploy — GET /api/talleres: filtro verificadoAfip por rol ──────────
//
// Riesgo que marcó Sergio: "un error ahí expone talleres sin verificar a las
// marcas". Este test es el guard de NO-REGRESIÓN de esa visibilidad:
//   - MARCA (y público, que usa queries propias con el mismo filtro) → SOLO
//     verificados: el `where` DEBE incluir verificadoAfip:true.
//   - ADMIN / ESTADO (Coordinación) → TODOS, incluidos los EN_GRACIA sin
//     verificar: el `where` NO debe forzar verificadoAfip.
//
// Ref: fix/post-deploy-panel (filtro por rol en /api/talleres).

const mockAuth = vi.fn()
vi.mock('@/compartido/lib/auth', () => ({ auth: () => mockAuth() }))

const mockPrisma = {
  taller: { findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0) },
}
vi.mock('@/compartido/lib/prisma', () => ({ prisma: mockPrisma }))

function getReq(url: string) {
  return new NextRequest(new URL(url, 'http://localhost'), { method: 'GET' })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

async function whereDeRol(role: 'MARCA' | 'ADMIN' | 'ESTADO') {
  mockAuth.mockResolvedValue({ user: { id: `${role}-1`, role } })
  const { GET } = await import('@/app/api/talleres/route')
  await GET(getReq('http://localhost/api/talleres?limit=10'))
  return mockPrisma.taller.findMany.mock.calls[0][0].where as Record<string, unknown>
}

describe('GET /api/talleres — filtro verificadoAfip por rol', () => {
  it('MARCA → where.verificadoAfip === true (no ve talleres sin verificar)', async () => {
    const where = await whereDeRol('MARCA')
    expect(where.verificadoAfip).toBe(true)
  })

  it('ADMIN → where NO fuerza verificadoAfip (ve todos, incl. EN_GRACIA)', async () => {
    const where = await whereDeRol('ADMIN')
    expect(where.verificadoAfip).toBeUndefined()
  })

  it('ESTADO (Coordinación) → where NO fuerza verificadoAfip (ve todos)', async () => {
    const where = await whereDeRol('ESTADO')
    expect(where.verificadoAfip).toBeUndefined()
  })

  it('el count usa el MISMO where que el findMany (paginación coherente)', async () => {
    await whereDeRol('MARCA')
    const whereFind = mockPrisma.taller.findMany.mock.calls[0][0].where
    const whereCount = mockPrisma.taller.count.mock.calls[0][0].where
    expect(whereCount).toEqual(whereFind)
  })
})
