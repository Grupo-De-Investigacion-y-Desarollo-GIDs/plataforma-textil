import { cn } from '@/compartido/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'outline' | 'muted' | 'info' | 'terra'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-pastel-blue text-brand-blue',
  success: 'bg-pastel-green text-green-700',
  warning: 'bg-pastel-yellow text-yellow-700',
  error: 'bg-pastel-red text-red-700',
  info: 'bg-pastel-purple text-purple-700',
  terra: 'bg-pastel-terra text-terra-700',
  muted: 'bg-gray-100 text-ink-secondary',
  outline: 'bg-transparent border border-ink-muted/40 text-ink-secondary',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full font-overpass font-bold text-[11px] uppercase tracking-wider',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
