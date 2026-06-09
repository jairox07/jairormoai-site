'use client'
import { useState } from 'react'
import { EyebrowPill } from '@/components/ui/EyebrowPill'
import { Button } from '@/components/ui/Button'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PERKS = [
  { icon: '⚡', label: 'Noticias IA diarias' },
  { icon: '🔧', label: 'Tips y tricky tricks' },
  { icon: '🚀', label: 'Herramientas nuevas' },
  { icon: '🎯', label: 'Contenido exclusivo' },
]

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const validate = (v: string) => {
    if (!v) return 'Email requerido'
    if (!EMAIL_REGEX.test(v)) return 'Formato de email inválido'
    return ''
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate(email)
    if (err) { setEmailError(err); return }
    setEmailError('')
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setDone(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al suscribirse'
      setEmailError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="newsletter" className="py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl border border-cyan/15 bg-bg2/60 backdrop-blur-sm p-10 md:p-14 overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(79,195,247,0.06),transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.05),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center">
            {/* Left */}
            <div className="flex-1">
              <EyebrowPill className="mb-5">Newsletter Diario</EyebrowPill>
              <h2 className="font-sora font-black text-3xl md:text-4xl mb-5 leading-tight">
                IA al día,<br />
                <span className="text-cyan">sin ruido.</span>
              </h2>
              <p className="font-sora text-gray leading-relaxed mb-7 max-w-md">
                Cada día en tu inbox: noticias relevantes, tips prácticos, herramientas nuevas y los tricky tricks que solo aprenderás aquí.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {PERKS.map((perk) => (
                  <div key={perk.label} className="flex items-center gap-2.5">
                    <span className="text-base">{perk.icon}</span>
                    <span className="font-sora text-sm text-gray2">{perk.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div className="w-full lg:w-[360px] flex-shrink-0">
              {done ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center mx-auto mb-5">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="font-sora font-black text-xl mb-2">¡Ya eres parte!</h3>
                  <p className="font-sora text-gray text-sm">
                    Bienvenido a la comunidad jairoromo.ai.<br />
                    Revisa tu inbox — te llegará el primer correo pronto.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="bg-bg/50 border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4">
                  <div>
                    <label className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-gray2 block mb-2">
                      Tu email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                      placeholder="hola@tuempresa.com"
                      className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-3 font-sora text-sm text-white placeholder:text-gray2 focus:outline-none focus:border-cyan/50 transition-colors"
                    />
                    {emailError && (
                      <p className="font-mono text-[11px] text-red-400 mt-1.5">{emailError}</p>
                    )}
                  </div>

                  <Button type="submit" variant="primary" loading={loading} className="w-full">
                    Suscribirme gratis →
                  </Button>

                  <p className="font-mono text-[10px] text-gray2 text-center leading-relaxed">
                    Sin spam. Contenido real cada día.<br />
                    Baja cuando quieras, en un clic.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
