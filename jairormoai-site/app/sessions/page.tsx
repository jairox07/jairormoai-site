import { EyebrowPill } from '@/components/ui/EyebrowPill'
import { SessionCard } from '@/components/sessions/SessionCard'
import { FriendCodeForm } from '@/components/sessions/FriendCodeForm'
import { SESSION_PACKAGES } from '@/lib/constants'

export const metadata = {
  title: 'Sesiones 1:1 con Jairo Romo — Consultoría de IA en Español',
  description: 'Sesiones de consultoría de IA 1:1 con Jairo Romo. Desde $15 USD. Videollamada en español. Para desbloquear proyectos, estrategia de IA o implementación real con Claude, GPT o Gemini.',
  alternates: { canonical: 'https://jairoromo.ai/sessions' },
  openGraph: {
    title: 'Sesiones 1:1 con Jairo Romo — Consultoría de IA',
    description: 'Trabaja directamente con Jairo Romo. 20min ($15), 45min ($79) o 90min ($297). En español por videollamada.',
    url: 'https://jairoromo.ai/sessions',
    type: 'website',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Consultoría de Inteligencia Artificial 1:1',
  description: 'Sesiones de consultoría de IA personalizadas con Jairo Romo. Videollamada en español para proyectos de IA, estrategia y automatización.',
  provider: {
    '@type': 'Person',
    name: 'Jairo Romo',
    url: 'https://jairoromo.ai',
  },
  serviceType: 'Consultoría de IA',
  areaServed: { '@type': 'Place', name: 'México y Latinoamérica' },
  availableLanguage: 'Spanish',
  offers: [
    {
      '@type': 'Offer',
      name: 'Enfoque Rápido — 20 min',
      price: '15',
      priceCurrency: 'USD',
      url: 'https://jairoromo.ai/sessions',
      description: 'Una pregunta concreta, una respuesta clara. Para desbloquear ese punto donde estás atascado.',
    },
    {
      '@type': 'Offer',
      name: 'Sesión de Trabajo — 45 min',
      price: '79',
      priceCurrency: 'USD',
      url: 'https://jairoromo.ai/sessions',
      description: 'Revisamos tu proyecto, diagnosticamos el problema y trazamos próximos pasos reales.',
    },
    {
      '@type': 'Offer',
      name: 'Consultoría Profunda — 90 min',
      price: '297',
      priceCurrency: 'USD',
      url: 'https://jairoromo.ai/sessions',
      description: 'Estrategia de IA aplicada a tu negocio, decisiones de arquitectura, roadmap accionable.',
    },
  ],
}

export default function SessionsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
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
          <FriendCodeForm />
        </div>
      </div>
      </div>
    </>
  )
}
