import { cn } from '@/lib/utils'

interface InfoCardProps {
  icon?: React.ReactNode
  title: string
  description: string
  className?: string
}

export function InfoCard({ icon, title, description, className }: InfoCardProps) {
  return (
    <div className={cn('bg-brand-bg-light rounded-lg p-4 border-l-4 border-brand-red', className)}>
      <div className="flex gap-3">
        {icon && <span className="text-2xl flex-shrink-0">{icon}</span>}
        <div>
          <span className="font-semibold text-brand-blue">{title}</span>{' '}
          <span className="text-gray-600">{description}</span>
        </div>
      </div>
    </div>
  )
}
