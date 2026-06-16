import { createClient } from '@/lib/supabase/server'
import { VaultClient } from './VaultClient'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

export const metadata = {
  title: 'Bóveda IA — Prompts, Skills y Proyectos con IA en Español',
  description: 'Biblioteca de recursos de IA en español. Prompts para Claude y Gemini, skills para abogados e inmobiliaria, proyectos descargables y automatizaciones reales. Comunidad jairoromo.ai.',
  alternates: { canonical: 'https://jairoromo.ai/vault' },
  openGraph: {
    title: 'Bóveda IA — Prompts, Skills y Proyectos con IA en Español',
    description: 'Prompts, templates, skills por industria y proyectos reales con IA. Gratis y de pago.',
    url: 'https://jairoromo.ai/vault',
    type: 'website',
  },
}

export default async function VaultPage() {
  let projects = []
  let isLoggedIn = false
  let userId: string | null = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isLoggedIn = !!user
    userId = user?.id ?? null

    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
    projects = data || []
  } catch {
    projects = []
  }

  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <EyebrowPill className="mb-6">Bóveda IA</EyebrowPill>
          <h1 className="font-sora font-black text-4xl md:text-5xl mb-5 leading-tight">
            Recursos, prompts<br />
            <span className="text-cyan">y proyectos reales.</span>
          </h1>
          <p className="font-sora text-gray text-lg max-w-2xl">
            Herramientas, skills y recursos de Claude, Gemini y más.
            Generado por la comunidad jairoromo.ai.
          </p>
        </div>

        <VaultClient projects={projects} isLoggedIn={isLoggedIn} userId={userId} />
      </div>
    </div>
  )
}
