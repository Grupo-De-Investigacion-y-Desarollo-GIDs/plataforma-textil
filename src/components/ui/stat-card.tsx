import { cn } from '@/lib/utils'

type StatVariant = 'success' | 'warning' | 'muted'

interface StatCardProps {
  value: string
  label: string
  variant?: StatVariant
  className?: string
}

const variantStyles: Record<StatVariant, { text: string; bar: string }> = {
  success: { text: 'text-status-success', bar: 'bg-status-success' },
  warning: { text: 'text-status-warning', bar: 'bg-status-warning' },
  muted: { text: 'text-status-muted', bar: 'bg-status-muted' },
}

export function StatCard({ value, label, variant = 'success', className }: StatCardProps) {
  const styles = variantStyles[variant]
  return (
    <div className={cn('text-center', className)}>
      <div className={cn('text-3xl font-overpass font-bold', styles.text)}>{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{label}</div>
      <div className={cn('w-full h-1 rounded mt-2', styles.bar)} />
    </div>
  )
}
