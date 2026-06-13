import { cn } from '@/compartido/lib/utils'

type IconColor = 'blue' | 'green' | 'purple' | 'terra' | 'yellow'
type TrendDirection = 'up' | 'down' | 'neutral'

interface KpiCardProps {
  label: string
  value: string | number
  unit?: string
  icon?: React.ReactNode
  iconColor?: IconColor
  delta?: { value: string; trend: TrendDirection }
  footnote?: string
  className?: string
}

const iconBg: Record<IconColor, string> = {
  blue: 'bg-pastel-blue text-brand-blue',
  green: 'bg-pastel-green text-green-700',
  purple: 'bg-pastel-purple text-purple-700',
  terra: 'bg-pastel-terra text-terra-600',
  yellow: 'bg-pastel-yellow text-yellow-700',
}

const deltaColor: Record<TrendDirection, string> = {
  up: 'text-status-success',
  down: 'text-status-error',
  neutral: 'text-ink-muted',
}

export function KpiCard({ label, value, unit, icon, iconColor = 'blue', delta, footnote, className }: KpiCardProps) {
  return (
    <div className={cn('bg-white rounded-card p-5 shadow-card border border-gray-100', className)}>
      <div className="flex items-center justify-between mb-3">
        {icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg[iconColor])}>
            {icon}
          </div>
        )}
        {delta && (
          <span className={cn('text-[10px] font-bold font-overpass flex items-center gap-1', deltaColor[delta.trend])}>
            {delta.trend === 'up' && (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 8l4-4 4 4" />
              </svg>
            )}
            {delta.trend === 'down' && (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4l4 4 4-4" />
              </svg>
            )}
            {delta.value}
          </span>
        )}
      </div>
      <p className="text-xs uppercase tracking-wider text-ink-muted font-overpass font-bold">{label}</p>
      <p className="font-serif font-bold text-4xl text-ink-primary mt-1">
        {value}
        {unit && <span className="text-lg text-ink-muted font-medium ml-1">{unit}</span>}
      </p>
      {footnote && <p className="text-[10px] text-ink-muted mt-1">{footnote}</p>}
    </div>
  )
}
