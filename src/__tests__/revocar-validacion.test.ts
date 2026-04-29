import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

/**
 * Tests para PUT /api/validaciones/[id] — D-01 role changes.
 *
 * Post-D01: ESTADO aprueba/rechaza/revoca. ADMIN ya no puede.
 * Taller owner puede subir docs pero no cambiar estado.
 */

vi.mock('@/compartido/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    validacion: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    tipoDocumento: {
      findFirst: vi.fn(),
    },
    logActividad: {
      create: vi.fn().mockResolvedValue({ id: 'log-1' }),
    },
  },
}))

vi.mock('@/compartido/lib/nivel', () => ({
  aplicarNivel: vi.fn(),
}))

import { PUT } from '@/app/api/validaciones/[id]/route'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockFindUnique = prisma.validacion.findUnique as ReturnType<typeof vi.fn>
const mockUpdate = prisma.validacion.update as ReturnType<typeof vi.fn>

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/validaciones/val-1', {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockParams = Promise.resolve({ id: 'val-1' })

const validacionExistente = {
  id: 'val-1',
  tipo: 'CUIT/Monotributo',
  estado: 'PENDIENTE',
  tallerId: 'taller-1',
  taller: { userId: 'user-taller-1' },
}

beforeEach(() => {
  mockAuth.mockReset()
  mockFindUnique.mockReset()
  mockUpdate.mockReset()

  mockFindUnique.mockResolvedValue(validacionExistente)
  mockUpdate.mockResolvedValue({ id: 'val-1', tipo: 'CUIT/Monotributo', estado: 'COMPLETADO' })
})

describe('PUT /api/validaciones/[id] — permisos post-D01', () => {
  it('retorna 404 si la validacion no existe', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'estado-1', role: 'ESTADO' } })
    mockFindUnique.mockResolvedValue(null)
    const res = await PUT(makeRequest({ estado: 'COMPLETADO' }), { params: mockParams })
    expect(res.status).toBe(404)
  })

  it('ESTADO puede aprobar (cambiar estado a COMPLETADO)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'estado-1', role: 'ESTADO' } })
    const res = await PUT(makeRequest({ estado: 'COMPLETADO' }), { params: mockParams })
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          estado: 'COMPLETADO',
          aprobadoPor: 'estado-1',
        }),
      }),
    )
  })

  it('ESTADO puede rechazar con motivo', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'estado-1', role: 'ESTADO' } })
    const res = await PUT(
      makeRequest({ estado: 'RECHAZADO', detalle: 'Documento ilegible' }),
      { params: mockParams },
    )
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          estado: 'RECHAZADO',
          aprobadoPor: 'estado-1',
        }),
      }),
    )
  })

  it('ADMIN recibe 403 al intentar aprobar — FORBIDDEN', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
    const res = await PUT(makeRequest({ estado: 'COMPLETADO' }), { params: mockParams })
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error.code).toBe('FORBIDDEN')
    expect(body.error.message).toContain('ESTADO')
  })

  it('ADMIN recibe mensaje explicativo de que requiere rol ESTADO', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
    const res = await PUT(makeRequest({ estado: 'COMPLETADO' }), { params: mockParams })
    const body = await res.json()
    expect(body.error.message).toContain('rol ESTADO')
  })

  it('taller owner puede subir documento pero NO cambiar estado', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-taller-1', role: 'TALLER' } })
    const res = await PUT(
      makeRequest({ estado: 'COMPLETADO', documentoUrl: 'https://ejemplo.com/doc.pdf' }),
      { params: mockParams },
    )
    expect(res.status).toBe(200)
    const updateCall = mockUpdate.mock.calls[0][0]
    expect(updateCall.data.estado).toBeUndefined()
    expect(updateCall.data.documentoUrl).toBe('https://ejemplo.com/doc.pdf')
  })

  it('taller no-owner recibe 403', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'otro-taller', role: 'TALLER' } })
    const res = await PUT(makeRequest({ documentoUrl: 'https://x.com' }), { params: mockParams })
    expect(res.status).toBe(403)
  })

  it('sin sesion retorna 401', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await PUT(makeRequest({ estado: 'COMPLETADO' }), { params: mockParams })
    expect(res.status).toBe(401)
  })

  it('aprobacion por ESTADO registra aprobadoEn con fecha', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'estado-1', role: 'ESTADO' } })
    await PUT(makeRequest({ estado: 'COMPLETADO' }), { params: mockParams })
    const updateCall = mockUpdate.mock.calls[0][0]
    expect(updateCall.data.aprobadoEn).toBeInstanceOf(Date)
  })
})
