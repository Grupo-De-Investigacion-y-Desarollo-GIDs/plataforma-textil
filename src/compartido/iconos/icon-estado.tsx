import { cn } from '@/compartido/lib/utils'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function IconEstado({ className, ...props }: IconProps) {
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
      <path d="M5 21V10l7-5 7 5v11" opacity={0.4} />
      <path d="M9 21v-7M15 21v-7" />
      <circle cx={12} cy={13} r={1} fill="currentColor" />
    </svg>
  )
}
