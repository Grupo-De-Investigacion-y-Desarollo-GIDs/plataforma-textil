import { prisma } from '@/compartido/lib/prisma'
import type { HojaExportable } from '@/compartido/lib/exportes'
import { exportarMotivosCSV } from '@/compartido/lib/demanda-insatisfecha'

interface Filtros {
  desde?: string | null
  hasta?: string | null
  provincia?: string | null
  nivel?: string | null
}

interface DataExporte {
  headers: string[]
  filas: string[][]
  hojas: HojaExportable[]
  metadata?: { titulo: string; subtitulo: string }
}

function fechaStr(d: Date | null | undefined): string {
  return d ? d.toISOString().split('T')[0] : ''
}

function buildDateFilter(desde?: string | null, hasta?: string | null) {
  const filter: { gte?: Date; lte?: Date } = {}
  if (desde) filter.gte = new Date(desde)
  if (hasta) filter.lte = new Date(hasta)
  return Object.keys(filter).length > 0 ? filter : undefined
}

// --- TALLERES ---
async function obtenerTalleres(filtros: Filtros): Promise<DataExporte> {
  const dateFilter = buildDateFilter(filtros.desde, filtros.hasta)

  const talleres = await prisma.taller.findMany({
    where: {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      ...(filtros.provincia ? { provincia: filtros.provincia } : {}),
      ...(filtros.nivel ? { nivel: filtros.nivel as 'BRONCE' | 'PLATA' | 'ORO' } : {}),
    },
    include: {
      user: { select: { email: true, phone: true, createdAt: true, active: true, logs: { orderBy: { timestamp: 'desc' as const }, take: 1, select: { timestamp: true } } } },
      _count: { select: { validaciones: { where: { estado: 'COMPLETADO' } }, certificados: { where: { revocado: false } } } },
      validaciones: { select: { estado: true } },
    },
    orderBy: { nombre: 'asc' },
  })

  // Get cotizacion stats per taller
  const cotizacionStats = await prisma.cotizacion.groupBy({
    by: ['tallerId'],
    _count: true,
    where: { tallerId: { in: talleres.map(t => t.id) } },
  })
  const cotAceptadas = await prisma.cotizacion.groupBy({
    by: ['tallerId'],
    _count: true,
    where: { tallerId: { in: talleres.map(t => t.id) }, estado: 'ACEPTADA' },
  })

  const cotMap = Object.fromEntries(cotizacionStats.map(c => [c.tallerId, c._count]))
  const cotAcepMap = Object.fromEntries(cotAceptadas.map(c => [c.tallerId, c._count]))

  const headers = [
    'Nombre', 'CUIT', 'Verificado ARCA', 'Fecha verificacion', 'Tipo inscripcion AFIP',
    'Categoria monotributo', 'Estado CUIT', 'Nivel', 'Puntaje', 'Provincia', 'Localidad',
    'Capacidad mensual', 'Empleados declarados', 'Empleados SIPA', 'Discrepancia empleados',
    'Activo', 'Fecha registro', 'Ultima actividad', 'Docs aprobados', 'Docs pendientes',
    'Cotizaciones enviadas', 'Tasa aceptacion',
  ]

  const filas = talleres.map(t => {
    const totalCot = cotMap[t.id] ?? 0
    const aceptadas = cotAcepMap[t.id] ?? 0
    const tasa = totalCot > 0 ? Math.round((aceptadas / totalCot) * 100) : 0
    const discrepancia = t.empleadosRegistradosSipa != null
      ? String(t.trabajadoresRegistrados - t.empleadosRegistradosSipa)
      : ''
    const docsAprobados = t._count.validaciones
    const docsPendientes = t.validaciones.filter(v => v.estado === 'PENDIENTE').length
    const ultimaActividad = t.user.logs[0]?.timestamp

    return [
      t.nombre, t.cuit, t.verificadoAfip ? 'Si' : 'No', fechaStr(t.verificadoAfipAt),
      t.tipoInscripcionAfip ?? '', t.categoriaMonotributo ?? '', t.estadoCuitAfip ?? '',
      t.nivel, String(t.puntaje), t.provincia ?? '', t.partido ?? '',
      String(t.capacidadMensual), String(t.trabajadoresRegistrados),
      t.empleadosRegistradosSipa != null ? String(t.empleadosRegistradosSipa) : '',
      discrepancia,
      t.user.active ? 'Si' : 'No', fechaStr(t.user.createdAt),
      fechaStr(ultimaActividad),
      String(docsAprobados), String(docsPendientes),
      String(totalCot), `${tasa}%`,
    ]
  })

  return {
    headers,
    filas,
    hojas: [{ nombre: 'Talleres', headers, filas }],
  }
}

// --- MARCAS ---
async function obtenerMarcas(filtros: Filtros): Promise<DataExporte> {
  const dateFilter = buildDateFilter(filtros.desde, filtros.hasta)

  const marcas = await prisma.marca.findMany({
    where: dateFilter ? { createdAt: dateFilter } : {},
    include: {
      user: { select: { email: true, createdAt: true, active: true, logs: { orderBy: { timestamp: 'desc' as const }, take: 1, select: { timestamp: true } } } },
      pedidos: { select: { estado: true, _count: { select: { cotizaciones: true } } } },
    },
    orderBy: { nombre: 'asc' },
  })

  const headers = [
    'Nombre', 'CUIT', 'Verificado ARCA', 'Activo', 'Pedidos publicados',
    'Pedidos completados', 'Pedidos sin cotizaciones', 'Volumen mensual',
    'Ultima actividad',
  ]

  const filas = marcas.map(m => {
    const publicados = m.pedidos.filter(p => p.estado !== 'BORRADOR' && p.estado !== 'CANCELADO').length
    const completados = m.pedidos.filter(p => p.estado === 'COMPLETADO').length
    const sinCotizaciones = m.pedidos.filter(p => p.estado === 'PUBLICADO' && p._count.cotizaciones === 0).length
    const ultimaActividad = m.user.logs[0]?.timestamp

    return [
      m.nombre, m.cuit, m.verificadoAfip ? 'Si' : 'No',
      m.user.active ? 'Si' : 'No',
      String(publicados), String(completados), String(sinCotizaciones),
      String(m.volumenMensual),
      fechaStr(ultimaActividad),
    ]
  })

  return {
    headers,
    filas,
    hojas: [{ nombre: 'Marcas', headers, filas }],
  }
}

// --- VALIDACIONES ---
async function obtenerValidaciones(filtros: Filtros): Promise<DataExporte> {
  const dateFilter = buildDateFilter(filtros.desde, filtros.hasta)

  const validaciones = await prisma.validacion.findMany({
    where: {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      estado: { in: ['COMPLETADO', 'RECHAZADO', 'VENCIDO'] },
    },
    include: {
      taller: { select: { nombre: true, cuit: true } },
      usuarioAprobador: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const headers = [
    'Fecha', 'Taller', 'CUIT', 'Tipo documento', 'Estado',
    'Aprobado por', 'Motivo (si rechazado)',
  ]

  const filas = validaciones.map(v => [
    fechaStr(v.createdAt),
    v.taller.nombre, v.taller.cuit,
    v.tipo, v.estado,
    v.usuarioAprobador?.name ?? '',
    v.estado === 'RECHAZADO' ? (v.detalle ?? '') : '',
  ])

  return {
    headers,
    filas,
    hojas: [{ nombre: 'Validaciones', headers, filas }],
  }
}

// --- DEMANDA INSATISFECHA ---
async function obtenerDemanda(filtros: Filtros): Promise<DataExporte> {
  const desde = filtros.desde ? new Date(filtros.desde) : new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
  const hasta = filtros.hasta ? new Date(filtros.hasta) : new Date()

  const motivos = await exportarMotivosCSV(desde, hasta)

  const headers = [
    'Fecha', 'Marca', 'Tipo prenda', 'Cantidad', 'Presupuesto',
    'Motivo no-match', 'Procesos requeridos', 'Talleres cerca', 'Accion sugerida',
  ]

  const filas = motivos.map(m => [
    String(m.fecha), String(m.marca), String(m.tipoPrenda),
    String(m.cantidad), String(m.presupuesto),
    String(m.motivoCategoria), String(m.procesosRequeridos),
    String(m.talleresCerca), String(m.accionSugerida),
  ])

  return {
    headers,
    filas,
    hojas: [{ nombre: 'Demanda insatisfecha', headers, filas }],
  }
}

// --- RESUMEN ---
async function obtenerResumen(filtros: Filtros): Promise<DataExporte> {
  const dateFilter = buildDateFilter(filtros.desde, filtros.hasta)
  const hace30dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalTalleres, totalMarcas, niveles, talleresVerificados,
    totalPedidos, pedidosCompletados, totalCotizaciones, cotAceptadas,
    docsAprobados, docsPendientes, motivosNoMatch,
  ] = await Promise.all([
    prisma.taller.count(dateFilter ? { where: { createdAt: dateFilter } } : undefined),
    prisma.marca.count(dateFilter ? { where: { createdAt: dateFilter } } : undefined),
    prisma.taller.groupBy({ by: ['nivel'], _count: true }),
    prisma.taller.count({ where: { verificadoAfip: true } }),
    prisma.pedido.count(dateFilter ? { where: { createdAt: dateFilter } } : undefined),
    prisma.pedido.count({ where: { estado: 'COMPLETADO', ...(dateFilter ? { createdAt: dateFilter } : {}) } }),
    prisma.cotizacion.count(dateFilter ? { where: { createdAt: dateFilter } } : undefined),
    prisma.cotizacion.count({ where: { estado: 'ACEPTADA', ...(dateFilter ? { createdAt: dateFilter } : {}) } }),
    prisma.validacion.count({ where: { estado: 'COMPLETADO', ...(dateFilter ? { createdAt: dateFilter } : {}) } }),
    prisma.validacion.count({ where: { estado: 'PENDIENTE' } }),
    prisma.motivoNoMatch.count(dateFilter ? { where: { createdAt: dateFilter } } : undefined),
  ])

  const nivelMap: Record<string, number> = {}
  for (const g of niveles) nivelMap[g.nivel] = g._count
  const tasaGlobal = totalCotizaciones > 0 ? Math.round((cotAceptadas / totalCotizaciones) * 100) : 0

  const headers = ['Metrica', 'Valor']
  const filas = [
    ['Total talleres', String(totalTalleres)],
    ['Talleres Bronce', String(nivelMap.BRONCE ?? 0)],
    ['Talleres Plata', String(nivelMap.PLATA ?? 0)],
    ['Talleres Oro', String(nivelMap.ORO ?? 0)],
    ['Talleres verificados ARCA', String(talleresVerificados)],
    ['Total marcas', String(totalMarcas)],
    ['Total pedidos', String(totalPedidos)],
    ['Pedidos completados', String(pedidosCompletados)],
    ['Total cotizaciones', String(totalCotizaciones)],
    ['Cotizaciones aceptadas', String(cotAceptadas)],
    ['Tasa aceptacion global', `${tasaGlobal}%`],
    ['Documentos aprobados', String(docsAprobados)],
    ['Documentos pendientes', String(docsPendientes)],
    ['Pedidos sin match (demanda insatisfecha)', String(motivosNoMatch)],
  ]

  return {
    headers,
    filas,
    hojas: [{ nombre: 'Resumen', headers, filas }],
  }
}

// --- INFORME MENSUAL ---
async function obtenerInformeMensual(filtros: Filtros): Promise<DataExporte> {
  const ahora = new Date()
  const desde = filtros.desde ?? new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString()
  const hasta = filtros.hasta ?? ahora.toISOString()
  const filtrosMes = { ...filtros, desde, hasta }

  const [talleres, marcas, validaciones, demanda, resumen] = await Promise.all([
    obtenerTalleres(filtrosMes),
    obtenerMarcas(filtrosMes),
    obtenerValidaciones(filtrosMes),
    obtenerDemanda(filtrosMes),
    obtenerResumen(filtrosMes),
  ])

  // Pedidos del periodo
  const dateFilter = buildDateFilter(desde, hasta)
  const pedidos = await prisma.pedido.findMany({
    where: dateFilter ? { createdAt: dateFilter } : {},
    include: { marca: { select: { nombre: true } } },
    orderBy: { createdAt: 'desc' },
  })
  const pedidosHeaders = ['OM ID', 'Marca', 'Tipo prenda', 'Cantidad', 'Estado', 'Monto total', 'Fecha creacion']
  const pedidosFilas = pedidos.map(p => [
    p.omId, p.marca.nombre, p.tipoPrenda, String(p.cantidad), p.estado,
    String(p.montoTotal ?? ''), fechaStr(p.createdAt),
  ])

  const mesLabel = new Date(desde).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  return {
    headers: resumen.headers,
    filas: resumen.filas,
    hojas: [
      ...talleres.hojas,
      ...marcas.hojas,
      { nombre: 'Pedidos', headers: pedidosHeaders, filas: pedidosFilas },
      ...validaciones.hojas,
      ...demanda.hojas,
      ...resumen.hojas,
    ],
    metadata: {
      titulo: 'Informe Mensual — Plataforma Digital Textil',
      subtitulo: `Periodo: ${mesLabel}`,
    },
  }
}

// --- TIPOS LEGACY (capacitaciones, acompanamiento, pedidos, denuncias) ---
async function obtenerCapacitaciones(filtros: Filtros): Promise<DataExporte> {
  const dateFilter = buildDateFilter(filtros.desde, filtros.hasta)
  const certs = await prisma.certificado.findMany({
    where: { revocado: false, ...(dateFilter ? { fecha: dateFilter } : {}) },
    include: { taller: { select: { nombre: true } }, coleccion: { select: { titulo: true } } },
    orderBy: { fecha: 'desc' },
  })
  const headers = ['Taller', 'Coleccion', 'Codigo', 'Calificacion', 'Fecha']
  const filas = certs.map(c => [
    c.taller.nombre, c.coleccion?.titulo ?? '', c.codigo,
    String(c.calificacion ?? ''), fechaStr(c.fecha),
  ])
  return { headers, filas, hojas: [{ nombre: 'Capacitaciones', headers, filas }] }
}

async function obtenerAcompanamiento(): Promise<DataExporte> {
  const talleres = await prisma.taller.findMany({
    include: { user: { select: { email: true } }, validaciones: { select: { estado: true } } },
    orderBy: { puntaje: 'asc' },
  })
  const necesitan = talleres.filter(t => t.validaciones.filter(v => v.estado === 'COMPLETADO').length < 4)
  const headers = ['Taller', 'CUIT', 'Nivel', 'Puntaje', 'Docs completados', 'Email']
  const filas = necesitan.map(t => {
    const completadas = t.validaciones.filter(v => v.estado === 'COMPLETADO').length
    return [t.nombre, t.cuit, t.nivel, String(t.puntaje), String(completadas), t.user.email]
  })
  return { headers, filas, hojas: [{ nombre: 'Acompanamiento', headers, filas }] }
}

async function obtenerPedidos(filtros: Filtros): Promise<DataExporte> {
  const dateFilter = buildDateFilter(filtros.desde, filtros.hasta)
  const pedidos = await prisma.pedido.findMany({
    where: dateFilter ? { createdAt: dateFilter } : {},
    include: { marca: { select: { nombre: true } } },
    orderBy: { createdAt: 'desc' },
  })
  const headers = ['OM ID', 'Marca', 'Tipo prenda', 'Cantidad', 'Estado', 'Monto total', 'Fecha creacion', 'Fecha objetivo']
  const filas = pedidos.map(p => [
    p.omId, p.marca.nombre, p.tipoPrenda, String(p.cantidad), p.estado,
    String(p.montoTotal ?? ''), fechaStr(p.createdAt), fechaStr(p.fechaObjetivo),
  ])
  return { headers, filas, hojas: [{ nombre: 'Pedidos', headers, filas }] }
}

async function obtenerDenuncias(filtros: Filtros): Promise<DataExporte> {
  const dateFilter = buildDateFilter(filtros.desde, filtros.hasta)
  const denuncias = await prisma.denuncia.findMany({
    where: dateFilter ? { createdAt: dateFilter } : {},
    orderBy: { createdAt: 'desc' },
  })
  const headers = ['Tipo', 'Estado', 'Anonima', 'Fecha recepcion', 'Ultima actualizacion']
  const filas = denuncias.map(d => [
    d.tipo, d.estado, d.anonima ? 'Si' : 'No', fechaStr(d.createdAt), fechaStr(d.updatedAt),
  ])
  return { headers, filas, hojas: [{ nombre: 'Denuncias', headers, filas }] }
}

// --- DISPATCHER ---
const TIPOS_VALIDOS = ['talleres', 'marcas', 'validaciones', 'demanda', 'resumen', 'mensual', 'capacitaciones', 'acompanamiento', 'pedidos', 'denuncias'] as const

export type TipoExporte = (typeof TIPOS_VALIDOS)[number]

export function esTipoValido(tipo: string): tipo is TipoExporte {
  return (TIPOS_VALIDOS as readonly string[]).includes(tipo)
}

export async function obtenerDataExporte(tipo: TipoExporte, filtros: Filtros): Promise<DataExporte> {
  switch (tipo) {
    case 'talleres': return obtenerTalleres(filtros)
    case 'marcas': return obtenerMarcas(filtros)
    case 'validaciones': return obtenerValidaciones(filtros)
    case 'demanda': return obtenerDemanda(filtros)
    case 'resumen': return obtenerResumen(filtros)
    case 'mensual': return obtenerInformeMensual(filtros)
    case 'capacitaciones': return obtenerCapacitaciones(filtros)
    case 'acompanamiento': return obtenerAcompanamiento()
    case 'pedidos': return obtenerPedidos(filtros)
    case 'denuncias': return obtenerDenuncias(filtros)
  }
}
