import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Proyectos',
  description: 'Productos y herramientas de IA construidos por Jairo Romo: Lex OS, Karrott, Sofía para clínicas, Cerrador de WhatsApp, SmartSight y Cortex OS.',
}

type Status = 'En desarrollo' | 'Beta' | 'Demo' | 'Kit disponible'

interface Project {
  slug: string
  name: string
  tag: string
  promise: string
  bullets: string[]
  status: Status
  stack: string
  accent: string
  // Look propio de cada proyecto (fondo, acento secundario y logotipo)
  bg: string
  accent2: string
  logo: { kind: 'image'; src: string; alt: string } | { kind: 'wordmark'; text: string; highlight: string }
}

const PROJECTS: Project[] = [
  {
    slug: 'lex-os',
    name: 'Lex OS',
    tag: 'LegalTech · Despachos MX',
    promise: 'El sistema operativo para despachos de abogados, con IA que investiga sobre tus propios expedientes.',
    bullets: [
      'Investigación jurídica con IA (RAG): búsqueda semántica sobre tus documentos',
      'Contratos masivos desde plantillas y expedientes con alertas de plazos',
      'Multi-tenant, cifrado AES-256 en reposo y audit trail para datos de clientes',
    ],
    status: 'En desarrollo',
    stack: 'React · Express · PostgreSQL · Pinecone',
    accent: '#6366F1',
    accent2: '#F59E0B',
    bg: '#030712',
    logo: { kind: 'wordmark', text: 'Lex', highlight: 'OS' },
  },
  {
    slug: 'karrott',
    name: 'Karrott',
    tag: 'CRM · Talleres y agencias automotrices',
    promise: 'Un CRM conversacional para talleres: atiende clientes, cotiza refacciones y cobra sin salir de la bandeja.',
    bullets: [
      'Bandeja unificada de WhatsApp y otros canales con asistente de IA',
      'Módulos de taller, refacciones, pipeline de ventas y reportes',
      'Links de pago con Stripe y plantillas de seguimiento',
    ],
    status: 'En desarrollo',
    stack: 'Next.js · Stripe · Anthropic',
    accent: '#FF6B2B',
    accent2: '#FFB38A',
    bg: '#0F0E17',
    logo: { kind: 'wordmark', text: 'Karrott', highlight: '' },
  },
  {
    slug: 'agente-clinicas',
    name: 'Sofía',
    tag: 'Agente para clínicas · Estética',
    promise: 'Una asistente que responde, califica y agenda a tus pacientes a cualquier hora.',
    bullets: [
      'Califica prospectos: procedimiento de interés, urgencia y condiciones de salud',
      'Agenda consultas y genera ligas de pago para apartar cita',
      'Deriva casos complejos a consulta presencial, sin diagnósticos automáticos',
    ],
    status: 'Demo',
    stack: 'Next.js · Anthropic · Stripe',
    accent: '#605BFF',
    accent2: '#A5A3FF',
    bg: '#0A0A0C',
    logo: { kind: 'wordmark', text: 'Sofía', highlight: '' },
  },
  {
    slug: 'cerrador-whatsapp',
    name: 'Cerrador de WhatsApp',
    tag: 'Blueprint · Claude Code',
    promise: 'Un agente que contesta, califica, agenda y deja el seguimiento escrito en tu CRM mientras tú no estás.',
    bullets: [
      'Responde la objeción con tu playbook y ofrece solo horarios que existen',
      'Escribe etapa y próximo paso en el CRM después de cada conversación',
      'Modo borrador por defecto: pide confirmación antes de escribir afuera',
    ],
    status: 'Kit disponible',
    stack: 'Claude Code · WhatsApp Cloud API',
    accent: '#4FD6B0',
    accent2: '#4FD6B0',
    bg: '#0D1117',
    logo: { kind: 'image', src: '/images/proyectos/cerrador-whatsapp.svg', alt: 'Cerrador de WhatsApp' },
  },
  {
    slug: 'smartsight',
    name: 'SmartSight',
    tag: 'Visión por computadora · Retail',
    promise: 'Cuenta personas y entiende cómo se mueven por tu tienda, en tiempo real y con métricas de negocio.',
    bullets: [
      'Conteo en vivo, sesiones y reporte por sesión',
      'Clasificación y análisis de comportamiento con visión por computadora',
      'Módulos de analítica, monitor, productos y tráfico en calle',
    ],
    status: 'Beta',
    stack: 'Python · FastAPI · Roboflow',
    accent: '#A855F7',
    accent2: '#22C55E',
    bg: '#0D0D1A',
    logo: { kind: 'wordmark', text: 'Smart', highlight: 'Sight' },
  },
  {
    slug: 'cortex-os',
    name: 'Cortex OS',
    tag: 'Segundo cerebro empresarial · GraphRAG',
    promise: 'Pregúntale a la información de tu empresa por chat, por voz o desde Telegram, y mira cómo se conectan los datos.',
    bullets: [
      'Chat y voz sobre un grafo de conocimiento 3D',
      'Dashboard de deals, tickets y contratos con fuentes citadas',
      'Bot de Telegram para consultar desde el celular',
    ],
    status: 'Demo',
    stack: 'FastAPI · React · Claude / Ollama',
    accent: '#7DF9FF',
    accent2: '#863BFF',
    bg: '#05060F',
    logo: { kind: 'image', src: '/images/proyectos/cortex-os-logo.svg', alt: 'Cortex OS' },
  },
]

const STATUS_STYLE: Record<Status, string> = {
  'En desarrollo': 'border-[#FF00FF]/45 bg-[#FF00FF]/[0.08] text-[#FF5CFF]',
  Beta: 'border-[#00A3FF]/45 bg-[#00A3FF]/[0.08] text-[#5CC8FF]',
  Demo: 'border-[#00A3FF]/45 bg-[#00A3FF]/[0.08] text-[#5CC8FF]',
  'Kit disponible': 'border-[#3DDC97]/45 bg-[#3DDC97]/[0.08] text-[#3DDC97]',
}

function Logo({ project }: { project: Project }) {
  if (project.logo.kind === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={project.logo.src} alt={project.logo.alt} className="h-auto max-h-24 w-auto max-w-[78%] object-contain" />
    )
  }
  const { text, highlight } = project.logo
  return (
    <span className="font-extrabold text-[44px] leading-none tracking-tight text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>
      {text}
      {highlight && (
        <span style={{ color: project.accent }}>{highlight}</span>
      )}
    </span>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-[24px] border border-white/[0.09] bg-white/[0.035] transition-transform duration-300 hover:-translate-y-1"
      style={{ borderLeft: `5px solid ${project.accent}` }}
    >
      {/* Portada del proyecto con su propio color y logotipo */}
      <div
        className="relative flex h-52 items-center justify-center overflow-hidden"
        style={{ background: project.bg }}
      >
        <div
          aria-hidden
          className="absolute -left-10 -top-10 h-56 w-56 rounded-full opacity-60 blur-[90px]"
          style={{ background: project.accent }}
        />
        <div
          aria-hidden
          className="absolute -bottom-12 -right-8 h-48 w-48 rounded-full opacity-40 blur-[90px]"
          style={{ background: project.accent2 }}
        />
        <div className="relative z-10 flex h-full w-full items-center justify-center p-6">
          <Logo project={project} />
        </div>
        <span
          className="absolute right-4 top-4 z-10 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[2px]"
          style={{ borderColor: `${project.accent}70`, color: project.accent, background: `${project.bg}cc` }}
        >
          {project.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[2.5px] text-[#A6A3B8]">{project.tag}</p>
        <h2 className="mb-3 text-[28px] font-black leading-tight text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>
          {project.name}
        </h2>
        <p className="mb-5 text-[16px] leading-relaxed text-[#E9E7F2]">{project.promise}</p>

        <ul className="mb-6 space-y-2.5">
          {project.bullets.map((b) => (
            <li key={b} className="flex gap-2.5 text-[15px] leading-snug text-[#A6A3B8]">
              <span aria-hidden className="mt-[2px] font-black text-[#3DDC97]">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-4 border-t border-white/[0.08] pt-5">
          <p className="font-mono text-[12px] tracking-[1px] text-[#5E5A73]">{project.stack}</p>
          <Link
            href="/sessions"
            className="self-start rounded-[22px] bg-[linear-gradient(135deg,#00A3FF_0%,#6B21A8_55%,#FF00FF_100%)] px-6 py-3 text-[15px] font-black text-white shadow-[0_8px_30px_rgba(255,0,255,0.25)] transition-transform hover:scale-[1.03]"
          >
            Quiero algo así →
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function ProyectosPage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#080610] px-6 pb-24 pt-28 text-white md:px-12"
      style={{ fontFamily: "'Exo 2', sans-serif" }}
    >
      {/* Tipografía de marca: Exo 2 + Space Mono */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;800;900&family=Space+Mono:wght@400;700&display=swap');`}</style>

      {/* Orbes de fondo, sin cuadrícula */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-[#00A3FF] opacity-[0.22] blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 top-40 h-[520px] w-[520px] rounded-full bg-[#FF00FF] opacity-[0.18] blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute left-1/3 bottom-0 h-[460px] w-[460px] rounded-full bg-[#6B21A8] opacity-[0.35] blur-[110px]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Hero */}
        <header className="mx-auto mb-20 max-w-3xl text-center">
          <p className="mb-6 font-mono text-[14px] uppercase tracking-[3px] text-[#00A3FF]">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#FF00FF] align-middle shadow-[0_0_10px_#FF00FF]" />
            Proyectos · IA Bien Aplicada
          </p>
          <h1 className="mb-6 text-[44px] font-black leading-[1.05] md:text-[68px]">
            Lo que construyo con <span className="bg-[linear-gradient(90deg,#00A3FF_0%,#FF00FF_100%)] bg-clip-text text-transparent">Claude</span>
          </h1>
          <p className="text-[19px] leading-relaxed text-[#A6A3B8] md:text-[22px]">
            Seis productos de IA aplicada al negocio real. Cada uno tiene su propia marca, su propio problema que resuelve y su propia forma de usarse.
          </p>
        </header>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>

        {/* CTA final, con gradiente de marca */}
        <section className="mt-24 rounded-[24px] bg-[linear-gradient(135deg,#00A3FF_0%,#6B21A8_55%,#FF00FF_100%)] p-10 text-center shadow-[0_10px_50px_rgba(255,0,255,0.28)] md:p-14">
          <h2 className="mb-4 text-[32px] font-black leading-tight md:text-[44px]">¿Quieres uno para tu negocio?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-[18px] leading-relaxed text-white/90">
            Cuéntame tu operación en una sesión 1:1 y te digo qué se puede automatizar, qué conviene construir y qué no vale la pena.
          </p>
          <Link
            href="/sessions"
            className="inline-block rounded-[22px] bg-white px-8 py-4 text-[17px] font-black text-[#0b0716] transition-transform hover:scale-[1.03]"
          >
            Agendar sesión 1:1
          </Link>
        </section>

        <p className="mt-12 text-center font-mono text-[14px] tracking-[1px] text-[#5E5A73]">@jairoromo.ai</p>
      </div>
    </div>
  )
}
