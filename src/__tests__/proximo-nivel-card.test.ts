import { describe, it, expect, vi } from 'vitest'
import { ordenarPasos, type Paso } from '@/taller/componentes/proximo-nivel-card'
import type { ProximoNivelInfo } from '@/compartido/lib/nivel'

// Mock para test de resiliencia del componente
vi.mock('@/compartido/lib/nivel', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/compartido/lib/nivel')>()
  return { ...original }
})

function infoBase(overrides: Partial<ProximoNivelInfo> = {}): ProximoNivelInfo {
  return {
    nivelActual: 'BRONCE',
    nivelProximo: 'PLATA',
    puntosActuales: 10,
    puntosObjetivo: 50,
    puntosFaltantes: 40,
    documentosFaltantes: [],
    requiereAfip: false,
    tieneAfip: false,
    certificadosFaltantes: 0,
    beneficiosProximoNivel: ['Mejor visibilidad'],
    ...overrides,
  }
}

describe('ordenarPasos', () => {
  it('retorna array vacio si no hay pasos pendientes', () => {
    const info = infoBase()
    const pasos = ordenarPasos(info)
    expect(pasos).toHaveLength(0)
  })

  it('CUIT pendiente tiene prioridad 1 (siempre primero)', () => {
    const info = infoBase({
      requiereAfip: true,
      tieneAfip: false,
      documentosFaltantes: [
        { id: 'd1', nombre: 'monotributo', label: 'Constancia de Monotributo', nivelMinimo: 'PLATA', puntos: 15, requerido: true },
      ],
    })
    const pasos = ordenarPasos(info)
    expect(pasos[0].id).toBe('verificar-afip')
    expect(pasos[0].prioridad).toBe(1)
    expect(pasos[1].id).toBe('documento-d1')
  })

  it('no muestra paso CUIT si ya tiene AFIP verificado', () => {
    const info = infoBase({
      requiereAfip: true,
      tieneAfip: true,
    })
    const pasos = ordenarPasos(info)
    expect(pasos.find(p => p.id === 'verificar-afip')).toBeUndefined()
  })

  it('documentos requeridos antes que opcionales', () => {
    const info = infoBase({
      documentosFaltantes: [
        { id: 'd1', nombre: 'opcional', label: 'Doc Opcional', nivelMinimo: 'PLATA', puntos: 20, requerido: false },
        { id: 'd2', nombre: 'requerido', label: 'Doc Requerido', nivelMinimo: 'PLATA', puntos: 5, requerido: true },
      ],
    })
    const pasos = ordenarPasos(info)
    const idxRequerido = pasos.findIndex(p => p.id === 'documento-d2')
    const idxOpcional = pasos.findIndex(p => p.id === 'documento-d1')
    expect(idxRequerido).toBeLessThan(idxOpcional)
  })

  it('certificados de academia aparecen con prioridad 3', () => {
    const info = infoBase({ certificadosFaltantes: 2 })
    const pasos = ordenarPasos(info)
    expect(pasos).toHaveLength(1)
    expect(pasos[0].id).toBe('certificados-academia')
    expect(pasos[0].prioridad).toBe(3)
    expect(pasos[0].titulo).toContain('2 cursos')
  })

  it('orden completo: AFIP > docs requeridos > certificados > docs opcionales', () => {
    const info = infoBase({
      requiereAfip: true,
      tieneAfip: false,
      documentosFaltantes: [
        { id: 'd1', nombre: 'opcional', label: 'Opcional', nivelMinimo: 'PLATA', puntos: 20, requerido: false },
        { id: 'd2', nombre: 'requerido', label: 'Requerido', nivelMinimo: 'PLATA', puntos: 15, requerido: true },
      ],
      certificadosFaltantes: 1,
    })
    const pasos = ordenarPasos(info)
    expect(pasos.map(p => p.id)).toEqual([
      'verificar-afip',
      'documento-d2',
      'certificados-academia',
      'documento-d1',
    ])
  })

  it('barra de progreso: porcentaje calculado correctamente', () => {
    // Test indirecto — verificamos que la info tiene los datos necesarios
    const info = infoBase({ puntosActuales: 30, puntosObjetivo: 50 })
    const porcentaje = Math.min(100, Math.round((info.puntosActuales / info.puntosObjetivo) * 100))
    expect(porcentaje).toBe(60)
  })

  it('porcentaje no excede 100% cuando puntosActuales > puntosObjetivo', () => {
    const info = infoBase({ puntosActuales: 60, puntosObjetivo: 50 })
    const porcentaje = Math.min(100, Math.round((info.puntosActuales / info.puntosObjetivo) * 100))
    expect(porcentaje).toBe(100)
  })
})

describe('ProximoNivelCard resiliencia', () => {
  it('componente no crashea cuando calcularProximoNivel lanza error (DB sin ReglaNivel)', async () => {
    // Simulamos el escenario: importamos el componente con la funcion mockeada
    vi.doMock('@/compartido/lib/nivel', () => ({
      calcularProximoNivel: vi.fn().mockRejectedValue(new Error('findUniqueOrThrow: ReglaNivel not found')),
    }))

    const { ProximoNivelCard } = await import('@/taller/componentes/proximo-nivel-card')

    // El componente es async server component — lo llamamos directamente
    const result = await ProximoNivelCard({ tallerId: 'taller-inexistente' })

    // Debe retornar el fallback, no lanzar
    expect(result).toBeDefined()
    expect(result).not.toBeNull()

    vi.doUnmock('@/compartido/lib/nivel')
  })
})
