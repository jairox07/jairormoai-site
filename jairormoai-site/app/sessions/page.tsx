import { EyebrowPill } from '@/components/ui/EyebrowPill'
import { SessionCard } from '@/components/sessions/SessionCard'
import { SESSION_PACKAGES } from '@/lib/constants'

export const metadata = {
  title: 'Sesiones 1:1 — jairoromo.ai',
  description: 'Trabaja directamente con Jairo Romo. Elige el formato que mejor se adapta a tu necesidad.',
}

export default function SessionsPage() {
  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <EyebrowPill live className="mb-6">Sesiones 1:1</EyebrowPill>
          <h1 className="font-sora font-black text-4xl md:text-5xl mb-5 leading-tight">
            Trabaja directamente<br />conmigo.
          </h1>
          <p className="font-sora text-gray text-lg max-w-2xl mx-auto">
            Elige el formato que mejor se adapta a lo que necesitas.
            Todas las sesiones son por videollamada, en español.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SESSION_PACKAGES.map((pkg) => (
            <SessionCard key={pkg.id} pkg={pkg} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="font-mono text-[11px] text-gray2 uppercase tracking-wider">
            Pago seguro con Stripe · Sin suscripción · Factura disponible
          </p>
        </div>
      </div>
    </div>
  )
}
