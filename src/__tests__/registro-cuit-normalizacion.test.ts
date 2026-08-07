import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// PR-3 circuito CUIT — normalización de formato al GUARDAR. El zod del registro transforma el
// cuit a solo-dígitos antes de persistir: "20-30123456-7" queda "20301234567" en la DB, así el
// @unique de cuit significa unicidad real (dos formas del mismo CUIT no coexisten). ARCA corre
// en modo mock (valida cualquier CUIT de 11 dígitos), Prisma/bcrypt/email mockeados.

const { mockUserFindUnique, mockUserCreate, mockTallerFindUnique, mockHash } = vi.hoisted(() => ({
  mockUserFindUnique: vi.fn(),
  mockUserCreate: vi.fn(),
  mockTallerFindUnique: vi.fn(),
  mockHash: vi.fn().mockResolvedValue('hashed'),
}))

vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    user: { findUnique: mockUserFindUnique, create: mockUserCreate },
    taller: { findUnique: mockTallerFindUnique },
    // El guard de consultarPadron registra la consulta fallida (observabilidad).
    consultaArca: { create: vi.fn().mockResolvedValue({}) },
  },
}))
vi.mock('@/compartido/lib/log', () => ({ logActividad: vi.fn() }))
vi.mock('@/compartido/lib/ratelimit', () => ({
  rateLimit: vi.fn().mockResolvedValue(null),
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
}))
vi.mock('@/compartido/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ exito: true }),
  buildBienvenidaEmail: vi.fn().mockReturnValue({ subject: 's', html: 'h' }),
}))
vi.mock('bcryptjs', () => ({ default: { hash: mockHash } }))

import { POST } from '@/app/api/auth/registro/route'

function req(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/auth/registro', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.ARCA_PROVIDER = 'mock' // mock valida cualquier CUIT de 11 dígitos
  process.env.VERCEL_ENV = 'production' // gate de registro (spec v4-a) = no-op en prod
  mockUserFindUnique.mockResolvedValue(null)
  mockUserCreate.mockResolvedValue({ id: 'u1', email: 'x@x.com', name: null, role: 'TALLER' })
  mockTallerFindUnique.mockResolvedValue(null) // salta el createMany de validaciones
  mockHash.mockResolvedValue('hashed')
})

describe('POST /api/auth/registro — normalización de CUIT', () => {
  it('taller: cuit con guiones se guarda normalizado (solo dígitos)', async () => {
    const res = await POST(req({
      email: 'nuevo@test.com', password: 'password123', role: 'TALLER',
      tallerData: { nombre: 'Taller X', cuit: '20-30123456-7' },
    }), {})

    expect(res.status).toBe(201)
    expect(mockUserCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        taller: { create: expect.objectContaining({ cuit: '20301234567' }) },
      }),
    }))
  })

  it('marca: cuit con guiones se guarda normalizado', async () => {
    mockUserCreate.mockResolvedValue({ id: 'u2', email: 'm@x.com', name: null, role: 'MARCA' })
    const res = await POST(req({
      email: 'marca@test.com', password: 'password123', role: 'MARCA',
      marcaData: { nombre: 'Marca X', cuit: '27-32456789-1' },
    }), {})

    expect(res.status).toBe(201)
    expect(mockUserCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        marca: { create: expect.objectContaining({ cuit: '27324567891' }) },
      }),
    }))
  })

  it('cuit con espacios que no queda en 11 dígitos -> 400 (guard de consultarPadron bloquea)', async () => {
    const res = await POST(req({
      email: 'corto@test.com', password: 'password123', role: 'TALLER',
      tallerData: { nombre: 'Taller Y', cuit: '20 4' },
    }), {})

    // consultarPadron normaliza a "204" (3 dígitos) -> CUIT_INEXISTENTE -> errorBloqueaRegistro.
    expect(res.status).toBe(400)
    expect(mockUserCreate).not.toHaveBeenCalled()
  })
})
