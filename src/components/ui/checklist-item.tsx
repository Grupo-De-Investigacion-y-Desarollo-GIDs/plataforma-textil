import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ItemStatus = 'completed' | 'pending' | 'warning' | 'optional'

interface ChecklistItemProps {
  title: string
  description: string
  status: ItemStatus
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const statusConfig: Record<ItemStatus, {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  statusText: string
  statusColor: string
}> = {
  completed: { icon: CheckCircle, iconBg: 'bg-green-100', iconColor: 'text-status-success', statusText: 'COMPLETADO', statusColor: 'text-status-success' },
  pending: { icon: Clock, iconBg: 'bg-orange-100', iconColor: 'text-status-warning', statusText: 'PENDIENTE', statusColor: 'text-status-warning' },
  warning: { icon: AlertTriangle, iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600', statusText: 'ATENCIÓN', statusColor: 'text-yellow-600' },
  optional: { icon: AlertTriangle, iconBg: 'bg-gray-100', iconColor: 'text-gray-400', statusText: 'OPCIONAL', statusColor: 'text-gray-400' },
}

export function ChecklistItem({ title, description, status, actionLabel, onAction, className }: ChecklistItemProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <div className={cn('flex items-center justify-between py-4 border-b border-gray-100', className)}>
      <div className="flex items-center gap-3">
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', config.iconBg)}>
          <Icon className={cn('w-5 h-5', config.iconColor)} />
        </div>
        <div>
          <div className="font-overpass font-semibold text-brand-blue">{title}</div>
          <div className="text-sm text-gray-500">{description}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {actionLabel && onAction && (
          <button onClick={onAction} className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-overpass font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            {actionLabel}
          </button>
        )}
        <span className={cn('font-semibold text-sm', config.statusColor)}>{config.statusText}</span>
      </div>
    </div>
  )
}
