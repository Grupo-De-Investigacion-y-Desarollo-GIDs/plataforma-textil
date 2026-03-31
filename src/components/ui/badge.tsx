import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'outline' | 'muted'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-brand-blue text-white',
  success: 'bg-status-success text-white',
  warning: 'bg-status-warning text-white',
  error: 'bg-status-error text-white',
  outline: 'border-2 border-status-warning text-status-warning bg-transparent',
  muted: 'bg-gray-100 text-gray-600',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-4 py-2 rounded-full font-overpass font-semibold text-sm',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
