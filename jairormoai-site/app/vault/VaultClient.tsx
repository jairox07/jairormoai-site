'use client'
import { useState } from 'react'
import { FilterBar } from '@/components/vault/FilterBar'
import { ProjectCard } from '@/components/vault/ProjectCard'
import { VaultGate } from '@/components/vault/VaultGate'
import type { Project } from '@/lib/types'

interface VaultClientProps {
  projects: Project[]
  isLoggedIn: boolean
}

export function VaultClient({ projects, isLoggedIn }: VaultClientProps) {
  const [activeFilter, setActiveFilter] = useState('all')

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
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  )
}
