export const dynamic = 'force-dynamic'

import { prisma } from '@/compartido/lib/prisma'
import { requiereRol } from '@/compartido/lib/permisos'
import { Card } from '@/compartido/componentes/ui/card'
import { Badge } from '@/compartido/componentes/ui/badge'
import { Button } from '@/compartido/componentes/ui/button'
import { Download } from 'lucide-react'

const ACCIONES_VALIDACION = [
  'VALIDACION_APROBADA', 'VALIDACION_RECHAZADA', 'VALIDACION_REVOCADA',
  'ESTADO_VALIDACION_APROBADA', 'ESTADO_VALIDACION_RECHAZADA', 'ESTADO_VALIDACION_REVOCADA',
  'ADMIN_VALIDACION_COMPLETADO', 'ADMIN_VALIDACION_RECHAZADO',
  'NIVEL_SUBIDO', 'NIVEL_BAJADO',
]

export default async function EstadoAuditoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; desde?: string; hasta?: string; accion?: string }>
}) {
  await requiereRol(['ESTADO', 'ADMIN'])

  const { page: pageParam, desde, hasta, accion } = await searchParams
  const page = parseInt(pageParam || '1')
  const pageSize = 50

  const where: Record<string, unknown> = {
    accion: accion ? { equals: accion } : { in: ACCIONES_VALIDACION },
  }

  if (desde || hasta) {
    const timestamp: Record<string, Date> = {}
    if (desde) timestamp.gte = new Date(desde)
    if (hasta) {
      const hastaDate = new Date(hasta)
      hastaDate.setHours(23, 59, 59, 999)
      timestamp.lte = hastaDate
    }
    where.timestamp = timestamp
  }

  const [logs, total] = await Promise.all([
    prisma.logActividad.findMany({
      where,
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.logActividad.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  // Construir URL de export
  const exportParams = new URLSearchParams()
  exportParams.set('export', 'csv')
  exportParams.set('entidad', 'validacion')
  if (desde) exportParams.set('desde', desde)
  if (hasta) exportParams.set('hasta', hasta)

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-overpass font-bold text-2xl text-brand-blue">Auditorias de Formalizacion</h1>
        <a href={`/api/admin/logs?${exportParams}`} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="secondary">
            <Download className="w-4 h-4 mr-1" /> Exportar CSV
          </Button>
        </a>
      </div>
      <p className="text-gray-500 text-sm mb-6">Historial de decisiones sobre documentos de formalizacion</p>

      {/* Filtros */}
      <Card className="mb-4">
        <form method="get" className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select name="accion" defaultValue={accion || ''} className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
            <option value="">Todas las acciones</option>
            {ACCIONES_VALIDACION.map(a => (
              <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <input
            type="date"
            name="desde"
            defaultValue={desde || ''}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          <input
            type="date"
            name="hasta"
            defaultValue={hasta || ''}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90">Filtrar</button>
            <a href="/estado/auditorias" className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200">Limpiar</a>
          </div>
        </form>
      </Card>

      {/* Tabla */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Actor</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Accion</th>
                <th className="text-left px-4 py-3 text-sm font-overpass font-semibold text-gray-600">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No hay auditorias para mostrar.</td></tr>
              ) : logs.map(log => {
                const detalles = log.detalles as Record<string, unknown> | null
                const esEstado = log.accion.startsWith('ESTADO_')
                const tipoDoc = detalles?.tipoDocumento as string | undefined
                const motivo = detalles?.motivo as string | undefined
                const tallerId = detalles?.tallerId as string | undefined
                return (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.user?.name || log.user?.email || 'Sistema'}
                      {log.user?.role && (
                        <Badge variant={esEstado ? 'default' : 'muted'} className="ml-1 text-xs px-1.5 py-0">
                          {log.user.role}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-xs">
                      {log.accion.replace(/^ESTADO_/, '').replace(/^ADMIN_/, '')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>
                        {tipoDoc && <span className="font-medium">{tipoDoc}</span>}
                        {motivo && <span className="text-gray-400 ml-1">— {motivo}</span>}
                        {tallerId && (
                          <a href={`/estado/talleres/${tallerId}`} className="text-brand-blue hover:underline text-xs ml-2">
                            Ver taller
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
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
              {page > 1 && (
                <a href={`?page=${page - 1}${accion ? `&accion=${accion}` : ''}${desde ? `&desde=${desde}` : ''}${hasta ? `&hasta=${hasta}` : ''}`}
                  className="px-3 py-1 rounded text-sm hover:bg-gray-100">
                  Anterior
                </a>
              )}
              {page < totalPages && (
                <a href={`?page=${page + 1}${accion ? `&accion=${accion}` : ''}${desde ? `&desde=${desde}` : ''}${hasta ? `&hasta=${hasta}` : ''}`}
                  className="px-3 py-1 rounded text-sm hover:bg-gray-100">
                  Siguiente
                </a>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
