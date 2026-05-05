import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/compartido/lib/prisma', () => ({
  prisma: {
    taller: { count: vi.fn(), findMany: vi.fn() },
    motivoNoMatch: { create: vi.fn(), findMany: vi.fn() },
    reglaNivel: { findMany: vi.fn() },
    tipoDocumento: { findMany: vi.fn() },
  },
}))

vi.mock('@/compartido/lib/nivel', () => ({
  calcularProximoNivel: vi.fn(),
}))

import { registrarMotivoNoMatch, calcularStatsAgregadas, generarRecomendaciones } from '@/compartido/lib/demanda-insatisfecha'
import { prisma } from '@/compartido/lib/prisma'
import { calcularProximoNivel } from '@/compartido/lib/nivel'

const mockTallerCount = prisma.taller.count as ReturnType<typeof vi.fn>
const mockTallerFind = prisma.taller.findMany as ReturnType<typeof vi.fn>
const mockMotivoCreate = prisma.motivoNoMatch.create as ReturnType<typeof vi.fn>
const mockMotivoFind = prisma.motivoNoMatch.findMany as ReturnType<typeof vi.fn>
const mockCalcProximo = calcularProximoNivel as ReturnType<typeof vi.fn>

function pedidoMock(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pedido-1',
    omId: 'OM-2026-001',
    marcaId: 'marca-1',
    tipoPrenda: 'Remera basica',
    tipoPrendaId: null,
    cantidad: 500,
    fechaCreacion: new Date(),
    fechaObjetivo: null,
    estado: 'PUBLICADO',
    visibilidad: 'PUBLICO',
    progresoTotal: 0,
    montoTotal: 0,
    descripcion: null,
    presupuesto: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    imagenes: [],
    procesosRequeridos: [],
    marca: { nombre: 'DulceModa' },
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('registrarMotivoNoMatch', () => {
  it('registra SIN_TALLERES_NIVEL cuando hay BRONCE que matchearian y no hay PLATA/ORO', async () => {
    // 3 BRONCE con capacidad, 0 PLATA/ORO insuficientes, 0 PLATA/ORO totales
    mockTallerCount.mockResolvedValueOnce(3)   // bronceQueMatchearian
    mockTallerCount.mockResolvedValueOnce(0)   // sinCapacidadSuficiente
    mockTallerCount.mockResolvedValueOnce(0)   // totalPlataOro
    mockTallerFind.mockResolvedValueOnce([])   // buscarTalleresCerca — empty
    mockMotivoCreate.mockResolvedValueOnce({ id: 'motivo-1' })

    await registrarMotivoNoMatch(pedidoMock() as never)

    expect(mockMotivoCreate).toHaveBeenCalledOnce()
    const data = mockMotivoCreate.mock.calls[0][0].data
    expect(data.motivoCategoria).toBe('SIN_TALLERES_NIVEL')
    expect(data.pedidoId).toBe('pedido-1')
    expect(data.detalle.capacidadRequerida).toBe(500)
  })

  it('registra SIN_TALLERES_CAPACIDAD cuando mayoria no tiene capacidad', async () => {
    mockTallerCount.mockResolvedValueOnce(0)   // bronceQueMatchearian
    mockTallerCount.mockResolvedValueOnce(8)   // sinCapacidadSuficiente
    mockTallerCount.mockResolvedValueOnce(10)  // totalPlataOro: 8 > 10/2
    mockTallerFind.mockResolvedValueOnce([])   // buscarTalleresCerca
    mockMotivoCreate.mockResolvedValueOnce({ id: 'motivo-2' })

    await registrarMotivoNoMatch(pedidoMock() as never)

    const data = mockMotivoCreate.mock.calls[0][0].data
    expect(data.motivoCategoria).toBe('SIN_TALLERES_CAPACIDAD')
  })

  it('registra SIN_TALLERES_PROCESO cuando hay exclusion por proceso', async () => {
    mockTallerCount.mockResolvedValueOnce(0)   // bronceQueMatchearian
    mockTallerCount.mockResolvedValueOnce(1)   // sinCapacidadSuficiente
    mockTallerCount.mockResolvedValueOnce(5)   // totalPlataOro: 1 < 5/2
    // talleresConCapacidad para filtro de procesos: 2 talleres, ninguno tiene Estampado
    mockTallerFind.mockResolvedValueOnce([
      { id: 't1', procesos: [{ proceso: { nombre: 'Confeccion' } }] },
      { id: 't2', procesos: [{ proceso: { nombre: 'Corte' } }] },
    ])
    mockTallerFind.mockResolvedValueOnce([])   // buscarTalleresCerca
    mockMotivoCreate.mockResolvedValueOnce({ id: 'motivo-3' })

    await registrarMotivoNoMatch(pedidoMock({ procesosRequeridos: ['Estampado'] }) as never)

    const data = mockMotivoCreate.mock.calls[0][0].data
    expect(data.motivoCategoria).toBe('SIN_TALLERES_PROCESO')
    expect(data.detalle.talleresExcluidos.porProceso).toBe(2)
  })

  it('registra OTROS cuando no hay talleres de ningun tipo', async () => {
    mockTallerCount.mockResolvedValueOnce(0)   // bronceQueMatchearian
    mockTallerCount.mockResolvedValueOnce(0)   // sinCapacidadSuficiente
    mockTallerCount.mockResolvedValueOnce(0)   // totalPlataOro
    mockTallerFind.mockResolvedValueOnce([])   // buscarTalleresCerca
    mockMotivoCreate.mockResolvedValueOnce({ id: 'motivo-4' })

    await registrarMotivoNoMatch(pedidoMock() as never)

    const data = mockMotivoCreate.mock.calls[0][0].data
    expect(data.motivoCategoria).toBe('OTROS')
  })

  it('incluye talleres cerca con detalle de proximo nivel', async () => {
    mockTallerCount.mockResolvedValueOnce(2)   // bronceQueMatchearian
    mockTallerCount.mockResolvedValueOnce(0)
    mockTallerCount.mockResolvedValueOnce(0)
    // buscarTalleresCerca: taller BRONCE encontrado
    mockTallerFind.mockResolvedValueOnce([
      { id: 'taller-bronce', nombre: 'La Aguja' },
    ])
    mockCalcProximo.mockResolvedValueOnce({
      nivelActual: 'BRONCE',
      nivelProximo: 'PLATA',
      puntosActuales: 35,
      puntosObjetivo: 50,
      puntosFaltantes: 15,
      documentosFaltantes: [{ id: 'doc1', nombre: 'CUIT' }],
    })
    mockMotivoCreate.mockResolvedValueOnce({ id: 'motivo-5' })

    await registrarMotivoNoMatch(pedidoMock() as never)

    const data = mockMotivoCreate.mock.calls[0][0].data
    expect(data.detalle.talleresCerca).toHaveLength(1)
    expect(data.detalle.talleresCerca[0].nombre).toBe('La Aguja')
    expect(data.detalle.talleresCerca[0].faltaPara).toBe('subir_a_plata')
    expect(data.detalle.talleresCerca[0].puntosFaltantes).toBe(15)
  })

  it('maneja error en calcularProximoNivel sin crashear', async () => {
    mockTallerCount.mockResolvedValueOnce(1)
    mockTallerCount.mockResolvedValueOnce(0)
    mockTallerCount.mockResolvedValueOnce(0)
    mockTallerFind.mockResolvedValueOnce([
      { id: 'taller-sin-regla', nombre: 'Taller Sin Regla' },
    ])
    mockCalcProximo.mockRejectedValueOnce(new Error('ReglaNivel not found'))
    mockMotivoCreate.mockResolvedValueOnce({ id: 'motivo-6' })

    await registrarMotivoNoMatch(pedidoMock() as never)

    const data = mockMotivoCreate.mock.calls[0][0].data
    expect(data.detalle.talleresCerca[0].faltaPara).toBe('sin_datos')
  })
})

describe('calcularStatsAgregadas', () => {
  const desde = new Date('2026-04-01')
  const hasta = new Date('2026-05-01')

  it('retorna stats vacias cuando no hay motivos', async () => {
    mockMotivoFind.mockResolvedValueOnce([])

    const stats = await calcularStatsAgregadas(desde, hasta)

    expect(stats.pedidosTotales).toBe(0)
    expect(stats.unidadesTotales).toBe(0)
    expect(stats.marcasAfectadas).toBe(0)
    expect(stats.motivosBreakdown).toEqual({})
  })

  it('calcula stats correctamente con multiples motivos', async () => {
    mockMotivoFind.mockResolvedValueOnce([
      {
        pedidoId: 'p1',
        motivoCategoria: 'SIN_TALLERES_NIVEL',
        pedido: { id: 'p1', cantidad: 500, presupuesto: 50000, marcaId: 'm1' },
      },
      {
        pedidoId: 'p2',
        motivoCategoria: 'SIN_TALLERES_NIVEL',
        pedido: { id: 'p2', cantidad: 1000, presupuesto: null, marcaId: 'm1' },
      },
      {
        pedidoId: 'p3',
        motivoCategoria: 'SIN_TALLERES_CAPACIDAD',
        pedido: { id: 'p3', cantidad: 2000, presupuesto: 200000, marcaId: 'm2' },
      },
    ])

    const stats = await calcularStatsAgregadas(desde, hasta)

    expect(stats.pedidosTotales).toBe(3)
    expect(stats.unidadesTotales).toBe(3500)
    expect(stats.marcasAfectadas).toBe(2)
    expect(stats.demandaPesos).toBe(250000)
    expect(stats.pedidosConPresupuesto).toBe(2)
    expect(stats.motivosBreakdown).toEqual({
      SIN_TALLERES_NIVEL: 2,
      SIN_TALLERES_CAPACIDAD: 1,
    })
  })
})

describe('generarRecomendaciones', () => {
  const desde = new Date('2026-04-01')
  const hasta = new Date('2026-05-01')

  it('no genera recomendaciones sin motivos', async () => {
    mockMotivoFind.mockResolvedValueOnce([])

    const recs = await generarRecomendaciones(desde, hasta)

    expect(recs).toEqual([])
  })

  it('genera recomendacion de capacitacion con >=3 pedidos del mismo proceso', async () => {
    mockMotivoFind.mockResolvedValueOnce([
      { motivoCategoria: 'SIN_TALLERES_PROCESO', pedido: { cantidad: 100, procesosRequeridos: ['ESTAMPADO'] } },
      { motivoCategoria: 'SIN_TALLERES_PROCESO', pedido: { cantidad: 200, procesosRequeridos: ['ESTAMPADO'] } },
      { motivoCategoria: 'SIN_TALLERES_PROCESO', pedido: { cantidad: 300, procesosRequeridos: ['ESTAMPADO'] } },
    ])
    // Para la regla de formalizacion, no hay SIN_TALLERES_NIVEL
    mockTallerFind.mockResolvedValueOnce([])

    const recs = await generarRecomendaciones(desde, hasta)

    const capacitacion = recs.find(r => r.tipo === 'capacitacion')
    expect(capacitacion).toBeDefined()
    expect(capacitacion!.titulo).toContain('ESTAMPADO')
    expect(capacitacion!.impactoUnidades).toBe(600)
  })

  it('genera recomendacion de crecimiento con >=2000 unidades sin capacidad', async () => {
    mockMotivoFind.mockResolvedValueOnce([
      { motivoCategoria: 'SIN_TALLERES_CAPACIDAD', pedido: { cantidad: 1200, procesosRequeridos: [] } },
      { motivoCategoria: 'SIN_TALLERES_CAPACIDAD', pedido: { cantidad: 1500, procesosRequeridos: [] } },
    ])
    mockTallerFind.mockResolvedValueOnce([])

    const recs = await generarRecomendaciones(desde, hasta)

    const crecimiento = recs.find(r => r.tipo === 'crecimiento')
    expect(crecimiento).toBeDefined()
    expect(crecimiento!.impactoUnidades).toBe(2700)
  })
})
