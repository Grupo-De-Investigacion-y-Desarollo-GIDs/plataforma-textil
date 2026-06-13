import { cn } from '@/compartido/lib/utils'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function IconMarca({ className, ...props }: IconProps) {
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
      <path d="M19 8L13 2H6a2 2 0 00-2 2v15a2 2 0 002 2h12a2 2 0 002-2v-9z" />
      <path d="M13 2v6h6" opacity={0.4} />
      <circle cx={9} cy={14} r={1.5} fill="currentColor" />
    </svg>
  )
}
