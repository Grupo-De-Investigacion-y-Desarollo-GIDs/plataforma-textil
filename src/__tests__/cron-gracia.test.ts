import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Test de integración del cron de gracia (2.3-B1): auth por Bearer, acciones por estado
// e idempotencia. La DECISIÓN pura (planificarAccionGracia) se testea en gracia.test.ts;
// acá se verifica que la ROUTE ejecuta los writes + emails correctos.

const { mockFindMany, mockUpdate, mockSendEmail, mockSincronizarTaller } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockUpdate: vi.fn(),
  mockSendEmail: vi.fn().mockResolvedValue({ exito: true }),
  mockSincronizarTaller: vi.fn(),
}))

vi.mock('@/compartido/lib/prisma', () => ({
  prisma: { taller: { findMany: mockFindMany, update: mockUpdate } },
}))
vi.mock('@/compartido/lib/log', () => ({ logActividad: vi.fn() }))
vi.mock('@/compartido/lib/arca', () => ({ sincronizarTaller: mockSincronizarTaller }))
vi.mock('@/compartido/lib/email', async (importActual) => {
  const actual = await importActual<typeof import('@/compartido/lib/email')>()
  return { ...actual, sendEmail: mockSendEmail }
})

import { GET } from '@/app/api/cron/gracia-cuit/route'

const SECRET = 'test-cron-secret'
const diasAtras = (n: number) => new Date(Date.now() - n * 86_400_000)

// Helper compartido: un taller EN_GRACIA realista (con CUIT => elegible para el reintento
// de Pieza D). Por defecto el reintento ARCA falla (mock en beforeEach) => cae al flujo
// normal de recordatorio/inactivación, así los tests de acciones siguen valiendo.
const enGracia = (id: string, dias: number, extra: Record<string, unknown> = {}) => ({
  id,
  nombre: `Taller ${id}`,
  cuit: '20111111112',
  verificadoAfip: false,
  estadoCuenta: 'EN_GRACIA',
  inicioGracia: diasAtras(dias),
  recordatorioCuitEnviadoAt: null,
  user: { email: `${id}@pdt.org.ar` },
  ...extra,
})

function req(auth?: string): NextRequest {
  return new NextRequest('http://localhost/api/cron/gracia-cuit', {
    headers: auth ? { authorization: auth } : {},
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSendEmail.mockResolvedValue({ exito: true })
  mockUpdate.mockResolvedValue({})
  // Default: ARCA no valida en el reintento (no responde) => el taller sigue su curso normal.
  mockSincronizarTaller.mockResolvedValue({ exitosa: false, error: 'ARCA_NO_RESPONDE', duracionMs: 0 })
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

describe('GET /api/cron/gracia-cuit — Pieza D (reintento ARCA)', () => {
  it('reintento exitoso => reactiva y NO manda email ni sella/inactiva esa corrida', async () => {
    // Día 55: sin el reintento recibiría el recordatorio. Pero ARCA valida => se reactiva y sale.
    mockSincronizarTaller.mockResolvedValueOnce({ exitosa: true, duracionMs: 40 })
    mockFindMany.mockResolvedValue([enGracia('t-cura', 55)])

    const res = await GET(req(`Bearer ${SECRET}`))
    const body = await res.json()

    expect(mockSincronizarTaller).toHaveBeenCalledWith('t-cura', true)
    expect(body.reintentosArca).toBe(1)
    expect(body.reactivacionesAuto).toBe(1)
    expect(body.recordatorios).toBe(0)
    expect(body.inactivaciones).toBe(0)
    // El cron NO hace su propio update (la reactivación la hizo sincronizarTaller) ni manda email.
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('reintento fallido (ARCA caído) => cae al flujo normal y NO cuenta como error', async () => {
    // Default mock: exitosa:false / ARCA_NO_RESPONDE. Día 55 => recordatorio normal.
    mockFindMany.mockResolvedValue([enGracia('t-caido', 55)])

    const res = await GET(req(`Bearer ${SECRET}`))
    const body = await res.json()

    expect(body.reintentosArca).toBe(1)
    expect(body.reactivacionesAuto).toBe(0)
    expect(body.recordatorios).toBe(1)
    expect(body.errores).toBe(0) // un fallo de ARCA NO es error del cron
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
  })

  it('reintento exitoso día ~61 => evita la inactivación', async () => {
    mockSincronizarTaller.mockResolvedValueOnce({ exitosa: true, duracionMs: 30 })
    mockFindMany.mockResolvedValue([enGracia('t-borde', 61)])

    const res = await GET(req(`Bearer ${SECRET}`))
    const body = await res.json()

    expect(body.reactivacionesAuto).toBe(1)
    expect(body.inactivaciones).toBe(0)
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('taller sin CUIT => no se reintenta, cae al flujo normal', async () => {
    mockFindMany.mockResolvedValue([enGracia('t-sincuit', 55, { cuit: null })])

    const res = await GET(req(`Bearer ${SECRET}`))
    const body = await res.json()

    expect(mockSincronizarTaller).not.toHaveBeenCalled()
    expect(body.reintentosArca).toBe(0)
    expect(body.recordatorios).toBe(1) // sigue su curso: recibe el recordatorio del día 55
  })

  it('reintento diario: se llama a ARCA en cada taller elegible (sin backoff)', async () => {
    mockFindMany.mockResolvedValue([
      enGracia('a', 10), // joven, igual se reintenta
      enGracia('b', 55),
      enGracia('c', 30),
    ])

    const res = await GET(req(`Bearer ${SECRET}`))
    const body = await res.json()

    expect(mockSincronizarTaller).toHaveBeenCalledTimes(3)
    expect(body.reintentosArca).toBe(3)
  })

  it('error REAL de sincronizarTaller (DB) sí cuenta como error y no aborta el batch', async () => {
    mockSincronizarTaller
      .mockRejectedValueOnce(new Error('DB caída'))          // taller a: throw
      .mockResolvedValueOnce({ exitosa: true, duracionMs: 20 }) // taller b: valida
    mockFindMany.mockResolvedValue([enGracia('a', 55), enGracia('b', 55)])

    const res = await GET(req(`Bearer ${SECRET}`))
    const body = await res.json()

    expect(body.errores).toBe(1)
    expect(body.reactivacionesAuto).toBe(1) // el segundo taller no fue afectado por el fallo del primero
  })
})
