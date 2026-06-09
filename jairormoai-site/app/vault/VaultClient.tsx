'use client'
import { useState } from 'react'
import { FilterBar } from '@/components/vault/FilterBar'
import { ProjectCard } from '@/components/vault/ProjectCard'
import { VaultGate } from '@/components/vault/VaultGate'
import { CommentSection } from '@/components/comments/CommentSection'
import type { Project } from '@/lib/types'

interface VaultClientProps {
  projects: Project[]
  isLoggedIn: boolean
  userId: string | null
}

export function VaultClient({ projects, isLoggedIn, userId }: VaultClientProps) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [expandedComments, setExpandedComments] = useState<string | null>(null)

  if (!isLoggedIn) {
    return <VaultGate />
  }

  const filtered = activeFilter === 'all'
    ? projects
    : projects.filter((p) => p.category === activeFilter)

  return (
    <>
      <div className="mb-10">
        <FilterBar active={activeFilter} onChange={setActiveFilter} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-gray font-sora">
          No hay proyectos en esta categoría todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <div key={project.id} className="flex flex-col">
              <ProjectCard project={project} />
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
            </div>
          ))}
        </div>
      )}
    </>
  )
}
