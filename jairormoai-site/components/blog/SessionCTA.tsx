import Link from 'next/link'
import { SESSION_PACKAGES } from '@/lib/constants'

interface SessionCTAProps {
  /** id from SESSION_PACKAGES to visually emphasize for this post's topic */
  focus?: string
  /** shorter framing question shown above the packages — post-specific when possible */
  question?: string
}

/**
 * Proven direct-response structure (Ogilvy/Halbert anchoring + Hormozi tiering,
 * adapted to Jairo's voice rules from content-playbook.md):
 *  1. A reflective question, not a command — the reader places themselves.
 *  2. Anchor high → the two smaller tiers read as reasonable by contrast.
 *  3. One tier visually "recommended" (social proof: "la que más agenda la gente").
 *  4. Every button is the SAME transactional promise: pagas → agendas, sin más pasos.
 *  5. Scarcity that is true, not invented (real weekly capacity), never a countdown timer.
 */
export function SessionCTA({ focus = 'sesion-trabajo', question }: SessionCTAProps) {
  const ordered = [...SESSION_PACKAGES].sort((a, b) => b.price - a.price) // anchor high first

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-bg2/60 p-6 md:p-8 mt-12">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[2.5px] text-cyan mb-3">
        ¿Y tú, ya lo implementaste o sigues leyendo sobre eso?
      </p>
      <p className="font-sora text-sm text-gray leading-relaxed mb-6 max-w-2xl">
        {question ??
          'Los que ya se movieron llegaron con una pregunta concreta y salieron con un plan. No es una asesoría genérica: pagas, agendas al instante, y hablamos de tu proyecto exacto.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ordered.map((pkg) => {
          const isFocus = pkg.id === focus
          return (
            <Link
              key={pkg.id}
              href={`${pkg.stripeLink}?utm_source=blog&utm_medium=cta&utm_campaign=post&utm_content=${pkg.id}`}
              className={
                isFocus || pkg.popular
                  ? 'relative flex flex-col rounded-xl border border-cyan/30 bg-cyan/[0.06] p-5 transition-all hover:-translate-y-0.5 hover:bg-cyan/[0.09]'
                  : 'relative flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:-translate-y-0.5 hover:bg-white/[0.04]'
              }
            >
              {(isFocus || pkg.popular) && (
                <span className="absolute -top-2.5 left-4 font-mono text-[9px] font-bold uppercase tracking-wider bg-cyan text-bg px-2 py-0.5 rounded-full">
                  {isFocus ? 'Para este tema' : 'La más agendada'}
                </span>
              )}
              <span className="font-sora font-black text-2xl text-white">${pkg.price}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-gray2 mb-2">
                {pkg.duration} · {pkg.currency}
              </span>
              <span className="font-sora text-sm font-bold text-white mb-1">{pkg.name}</span>
              <span className="font-sora text-xs text-gray leading-relaxed">{pkg.pitch}</span>
              <span className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[1.5px] text-cyan">
                Pagar y agendar →
              </span>
            </Link>
          )
        })}
      </div>

      <p className="font-sora text-xs text-gray2 italic mt-5">
        Cupo limitado a las sesiones que caben en mi semana — si algún horario no aparece disponible, es porque ya se ocupó.
      </p>
    </div>
  )
}
