'use client'

import { cn } from '@/compartido/lib/utils'

interface FilterOption {
  label: string
  value: string
  count?: number
}

interface FilterPillsProps {
  options: FilterOption[]
  active: string
  onChange: (value: string) => void
  className?: string
}

export function FilterPills({ options, active, onChange, className }: FilterPillsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-overpass font-semibold transition-colors',
            active === opt.value
              ? 'bg-brand-blue text-white shadow-soft'
              : 'bg-white border border-gray-200 text-ink-secondary hover:bg-pastel-blue'
          )}
        >
          {opt.label}
          {opt.count !== undefined && <span className="ml-1 opacity-70">{opt.count}</span>}
        </button>
      ))}
    </div>
  )
}
