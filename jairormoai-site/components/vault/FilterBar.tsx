'use client'
import { VAULT_CATEGORIES, CATEGORY_COLORS } from '@/lib/constants'

interface FilterBarProps {
  active: string
  onChange: (cat: string) => void
}

export function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {VAULT_CATEGORIES.map((cat) => {
        const color = CATEGORY_COLORS[cat.id]
        const isActive = active === cat.id
        const accent = color?.accent || '#94A3B8'

        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className="font-mono text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 rounded-lg transition-all duration-200 border"
            style={
              isActive
                ? { background: accent, color: '#080B14', borderColor: accent, boxShadow: `0 0 16px ${accent}55` }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#3D4F63' }
            }
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
