import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CollabCTA() {
  return (
    <section className="py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-white/[0.07] bg-bg2/80 p-12 md:p-16 text-center">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-5">
            Colaboraciones
          </div>
          <h2 className="font-sora font-black text-3xl md:text-5xl leading-tight mb-5">
            ¿Tienes un proyecto<br />
            <span className="text-cyan">que vale la pena?</span>
          </h2>
          <p className="font-sora text-gray text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Conferencias, workshops, alianzas estratégicas o consultoría de alto nivel.
            Si el proyecto es serio, encontramos la forma.
          </p>
          <Link href="/#contacto">
            <Button variant="primary" size="lg">Proponer colaboración</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
