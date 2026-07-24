'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AGENTS } from '@/lib/agents-data'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  preselectedAgentSlug?: string
}

const ROLES = ['Dueño / Director', 'Gerente de Operaciones', 'Contador', 'Ventas', 'Otro']
const INDUSTRIES = ['Salud / Clínicas', 'Inmobiliaria', 'Servicios Profesionales / Agencia', 'Comercio / E-commerce', 'Educación', 'Financiero / Contable', 'Otro']
const TEAM_SIZES = ['1-5', '6-20', '21-50', '50+']

const STEPS = ['Contacto', 'Empresa', 'Necesidad'] as const

interface FormState {
  fullName: string
  role: string
  companyName: string
  industry: string
  teamSize: string
  phone: string
  email: string
  agentSlug: string
  processDescription: string
}

const EMPTY_FORM: FormState = {
  fullName: '',
  role: '',
  companyName: '',
  industry: '',
  teamSize: '',
  phone: '',
  email: '',
  agentSlug: '',
  processDescription: '',
}

export function ImplementationModal({ open, onClose, preselectedAgentSlug }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (open) {
      setStep(0)
      setSubmitted(false)
      setSubmitError('')
      setErrors({})
      setForm({ ...EMPTY_FORM, agentSlug: preselectedAgentSlug ?? '' })
    }
  }, [open, preselectedAgentSlug])

  if (!open) return null

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validateStep(current: number): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (current === 0) {
      if (!form.fullName.trim()) next.fullName = 'Requerido'
      if (!form.role) next.role = 'Requerido'
      if (!form.phone.trim()) next.phone = 'Requerido'
      else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) next.phone = 'Debe tener 10 dígitos'
      if (!form.email.trim()) next.email = 'Requerido'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Email inválido'
    }
    if (current === 1) {
      if (!form.companyName.trim()) next.companyName = 'Requerido'
      if (!form.industry) next.industry = 'Requerido'
      if (!form.teamSize) next.teamSize = 'Requerido'
    }
    if (current === 2) {
      if (!form.agentSlug) next.agentSlug = 'Requerido'
      if (!form.processDescription.trim()) next.processDescription = 'Requerido'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function goNext() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleSubmit() {
    if (!validateStep(2)) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/agents/implement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Error al enviar')
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al enviar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/[0.08] bg-bg2 shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white transition-colors z-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center text-3xl">
                ✅
              </div>
              <h3 className="font-sora font-black text-2xl mb-3">¡Solicitud recibida!</h3>
              <p className="font-sora text-gray text-sm leading-relaxed max-w-sm mx-auto mb-8">
                Nuestro agente se pondrá en contacto contigo a tu WhatsApp en los próximos 2 minutos para agendar la activación.
              </p>
              <Button variant="primary" onClick={onClose}>Entendido</Button>
            </div>
          ) : (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[3px] text-cyan mb-2">Implementación de Agente IA</p>
              <h3 className="font-sora font-black text-xl mb-6">Cuéntanos sobre tu empresa</h3>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-8">
                {STEPS.map((label, i) => (
                  <div key={label} className="flex items-center gap-2 flex-1">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shrink-0 border transition-colors',
                        i < step ? 'bg-cyan border-cyan text-bg' :
                        i === step ? 'border-cyan text-cyan' :
                        'border-white/15 text-gray2'
                      )}
                    >
                      {i < step ? '✓' : i + 1}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn('h-[2px] flex-1', i < step ? 'bg-cyan' : 'bg-white/10')} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 0: Contacto */}
              {step === 0 && (
                <div className="flex flex-col gap-4">
                  <Input
                    label="Nombre completo"
                    placeholder="Tu nombre"
                    value={form.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                    error={errors.fullName}
                  />
                  <div>
                    <label className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-gray2 mb-1.5 block">Cargo en la empresa</label>
                    <select
                      value={form.role}
                      onChange={(e) => update('role', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-sora text-sm focus:outline-none focus:border-cyan/50"
                    >
                      <option value="" className="bg-bg2">Selecciona una opción</option>
                      {ROLES.map((r) => <option key={r} value={r} className="bg-bg2">{r}</option>)}
                    </select>
                    {errors.role && <span className="font-mono text-[11px] text-red-400 mt-1 block">{errors.role}</span>}
                  </div>
                  <Input
                    label="WhatsApp de contacto"
                    placeholder="10 dígitos"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    error={errors.phone}
                  />
                  <Input
                    label="Correo electrónico empresarial"
                    type="email"
                    placeholder="tu@empresa.com"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    error={errors.email}
                  />
                </div>
              )}

              {/* Step 1: Empresa */}
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <Input
                    label="Nombre de la empresa"
                    placeholder="Tu empresa"
                    value={form.companyName}
                    onChange={(e) => update('companyName', e.target.value)}
                    error={errors.companyName}
                  />
                  <div>
                    <label className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-gray2 mb-1.5 block">Giro o industria</label>
                    <select
                      value={form.industry}
                      onChange={(e) => update('industry', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-sora text-sm focus:outline-none focus:border-cyan/50"
                    >
                      <option value="" className="bg-bg2">Selecciona una opción</option>
                      {INDUSTRIES.map((i) => <option key={i} value={i} className="bg-bg2">{i}</option>)}
                    </select>
                    {errors.industry && <span className="font-mono text-[11px] text-red-400 mt-1 block">{errors.industry}</span>}
                  </div>
                  <div>
                    <label className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-gray2 mb-1.5 block">Número de empleados</label>
                    <div className="grid grid-cols-4 gap-2">
                      {TEAM_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => update('teamSize', size)}
                          className={cn(
                            'py-3 rounded-xl border font-mono text-xs font-bold transition-colors',
                            form.teamSize === size
                              ? 'bg-cyan/15 border-cyan text-cyan'
                              : 'bg-white/[0.03] border-white/10 text-gray hover:border-white/25'
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {errors.teamSize && <span className="font-mono text-[11px] text-red-400 mt-1 block">{errors.teamSize}</span>}
                  </div>
                </div>
              )}

              {/* Step 2: Necesidad */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-gray2 mb-1.5 block">Agente de interés</label>
                    <select
                      value={form.agentSlug}
                      onChange={(e) => update('agentSlug', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-sora text-sm focus:outline-none focus:border-cyan/50"
                    >
                      <option value="" className="bg-bg2">Selecciona un agente</option>
                      {AGENTS.map((a) => <option key={a.slug} value={a.slug} className="bg-bg2">{a.name}</option>)}
                    </select>
                    {errors.agentSlug && <span className="font-mono text-[11px] text-red-400 mt-1 block">{errors.agentSlug}</span>}
                  </div>
                  <div>
                    <label className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-gray2 mb-1.5 block">Describe brevemente tu proceso actual</label>
                    <textarea
                      value={form.processDescription}
                      onChange={(e) => update('processDescription', e.target.value)}
                      rows={4}
                      placeholder="Ej: Hoy le damos seguimiento a facturas vencidas por llamadas manuales..."
                      className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-sora text-sm placeholder:text-gray2 focus:outline-none focus:border-cyan/50 resize-none"
                    />
                    {errors.processDescription && <span className="font-mono text-[11px] text-red-400 mt-1 block">{errors.processDescription}</span>}
                  </div>
                </div>
              )}

              {submitError && (
                <p className="mt-4 font-mono text-[11px] text-red-400">{submitError}</p>
              )}

              {/* Nav buttons */}
              <div className="flex items-center gap-3 mt-8">
                {step > 0 && (
                  <Button variant="ghost" onClick={goBack} disabled={submitting}>Atrás</Button>
                )}
                <div className="flex-1" />
                {step < STEPS.length - 1 ? (
                  <Button variant="primary" onClick={goNext}>Continuar</Button>
                ) : (
                  <Button variant="primary" loading={submitting} onClick={handleSubmit}>Enviar solicitud</Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
