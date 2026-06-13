'use client'

import { forwardRef } from 'react'
import { useFormStatus } from 'react-dom'
import { cn } from '@/compartido/lib/utils'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline-dark' | 'terra'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-blue hover:bg-brand-blue-hover text-white shadow-soft',
  secondary: 'bg-white hover:bg-pastel-blue text-brand-blue border-2 border-brand-blue',
  success: 'bg-status-success hover:bg-green-600 text-white',
  danger: 'bg-status-error hover:bg-red-600 text-white',
  ghost: 'bg-transparent hover:bg-pastel-blue text-brand-blue',
  'outline-dark': 'bg-white hover:bg-gray-50 text-ink-primary border border-ink-secondary',
  terra: 'bg-terra-600 hover:bg-terra-700 text-white',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, icon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-overpass font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

/** Button that shows loading spinner while a server action form is pending */
export function SubmitButton({
  children,
  pendingText,
  ...props
}: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending} disabled={pending} {...props}>
      {pending ? (pendingText ?? children) : children}
    </Button>
  )
}
