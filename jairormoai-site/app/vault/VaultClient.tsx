'use client'
import { useState } from 'react'
import { FilterBar } from '@/components/vault/FilterBar'
import { ProjectCard } from '@/components/vault/ProjectCard'
import { CommentSection } from '@/components/comments/CommentSection'
import type { Project } from '@/lib/types'

interface VaultClientProps {
  projects: Project[]
  isLoggedIn: boolean
  userId: string | null
}

function InstallGuideBox() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-10 rounded-2xl border border-cyan/15 bg-cyan/[0.03] overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-cyan">
          📦 ¿Cómo instalo un skill descargado?
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-cyan transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-6 grid md:grid-cols-2 gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[2px] text-gray2 mb-2">Claude Desktop / App</div>
            <ol className="font-sora text-sm text-gray space-y-1.5 list-decimal list-inside">
              <li>Abre Configuración → Capacidades → Skills</li>
              <li>Sube el archivo .md descargado, o pégalo en las instrucciones de un Proyecto</li>
              <li>Pide la tarea en el chat — Claude activa el skill solo</li>
            </ol>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[2px] text-gray2 mb-2">Terminal (Claude Code / CLI)</div>
            <ol className="font-sora text-sm text-gray space-y-1.5 list-decimal list-inside">
              <li>Guarda el archivo en <code className="text-cyan">~/.claude/skills/&lt;nombre&gt;/SKILL.md</code></li>
              <li>Reinicia Claude Code</li>
              <li>Invócalo con <code className="text-cyan">/&lt;nombre-skill&gt;</code> o describe la tarea</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}

export function VaultClient({ projects, isLoggedIn, userId }: VaultClientProps) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [expandedComments, setExpandedComments] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = projects
    .filter((p) => activeFilter === 'all' || p.category === activeFilter)
    .filter((p) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tech_stack?.some((t: string) => t.toLowerCase().includes(q))
      )
    })

  return (
    <>
      <InstallGuideBox />

      {/* Search */}
      <div className="relative mb-4 max-w-lg">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar recursos, prompts, skills..."
          className="w-full pl-9 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl font-mono text-[12px] text-white placeholder:text-gray2 focus:outline-none focus:border-cyan/40 focus:bg-white/[0.06] transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray2 hover:text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="mb-10">
        <FilterBar active={activeFilter} onChange={setActiveFilter} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-gray font-sora">
          No hay recursos en esta categoría todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <div key={project.id} className="flex flex-col">
              <ProjectCard project={project} isLoggedIn={isLoggedIn} />
              {isLoggedIn && (
                <>
                  <button
                    onClick={() => setExpandedComments(expandedComments === project.id ? null : project.id)}
                    className="mt-2 font-mono text-[10px] text-gray2 hover:text-cyan transition-colors text-left px-1"
                  >
                    {expandedComments === project.id ? '▲ Cerrar comentarios' : '▼ Ver comentarios'}
                  </button>
                  {expandedComments === project.id && (
                    <div className="rounded-2xl border border-white/[0.07] bg-bg2/40 p-6 mt-1">
                      <CommentSection projectId={project.id} userId={userId} />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
