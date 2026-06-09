'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/types'

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  gemini: 'Gemini',
  claude: 'Claude',
  skills: 'Skills',
  recursos: 'Recursos',
  comunidad: 'Proyectos Comunidad',
  automatizaciones: 'Automatización',
  ml: 'Machine Learning',
  llms: 'LLMs',
  rags: 'RAG',
}

export function ProjectCard({ project }: { project: Project }) {
  const [copied, setCopied] = useState(false)

  const onShare = async () => {
    const url = project.demo_url || window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: share via navigator.share if available
      if (navigator.share) {
        navigator.share({ title: project.title, url })
      }
    }
  }

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-2xl border p-6 transition-all duration-300',
        project.featured
          ? 'border-cyan/25 bg-bg2/80'
          : 'border-white/[0.07] bg-bg2/40 hover:border-white/[0.12]'
      )}
    >
      {/* Top row: category + share */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-cyan bg-cyan/[0.07] border border-cyan/[0.15] px-3 py-1 rounded-full w-fit">
          {CATEGORY_LABELS[project.category] || project.category}
        </div>
        <button
          onClick={onShare}
          title="Compartir"
          className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray2 hover:text-cyan hover:border-cyan/30 transition-all duration-200"
        >
          {copied ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
        <div className="absolute top-4 right-12 w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_6px_#4FC3F7]" />
      )}

      <h3 className="font-sora font-bold text-lg mb-3 leading-snug">{project.title}</h3>
      <p className="font-sora text-gray text-sm leading-relaxed flex-1 mb-5">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {project.tech_stack.map((tech) => (
          <span key={tech} className="font-mono text-[10px] text-gray2 bg-white/[0.04] border border-white/[0.07] px-2.5 py-1 rounded-md">
            {tech}
          </span>
        ))}
      </div>

      {(project.demo_url || project.repo_url) && (
        <div className="flex gap-3 mt-auto">
          {project.demo_url && (
            <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
              className="font-mono text-[11px] font-bold uppercase tracking-wider text-cyan hover:underline">
              Demo →
            </a>
          )}
          {project.repo_url && (
            <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
              className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray2 hover:text-white">
              Código →
            </a>
          )}
        </div>
      )}
    </article>
  )
}
