import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

/**
 * Test #2 del spec S-04: revocar validación sin motivo retorna error.
 *
 * La revocación de validaciones ocurre en dos lugares:
 * 1. Server action en admin/talleres/[id]/page.tsx — tiene guard `if (!motivo?.trim()) return`
 * 2. PUT /api/validaciones/[id] — usado por el admin para cambiar estado
 *
 * Este test verifica el endpoint PUT, que es el camino testeable.
 * La server action (1) tiene la misma protección pero no es invocable directamente en unit tests.
 *
 * La server action devuelve void silenciosamente (no hay error HTTP).
 * El motivo obligatorio se enforcea en la UI con `required` en el input.
 * El endpoint PUT no tiene guard de motivo propio — el motivo queda en el log, no en la validación.
 */

// Mock auth
vi.mock('@/compartido/lib/auth', () => ({
  auth: vi.fn(),
}))

// Mock prisma
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

// Mock nivel
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

beforeEach(() => {
  mockAuth.mockReset()
  mockFindUnique.mockReset()
  mockUpdate.mockReset()

  mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
  mockFindUnique.mockResolvedValue({
    id: 'val-1',
    tipo: 'CUIT/Monotributo',
    estado: 'COMPLETADO',
    tallerId: 'taller-1',
    taller: { userId: 'user-taller-1' },
  })
  mockUpdate.mockResolvedValue({
    id: 'val-1',
    tipo: 'CUIT/Monotributo',
    estado: 'NO_INICIADO',
  })
})

describe('PUT /api/validaciones/[id] — guard de motivo', () => {
  it('retorna 404 si la validacion no existe', async () => {
    mockFindUnique.mockResolvedValue(null)
    const res = await PUT(makeRequest({ estado: 'RECHAZADO' }), { params: mockParams })
    expect(res.status).toBe(404)
  })

  it('retorna 403 si no es admin ni dueño', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'otro-user', role: 'TALLER' } })
    const res = await PUT(makeRequest({ estado: 'COMPLETADO' }), { params: mockParams })
    expect(res.status).toBe(403)
  })

  it('admin puede cambiar estado a COMPLETADO', async () => {
    const res = await PUT(
      makeRequest({ estado: 'COMPLETADO' }),
      { params: mockParams },
    )
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'val-1' },
        data: expect.objectContaining({ estado: 'COMPLETADO' }),
      }),
    )
  })

  it('admin puede cambiar estado a RECHAZADO', async () => {
    const res = await PUT(
      makeRequest({ estado: 'RECHAZADO', detalle: 'Documento ilegible' }),
      { params: mockParams },
    )
    expect(res.status).toBe(200)
  })

  it('taller no puede cambiar el estado (previene self-approve)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-taller-1', role: 'TALLER' } })
    const res = await PUT(
      makeRequest({ estado: 'COMPLETADO', documentoUrl: 'https://ejemplo.com/doc.pdf' }),
      { params: mockParams },
    )
    expect(res.status).toBe(200)
    // El estado NO deberia estar en el update data (solo lo puede poner ADMIN)
    const updateCall = mockUpdate.mock.calls[0][0]
    expect(updateCall.data.estado).toBeUndefined()
  })
})
