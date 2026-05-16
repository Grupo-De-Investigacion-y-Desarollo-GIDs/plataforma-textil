import { cn } from '@/compartido/lib/utils'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function IconCapacitacion({ className, ...props }: IconProps) {
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
      <path d="M2 6c2-1 6-1 10 1 4-2 8-2 10-1v13c-2-1-6-1-10 1-4-2-8-2-10-1V6z" />
      <path d="M12 7v13" opacity={0.4} />
    </svg>
  )
}
