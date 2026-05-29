"use client";

import { useState } from "react";
import {
  Info, CheckCircle2, ExternalLink, Globe, X, Phone,
  ChevronRight, Loader2, Shield, Copy, RefreshCw,
} from "lucide-react";
import { CHANNELS, type DEFAULT_CONNECTIONS } from "@/lib/data";
import { useApp } from "@/context/AppContext";

interface Props {
  connections: typeof DEFAULT_CONNECTIONS;
  setConnections: (fn: (p: typeof DEFAULT_CONNECTIONS) => typeof DEFAULT_CONNECTIONS) => void;
}

/* ─── WhatsApp Setup Wizard ──────────────────────────────────────── */
function WASetupWizard({ onComplete, onClose }: {
  onComplete: (phoneId: string, phone: string) => void;
  onClose: () => void;
}) {
  const [step,     setStep]     = useState(1);
  const [phone,    setPhone]    = useState('');
  const [phoneId,  setPhoneId]  = useState('');
  const [otp,      setOtp]      = useState('');
  const [loading,  setLoading]  = useState(false);
  const [verified, setVerified] = useState(false);

  const STEPS = [
    { n: 1, label: 'Número de teléfono' },
    { n: 2, label: 'Verificación OTP' },
    { n: 3, label: 'Configurar webhook' },
    { n: 4, label: 'Confirmación' },
  ];

  async function doStep1() {
    if (!phone.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setStep(2);
  }

  async function doStep2() {
    if (!otp.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setVerified(true);
    setPhoneId(`573${Date.now().toString().slice(-9)}`);
    setStep(3);
  }

  function doStep3() { setStep(4); }

  function finish() {
    onComplete(phoneId, phone);
  }

  const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://tudominio.app'}/api/webhooks/meta`;
  const VERIFY_TOKEN = 'bella_forma_2026';

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-[520px] rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-200 px-6 py-4 bg-gradient-to-r from-[#25D366]/10 to-white">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[#25D366] text-white text-[11px] font-bold">WA</div>
            <div>
              <h2 className="text-[14px] font-semibold text-ink-900">Configurar WhatsApp Business API</h2>
              <p className="text-[11px] text-ink-500">Proceso guiado · ~5 minutos</p>
            </div>
          </div>
          <button onClick={onClose} className="grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-ink-100">
            <X size={15} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-ink-100 bg-ink-50/50">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className={`flex items-center gap-1.5 text-[11px] font-medium ${step >= s.n ? 'text-[#25D366]' : 'text-ink-400'}`}>
                <div className={`grid size-5 place-items-center rounded-full text-[10px] font-bold ${step > s.n ? 'bg-[#25D366] text-white' : step === s.n ? 'bg-[#25D366] text-white' : 'bg-ink-200 text-ink-500'}`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <ChevronRight size={12} className="mx-2 text-ink-300" />}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="px-6 py-6 min-h-[280px]">
          {/* Step 1: Phone number */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 p-4 text-[12px] text-blue-800">
                <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Requisitos previos de WhatsApp Business API</p>
                  <ul className="space-y-0.5 text-blue-700">
                    <li>• Número de teléfono que NO esté en la app de WhatsApp</li>
                    <li>• Cuenta de Meta Business Manager verificada</li>
                    <li>• El número puede ser fijo o móvil (+52 México)</li>
                    <li>• Se puede tener múltiples números en una WABA</li>
                  </ul>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink-700 mb-1">Número de teléfono (con código de país)</label>
                <div className="flex gap-2">
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+52 55 4500 8800"
                    className="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] text-ink-800 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30" />
                </div>
                <p className="text-[10px] text-ink-400 mt-1">Un número puede atender miles de conversaciones simultáneas con múltiples agentes asignados vía API.</p>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800">
                <Shield size={12} className="shrink-0 mt-0.5 text-amber-600" />
                <p>Meta enviará un código OTP al número vía SMS o llamada de voz para verificación.</p>
              </div>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="grid size-14 place-items-center rounded-2xl bg-[#25D366]/10 mx-auto mb-3">
                  <Phone size={24} className="text-[#25D366]" />
                </div>
                <p className="text-[14px] font-semibold text-ink-900">Verifica tu número</p>
                <p className="text-[12px] text-ink-500 mt-1">Meta envió un código de 6 dígitos a <strong>{phone}</strong></p>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink-700 mb-1 text-center">Código de verificación</label>
                <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))}
                  placeholder="123456" maxLength={6}
                  className="w-full text-center text-[24px] font-bold tracking-[0.3em] rounded-lg border border-ink-200 bg-white px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30" />
              </div>
              <button className="flex items-center justify-center gap-1.5 w-full text-[11px] text-ink-500 hover:text-ink-700">
                <RefreshCw size={11} /> Reenviar código
              </button>
            </div>
          )}

          {/* Step 3: Webhook */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <p className="text-[12px] font-medium text-emerald-800">Número verificado correctamente · Phone ID: <code className="font-mono text-[11px]">{phoneId}</code></p>
              </div>
              <p className="text-[12px] text-ink-600">Configura el webhook en Meta for Developers para recibir mensajes:</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-1">URL del Webhook</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-ink-900 text-emerald-400 px-3 py-2 text-[11px] font-mono break-all">{WEBHOOK_URL}</code>
                    <button onClick={() => navigator.clipboard.writeText(WEBHOOK_URL)}
                      className="grid size-8 shrink-0 place-items-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50">
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-1">Token de verificación</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-ink-900 text-amber-400 px-3 py-2 text-[11px] font-mono">{VERIFY_TOKEN}</code>
                    <button onClick={() => navigator.clipboard.writeText(VERIFY_TOKEN)}
                      className="grid size-8 shrink-0 place-items-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50">
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-ink-500 bg-ink-50 rounded-lg p-3">
                En Meta for Developers → Tu App → WhatsApp → Webhooks → Suscribir a: <strong>messages, message_deliveries, message_reads</strong>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="grid size-16 place-items-center rounded-2xl bg-[#25D366]/10 mx-auto">
                <CheckCircle2 size={32} className="text-[#25D366]" />
              </div>
              <div>
                <p className="text-[16px] font-semibold text-ink-900">¡Canal conectado exitosamente!</p>
                <p className="text-[12px] text-ink-500 mt-1">
                  El número <strong>{phone}</strong> ya está listo para recibir mensajes.
                  Sofía IA comenzará a atender automáticamente.
                </p>
              </div>
              <div className="rounded-xl bg-ink-50 border border-ink-200 p-4 text-left space-y-1.5">
                {[
                  '✅ Número verificado por Meta',
                  '✅ Webhook configurado y activo',
                  '✅ Sofía IA lista para responder',
                  '✅ Múltiples agentes pueden atender vía este número',
                ].map(item => <p key={item} className="text-[12px] text-ink-700">{item}</p>)}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-ink-100 px-6 py-4">
          <button onClick={onClose} className="text-[13px] text-ink-500 hover:text-ink-700">Cancelar</button>
          <div className="flex items-center gap-2">
            {step > 1 && step < 4 && (
              <button onClick={() => setStep(s => s - 1)} className="rounded-lg border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50">
                Atrás
              </button>
            )}
            {step === 1 && (
              <button onClick={doStep1} disabled={!phone.trim() || loading}
                className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-50">
                {loading ? <Loader2 size={13} className="animate-spin" /> : null}
                Enviar código OTP
              </button>
            )}
            {step === 2 && (
              <button onClick={doStep2} disabled={otp.length < 4 || loading}
                className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-50">
                {loading ? <Loader2 size={13} className="animate-spin" /> : null}
                Verificar código
              </button>
            )}
            {step === 3 && (
              <button onClick={doStep3}
                className="rounded-lg bg-[#25D366] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90">
                Continuar →
              </button>
            )}
            {step === 4 && (
              <button onClick={finish}
                className="rounded-lg bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:opacity-90">
                Finalizar configuración
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Channel Card ───────────────────────────────────────────── */
const CHANNEL_CARDS = [
  {
    id: 'whatsapp' as const,
    title: 'WhatsApp Business API',
    desc: 'Un número, múltiples agentes vía API. Sofía atiende 24/7. Soporta texto, imágenes, documentos y payments.',
    color: '#25D366',
    badge: 'Meta WABA',
  },
  {
    id: 'instagram' as const,
    title: 'Instagram Direct',
    desc: 'Responde DMs automáticamente. La IA replica comentarios y Story replies. Requiere cuenta profesional.',
    color: '#E1306C',
    badge: 'Meta',
  },
  {
    id: 'facebook' as const,
    title: 'Facebook Messenger',
    desc: 'Automatiza mensajes de tu página de Facebook. Requiere Page Admin Access.',
    color: '#0084FF',
    badge: 'Meta',
  },
  {
    id: 'web' as const,
    title: 'Web Chat Widget',
    desc: 'Incrusta un chat en tu sitio web. Sin código — pega un snippet antes del </body>.',
    color: '#71717a',
    badge: 'JavaScript',
  },
];

export default function ChannelsView({ connections, setConnections }: Props) {
  const { toast } = useApp();
  const [testingId,  setTestingId]  = useState<string | null>(null);
  const [waWizard,   setWaWizard]   = useState(false);

  function connect(id: keyof typeof DEFAULT_CONNECTIONS) {
    if (id === 'whatsapp') { setWaWizard(true); return; }
    setConnections(prev => ({
      ...prev,
      [id]: { connected: true, since: new Date().toLocaleDateString('es-MX'), verified: true },
    }));
    toast(`Canal ${id} conectado`, 'success');
  }

  function disconnect(id: keyof typeof DEFAULT_CONNECTIONS) {
    setConnections(prev => ({ ...prev, [id]: { connected: false } }));
    toast(`Canal desconectado`, 'info');
  }

  async function testChannel(id: string) {
    setTestingId(id);
    await new Promise(r => setTimeout(r, 1500));
    setTestingId(null);
    toast('Mensaje de prueba enviado correctamente', 'success');
  }

  function handleWaComplete(phoneId: string, phone: string) {
    setConnections(prev => ({
      ...prev,
      whatsapp: { connected: true, since: new Date().toLocaleDateString('es-MX'), verified: true, phoneId },
    }));
    setWaWizard(false);
    toast(`WhatsApp Business API conectado · ${phone}`, 'success');
  }

  const connectedCount = Object.values(connections).filter(c => c.connected).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1000px] mx-auto px-6 py-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[18px] font-semibold tracking-tight text-ink-900">Canales de comunicación</h1>
            <p className="text-[12px] text-ink-500 mt-0.5">
              Conecta los canales por los que llegan tus pacientes. Sofía atiende cada uno automáticamente.
            </p>
          </div>
          <a href="https://developers.facebook.com/docs/whatsapp" target="_blank" rel="noopener"
            className="flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-[12px] font-medium text-ink-700 hover:bg-ink-50">
            <ExternalLink size={13} /> Documentación Meta
          </a>
        </div>

        {/* Policy banner */}
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-[12px] text-blue-800">
          <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-1">¿Puedo tener varios chats abiertos? ¿Varios agentes en el mismo número?</p>
            <p className="text-blue-700 leading-relaxed">
              <strong>Sí.</strong> WhatsApp Business API permite múltiples agentes (humanos e IA) atendiendo distintas conversaciones a través del <em>mismo número</em>. Cada conversación es 1:1 con un cliente — no hay chats duplicados con el mismo número. Puedes también tener varios números de WA en una misma WABA (cuenta). Instagram y Facebook Messenger funcionan igual: 1 hilo por usuario, múltiples agentes vía API.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Canales activos',       value: connectedCount,   color: 'text-emerald-600' },
            { label: 'Mensajes hoy',           value: '312',            color: 'text-primary' },
            { label: 'Tiempo de respuesta IA', value: '< 2s',          color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-ink-200 rounded-xl p-4">
              <p className={`text-[22px] font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-ink-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Channel cards */}
        <div className="grid grid-cols-2 gap-4">
          {CHANNEL_CARDS.map(ch => {
            const conn = connections[ch.id] as { connected: boolean; since?: string; verified?: boolean; phoneId?: string } | undefined;
            const isConnected   = conn?.connected ?? false;
            const isTestingThis = testingId === ch.id;

            return (
              <div key={ch.id} className="bg-white border border-ink-200 rounded-2xl p-5 transition-all hover:shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl text-white text-[11px] font-bold shadow-sm"
                         style={{ background: ch.color }}>
                      {CHANNELS[ch.id]?.short ?? ch.id.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-ink-900">{ch.title}</p>
                        <span className="rounded-full border px-1.5 py-0.5 text-[9px] font-semibold text-ink-500 border-ink-200">{ch.badge}</span>
                      </div>
                      <p className="text-[11px] text-ink-400 mt-0.5 max-w-[240px] leading-snug">{ch.desc}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {isConnected ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span className="text-[12px] text-emerald-700 font-medium">Conectado</span>
                      {conn?.since && <span className="text-[11px] text-ink-400">· desde {conn.since}</span>}
                      {conn?.phoneId && <code className="text-[10px] font-mono text-ink-400">· {conn.phoneId}</code>}
                    </>
                  ) : (
                    <span className="text-[12px] text-ink-400">Sin conectar</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <button onClick={() => testChannel(ch.id)} disabled={isTestingThis}
                        className="flex items-center gap-1.5 rounded-md border border-ink-200 px-3 py-1.5 text-[12px] font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50">
                        {isTestingThis ? <><Loader2 size={11} className="animate-spin" /> Probando…</> : 'Enviar test'}
                      </button>
                      <button onClick={() => disconnect(ch.id)}
                        className="rounded-md border border-red-100 bg-red-50 px-3 py-1.5 text-[12px] font-medium text-red-600 hover:bg-red-100">
                        Desconectar
                      </button>
                    </>
                  ) : (
                    <button onClick={() => connect(ch.id)}
                      className="flex items-center gap-1.5 rounded-md px-4 py-1.5 text-[12px] font-medium text-white hover:opacity-90"
                      style={{ background: ch.color }}>
                      {ch.id === 'whatsapp' ? '🔧 Configurar número →' : 'Conectar →'}
                    </button>
                  )}
                </div>

                {ch.id === 'web' && isConnected && (
                  <div className="mt-4">
                    <p className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Código de instalación</p>
                    <div className="rounded-lg bg-ink-900 p-3 text-[10px] font-mono text-emerald-400 leading-relaxed">
                      {'<script src="https://cdn.bellaforma.app/widget.js"'}<br />
                      {'  data-site="site_bellaforma" defer></script>'}
                    </div>
                    <p className="flex items-center gap-1 mt-1.5 text-[10px] text-ink-400">
                      <Globe size={10} /> Pega antes del {'</body>'} de tu sitio web
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* WA Wizard */}
      {waWizard && (
        <WASetupWizard
          onComplete={handleWaComplete}
          onClose={() => setWaWizard(false)}
        />
      )}
    </div>
  );
}
