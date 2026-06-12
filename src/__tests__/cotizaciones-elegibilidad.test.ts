import { describe, it, expect, vi, beforeEach } from 'vitest'

// Contrato de la fuente única de elegibilidad-para-cotizar, compartida por
// POST /api/cotizaciones y POST /api/upload/imagenes (contexto cotizacion, C5).

const mockPrisma = {
  pedido: { findUnique: vi.fn() },
  pedidoInvitacion: { findUnique: vi.fn() },
}
vi.mock('@/compartido/lib/prisma', () => ({ prisma: mockPrisma }))

beforeEach(() => vi.clearAllMocks())

const pedidoBase = {
  id: 'p1', estado: 'PUBLICADO', visibilidad: 'PUBLICO',
  marca: { userId: 'marca-user', nombre: 'M' },
  omId: 'OM1', tipoPrenda: 'Remera', cantidad: 10, marcaId: 'm1',
}

describe('elegibilidadCotizar', () => {
  it('pedido inexistente -> PEDIDO_NO_ENCONTRADO', async () => {
    mockPrisma.pedido.findUnique.mockResolvedValue(null)
    const { elegibilidadCotizar } = await import('@/compartido/lib/cotizaciones')
    const r = await elegibilidadCotizar('taller-user', 't1', 'p1')
    expect(r).toEqual({ ok: false, motivo: 'PEDIDO_NO_ENCONTRADO' })
  })

  it('pedido propio (auto-cotización) -> AUTO_COTIZACION', async () => {
    mockPrisma.pedido.findUnique.mockResolvedValue({ ...pedidoBase, marca: { userId: 'taller-user', nombre: 'M' } })
    const { elegibilidadCotizar } = await import('@/compartido/lib/cotizaciones')
    const r = await elegibilidadCotizar('taller-user', 't1', 'p1')
    expect(r).toEqual({ ok: false, motivo: 'AUTO_COTIZACION' })
  })

  it('pedido no PUBLICADO -> PEDIDO_NO_DISPONIBLE', async () => {
    mockPrisma.pedido.findUnique.mockResolvedValue({ ...pedidoBase, estado: 'BORRADOR' })
    const { elegibilidadCotizar } = await import('@/compartido/lib/cotizaciones')
    const r = await elegibilidadCotizar('taller-user', 't1', 'p1')
    expect(r).toEqual({ ok: false, motivo: 'PEDIDO_NO_DISPONIBLE' })
  })

  it('visibilidad INVITACION sin invitación -> NO_INVITADO', async () => {
    mockPrisma.pedido.findUnique.mockResolvedValue({ ...pedidoBase, visibilidad: 'INVITACION' })
    mockPrisma.pedidoInvitacion.findUnique.mockResolvedValue(null)
    const { elegibilidadCotizar } = await import('@/compartido/lib/cotizaciones')
    const r = await elegibilidadCotizar('taller-user', 't1', 'p1')
    expect(r).toEqual({ ok: false, motivo: 'NO_INVITADO' })
  })

  it('visibilidad INVITACION CON invitación -> ok', async () => {
    mockPrisma.pedido.findUnique.mockResolvedValue({ ...pedidoBase, visibilidad: 'INVITACION' })
    mockPrisma.pedidoInvitacion.findUnique.mockResolvedValue({ pedidoId: 'p1', tallerId: 't1' })
    const { elegibilidadCotizar } = await import('@/compartido/lib/cotizaciones')
    const r = await elegibilidadCotizar('taller-user', 't1', 'p1')
    expect(r.ok).toBe(true)
  })

  it('pedido PUBLICO ajeno y publicado -> ok + devuelve el pedido', async () => {
    mockPrisma.pedido.findUnique.mockResolvedValue(pedidoBase)
    const { elegibilidadCotizar } = await import('@/compartido/lib/cotizaciones')
    const r = await elegibilidadCotizar('taller-user', 't1', 'p1')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.pedido.omId).toBe('OM1')
    // No consulta invitaciones si la visibilidad no es INVITACION
    expect(mockPrisma.pedidoInvitacion.findUnique).not.toHaveBeenCalled()
  })
})
