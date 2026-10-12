'use client'
import { useState } from 'react'
import Link from 'next/link'
import { reportHtml, failedSorted, type AuditReport, type Check } from '@/lib/seo-audit-report'

const input = 'w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-sora text-sm placeholder:text-gray2 focus:outline-none focus:border-cyan/40'
const scoreColor = (n: number) => (n >= 80 ? 'text-green-400' : n >= 50 ? 'text-yellow-400' : 'text-red-400')

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-bg2/40 p-6 text-center">
      <div className={`font-sora font-black text-5xl ${scoreColor(value)}`}>{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-[2px] text-gray2 mt-2">{label}</div>
    </div>
  )
}

function CheckRow({ c }: { c: Check }) {
  return (
    <li className="flex items-start gap-3 py-3 border-b border-white/[0.05] last:border-0">
      <span className="mt-0.5">{c.passed ? '✅' : '❌'}</span>
      <div className="flex-1 min-w-0">
        <div className="font-sora text-sm">{c.label}</div>
        <div className="font-mono text-[11px] text-gray2 mt-0.5 break-words">{c.detail}</div>
      </div>
    </li>
  )
}

export function AuditClient() {
  const [form, setForm] = useState({ url: '', name: '', email: '', company: '', whatsapp: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState<AuditReport | null>(null)
  const [emailed, setEmailed] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setReport(null)
    const res = await fetch('/api/herramientas/auditoria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Error al analizar'); return }
    setReport(data.report); setEmailed(data.emailed)
  }

  // Browser print dialog → "Guardar como PDF". No PDF library needed.
  const downloadPdf = () => {
    if (!report) return
    const w = window.open('', '_blank')
    if (!w) {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([reportHtml(report, form.name)], { type: 'text/html' }))
      a.download = `diagnostico-seo-geo-${new URL(report.finalUrl).hostname}.html`
      a.click()
      return
    }
    w.document.write(reportHtml(report, form.name))
    w.document.close()
    setTimeout(() => w.print(), 400)
  }

  if (report) {
    const failed = failedSorted(report)
    return (
      <div className="space-y-8">
        <div className="font-mono text-[11px] text-gray2">
          {new URL(report.finalUrl).hostname} · {emailed ? `reporte enviado a ${form.email}` : 'no pudimos enviar el correo, guarda esta página'}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Score label="General" value={report.score} />
          <Score label="SEO · Google" value={report.seoScore} />
          <Score label="GEO · IA" value={report.geoScore} />
        </div>

        <section className="rounded-2xl border border-cyan/15 bg-bg2/40 p-6">
          <h2 className="font-sora font-bold text-xl mb-4">Siguientes acciones</h2>
          {failed.length === 0 ? (
            <p className="font-sora text-sm text-gray">Tu sitio pasa todas las revisiones. 🎉</p>
          ) : (
            <ol className="space-y-3">
              {failed.map((c, i) => (
                <li key={c.id} className="flex gap-3">
                  <span className="font-mono text-[11px] text-cyan mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="font-sora text-sm">{c.action}</div>
                    <span className={`font-mono text-[9px] uppercase tracking-wider ${c.severity === 'alta' ? 'text-red-400' : c.severity === 'media' ? 'text-yellow-400' : 'text-gray2'}`}>
                      prioridad {c.severity}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={downloadPdf} className="font-mono text-[11px] font-bold uppercase tracking-[2px] px-5 py-3 rounded-xl bg-white/[0.06] border border-white/[0.15] text-white hover:bg-white/[0.1] transition-colors">
              ⬇ Descargar reporte PDF
            </button>
            <Link href="/sessions" className="font-mono text-[11px] font-bold uppercase tracking-[2px] px-5 py-3 rounded-xl bg-cyan/10 border border-cyan/30 text-cyan hover:bg-cyan/20 transition-colors">
              Agendar sesión para implementarlo →
            </Link>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {(['seo', 'geo'] as const).map(g => (
            <section key={g} className="rounded-2xl border border-white/[0.07] bg-bg2/40 p-6">
              <h3 className="font-sora font-bold mb-2">{g === 'seo' ? 'SEO · Buscadores' : 'GEO · Motores de IA'}</h3>
              <ul>{report.checks.filter(c => c.group === g).map(c => <CheckRow key={c.id} c={c} />)}</ul>
            </section>
          ))}
        </div>

        <button onClick={() => setReport(null)} className="font-mono text-[11px] text-gray2 hover:text-white">
          ← Analizar otro sitio
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/[0.07] bg-bg2/40 p-6 md:p-8 space-y-4">
      <input required className={input} placeholder="tusitio.com" value={form.url} onChange={set('url')} />
      <div className="grid md:grid-cols-2 gap-4">
        <input required className={input} placeholder="Nombre" value={form.name} onChange={set('name')} />
        <input required type="email" className={input} placeholder="Correo (aquí llega el reporte)" value={form.email} onChange={set('email')} />
        <input className={input} placeholder="Empresa (opcional)" value={form.company} onChange={set('company')} />
        <input className={input} placeholder="WhatsApp (opcional)" value={form.whatsapp} onChange={set('whatsapp')} />
      </div>
      {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
      <button disabled={loading} className="w-full font-mono text-[12px] font-bold uppercase tracking-[2px] px-4 py-4 rounded-xl bg-cyan/15 border border-cyan/40 text-cyan hover:bg-cyan/25 transition-colors disabled:opacity-50">
        {loading ? 'Analizando sitio…' : 'Analizar mi sitio gratis'}
      </button>
      <p className="font-mono text-[10px] text-gray2 text-center">Revisamos 30+ factores: indexación, metadatos, velocidad, schema, llms.txt y acceso de ChatGPT, Claude, Perplexity y Gemini.</p>
    </form>
  )
}
