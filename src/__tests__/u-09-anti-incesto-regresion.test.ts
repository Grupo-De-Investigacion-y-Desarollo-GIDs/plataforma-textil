import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// U-09 (regresión U-07): U-09 hace ALCANZABLE el caso de un user que es taller Y
// marca a la vez. El guard anti-incesto en /pedidos/[id]/invitaciones (sin tocar)
// debe seguir bloqueando que se invite a su propio taller a cotizar su propio pedido.

vi.mock('@/compartido/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    pedido: { findUnique: vi.fn() },
    taller: { findMany: vi.fn() },
  },
}))
vi.mock('@/compartido/lib/email', () => ({
  sendEmail: vi.fn(),
  buildInvitacionCotizarEmail: vi.fn().mockReturnValue({ subject: 'S', html: 'H' }),
}))

import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { POST } from '@/app/api/pedidos/[id]/invitaciones/route'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockPedidoFind = prisma.pedido.findUnique as ReturnType<typeof vi.fn>
const mockTallerFind = prisma.taller.findMany as ReturnType<typeof vi.fn>

const ctx = (id = 'p1') => ({ params: Promise.resolve({ id }) })
const req = (tallerIds: string[]) =>
  new NextRequest('http://localhost/api/pedidos/p1/invitaciones', {
    method: 'POST',
    body: JSON.stringify({ tallerIds }),
  }) as NextRequest

beforeEach(() => vi.clearAllMocks())

describe('anti-incesto sigue bloqueando al user multi-rol (taller propio)', () => {
  it('invitar al taller propio a cotizar el propio pedido → 400', async () => {
    // Mismo user dueño de la marca del pedido y del taller invitado.
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'MARCA', activeMode: 'MARCA' } })
    mockPedidoFind.mockResolvedValue({ estado: 'BORRADOR', marca: { userId: 'u1', nombre: 'Mi Marca' } })
    mockTallerFind.mockResolvedValue([
      { id: 't1', nombre: 'Mi Taller', verificadoAfip: true, user: { id: 'u1', email: 'u1@x.com' } },
    ])

    const res = await POST(req(['t1']), ctx())
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/no podés invitarte a vos mismo/i)
  })
})
