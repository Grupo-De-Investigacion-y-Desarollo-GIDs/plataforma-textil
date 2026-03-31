'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface LogEntry {
  id: string
  accion: string
  detalles: Record<string, unknown> | null
  ip: string | null
  timestamp: string
  user: { name: string | null; email: string } | null
}

const tipoColors: Record<string, 'success' | 'warning' | 'default'> = {
  AUTH: 'success',
  CRUD: 'default',
  ADMIN: 'warning',
  ERROR: 'warning',
  SYSTEM: 'default',
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [search, setSearch] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    fetch('/api/admin/logs').then(r => r.json()).then((d: { logs?: LogEntry[] }) => setLogs(d.logs || [])).catch(() => {})
  }, [])

  const filtered = logs.filter(l => {
    const matchSearch = l.accion.toLowerCase().includes(search.toLowerCase()) ||
      (l.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.user?.email || '').toLowerCase().includes(search.toLowerCase())
    const matchTipo = !filtroTipo || l.accion.startsWith(filtroTipo)
    return matchSearch && matchTipo
  })

  const pageSize = 20
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="font-overpass font-bold text-2xl text-brand-blue mb-1">Logs de Actividad</h1>
      <p className="text-gray-500 text-sm mb-6">Registro de acciones en la plataforma</p>

      <SearchInput onChange={setSearch} placeholder="Buscar en logs..." className="mb-4" />

      <div className="flex gap-3 mb-4">
        <Select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          options={[
            { value: '', label: 'Todos los tipos' },
            { value: 'AUTH', label: 'Auth' },
            { value: 'CRUD', label: 'CRUD' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'ERROR', label: 'Errores' },
          ]}
        />
        <Button size="sm" variant="secondary">Exportar CSV</Button>
        <Button size="sm" variant="secondary">Exportar JSON</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Timestamp</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Usuario</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(log => {
                const tipo = log.accion.split(':')[0] || 'SYSTEM'
                return (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('es-AR')}
                      {log.ip && <div className="text-gray-400">IP: {log.ip}</div>}
                    </td>
                    <td className="px-4 py-3"><Badge variant={tipoColors[tipo] || 'default'}>{tipo}</Badge></td>
                    <td className="px-4 py-3 text-sm">{log.user?.name || log.user?.email || 'Sistema'}</td>
                    <td className="px-4 py-3 text-sm">
                      {log.accion}
                      {log.detalles && <div className="text-xs text-gray-400">{JSON.stringify(log.detalles)}</div>}
                    </td>
                  </tr>
                )
              })}
              {paged.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No hay logs para mostrar</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-4 pb-2">
            <span className="text-sm text-gray-500">{page * pageSize + 1}-{Math.min((page + 1) * pageSize, filtered.length)} de {filtered.length}</span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded text-sm disabled:opacity-50 hover:bg-gray-100">Anterior</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded text-sm disabled:opacity-50 hover:bg-gray-100">Siguiente</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
