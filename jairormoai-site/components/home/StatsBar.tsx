import { HERO_STATS } from '@/lib/constants'

export function StatsBar() {
  return (
    <section className="relative z-10 border-y border-white/[0.06] bg-bg2/60 backdrop-blur-sm py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16">
        {HERO_STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <span className="font-sora font-black text-2xl text-cyan">{stat.value}</span>
            <span className="font-mono text-[11px] uppercase tracking-[2px] text-gray2">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
