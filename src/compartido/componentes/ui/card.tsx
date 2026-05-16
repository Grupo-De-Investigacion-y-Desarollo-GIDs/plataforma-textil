import { cn } from '@/compartido/lib/utils'

type AccentColor = 'blue' | 'green' | 'purple' | 'terra' | 'yellow'

interface CardProps {
  children: React.ReactNode
  title?: React.ReactNode
  description?: string
  footer?: React.ReactNode
  accent?: AccentColor
  className?: string
}

const accentColors: Record<AccentColor, string> = {
  blue: 'bg-brand-blue',
  green: 'bg-green-700',
  purple: 'bg-purple-700',
  terra: 'bg-terra-600',
  yellow: 'bg-yellow-600',
}

export function Card({ children, title, description, footer, accent, className }: CardProps) {
  return (
    <div className={cn('bg-white rounded-card shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover transition-shadow', className)}>
      {accent && <div className={cn('h-[3px]', accentColors[accent])} />}
      <div className="p-6">
        {title && (
          <div className="mb-4">
            <h3 className="font-overpass font-bold text-ink-primary text-lg">{title}</h3>
            {description && <p className="text-sm text-ink-secondary mt-1">{description}</p>}
          </div>
        )}
        {children}
        {footer && <div className="mt-4 pt-4 border-t border-gray-100">{footer}</div>}
      </div>
    </div>
  )
}
