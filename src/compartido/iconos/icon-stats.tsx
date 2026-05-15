import { cn } from '@/compartido/lib/utils'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function IconStats({ className, ...props }: IconProps) {
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
      <path d="M3 21h18" />
      <rect x={6} y={14} width={3} height={6} rx={0.5} />
      <rect x={11} y={9} width={3} height={11} rx={0.5} />
      <rect x={16} y={5} width={3} height={15} rx={0.5} />
      <path d="M5 7l4-3 4 2 5-4" opacity={0.4} />
    </svg>
  )
}
