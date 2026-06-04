interface ProgressBarProps {
  completed: number
  total: number
  className?: string
}

export function ProgressBar({ completed, total, className }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] text-gray2 uppercase tracking-wider">
          Progreso
        </span>
        <span className="font-mono text-[11px] text-cyan font-bold">
          {completed}/{total} lecciones · {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-grad rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
