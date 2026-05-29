"use client";

import { Printer } from "lucide-react";
import { ANALYTICS_KPIs, REVENUE_SERIES, FUNNEL, CHANNEL_MIX } from "@/lib/data";

export default function AnalyticsView() {
  const maxRevenue = Math.max(...REVENUE_SERIES);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-6 print:px-0 print:py-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[18px] font-semibold tracking-tight text-ink-900">Analytics</h1>
            <p className="text-[12px] text-ink-500 mt-0.5">Últimos 30 días · Actualizado hace 2 min</p>
          </div>
          <button onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-[12px] font-medium text-ink-700 hover:bg-ink-50 no-print">
            <Printer size={13} /> Exportar PDF
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {Object.values(ANALYTICS_KPIs).map(kpi => (
            <div key={kpi.label} className="bg-white border border-ink-200 rounded-xl p-4">
              <p className="text-[11px] text-ink-500 font-semibold uppercase tracking-wider mb-1">{kpi.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-[26px] font-bold text-ink-900">
                  {typeof kpi.value === 'number' && kpi.label.includes('Ingre')
                    ? `$${kpi.value.toLocaleString()}`
                    : kpi.value}
                </p>
                <span className={`text-[11px] font-semibold rounded px-1.5 py-0.5 ${kpi.up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {kpi.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Revenue chart */}
          <div className="col-span-2 bg-white border border-ink-200 rounded-xl p-5">
            <p className="text-[13px] font-semibold text-ink-900 mb-4">Ingresos · últimos 14 días</p>
            <div className="flex items-end gap-1 h-32">
              {REVENUE_SERIES.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{ height: `${(v / maxRevenue) * 100}%`, background: 'var(--primary)', opacity: 0.8 + (i / REVENUE_SERIES.length) * 0.2 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[9px] text-ink-400">{days[0]}</span>
              <span className="text-[9px] text-ink-400">{days[6]}</span>
              <span className="text-[9px] text-ink-400">{days[13]}</span>
            </div>
          </div>

          {/* Channel mix */}
          <div className="bg-white border border-ink-200 rounded-xl p-5">
            <p className="text-[13px] font-semibold text-ink-900 mb-4">Mix de canales</p>
            <div className="space-y-2.5">
              {CHANNEL_MIX.map(c => (
                <div key={c.ch}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-ink-700 font-medium">{c.ch}</span>
                    <span className="text-ink-500 tabular-nums">{c.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-white border border-ink-200 rounded-xl p-5">
          <p className="text-[13px] font-semibold text-ink-900 mb-4">Embudo de conversión</p>
          <div className="space-y-2">
            {FUNNEL.map((stage, i) => (
              <div key={stage.stage} className="flex items-center gap-4">
                <span className="text-[12px] text-ink-700 w-44 shrink-0">{stage.stage}</span>
                <div className="flex-1 h-8 rounded-lg overflow-hidden bg-ink-100 relative">
                  <div
                    className="h-full rounded-lg flex items-center px-3 transition-all"
                    style={{ width: `${stage.pct}%`, background: `hsl(${248 - i * 15},80%,${62 - i * 4}%)` }}
                  >
                    <span className="text-[11px] font-semibold text-white">{stage.value}</span>
                  </div>
                </div>
                <span className="text-[12px] text-ink-500 tabular-nums w-10 text-right">{stage.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
