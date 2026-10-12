// Shared by server (email) and browser (PDF download): no Node imports here.

export type CheckGroup = 'seo' | 'geo'
export type Severity = 'alta' | 'media' | 'baja'

export interface Check {
  id: string
  group: CheckGroup
  label: string
  passed: boolean
  detail: string
  severity: Severity
  action: string // what we do for the client if it fails
}

export interface AuditReport {
  url: string
  finalUrl: string
  fetchedAt: string
  responseMs: number
  seoScore: number
  geoScore: number
  score: number
  checks: Check[]
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://jairoromoai.novotech.mx').replace(/\/$/, '')

const esc = (s: string) => s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!))
const color = (n: number) => (n >= 80 ? '#16A34A' : n >= 50 ? '#D97706' : '#DC2626')
const sevColor = { alta: '#DC2626', media: '#D97706', baja: '#64748B' }
export const SEVERITY_ORDER: Record<Severity, number> = { alta: 0, media: 1, baja: 2 }

export function failedSorted(r: AuditReport) {
  return r.checks.filter(c => !c.passed).sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
}

// Light theme on purpose: reads well in mail clients and prints cleanly to PDF.
export function reportHtml(r: AuditReport, name: string): string {
  const host = new URL(r.finalUrl).hostname
  const failed = failedSorted(r)
  const rows = r.checks.map(c => `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #E2E8F0;font-size:13px;color:#0F172A;">${c.passed ? '✅' : '❌'} ${esc(c.label)}<br><span style="color:#64748B;font-size:12px;">${esc(c.detail)}</span></td>
    <td style="padding:8px 0;border-bottom:1px solid #E2E8F0;font-size:11px;color:#64748B;text-align:right;text-transform:uppercase;">${c.group}</td></tr>`).join('')
  const actions = failed.map((c, i) => `<li style="margin-bottom:10px;color:#0F172A;font-size:14px;">
    <b>${i + 1}. ${esc(c.action)}</b> <span style="color:${sevColor[c.severity]};font-size:11px;text-transform:uppercase;">prioridad ${c.severity}</span></li>`).join('')
  const box = (label: string, n: number) => `<td style="text-align:center;padding:16px;border:1px solid #E2E8F0;border-radius:12px;">
    <div style="font-size:34px;font-weight:900;color:${color(n)};">${n}</div><div style="font-size:11px;letter-spacing:2px;color:#64748B;text-transform:uppercase;">${label}</div></td>`

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Diagnóstico SEO + GEO — ${esc(host)}</title></head>
<body style="margin:0;background:#FFFFFF;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">
<tr><td style="padding-bottom:24px;"><p style="margin:0;font-family:monospace;font-size:11px;letter-spacing:3px;color:#0284C7;text-transform:uppercase;">Diagnóstico SEO + GEO</p>
<h1 style="margin:8px 0;color:#0F172A;font-size:24px;">${name ? `Hola ${esc(name)}, este` : 'Este'} es el diagnóstico de ${esc(host)}</h1>
<p style="color:#475569;font-size:14px;margin:0;">Qué tan bien posicionado está el sitio en Google (SEO) y en buscadores de IA como ChatGPT, Claude, Perplexity y Gemini (GEO).</p></td></tr>
<tr><td><table width="100%" cellspacing="8"><tr>${box('General', r.score)}${box('SEO', r.seoScore)}${box('GEO / IA', r.geoScore)}</tr></table></td></tr>
<tr><td style="padding-top:24px;"><h2 style="color:#0F172A;font-size:18px;">Siguientes acciones recomendadas</h2>
${failed.length ? `<ol style="padding-left:0;list-style:none;">${actions}</ol>` : '<p style="color:#475569;">El sitio pasa todas las revisiones. ¡Excelente!</p>'}</td></tr>
<tr><td style="padding:16px 0 24px;"><a href="${SITE_URL}/sessions" style="display:inline-block;background:#0284C7;color:#FFFFFF;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;">Agendar sesión para implementarlo →</a></td></tr>
<tr><td><h2 style="color:#0F172A;font-size:18px;">Detalle completo</h2><table width="100%">${rows}</table></td></tr>
<tr><td style="padding-top:24px;color:#94A3B8;font-size:11px;">Análisis automático de la página principal el ${new Date(r.fetchedAt).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}. Hecho con la herramienta gratuita de ${SITE_URL.replace('https://', '')}/herramientas/auditoria-seo-geo</td></tr>
</table></td></tr></table></body></html>`
}
