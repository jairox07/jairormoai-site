import { Button } from '@/components/ui/Button'

const STRIPE_DONATION_LINK = 'https://buy.stripe.com/REPLACE_WITH_YOUR_LINK'

export function DonationSection() {
  return (
    <section className="py-16 px-6 md:px-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-4">
          Apoya el trabajo
        </div>
        <h2 className="font-sora font-black text-2xl md:text-3xl mb-4">
          El contenido es gratuito.
        </h2>
        <p className="font-sora text-gray leading-relaxed mb-8">
          Si algo de lo que comparto te ha sido útil, puedes contribuir libremente.
          Sin monto mínimo, sin obligación.
        </p>
        <a href={STRIPE_DONATION_LINK} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="md">Hacer una contribución</Button>
        </a>
      </div>
    </section>
  )
}
