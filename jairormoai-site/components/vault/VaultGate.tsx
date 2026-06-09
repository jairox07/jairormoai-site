'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function VaultGate() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const validateEmail = (v: string) => {
    if (!v) return 'Email requerido'
    if (!EMAIL_REGEX.test(v)) return 'Formato de email inválido'
    return ''
  }

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateEmail(email)
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
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Blurred preview cards in background */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30 blur-sm scale-95">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-white/[0.07] bg-bg2/40 p-6 h-48" />
          ))}
        </div>
      </div>

      {/* Gate card */}
      <div className="relative z-10 max-w-md w-full mx-auto bg-bg2/90 backdrop-blur-xl border border-cyan/20 rounded-2xl p-8 shadow-[0_0_60px_rgba(79,195,247,0.08)]">
        {/* Lock icon */}
        <div className="w-14 h-14 rounded-2xl bg-cyan/[0.08] border border-cyan/20 flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 className="font-sora font-black text-2xl text-center mb-3">
          Acceso a la <span className="text-cyan">Bóveda IA</span>
        </h2>
        <p className="font-sora text-gray text-sm text-center mb-7 leading-relaxed">
          Regístrate con tu email para acceder a prompts, recursos, herramientas y proyectos de la comunidad.
        </p>

        {done ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="font-sora font-bold text-white mb-2">¡Listo! Ya estás en la lista.</p>
            <p className="font-sora text-gray text-sm mb-6">Crea tu cuenta para acceder a la Bóveda ahora mismo.</p>
            <Link href="/signup">
              <Button variant="primary" className="w-full">Crear cuenta gratis →</Button>
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={onSubscribe} className="flex flex-col gap-3 mb-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                  placeholder="tu@email.com"
                  className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-3 font-sora text-sm text-white placeholder:text-gray2 focus:outline-none focus:border-cyan/50 transition-colors"
                />
                {emailError && (
                  <p className="font-mono text-[11px] text-red-400 mt-1.5">{emailError}</p>
                )}
              </div>
              <Button type="submit" variant="primary" loading={loading} className="w-full">
                Acceder a la Bóveda
              </Button>
            </form>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="font-mono text-[10px] text-gray2 uppercase tracking-wider">o</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            <Link href="/login">
              <Button variant="ghost" className="w-full">Ya tengo cuenta — Iniciar sesión</Button>
            </Link>
          </>
        )}

        <p className="font-mono text-[10px] text-gray2 text-center mt-5 leading-relaxed">
          Sin spam. Solo contenido de valor.<br />Puedes darte de baja cuando quieras.
        </p>
      </div>
    </div>
  )
}
