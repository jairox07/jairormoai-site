"use client";

import { useState } from "react";
import { Brain, Database, GitBranch, Plus, CheckCircle2, AlertCircle, Loader2, Upload, Globe, FileText, ArrowLeft } from "lucide-react";
import { CLAUDE_MODELS, type DEFAULT_BRAND } from "@/lib/data";
import JourneyCanvas from "@/components/JourneyCanvas";
import { useApp } from "@/context/AppContext";

interface Props {
  brand: typeof DEFAULT_BRAND;
  setBrand: (fn: (p: typeof DEFAULT_BRAND) => typeof DEFAULT_BRAND) => void;
}

const INDUSTRIES = [
  'Dental / Clínica', 'Inmobiliaria', 'Retail / Tienda', 'Restaurante / Food',
  'Educación', 'SaaS / Tech', 'Fitness / Gym', 'Automotriz',
  'Legal', 'Finanzas', 'Turismo / Viajes', 'Belleza / Spa',
];

const SAMPLE_SOURCES = [
  { id: 's1', kind: 'pdf',  name: 'Catálogo Productos 2026.pdf',     chunks: 342, status: 'indexed',  progress: 100 },
  { id: 's2', kind: 'url',  name: 'https://miempresa.com/preguntas', chunks: 87,  status: 'indexed',  progress: 100 },
  { id: 's3', kind: 'faq',  name: 'FAQs de ventas',                  chunks: 56,  status: 'indexed',  progress: 100 },
  { id: 's4', kind: 'pdf',  name: 'Políticas de devolución.pdf',     chunks: 0,   status: 'syncing',  progress: 67  },
];

const JOURNEYS = [
  { id: 'j1', name: 'Bienvenida y Calificación', topic: 'Ventas', channels: ['whatsapp','instagram'], enabled: true,  runs: 1284, conv: 312 },
  { id: 'j2', name: 'Cierre con Pago Stripe',    topic: 'Pagos',  channels: ['whatsapp'],              enabled: true,  runs: 487,  conv: 201 },
  { id: 'j3', name: 'Agendado de Cita',           topic: 'Citas',  channels: ['whatsapp','web'],        enabled: true,  runs: 334,  conv: 180 },
  { id: 'j4', name: 'Seguimiento Post-Venta',     topic: 'CRM',    channels: ['whatsapp','email'],      enabled: false, runs: 201,  conv: 88  },
];

export default function AIStudioView({ brand, setBrand }: Props) {
  const { toast } = useApp();
  const [tab, setTab] = useState<'kb' | 'journeys'>('kb');
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [industry, setIndustry] = useState('Dental / Clínica');
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4-5');
  const [openJourneyId, setOpenJourneyId] = useState<string | null>(null);
  const [journeys, setJourneys] = useState(JOURNEYS);

  async function runTest() {
    if (!testQuery.trim()) return;
    setTesting(true);
    setTestResult(null);
    // TODO: llamar a POST /api/ai/reply con el query
    await new Promise(r => setTimeout(r, 1200));
    setTestResult(`Según el catálogo actualizado, el iPhone 15 Pro en 256GB Titanio Natural tiene un precio de $24,990 MXN. Incluye garantía oficial Apple de 1 año y puedes financiarlo hasta 18 MSI con BBVA, Banorte y Santander sin intereses adicionales.\n\n📄 Fuente: Catálogo Productos 2026.pdf (p.14)`);
    setTesting(false);
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-4 border-b border-ink-200 bg-white px-6 py-0">
        {[
          { id: 'kb',       label: 'Knowledge Base (RAG)', icon: Database },
          { id: 'journeys', label: 'Journey Builder',       icon: GitBranch },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id as 'kb' | 'journeys')}
            className={`flex items-center gap-2 border-b-2 py-3.5 text-[13px] font-medium transition-colors ${
              tab === id ? 'border-primary text-primary' : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ── KB Tab ─────────────────────────────────────────────── */}
        {tab === 'kb' && (
          <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
            {/* Industry + model */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-ink-200 rounded-xl p-5">
                <label className="block text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-2">Industria / Plantilla base</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {INDUSTRIES.map(ind => (
                    <button key={ind} onClick={() => setIndustry(ind)}
                            className={`rounded-md px-2 py-1.5 text-[11px] font-medium text-left transition-colors ${
                              industry === ind ? 'bg-primary text-white' : 'bg-ink-50 text-ink-700 hover:bg-ink-100'
                            }`}>
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-ink-200 rounded-xl p-5">
                <label className="block text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-2">Modelo de IA</label>
                <div className="space-y-2">
                  {CLAUDE_MODELS.map(m => (
                    <button key={m.id} onClick={() => setSelectedModel(m.id)}
                            className={`w-full flex items-start gap-2.5 rounded-lg border p-3 text-left transition-all ${
                              selectedModel === m.id ? 'border-primary bg-primary-soft' : 'border-ink-200 hover:border-ink-300'
                            }`}>
                      <div className={`grid size-4 place-items-center rounded-full border mt-0.5 ${selectedModel === m.id ? 'border-primary bg-primary' : 'border-ink-300'}`}>
                        {selectedModel === m.id && <span className="size-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-ink-900">{m.label}</p>
                        <p className="text-[10px] text-ink-500">{m.desc}</p>
                      </div>
                      {m.recommended && <span className="ml-auto text-[10px] bg-primary-soft text-primary rounded px-1.5 py-0.5 font-medium shrink-0">Default</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Descripción del negocio */}
            <div className="bg-white border border-ink-200 rounded-xl p-5">
              <label className="block text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-2">Descripción del negocio (va al system prompt)</label>
              <textarea rows={3} defaultValue="Somos una tienda Apple Premium Reseller en CDMX. Vendemos iPhone, Mac, iPad y accesorios originales con garantía oficial. Ofrecemos meses sin intereses y envío gratis en CDMX."
                        className="w-full resize-none rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-[13px] text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            {/* Knowledge sources */}
            <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
                <div>
                  <h3 className="text-[13px] font-semibold text-ink-900">Fuentes de conocimiento</h3>
                  <p className="text-[11px] text-ink-500 mt-0.5">485 chunks indexados · 1,536 dim · voyage-3-large</p>
                </div>
                <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90">
                  <Plus size={12} /> Añadir fuente
                </button>
              </div>
              <div className="divide-y divide-ink-50">
                {SAMPLE_SOURCES.map(src => (
                  <div key={src.id} className="flex items-center gap-3 px-5 py-3">
                    <div className={`grid size-8 place-items-center rounded-lg ${
                      src.kind === 'pdf' ? 'bg-red-50' : src.kind === 'url' ? 'bg-blue-50' : 'bg-amber-50'
                    }`}>
                      {src.kind === 'pdf'  ? <FileText size={14} className="text-red-500" />
                     : src.kind === 'url'  ? <Globe size={14} className="text-blue-500" />
                     : <Database size={14} className="text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-ink-800 truncate">{src.name}</p>
                      {src.status === 'syncing'
                        ? <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1 rounded-full bg-ink-100 overflow-hidden max-w-[120px]">
                              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${src.progress}%` }} />
                            </div>
                            <span className="text-[10px] text-ink-400">{src.progress}%</span>
                          </div>
                        : <p className="text-[10px] text-ink-400">{src.chunks} chunks</p>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {src.status === 'indexed'  && <CheckCircle2 size={13} className="text-emerald-500" />}
                      {src.status === 'syncing'  && <Loader2 size={13} className="text-primary animate-spin" />}
                      {src.status === 'failed'   && <AlertCircle size={13} className="text-rose-500" />}
                      <span className={`text-[10px] font-medium ${src.status === 'indexed' ? 'text-emerald-600' : src.status === 'syncing' ? 'text-primary' : 'text-rose-600'}`}>
                        {src.status === 'indexed' ? 'Indexado' : src.status === 'syncing' ? 'Sincronizando' : 'Error'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test RAG */}
            <div className="bg-white border border-ink-200 rounded-xl p-5">
              <h3 className="text-[13px] font-semibold text-ink-900 mb-3">Test de RAG en vivo</h3>
              <div className="flex gap-2">
                <input value={testQuery} onChange={e => setTestQuery(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && runTest()}
                       placeholder="Prueba una pregunta de tu cliente..."
                       className="flex-1 h-9 rounded-md border border-ink-200 bg-ink-50 px-3 text-[13px] text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={runTest} disabled={!testQuery.trim() || testing}
                        className="flex items-center gap-1.5 h-9 rounded-md bg-primary px-4 text-[12px] font-medium text-white hover:opacity-90 disabled:opacity-40">
                  {testing ? <Loader2 size={13} className="animate-spin" /> : <Brain size={13} />}
                  Consultar
                </button>
              </div>
              {testResult && (
                <div className="mt-3 rounded-lg border border-primary/20 bg-primary-soft p-4">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-2">Respuesta de la IA (RAG)</p>
                  <p className="text-[12px] text-ink-700 leading-relaxed whitespace-pre-line">{testResult}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Journey Builder Tab ─────────────────────────────────── */}
        {tab === 'journeys' && !openJourneyId && (
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[16px] font-semibold text-ink-900">Journey Builder</h2>
                <p className="text-[12px] text-ink-500">Automatizaciones visuales con drag-and-drop · 80+ tipos de nodos</p>
              </div>
              <button
                onClick={() => {
                  const newJ = { id: `j${Date.now()}`, name: 'Nuevo Journey', topic: 'Ventas', channels: ['whatsapp'], enabled: false, runs: 0, conv: 0 };
                  setJourneys(p => [...p, newJ]);
                  setOpenJourneyId(newJ.id);
                  toast("Journey creado — edítalo en el canvas", "success");
                }}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90"
              >
                <Plus size={12} /> Nuevo Journey
              </button>
            </div>

            <div className="space-y-3">
              {journeys.map(j => (
                <div key={j.id} className="bg-white border border-ink-200 rounded-xl p-5 flex items-center gap-4">
                  <div className={`grid size-9 shrink-0 place-items-center rounded-lg ${j.enabled ? 'bg-primary-soft' : 'bg-ink-100'}`}>
                    <GitBranch size={16} className={j.enabled ? 'text-primary' : 'text-ink-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-semibold text-ink-900">{j.name}</h3>
                      <span className="text-[10px] bg-ink-100 text-ink-600 rounded px-1.5 py-0.5">{j.topic}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-ink-400">
                      <span>{j.runs.toLocaleString()} ejecuciones</span>
                      <span>·</span>
                      <span className="text-emerald-600 font-medium">{j.conv} conversiones</span>
                      <span>·</span>
                      <span>{j.channels.join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setOpenJourneyId(j.id)}
                      className="text-[12px] text-ink-600 border border-ink-200 rounded-md px-3 py-1.5 hover:bg-ink-50"
                    >
                      Editar canvas
                    </button>
                    <button
                      onClick={() => setJourneys(p => p.map(x => x.id === j.id ? { ...x, enabled: !x.enabled } : x))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${j.enabled ? 'bg-primary' : 'bg-ink-200'}`}
                    >
                      <span className={`inline-block size-3.5 rounded-full bg-white shadow transition-transform ${j.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Journey Canvas ───────────────────────────────────────── */}
        {tab === 'journeys' && openJourneyId && (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 border-b border-ink-200 bg-white px-6 py-3 shrink-0">
              <button
                onClick={() => setOpenJourneyId(null)}
                className="flex items-center gap-1.5 text-[12px] text-ink-600 hover:text-ink-900 transition-colors"
              >
                <ArrowLeft size={14} /> Volver a journeys
              </button>
              <span className="text-ink-300">·</span>
              <span className="text-[13px] font-semibold text-ink-900">
                {journeys.find(j => j.id === openJourneyId)?.name ?? 'Journey'}
              </span>
              <button
                onClick={() => { toast("Journey guardado", "success"); setOpenJourneyId(null); }}
                className="ml-auto rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90"
              >
                Guardar journey
              </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <JourneyCanvas />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
