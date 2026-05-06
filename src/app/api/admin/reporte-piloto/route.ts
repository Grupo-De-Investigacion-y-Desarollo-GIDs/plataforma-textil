import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { apiHandler, errorAuthRequired, errorForbidden } from '@/compartido/lib/api-errors'
import { generarXlsx, type HojaExportable } from '@/compartido/lib/exportes'
import { calcularEtapa, ETAPA_LABELS, type EtapaOnboarding } from '@/compartido/lib/onboarding'
import { calcularStatsAgregadas, exportarMotivosCSV, generarRecomendaciones } from '@/compartido/lib/demanda-insatisfecha'
import { logAccionAdmin } from '@/compartido/lib/log'

function fechaStr(d: Date | null | undefined): string {
  return d ? d.toLocaleDateString('es-AR') : ''
}

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) return errorAuthRequired()
  if (!['ADMIN', 'ESTADO'].includes(session.user.role)) return errorForbidden('ADMIN o ESTADO')

  const url = req.nextUrl.searchParams
  const desdeParam = url.get('desde')
  const hastaParam = url.get('hasta')

  const desde = desdeParam ? new Date(desdeParam) : new Date('2025-01-01')
  const hasta = hastaParam ? new Date(hastaParam) : new Date()
  const dateFilter = { gte: desde, lte: hasta }

  // === Hoja: Resumen ejecutivo ===
  const [totalTalleres, totalMarcas, talleresVerificados,
    totalPedidos, pedidosCompletados, totalCotizaciones, cotAceptadas,
    docsAprobados, totalObservaciones] = await Promise.all([
    prisma.taller.count(),
    prisma.marca.count(),
    prisma.taller.count({ where: { verificadoAfip: true } }),
    prisma.pedido.count(),
    prisma.pedido.count({ where: { estado: 'COMPLETADO' } }),
    prisma.cotizacion.count(),
    prisma.cotizacion.count({ where: { estado: 'ACEPTADA' } }),
    prisma.validacion.count({ where: { estado: 'COMPLETADO' } }),
    prisma.observacionCampo.count({ where: { fechaEvento: dateFilter } }),
  ])

  const tasaGlobal = totalCotizaciones > 0 ? Math.round((cotAceptadas / totalCotizaciones) * 100) : 0

  const hojaResumen: HojaExportable = {
    nombre: 'Resumen ejecutivo',
    headers: ['Indicador', 'Valor'],
    filas: [
      ['Periodo del piloto', `${fechaStr(desde)} - ${fechaStr(hasta)}`],
      ['Total talleres registrados', totalTalleres],
      ['Total marcas registradas', totalMarcas],
      ['Talleres verificados ARCA', talleresVerificados],
      ['Total pedidos', totalPedidos],
      ['Pedidos completados', pedidosCompletados],
      ['Total cotizaciones', totalCotizaciones],
      ['Cotizaciones aceptadas', cotAceptadas],
      ['Tasa aceptacion', `${tasaGlobal}%`],
      ['Documentos aprobados', docsAprobados],
      ['Observaciones de campo', totalObservaciones],
    ],
  }

  // === Hoja: Talleres ===
  const talleres = await prisma.taller.findMany({
    include: {
      user: { select: { email: true, active: true, createdAt: true } },
      _count: { select: { validaciones: { where: { estado: 'COMPLETADO' } }, cotizaciones: true } },
    },
    orderBy: { nombre: 'asc' },
  })

  const hojaTalleres: HojaExportable = {
    nombre: 'Talleres',
    headers: ['Nombre', 'CUIT', 'Nivel', 'Puntaje', 'Verificado ARCA', 'Provincia',
      'Capacidad mensual', 'Empleados', 'Docs aprobados', 'Cotizaciones', 'Activo', 'Registro'],
    filas: talleres.map(t => [
      t.nombre, t.cuit, t.nivel, t.puntaje, t.verificadoAfip ? 'Si' : 'No',
      t.provincia ?? '', t.capacidadMensual, t.trabajadoresRegistrados,
      t._count.validaciones, t._count.cotizaciones,
      t.user.active ? 'Si' : 'No', fechaStr(t.user.createdAt),
    ]),
  }

  // === Hoja: Marcas ===
  const marcas = await prisma.marca.findMany({
    include: {
      user: { select: { email: true, active: true, createdAt: true } },
      _count: { select: { pedidos: true } },
    },
    orderBy: { nombre: 'asc' },
  })

  const hojaMarcas: HojaExportable = {
    nombre: 'Marcas',
    headers: ['Nombre', 'CUIT', 'Verificado ARCA', 'Volumen mensual', 'Pedidos', 'Activo', 'Registro'],
    filas: marcas.map(m => [
      m.nombre, m.cuit, m.verificadoAfip ? 'Si' : 'No',
      m.volumenMensual, m._count.pedidos,
      m.user.active ? 'Si' : 'No', fechaStr(m.user.createdAt),
    ]),
  }

  // === Hoja: Metricas finales (funnel onboarding) ===
  const usuarios = await prisma.user.findMany({
    where: { role: { in: ['TALLER', 'MARCA'] }, active: true },
    select: { id: true, role: true },
  })
  const etapas = await Promise.all(
    usuarios.map(async u => calcularEtapa(u.id, u.role))
  )
  const conteos: Record<EtapaOnboarding, number> = {
    INVITADO: 0, REGISTRADO: 0, PERFIL_COMPLETO: 0, ACTIVO: 0, INACTIVO: 0,
  }
  for (const e of etapas) conteos[e]++

  const hojaMetricas: HojaExportable = {
    nombre: 'Metricas finales',
    headers: ['Etapa', 'Cantidad', 'Porcentaje'],
    filas: Object.entries(conteos).map(([etapa, count]) => [
      ETAPA_LABELS[etapa as EtapaOnboarding],
      count,
      usuarios.length > 0 ? `${Math.round((count / usuarios.length) * 100)}%` : '0%',
    ]),
  }

  // === Hoja: Demanda insatisfecha ===
  const [motivos, statsAgregadas, recomendaciones] = await Promise.all([
    exportarMotivosCSV(desde, hasta),
    calcularStatsAgregadas(desde, hasta),
    generarRecomendaciones(desde, hasta),
  ])

  const hojaDemanda: HojaExportable = {
    nombre: 'Demanda insatisfecha',
    headers: ['Fecha', 'Marca', 'Tipo prenda', 'Cantidad', 'Presupuesto', 'Motivo', 'Talleres cerca'],
    filas: motivos.map(m => [
      String(m.fecha), String(m.marca), String(m.tipoPrenda),
      String(m.cantidad), String(m.presupuesto),
      String(m.motivoCategoria), String(m.talleresCerca),
    ]),
  }

  // === Hoja: Aprendizajes cualitativos ===
  const observaciones = await prisma.observacionCampo.findMany({
    where: { fechaEvento: dateFilter },
    include: {
      autor: { select: { name: true } },
      user: { select: { name: true, role: true } },
    },
    orderBy: [{ importancia: 'desc' }, { fechaEvento: 'desc' }],
  })

  // Group by type, top 10 each
  const porTipo: Record<string, typeof observaciones> = {}
  for (const o of observaciones) {
    if (!porTipo[o.tipo]) porTipo[o.tipo] = []
    porTipo[o.tipo].push(o)
  }

  const filasAprendizajes: (string | number | Date | null)[][] = []
  for (const [tipo, obs] of Object.entries(porTipo)) {
    filasAprendizajes.push([tipo, '', '', ''])
    const top = obs.slice(0, 10)
    for (const o of top) {
      filasAprendizajes.push([
        fechaStr(o.fechaEvento),
        o.titulo,
        o.contenido.slice(0, 500) + (o.contenido.length > 500 ? '...' : ''),
        o.tags.join(', '),
      ])
    }
    filasAprendizajes.push(['', '', '', ''])
  }

  const hojaAprendizajes: HojaExportable = {
    nombre: 'Aprendizajes cualitativos',
    headers: ['Fecha', 'Titulo', 'Contenido', 'Tags'],
    filas: filasAprendizajes,
  }

  // === Hoja: Recomendaciones ===
  const obsPolitica = observaciones.filter(o => o.tipo === 'POLITICA_PUBLICA')
  const filasRecomendaciones: (string | number | Date | null)[][] = [
    ['--- Recomendaciones desde demanda insatisfecha ---', '', ''],
    ...recomendaciones.map(r => [r.tipo, `${r.titulo}: ${r.descripcion}`, `Impacto: ${r.impactoUnidades} unidades`] as [string, string, string]),
    ['', '', ''],
    ['--- Recomendaciones desde observaciones de politica publica ---', '', ''],
    ...obsPolitica.map(o => [o.titulo, o.contenido.slice(0, 500), `Importancia: ${o.importancia}`] as [string, string, string]),
  ]

  const hojaRecomendaciones: HojaExportable = {
    nombre: 'Recomendaciones',
    headers: ['Titulo/Tipo', 'Descripcion', 'Prioridad'],
    filas: filasRecomendaciones,
  }

  // === Hoja: Anexo datos crudos ===
  const pedidos = await prisma.pedido.findMany({
    where: { createdAt: dateFilter },
    include: { marca: { select: { nombre: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const hojaAnexo: HojaExportable = {
    nombre: 'Anexo - Pedidos',
    headers: ['OM ID', 'Marca', 'Tipo prenda', 'Cantidad', 'Estado', 'Monto', 'Fecha'],
    filas: pedidos.map(p => [
      p.omId, p.marca.nombre, p.tipoPrenda, p.cantidad, p.estado,
      p.montoTotal, fechaStr(p.createdAt),
    ]),
  }

  // === Generate Excel ===
  const hojas: HojaExportable[] = [
    hojaResumen,
    hojaTalleres,
    hojaMarcas,
    hojaMetricas,
    hojaDemanda,
    hojaAprendizajes,
    hojaRecomendaciones,
    hojaAnexo,
  ]

  const buffer = await generarXlsx(hojas, {
    titulo: 'Reporte Final del Piloto — Plataforma Digital Textil',
    subtitulo: `Periodo: ${fechaStr(desde)} - ${fechaStr(hasta)}`,
  })

  logAccionAdmin('REPORTE_PILOTO_GENERADO', session.user.id, {
    entidad: 'exportacion',
    entidadId: 'piloto',
    metadata: { desde: fechaStr(desde), hasta: fechaStr(hasta) },
  })

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="reporte-piloto-pdt.xlsx"`,
    },
  })
})
