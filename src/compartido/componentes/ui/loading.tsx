import { cn } from '@/compartido/lib/utils'

interface LoadingProps {
  variant?: 'spinner' | 'fullPage' | 'inline'
  mensaje?: string
  className?: string
}

function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }

  return (
    <div
      className={cn(
        sizes[size],
        'border-2 border-zinc-300 border-t-brand-blue rounded-full animate-spin'
      )}
      role="status"
      aria-label="Cargando"
    />
  )
}

export function Loading({ variant = 'spinner', mensaje, className }: LoadingProps) {
  if (variant === 'fullPage') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        {mensaje && <p className="text-sm text-zinc-600">{mensaje}</p>}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        <Spinner size="sm" />
        {mensaje && <span className="text-sm">{mensaje}</span>}
      </span>
    )
  }

  return (
    <div className={cn('flex items-center justify-center py-8 gap-2', className)}>
      <Spinner />
      {mensaje && <p className="text-sm text-zinc-600">{mensaje}</p>}
    </div>
  )
}
