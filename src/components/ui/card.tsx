import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  title?: React.ReactNode
  description?: string
  footer?: React.ReactNode
  className?: string
}

export function Card({ children, title, description, footer, className }: CardProps) {
  return (
    <div className={cn('bg-white rounded-xl shadow-card border border-gray-100 p-6 hover:shadow-card-hover transition-shadow', className)}>
      {title && (
        <div className="mb-4">
          <h3 className="font-overpass font-bold text-brand-blue text-lg">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      {children}
      {footer && <div className="mt-4 pt-4 border-t border-gray-100">{footer}</div>}
    </div>
  )
}
