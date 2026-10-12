import { NextResponse } from 'next/server'
import { runAudit } from '@/lib/seo-audit'
import { reportHtml } from '@/lib/seo-audit-report'
import { sendEmail } from '@/lib/resend'

export const maxDuration = 30

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ADMIN_EMAILS = [
  { email: 'jairo.romo@novotech.mx', name: 'Jairo Romo' },
  { email: 'contacto@novotech.mx', name: 'Contacto Novotech' },
]

// ponytail: per-instance memory limit; move to Upstash/Supabase if abused across instances
const hits = new Map<string, number[]>()
function rateLimited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter(t => now - t < 3_600_000)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > 5
}

const esc = (s: string) => s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!))

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Demasiadas auditorías. Intenta en una hora.' }, { status: 429 })
  }

  const { url, name, email, company, whatsapp } = await request.json().catch(() => ({}))
  if (typeof url !== 'string' || !url.trim() || url.length > 500) {
    return NextResponse.json({ error: 'URL requerida' }, { status: 400 })
  }
  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  }
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  let report
  try {
    report = await runAudit(url)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    const friendly = /ENOTFOUND|EAI_AGAIN/.test(msg) ? 'No encontramos ese dominio, revisa la URL.'
      : /timeout|abort/i.test(msg) ? 'El sitio tardó demasiado en responder.'
      : /permit|redirec/i.test(msg) ? msg
      : 'El sitio no respondió.'
    return NextResponse.json({ error: `No pudimos analizar el sitio. ${friendly}` }, { status: 422 })
  }

  const lead = {
    name: name.trim().slice(0, 100),
    email: email.trim(),
    company: typeof company === 'string' ? company.trim().slice(0, 100) : '',
    whatsapp: typeof whatsapp === 'string' ? whatsapp.trim().slice(0, 40) : '',
  }
  const host = new URL(report.finalUrl).hostname
  const failed = report.checks.filter(c => !c.passed)

  // Email failures shouldn't hide the report from the user.
  const [userMail] = await Promise.all([
    sendEmail({
      to: [{ email: lead.email, name: lead.name }],
      subject: `Tu diagnóstico SEO + GEO de ${host} — ${report.score}/100`,
      htmlContent: reportHtml(report, lead.name),
    }),
    sendEmail({
      to: ADMIN_EMAILS,
      subject: `Lead auditoría: ${lead.name} — ${host} (${report.score}/100)`,
      htmlContent: `<p>Nuevo lead desde la auditoría SEO + GEO:</p><ul>
        <li><b>Nombre:</b> ${esc(lead.name)}</li>
        <li><b>Email:</b> ${esc(lead.email)}</li>
        <li><b>Empresa:</b> ${esc(lead.company) || '—'}</li>
        <li><b>WhatsApp:</b> ${esc(lead.whatsapp) || '—'}</li>
        <li><b>Sitio:</b> ${esc(report.finalUrl)}</li>
        <li><b>Puntaje:</b> General ${report.score} · SEO ${report.seoScore} · GEO ${report.geoScore}</li>
        <li><b>Oportunidades (${failed.length}):</b> ${failed.map(c => esc(c.action)).join(' · ')}</li></ul>`,
    }),
  ])

  return NextResponse.json({ report, emailed: !userMail?.error })
}
