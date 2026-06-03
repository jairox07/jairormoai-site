import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-gray2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3.5 rounded-xl',
            'bg-white/[0.04] border border-white/10 text-white',
            'font-sora text-sm placeholder:text-gray2',
            'transition-colors duration-200',
            'focus:outline-none focus:border-cyan/50 focus:bg-white/[0.06]',
            error && 'border-red-400/50',
            className
          )}
          {...props}
        />
        {error && (
          <span className="font-mono text-[11px] text-red-400">{error}</span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
