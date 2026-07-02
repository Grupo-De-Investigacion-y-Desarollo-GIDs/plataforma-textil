import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Test de integración del cron de gracia (2.3-B1): auth por Bearer, acciones por estado
// e idempotencia. La DECISIÓN pura (planificarAccionGracia) se testea en gracia.test.ts;
// acá se verifica que la ROUTE ejecuta los writes + emails correctos.

const { mockFindMany, mockUpdate, mockSendEmail } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockUpdate: vi.fn(),
  mockSendEmail: vi.fn().mockResolvedValue({ exito: true }),
}))

vi.mock('@/compartido/lib/prisma', () => ({
  prisma: { taller: { findMany: mockFindMany, update: mockUpdate } },
}))
vi.mock('@/compartido/lib/log', () => ({ logActividad: vi.fn() }))
vi.mock('@/compartido/lib/email', async (importActual) => {
  const actual = await importActual<typeof import('@/compartido/lib/email')>()
  return { ...actual, sendEmail: mockSendEmail }
})

import { GET } from '@/app/api/cron/gracia-cuit/route'

const SECRET = 'test-cron-secret'
const diasAtras = (n: number) => new Date(Date.now() - n * 86_400_000)

function req(auth?: string): NextRequest {
  return new NextRequest('http://localhost/api/cron/gracia-cuit', {
    headers: auth ? { authorization: auth } : {},
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSendEmail.mockResolvedValue({ exito: true })
  mockUpdate.mockResolvedValue({})
  process.env.CRON_SECRET = SECRET
})

describe('GET /api/cron/gracia-cuit — auth', () => {
  it('401 sin header Authorization', async () => {
    mockFindMany.mockResolvedValue([])
    const res = await GET(req())
    expect(res.status).toBe(401)
    expect(mockFindMany).not.toHaveBeenCalled()
  })

  it('401 con secret incorrecto', async () => {
    mockFindMany.mockResolvedValue([])
    const res = await GET(req('Bearer otra-cosa'))
    expect(res.status).toBe(401)
  })

  it('401 si CRON_SECRET no está configurado (no queda abierto)', async () => {
    delete process.env.CRON_SECRET
    mockFindMany.mockResolvedValue([])
    const res = await GET(req('Bearer '))
    expect(res.status).toBe(401)
  })
})

describe('GET /api/cron/gracia-cuit — acciones', () => {
  const enGracia = (id: string, dias: number, extra: Record<string, unknown> = {}) => ({
    id,
    nombre: `Taller ${id}`,
    verificadoAfip: false,
    estadoCuenta: 'EN_GRACIA',
    inicioGracia: diasAtras(dias),
    recordatorioCuitEnviadoAt: null,
    user: { email: `${id}@pdt.org.ar` },
    ...extra,
  })

  it('día ~55 => manda recordatorio y sella recordatorioCuitEnviadoAt', async () => {
    mockFindMany.mockResolvedValue([enGracia('t-remind', 55)])
    const res = await GET(req(`Bearer ${SECRET}`))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.recordatorios).toBe(1)
    expect(body.inactivaciones).toBe(0)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 't-remind' },
        data: expect.objectContaining({ recordatorioCuitEnviadoAt: expect.any(Date) }),
      }),
    )
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 't-remind@pdt.org.ar' }),
    )
  })

  it('día ~65 => inactiva (estadoCuenta INACTIVA + inactivadaAt) y manda email', async () => {
    mockFindMany.mockResolvedValue([enGracia('t-off', 65)])
    const res = await GET(req(`Bearer ${SECRET}`))
    const body = await res.json()

    expect(body.inactivaciones).toBe(1)
    expect(body.recordatorios).toBe(0)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 't-off' },
        data: expect.objectContaining({ estadoCuenta: 'INACTIVA', inactivadaAt: expect.any(Date) }),
      }),
    )
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
  })

  it('día ~10 => no hace nada', async () => {
    mockFindMany.mockResolvedValue([enGracia('t-joven', 10)])
    const res = await GET(req(`Bearer ${SECRET}`))
    const body = await res.json()

    expect(body.recordatorios).toBe(0)
    expect(body.inactivaciones).toBe(0)
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('recordatorio ya enviado => no re-envía (idempotencia)', async () => {
    mockFindMany.mockResolvedValue([
      enGracia('t-ya', 55, { recordatorioCuitEnviadoAt: diasAtras(5) }),
    ])
    const res = await GET(req(`Bearer ${SECRET}`))
    const body = await res.json()

    expect(body.recordatorios).toBe(0)
    expect(mockSendEmail).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('batch mixto: cuenta cada acción por separado', async () => {
    mockFindMany.mockResolvedValue([
      enGracia('a', 55), // recordatorio
      enGracia('b', 65), // inactivar
      enGracia('c', 10), // nada
      enGracia('d', 55, { recordatorioCuitEnviadoAt: diasAtras(3) }), // nada (ya avisado)
    ])
    const res = await GET(req(`Bearer ${SECRET}`))
    const body = await res.json()

    expect(body.evaluados).toBe(4)
    expect(body.recordatorios).toBe(1)
    expect(body.inactivaciones).toBe(1)
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
  })

  it('taller sin email => no rompe, lo cuenta en sinEmail', async () => {
    mockFindMany.mockResolvedValue([enGracia('t-noemail', 65, { user: null })])
    const res = await GET(req(`Bearer ${SECRET}`))
    const body = await res.json()

    expect(body.inactivaciones).toBe(1)
    expect(body.sinEmail).toBe(1)
    expect(mockSendEmail).not.toHaveBeenCalled()
    // La inactivación igual se persiste aunque no haya a quién avisar.
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('idempotencia real: correr dos veces = mismo resultado (segunda corrida sin cambios)', async () => {
    // 1ª corrida: sella el recordatorio.
    mockFindMany.mockResolvedValueOnce([enGracia('t', 55)])
    const r1 = await GET(req(`Bearer ${SECRET}`))
    expect((await r1.json()).recordatorios).toBe(1)

    vi.clearAllMocks()
    mockUpdate.mockResolvedValue({})
    mockSendEmail.mockResolvedValue({ exito: true })

    // 2ª corrida: el taller ya tiene recordatorioCuitEnviadoAt => NADA.
    mockFindMany.mockResolvedValueOnce([
      enGracia('t', 55, { recordatorioCuitEnviadoAt: diasAtras(0) }),
    ])
    const r2 = await GET(req(`Bearer ${SECRET}`))
    const body2 = await r2.json()
    expect(body2.recordatorios).toBe(0)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })
})
