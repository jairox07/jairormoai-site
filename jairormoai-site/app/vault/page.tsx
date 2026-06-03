import { createClient } from '@/lib/supabase/server'
import { VaultClient } from './VaultClient'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

export const metadata = {
  title: 'Bóveda IA — jairoromo.ai',
  description: 'Proyectos reales desarrollados con Inteligencia Artificial. RAG, automatizaciones, LLMs, ML.',
}

export default async function VaultPage() {
  let projects = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
    projects = data || []
  } catch {
    // Supabase not configured yet — show empty state
    projects = []
  }

  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <EyebrowPill className="mb-6">Bóveda IA</EyebrowPill>
          <h1 className="font-sora font-black text-4xl md:text-5xl mb-5 leading-tight">
            Proyectos reales.<br />
            <span className="text-cyan">Resultados medibles.</span>
          </h1>
          <p className="font-sora text-gray text-lg max-w-2xl">
            Sistemas de IA implementados en producción para empresas reales.
            No demos. No teoría.
          </p>
        </div>

        <VaultClient projects={projects} />
      </div>
    </div>
  )
}
