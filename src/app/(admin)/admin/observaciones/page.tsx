export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { redirect } from 'next/navigation'
import { Badge } from '@/compartido/componentes/ui/badge'
import { EmptyState } from '@/compartido/componentes/ui/empty-state'
import { Plus, Download, Star } from 'lucide-react'
import type { TipoObservacion, FuenteObservacion, Sentimiento } from '@prisma/client'

const TIPO_LABELS: Record<TipoObservacion, string> = {
  RESISTENCIA: 'Resistencia',
  EXPECTATIVA: 'Expectativa',
  DIFICULTAD_TECNICA: 'Dificultad tecnica',
  DIFICULTAD_PROCESO: 'Dificultad proceso',
  OPORTUNIDAD: 'Oportunidad',
  EXITO: 'Exito',
  CONTEXTO_TALLER: 'Contexto taller',
  CONTEXTO_MARCA: 'Contexto marca',
  POLITICA_PUBLICA: 'Politica publica',
}

const TIPO_COLORS: Record<TipoObservacion, string> = {
  RESISTENCIA: 'error',
  EXPECTATIVA: 'warning',
  DIFICULTAD_TECNICA: 'error',
  DIFICULTAD_PROCESO: 'warning',
  OPORTUNIDAD: 'default',
  EXITO: 'success',
  CONTEXTO_TALLER: 'muted',
  CONTEXTO_MARCA: 'muted',
  POLITICA_PUBLICA: 'outline',
} as Record<TipoObservacion, string>

const FUENTE_LABELS: Record<FuenteObservacion, string> = {
  VISITA: 'Visita',
  LLAMADA: 'Llamada',
  WHATSAPP: 'WhatsApp',
  PLATAFORMA: 'Plataforma',
  ENTREVISTA: 'Entrevista',
  OTROS: 'Otros',
}

const SENTIMIENTO_ICONS: Record<Sentimiento, { label: string; color: string }> = {
  POSITIVO: { label: 'Positivo', color: 'text-green-600' },
  NEUTRAL: { label: 'Neutral', color: 'text-gray-500' },
  NEGATIVO: { label: 'Negativo', color: 'text-red-600' },
}

export default async function ObservacionesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const params = await Promise.resolve(searchParams ?? {}) as Record<string, string | undefined>
  const tipo = params.tipo || undefined
  const fuente = params.fuente || undefined
  const sentimiento = params.sentimiento || undefined
  const tags = params.tags || undefined
  const periodo = params.periodo || '30d'

  const where: Record<string, unknown> = {}
  if (tipo) where.tipo = tipo
  if (fuente) where.fuente = fuente
  if (sentimiento) where.sentimiento = sentimiento
  if (tags) {
    where.tags = { hasSome: tags.split(',').map((t: string) => t.trim()) }
  }

  if (periodo && periodo !== 'todos') {
    const now = new Date()
    let desde: Date | undefined
    switch (periodo) {
      case '7d': desde = new Date(now.getTime() - 7 * 86400000); break
      case '30d': desde = new Date(now.getTime() - 30 * 86400000); break
      case '90d': desde = new Date(now.getTime() - 90 * 86400000); break
      case '6m': desde = new Date(now.getTime() - 180 * 86400000); break
    }
    if (desde) where.fechaEvento = { gte: desde }
  }

  const observaciones = await prisma.observacionCampo.findMany({
    where,
    include: {
      autor: { select: { name: true } },
      user: { select: { name: true, role: true } },
    },
    orderBy: { fechaEvento: 'desc' },
    take: 50,
  })

  const total = await prisma.observacionCampo.count({ where })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-overpass font-bold text-2xl text-brand-blue">Observaciones de campo</h1>
          <p className="text-sm text-gray-500 mt-1">Registro cualitativo del piloto para el reporte a OIT</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/api/admin/reporte-mensual"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-overpass font-semibold border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Reporte mensual
          </Link>
          <Link
            href="/admin/observaciones/nueva"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-overpass font-semibold bg-brand-blue hover:bg-blue-800 text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva observacion
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <form method="get" className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-overpass font-semibold text-gray-500 mb-1">Tipo</label>
            <select name="tipo" defaultValue={tipo ?? ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Todos</option>
              {Object.entries(TIPO_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-overpass font-semibold text-gray-500 mb-1">Fuente</label>
            <select name="fuente" defaultValue={fuente ?? ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Todas</option>
              {Object.entries(FUENTE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-overpass font-semibold text-gray-500 mb-1">Sentimiento</label>
            <select name="sentimiento" defaultValue={sentimiento ?? ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Todos</option>
              <option value="POSITIVO">Positivo</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="NEGATIVO">Negativo</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-overpass font-semibold text-gray-500 mb-1">Periodo</label>
            <select name="periodo" defaultValue={periodo} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="7d">Ultimos 7 dias</option>
              <option value="30d">Ultimos 30 dias</option>
              <option value="90d">Ultimos 90 dias</option>
              <option value="6m">Ultimos 6 meses</option>
              <option value="todos">Todos</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-overpass font-semibold text-gray-500 mb-1">Tags</label>
            <input
              name="tags"
              defaultValue={tags ?? ''}
              placeholder="cultural, fiscal..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-overpass font-semibold bg-brand-blue text-white hover:bg-blue-800 transition-colors">
            Filtrar
          </button>
        </div>
      </form>

      {/* Resultados */}
      <p className="text-sm text-gray-500">{total} observacion{total !== 1 ? 'es' : ''}</p>

      {observaciones.length === 0 ? (
        <EmptyState
          titulo="Sin observaciones"
          mensaje="No hay observaciones de campo que coincidan con los filtros. Registra la primera."
          accion={{ texto: 'Nueva observacion', href: '/admin/observaciones/nueva' }}
        />
      ) : (
        <div className="space-y-3">
          {observaciones.map(obs => (
            <Link
              key={obs.id}
              href={`/admin/observaciones/${obs.id}/editar`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-blue/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge
                      variant={TIPO_COLORS[obs.tipo] as 'default' | 'success' | 'warning' | 'error' | 'outline' | 'muted'}
                      className="text-xs px-2 py-0.5"
                    >
                      {TIPO_LABELS[obs.tipo]}
                    </Badge>
                    <span className="text-xs text-gray-400">{FUENTE_LABELS[obs.fuente]}</span>
                    {obs.sentimiento && (
                      <span className={`text-xs font-medium ${SENTIMIENTO_ICONS[obs.sentimiento].color}`}>
                        {SENTIMIENTO_ICONS[obs.sentimiento].label}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5 text-xs text-amber-500">
                      {Array.from({ length: obs.importancia }, (_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </span>
                  </div>
                  <h3 className="font-overpass font-semibold text-gray-900 truncate">{obs.titulo}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{obs.contenido}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{obs.autor?.name ?? 'Autor desconocido'}</span>
                    <span>{new Date(obs.fechaEvento).toLocaleDateString('es-AR')}</span>
                    {obs.user && (
                      <span>Sobre: {obs.user.name ?? 'Usuario'} ({obs.user.role})</span>
                    )}
                  </div>
                  {obs.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {obs.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
