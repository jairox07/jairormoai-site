'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres'
    if (!form.confirm) errs.confirm = 'Repite tu contraseña'
    else if (form.password !== form.confirm) errs.confirm = 'Las contraseñas no coinciden'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: form.password })
    setLoading(false)
    if (error) { setErrors({ global: error.message }); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <EyebrowPill className="mb-5">Nueva contraseña</EyebrowPill>
          <h1 className="font-sora font-black text-3xl mb-2">Crea tu nueva contraseña.</h1>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-bg2/80 backdrop-blur-sm p-8">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <Input
              id="password" label="Nueva contraseña" type="password" placeholder="Mínimo 8 caracteres"
              error={errors.password}
              value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
            />
            <Input
              id="confirm" label="Repetir contraseña" type="password" placeholder="Repite tu nueva contraseña"
              error={errors.confirm}
              value={form.confirm} onChange={(e) => setForm(f => ({ ...f, confirm: e.target.value }))}
            />
            {errors.global && <p className="font-mono text-[11px] text-red-400">{errors.global}</p>}
            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Guardar contraseña
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
