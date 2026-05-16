import { cn } from '@/compartido/lib/utils'

type LogoVariant = 'full' | 'icon'
type LogoSize = 'sm' | 'md' | 'lg'

interface LogoPDTProps {
  variant?: LogoVariant
  size?: LogoSize
  className?: string
}

const sizeStyles: Record<LogoSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
}

function LogoSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <circle cx={32} cy={32} r={30} fill="currentColor" opacity={0.06} />
      <path d="M14 22h36M14 32h36M14 42h36" stroke="currentColor" strokeWidth={2} strokeLinecap="round" opacity={0.4} />
      <path d="M22 14v36M32 14v36M42 14v36" stroke="currentColor" strokeWidth={2} strokeLinecap="round" opacity={0.4} />
      <circle cx={32} cy={32} r={5} fill="currentColor" />
      <circle cx={22} cy={22} r={2} fill="currentColor" />
      <circle cx={42} cy={22} r={2} fill="currentColor" />
      <circle cx={22} cy={42} r={2} fill="currentColor" />
      <circle cx={42} cy={42} r={2} fill="currentColor" />
    </svg>
  )
}

export function LogoPDT({ variant = 'full', size = 'md', className }: LogoPDTProps) {
  if (variant === 'icon') {
    return <LogoSvg className={cn(sizeStyles[size], 'text-brand-blue', className)} />
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LogoSvg className={cn(sizeStyles[size], 'text-brand-blue')} />
      <span className="font-overpass font-bold text-ink-primary text-lg">PDT</span>
    </div>
  )
}
