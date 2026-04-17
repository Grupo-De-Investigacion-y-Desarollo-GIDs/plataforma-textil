import { CheckCircle, Info, XCircle, TrendingUp, Package, FileText } from 'lucide-react'

interface ActivityEvent {
  id: string
  accion: string
  timestamp: Date | string
  user?: { name: string | null } | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detalles?: any
}

interface ActivityTimelineProps {
  eventos: ActivityEvent[]
  perspective?: 'marca' | 'taller'
}

const iconByAction: Record<string, { icon: typeof Info; color: string }> = {
  PEDIDO_PUBLICADO: { icon: Package, color: 'text-blue-500 bg-blue-50' },
  COTIZACION_RECIBIDA: { icon: FileText, color: 'text-blue-500 bg-blue-50' },
  COTIZACION_ACEPTADA: { icon: CheckCircle, color: 'text-green-500 bg-green-50' },
  COTIZACION_RECHAZADA: { icon: XCircle, color: 'text-red-500 bg-red-50' },
  ORDEN_CREADA: { icon: Package, color: 'text-blue-500 bg-blue-50' },
  ORDEN_ACEPTADA: { icon: CheckCircle, color: 'text-green-500 bg-green-50' },
  ORDEN_RECHAZADA: { icon: XCircle, color: 'text-red-500 bg-red-50' },
  PROGRESO_ACTUALIZADO: { icon: TrendingUp, color: 'text-yellow-500 bg-yellow-50' },
  ORDEN_COMPLETADA: { icon: CheckCircle, color: 'text-green-500 bg-green-50' },
  PEDIDO_COMPLETADO: { icon: CheckCircle, color: 'text-green-500 bg-green-50' },
  PEDIDO_CANCELADO: { icon: XCircle, color: 'text-red-500 bg-red-50' },
}

const labelsMarca: Record<string, (d?: Record<string, unknown> | null) => string> = {
  PEDIDO_PUBLICADO: () => 'Pedido publicado — en busqueda de taller',
  COTIZACION_RECIBIDA: (d) => `Cotizacion recibida de ${d?.tallerNombre ?? 'un taller'}`,
  COTIZACION_ACEPTADA: (d) => `Cotizacion aceptada de ${d?.tallerNombre ?? 'un taller'} — orden creada`,
  COTIZACION_RECHAZADA: (d) => `Cotizacion de ${d?.tallerNombre ?? 'un taller'} rechazada`,
  ORDEN_CREADA: () => 'Orden de manufactura creada',
  ORDEN_ACEPTADA: () => 'Taller acepto la orden',
  ORDEN_RECHAZADA: () => 'Taller rechazo la orden',
  PROGRESO_ACTUALIZADO: (d) => `Progreso actualizado a ${d?.progreso ?? '?'}%`,
  ORDEN_COMPLETADA: () => 'Orden completada por el taller',
  PEDIDO_COMPLETADO: () => 'Pedido completado',
  PEDIDO_CANCELADO: () => 'Pedido cancelado',
}

const labelsTaller: Record<string, (d?: Record<string, unknown> | null) => string> = {
  COTIZACION_ACEPTADA: () => 'Tu cotizacion fue aceptada',
  COTIZACION_RECHAZADA: () => 'Tu cotizacion fue rechazada',
  ORDEN_CREADA: () => 'Orden asignada a tu taller',
  ORDEN_ACEPTADA: () => 'Aceptaste la orden',
  ORDEN_RECHAZADA: () => 'Rechazaste la orden',
  PROGRESO_ACTUALIZADO: (d) => `Actualizaste el progreso a ${d?.progreso ?? '?'}%`,
  ORDEN_COMPLETADA: () => 'Marcaste la orden como completada',
}

function timeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'hace un momento'
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `hace ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `hace ${diffDays}d`
  return date.toLocaleDateString('es-AR')
}

export function ActivityTimeline({ eventos, perspective = 'marca' }: ActivityTimelineProps) {
  const labels = perspective === 'taller' ? labelsTaller : labelsMarca

  return (
    <div className="space-y-0">
      {eventos.map((ev, i) => {
        const config = iconByAction[ev.accion] ?? { icon: Info, color: 'text-gray-400 bg-gray-50' }
        const Icon = config.icon
        const labelFn = labels[ev.accion]
        const label = labelFn ? labelFn(ev.detalles as Record<string, unknown> | null) : ev.accion
        const date = new Date(ev.timestamp)
        const isLast = i === eventos.length - 1

        return (
          <div key={ev.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
            </div>
            <div className={`pb-4 ${isLast ? '' : ''}`}>
              <p className="text-sm text-gray-800">{label}</p>
              <p className="text-xs text-gray-400" title={date.toLocaleString('es-AR')}>
                {timeAgo(date)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
