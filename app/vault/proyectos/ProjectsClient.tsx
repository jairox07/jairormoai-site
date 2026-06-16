'use client'

import { useState } from 'react'

interface Project {
  id: string
  slug: string
  title: string
  description: string
  category: string
  tag: string
  tagColor: string
  status: 'live' | 'soon' | 'beta'
  url?: string
  herramienta: number
  isNew?: boolean
}

const PROJECTS: Project[] = [
  {
    id: 'legal-laboral',
    slug: 'legal-laboral',
    title: 'Generador de Contratos Laborales',
    description: 'Genera contratos de trabajo conformes a la LFT (2024). Tiempo indeterminado, determinado, obra y prestación de servicios. Descarga en Word, PDF o TXT.',
    category: 'Legal MX',
    tag: 'Laboral · STPS',
    tagColor: 'purple',
    status: 'live',
    url: '/vault/proyectos/legal-laboral',
    herramienta: 1,
    isNew: true,
  },
  {
    id: 'legal-fiscal',
    slug: 'legal-fiscal',
    title: 'Calculadora Fiscal SAT',
    description: 'Calcula ISR, IVA, retenciones y deducciones. Regímenes: RESICO, RIF, personas morales. CFDI validado y declaraciones mensuales.',
    category: 'Legal MX',
    tag: 'Fiscal · SAT',
    tagColor: 'amber',
    status: 'soon',
    herramienta: 2,
  },
  {
    id: 'legal-corporativo',
    slug: 'legal-corporativo',
    title: 'Generador de Documentos Corporativos',
    description: 'Actas de asamblea, poderes notariales, constitución de sociedades (SA, SAPI, SRL). Conforme al Código de Comercio y LGSM.',
    category: 'Legal MX',
    tag: 'Corporativo · IMPI',
    tagColor: 'teal',
    status: 'soon',
    herramienta: 3,
  },
  {
    id: 'legal-datos',
    slug: 'legal-datos',
    title: 'Verificador LFPDPPP',
    description: 'Genera avisos de privacidad conformes a la Ley Federal de Protección de Datos Personales. Cumplimiento INAI, principios y derechos ARCO.',
    category: 'Legal MX',
    tag: 'Datos · INAI',
    tagColor: 'coral',
    status: 'soon',
    herramienta: 4,
  },
  {
    id: 'legal-pi',
    slug: 'legal-pi',
    title: 'Guía PI y Marcas IMPI',
    description: 'Registro de marcas ante el IMPI paso a paso, derechos de autor INDAUTOR, clasificación de Niza y estrategia de protección.',
    category: 'Legal MX',
    tag: 'Marcas · IMPI',
    tagColor: 'blue',
    status: 'soon',
    herramienta: 5,
  },
  {
    id: 'legal-contratos',
    slug: 'legal-contratos',
    title: 'Revisor de Contratos Civiles',
    description: 'Analiza y genera contratos civiles y mercantiles. Detecta cláusulas abusivas, recomienda ajustes conforme al Código Civil Federal y Código de Comercio.',
    category: 'Legal MX',
    tag: 'Civil · Comercial',
    tagColor: 'green',
    status: 'soon',
    herramienta: 6,
  },
]

const tagStyles: Record<string, string> = {
  purple: 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#a78bfa]',
  amber:  'bg-amber-500/10 border-amber-500/30 text-amber-300',
  teal:   'bg-teal-500/10 border-teal-500/30 text-teal-300',
  coral:  'bg-rose-500/10 border-rose-500/30 text-rose-300',
  blue:   'bg-blue-500/10 border-blue-500/30 text-blue-300',
  green:  'bg-green-500/10 border-green-500/30 text-green-300',
}

export default function ProjectsClient() {
  const [filter, setFilter] = useState<'all' | 'live' | 'soon'>('all')

  const filtered = PROJECTS.filter(p =>
    filter === 'all' ? true : p.status === filter
  )

  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6 text-xs font-mono text-gray2">
            <a href="/vault" className="hover:text-cyan transition-colors">Bóveda IA</a>
            <span>/</span>
            <span className="text-cyan">Proyectos</span>
          </div>

          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-[2.5px] uppercase text-cyan bg-cyan/[0.07] border border-cyan/[0.18] px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_6px_#4FC3F7] animate-pulse" />
            Proyectos · Stack Legal MX
          </div>

          <h1 className="font-sora font-black text-4xl md:text-5xl mb-5 leading-tight">
            Herramientas interactivas<br />
            <span className="text-cyan">listas para usar.</span>
          </h1>
          <p className="font-sora text-gray text-lg max-w-2xl">
            Aplicaciones IA construidas con el marco legal mexicano vigente. Sin instalación, sin backend. Abre y usa.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'live', label: '✦ Disponibles' },
            { key: 'soon', label: 'Próximamente' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`
                font-mono text-[11px] font-bold tracking-[1.5px] uppercase px-4 py-2 rounded-full border transition-all duration-200
                ${filter === f.key
                  ? 'bg-cyan/10 border-cyan/40 text-cyan'
                  : 'bg-white/[0.03] border-white/10 text-gray2 hover:text-gray hover:border-white/20'}
              `}
            >
              {f.label}
            </button>
          ))}
          <span className="font-mono text-[10px] text-gray2 ml-2">
            {filtered.length} de {PROJECTS.length} herramientas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="mt-16 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0 text-lg">
              ⚡
            </div>
            <div>
              <p className="font-sora font-bold text-sm mb-1">Stack en construcción activa</p>
              <p className="font-sora text-gray text-sm leading-relaxed">
                Se agregan herramientas cada semana. El marco normativo se actualiza con cada reforma publicada en el DOF.
                Todas las herramientas son informativas — para contratos con plena eficacia legal se recomienda revisión por abogado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const isLive = project.status === 'live'

  return (
    <div className={`
      group relative rounded-2xl border p-6 transition-all duration-300 flex flex-col
      ${isLive
        ? 'bg-bg3 border-white/[0.08] hover:border-cyan/30 hover:bg-cyan/[0.02] cursor-pointer'
        : 'bg-bg2/50 border-white/[0.05] opacity-70'}
    `}>
      <div className="flex items-center justify-between mb-4">
        <span className={`
          font-mono text-[9px] font-bold tracking-[2px] uppercase px-3 py-1.5 rounded-full border
          ${tagStyles[project.tagColor]}
        `}>
          {project.tag}
        </span>
        <div className="flex items-center gap-2">
          {project.isNew && (
            <span className="font-mono text-[9px] font-bold tracking-[1px] uppercase bg-cyan/15 border border-cyan/30 text-cyan px-2 py-1 rounded-full">
              nuevo
            </span>
          )}
          {isLive ? (
            <span className="flex items-center gap-1 font-mono text-[9px] text-cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_5px_#4FC3F7] animate-pulse" />
              live
            </span>
          ) : (
            <span className="font-mono text-[9px] text-gray2">soon</span>
          )}
        </div>
      </div>

      <div className="font-mono text-[42px] font-bold text-white/[0.05] leading-none mb-2 select-none">
        {String(project.herramienta).padStart(2, '0')}
      </div>

      <h3 className="font-sora font-bold text-[15px] mb-2 leading-tight group-hover:text-cyan transition-colors duration-200">
        {project.title}
      </h3>
      <p className="font-sora text-gray text-[13px] leading-relaxed flex-1">
        {project.description}
      </p>

      <div className="mt-5 pt-4 border-t border-white/[0.05]">
        {isLive && project.url ? (
          <a
            href={project.url}
            className="inline-flex items-center gap-2 font-sora font-bold text-[12px] text-cyan hover:gap-3 transition-all duration-200"
          >
            Abrir herramienta
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        ) : (
          <span className="font-mono text-[11px] text-gray2 uppercase tracking-wider">
            En desarrollo
          </span>
        )}
      </div>
    </div>
  )
}
