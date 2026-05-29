"use client";

import { TrendingUp } from "lucide-react";
import { type Lead, type KanbanStatus } from "@/lib/data";

interface Props { leads: Lead[]; salesStatuses: KanbanStatus[]; }

const PROB: Record<string, number> = {
  new: 0.1, qualified: 0.25, contacted: 0.4,
  proposal: 0.6, scheduled: 0.75, won: 1, lost: 0,
};

export default function PipelineView({ leads, salesStatuses }: Props) {
  const totalRevenue = leads
    .filter(l => l.column !== 'lost')
    .reduce((acc, l) => acc + l.value * (PROB[l.column] ?? 0.5), 0);

  const byStatus = salesStatuses.map(s => ({
    ...s,
    leads: leads.filter(l => l.column === s.id),
    total: leads.filter(l => l.column === s.id).reduce((a, l) => a + l.value, 0),
    weighted: leads.filter(l => l.column === s.id).reduce((a, l) => a + l.value * (PROB[s.id] ?? 0.5), 0),
    prob: PROB[s.id] ?? 0.5,
  }));

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[18px] font-semibold tracking-tight text-ink-900">Pipeline de Ventas</h1>
          <p className="text-[12px] text-ink-500 mt-0.5">Forecast ponderado por probabilidad de cierre</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-ink-200 rounded-xl p-5">
            <p className="text-[11px] text-ink-500 uppercase tracking-wider font-semibold mb-1">Forecast ponderado</p>
            <p className="text-[28px] font-bold text-ink-900">${Math.round(totalRevenue).toLocaleString()}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">+18% vs mes anterior</p>
          </div>
          <div className="bg-white border border-ink-200 rounded-xl p-5">
            <p className="text-[11px] text-ink-500 uppercase tracking-wider font-semibold mb-1">En pipeline</p>
            <p className="text-[28px] font-bold text-ink-900">
              ${leads.filter(l=>l.column!=='lost'&&l.column!=='won').reduce((a,l)=>a+l.value,0).toLocaleString()}
            </p>
            <p className="text-[11px] text-ink-400 mt-0.5">{leads.filter(l=>l.column!=='lost'&&l.column!=='won').length} leads activos</p>
          </div>
          <div className="bg-white border border-ink-200 rounded-xl p-5">
            <p className="text-[11px] text-ink-500 uppercase tracking-wider font-semibold mb-1">Ventas cerradas</p>
            <p className="text-[28px] font-bold text-emerald-600">
              ${leads.filter(l=>l.column==='won').reduce((a,l)=>a+l.value,0).toLocaleString()}
            </p>
            <p className="text-[11px] text-ink-400 mt-0.5">{leads.filter(l=>l.column==='won').length} cierres este mes</p>
          </div>
        </div>

        {/* Pipeline table */}
        <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-ink-100 flex items-center gap-2">
            <TrendingUp size={14} className="text-ink-500" />
            <span className="text-[13px] font-semibold text-ink-900">Etapas del pipeline</span>
          </div>
          <table className="w-full">
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr>
                {['Etapa', 'Leads', 'Valor total', 'Probabilidad', 'Valor ponderado', ''].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {byStatus.filter(s => s.id !== 'lost').map(s => (
                <tr key={s.id} className="hover:bg-ink-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-[13px] font-medium text-ink-800">{s.title}</span>
                    </div>
                    <p className="text-[10px] text-ink-400 ml-4.5">{s.hint}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-ink-700 tabular-nums">{s.leads.length}</td>
                  <td className="px-5 py-3.5 text-[13px] text-ink-800 tabular-nums font-medium">
                    ${s.total.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-ink-100 overflow-hidden max-w-[80px]">
                        <div className="h-full rounded-full" style={{ width: `${s.prob * 100}%`, background: s.color }} />
                      </div>
                      <span className="text-[12px] text-ink-600 tabular-nums">{Math.round(s.prob * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold tabular-nums" style={{ color: s.color }}>
                    ${Math.round(s.weighted).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    {s.leads.slice(0, 2).map(l => (
                      <span key={l.id} className="text-[10px] text-ink-400 block truncate max-w-[120px]">{l.name}</span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
