import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/compartido/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    tipoDocumento: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 'td-1', nombre: 'Test' }),
      update: vi.fn().mockResolvedValue({ id: 'td-1', nombre: 'Test' }),
    },
  },
}))

import { GET, POST, PUT } from '@/app/api/tipos-documento/route'
import { auth } from '@/compartido/lib/auth'

const mockAuth = auth as ReturnType<typeof vi.fn>

function makeReq(method: string, body?: Record<string, unknown>) {
  const init: RequestInit = { method }
  if (body) {
    init.body = JSON.stringify(body)
    init.headers = { 'Content-Type': 'application/json' }
  }
  return new NextRequest('http://localhost/api/tipos-documento', init)
}

beforeEach(() => mockAuth.mockReset())

describe('GET /api/tipos-documento — acceso ambos roles', () => {
  it('ESTADO puede listar tipos', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'e-1', role: 'ESTADO' } })
    const res = await GET()
    expect(res.status).toBe(200)
  })

  it('ADMIN puede listar tipos', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a-1', role: 'ADMIN' } })
    const res = await GET()
    expect(res.status).toBe(200)
  })

  it('TALLER puede listar tipos (cualquier autenticado)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 't-1', role: 'TALLER' } })
    const res = await GET()
    expect(res.status).toBe(200)
  })
})

describe('POST /api/tipos-documento — solo ESTADO', () => {
  const validBody = { nombre: 'Nuevo Doc', label: 'Nuevo Doc', nivelMinimo: 'BRONCE' }

  it('ESTADO puede crear tipo de documento', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'e-1', role: 'ESTADO' } })
    const res = await POST(makeReq('POST', validBody))
    expect(res.status).toBe(201)
  })

  it('ADMIN recibe 403 con INSUFFICIENT_ROLE al crear', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a-1', role: 'ADMIN' } })
    const res = await POST(makeReq('POST', validBody))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('INSUFFICIENT_ROLE')
    expect(body.rolesRequeridos).toEqual(['ESTADO'])
  })

  it('TALLER recibe 403 al crear', async () => {
    mockAuth.mockResolvedValue({ user: { id: 't-1', role: 'TALLER' } })
    const res = await POST(makeReq('POST', validBody))
    expect(res.status).toBe(403)
  })

  it('sin sesion retorna 401', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await POST(makeReq('POST', validBody))
    expect(res.status).toBe(401)
  })
})

describe('PUT /api/tipos-documento — solo ESTADO', () => {
  const validBody = { id: 'td-1', nombre: 'Actualizado' }

  it('ESTADO puede editar tipo de documento', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'e-1', role: 'ESTADO' } })
    const res = await PUT(makeReq('PUT', validBody))
    expect(res.status).toBe(200)
  })

  it('ADMIN recibe 403 con INSUFFICIENT_ROLE al editar', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a-1', role: 'ADMIN' } })
    const res = await PUT(makeReq('PUT', validBody))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('INSUFFICIENT_ROLE')
    expect(body.rolesRequeridos).toEqual(['ESTADO'])
  })
})
