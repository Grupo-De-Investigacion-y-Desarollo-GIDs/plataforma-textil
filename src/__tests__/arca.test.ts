import { describe, it, expect, vi, beforeEach } from 'vitest'
import fixtureActivo from '../../tests/fixtures/arca-responses/padron-a10-activo.json'
import fixtureInactivo from '../../tests/fixtures/arca-responses/padron-a10-inactivo.json'
import fixtureMonotributo from '../../tests/fixtures/arca-responses/padron-a10-monotributo.json'
import fixtureSinActividad from '../../tests/fixtures/arca-responses/padron-a10-sin-actividad.json'
import fixtureBaja from '../../tests/fixtures/arca-responses/padron-a10-baja.json'

// ─── Shared mock references (vi.hoisted ensures they're available to vi.mock) ──

const { mockGetTaxpayerDetails, mockCreate, mockFindUnique, mockUpdate } = vi.hoisted(() => {
  // Set env vars early so arca.ts config picks them up
  process.env.ARCA_ENABLED = 'true'
  process.env.ARCA_PROVIDER = 'afipsdk'
  process.env.AFIP_CUIT_PLATAFORMA = '20282165733'
  process.env.AFIP_SDK_TOKEN = 'test-token'
  process.env.AFIP_SDK_ENV = 'development'
  return {
    mockGetTaxpayerDetails: vi.fn(),
    mockCreate: vi.fn().mockReturnValue({ catch: vi.fn() }),
    mockFindUnique: vi.fn(),
    mockUpdate: vi.fn(),
  }
})

vi.mock('@afipsdk/afip.js', () => {
  return {
    default: class MockAfip {
      RegisterScopeTen = { getTaxpayerDetails: mockGetTaxpayerDetails }
    },
  }
})

vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    consultaArca: { create: mockCreate },
    taller: { findUnique: mockFindUnique, update: mockUpdate },
  },
}))
vi.mock('@/compartido/lib/log', () => ({ logActividad: vi.fn() }))

import {
  consultarPadron,
  sincronizarTaller,
  mensajeErrorArca,
  errorBloqueaRegistro,
} from '@/compartido/lib/arca'

beforeEach(() => {
  vi.clearAllMocks()
  mockCreate.mockReturnValue({ catch: vi.fn() })
  process.env.ARCA_ENABLED = 'true'
  process.env.ARCA_PROVIDER = 'afipsdk'
  process.env.AFIP_CUIT_PLATAFORMA = '20282165733'
  process.env.AFIP_SDK_TOKEN = 'test-token'
  process.env.AFIP_SDK_ENV = 'development'
})

// ─── consultarPadron ─────────────────────────────────────────────────────────

describe('consultarPadron', () => {
  it('retorna datos completos para CUIT activo con actividades', async () => {
    mockGetTaxpayerDetails.mockResolvedValue(fixtureActivo)
    const resultado = await consultarPadron('20-30123456-7')

    expect(resultado.exitosa).toBe(true)
    expect(resultado.datos).toBeDefined()
    expect(resultado.datos!.nombre).toBe('COOPERATIVA DE TRABAJO TEXTIL PROGRESO LTDA')
    expect(resultado.datos!.tipoInscripcion).toBe('RESPONSABLE_INSCRIPTO')
    expect(resultado.datos!.estadoCuit).toBe('ACTIVO')
    expect(resultado.datos!.actividades).toEqual(['181000', '181100'])
    expect(resultado.datos!.domicilioFiscal?.provincia).toBe('Buenos Aires')
    expect(resultado.datos!.domicilioFiscal?.localidad).toBe('Quilmes')
    expect(resultado.duracionMs).toBeGreaterThanOrEqual(0)
  })

  it('retorna MONOTRIBUTO con categoria para taller monotributista', async () => {
    mockGetTaxpayerDetails.mockResolvedValue(fixtureMonotributo)
    const resultado = await consultarPadron('20-28216573-3')

    expect(resultado.exitosa).toBe(true)
    expect(resultado.datos!.tipoInscripcion).toBe('MONOTRIBUTO')
    expect(resultado.datos!.categoriaMonotributo).toBe('C')
  })

  it('retorna CUIT_INEXISTENTE cuando ARCA devuelve null', async () => {
    mockGetTaxpayerDetails.mockResolvedValue(null)
    const resultado = await consultarPadron('99-99999999-9')

    expect(resultado.exitosa).toBe(false)
    expect(resultado.error).toBe('CUIT_INEXISTENTE')
  })

  it('retorna CUIT_INACTIVO cuando estadoClave es INACTIVO', async () => {
    mockGetTaxpayerDetails.mockResolvedValue(fixtureInactivo)
    const resultado = await consultarPadron('20-11111111-1')

    expect(resultado.exitosa).toBe(false)
    expect(resultado.error).toBe('CUIT_INACTIVO')
    expect(resultado.datos).toBeDefined()
    expect(resultado.datos!.estadoCuit).toBe('INACTIVO')
  })

  it('retorna CUIT_INACTIVO cuando estadoClave es BAJA', async () => {
    mockGetTaxpayerDetails.mockResolvedValue(fixtureBaja)
    const resultado = await consultarPadron('20-22222222-2')

    expect(resultado.exitosa).toBe(false)
    expect(resultado.error).toBe('CUIT_INACTIVO')
    expect(resultado.datos!.estadoCuit).toBe('BAJA')
  })

  it('retorna CUIT_SIN_ACTIVIDAD cuando actividades esta vacio', async () => {
    mockGetTaxpayerDetails.mockResolvedValue(fixtureSinActividad)
    const resultado = await consultarPadron('20-33333333-3')

    expect(resultado.exitosa).toBe(false)
    expect(resultado.error).toBe('CUIT_SIN_ACTIVIDAD')
  })

  it('retorna ARCA_NO_RESPONDE cuando hay timeout', async () => {
    mockGetTaxpayerDetails.mockRejectedValue(new Error('ETIMEDOUT'))
    const resultado = await consultarPadron('20-44444444-4')

    expect(resultado.exitosa).toBe(false)
    expect(resultado.error).toBe('ARCA_NO_RESPONDE')
  })

  it('retorna AFIPSDK_ERROR cuando hay error de autenticacion', async () => {
    mockGetTaxpayerDetails.mockRejectedValue(new Error('Unauthorized 401'))
    const resultado = await consultarPadron('20-55555555-5')

    expect(resultado.exitosa).toBe(false)
    expect(resultado.error).toBe('AFIPSDK_ERROR')
  })

  it('registra consulta en ConsultaArca para cada llamada', async () => {
    mockGetTaxpayerDetails.mockResolvedValue(fixtureActivo)
    await consultarPadron('20-30123456-7', 'taller-123')

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tallerId: 'taller-123',
        cuit: '20-30123456-7',
        endpoint: 'padron-a10',
        exitosa: true,
      }),
    })
  })

  it('registra consulta sin tallerId en pre-registro', async () => {
    mockGetTaxpayerDetails.mockResolvedValue(fixtureActivo)
    await consultarPadron('20-30123456-7')

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tallerId: null,
      }),
    })
  })
})

// ─── mensajeErrorArca ────────────────────────────────────────────────────────

describe('mensajeErrorArca', () => {
  it('retorna mensaje legible para cada codigo de error', () => {
    expect(mensajeErrorArca('CUIT_INEXISTENTE')).toContain('No encontramos este CUIT')
    expect(mensajeErrorArca('CUIT_INACTIVO')).toContain('inactivo o dado de baja')
    expect(mensajeErrorArca('CUIT_SIN_ACTIVIDAD')).toContain('no tiene actividad economica')
    expect(mensajeErrorArca('ARCA_NO_RESPONDE')).toContain('ARCA no esta respondiendo')
    expect(mensajeErrorArca('AFIPSDK_ERROR')).toContain('No se pudo verificar')
  })
})

// ─── errorBloqueaRegistro ────────────────────────────────────────────────────

describe('errorBloqueaRegistro', () => {
  it('bloquea CUIT_INEXISTENTE, CUIT_INACTIVO, CUIT_SIN_ACTIVIDAD', () => {
    expect(errorBloqueaRegistro('CUIT_INEXISTENTE')).toBe(true)
    expect(errorBloqueaRegistro('CUIT_INACTIVO')).toBe(true)
    expect(errorBloqueaRegistro('CUIT_SIN_ACTIVIDAD')).toBe(true)
  })

  it('no bloquea ARCA_NO_RESPONDE ni AFIPSDK_ERROR', () => {
    expect(errorBloqueaRegistro('ARCA_NO_RESPONDE')).toBe(false)
    expect(errorBloqueaRegistro('AFIPSDK_ERROR')).toBe(false)
  })
})

// ─── sincronizarTaller ───────────────────────────────────────────────────────

describe('sincronizarTaller', () => {
  it('actualiza taller con datos de ARCA cuando exitosa', async () => {
    mockGetTaxpayerDetails.mockResolvedValue(fixtureActivo)
    mockFindUnique.mockResolvedValue({
      id: 'taller-1',
      cuit: '20-30123456-7',
      verificadoAfipAt: null,
    })
    mockUpdate.mockResolvedValue({})

    const resultado = await sincronizarTaller('taller-1', true)

    expect(resultado.exitosa).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'taller-1' },
        data: expect.objectContaining({
          verificadoAfip: true,
          tipoInscripcionAfip: 'RESPONSABLE_INSCRIPTO',
          actividadesAfip: ['181000', '181100'],
        }),
      })
    )
  })

  it('marca verificadoAfip:false cuando CUIT inactivo', async () => {
    mockGetTaxpayerDetails.mockResolvedValue(fixtureInactivo)
    mockFindUnique.mockResolvedValue({
      id: 'taller-2',
      cuit: '20-11111111-1',
      verificadoAfipAt: null,
    })
    mockUpdate.mockResolvedValue({})

    const resultado = await sincronizarTaller('taller-2', true)

    expect(resultado.exitosa).toBe(false)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'taller-2' },
        data: expect.objectContaining({
          verificadoAfip: false,
          estadoCuitAfip: 'INACTIVO',
        }),
      })
    )
  })

  it('no sincroniza si verificacion tiene menos de 30 dias y force=false', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'taller-3',
      cuit: '20-30123456-7',
      verificadoAfipAt: new Date(),
    })

    const resultado = await sincronizarTaller('taller-3', false)

    expect(resultado.exitosa).toBe(true)
    expect(mockGetTaxpayerDetails).not.toHaveBeenCalled()
  })

  it('retorna error si taller no tiene CUIT', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'taller-4',
      cuit: null,
      verificadoAfipAt: null,
    })

    const resultado = await sincronizarTaller('taller-4', true)

    expect(resultado.exitosa).toBe(false)
    expect(resultado.error).toContain('sin CUIT')
  })
})
