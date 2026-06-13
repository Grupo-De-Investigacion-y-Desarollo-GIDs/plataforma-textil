import { cn } from '@/compartido/lib/utils'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function IconTrazabilidad({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('w-5 h-5', className)}
      {...props}
    >
      <circle cx={6} cy={6} r={2.5} />
      <circle cx={18} cy={6} r={2.5} />
      <circle cx={6} cy={18} r={2.5} />
      <circle cx={18} cy={18} r={2.5} />
      <circle cx={12} cy={12} r={2} fill="currentColor" />
      <path d="M8 8l3 3M16 8l-3 3M8 16l3-3M16 16l-3-3" opacity={0.5} />
    </svg>
  )
}
