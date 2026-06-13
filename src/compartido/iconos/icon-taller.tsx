import { cn } from '@/compartido/lib/utils'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function IconTaller({ className, ...props }: IconProps) {
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
      <path d="M3 21l5-5" />
      <path d="M8 16l10-10c1-1 3-1 4 0s1 3 0 4L12 20" />
      <circle cx={20} cy={4} r={1.5} fill="currentColor" />
      <path d="M14 18l4 4" opacity={0.4} />
    </svg>
  )
}
