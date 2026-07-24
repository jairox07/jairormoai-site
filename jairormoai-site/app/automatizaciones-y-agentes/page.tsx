'use client'
import { useState } from 'react'
import { EyebrowPill } from '@/components/ui/EyebrowPill'
import { Button } from '@/components/ui/Button'
import { AgentCard } from '@/components/agents/AgentCard'
import { ImplementationModal } from '@/components/agents/ImplementationModal'
import { AGENTS } from '@/lib/agents-data'

export default function AutomatizacionesYAgentesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [preselected, setPreselected] = useState<string | undefined>(undefined)

  function openModal(agentSlug?: string) {
    setPreselected(agentSlug)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <EyebrowPill live className="mb-6">Automatizaciones y Agentes</EyebrowPill>
          <h1 className="font-sora font-black text-4xl md:text-6xl mb-6 leading-[1.1]">
            Agentes de Inteligencia Artificial<br />
            <span className="text-cyan">Listos para Desplegar</span> en tu Negocio
          </h1>
          <p className="font-sora text-gray text-lg md:text-xl leading-relaxed mb-10">
            Sin desarrollos de meses. Soluciones empaquetadas en WhatsApp e integradas a tu flujo de trabajo en menos de 24 horas.
          </p>
          <Button variant="primary" size="lg" onClick={() => openModal()}>
            Hablar con un Representante
          </Button>
        </div>

        {/* Grid de soluciones */}
        <div className="mb-6">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-gray2 mb-8 text-center">
            Elige el agente para tu operación
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENTS.map((agent) => (
            <AgentCard key={agent.slug} agent={agent} onRequestImplementation={openModal} />
          ))}
        </div>

        {/* CTA final */}
        <div className="mt-20 rounded-2xl border border-cyan/20 bg-cyan/[0.04] p-10 text-center">
          <p className="font-sora text-white font-bold text-xl mb-3">
            ¿No encuentras el agente exacto para tu negocio?
          </p>
          <p className="font-sora text-gray text-sm mb-8 max-w-lg mx-auto">
            Diseñamos automatizaciones a la medida de tu operación. Cuéntanos tu proceso y te decimos qué se puede automatizar en menos de 24 horas.
          </p>
          <Button variant="primary" size="lg" onClick={() => openModal()}>
            Solicitar Implementación
          </Button>
        </div>
      </div>

      <ImplementationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedAgentSlug={preselected}
      />
    </div>
  )
}
