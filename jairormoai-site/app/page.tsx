import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'

export const metadata: Metadata = {
  title: 'Jairo Romo — Consultor de IA en Español | México y LATAM',
  description: 'Jairo Romo: consultor y builder de IA en español. +3,000 horas con LLMs desde 2022. Comunidad de 5K+. Sesiones 1:1, cursos y recursos de Claude, GPT, Gemini, RAG y Agentes IA para profesionales en México y LATAM.',
  alternates: { canonical: 'https://jairoromo.ai' },
}
import { StatsBar } from '@/components/home/StatsBar'
import { ExperienceTimeline } from '@/components/home/ExperienceTimeline'
import { CollabCTA } from '@/components/home/CollabCTA'
import { DonationSection } from '@/components/home/DonationSection'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { ContactForm } from '@/components/home/ContactForm'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <ExperienceTimeline />
      <CollabCTA />
      <DonationSection />
      <NewsletterSection />

      {/* Contact */}
      <section id="contacto" className="py-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <EyebrowPill className="mb-6">Contacto</EyebrowPill>
          <h2 className="font-sora font-black text-3xl md:text-4xl mb-4">
            Hablemos.
          </h2>
          <p className="font-sora text-gray mb-12">
            Para propuestas de colaboración, eventos o proyectos de alto impacto.
          </p>
          <ContactForm />
        </div>
      </section>
    </>
  )
}
