import Image from 'next/image'
import { cn } from '@/compartido/lib/utils'

type LogoVariant = 'full' | 'icon'
type LogoSize = 'sm' | 'md' | 'lg'

interface LogoPDTProps {
  variant?: LogoVariant
  size?: LogoSize
  className?: string
}

const sizePx: Record<LogoSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
}

function LogoImage({ size, className }: { size: LogoSize; className?: string }) {
  const px = sizePx[size]
  return (
    <Image
      src="/logo-pdt.png"
      alt="Plataforma Digital Textil"
      width={px}
      height={px}
      priority={size !== 'sm'}
      className={cn('object-contain', className)}
    />
  )
}

export function LogoPDT({ variant = 'full', size = 'md', className }: LogoPDTProps) {
  if (variant === 'icon') {
    return <LogoImage size={size} className={className} />
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LogoImage size={size} />
      <span className="font-overpass font-bold text-ink-primary text-lg">PDT</span>
    </div>
  )
}
