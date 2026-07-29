import { createClient } from '@/lib/supabase/server'
import { VaultClient } from './VaultClient'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

export const metadata = {
  title: 'Bóveda IA — Skills Legales Descargables para Abogados en Español',
  description: 'Biblioteca de skills de IA para abogados en México. Plazos procesales, escritos, amparo, laboral y más — listos para usar con Claude, gratis y descargables.',
  alternates: { canonical: 'https://jairoromo.ai/vault' },
  openGraph: {
    title: 'Bóveda IA — Skills Legales Descargables para Abogados',
    description: 'Skills de IA especializados en derecho mexicano: plazos, escritos, amparo, laboral. Gratis y descargables.',
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
            Skills legales<br />
            <span className="text-cyan">listos para usar.</span>
          </h1>
          <p className="font-sora text-gray text-lg max-w-2xl">
            Herramientas de IA especializadas en derecho mexicano: plazos, escritos, amparo, laboral y más.
            Descargables y gratis para abogados.
          </p>
        </div>

        <VaultClient projects={projects} isLoggedIn={isLoggedIn} userId={userId} />
      </div>
    </div>
  )
}
