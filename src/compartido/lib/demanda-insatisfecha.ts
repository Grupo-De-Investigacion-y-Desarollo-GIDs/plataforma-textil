import { prisma } from './prisma'
import { calcularProximoNivel } from './nivel'
import type { MotivoCategoria, Pedido } from '@prisma/client'

// --- Registro de motivo de no-match ---

type PedidoConMarca = Pedido & { marca: { nombre: string } }

export async function registrarMotivoNoMatch(pedido: PedidoConMarca) {
  const [
    bronceQueMatchearian,
    sinCapacidadSuficiente,
    totalPlataOro,
  ] = await Promise.all([
    prisma.taller.count({
      where: {
        nivel: 'BRONCE',
        capacidadMensual: { gte: pedido.cantidad },
        user: { active: true },
      },
    }),
    prisma.taller.count({
      where: {
        nivel: { in: ['PLATA', 'ORO'] },
        capacidadMensual: { lt: pedido.cantidad },
        user: { active: true },
      },
    }),
    prisma.taller.count({
      where: {
        nivel: { in: ['PLATA', 'ORO'] },
        user: { active: true },
      },
    }),
  ])

  let excluidosPorProceso = 0
  if (pedido.procesosRequeridos.length > 0) {
    const talleresConCapacidad = await prisma.taller.findMany({
      where: {
        nivel: { in: ['PLATA', 'ORO'] },
        capacidadMensual: { gte: pedido.cantidad },
        user: { active: true },
      },
      select: {
        id: true,
        procesos: { select: { proceso: { select: { nombre: true } } } },
      },
    })

    excluidosPorProceso = talleresConCapacidad.filter(t => {
      const procesosDelTaller = t.procesos.map(p => p.proceso.nombre.toUpperCase())
      return !pedido.procesosRequeridos.every(pr =>
        procesosDelTaller.some(pt => pt.includes(pr.toUpperCase()))
      )
    }).length
  }

  let motivoCategoria: MotivoCategoria = 'OTROS'
  if (bronceQueMatchearian > 0 && totalPlataOro === 0) {
    motivoCategoria = 'SIN_TALLERES_NIVEL'
  } else if (sinCapacidadSuficiente > totalPlataOro / 2) {
    motivoCategoria = 'SIN_TALLERES_CAPACIDAD'
  } else if (excluidosPorProceso > 0) {
    motivoCategoria = 'SIN_TALLERES_PROCESO'
  } else if (bronceQueMatchearian > 0) {
    motivoCategoria = 'SIN_TALLERES_NIVEL'
  }

  const talleresCerca = await buscarTalleresCerca(pedido)

  await prisma.motivoNoMatch.create({
    data: {
      pedidoId: pedido.id,
      motivoCategoria,
      detalle: {
        capacidadRequerida: pedido.cantidad,
        procesosRequeridos: pedido.procesosRequeridos,
        tipoPrenda: pedido.tipoPrenda,
        talleresEvaluados: bronceQueMatchearian + totalPlataOro,
        talleresExcluidos: {
          porNivel: bronceQueMatchearian,
          porCapacidad: sinCapacidadSuficiente,
          porProceso: excluidosPorProceso,
        },
        talleresCerca,
      },
    },
  })
}

// --- Talleres "cerca de matchear" ---

async function buscarTalleresCerca(pedido: PedidoConMarca) {
  const cercaPorNivel = await prisma.taller.findMany({
    where: {
      nivel: 'BRONCE',
      capacidadMensual: { gte: pedido.cantidad },
      user: { active: true },
    },
    select: { id: true, nombre: true },
    orderBy: { puntaje: 'desc' },
    take: 5,
  })

  const talleresConDetalle = await Promise.all(
    cercaPorNivel.map(async (t) => {
      try {
        const info = await calcularProximoNivel(t.id)
        return {
          tallerId: t.id,
          nombre: t.nombre,
          faltaPara: info.nivelProximo ? 'subir_a_' + info.nivelProximo.toLowerCase() : 'ya_en_maximo',
          detalle: `${info.puntosFaltantes} puntos faltantes${info.documentosFaltantes.length > 0 ? `, ${info.documentosFaltantes.length} doc(s) pendientes` : ''}`,
          puntosFaltantes: info.puntosFaltantes,
        }
      } catch {
        return {
          tallerId: t.id,
          nombre: t.nombre,
          faltaPara: 'sin_datos',
          detalle: 'Sin datos de nivel disponibles',
          puntosFaltantes: 0,
        }
      }
    })
  )

  return talleresConDetalle
}

// --- Stats agregadas para el dashboard ---

interface StatsAgregadas {
  pedidosTotales: number
  unidadesTotales: number
  marcasAfectadas: number
  demandaPesos: number
  pedidosConPresupuesto: number
  motivosBreakdown: Record<string, number>
}

export async function calcularStatsAgregadas(desde: Date, hasta: Date): Promise<StatsAgregadas> {
  const motivos = await prisma.motivoNoMatch.findMany({
    where: {
      createdAt: { gte: desde, lte: hasta },
      resueltoEn: null,
      pedido: { estado: { not: 'CANCELADO' } },
    },
    include: {
      pedido: {
        select: {
          id: true,
          cantidad: true,
          presupuesto: true,
          marcaId: true,
        },
      },
    },
  })

  const pedidoIds = new Set(motivos.map(m => m.pedidoId))
  const marcaIds = new Set(motivos.map(m => m.pedido.marcaId))

  const unidadesTotales = motivos.reduce((sum, m) => sum + m.pedido.cantidad, 0)
  const conPresupuesto = motivos.filter(m => m.pedido.presupuesto != null)
  const demandaPesos = conPresupuesto.reduce((sum, m) => sum + (m.pedido.presupuesto ?? 0), 0)

  const breakdown: Record<string, number> = {}
  for (const m of motivos) {
    breakdown[m.motivoCategoria] = (breakdown[m.motivoCategoria] ?? 0) + 1
  }

  return {
    pedidosTotales: pedidoIds.size,
    unidadesTotales,
    marcasAfectadas: marcaIds.size,
    demandaPesos,
    pedidosConPresupuesto: conPresupuesto.length,
    motivosBreakdown: breakdown,
  }
}

// --- Recomendaciones heuristicas ---

interface Recomendacion {
  tipo: 'formalizacion' | 'capacitacion' | 'crecimiento'
  titulo: string
  descripcion: string
  impactoUnidades: number
  accionUrl: string
}

export async function generarRecomendaciones(desde: Date, hasta: Date): Promise<Recomendacion[]> {
  const motivos = await prisma.motivoNoMatch.findMany({
    where: {
      createdAt: { gte: desde, lte: hasta },
      resueltoEn: null,
      pedido: { estado: { not: 'CANCELADO' } },
    },
    include: {
      pedido: { select: { cantidad: true, procesosRequeridos: true } },
    },
  })

  const recomendaciones: Recomendacion[] = []

  // Regla 1: talleres cerca de PLATA con pedidos esperando
  const motivosPorNivel = motivos.filter(m => m.motivoCategoria === 'SIN_TALLERES_NIVEL')
  if (motivosPorNivel.length >= 2) {
    const talleresCercaPlata = await prisma.taller.findMany({
      where: { nivel: 'BRONCE', user: { active: true } },
      select: { id: true, puntaje: true },
    })
    const cercaDe20pts = talleresCercaPlata.filter(t => {
      // Heuristico: puntaje > 30 sugiere que estan cerca de PLATA (umbral tipico ~50)
      return t.puntaje >= 30
    })
    if (cercaDe20pts.length >= 1) {
      const impacto = motivosPorNivel.reduce((sum, m) => sum + m.pedido.cantidad, 0)
      recomendaciones.push({
        tipo: 'formalizacion',
        titulo: `${cercaDe20pts.length} talleres cerca de subir a PLATA`,
        descripcion: `Acelerar la formalizacion liberaria capacidad para ~${impacto.toLocaleString('es-AR')} unidades`,
        impactoUnidades: impacto,
        accionUrl: '/estado/demanda-insatisfecha?vista=talleres-cerca',
      })
    }
  }

  // Regla 2: pedidos del mismo proceso sin matchear (>=3)
  const procesoCounts: Record<string, { count: number; unidades: number }> = {}
  for (const m of motivos) {
    for (const proceso of m.pedido.procesosRequeridos) {
      const key = proceso.toUpperCase()
      if (!procesoCounts[key]) procesoCounts[key] = { count: 0, unidades: 0 }
      procesoCounts[key].count++
      procesoCounts[key].unidades += m.pedido.cantidad
    }
  }
  for (const [proceso, data] of Object.entries(procesoCounts)) {
    if (data.count >= 3) {
      recomendaciones.push({
        tipo: 'capacitacion',
        titulo: `${data.count} pedidos de "${proceso}" sin oferta formal`,
        descripcion: `Considerar capacitacion en este proceso productivo (~${data.unidades.toLocaleString('es-AR')} unidades)`,
        impactoUnidades: data.unidades,
        accionUrl: `/estado/demanda-insatisfecha?motivoCategoria=SIN_TALLERES_PROCESO`,
      })
    }
  }

  // Regla 3: demanda de capacidad alta sin talleres (>=2000 piezas con <3 talleres)
  const motivosPorCapacidad = motivos.filter(m => m.motivoCategoria === 'SIN_TALLERES_CAPACIDAD')
  const unidadesCapacidad = motivosPorCapacidad.reduce((sum, m) => sum + m.pedido.cantidad, 0)
  if (unidadesCapacidad >= 2000) {
    recomendaciones.push({
      tipo: 'crecimiento',
      titulo: 'Demanda de alta capacidad sin cobertura',
      descripcion: `${motivosPorCapacidad.length} pedidos por ${unidadesCapacidad.toLocaleString('es-AR')} unidades sin talleres con capacidad suficiente`,
      impactoUnidades: unidadesCapacidad,
      accionUrl: '/estado/demanda-insatisfecha?motivoCategoria=SIN_TALLERES_CAPACIDAD',
    })
  }

  return recomendaciones
}

// --- Detalle por categoria ---

export async function obtenerDetallePorCategoria(
  motivoCategoria: MotivoCategoria,
  desde: Date,
  hasta: Date,
) {
  const motivos = await prisma.motivoNoMatch.findMany({
    where: {
      motivoCategoria,
      createdAt: { gte: desde, lte: hasta },
      resueltoEn: null,
      pedido: { estado: { not: 'CANCELADO' } },
    },
    include: {
      pedido: {
        select: {
          id: true,
          omId: true,
          tipoPrenda: true,
          cantidad: true,
          presupuesto: true,
          procesosRequeridos: true,
          fechaObjetivo: true,
          marca: { select: { nombre: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return motivos.map(m => ({
    id: m.id,
    pedidoId: m.pedido.id,
    omId: m.pedido.omId,
    tipoPrenda: m.pedido.tipoPrenda,
    cantidad: m.pedido.cantidad,
    presupuesto: m.pedido.presupuesto,
    procesosRequeridos: m.pedido.procesosRequeridos,
    fechaObjetivo: m.pedido.fechaObjetivo,
    marca: m.pedido.marca.nombre,
    talleresCerca: (m.detalle as Record<string, unknown>)?.talleresCerca ?? [],
    detalle: m.detalle,
    createdAt: m.createdAt,
  }))
}

// --- Talleres cerca (vista agregada) ---

export async function obtenerTalleresCerca(desde: Date, hasta: Date) {
  const motivos = await prisma.motivoNoMatch.findMany({
    where: {
      motivoCategoria: 'SIN_TALLERES_NIVEL',
      createdAt: { gte: desde, lte: hasta },
      resueltoEn: null,
      pedido: { estado: { not: 'CANCELADO' } },
    },
    select: {
      detalle: true,
      pedidoId: true,
    },
  })

  // Agregar talleres cerca de todos los motivos
  const tallerMap = new Map<string, {
    tallerId: string
    nombre: string
    faltaPara: string
    detalle: string
    puntosFaltantes: number
    pedidosQueMatchearia: number
  }>()

  for (const m of motivos) {
    const detalle = m.detalle as Record<string, unknown>
    const talleresCerca = (detalle?.talleresCerca ?? []) as Array<{
      tallerId: string
      nombre: string
      faltaPara: string
      detalle: string
      puntosFaltantes: number
    }>

    for (const t of talleresCerca) {
      const existing = tallerMap.get(t.tallerId)
      if (existing) {
        existing.pedidosQueMatchearia++
      } else {
        tallerMap.set(t.tallerId, {
          ...t,
          pedidosQueMatchearia: 1,
        })
      }
    }
  }

  return Array.from(tallerMap.values())
    .sort((a, b) => b.pedidosQueMatchearia - a.pedidosQueMatchearia)
}

// --- Export CSV ---

export async function exportarMotivosCSV(desde: Date, hasta: Date) {
  const motivos = await prisma.motivoNoMatch.findMany({
    where: {
      createdAt: { gte: desde, lte: hasta },
      resueltoEn: null,
      pedido: { estado: { not: 'CANCELADO' } },
    },
    include: {
      pedido: {
        select: {
          omId: true,
          tipoPrenda: true,
          cantidad: true,
          presupuesto: true,
          procesosRequeridos: true,
          marca: { select: { nombre: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return motivos.map(m => {
    const detalle = m.detalle as Record<string, unknown>
    const talleresCerca = (detalle?.talleresCerca ?? []) as Array<{ nombre: string }>

    const accionSugerida: Record<string, string> = {
      SIN_TALLERES_NIVEL: 'Acompanar talleres a subir de nivel',
      SIN_TALLERES_CAPACIDAD: 'Buscar talleres con mayor capacidad o dividir pedido',
      SIN_TALLERES_PROCESO: 'Capacitar talleres en procesos faltantes',
      OTROS: 'Evaluar caso individualmente',
    }

    return {
      omId: m.pedido.omId,
      tipoPrenda: m.pedido.tipoPrenda,
      cantidad: m.pedido.cantidad,
      presupuesto: m.pedido.presupuesto ?? '',
      marca: m.pedido.marca.nombre,
      motivoCategoria: m.motivoCategoria,
      procesosRequeridos: m.pedido.procesosRequeridos.join('; '),
      talleresCerca: talleresCerca.map(t => t.nombre).join('; '),
      accionSugerida: accionSugerida[m.motivoCategoria] ?? '',
      fecha: m.createdAt.toISOString().split('T')[0],
    }
  })
}
