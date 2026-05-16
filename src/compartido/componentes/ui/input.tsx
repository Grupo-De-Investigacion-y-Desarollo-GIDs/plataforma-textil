import { forwardRef } from 'react'
import { cn } from '@/compartido/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block font-overpass font-medium text-sm text-ink-primary mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-input border border-gray-200 px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue',
            'disabled:bg-gray-50 disabled:cursor-not-allowed',
            error && 'border-status-error focus:ring-status-error/30',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-status-error">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-ink-secondary">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
