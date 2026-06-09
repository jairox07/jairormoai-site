'use client'
import { useState, useEffect, useRef } from 'react'

const TABS = [
  {
    label: '🟦 Principiante (1–4)',
    color: 'cyan',
    chapters: [
      { n: 'CAP 01', title: '¿Qué es Claude y por qué importa?', desc: 'Historia de Anthropic, cómo funciona la IA, diferencias con GPT y Gemini, todas las versiones.' },
      { n: 'CAP 02', title: 'Primeros Pasos', desc: 'Crear cuenta, planes disponibles, interfaz completa, tu primera conversación con intención.' },
      { n: 'CAP 03', title: 'Los Modelos de Claude', desc: 'Opus, Sonnet, Haiku: cuándo usar cada uno, benchmarks, versiones históricas.' },
      { n: 'CAP 04', title: 'Prompting Básico', desc: 'Estructura de prompts, errores comunes, dar rol y contexto, chain of thought.' },
    ],
  },
  {
    label: '🟪 Intermedio (5–10)',
    color: 'mid',
    chapters: [
      { n: 'CAP 05', title: 'La Interfaz de Claude.ai', desc: 'Barra lateral, selector de modelo, archivos, historial, app escritorio vs móvil.' },
      { n: 'CAP 06', title: 'Proyectos y Organización', desc: 'Knowledge base, instrucciones personalizadas, compartir proyectos, límites por plan.' },
      { n: 'CAP 07', title: 'Artifacts', desc: 'Código, documentos, React, HTML, SVG, Mermaid. Crear, editar, compartir y publicar.' },
      { n: 'CAP 08', title: 'Memoria y Personalización', desc: 'Cómo funciona, qué recuerda, gestionar recuerdos, estilos de respuesta.' },
      { n: 'CAP 09', title: 'Archivos, Búsqueda y Conversaciones', desc: 'Tipos de archivo, búsqueda web integrada, exportar chats, límites de uso.' },
      { n: 'CAP 10', title: 'Planes y Precios', desc: 'Free, Pro, Team, Enterprise. Funciones exclusivas de cada plan, cómo elegir el correcto.' },
    ],
  },
  {
    label: '🟣 Avanzado (11–20)',
    color: 'purp',
    chapters: [
      { n: 'CAP 11', title: 'Empezar con Claude Code', desc: 'Instalación, requisitos, primera ejecución, autenticación, plataformas soportadas.' },
      { n: 'CAP 12', title: 'Comandos y Flags del CLI', desc: 'Referencia completa: --print, --model, --system-prompt, --allowedTools y más.' },
      { n: 'CAP 13', title: 'Configuración y Settings', desc: 'settings.json global y por proyecto, variables de entorno, permisos por defecto.' },
      { n: 'CAP 14', title: 'CLAUDE.md y Memoria del Proyecto', desc: 'Sistema completo: ubicaciones, sintaxis, mejores prácticas, memoria persistente.' },
      { n: 'CAP 15', title: 'Permisos y Seguridad', desc: 'Sandbox de red, allowedTools, blockedTools, reglas de permisos, mejores prácticas.' },
      { n: 'CAP 16', title: 'Skills y Slash Commands', desc: 'Comandos disponibles, crear skills personalizados, instalar skills de terceros.' },
      { n: 'CAP 17', title: 'Hooks', desc: 'Eventos disponibles, tipos de matcher, ejecutar código automáticamente.' },
      { n: 'CAP 18', title: 'MCP Servers', desc: 'Model Context Protocol, configurar servidores, GitHub, Slack, crear tu propio servidor.' },
      { n: 'CAP 19', title: 'Integraciones con IDEs', desc: 'VS Code, JetBrains, terminal integrado, atajos de teclado, flujos recomendados.' },
      { n: 'CAP 20', title: 'Agentes y Subagentes', desc: 'Agente principal, orquestación multi-agente, worktrees, ejecución en paralelo.' },
    ],
  },
  {
    label: '⚡ Experto (21–25)',
    color: 'expert',
    chapters: [
      { n: 'CAP 21', title: 'La API de Claude', desc: 'Messages API completa: endpoints, streaming, tool use, vision, PDF, batches, SDKs.' },
      { n: 'CAP 22', title: 'Construir con Claude', desc: 'RAG, agentes autónomos, structured output, multi-turn, system prompts avanzados.' },
      { n: 'CAP 23', title: 'Cowork y Automatización', desc: 'Modo cowork, GitHub Actions, CI/CD, scripts con --print, pipelines multi-agente.' },
      { n: 'CAP 24', title: 'Enterprise y Equipos', desc: 'Team plan, Enterprise, admin console, SSO/SAML, data residency, compliance.' },
      { n: 'CAP 25', title: 'Troubleshooting y Mejores Prácticas', desc: 'Errores comunes, rate limits, optimización de costos, anti-patrones, comunidad.' },
    ],
  },
]

const FAQS = [
  { q: '¿Necesito saber programar?', a: 'No. Los primeros 10 capítulos son 100% accesibles sin conocimientos técnicos. Los capítulos 11-20 cubren Claude Code desde cero, con ejemplos concretos para cada paso.' },
  { q: '¿Funciona con el plan gratuito de Claude?', a: 'Sí. La mayoría de conceptos y ejercicios funcionan con el plan Free. Los capítulos sobre Claude Code y API requieren plan Pro o superior — está indicado claramente en cada sección.' },
  { q: '¿Cómo recibo el curso después de comprar?', a: 'Acceso inmediato a la plataforma tras el pago. Recibirás email de confirmación con tu acceso al contenido completo en segundos.' },
  { q: '¿Las actualizaciones tienen costo adicional?', a: 'No. Pago único, acceso permanente. Claude cambia rápido y el curso también se actualiza. Las nuevas versiones están incluidas sin costo adicional.' },
  { q: '¿Hay garantía de devolución?', a: 'Sí. 7 días sin preguntas. Si el curso no cumple lo prometido, te devolvemos el dinero completo. Escríbenos directamente a través de jairoromo.ai.' },
  { q: '¿Funciona para equipos o empresas?', a: 'Sí. Los capítulos 21-25 están dedicados a implementaciones empresariales: SSO, compliance, API en producción, CI/CD y planes Team/Enterprise. Para licencias de equipo, contáctanos.' },
]

const STRIPE_BUY_LINK = 'https://buy.stripe.com/cNicN65lz8e9c9P6GB6wE0c'

export default function GuiaClaudePage() {
  const [activeTab, setActiveTab] = useState(0)
  const [openFaqs, setOpenFaqs] = useState<number[]>([])
  const fadeRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) (e.target as HTMLElement).classList.add('opacity-100', 'translate-y-0') }),
      { threshold: 0.08 }
    )
    fadeRefs.current.forEach((el) => { if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  const addFadeRef = (el: HTMLDivElement | null) => {
    if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el)
  }

  const toggleFaq = (i: number) =>
    setOpenFaqs((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i])

  const tabColors: Record<number, string> = {
    0: 'bg-cyan/10 border-cyan/35 text-cyan',
    1: 'bg-[#6B8EF5]/10 border-[#6B8EF5]/35 text-[#6B8EF5]',
    2: 'bg-purp/10 border-purp/35 text-purp',
    3: 'bg-[#c084fc]/10 border-[#c084fc]/35 text-[#c084fc]',
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Claude de Cero a Cien',
    description: 'La guía más completa de Claude AI en español. 25 capítulos, 500+ páginas, 25 ejercicios prácticos, 5 apéndices de referencia. Para profesionales, emprendedores y builders.',
    url: 'https://jairoromo.ai/guia-claude',
    inLanguage: 'es',
    provider: {
      '@type': 'Person',
      name: 'Jairo Romo',
      url: 'https://jairoromo.ai',
    },
    educationalLevel: 'Beginner to Advanced',
    teaches: [
      'Claude AI',
      'Prompting en español',
      'Claude Code',
      'RAG con Claude',
      'Agentes IA',
      'Automatización con IA',
      'API de Anthropic',
    ],
    numberOfCredits: 25,
    courseCode: 'CLAUDE-100',
    offers: {
      '@type': 'Offer',
      price: '127',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://jairoromo.ai/guia-claude',
      seller: { '@type': 'Person', name: 'Jairo Romo' },
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      instructor: { '@type': 'Person', name: 'Jairo Romo' },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    <div className="bg-bg text-white font-sora overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 text-center px-6">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[2.5px] text-cyan bg-cyan/[0.07] border border-cyan/20 px-5 py-2 rounded-full mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_8px_#4FC3F7]" />
            Guía Definitiva · Actualizada Junio 2026
          </div>
          <h1 className="font-sora font-black text-[clamp(44px,8vw,84px)] leading-[1.04] tracking-[-2px] mb-7">
            Claude de<br />
            <span className="bg-[linear-gradient(135deg,#4FC3F7_0%,#6B8EF5_50%,#8B5CF6_100%)] bg-clip-text text-transparent">
              Cero a Cien
            </span>
          </h1>
          <p className="text-lg text-gray leading-relaxed max-w-xl mx-auto mb-10">
            La guía más completa en español sobre Claude AI.<br />
            <strong className="text-white">25 capítulos. 5 apéndices. Ejercicios prácticos.</strong><br />
            Desde tu primera conversación hasta automatizar flujos completos con agentes.
          </p>
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <span className="font-sora font-black text-5xl bg-[linear-gradient(135deg,#4FC3F7,#6B8EF5,#8B5CF6)] bg-clip-text text-transparent">
                $127 USD
              </span>
            </div>
            <span className="font-mono text-[11px] text-cyan uppercase tracking-[2px]">Pago único · Sin suscripción</span>
            <a
              href={STRIPE_BUY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[linear-gradient(135deg,#4FC3F7,#6B8EF5,#8B5CF6)] text-white font-black text-lg px-12 py-5 rounded-full shadow-[0_8px_40px_rgba(79,195,247,0.35)] hover:shadow-[0_12px_50px_rgba(79,195,247,0.45)] hover:-translate-y-0.5 transition-all duration-200"
            >
              Quiero este curso →
            </a>
            <span className="font-mono text-[11px] text-gray2 uppercase tracking-wider">
              ✓ Acceso inmediato &nbsp;·&nbsp; ✓ Pago seguro &nbsp;·&nbsp; ✓ Garantía 7 días
            </span>
          </div>
        </div>
      </section>

      {/* ── PROOF BAR ── */}
      <div className="bg-bg2 border-t border-b border-white/[0.05] py-7">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-10 md:gap-16">
          {[
            { n: '25', l: 'Capítulos' },
            { n: '500+', l: 'Páginas' },
            { n: '25+', l: 'Ejercicios prácticos' },
            { n: '5', l: 'Apéndices de referencia' },
            { n: 'Jun 2026', l: 'Última actualización' },
          ].map((item) => (
            <div key={item.l} className="text-center">
              <span className="block font-sora font-black text-[28px] bg-[linear-gradient(135deg,#4FC3F7,#6B8EF5,#8B5CF6)] bg-clip-text text-transparent">
                {item.n}
              </span>
              <span className="font-mono text-[10px] text-gray2 uppercase tracking-[2px]">{item.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROBLEMA ── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-3">El problema real</div>
          <h2 className="font-sora font-black text-[clamp(28px,4.5vw,46px)] leading-[1.15] tracking-tight mb-4">
            Claude es la IA más capaz del mercado.<br />Y la mayoría usa el 10%.
          </h2>
          <p className="text-gray mb-10 leading-relaxed">
            No por falta de ganas. Por falta de una guía que vaya directo al grano y te muestre cómo usar cada característica con sentido.
          </p>
          <div
            ref={addFadeRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-0 translate-y-7 transition-all duration-500"
          >
            {[
              { icon: '😕', t: 'Prompts que no funcionan', d: 'Escribes "ayúdame con X" y obtienes respuestas genéricas. Nadie te enseñó cómo estructurar un prompt que realmente funcione.' },
              { icon: '🔁', t: 'Repites contexto en cada chat', d: 'Explicas quién eres y qué haces cada vez. Sin saber que los Proyectos existen para exactamente eso.' },
              { icon: '🤷', t: 'No sabes qué modelo usar', d: 'Opus, Sonnet, Haiku — ¿cuál eliges? Sin criterio claro, gastas tokens de más o usas el equivocado.' },
              { icon: '⏳', t: 'Tiempo perdido en tareas manuales', d: 'Cosas que Claude Code podría automatizar en segundos, las haces a mano porque nadie te explicó cómo.' },
            ].map((item) => (
              <div key={item.t} className="bg-bg2 border border-white/[0.06] rounded-[18px] p-7 flex gap-4">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h4 className="font-bold text-[15px] mb-1.5">{item.t}</h4>
                  <p className="text-[13px] text-gray">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUCIÓN ── */}
      <div className="bg-bg2 border-t border-b border-white/[0.05]">
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-3">Lo que vas a lograr</div>
            <h2 className="font-sora font-black text-[clamp(28px,4.5vw,46px)] leading-[1.15] tracking-tight mb-10">
              De "creo que lo entiendo"<br />a usarlo con confianza total.
            </h2>
            <div
              ref={addFadeRef}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-0 translate-y-7 transition-all duration-500"
            >
              {[
                { n: '01', t: 'Prompts que producen resultados reales', d: 'Aprende la estructura que usan los que obtienen respuestas de calidad desde el primer intento.' },
                { n: '02', t: 'Flujos de trabajo automáticos', d: 'Tareas que hoy te toman horas, delegadas a Claude con instrucciones claras y contexto permanente.' },
                { n: '03', t: 'Claude Code desde tu terminal', d: 'Instalación, configuración, CLAUDE.md, hooks, MCP servers — todo explicado paso a paso.' },
                { n: '04', t: 'API para builders', d: 'Messages API, streaming, tool use, RAG, agentes autónomos — si construyes productos, este nivel es tuyo.' },
                { n: '05', t: 'Referencia permanente', d: '5 apéndices con flags CLI, settings.json, variables de entorno, glosario y changelog. Siempre a mano.' },
                { n: '06', t: 'Actualizado cada mes', d: 'Claude cambia rápido. Este curso también. Acceso a newsletter exclusiva con novedades y actualizaciones.' },
              ].map((item) => (
                <div key={item.n} className="bg-bg3 border border-cyan/10 rounded-[18px] p-6">
                  <span className="font-mono text-[32px] font-bold text-cyan mb-2.5 block">{item.n}</span>
                  <h4 className="font-bold text-[15px] mb-2">{item.t}</h4>
                  <p className="text-[13px] text-gray">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── PARA QUIÉN ── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-3">Para quién es</div>
          <h2 className="font-sora font-black text-[clamp(28px,4.5vw,46px)] leading-[1.15] tracking-tight mb-4">
            Encuentra tu punto de entrada.
          </h2>
          <p className="text-gray mb-10 leading-relaxed">
            No importa dónde estés hoy. El curso te encuentra donde estás y te lleva a donde quieres ir.
          </p>
          <div
            ref={addFadeRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-0 translate-y-7 transition-all duration-500"
          >
            {[
              { icon: '🟦', border: 'border-cyan/18 bg-cyan/[0.05]', t: 'Curiosos y principiantes', d: 'Nunca usaste IA o apenas empiezas. Quieres entender qué es Claude, cómo funciona y cómo puede ayudarte desde hoy.', hint: '→ Empieza en capítulos 1 al 4' },
              { icon: '🟪', border: 'border-[#6B8EF5]/18 bg-[#6B8EF5]/[0.05]', t: 'Usuarios activos', d: 'Ya usas Claude.ai pero sientes que hay más. Proyectos, artifacts, memoria, búsqueda web. Quieres sacarle el máximo.', hint: '→ Empieza en capítulos 5 al 10' },
              { icon: '🟣', border: 'border-purp/18 bg-purp/[0.05]', t: 'Desarrolladores', d: 'Quieres Claude en tu terminal, MCP servers, hooks, skills personalizados y pipelines de automatización.', hint: '→ Empieza en capítulos 11 al 20' },
              { icon: '⚡', border: 'border-[#c084fc]/18 bg-[#c084fc]/[0.05]', t: 'Equipos y empresas', d: 'Implementar Claude con seguridad, compliance y control. API, CI/CD, SSO, HIPAA, Enterprise.', hint: '→ Empieza en capítulos 21 al 25' },
            ].map((item) => (
              <div key={item.t} className={`rounded-[20px] border ${item.border} p-8`}>
                <span className="text-[32px] mb-3.5 block">{item.icon}</span>
                <h4 className="font-black text-[16px] mb-2">{item.t}</h4>
                <p className="text-[13px] text-gray leading-relaxed mb-3.5">{item.d}</p>
                <span className="font-mono text-[10px] text-cyan uppercase tracking-[1.5px]">{item.hint}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENIDO / CAPÍTULOS ── */}
      <div className="bg-bg2 border-t border-b border-white/[0.05]">
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-3">Contenido completo</div>
            <h2 className="font-sora font-black text-[clamp(28px,4.5vw,46px)] leading-[1.15] tracking-tight mb-4">
              25 capítulos. Sin relleno.
            </h2>
            <p className="text-gray mb-10 leading-relaxed">
              Cada capítulo tiene introducción, conceptos, ejemplos reales y un ejercicio práctico que puedes hacer mientras lees.
            </p>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-7">
              {TABS.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`font-mono text-[11px] font-bold uppercase tracking-[1.5px] px-4 py-2 rounded-full border transition-all duration-200 ${
                    activeTab === i
                      ? tabColors[i]
                      : 'bg-white/[0.04] border-white/[0.08] text-gray2 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TABS[activeTab].chapters.map((ch) => (
                <div key={ch.n} className="bg-bg border border-white/[0.05] rounded-[14px] p-4 md:p-5 flex gap-3.5">
                  <span className="font-mono text-[10px] font-bold text-gray2 tracking-[1px] flex-shrink-0 pt-0.5">{ch.n}</span>
                  <div>
                    <h5 className="font-bold text-[14px] mb-1">{ch.title}</h5>
                    <p className="text-[12px] text-gray">{ch.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── EJERCICIOS ── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-3">Lo que te hace diferente</div>
          <h2 className="font-sora font-black text-[clamp(28px,4.5vw,46px)] leading-[1.15] tracking-tight mb-4">
            25 ejercicios prácticos.<br />No teoría — acción.
          </h2>
          <p className="text-gray mb-10 leading-relaxed">
            Cada capítulo termina con un ejercicio que puedes hacer mientras lees. Al terminar el curso, ya tienes experiencia real.
          </p>
          <div
            ref={addFadeRef}
            className="flex flex-col gap-3 opacity-0 translate-y-7 transition-all duration-500"
          >
            {[
              { n: 'EJ 4.1', t: 'El prompt antes y después', d: 'Transforma un prompt débil en uno poderoso usando la estructura de rol + contexto + tarea + formato.' },
              { n: 'EJ 6.1', t: 'Tu primer proyecto real', d: 'Crea un proyecto en Claude con knowledge base e instrucciones personalizadas para tu trabajo actual.' },
              { n: 'EJ 7.1', t: 'Tu primera app con Claude', d: 'Crea una calculadora personalizada para tu negocio sin escribir una sola línea de código.' },
              { n: 'EJ 14.1', t: 'CLAUDE.md en tu proyecto', d: 'Crea el archivo que da a Claude memoria permanente de tu proyecto desde la primera sesión.' },
              { n: 'EJ 17.1', t: 'Hook de notificación sonora', d: 'Configura que Claude te avise con un sonido cuando termina tareas largas — sin mirar la pantalla.' },
              { n: 'EJ 20.1', t: 'Tu primer pipeline agente', d: 'Automatiza una tarea de 3 pasos que hoy haces manualmente usando Claude en modo agente.' },
            ].map((item) => (
              <div key={item.n} className="bg-bg2 border border-cyan/12 rounded-[14px] p-5 flex gap-4">
                <span className="font-mono text-[11px] font-bold text-cyan bg-cyan/[0.08] border border-cyan/20 px-3 py-1.5 rounded-full flex-shrink-0 h-fit">
                  {item.n}
                </span>
                <div>
                  <h5 className="font-bold text-[14px] mb-1">{item.t}</h5>
                  <p className="text-[13px] text-gray">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALES ── */}
      <div className="bg-bg2 border-t border-b border-white/[0.05]">
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-3">Lo que dicen</div>
            <h2 className="font-sora font-black text-[clamp(28px,4.5vw,46px)] leading-[1.15] tracking-tight mb-10">
              Resultados reales.
            </h2>
            <div
              ref={addFadeRef}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-0 translate-y-7 transition-all duration-500"
            >
              {[
                { q: '"La primera guía en español que va más allá de \'escríbele esto a Claude\'. Los ejercicios prácticos cambiaron completamente cómo uso la herramienta en mi trabajo diario."', n: 'Ana Martínez', r: 'Directora de Marketing · CDMX' },
                { q: '"Capítulo 14 solo ya vale el precio completo. CLAUDE.md transformó cómo trabajo con mis proyectos de código. Ahora Claude entiende mi stack desde el primer mensaje."', n: 'Roberto Ríos', r: 'Senior Developer · Monterrey' },
                { q: '"Llevaba 6 meses usando Claude sin saber que existían los Proyectos. Un capítulo y cambié todo mi flujo de trabajo. Ojalá hubiera tenido esta guía desde el inicio."', n: 'Sofía Vega', r: 'Consultora de Negocios · Buenos Aires' },
              ].map((t) => (
                <div key={t.n} className="bg-bg border border-white/[0.06] rounded-[18px] p-7">
                  <div className="text-[#FBD24B] text-sm mb-3.5 tracking-[2px]">★★★★★</div>
                  <p className="text-[14px] text-gray leading-relaxed italic mb-4">{t.q}</p>
                  <div className="font-mono text-[11px] text-white font-bold">{t.n}</div>
                  <div className="font-mono text-[10px] text-gray2">{t.r}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── FAQ ── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-3">Preguntas frecuentes</div>
          <h2 className="font-sora font-black text-[clamp(28px,4.5vw,46px)] leading-[1.15] tracking-tight mb-10">
            Todo resuelto antes de comprar.
          </h2>
          <div
            ref={addFadeRef}
            className="opacity-0 translate-y-7 transition-all duration-500"
          >
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="border-b border-white/[0.06] py-6 cursor-pointer"
                onClick={() => toggleFaq(i)}
              >
                <div className="flex justify-between items-center gap-4 font-bold text-[16px]">
                  <span>{faq.q}</span>
                  <span className={`text-cyan text-xl flex-shrink-0 transition-transform duration-300 ${openFaqs.includes(i) ? 'rotate-45' : ''}`}>+</span>
                </div>
                {openFaqs.includes(i) && (
                  <p className="text-[14px] text-gray mt-3.5 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <div className="bg-bg2 border-t border-white/[0.05]">
        <section className="py-20 px-6" id="comprar">
          <div className="max-w-2xl mx-auto">
            <div
              ref={addFadeRef}
              className="relative rounded-[28px] border border-cyan/20 bg-bg2 p-10 md:p-16 text-center overflow-hidden opacity-0 translate-y-7 transition-all duration-500"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[linear-gradient(135deg,#4FC3F7,#6B8EF5,#8B5CF6)]" />

              <div className="inline-block font-mono text-[10px] font-bold uppercase tracking-[2px] text-purp bg-purp/[0.08] border border-purp/25 px-4 py-2 rounded-full mb-7">
                Acceso completo · Un solo pago
              </div>
              <h2 className="font-sora font-black text-[clamp(32px,5vw,52px)] tracking-tight mb-3">Claude de Cero a Cien</h2>
              <p className="text-gray mb-10">La guía más completa en español sobre Claude AI</p>

              <div className="font-sora font-black text-[72px] bg-[linear-gradient(135deg,#4FC3F7,#6B8EF5,#8B5CF6)] bg-clip-text text-transparent leading-none mb-2">
                $127 USD
              </div>
              <div className="text-gray2 mb-2 text-[16px]">~$2,600 MXN · Precio de lanzamiento</div>
              <div className="font-mono text-[12px] text-cyan uppercase tracking-[2px] mb-10">Pago único · Sin suscripción</div>

              <div className="flex flex-col gap-2.5 text-left max-w-md mx-auto mb-11">
                {[
                  '25 capítulos completos (500+ páginas)',
                  '25 ejercicios prácticos listos para hacer',
                  '5 apéndices de referencia rápida',
                  'Plantillas de CLAUDE.md, settings.json, hooks',
                  'Glosario con 30+ términos técnicos',
                  'Changelog actualizado junio 2026',
                  'Actualizaciones futuras sin costo adicional',
                  'Newsletter exclusiva de novedades Claude + IA',
                  'Acceso inmediato a la plataforma',
                ].map((item) => (
                  <div key={item} className="flex gap-3 text-[14px] text-gray">
                    <span className="text-cyan font-black flex-shrink-0">✓</span>
                    {item}
                  </div>
                ))}
              </div>

              <a
                href={STRIPE_BUY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[linear-gradient(135deg,#4FC3F7,#6B8EF5,#8B5CF6)] text-white font-black text-[20px] px-14 py-5 rounded-full shadow-[0_8px_48px_rgba(79,195,247,0.4)] hover:shadow-[0_14px_60px_rgba(79,195,247,0.5)] hover:-translate-y-0.5 transition-all duration-200"
              >
                Obtener el curso ahora →
              </a>

              <div className="font-mono text-[10px] text-gray2 uppercase tracking-[1.5px] mt-5">
                🔒 Pago seguro con Stripe · SSL cifrado
              </div>

              <div className="mt-8 bg-cyan/[0.04] border border-cyan/15 rounded-[14px] p-5 flex gap-3.5 text-left max-w-md mx-auto">
                <span className="text-2xl flex-shrink-0">🛡️</span>
                <div>
                  <h5 className="font-bold text-[13px] mb-1">Garantía 7 días sin preguntas</h5>
                  <p className="text-[12px] text-gray">Si en los primeros 7 días no estás satisfecho con el curso, te devolvemos el dinero completo.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── CTA FINAL ── */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div
            ref={addFadeRef}
            className="bg-[linear-gradient(135deg,#4FC3F7,#6B8EF5,#8B5CF6)] rounded-[24px] p-12 text-center shadow-[0_8px_50px_rgba(79,195,247,0.25)] opacity-0 translate-y-7 transition-all duration-500"
          >
            <h2 className="font-sora font-black text-[clamp(26px,4vw,38px)] mb-3.5">
              La IA no te va a reemplazar.<br />Alguien que la usa bien, sí.
            </h2>
            <p className="text-[16px] opacity-90 mb-8">Esta guía te pone en ese lado del tablero. Hoy mismo.</p>
            <a
              href="#comprar"
              className="inline-flex items-center gap-2 bg-black/20 border-2 border-white/40 text-white font-bold text-[16px] px-8 py-3.5 rounded-full hover:bg-black/30 transition-colors"
            >
              Empezar ahora →
            </a>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
