'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) { setError('Email requerido'); return }
    if (!EMAIL_REGEX.test(email)) { setError('Formato de email inválido'); return }
    setLoading(true)
    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    })
    setLoading(false)
    if (authError) { setError(authError.message); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" fill="none" stroke="#4FC3F7" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 className="font-sora font-black text-2xl mb-3">Revisa tu email</h2>
          <p className="font-sora text-gray mb-6">
            Si existe una cuenta con <strong className="text-white">{email}</strong>, recibirás un enlace para restablecer tu contraseña.
          </p>
          <Link href="/login" className="font-mono text-[11px] text-cyan uppercase tracking-wider hover:underline">
            ← Volver al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <EyebrowPill className="mb-5">Recuperar acceso</EyebrowPill>
          <h1 className="font-sora font-black text-3xl mb-2">Restablecer contraseña.</h1>
          <p className="font-sora text-gray text-sm">
            Te enviaremos un enlace seguro a tu email.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-bg2/80 backdrop-blur-sm p-8">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <Input
              id="email" label="Email" type="email" placeholder="tu@correo.com"
              value={email} onChange={(e) => { setEmail(e.target.value); setError('') }}
            />
            {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Enviar enlace →
            </Button>
            <Link href="/login" className="font-mono text-[11px] text-gray2 text-center hover:text-white transition-colors">
              ← Volver al login
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}
