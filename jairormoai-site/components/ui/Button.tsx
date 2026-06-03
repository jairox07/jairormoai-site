'use client'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-sora font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan'

    const variants = {
      primary: 'bg-brand-grad text-white shadow-[0_4px_28px_rgba(79,195,247,0.28)] hover:shadow-[0_8px_36px_rgba(79,195,247,0.4)] hover:-translate-y-0.5',
      ghost: 'bg-transparent text-white border border-white/15 hover:bg-white/5 hover:border-white/25',
      outline: 'bg-transparent text-cyan border border-cyan/30 hover:bg-cyan/5 hover:border-cyan/50',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-7 py-3.5 text-sm',
      lg: 'px-8 py-4 text-base',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
