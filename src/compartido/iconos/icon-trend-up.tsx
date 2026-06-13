import { cn } from '@/compartido/lib/utils'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function IconTrendUp({ className, ...props }: IconProps) {
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
      <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />
    </svg>
  )
}
