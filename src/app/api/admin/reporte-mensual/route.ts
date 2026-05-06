import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { apiHandler, errorAuthRequired, errorForbidden } from '@/compartido/lib/api-errors'
import { generarXlsx, type HojaExportable } from '@/compartido/lib/exportes'
import { calcularEtapa, ETAPA_LABELS, type EtapaOnboarding } from '@/compartido/lib/onboarding'
import { exportarMotivosCSV } from '@/compartido/lib/demanda-insatisfecha'
import { logAccionAdmin } from '@/compartido/lib/log'

function fechaStr(d: Date | null | undefined): string {
  return d ? d.toLocaleDateString('es-AR') : ''
}

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) return errorAuthRequired()
  if (!['ADMIN', 'ESTADO'].includes(session.user.role)) return errorForbidden('ADMIN o ESTADO')

  const mesParam = req.nextUrl.searchParams.get('mes')
  const ahora = new Date()
  let desde: Date
  let hasta: Date

  if (mesParam && /^\d{4}-\d{2}$/.test(mesParam)) {
    const [y, m] = mesParam.split('-').map(Number)
    desde = new Date(y, m - 1, 1)
    hasta = new Date(y, m, 0, 23, 59, 59)
  } else {
    desde = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    hasta = ahora
  }

  const mesLabel = desde.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const dateFilter = { gte: desde, lte: hasta }

  // --- Metricas plataforma ---
  const [totalTalleres, totalMarcas, totalPedidos, pedidosCompletados,
    totalCotizaciones, cotAceptadas, docsAprobados, motivosCount] = await Promise.all([
    prisma.taller.count(),
    prisma.marca.count(),
    prisma.pedido.count({ where: { createdAt: dateFilter } }),
    prisma.pedido.count({ where: { estado: 'COMPLETADO', createdAt: dateFilter } }),
    prisma.cotizacion.count({ where: { createdAt: dateFilter } }),
    prisma.cotizacion.count({ where: { estado: 'ACEPTADA', createdAt: dateFilter } }),
    prisma.validacion.count({ where: { estado: 'COMPLETADO', createdAt: dateFilter } }),
    prisma.motivoNoMatch.count({ where: { createdAt: dateFilter } }),
  ])

  const tasaGlobal = totalCotizaciones > 0 ? Math.round((cotAceptadas / totalCotizaciones) * 100) : 0

  const hojaMetricas: HojaExportable = {
    nombre: 'Metricas plataforma',
    headers: ['Metrica', 'Valor'],
    filas: [
      ['Total talleres (acumulado)', totalTalleres],
      ['Total marcas (acumulado)', totalMarcas],
      ['Pedidos creados en el mes', totalPedidos],
      ['Pedidos completados en el mes', pedidosCompletados],
      ['Cotizaciones enviadas', totalCotizaciones],
      ['Cotizaciones aceptadas', cotAceptadas],
      ['Tasa aceptacion', `${tasaGlobal}%`],
      ['Documentos aprobados', docsAprobados],
      ['Pedidos sin match (demanda insatisfecha)', motivosCount],
    ],
  }

  // --- Etapas de onboarding ---
  const usuarios = await prisma.user.findMany({
    where: { role: { in: ['TALLER', 'MARCA'] }, active: true },
    select: { id: true, name: true, email: true, role: true },
  })

  const etapas = await Promise.all(
    usuarios.map(async u => ({ ...u, etapa: await calcularEtapa(u.id, u.role) }))
  )

  const conteos: Record<EtapaOnboarding, number> = {
    INVITADO: 0, REGISTRADO: 0, PERFIL_COMPLETO: 0, ACTIVO: 0, INACTIVO: 0,
  }
  for (const u of etapas) conteos[u.etapa]++

  const hojaOnboarding: HojaExportable = {
    nombre: 'Etapas onboarding',
    headers: ['Etapa', 'Cantidad', 'Porcentaje'],
    filas: Object.entries(conteos).map(([etapa, count]) => [
      ETAPA_LABELS[etapa as EtapaOnboarding],
      count,
      usuarios.length > 0 ? `${Math.round((count / usuarios.length) * 100)}%` : '0%',
    ]),
  }

  // --- Demanda insatisfecha ---
  const motivos = await exportarMotivosCSV(desde, hasta)
  const hojaDemanda: HojaExportable = {
    nombre: 'Demanda insatisfecha',
    headers: ['Fecha', 'Marca', 'Tipo prenda', 'Cantidad', 'Presupuesto', 'Motivo', 'Talleres cerca'],
    filas: motivos.map(m => [
      String(m.fecha), String(m.marca), String(m.tipoPrenda),
      String(m.cantidad), String(m.presupuesto),
      String(m.motivoCategoria), String(m.talleresCerca),
    ]),
  }

  // --- Observaciones del mes ---
  const observaciones = await prisma.observacionCampo.findMany({
    where: { fechaEvento: dateFilter },
    include: {
      autor: { select: { name: true } },
      user: { select: { name: true, role: true } },
    },
    orderBy: [{ importancia: 'desc' }, { fechaEvento: 'desc' }],
  })

  const hojaObservaciones: HojaExportable = {
    nombre: 'Observaciones',
    headers: ['Fecha', 'Tipo', 'Fuente', 'Sentimiento', 'Importancia', 'Titulo', 'Contenido', 'Autor', 'Sobre', 'Tags'],
    filas: observaciones.map(o => [
      fechaStr(o.fechaEvento),
      o.tipo, o.fuente, o.sentimiento ?? '', o.importancia,
      o.titulo, o.contenido.slice(0, 500),
      o.autor?.name ?? 'Desconocido',
      o.user ? `${o.user.name ?? ''} (${o.user.role})` : '',
      o.tags.join(', '),
    ]),
  }

  // --- Resumen ejecutivo ---
  const positivas = observaciones.filter(o => o.sentimiento === 'POSITIVO').sort((a, b) => b.importancia - a.importancia).slice(0, 5)
  const problemas = observaciones.filter(o => o.sentimiento === 'NEGATIVO').sort((a, b) => b.importancia - a.importancia).slice(0, 5)
  const oportunidades = observaciones.filter(o => o.tipo === 'OPORTUNIDAD').sort((a, b) => b.importancia - a.importancia).slice(0, 5)

  const hojaResumen: HojaExportable = {
    nombre: 'Resumen ejecutivo',
    headers: ['Categoria', 'Titulo', 'Contenido'],
    filas: [
      ['--- TOP 5 POSITIVAS ---', '', ''],
      ...positivas.map(o => ['Positiva', o.titulo, o.contenido.slice(0, 300)] as [string, string, string]),
      ['', '', ''],
      ['--- TOP 5 PROBLEMAS ---', '', ''],
      ...problemas.map(o => ['Problema', o.titulo, o.contenido.slice(0, 300)] as [string, string, string]),
      ['', '', ''],
      ['--- OPORTUNIDADES ---', '', ''],
      ...oportunidades.map(o => ['Oportunidad', o.titulo, o.contenido.slice(0, 300)] as [string, string, string]),
    ],
  }

  const hojas: HojaExportable[] = [
    hojaMetricas,
    hojaOnboarding,
    hojaDemanda,
    hojaObservaciones,
    hojaResumen,
  ]

  const buffer = await generarXlsx(hojas, {
    titulo: 'Reporte Mensual — Plataforma Digital Textil',
    subtitulo: `Periodo: ${mesLabel}`,
  })

  logAccionAdmin('REPORTE_MENSUAL_GENERADO', session.user.id, {
    entidad: 'exportacion',
    entidadId: mesParam ?? 'current',
    metadata: { mes: mesLabel },
  })

  const filename = `reporte-mensual-${desde.getFullYear()}-${String(desde.getMonth() + 1).padStart(2, '0')}.xlsx`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
})
