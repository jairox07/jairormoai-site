"use client";

import { useState, useRef } from "react";
import { Upload, Check, Sparkles } from "lucide-react";
import { type DEFAULT_BRAND } from "@/lib/data";

const PRESET_COLORS = [
  { name: 'Índigo',     value: '#605BFF' },
  { name: 'Violeta',    value: '#8b5cf6' },
  { name: 'Rosa',       value: '#ec4899' },
  { name: 'Azul',       value: '#3b82f6' },
  { name: 'Esmeralda',  value: '#10b981' },
  { name: 'Naranja',    value: '#f97316' },
  { name: 'Slate',      value: '#475569' },
  { name: 'Negro',      value: '#111827' },
];

const TONES = ['amigable', 'profesional', 'informal', 'técnico', 'empático'];

interface Props {
  brand: typeof DEFAULT_BRAND;
  setBrand: (fn: (p: typeof DEFAULT_BRAND) => typeof DEFAULT_BRAND) => void;
}

export default function WhiteLabelView({ brand, setBrand }: Props) {
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function update(patch: Partial<typeof DEFAULT_BRAND>) {
    setBrand(p => ({ ...p, ...patch }));
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => update({ logoDataUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  }

  function save() {
    // TODO: PATCH /api/settings/whitelabel
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-[18px] font-semibold tracking-tight text-ink-900">Marca Blanca</h1>
          <p className="text-[12px] text-ink-500 mt-0.5">
            Personaliza la plataforma con tu identidad. Tus clientes verán tu marca, no la nuestra.
          </p>
        </div>

        <div className="grid grid-cols-5 gap-5">
          {/* ── Settings (3/5) ───────────────────────────────────── */}
          <div className="col-span-3 space-y-5">
            {/* Logo */}
            <div className="bg-white border border-ink-200 rounded-xl p-5">
              <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-3">Logo de la empresa</p>
              <div onClick={() => fileRef.current?.click()}
                   className="border-2 border-dashed border-ink-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary-soft/30 transition-all">
                {brand.logoDataUrl
                  ? <img src={brand.logoDataUrl} alt="logo" className="h-14 object-contain mx-auto rounded-lg" />
                  : <>
                      <div className="grid size-10 place-items-center rounded-xl bg-ink-100 mx-auto mb-2">
                        <Upload size={18} className="text-ink-400" />
                      </div>
                      <p className="text-[13px] font-medium text-ink-600">Arrastra tu logo aquí</p>
                      <p className="text-[11px] text-ink-400 mt-0.5">PNG, SVG o JPG — máx. 2MB · recomendado 200×60px</p>
                    </>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              {brand.logoDataUrl && (
                <button onClick={() => update({ logoDataUrl: null })} className="mt-2 text-[11px] text-rose-500 hover:text-rose-700">
                  Eliminar logo
                </button>
              )}
              <div className="mt-3">
                <label className="block text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Monograma (sin logo)</label>
                <input
                  value={brand.logoMonogram}
                  onChange={e => update({ logoMonogram: e.target.value.slice(0, 2).toUpperCase() })}
                  maxLength={2}
                  className="w-16 h-9 rounded-md border border-ink-200 bg-ink-50 px-3 text-center text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Brand + assistant */}
            <div className="bg-white border border-ink-200 rounded-xl p-5 space-y-4">
              <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Identidad de marca</p>
              <div>
                <label className="block text-[11px] font-medium text-ink-600 mb-1">Nombre de la empresa</label>
                <input value={brand.brandName} onChange={e => update({ brandName: e.target.value })}
                       className="w-full h-9 rounded-md border border-ink-200 bg-ink-50 px-3 text-[13px] text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink-600 mb-1">Nombre del asistente IA</label>
                <div className="flex gap-2">
                  <input value={brand.assistantName} onChange={e => update({ assistantName: e.target.value })}
                         maxLength={20}
                         className="flex-1 h-9 rounded-md border border-ink-200 bg-ink-50 px-3 text-[13px] text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <span className="flex items-center text-[10px] text-ink-400">{brand.assistantName.length}/20</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink-600 mb-1.5">Tono del asistente</label>
                <div className="flex flex-wrap gap-1.5">
                  {TONES.map(t => (
                    <button key={t} onClick={() => update({ tone: t })}
                            className={`rounded-md px-3 py-1 text-[12px] font-medium capitalize transition-colors ${
                              brand.tone === t ? 'bg-primary text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                            }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink-600 mb-1">System prompt</label>
                <textarea value={brand.systemPrompt} onChange={e => update({ systemPrompt: e.target.value })}
                          rows={4} className="w-full resize-none rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-[12px] text-ink-700 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <p className="text-[10px] text-ink-400 mt-1">Usa <code>{'{assistantName}'}</code>, <code>{'{brandName}'}</code>, <code>{'{tone}'}</code> como variables dinámicas.</p>
              </div>
            </div>

            {/* Color */}
            <div className="bg-white border border-ink-200 rounded-xl p-5">
              <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-3">Color primario</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {PRESET_COLORS.map(c => (
                  <button key={c.value} onClick={() => update({ primaryColor: c.value })} title={c.name}
                          className="grid size-8 place-items-center rounded-lg transition-transform hover:scale-110"
                          style={{ background: c.value }}>
                    {brand.primaryColor === c.value && <Check size={14} className="text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 border border-ink-200 rounded-md px-3 py-1.5 bg-ink-50">
                  <div className="size-4 rounded-md" style={{ background: brand.primaryColor }} />
                  <span className="text-[12px] font-mono text-ink-700">{brand.primaryColor.toUpperCase()}</span>
                </div>
                <input type="color" value={brand.primaryColor} onChange={e => update({ primaryColor: e.target.value })}
                       className="w-8 h-8 rounded-md cursor-pointer border border-ink-200" />
                <span className="text-[11px] text-ink-400">o elige color personalizado</span>
              </div>
            </div>

            <button onClick={save}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:opacity-90'}`}>
              {saved ? <><Check size={15} /> Guardado</> : <><Sparkles size={15} /> Guardar configuración</>}
            </button>
          </div>

          {/* ── Live preview (2/5) ──────────────────────────────── */}
          <div className="col-span-2">
            <div className="sticky top-0">
              <p className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-3">Vista previa del widget</p>
              <div className="relative bg-ink-100 rounded-2xl p-4 flex items-end justify-end" style={{ minHeight: 380 }}>
                {/* Simulated site bg */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-30 pointer-events-none p-4 space-y-2">
                  <div className="h-5 w-full bg-white rounded" />
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-2.5 bg-ink-400 rounded ${i % 2 === 0 ? 'w-full' : 'w-3/4'}`} />
                  ))}
                </div>

                {/* Chat widget */}
                <div className="relative z-10 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden border border-ink-200">
                  {/* Header */}
                  <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: brand.primaryColor }}>
                    {brand.logoDataUrl
                      ? <img src={brand.logoDataUrl} alt="logo" className="h-5 object-contain" />
                      : <div className="grid size-6 place-items-center rounded-full bg-white/20 text-white text-[10px] font-bold">
                          {brand.logoMonogram}
                        </div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[11px] font-semibold truncate">{brand.assistantName || 'Asistente'}</p>
                      <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.7)' }}>En línea ahora</p>
                    </div>
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  {/* Messages */}
                  <div className="p-3 space-y-2 bg-ink-50" style={{ minHeight: 140 }}>
                    <div className="flex gap-1.5">
                      <div className="grid size-5 place-items-center rounded-full text-white text-[9px] font-bold shrink-0"
                           style={{ background: brand.primaryColor }}>
                        {brand.assistantName.charAt(0)}
                      </div>
                      <div className="bg-white rounded-xl rounded-tl-sm px-2.5 py-1.5 shadow-sm" style={{ maxWidth: '85%' }}>
                        <p className="text-[10px] text-ink-700 leading-relaxed">
                          ¡Hola! Soy {brand.assistantName}, tu asistente de {brand.brandName}. ¿En qué te ayudo? 😊
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="px-2.5 py-1.5 rounded-xl rounded-tr-sm text-[10px] text-white"
                           style={{ background: brand.primaryColor }}>
                        Hola, tengo una pregunta
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="px-2.5 py-2 bg-white border-t border-ink-100 flex items-center gap-1.5">
                    <input readOnly placeholder="Escribe tu mensaje..." className="flex-1 text-[10px] bg-ink-50 rounded-md px-2 py-1 border border-ink-200 focus:outline-none" />
                    <button className="grid size-6 place-items-center rounded-md text-white text-[10px]" style={{ background: brand.primaryColor }}>↑</button>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
                <p className="text-[10px] text-amber-800 font-semibold">💡 Vista previa en tiempo real</p>
                <p className="text-[10px] text-amber-700 mt-0.5">Los cambios de color también actualizan toda la plataforma al instante.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
