import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    logActividad: {
      create: vi.fn().mockResolvedValue({ id: 'log-1' }),
    },
  },
}))

vi.mock('@/compartido/lib/auth', () => ({
  auth: vi.fn(),
}))

import { POST } from '@/app/api/log-error/route'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockCreate = prisma.logActividad.create as ReturnType<typeof vi.fn>

beforeEach(() => {
  mockAuth.mockClear()
  mockCreate.mockClear()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0]
}

describe('POST /api/log-error', () => {
  it('retorna ok:true y logea el error', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const res = await POST(makeRequest({
      contexto: 'admin',
      mensaje: 'Query failed',
      ruta: '/admin/talleres',
      digest: 'abc123',
    }))

    const json = await res.json()
    expect(json).toEqual({ ok: true })
    expect(res.status).toBe(200)
  })

  it('incluye userId de la sesion cuando el usuario esta autenticado', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-session' } })

    await POST(makeRequest({
      contexto: 'taller',
      mensaje: 'Error inesperado',
      ruta: '/taller',
    }))

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-session',
        }),
      })
    )
  })

  it('funciona sin sesion (usuario no autenticado)', async () => {
    mockAuth.mockResolvedValue(null)

    const res = await POST(makeRequest({
      contexto: 'publico',
      mensaje: 'Page error',
      ruta: '/',
    }))

    const json = await res.json()
    expect(json).toEqual({ ok: true })
  })

  it('usa defaults cuando faltan campos', async () => {
    mockAuth.mockResolvedValue(null)

    const res = await POST(makeRequest({}))

    const json = await res.json()
    expect(json).toEqual({ ok: true })
  })

  it('retorna 500 si el request es invalido', async () => {
    mockAuth.mockResolvedValue(null)

    const badReq = new Request('http://localhost/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    }) as unknown as Parameters<typeof POST>[0]

    const res = await POST(badReq)
    expect(res.status).toBe(500)

    const json = await res.json()
    expect(json).toEqual({ ok: false })
  })
})
