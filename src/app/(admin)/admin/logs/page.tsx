'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/compartido/componentes/ui/card'
import { Button } from '@/compartido/componentes/ui/button'
import { Select } from '@/compartido/componentes/ui/select'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Download, ChevronDown, ChevronUp } from 'lucide-react'

interface LogEntry {
  id: string
  accion: string
  detalles: Record<string, unknown> | null
  timestamp: string
  user: { name: string | null; email: string; role: string } | null
}

interface FilterUser {
  id: string
  name: string | null
  email: string
  role: string
}

// Sensibilidad por accion
const sensibilidad: Record<string, { nivel: string; variant: 'error' | 'warning' | 'default' | 'muted' }> = {
  VALIDACION_REVOCADA: { nivel: 'Critica', variant: 'error' },
  CERTIFICADO_REVOCADO: { nivel: 'Critica', variant: 'error' },
  ADMIN_USUARIO_CREADO: { nivel: 'Alta', variant: 'warning' },
  ADMIN_USUARIO_EDITADO: { nivel: 'Alta', variant: 'warning' },
  ADMIN_USUARIO_DESACTIVADO: { nivel: 'Alta', variant: 'warning' },
  VALIDACION_APROBADA: { nivel: 'Alta', variant: 'warning' },
  VALIDACION_RECHAZADA: { nivel: 'Alta', variant: 'warning' },
  CERTIFICADO_EMITIDO: { nivel: 'Alta', variant: 'warning' },
  DATOS_EXPORTADOS: { nivel: 'Alta', variant: 'warning' },
  ADMIN_VALIDACION_COMPLETADO: { nivel: 'Alta', variant: 'warning' },
  ADMIN_VALIDACION_RECHAZADO: { nivel: 'Alta', variant: 'warning' },
  ADMIN_TALLER_EDITADO: { nivel: 'Media', variant: 'default' },
  COLECCION_EDITADA: { nivel: 'Media', variant: 'default' },
  COLECCION_ELIMINADA: { nivel: 'Media', variant: 'default' },
  NOTA_INTERNA_CREADA: { nivel: 'Media', variant: 'default' },
  RAG_DOCUMENTO_CREADO: { nivel: 'Media', variant: 'default' },
  RAG_DOCUMENTO_DESACTIVADO: { nivel: 'Media', variant: 'default' },
}

const entidades = [
  { value: '', label: 'Todas las entidades' },
  { value: 'usuario', label: 'Usuario' },
  { value: 'taller', label: 'Taller' },
  { value: 'validacion', label: 'Validacion' },
  { value: 'certificado', label: 'Certificado' },
  { value: 'coleccion', label: 'Coleccion' },
  { value: 'nota', label: 'Nota' },
  { value: 'rag', label: 'Documento RAG' },
  { value: 'exportacion', label: 'Exportacion' },
]

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [filtroAccion, setFiltroAccion] = useState('')
  const [filtroEntidad, setFiltroEntidad] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  // Datos para dropdowns
  const [acciones, setAcciones] = useState<string[]>([])
  const [usuarios, setUsuarios] = useState<FilterUser[]>([])

  // Detalle expandido
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const pageSize = 50
  const totalPages = Math.ceil(total / pageSize)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(pageSize))
    if (filtroUsuario) params.set('userId', filtroUsuario)
    if (filtroAccion) params.set('accion', filtroAccion)
    if (filtroEntidad) params.set('entidad', filtroEntidad)
    if (desde) params.set('desde', desde)
    if (hasta) params.set('hasta', hasta)

    try {
      const res = await fetch(`/api/admin/logs?${params}`)
      const data = await res.json()
      setLogs(data.logs || [])
      setTotal(data.total || 0)
      if (data.acciones) setAcciones(data.acciones)
      if (data.usuarios) setUsuarios(data.usuarios)
    } catch {
      // silencioso
    } finally {
      setLoading(false)
    }
  }, [page, filtroUsuario, filtroAccion, filtroEntidad, desde, hasta])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  function resetFiltros() {
    setFiltroUsuario('')
    setFiltroAccion('')
    setFiltroEntidad('')
    setDesde('')
    setHasta('')
    setPage(1)
  }

  function exportCsv() {
    const params = new URLSearchParams()
    params.set('export', 'csv')
    if (filtroUsuario) params.set('userId', filtroUsuario)
    if (filtroAccion) params.set('accion', filtroAccion)
    if (filtroEntidad) params.set('entidad', filtroEntidad)
    if (desde) params.set('desde', desde)
    if (hasta) params.set('hasta', hasta)
    window.open(`/api/admin/logs?${params}`, '_blank')
  }

  function getSensibilidad(accion: string) {
    return sensibilidad[accion] || { nivel: 'Baja', variant: 'muted' as const }
  }

  const hayFiltros = filtroUsuario || filtroAccion || filtroEntidad || desde || hasta

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-overpass font-bold text-2xl text-brand-blue">Logs de Actividad</h1>
        <Button size="sm" variant="secondary" onClick={exportCsv}>
          <Download className="w-4 h-4 mr-1" /> Exportar CSV
        </Button>
      </div>
      <p className="text-gray-500 text-sm mb-6">Registro de acciones sensibles en la plataforma</p>

      {/* Filtros */}
      <Card className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Select
            value={filtroUsuario}
            onChange={e => { setFiltroUsuario(e.target.value); setPage(1) }}
            options={[
              { value: '', label: 'Todos los usuarios' },
              ...usuarios.map(u => ({ value: u.id, label: `${u.name || u.email} (${u.role})` })),
            ]}
          />
          <Select
            value={filtroAccion}
            onChange={e => { setFiltroAccion(e.target.value); setPage(1) }}
            options={[
              { value: '', label: 'Todas las acciones' },
              ...acciones.map(a => ({ value: a, label: a.replace(/_/g, ' ') })),
            ]}
          />
          <Select
            value={filtroEntidad}
            onChange={e => { setFiltroEntidad(e.target.value); setPage(1) }}
            options={entidades}
          />
          <div>
            <input
              type="date"
              value={desde}
              onChange={e => { setDesde(e.target.value); setPage(1) }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="Desde"
            />
          </div>
          <div>
            <input
              type="date"
              value={hasta}
              onChange={e => { setHasta(e.target.value); setPage(1) }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="Hasta"
            />
          </div>
        </div>
        {hayFiltros && (
          <button onClick={resetFiltros} className="mt-2 text-xs text-brand-blue hover:underline">
            Limpiar filtros
          </button>
        )}
      </Card>

      {/* Tabla */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Usuario</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Accion</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Sensibilidad</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Entidad</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Motivo</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Cargando...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No hay logs para mostrar</td></tr>
              ) : logs.map(log => {
                const detalles = log.detalles as Record<string, unknown> | null
                const sens = getSensibilidad(log.accion)
                const entidad = detalles?.entidad as string | undefined
                const motivo = detalles?.motivo as string | undefined
                const isExpanded = expandedId === log.id
                return (
                  <>
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.user?.name || log.user?.email || 'Sistema'}
                      {log.user?.role && (
                        <span className="text-xs text-gray-400 ml-1">({log.user.role})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-xs">
                      {log.accion}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={sens.variant} className="text-xs px-2 py-0.5">
                        {sens.nivel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {entidad || <span className="text-gray-300 text-xs">sin datos</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-48 truncate">
                      {motivo || <span className="text-gray-300 text-xs">sin datos</span>}
                    </td>
                    <td className="px-4 py-3">
                      {detalles && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </tr>
                  {isExpanded && detalles && (
                    <tr key={`${log.id}-detail`} className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                          {Object.entries(detalles).map(([key, val]) => (
                            <div key={key}>
                              <span className="text-xs font-semibold text-gray-500">{key}:</span>{' '}
                              <span className="text-xs text-gray-700">
                                {typeof val === 'object' && val !== null
                                  ? Object.entries(val as Record<string, unknown>)
                                      .filter(([, v]) => v !== undefined && v !== null)
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(', ')
                                  : String(val ?? '-')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Paginacion */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-4 pb-2">
            <span className="text-sm text-gray-500">
              {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} de {total}
            </span>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded text-sm disabled:opacity-50 hover:bg-gray-100"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded text-sm disabled:opacity-50 hover:bg-gray-100"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
