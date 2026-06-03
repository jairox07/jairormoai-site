import { cn } from '@/lib/utils'

interface EyebrowPillProps {
  children: React.ReactNode
  live?: boolean
  className?: string
}

export function EyebrowPill({ children, live = false, className }: EyebrowPillProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2',
        'font-mono text-[11px] font-bold tracking-[2.5px] uppercase text-cyan',
        'bg-cyan/[0.07] border border-cyan/[0.18] px-4 py-1.5 rounded-full',
        className
      )}
    >
      {live && (
        <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_8px_#4FC3F7] animate-pulse-dot" />
      )}
      {children}
    </div>
  )
}
