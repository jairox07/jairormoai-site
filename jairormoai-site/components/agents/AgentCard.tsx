'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import type { Agent } from '@/lib/agents-data'

interface Props {
  agent: Agent
  onRequestImplementation: (agentSlug: string) => void
}

export function AgentCard({ agent, onRequestImplementation }: Props) {
  return (
    <article className="flex flex-col rounded-2xl border border-white/[0.07] bg-bg2/60 p-6 hover:border-cyan/25 hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-cyan/[0.08] border border-cyan/[0.18] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
          {agent.icon}
        </div>
        <span className="font-mono text-[9px] font-bold uppercase tracking-[1.5px] text-green-400 bg-green-400/10 border border-green-400/25 px-2.5 py-1 rounded-full text-right">
          {agent.roiBadge}
        </span>
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[2px] text-gray2 mb-2">{agent.category}</p>
      <h3 className="font-sora font-bold text-lg leading-snug mb-3">{agent.name}</h3>
      <p className="font-sora text-gray text-sm leading-relaxed flex-1 mb-6">{agent.shortDesc}</p>

      <div className="flex flex-col gap-2.5">
        <Link href={`/automatizaciones-y-agentes/${agent.slug}`}>
          <Button variant="primary" size="sm" className="w-full">Ver Solución y Demo</Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onRequestImplementation(agent.slug)}
        >
          Solicitar Implementación
        </Button>
      </div>
    </article>
  )
}
