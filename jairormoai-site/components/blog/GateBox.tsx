'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface GateBoxProps {
  slug: string
}

/**
 * Zero-friction unlock: one email field. Sends a Supabase magic link
 * (no password to invent or forget) AND registers the address as a
 * newsletter subscriber in the same call, so "leer gratis" and
 * "suscribirse al newsletter" are the same action.
 */
export function GateBox({ slug }: GateBoxProps) {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!consent) {
      setError('Acepta el tratamiento de tus datos para continuar')
      setStatus('error')
      return
    }

    setStatus('loading')
    setError('')

    try {
      // Registrar en la lista del newsletter (idempotente si ya existe)
      fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent }),
      }).catch(() => {})

      const supabase = createClient()
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/blog/${slug}`,
        },
      })

      if (otpError) {
        setError(otpError.message)
        setStatus('error')
        return
      }

      setStatus('sent')
    } catch {
      setError('Algo salió mal. Intenta de nuevo.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-cyan/20 bg-cyan/[0.04] p-8 text-center">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-cyan mb-2">
          Revisa tu correo
        </p>
        <p className="font-sora text-sm text-gray">
          Te mandé un link para entrar sin contraseña. Ábrelo desde este mismo dispositivo y regresas directo aquí.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-bg2/60 p-8">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[2.5px] text-cyan mb-3">
        🔒 El resto es solo para la comunidad
      </p>
      <p className="font-sora text-sm text-gray leading-relaxed mb-6">
        Únete gratis con tu correo y desbloqueas esta nota completa, más el newsletter cada martes. Sin contraseña, sin spam.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              id="gate-email"
              type="email"
              placeholder="tu@correo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" loading={status === 'loading'}>
            Leer gratis →
          </Button>
        </div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => { setConsent(e.target.checked); setError('') }}
            required
            className="mt-0.5 w-3.5 h-3.5 rounded border-white/20 bg-white/[0.04] accent-cyan cursor-pointer flex-shrink-0"
          />
          <span className="font-mono text-[10px] text-gray2 leading-relaxed">
            Acepto el <a href="/privacy" target="_blank" className="text-cyan hover:underline">Aviso de Privacidad</a>
          </span>
        </label>
      </form>
      {error && <p className="font-mono text-[11px] text-red-400 mt-3">{error}</p>}
      <p className="font-mono text-[10px] text-gray2 mt-4">
        ¿Ya te suscribiste? Usa el mismo correo — te llega el link de acceso igual.
      </p>
    </div>
  )
}
