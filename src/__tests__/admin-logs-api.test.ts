import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock auth
vi.mock('@/compartido/lib/auth', () => ({
  auth: vi.fn(),
}))

// Mock prisma
vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    logActividad: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    user: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}))

import { GET } from '@/app/api/admin/logs/route'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockFindMany = prisma.logActividad.findMany as ReturnType<typeof vi.fn>
const mockCount = prisma.logActividad.count as ReturnType<typeof vi.fn>
const mockUserFindMany = prisma.user.findMany as ReturnType<typeof vi.fn>

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/admin/logs')
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  return new NextRequest(url)
}

const sampleLogs = [
  {
    id: 'log-1',
    accion: 'VALIDACION_APROBADA',
    detalles: { entidad: 'validacion', entidadId: 'val-1', metadata: { tallerId: 't-1' } },
    timestamp: new Date('2026-04-20T10:00:00Z'),
    userId: 'admin-1',
    user: { email: 'admin@pdt.org.ar', name: 'Admin', role: 'ADMIN' },
  },
  {
    id: 'log-2',
    accion: 'CERTIFICADO_REVOCADO',
    detalles: { entidad: 'certificado', entidadId: 'cert-1', motivo: 'Vencido' },
    timestamp: new Date('2026-04-21T15:00:00Z'),
    userId: 'admin-1',
    user: { email: 'admin@pdt.org.ar', name: 'Admin', role: 'ADMIN' },
  },
]

const sampleUsers = [
  { id: 'admin-1', name: 'Admin', email: 'admin@pdt.org.ar', role: 'ADMIN' },
]

beforeEach(() => {
  mockAuth.mockReset()
  mockFindMany.mockReset()
  mockCount.mockReset()
  mockUserFindMany.mockReset()

  // Default: admin autenticado
  mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
  mockFindMany.mockResolvedValue(sampleLogs)
  mockCount.mockResolvedValue(2)
  mockUserFindMany.mockResolvedValue(sampleUsers)
})

describe('GET /api/admin/logs', () => {
  it('retorna 401 si no hay sesion', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('retorna 401 si el rol no es ADMIN', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'TALLER' } })
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('retorna logs paginados con metadata', async () => {
    const res = await GET(makeRequest())
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.logs).toHaveLength(2)
    expect(data.total).toBe(2)
    expect(data.page).toBe(1)
    expect(data.totalPages).toBe(1)
    expect(data.acciones).toBeDefined()
    expect(data.usuarios).toBeDefined()
  })

  it('aplica filtro por userId', async () => {
    await GET(makeRequest({ userId: 'admin-1' }))

    const whereArg = mockFindMany.mock.calls[0][0].where
    expect(whereArg.userId).toBe('admin-1')
  })

  it('aplica filtro por accion exacta', async () => {
    await GET(makeRequest({ accion: 'VALIDACION_APROBADA' }))

    const whereArg = mockFindMany.mock.calls[0][0].where
    expect(whereArg.accion).toBe('VALIDACION_APROBADA')
  })

  it('aplica filtro por entidad via JSON path', async () => {
    await GET(makeRequest({ entidad: 'certificado' }))

    const whereArg = mockFindMany.mock.calls[0][0].where
    expect(whereArg.detalles).toEqual({ path: ['entidad'], equals: 'certificado' })
  })

  it('aplica filtro por rango de fechas', async () => {
    await GET(makeRequest({ desde: '2026-04-01', hasta: '2026-04-30' }))

    const whereArg = mockFindMany.mock.calls[0][0].where
    expect(whereArg.timestamp.gte).toEqual(new Date('2026-04-01'))
    expect(whereArg.timestamp.lte.getFullYear()).toBe(2026)
    expect(whereArg.timestamp.lte.getMonth()).toBe(3) // abril = 3 (0-indexed)
  })

  it('aplica paginacion correctamente', async () => {
    await GET(makeRequest({ page: '3', limit: '10' }))

    const findArgs = mockFindMany.mock.calls[0][0]
    expect(findArgs.skip).toBe(20) // (3-1) * 10
    expect(findArgs.take).toBe(10)
  })

  it('retorna CSV cuando export=csv', async () => {
    const res = await GET(makeRequest({ export: 'csv' }))

    expect(res.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    expect(res.headers.get('Content-Disposition')).toContain('logs_')
    expect(res.headers.get('Content-Disposition')).toContain('.csv')

    const body = await res.text()
    // Primer linea son headers
    const firstLine = body.split('\n')[0]
    expect(firstLine).toContain('fecha')
    expect(firstLine).toContain('usuario_email')
    expect(firstLine).toContain('accion')
    expect(firstLine).toContain('entidad')
    expect(firstLine).toContain('motivo')
  })

  it('CSV ignora paginacion y trae hasta 10000', async () => {
    await GET(makeRequest({ export: 'csv', page: '5' }))

    const findArgs = mockFindMany.mock.calls[0][0]
    expect(findArgs.skip).toBeUndefined()
    expect(findArgs.take).toBe(10000)
  })

  it('CSV aplica filtros', async () => {
    await GET(makeRequest({ export: 'csv', accion: 'CERTIFICADO_REVOCADO', desde: '2026-04-01' }))

    const findArgs = mockFindMany.mock.calls[0][0]
    expect(findArgs.where.accion).toBe('CERTIFICADO_REVOCADO')
    expect(findArgs.where.timestamp.gte).toEqual(new Date('2026-04-01'))
  })
})

// TODO: implementar test de rate limit para export CSV cuando S-02 (rate limiting) esté mergeado
// El spec S-04 sección 8 test #7 dice: "6 exports rápidos, último da 429"

// TODO: implementar test de borrar denuncia genera log cuando exista endpoint DELETE /api/denuncias/[id]
// El spec S-04 sección 8 test #10 dice: "Borrar denuncia desde admin, verificar log"
