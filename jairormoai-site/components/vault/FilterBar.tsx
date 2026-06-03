'use client'
import { cn } from '@/lib/utils'
import { VAULT_CATEGORIES } from '@/lib/constants'

interface FilterBarProps {
  active: string
  onChange: (cat: string) => void
}

export function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {VAULT_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            'font-mono text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 rounded-lg transition-all duration-200',
            active === cat.id
              ? 'bg-cyan text-bg shadow-[0_0_16px_rgba(79,195,247,0.35)]'
              : 'bg-white/[0.04] border border-white/[0.08] text-gray2 hover:border-cyan/25 hover:text-white'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
