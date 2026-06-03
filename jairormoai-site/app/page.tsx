import { HeroSection } from '@/components/home/HeroSection'
import { StatsBar } from '@/components/home/StatsBar'
import { ExperienceTimeline } from '@/components/home/ExperienceTimeline'
import { CollabCTA } from '@/components/home/CollabCTA'
import { DonationSection } from '@/components/home/DonationSection'
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
