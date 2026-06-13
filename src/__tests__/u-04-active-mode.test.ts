import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// U-04: endpoint PATCH /api/usuarios/me/active-mode.
// Doble validación: el modo solicitado DEBE estar en User.roles[] LEÍDO DE LA DB.
// Cambiar de modo no otorga permisos nuevos; el endpoint nunca confía en la sesión.

vi.mock('@/compartido/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
  },
}))

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { PATCH } from '@/app/api/usuarios/me/active-mode/route'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockUserFind = prisma.user.findUnique as ReturnType<typeof vi.fn>
const mockUserUpdate = prisma.user.update as ReturnType<typeof vi.fn>

function sesion(id = 'u1') {
  return { user: { id, role: 'TALLER', roles: ['TALLER'], activeMode: 'TALLER' } }
}
const req = (body?: unknown) =>
  new NextRequest('http://localhost/api/usuarios/me/active-mode', {
    method: 'PATCH',
    body: body === undefined ? undefined : JSON.stringify(body),
  }) as NextRequest

beforeEach(() => vi.clearAllMocks())

describe('PATCH /api/usuarios/me/active-mode', () => {
  it('cambia el modo si está en roles[] de la DB (200)', async () => {
    mockAuth.mockResolvedValue(sesion())
    mockUserFind.mockResolvedValue({ roles: ['TALLER', 'MARCA'], role: 'TALLER' })
    mockUserUpdate.mockResolvedValue({})
    const res = await PATCH(req({ modo: 'MARCA' }), {} as never)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ activeMode: 'MARCA' })
    // Persiste manteniendo la invariante role == activeMode
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { activeMode: 'MARCA', role: 'MARCA' },
    })
  })

  it('rechaza con 403 un modo que NO está en roles[] de la DB', async () => {
    mockAuth.mockResolvedValue(sesion())
    mockUserFind.mockResolvedValue({ roles: ['TALLER'], role: 'TALLER' })
    const res = await PATCH(req({ modo: 'MARCA' }), {} as never)
    expect(res.status).toBe(403)
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('single-role con roles[] vacío: fallback a [role], rechaza otro modo (403)', async () => {
    mockAuth.mockResolvedValue(sesion())
    mockUserFind.mockResolvedValue({ roles: [], role: 'TALLER' })
    const res = await PATCH(req({ modo: 'ESTADO' }), {} as never)
    expect(res.status).toBe(403)
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('sin sesión → 401', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await PATCH(req({ modo: 'MARCA' }), {} as never)
    expect(res.status).toBe(401)
    expect(mockUserFind).not.toHaveBeenCalled()
  })

  it('modo inválido o ausente → 400', async () => {
    mockAuth.mockResolvedValue(sesion())
    const res = await PATCH(req({ modo: 'PIRATA' }), {} as never)
    expect(res.status).toBe(400)
    const res2 = await PATCH(req({}), {} as never)
    expect(res2.status).toBe(400)
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })
})
