import { cn } from '@/compartido/lib/utils'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function IconSpark({ className, ...props }: IconProps) {
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
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M5.5 18.5l2-2M16.5 7.5l2-2" />
      <circle cx={12} cy={12} r={3} fill="currentColor" opacity={0.2} />
    </svg>
  )
}
