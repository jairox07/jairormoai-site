import { EyebrowPill } from '@/components/ui/EyebrowPill'

export const metadata = {
  title: 'Sesiones de amigos — jairoromo.ai',
  robots: { index: false, follow: false },
}

const AMIGOS_STRIPE_LINK = 'https://buy.stripe.com/3cI9AU3dr8e9b5L1mh6wE0g'

export default function AmigosSessionsPage() {
  return (
    <div className="min-h-screen py-24 px-6 md:px-12 flex items-center justify-center">
      <div className="max-w-lg mx-auto text-center">
        <EyebrowPill live className="mb-6">Acceso de amigos</EyebrowPill>
        <h1 className="font-sora font-black text-3xl md:text-4xl mb-5 leading-tight">
          Bienvenido a las sesiones<br />de amigos de jairoromo.ai.
        </h1>
        <p className="font-sora text-gray text-base leading-relaxed mb-10">
          Si llegaste hasta aquí es porque somos cercanos, de una forma u otra.
          Este es un espacio sin prisa, sin formalidad de cliente — para platicar tu proyecto,
          resolver dudas o simplemente ayudarte a avanzar. Precio preferente, mismo nivel de atención.
        </p>
        <a
          href={AMIGOS_STRIPE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center font-sora font-bold text-sm rounded-xl px-8 py-4 bg-brand-grad text-white hover:opacity-90 transition-opacity"
        >
          Agendar mi sesión de amigo →
        </a>
      </div>
    </div>
  )
}
