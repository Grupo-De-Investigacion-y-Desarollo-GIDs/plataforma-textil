import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/compartido/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    reglaNivel: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    logActividad: { create: vi.fn().mockResolvedValue({ id: 'log-1' }) },
  },
}))
vi.mock('@/compartido/lib/nivel', () => ({ invalidarCacheNivel: vi.fn() }))

import { GET } from '@/app/api/estado/configuracion-niveles/route'
import { PUT } from '@/app/api/estado/configuracion-niveles/[id]/route'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockFindMany = prisma.reglaNivel.findMany as ReturnType<typeof vi.fn>
const mockFindUnique = prisma.reglaNivel.findUnique as ReturnType<typeof vi.fn>
const mockUpdate = prisma.reglaNivel.update as ReturnType<typeof vi.fn>

beforeEach(() => vi.clearAllMocks())

describe('GET /api/estado/configuracion-niveles', () => {
  it('ESTADO puede listar reglas', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'e-1', role: 'ESTADO' } })
    mockFindMany.mockResolvedValue([{ nivel: 'BRONCE' }, { nivel: 'PLATA' }])
    const res = await GET()
    expect(res.status).toBe(200)
  })

  it('ADMIN puede listar reglas (lectura)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a-1', role: 'ADMIN' } })
    mockFindMany.mockResolvedValue([])
    const res = await GET()
    expect(res.status).toBe(200)
  })

  it('TALLER recibe 403', async () => {
    mockAuth.mockResolvedValue({ user: { id: 't-1', role: 'TALLER' } })
    const res = await GET()
    expect(res.status).toBe(403)
  })
})

describe('PUT /api/estado/configuracion-niveles/[id]', () => {
  const mockParams = Promise.resolve({ id: 'r-plata' })

  it('ESTADO puede editar regla', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'e-1', role: 'ESTADO' } })
    mockFindUnique.mockResolvedValue({ id: 'r-plata', nivel: 'PLATA', puntosMinimos: 50 })
    mockUpdate.mockResolvedValue({ id: 'r-plata', puntosMinimos: 60 })
    const req = new NextRequest('http://localhost/api/estado/configuracion-niveles/r-plata', {
      method: 'PUT',
      body: JSON.stringify({ puntosMinimos: 60 }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PUT(req, { params: mockParams })
    expect(res.status).toBe(200)
  })

  it('ADMIN recibe 403 al editar', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'a-1', role: 'ADMIN' } })
    const req = new NextRequest('http://localhost/api/estado/configuracion-niveles/r-plata', {
      method: 'PUT',
      body: JSON.stringify({ puntosMinimos: 60 }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PUT(req, { params: mockParams })
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('INSUFFICIENT_ROLE')
  })

  it('puntosMinimos negativos retorna 400', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'e-1', role: 'ESTADO' } })
    mockFindUnique.mockResolvedValue({ id: 'r-plata', nivel: 'PLATA', puntosMinimos: 50 })
    const req = new NextRequest('http://localhost/api/estado/configuracion-niveles/r-plata', {
      method: 'PUT',
      body: JSON.stringify({ puntosMinimos: -10 }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PUT(req, { params: mockParams })
    expect(res.status).toBe(400)
  })

  it('regla inexistente retorna 404', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'e-1', role: 'ESTADO' } })
    mockFindUnique.mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/estado/configuracion-niveles/xxx', {
      method: 'PUT',
      body: JSON.stringify({ puntosMinimos: 60 }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'xxx' }) })
    expect(res.status).toBe(404)
  })
})
