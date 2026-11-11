import { createClient } from '@/lib/supabase/server'
import { VaultClient } from './VaultClient'
import Link from 'next/link'
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

        <Link
          href="/kit-editor-ia"
          className="group mb-14 flex flex-col md:flex-row md:items-center gap-5 rounded-3xl p-6 md:p-8 text-white border border-fuchsia-500/30"
          style={{ background: 'linear-gradient(135deg,#0b1a2e 0%,#1a0b2e 55%,#2a0b2e 100%)' }}
        >
          <span
            className="flex-none w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl"
            style={{ background: 'linear-gradient(135deg,#00A3FF,#6B21A8 55%,#FF00FF)' }}
          >
            JR
          </span>
          <div className="flex-1">
            <p className="font-mono text-[11px] tracking-[2.5px] uppercase text-[#7fd0ff] mb-1">Nuevo · Skill de pago</p>
            <p className="font-sora font-black text-2xl">Kit Editor IA: tú grabas, Claude edita</p>
            <p className="font-sora text-white/70">11 skills de edición de video para Claude Code. Cortes, mejor toma, subtítulos, gancho y fondo.</p>
          </div>
          <span className="font-sora font-black rounded-xl bg-white text-[#0b0716] px-5 py-3 self-start md:self-center group-hover:translate-x-1 transition-transform">
            US$19 →
          </span>
        </Link>

        <VaultClient projects={projects} isLoggedIn={isLoggedIn} userId={userId} />
      </div>
    </div>
  )
}
