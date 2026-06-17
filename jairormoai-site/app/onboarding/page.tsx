'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const GOALS = [
  { id: 'automatizar', label: 'Automatizar tareas en mi negocio', icon: '⚡' },
  { id: 'aprender', label: 'Aprender IA desde cero', icon: '🧠' },
  { id: 'app', label: 'Crear mi primera app sin programar', icon: '🚀' },
  { id: 'productividad', label: 'Ser más productivo con IA', icon: '📈' },
  { id: 'equipo', label: 'Implementar IA en mi equipo', icon: '👥' },
  { id: 'otro', label: 'Otro objetivo', icon: '✨' },
]

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/courses'

  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const n = data.user?.user_metadata?.full_name || ''
      setName(n.split(' ')[0])
    })
  }, [])

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const onContinue = async () => {
    setLoading(true)
    if (selected.length > 0) {
      const supabase = createClient()
      await supabase.auth.updateUser({ data: { goals: selected } })
    }
    router.push(redirectTo)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan/10 border border-cyan/20 mb-6 text-3xl">
            👋
          </div>
          <h1 className="font-sora font-black text-3xl md:text-4xl mb-3">
            {name ? `¡Bienvenido, ${name}!` : '¡Bienvenido!'}
          </h1>
          <p className="font-sora text-gray text-lg">
            Cuéntame qué quieres lograr con IA para personalizar tu experiencia.
          </p>
        </div>

        {/* Goal selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {GOALS.map((goal) => {
            const active = selected.includes(goal.id)
            return (
              <button
                key={goal.id}
                onClick={() => toggle(goal.id)}
                className="flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200"
                style={
                  active
                    ? { borderColor: '#4FC3F7', background: 'rgba(79,195,247,0.08)', color: '#fff' }
                    : { borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', color: '#94A3B8' }
                }
              >
                <span className="text-xl flex-shrink-0">{goal.icon}</span>
                <span className="font-sora text-sm font-medium leading-snug">{goal.label}</span>
                {active && (
                  <span className="ml-auto flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4FC3F7" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* CTA */}
        <button
          onClick={onContinue}
          disabled={loading}
          className="w-full py-4 rounded-xl font-sora font-bold text-base transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #4FC3F7, #8B5CF6)',
            color: '#080B14',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Cargando...' : 'Continuar →'}
        </button>

        <button
          onClick={() => router.push(redirectTo)}
          className="w-full mt-4 font-mono text-[11px] text-gray2 hover:text-white transition-colors text-center"
        >
          Saltar por ahora
        </button>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  )
}
