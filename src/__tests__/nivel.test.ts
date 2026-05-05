import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    reglaNivel: { findMany: vi.fn() },
    tipoDocumento: { findMany: vi.fn() },
    taller: { findUniqueOrThrow: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    logActividad: { create: vi.fn().mockResolvedValue({ id: 'log-1' }) },
    notificacion: { create: vi.fn().mockReturnValue({ catch: vi.fn() }) },
  },
}))

vi.mock('@/compartido/lib/whatsapp', () => ({
  generarMensajeWhatsapp: vi.fn().mockReturnValue({ catch: vi.fn() }),
}))

import { calcularNivel, aplicarNivel, calcularProximoNivel, invalidarCacheNivel } from '@/compartido/lib/nivel'
import { prisma } from '@/compartido/lib/prisma'

const mockReglasFind = prisma.reglaNivel.findMany as ReturnType<typeof vi.fn>
const mockTiposFind = prisma.tipoDocumento.findMany as ReturnType<typeof vi.fn>
const mockTallerFind = prisma.taller.findUniqueOrThrow as ReturnType<typeof vi.fn>
const mockTallerFindUnique = prisma.taller.findUnique as ReturnType<typeof vi.fn>
const mockTallerUpdate = prisma.taller.update as ReturnType<typeof vi.fn>

// Datos mock
const REGLAS = [
  { id: 'r-oro', nivel: 'ORO', puntosMinimos: 100, requiereVerificadoAfip: true, certificadosAcademiaMin: 0, beneficios: ['Top directorio'] },
  { id: 'r-plata', nivel: 'PLATA', puntosMinimos: 50, requiereVerificadoAfip: true, certificadosAcademiaMin: 1, beneficios: ['Mejor posicion'] },
  { id: 'r-bronce', nivel: 'BRONCE', puntosMinimos: 0, requiereVerificadoAfip: false, certificadosAcademiaMin: 0, beneficios: ['Directorio'] },
]

const TIPOS = [
  { id: 'td-cuit', nombre: 'CUIT', label: 'CUIT', nivelMinimo: 'PLATA', requerido: true, puntosOtorgados: 15 },
  { id: 'td-hab', nombre: 'Habilitacion', label: 'Hab', nivelMinimo: 'PLATA', requerido: true, puntosOtorgados: 15 },
  { id: 'td-art', nombre: 'ART', label: 'ART', nivelMinimo: 'PLATA', requerido: true, puntosOtorgados: 15 },
  { id: 'td-emp', nombre: 'Empleados', label: 'Emp', nivelMinimo: 'ORO', requerido: true, puntosOtorgados: 20 },
]

function tallerMock(overrides: Record<string, unknown> = {}) {
  return {
    id: 'taller-1',
    verificadoAfip: false,
    validaciones: [],
    certificados: [],
    ...overrides,
  }
}

function validacion(tipoId: string, puntos: number) {
  return { tipoDocumento: { id: tipoId, puntosOtorgados: puntos } }
}

beforeEach(() => {
  vi.clearAllMocks()
  invalidarCacheNivel()
  mockReglasFind.mockResolvedValue(REGLAS)
  mockTiposFind.mockResolvedValue(TIPOS)
  mockTallerUpdate.mockResolvedValue({})
})

describe('calcularNivel — logica dinamica desde DB', () => {
  it('taller sin nada es BRONCE con 0 puntos', async () => {
    mockTallerFind.mockResolvedValue(tallerMock())
    const r = await calcularNivel('taller-1')
    expect(r.nivel).toBe('BRONCE')
    expect(r.puntaje).toBe(0)
  })

  it('AFIP verificado suma 10 pts bonus', async () => {
    mockTallerFind.mockResolvedValue(tallerMock({ verificadoAfip: true }))
    const r = await calcularNivel('taller-1')
    expect(r.puntaje).toBe(10)
    expect(r.nivel).toBe('BRONCE')
  })

  it('puntos vienen de puntosOtorgados de cada tipo (no fijos)', async () => {
    mockTallerFind.mockResolvedValue(tallerMock({
      validaciones: [validacion('td-cuit', 15), validacion('td-emp', 20)],
    }))
    const r = await calcularNivel('taller-1')
    expect(r.puntaje).toBe(35) // 15 + 20
  })

  it('PLATA requiere: pts >= 50 + AFIP + cert >= 1 + docs PLATA', async () => {
    mockTallerFind.mockResolvedValue(tallerMock({
      verificadoAfip: true,
      validaciones: [validacion('td-cuit', 15), validacion('td-hab', 15), validacion('td-art', 15)],
      certificados: [{ id: 'c-1' }],
    }))
    const r = await calcularNivel('taller-1')
    // 15+15+15+10(afip) = 55 >= 50, afip ok, 1 cert, 3 docs plata completos
    expect(r.nivel).toBe('PLATA')
    expect(r.puntaje).toBe(55)
  })

  it('falta 1 certificado impide PLATA', async () => {
    mockTallerFind.mockResolvedValue(tallerMock({
      verificadoAfip: true,
      validaciones: [validacion('td-cuit', 15), validacion('td-hab', 15), validacion('td-art', 15)],
      certificados: [], // sin certificados
    }))
    const r = await calcularNivel('taller-1')
    expect(r.nivel).toBe('BRONCE')
    expect(r.puntaje).toBe(55) // tiene puntos pero falta certificado
  })

  it('falta AFIP impide PLATA', async () => {
    mockTallerFind.mockResolvedValue(tallerMock({
      verificadoAfip: false, // sin AFIP
      validaciones: [validacion('td-cuit', 15), validacion('td-hab', 15), validacion('td-art', 15)],
      certificados: [{ id: 'c-1' }],
    }))
    const r = await calcularNivel('taller-1')
    expect(r.nivel).toBe('BRONCE')
  })

  it('ORO requiere todos los docs (PLATA + ORO) + pts >= 100 + AFIP', async () => {
    mockTallerFind.mockResolvedValue(tallerMock({
      verificadoAfip: true,
      validaciones: [
        validacion('td-cuit', 15), validacion('td-hab', 15),
        validacion('td-art', 15), validacion('td-emp', 20),
      ],
      certificados: [{ id: 'c-1' }],
    }))
    const r = await calcularNivel('taller-1')
    // 15+15+15+20+10 = 75 < 100 → no llega a ORO
    expect(r.nivel).toBe('PLATA')
  })

  it('ORO con suficientes puntos y todos los docs', async () => {
    // Ajustar reglas para hacer ORO alcanzable con nuestros datos
    mockReglasFind.mockResolvedValue([
      { ...REGLAS[0], puntosMinimos: 70 }, // ORO a 70
      REGLAS[1], REGLAS[2],
    ])
    invalidarCacheNivel()
    mockTallerFind.mockResolvedValue(tallerMock({
      verificadoAfip: true,
      validaciones: [
        validacion('td-cuit', 15), validacion('td-hab', 15),
        validacion('td-art', 15), validacion('td-emp', 20),
      ],
      certificados: [{ id: 'c-1' }],
    }))
    const r = await calcularNivel('taller-1')
    expect(r.nivel).toBe('ORO')
    expect(r.puntaje).toBe(75)
  })

  it('no hay cap de puntaje (PUNTAJE_MAX eliminado)', async () => {
    mockTallerFind.mockResolvedValue(tallerMock({
      verificadoAfip: true,
      validaciones: Array.from({ length: 10 }, (_, i) => validacion(`td-${i}`, 20)),
    }))
    const r = await calcularNivel('taller-1')
    expect(r.puntaje).toBe(210) // 10*20 + 10 AFIP = 210, sin cap
  })
})

describe('aplicarNivel — actualiza DB y loguea cambios', () => {
  it('actualiza taller con nivel y puntaje calculado', async () => {
    mockTallerFindUnique.mockResolvedValue({ nivel: 'BRONCE' })
    mockTallerFind.mockResolvedValue(tallerMock({
      verificadoAfip: true,
      validaciones: [validacion('td-cuit', 15), validacion('td-hab', 15), validacion('td-art', 15)],
      certificados: [{ id: 'c-1' }],
    }))
    await aplicarNivel('taller-1', 'user-1')
    expect(mockTallerUpdate).toHaveBeenCalledWith({
      where: { id: 'taller-1' },
      data: { nivel: 'PLATA', puntaje: 55 },
    })
  })

  it('loguea NIVEL_SUBIDO cuando sube', async () => {
    mockTallerFindUnique.mockResolvedValue({ nivel: 'BRONCE' })
    mockTallerFind.mockResolvedValue(tallerMock({
      verificadoAfip: true,
      validaciones: [validacion('td-cuit', 15), validacion('td-hab', 15), validacion('td-art', 15)],
      certificados: [{ id: 'c-1' }],
    }))
    await aplicarNivel('taller-1', 'user-1')
    const logCreate = prisma.logActividad.create as ReturnType<typeof vi.fn>
    expect(logCreate).toHaveBeenCalled()
    const logData = logCreate.mock.calls[0][0].data
    expect(logData.accion).toBe('NIVEL_SUBIDO')
  })

  it('no loguea si nivel no cambia', async () => {
    mockTallerFindUnique.mockResolvedValue({ nivel: 'BRONCE' })
    mockTallerFind.mockResolvedValue(tallerMock())
    await aplicarNivel('taller-1')
    const logCreate = prisma.logActividad.create as ReturnType<typeof vi.fn>
    expect(logCreate).not.toHaveBeenCalled()
  })
})

describe('calcularProximoNivel — info para dashboard taller', () => {
  it('BRONCE retorna info para llegar a PLATA', async () => {
    mockTallerFind.mockResolvedValue(tallerMock())
    const info = await calcularProximoNivel('taller-1')
    expect(info.nivelActual).toBe('BRONCE')
    expect(info.nivelProximo).toBe('PLATA')
    expect(info.puntosObjetivo).toBe(50)
    expect(info.puntosFaltantes).toBe(50)
    expect(info.requiereAfip).toBe(true)
    expect(info.documentosFaltantes.length).toBe(3) // 3 docs PLATA
    expect(info.beneficiosProximoNivel.length).toBeGreaterThan(0)
  })

  it('ORO retorna nivelProximo null', async () => {
    mockReglasFind.mockResolvedValue([
      { ...REGLAS[0], puntosMinimos: 70 },
      REGLAS[1], REGLAS[2],
    ])
    invalidarCacheNivel()
    mockTallerFind.mockResolvedValue(tallerMock({
      verificadoAfip: true,
      validaciones: [
        validacion('td-cuit', 15), validacion('td-hab', 15),
        validacion('td-art', 15), validacion('td-emp', 20),
      ],
      certificados: [{ id: 'c-1' }],
    }))
    const info = await calcularProximoNivel('taller-1')
    expect(info.nivelActual).toBe('ORO')
    expect(info.nivelProximo).toBeNull()
    expect(info.puntosFaltantes).toBe(0)
    expect(info.documentosFaltantes).toEqual([])
  })

  it('documentosFaltantes incluye solo los no completados', async () => {
    mockTallerFind.mockResolvedValue(tallerMock({
      validaciones: [validacion('td-cuit', 15)], // solo CUIT completado
    }))
    const info = await calcularProximoNivel('taller-1')
    const nombres = info.documentosFaltantes.map(d => d.nombre)
    expect(nombres).toContain('Habilitacion')
    expect(nombres).toContain('ART')
    expect(nombres).not.toContain('CUIT')
  })

  it('certificadosFaltantes se calcula correctamente', async () => {
    mockTallerFind.mockResolvedValue(tallerMock({ certificados: [] }))
    const info = await calcularProximoNivel('taller-1')
    expect(info.certificadosFaltantes).toBe(1) // PLATA requiere 1
  })
})
