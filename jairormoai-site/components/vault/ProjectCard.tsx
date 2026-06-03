import { cn } from '@/lib/utils'
import type { Project } from '@/lib/types'

const CATEGORY_LABELS: Record<string, string> = {
  automatizaciones: 'Automatización',
  ml: 'Machine Learning',
  llms: 'LLMs',
  rags: 'RAG',
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className={cn(
        'relative flex flex-col rounded-2xl border p-6 transition-all duration-300',
        project.featured
          ? 'border-cyan/25 bg-bg2/80'
          : 'border-white/[0.07] bg-bg2/40 hover:border-white/[0.12]'
      )}
    >
      {project.featured && (
        <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_6px_#4FC3F7]" />
      )}

      <div className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-cyan bg-cyan/[0.07] border border-cyan/[0.15] px-3 py-1 rounded-full w-fit mb-4">
        {CATEGORY_LABELS[project.category] || project.category}
      </div>

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
