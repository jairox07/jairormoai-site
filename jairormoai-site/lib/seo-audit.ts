import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

import type { AuditReport, Check, CheckGroup, Severity } from './seo-audit-report'
export type { AuditReport, Check } from './seo-audit-report'

const UA = 'Mozilla/5.0 (compatible; JairoRomoAuditBot/1.0; +https://jairoromoai.novotech.mx/herramientas/auditoria-seo-geo)'
const MAX_BYTES = 2_000_000
const WEIGHT: Record<Severity, number> = { alta: 3, media: 2, baja: 1 }

const AI_BOTS = [
  { ua: 'GPTBot', name: 'ChatGPT (GPTBot)' },
  { ua: 'OAI-SearchBot', name: 'ChatGPT Search' },
  { ua: 'ClaudeBot', name: 'Claude' },
  { ua: 'PerplexityBot', name: 'Perplexity' },
  { ua: 'Google-Extended', name: 'Gemini / AI Overviews' },
]

// ─── SSRF guard ──────────────────────────────────────────────────────────────

function isPrivateIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number)
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) || a >= 224
  }
  const v6 = ip.toLowerCase()
  if (v6.startsWith('::ffff:')) return isPrivateIp(v6.slice(7))
  return v6 === '::1' || v6 === '::' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80')
}

async function assertPublicUrl(raw: string): Promise<URL> {
  const u = new URL(raw)
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('Solo se permiten URLs http/https')
  if (u.username || u.password) throw new Error('URL no permitida')
  const host = u.hostname.replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('URL no permitida')
  const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true })
  if (!addrs.length || addrs.some(a => isPrivateIp(a.address))) throw new Error('URL no permitida')
  return u
}

// Follows redirects manually so every hop passes the SSRF guard.
async function safeFetch(raw: string, timeoutMs = 10_000): Promise<{ res: Response; finalUrl: string; body: string }> {
  let current = raw
  for (let hop = 0; hop < 5; hop++) {
    const u = await assertPublicUrl(current)
    const res = await fetch(u, {
      redirect: 'manual',
      headers: { 'User-Agent': UA, Accept: 'text/html,text/plain,*/*' },
      signal: AbortSignal.timeout(timeoutMs),
    })
    const loc = res.headers.get('location')
    if (res.status >= 300 && res.status < 400 && loc) {
      current = new URL(loc, u).toString()
      continue
    }
    const buf = await res.arrayBuffer()
    const body = new TextDecoder().decode(buf.slice(0, MAX_BYTES))
    return { res, finalUrl: u.toString(), body }
  }
  throw new Error('Demasiadas redirecciones')
}

async function fetchText(url: string): Promise<{ ok: boolean; body: string }> {
  try {
    const { res, body } = await safeFetch(url, 6_000)
    return { ok: res.ok, body }
  } catch {
    return { ok: false, body: '' }
  }
}

// ─── HTML helpers (regex is enough for a surface audit) ─────────────────────

const strip = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const metaContent = (html: string, attr: string, name: string) => {
  const re = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*>`, 'i')
  const tag = html.match(re)?.[0]
  return tag?.match(/content=["']([^"']*)["']/i)?.[1]?.trim() ?? null
}

// Disallowed for this UA? Uses the agent's own group, else the * group.
function robotsBlocks(robots: string, ua: string): boolean {
  const groups: { agents: string[]; disallowRoot: boolean }[] = []
  let cur: { agents: string[]; disallowRoot: boolean } | null = null
  let lastWasAgent = false
  for (const line of robots.split(/\r?\n/)) {
    const [k, ...rest] = line.split('#')[0].split(':')
    const key = k?.trim().toLowerCase()
    const val = rest.join(':').trim()
    if (key === 'user-agent') {
      if (!cur || !lastWasAgent) { cur = { agents: [], disallowRoot: false }; groups.push(cur) }
      cur.agents.push(val.toLowerCase())
      lastWasAgent = true
    } else if (key) {
      lastWasAgent = false
      if (cur && key === 'disallow' && val === '/') cur.disallowRoot = true
    }
  }
  const own = groups.find(g => g.agents.includes(ua.toLowerCase()))
  const star = groups.find(g => g.agents.includes('*'))
  return (own ?? star)?.disallowRoot ?? false
}

// ─── Audit ───────────────────────────────────────────────────────────────────

export async function runAudit(input: string): Promise<AuditReport> {
  const trimmed = input.trim()
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) throw new Error('Solo se permiten URLs http/https')
  const raw = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  const t0 = Date.now()
  const { res, finalUrl, body: html } = await safeFetch(raw)
  const responseMs = Date.now() - t0
  const origin = new URL(finalUrl).origin

  const [robots, sitemap, llms] = await Promise.all([
    fetchText(`${origin}/robots.txt`),
    fetchText(`${origin}/sitemap.xml`),
    fetchText(`${origin}/llms.txt`),
  ])

  const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? html
  const bodyHtml = html.match(/<body[\s\S]*<\/body>/i)?.[0] ?? html
  const text = strip(bodyHtml.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' '))
  const words = text ? text.split(' ').length : 0

  const title = strip(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
  const desc = metaContent(head, 'name', 'description')
  const h1s = bodyHtml.match(/<h1[\s>]/gi)?.length ?? 0
  const h2s = bodyHtml.match(/<h2[\s>]/gi)?.length ?? 0
  const imgs = bodyHtml.match(/<img[^>]*>/gi) ?? []
  const imgsNoAlt = imgs.filter(i => !/alt=["'][^"']+["']/i.test(i)).length
  const robotsMeta = metaContent(head, 'name', 'robots') ?? ''
  const jsonLd = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1])
  const schemaTypes = jsonLd.join(' ').match(/"@type"\s*:\s*"([^"]+)"/g)?.map(s => s.split('"')[3]) ?? []
  const questionHeadings = (bodyHtml.match(/<h[2-4][^>]*>[^<]*\?<\/h[2-4]>/gi) ?? []).length
  const hasDates = /article:published_time|datePublished|<time[\s>]/i.test(html)
  const hasAuthor = /name=["']author["']|"author"\s*:/i.test(html)

  const c = (
    id: string, group: CheckGroup, severity: Severity, label: string,
    passed: boolean, detail: string, action: string,
  ): Check => ({ id, group, severity, label, passed, detail, action })

  const checks: Check[] = [
    // SEO
    c('https', 'seo', 'alta', 'Sitio servido por HTTPS', finalUrl.startsWith('https://'),
      finalUrl.startsWith('https://') ? 'Conexión segura.' : 'El sitio no usa HTTPS.',
      'Configurar certificado SSL y redirección 301 a HTTPS.'),
    c('status', 'seo', 'alta', 'Página responde correctamente', res.ok,
      `Código HTTP ${res.status}.`, 'Corregir errores de servidor y rutas rotas.'),
    c('noindex', 'seo', 'alta', 'Página indexable', !/noindex/i.test(robotsMeta),
      /noindex/i.test(robotsMeta) ? 'Tiene meta robots "noindex": Google no la indexa.' : 'Sin bloqueos de indexación.',
      'Quitar noindex y revisar directivas de indexación.'),
    c('title', 'seo', 'alta', 'Título optimizado (10–65 caracteres)', title.length >= 10 && title.length <= 65,
      title ? `"${title.slice(0, 80)}" (${title.length} caracteres).` : 'No tiene etiqueta <title>.',
      'Reescribir títulos con palabra clave principal y propuesta de valor.'),
    c('description', 'seo', 'media', 'Meta descripción (50–160 caracteres)', !!desc && desc.length >= 50 && desc.length <= 160,
      desc ? `${desc.length} caracteres.` : 'No tiene meta descripción.',
      'Redactar meta descripciones persuasivas que aumenten el CTR.'),
    c('h1', 'seo', 'media', 'Un único H1', h1s === 1, `${h1s} etiquetas H1 encontradas.`,
      'Reestructurar encabezados: un H1 claro y jerarquía H2/H3.'),
    c('canonical', 'seo', 'media', 'URL canónica definida', /rel=["']canonical["']/i.test(head),
      /rel=["']canonical["']/i.test(head) ? 'Tiene canonical.' : 'Sin etiqueta canonical: riesgo de contenido duplicado.',
      'Agregar canonical a todas las páginas.'),
    c('lang', 'seo', 'baja', 'Idioma declarado', /<html[^>]+lang=/i.test(html),
      /<html[^>]+lang=/i.test(html) ? 'Atributo lang presente.' : 'Falta lang en <html>.',
      'Declarar idioma y, si aplica, hreflang para versiones multilingües.'),
    c('viewport', 'seo', 'alta', 'Optimizado para móvil', /name=["']viewport["']/i.test(head),
      /name=["']viewport["']/i.test(head) ? 'Tiene meta viewport.' : 'Sin meta viewport: mala experiencia móvil.',
      'Adaptar el sitio a móvil (mobile-first).'),
    c('og', 'seo', 'baja', 'Open Graph para redes', !!metaContent(head, 'property', 'og:title') && !!metaContent(head, 'property', 'og:image'),
      'Revisión de og:title y og:image.', 'Configurar Open Graph con imágenes de marca.'),
    c('alt', 'seo', 'media', 'Imágenes con texto alternativo', imgs.length === 0 || imgsNoAlt / imgs.length <= 0.1,
      `${imgsNoAlt} de ${imgs.length} imágenes sin alt.`, 'Agregar alt descriptivo a todas las imágenes.'),
    c('content', 'seo', 'media', 'Contenido suficiente (300+ palabras)', words >= 300,
      `${words} palabras visibles.`, 'Crear contenido útil y profundo orientado a búsquedas reales.'),
    c('speed', 'seo', 'media', 'Respuesta rápida del servidor (< 1.5 s)', responseMs < 1500,
      `${responseMs} ms en responder.`, 'Optimizar hosting, caché e imágenes (Core Web Vitals).'),
    c('sitemap', 'seo', 'media', 'Sitemap XML', sitemap.ok && /<urlset|<sitemapindex/i.test(sitemap.body),
      sitemap.ok ? 'sitemap.xml encontrado.' : 'No se encontró /sitemap.xml.', 'Generar sitemap y enviarlo a Google Search Console.'),
    c('robots', 'seo', 'baja', 'Archivo robots.txt', robots.ok,
      robots.ok ? 'robots.txt encontrado.' : 'No se encontró /robots.txt.', 'Crear robots.txt con reglas correctas.'),

    // GEO
    ...AI_BOTS.map(b => {
      const blocked = robots.ok && robotsBlocks(robots.body, b.ua)
      return c(`bot-${b.ua}`, 'geo', 'alta', `Acceso de ${b.name}`, !blocked,
        blocked ? `robots.txt bloquea a ${b.ua}: tu sitio no aparecerá en sus respuestas.` : `${b.ua} puede leer el sitio.`,
        'Ajustar robots.txt para permitir los rastreadores de IA.')
    }),
    c('llms', 'geo', 'media', 'Archivo llms.txt', llms.ok && llms.body.trim().length > 20 && !/<html/i.test(llms.body),
      llms.ok ? 'llms.txt encontrado.' : 'No hay /llms.txt para guiar a los modelos de IA.',
      'Crear llms.txt con resumen del negocio, servicios y páginas clave.'),
    c('schema', 'geo', 'alta', 'Datos estructurados (Schema.org)', jsonLd.length > 0,
      jsonLd.length ? `Tipos: ${[...new Set(schemaTypes)].join(', ') || 'sin @type'}.` : 'Sin JSON-LD: las IAs entienden menos tu negocio.',
      'Implementar Schema.org (Organization, LocalBusiness, Product, FAQ).'),
    c('entity', 'geo', 'media', 'Entidad del negocio definida', schemaTypes.some(t => /Organization|LocalBusiness|Person|Store|Restaurant|Service/i.test(t)),
      'Revisión de schema Organization / LocalBusiness.', 'Definir la entidad de marca con sameAs a redes y directorios.'),
    c('ssr', 'geo', 'alta', 'Contenido visible sin JavaScript', words >= 150,
      words >= 150 ? 'El HTML ya trae el contenido.' : 'El contenido depende de JavaScript: muchos bots de IA no lo ven.',
      'Migrar a renderizado en servidor (SSR/SSG).'),
    c('questions', 'geo', 'media', 'Contenido en formato pregunta-respuesta', questionHeadings >= 2,
      `${questionHeadings} encabezados en forma de pregunta.`, 'Crear secciones FAQ que respondan lo que los clientes preguntan a la IA.'),
    c('structure', 'geo', 'baja', 'Estructura citable (H2 por tema)', h2s >= 3,
      `${h2s} subtítulos H2.`, 'Organizar contenido en bloques cortos y citables por la IA.'),
    c('eeat', 'geo', 'media', 'Señales de autoría y fecha (E-E-A-T)', hasAuthor || hasDates,
      hasAuthor || hasDates ? 'Se detectan autor o fechas.' : 'Sin autor ni fechas: menos confianza para la IA.',
      'Agregar autoría, fechas y credenciales visibles.'),
  ]

  const score = (g?: CheckGroup) => {
    const set = g ? checks.filter(x => x.group === g) : checks
    const total = set.reduce((s, x) => s + WEIGHT[x.severity], 0)
    const got = set.filter(x => x.passed).reduce((s, x) => s + WEIGHT[x.severity], 0)
    return Math.round((got / total) * 100)
  }

  return {
    url: raw, finalUrl, fetchedAt: new Date().toISOString(), responseMs,
    seoScore: score('seo'), geoScore: score('geo'), score: score(), checks,
  }
}
