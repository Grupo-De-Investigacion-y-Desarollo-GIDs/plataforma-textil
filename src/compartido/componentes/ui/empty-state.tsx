import Link from 'next/link'
import { cn } from '@/compartido/lib/utils'
import { Button } from './button'

interface EmptyStateProps {
  titulo: string
  mensaje: string
  accion?: {
    texto: string
    href?: string
    onClick?: () => void
  }
  variant?: 'default' | 'highlighted'
  icon?: React.ReactNode | string
}

export function EmptyState({ titulo, mensaje, accion, variant = 'default', icon }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'text-center py-12 px-4 rounded-card',
        variant === 'highlighted' && 'bg-pastel-blue border border-brand-blue/20'
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-pastel-blue mx-auto flex items-center justify-center mb-4">
          {typeof icon === 'string' ? (
            <span className="text-2xl">{icon}</span>
          ) : (
            icon
          )}
        </div>
      )}
      <h3 className="font-overpass font-bold text-ink-primary text-lg mb-2">{titulo}</h3>
      <p className="text-sm text-ink-secondary mb-6 max-w-md mx-auto">{mensaje}</p>

      {accion && (
        accion.href ? (
          <Link href={accion.href}>
            <Button size="sm">{accion.texto}</Button>
          </Link>
        ) : (
          <Button size="sm" onClick={accion.onClick}>{accion.texto}</Button>
        )
      )}
    </div>
  )
}
