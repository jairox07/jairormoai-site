"use client";

import { LifeBuoy, ExternalLink, MessageSquare } from "lucide-react";

const ARTICLES = [
  { id: 1, title: 'Cómo conectar WhatsApp Business API',   cat: 'Canales',      time: '5 min' },
  { id: 2, title: 'Configurar tu Knowledge Base con RAG',  cat: 'AI Studio',    time: '8 min' },
  { id: 3, title: 'Crear tu primer Journey automático',    cat: 'Journeys',     time: '10 min' },
  { id: 4, title: 'Aceptar pagos Stripe en el chat',       cat: 'Integraciones',time: '6 min' },
  { id: 5, title: 'Entender los roles y permisos',         cat: 'Equipo',       time: '4 min' },
  { id: 6, title: 'Personalizar Marca Blanca',             cat: 'White Label',  time: '3 min' },
];

export default function HelpView() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-[18px] font-semibold tracking-tight text-ink-900">Ayuda y Soporte</h1>
          <p className="text-[12px] text-ink-500 mt-0.5">Documentación, artículos y soporte directo del equipo Convers</p>
        </div>

        {/* Articles */}
        <h2 className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-3">Artículos populares</h2>
        <div className="bg-white border border-ink-200 rounded-xl overflow-hidden mb-6">
          {ARTICLES.map((art, i) => (
            <button key={art.id}
                    className={`w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-ink-50 transition-colors ${i > 0 ? 'border-t border-ink-100' : ''}`}>
              <div>
                <p className="text-[13px] font-medium text-ink-900">{art.title}</p>
                <p className="text-[11px] text-ink-400 mt-0.5">{art.cat} · {art.time} de lectura</p>
              </div>
              <ExternalLink size={13} className="text-ink-400 shrink-0" />
            </button>
          ))}
        </div>

        {/* Support ticket */}
        <div className="bg-white border border-ink-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-primary" />
            <h3 className="text-[13px] font-semibold text-ink-900">Abrir ticket de soporte</h3>
          </div>
          <div className="space-y-3">
            <input placeholder="Asunto"
                   className="w-full h-9 rounded-md border border-ink-200 bg-ink-50 px-3 text-[13px] text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <textarea rows={4} placeholder="Describe tu problema con el mayor detalle posible..."
                      className="w-full resize-none rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-[13px] text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <button className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-white hover:opacity-90">
              <LifeBuoy size={13} /> Enviar ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
