'use client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { SESSION_PACKAGES } from '@/lib/constants'

type Package = typeof SESSION_PACKAGES[number]

export function SessionCard({ pkg }: { pkg: Package }) {
  const onBuy = () => {
    if (pkg.calLink) window.open(pkg.calLink, '_blank')
  }

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border p-8 transition-all duration-300',
        pkg.popular
          ? 'border-cyan/40 bg-cyan/[0.04] shadow-[0_0_40px_rgba(79,195,247,0.08)]'
          : 'border-white/[0.07] bg-bg2/60 hover:border-white/[0.14]'
      )}
    >
      {pkg.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[2px] bg-brand-grad text-white px-4 py-1.5 rounded-full">
            Más popular
          </span>
        </div>
      )}

      <div className="font-mono text-[11px] font-bold uppercase tracking-[2.5px] text-cyan mb-4">
        {pkg.duration}
      </div>

      <h3 className="font-sora font-black text-2xl mb-3">{pkg.name}</h3>

      <p className="font-sora text-gray text-sm leading-relaxed flex-1 mb-6">{pkg.pitch}</p>

      <p className="font-mono text-[11px] text-gray2 mb-8 leading-relaxed">
        {pkg.notFor}
      </p>

      <div className="flex items-end gap-1 mb-8">
        <span className="font-sora font-black text-4xl">${pkg.price}</span>
        <span className="font-mono text-sm text-gray2 mb-1.5">{pkg.currency}</span>
      </div>

      <Button
        variant={pkg.popular ? 'primary' : 'ghost'}
        onClick={onBuy}
        className="w-full"
      >
        Agendar sesión
      </Button>
    </div>
  )
}
