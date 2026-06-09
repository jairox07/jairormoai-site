'use client'
import { useState } from 'react'
import { CATEGORY_COLORS } from '@/lib/constants'
import type { Project } from '@/lib/types'

const CATEGORY_LABELS: Record<string, string> = {
  general:      'General',
  claude:       'Claude',
  gemini:       'Gemini',
  skills:       'Skills',
  recursos:     'Recursos',
  legal:        '⚖️ Abogados',
  inmobiliaria: '🏡 Inmobiliaria',
  comunidad:    'Proyectos Comunidad',
  automatizaciones: 'Automatización',
  ml:           'Machine Learning',
  llms:         'LLMs',
  rags:         'RAG',
}

const DEFAULT_COLOR = {
  badge: 'bg-white/[0.06] border-white/[0.12] text-gray2',
  card:  'border-white/[0.07] bg-bg2/40',
  accent: '#94A3B8',
}

export function ProjectCard({ project }: { project: Project }) {
  const [copied, setCopied] = useState(false)
  const colors = CATEGORY_COLORS[project.category] ?? DEFAULT_COLOR

  const onShare = async () => {
    const url = project.demo_url || window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      if (navigator.share) navigator.share({ title: project.title, url })
    }
  }

  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:brightness-110 ${colors.card}`}
    >
      {/* Top row: badge + share */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <span className={`font-mono text-[10px] font-bold uppercase tracking-[2px] border px-3 py-1 rounded-full w-fit ${colors.badge}`}>
          {CATEGORY_LABELS[project.category] || project.category}
        </span>
        <button
          onClick={onShare}
          title="Compartir"
          className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray2 hover:border-white/20 transition-all duration-200"
        >
          {copied ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          )}
        </button>
      </div>

      {project.featured && (
        <div className="absolute top-4 right-12 w-1.5 h-1.5 rounded-full" style={{ background: colors.accent, boxShadow: `0 0 6px ${colors.accent}` }} />
      )}

      <h3 className="font-sora font-bold text-lg mb-3 leading-snug">{project.title}</h3>
      <p className="font-sora text-gray text-sm leading-relaxed flex-1 mb-5">{project.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {project.tech_stack.map((tech) => (
          <span key={tech} className="font-mono text-[10px] text-gray2 bg-white/[0.04] border border-white/[0.07] px-2.5 py-1 rounded-md">
            {tech}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-auto">
        {project.demo_url && (
          <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
            className="font-mono text-[11px] font-bold uppercase tracking-wider hover:underline"
            style={{ color: colors.accent }}>
            Demo →
          </a>
        )}
        {project.repo_url && (
          <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
            className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray2 hover:text-white">
            Código →
          </a>
        )}
        {project.is_free && project.download_url ? (
          <a
            href={project.download_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => fetch('/api/activity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_type: 'download', metadata: { project_id: project.id, title: project.title } }) })}
            className="ml-auto flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider border px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ color: colors.accent, borderColor: `${colors.accent}40`, background: `${colors.accent}12` }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Descargar gratis
          </a>
        ) : !project.is_free && project.price_cents > 0 ? (
          <span className="ml-auto font-mono text-[11px] font-bold border px-3 py-1.5 rounded-lg"
            style={{ color: colors.accent, borderColor: `${colors.accent}40`, background: `${colors.accent}12` }}>
            ${(project.price_cents / 100).toFixed(0)} USD
          </span>
        ) : null}
      </div>
    </article>
  )
}
