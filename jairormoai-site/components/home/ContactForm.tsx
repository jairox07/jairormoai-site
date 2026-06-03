'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm() {
  const [state, setState] = useState<FormState>('idle')
  const [form, setForm] = useState({ name: '', email: '', company: '', whatsapp: '' })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.name.trim()) e.name = 'Nombre requerido'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setState('loading')
    const supabase = createClient()
    const { error } = await supabase.from('contact_submissions').insert([form])
    setState(error ? 'error' : 'success')
  }

  if (state === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" fill="none" stroke="#4FC3F7" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>
        <h3 className="font-sora font-bold text-xl mb-2">Mensaje recibido</h3>
        <p className="font-sora text-gray">Me pondré en contacto pronto.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Input
        id="name" label="Nombre" placeholder="Tu nombre completo"
        value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
        error={errors.name}
      />
      <Input
        id="email" label="Email" type="email" placeholder="tu@empresa.com"
        value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
        error={errors.email}
      />
      <Input
        id="company" label="Empresa" placeholder="Nombre de tu empresa"
        value={form.company} onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
      />
      <Input
        id="whatsapp" label="WhatsApp / Teléfono" placeholder="+52 55 1234 5678"
        value={form.whatsapp} onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value }))}
      />
      <div className="md:col-span-2 flex flex-col gap-3 items-start">
        <Button type="submit" variant="primary" loading={state === 'loading'}>
          Enviar mensaje
        </Button>
        {state === 'error' && (
          <p className="font-mono text-[11px] text-red-400">Error al enviar. Intenta de nuevo.</p>
        )}
      </div>
    </form>
  )
}
