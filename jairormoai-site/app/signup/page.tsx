'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/courses'

  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.full_name.trim()) { setError('Tu nombre es requerido'); return }
    if (!EMAIL_REGEX.test(form.email)) { setError('Email inválido'); return }
    if (form.password.length < 6) { setError('Contraseña mínimo 6 caracteres'); return }

    setLoading(true)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al crear cuenta')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (loginErr) {
      setError('Cuenta creada. Inicia sesión manualmente.')
      setLoading(false)
      return
    }

    router.push(`/onboarding?redirect=${encodeURIComponent(redirectTo)}`)
  }

  const loginHref = redirectTo !== '/courses'
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : '/login'

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <EyebrowPill className="mb-5">Registro</EyebrowPill>
          <h1 className="font-sora font-black text-3xl mb-2">Crea tu cuenta.</h1>
          <p className="font-sora text-gray text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link href={loginHref} className="text-cyan hover:underline">Inicia sesión</Link>
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-bg2/80 backdrop-blur-sm p-8">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <Input
              id="name" label="Nombre completo" placeholder="Tu nombre"
              required
              value={form.full_name}
              onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
            />
            <Input
              id="email" label="Email" type="email" placeholder="tu@correo.com"
              required
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <Input
              id="password" label="Contraseña" type="password" placeholder="Mínimo 6 caracteres"
              required minLength={6}
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
            />
            {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Crear cuenta gratis
            </Button>
          </form>
        </div>

        <p className="mt-6 font-mono text-[10px] text-gray2 text-center leading-relaxed">
          Al registrarte aceptas los{' '}
          <Link href="/terms" className="text-cyan hover:underline">Términos de uso</Link>
          {' '}y la{' '}
          <Link href="/privacy" className="text-cyan hover:underline">Política de privacidad</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
