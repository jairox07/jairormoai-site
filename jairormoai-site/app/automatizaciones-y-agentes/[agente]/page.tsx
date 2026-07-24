'use client'
import { useState, use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EyebrowPill } from '@/components/ui/EyebrowPill'
import { Button } from '@/components/ui/Button'
import { WhatsAppSimulator } from '@/components/agents/WhatsAppSimulator'
import { ImplementationModal } from '@/components/agents/ImplementationModal'
import { getAgentBySlug } from '@/lib/agents-data'

interface Props {
  params: Promise<{ agente: string }>
}

export default function AgentDetailPage({ params }: Props) {
  const { agente } = use(params)
  const agent = getAgentBySlug(agente)
  const [modalOpen, setModalOpen] = useState(false)

  if (!agent) notFound()

  return (
    <div className="min-h-screen pb-32 pt-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">

        <Link
          href="/automatizaciones-y-agentes"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[2px] text-gray2 hover:text-cyan transition-colors mb-8"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Automatizaciones y Agentes
        </Link>

        {/* Header */}
        <div className="mb-16">
          <EyebrowPill className="mb-5">{agent.category}</EyebrowPill>
          <div className="flex items-start gap-4 mb-5">
            <span className="text-5xl">{agent.icon}</span>
            <h1 className="font-sora font-black text-3xl md:text-5xl leading-tight pt-1">
              {agent.name}
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-6">
              <p className="font-mono text-[10px] uppercase tracking-[2px] text-red-400 mb-2">El problema</p>
              <p className="font-sora text-gray text-sm leading-relaxed">{agent.problem}</p>
            </div>
            <div className="rounded-2xl border border-green-400/20 bg-green-400/[0.04] p-6">
              <p className="font-mono text-[10px] uppercase tracking-[2px] text-green-400 mb-2">El ahorro</p>
              <p className="font-sora text-white text-sm leading-relaxed font-medium">{agent.savings}</p>
            </div>
          </div>
        </div>

        {/* Cómo funciona */}
        <div className="mb-16">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-gray2 mb-8">Cómo funciona</p>
          <div className="grid md:grid-cols-3 gap-5">
            {agent.steps.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border border-white/[0.07] bg-bg2/60 p-6">
                <span className="font-mono text-[11px] text-cyan font-bold">Paso {i + 1}</span>
                <h3 className="font-sora font-bold text-base mt-2 mb-2">{step.title}</h3>
                <p className="font-sora text-gray text-sm leading-relaxed">{step.desc}</p>
                {i < agent.steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-cyan/40">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Demo interactiva */}
        <div className="mb-16">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-gray2 mb-8 text-center">
            El agente operando en tiempo real
          </p>
          <WhatsAppSimulator messages={agent.chatDemo} />
        </div>

        {/* CTA inline */}
        <div className="rounded-2xl border border-cyan/20 bg-cyan/[0.04] p-8 text-center">
          <p className="font-sora text-white font-bold text-lg mb-6">
            ¿Listo para implementar {agent.name.toLowerCase()} en tu empresa?
          </p>
          <Button variant="primary" size="lg" onClick={() => setModalOpen(true)}>
            Implementar este Agente en mi Empresa
          </Button>
        </div>
      </div>

      {/* Sticky floating CTA (mobile-first) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-bg/90 backdrop-blur-xl border-t border-white/[0.07] md:hidden">
        <Button variant="primary" className="w-full" onClick={() => setModalOpen(true)}>
          Implementar este Agente en mi Empresa
        </Button>
      </div>

      {/* Sticky floating CTA (desktop) */}
      <div className="hidden md:block fixed bottom-8 right-8 z-40">
        <Button variant="primary" size="lg" onClick={() => setModalOpen(true)} className="shadow-[0_8px_40px_rgba(79,195,247,0.5)]">
          Implementar este Agente →
        </Button>
      </div>

      <ImplementationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedAgentSlug={agent.slug}
      />
    </div>
  )
}
