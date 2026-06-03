'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

export default function SignupPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
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
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
          <h2 className="font-sora font-black text-2xl mb-3">Revisa tu email</h2>
          <p className="font-sora text-gray">Enviamos un enlace de confirmación a <strong className="text-white">{form.email}</strong></p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <EyebrowPill className="mb-5">Registro</EyebrowPill>
          <h1 className="font-sora font-black text-3xl mb-2">Crea tu cuenta.</h1>
          <p className="font-sora text-gray text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-cyan hover:underline">Inicia sesión</Link>
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-bg2/80 backdrop-blur-sm p-8">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <Input
              id="name" label="Nombre completo" placeholder="Tu nombre"
              value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
            />
            <Input
              id="email" label="Email" type="email" placeholder="tu@correo.com"
              value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <Input
              id="password" label="Contraseña" type="password" placeholder="Mínimo 8 caracteres"
              value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
            />
            {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Crear cuenta
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
