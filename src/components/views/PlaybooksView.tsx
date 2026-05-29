"use client";

import { Sparkles, Zap } from "lucide-react";
import { type PLAYBOOKS } from "@/lib/data";

type Playbook = (typeof PLAYBOOKS)[number];
interface Props {
  playbooks: Playbook[];
  setPlaybooks: (fn: (p: Playbook[]) => Playbook[]) => void;
}

export default function PlaybooksView({ playbooks, setPlaybooks }: Props) {
  function toggle(id: string) {
    setPlaybooks(p => p.map(pb => pb.id === id ? { ...pb, enabled: !pb.enabled } : pb));
  }

  const active = playbooks.filter(pb => pb.enabled).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[18px] font-semibold tracking-tight text-ink-900">Playbooks IA</h1>
            <p className="text-[12px] text-ink-500 mt-0.5">
              Automatizaciones pre-configuradas. Cada playbook es un Journey ejecutado por la IA.
            </p>
          </div>
          <span className="text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 font-medium">
            {active} activos
          </span>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {playbooks.map(pb => (
            <div key={pb.id}
                 className={`bg-white border rounded-xl p-5 transition-all ${pb.enabled ? 'border-ink-200' : 'border-ink-100 opacity-60'}`}>
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`grid size-9 shrink-0 place-items-center rounded-lg ${pb.enabled ? 'bg-primary-soft' : 'bg-ink-100'}`}>
                  <Sparkles size={16} className={pb.enabled ? 'text-primary' : 'text-ink-400'} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[14px] font-semibold text-ink-900">{pb.name}</h3>
                    {pb.enabled && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5 font-medium">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-ink-500 mb-3 leading-relaxed">{pb.desc}</p>

                  {/* Trigger */}
                  <div className="flex items-center gap-1.5 text-[11px] text-ink-600 mb-3">
                    <Zap size={11} className="text-amber-500" />
                    <span className="font-medium">Trigger:</span>
                    <span>{pb.trigger}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-[11px] text-ink-400">
                    <span><span className="font-semibold text-ink-700 tabular-nums">{pb.uses.toLocaleString()}</span> activaciones</span>
                    <span><span className="font-semibold text-emerald-600 tabular-nums">{pb.conv}</span> conversiones</span>
                    <span><span className="font-semibold text-ink-700">{Math.round((pb.conv/Math.max(pb.uses,1))*100)}%</span> tasa</span>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggle(pb.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${pb.enabled ? 'bg-primary' : 'bg-ink-200'}`}
                >
                  <span className={`inline-block size-3.5 rounded-full bg-white shadow transition-transform ${pb.enabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-ink-200 bg-ink-50 p-4 text-[12px] text-ink-600">
          <p className="font-semibold text-ink-800 mb-1">¿Quieres crear un playbook personalizado?</p>
          <p>Ve a <strong>AI Studio → Journey Builder</strong> para diseñar flujos de automatización con drag-and-drop usando más de 80 tipos de nodos.</p>
        </div>
      </div>
    </div>
  );
}
