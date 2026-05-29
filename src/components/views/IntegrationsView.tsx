"use client";

import { useState } from "react";
import { Copy, RefreshCw, Plus, Trash2, CheckCircle2, ExternalLink } from "lucide-react";
import { CLAUDE_MODELS } from "@/lib/data";

const API_KEY = "sk_live_convers_Xk9mP2qL4nR8vT1wZ5yA3jB7cD0eF6gH";

const STRIPE_INFO = { connected: true,  accountId: 'acct_1P...xyz', mode: 'Producción', since: '15 ene 2026' };
const CAL_INFO   = { connected: false };

const INIT_WEBHOOKS = [
  { id: 'wh1', name: 'Nuevo Lead → CRM Propio',   url: 'https://mi-crm.com/webhook/convers',             event: 'lead.created',      active: true  },
  { id: 'wh2', name: 'Pago Confirmado → Slack',   url: 'https://hooks.slack.com/services/T00.../B00.../xyz', event: 'payment.succeeded', active: true  },
];

export default function IntegrationsView() {
  const [showKey,   setShowKey]   = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [webhooks,  setWebhooks]  = useState(INIT_WEBHOOKS);
  const [stripe,    setStripe]    = useState(STRIPE_INFO);
  const [calendar,  setCalendar]  = useState(CAL_INFO);
  const [claudeModel, setClaudeModel] = useState('claude-sonnet-4-5');

  function copyKey() {
    navigator.clipboard.writeText(API_KEY).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const USAGE_STATS = { tokens: 42180, cost: 18.40, limit: 50000 };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-ink-900">Integraciones y API</h1>
          <p className="text-[12px] text-ink-500 mt-0.5">Conecta Convers con tu stack de herramientas existente.</p>
        </div>

        {/* ── Stripe ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-3">Pagos</h2>
          <div className="bg-white border border-ink-200 rounded-xl p-5 flex items-center gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#635bff] text-white text-[16px] font-bold shadow-sm">S</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-semibold text-ink-900">Stripe</h3>
                {stripe.connected && <CheckCircle2 size={13} className="text-emerald-500" />}
              </div>
              <p className="text-[11px] text-ink-400 mt-0.5">
                {stripe.connected
                  ? `Cuenta: ${stripe.accountId} · Modo: ${stripe.mode} · Desde ${stripe.since}`
                  : 'Acepta pagos directamente en el chat con Payment Links dinámicos.'}
              </p>
            </div>
            <button
              onClick={() => setStripe(p => ({ ...p, connected: !p.connected }))}
              className={`shrink-0 flex items-center gap-1.5 rounded-md px-4 py-2 text-[12px] font-medium transition-colors ${
                stripe.connected ? 'border border-ink-200 text-ink-600 hover:bg-ink-50' : 'bg-[#635bff] text-white hover:opacity-90'
              }`}
            >
              <ExternalLink size={11} />
              {stripe.connected ? 'Configurar' : 'Conectar Stripe'}
            </button>
          </div>
        </section>

        {/* ── Google Calendar ─────────────────────────────────────── */}
        <section>
          <h2 className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-3">Calendarios</h2>
          <div className="bg-white border border-ink-200 rounded-xl p-5 flex items-center gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white border border-ink-200 shadow-sm text-[13px] font-bold">
              <span className="bg-gradient-to-br from-blue-500 via-green-500 to-yellow-400 bg-clip-text text-transparent">G</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-semibold text-ink-900">Google Calendar</h3>
                {calendar.connected && <CheckCircle2 size={13} className="text-emerald-500" />}
              </div>
              <p className="text-[11px] text-ink-400 mt-0.5">
                La IA consulta disponibilidad y agenda citas directamente en tu Google Calendar.
              </p>
            </div>
            <button
              onClick={() => setCalendar(p => ({ ...p, connected: !p.connected }))}
              className={`shrink-0 flex items-center gap-1.5 rounded-md px-4 py-2 text-[12px] font-medium transition-colors ${
                calendar.connected ? 'border border-ink-200 text-ink-600 hover:bg-ink-50' : 'bg-ink-900 text-white hover:bg-ink-800'
              }`}
            >
              <ExternalLink size={11} />
              {calendar.connected ? 'Desconectar' : 'Conectar Google'}
            </button>
          </div>
        </section>

        {/* ── Claude / IA ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-3">Inteligencia Artificial · Claude</h2>
          <div className="bg-white border border-ink-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[13px] font-semibold text-ink-900">Modelo activo</p>
                <p className="text-[11px] text-ink-400 mt-0.5">El modelo se selecciona por tarea automáticamente (ver docs)</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-semibold text-ink-900 tabular-nums">{USAGE_STATS.tokens.toLocaleString()} / {USAGE_STATS.limit.toLocaleString()} tokens</p>
                <p className="text-[10px] text-ink-400">${USAGE_STATS.cost.toFixed(2)} USD este mes</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden mb-4">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(USAGE_STATS.tokens / USAGE_STATS.limit) * 100}%` }} />
            </div>
            <div className="space-y-2">
              {CLAUDE_MODELS.map(m => (
                <button key={m.id} onClick={() => setClaudeModel(m.id)}
                        className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                          claudeModel === m.id ? 'border-primary bg-primary-soft' : 'border-ink-200 hover:border-ink-300'
                        }`}>
                  <div className={`grid size-4 shrink-0 place-items-center rounded-full border ${claudeModel === m.id ? 'border-primary bg-primary' : 'border-ink-300'}`}>
                    {claudeModel === m.id && <span className="size-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-ink-900">{m.label}</p>
                    <p className="text-[10px] text-ink-500">{m.desc}</p>
                  </div>
                  {m.recommended && <span className="text-[10px] bg-primary-soft text-primary rounded px-1.5 py-0.5 font-medium">Default</span>}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── API Key ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-3">API Key</h2>
          <div className="bg-white border border-ink-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[13px] font-semibold text-ink-900">Clave de API</p>
                <p className="text-[11px] text-ink-400 mt-0.5">Autentica peticiones a la API REST de Convers desde tu backend.</p>
              </div>
              <a href="#" className="text-[11px] text-primary hover:underline flex items-center gap-1">
                Ver docs <ExternalLink size={10} />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-ink-50 border border-ink-200 rounded-md px-3 py-2 font-mono text-[12px] text-ink-700 truncate">
                {showKey ? API_KEY : 'sk_live_convers_' + '•'.repeat(32)}
              </div>
              <button onClick={() => setShowKey(!showKey)} className="px-3 py-2 text-[12px] border border-ink-200 rounded-md text-ink-500 hover:bg-ink-50 whitespace-nowrap">
                {showKey ? 'Ocultar' : 'Mostrar'}
              </button>
              <button onClick={copyKey} className={`flex items-center gap-1.5 px-3 py-2 text-[12px] border rounded-md transition-all ${copied ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-ink-200 text-ink-500 hover:bg-ink-50'}`}>
                <Copy size={11} /> {copied ? '¡Copiado!' : 'Copiar'}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 text-[12px] border border-red-100 rounded-md text-red-500 hover:bg-red-50">
                <RefreshCw size={11} /> Rotar
              </button>
            </div>
            <p className="text-[10px] text-ink-400 mt-2">⚠️ Nunca expongas esta clave en el frontend. Trátala como una contraseña.</p>
          </div>
        </section>

        {/* ── Webhooks ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Webhooks salientes</h2>
            <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90">
              <Plus size={11} /> Nuevo webhook
            </button>
          </div>
          <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-ink-100 bg-ink-50">
                <tr>
                  {['Nombre', 'URL de destino', 'Evento', 'Estado', ''].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {webhooks.map(wh => (
                  <tr key={wh.id} className="hover:bg-ink-50 transition-colors">
                    <td className="px-4 py-3 text-[12px] font-medium text-ink-800">{wh.name}</td>
                    <td className="px-4 py-3 text-[11px] text-ink-400 font-mono max-w-[200px] truncate">{wh.url}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] bg-ink-100 text-ink-700 rounded px-1.5 py-0.5 font-mono">{wh.event}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-[11px] font-medium ${wh.active ? 'text-emerald-600' : 'text-ink-400'}`}>
                        <span className={`size-1.5 rounded-full ${wh.active ? 'bg-emerald-500' : 'bg-ink-300'}`} />
                        {wh.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setWebhooks(p => p.filter(w => w.id !== wh.id))} className="text-ink-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
