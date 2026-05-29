"use client";

import { useState, useMemo } from "react";
import {
  Search, Download, Mail, Phone, Tag, X, MessageSquare,
  Calendar, MapPin, User, Star, Clock, ChevronRight,
  Edit2, ExternalLink,
} from "lucide-react";
import { CHANNELS, CRM_STAGES, type Lead, type Ticket, type CRMStage } from "@/lib/data";
import { useApp } from "@/context/AppContext";

interface Props { leads: Lead[]; tickets: Ticket[]; }

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

type ContactRow = {
  id: string; name: string; handle: string; channel: string;
  kind: 'lead' | 'ticket'; tags: string[]; hue: number;
  sub: string; score: number | null; value: number | null; lastSeen: string;
  crmStage?: CRMStage; email?: string; phone?: string;
  age?: number; gender?: string; city?: string;
  notes?: string; lastProcedure?: string; nextAppointment?: string;
  messages: Lead['messages'];
};

/* ─── Detail Panel ───────────────────────────────────────────────── */
function ContactDetail({ contact, onClose, onOpenChat, onUpdateStage }: {
  contact: ContactRow;
  onClose: () => void;
  onOpenChat: (id: string, kind: 'lead' | 'ticket') => void;
  onUpdateStage: (id: string, stage: CRMStage) => void;
}) {
  const ch    = CHANNELS[contact.channel as keyof typeof CHANNELS];
  const stage = contact.crmStage ?? 'lead';
  const stageInfo = CRM_STAGES[stage];
  const lastMsg = contact.messages[contact.messages.length - 1];

  return (
    <div className="flex flex-col h-full bg-white border-l border-ink-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4 shrink-0">
        <h2 className="text-[14px] font-semibold text-ink-900">Perfil del contacto</h2>
        <button onClick={onClose} className="grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Avatar + name */}
        <div className="flex flex-col items-center pt-6 pb-4 px-5 border-b border-ink-100">
          <div className="grid size-16 place-items-center rounded-full text-white text-[22px] font-bold mb-3"
               style={{ background: `hsl(${contact.hue},65%,52%)` }}>
            {initials(contact.name)}
          </div>
          <h3 className="text-[16px] font-semibold text-ink-900">{contact.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="grid size-5 place-items-center rounded-full text-[9px] font-bold text-white"
                  style={{ background: ch?.color }}>{ch?.short}</span>
            <span className="text-[12px] text-ink-500">{contact.handle}</span>
          </div>

          {/* CRM Stage selector */}
          <div className="flex gap-1.5 mt-3 flex-wrap justify-center">
            {(Object.entries(CRM_STAGES) as [CRMStage, typeof CRM_STAGES[CRMStage]][]).map(([key, info]) => (
              <button key={key} onClick={() => onUpdateStage(contact.id, key)}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-all border ${
                  stage === key ? 'ring-2' : 'opacity-50 hover:opacity-80'
                }`}
                style={{
                  background: stage === key ? info.soft : 'transparent',
                  color: info.color, borderColor: info.color,
                }}>
                {info.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-ink-400 mt-1 text-center">{stageInfo.description}</p>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 px-5 py-4 border-b border-ink-100">
          <button onClick={() => onOpenChat(contact.id, contact.kind)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-white hover:opacity-90 transition-opacity">
            <MessageSquare size={13} /> Abrir chat
          </button>
          {contact.email && (
            <a href={`mailto:${contact.email}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-[12px] font-medium text-ink-700 hover:bg-ink-50">
              <Mail size={13} /> Email
            </a>
          )}
        </div>

        {/* Info sections */}
        <div className="px-5 py-4 space-y-4">
          {/* Contact info */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-2">Información de contacto</p>
            <div className="space-y-2">
              {contact.email && (
                <div className="flex items-center gap-2 text-[12px]">
                  <Mail size={12} className="text-ink-400 shrink-0" />
                  <span className="text-ink-700">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-[12px]">
                  <Phone size={12} className="text-ink-400 shrink-0" />
                  <span className="text-ink-700">{contact.phone}</span>
                </div>
              )}
              {contact.city && (
                <div className="flex items-center gap-2 text-[12px]">
                  <MapPin size={12} className="text-ink-400 shrink-0" />
                  <span className="text-ink-700">{contact.city}</span>
                </div>
              )}
              {(contact.age || contact.gender) && (
                <div className="flex items-center gap-2 text-[12px]">
                  <User size={12} className="text-ink-400 shrink-0" />
                  <span className="text-ink-700">
                    {[contact.gender, contact.age ? `${contact.age} años` : ''].filter(Boolean).join(' · ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Score & Value */}
          {contact.kind === 'lead' && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-2">Métricas del lead</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-ink-200 p-3 text-center">
                  <p className="text-[18px] font-bold"
                     style={{ color: (contact.score ?? 0) >= 80 ? '#16a34a' : (contact.score ?? 0) >= 50 ? '#d97706' : '#dc2626' }}>
                    {contact.score ?? '—'}
                  </p>
                  <p className="text-[10px] text-ink-400 mt-0.5">Score IA</p>
                </div>
                <div className="rounded-lg border border-ink-200 p-3 text-center">
                  <p className="text-[18px] font-bold text-emerald-600">
                    {contact.value ? `$${contact.value.toLocaleString()}` : '—'}
                  </p>
                  <p className="text-[10px] text-ink-400 mt-0.5">Valor MXN</p>
                </div>
              </div>
            </div>
          )}

          {/* Clinical info */}
          {(contact.lastProcedure || contact.nextAppointment) && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-2">Historial clínico</p>
              <div className="space-y-2">
                {contact.lastProcedure && (
                  <div className="flex items-center gap-2 text-[12px]">
                    <Star size={12} className="text-primary shrink-0" />
                    <span className="text-ink-700"><span className="text-ink-400">Último procedimiento:</span> {contact.lastProcedure}</span>
                  </div>
                )}
                {contact.nextAppointment && (
                  <div className="flex items-center gap-2 text-[12px]">
                    <Calendar size={12} className="text-amber-500 shrink-0" />
                    <span className="text-ink-700"><span className="text-ink-400">Próxima cita:</span> {contact.nextAppointment}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interés */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-2">Interés / Asunto</p>
            <p className="text-[12px] text-ink-700 leading-relaxed">{contact.sub}</p>
          </div>

          {/* Tags */}
          {contact.tags.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-2">Etiquetas</p>
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map(t => (
                  <span key={t} className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] text-ink-600">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Last message */}
          {lastMsg?.text && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-2">Último mensaje</p>
              <div className="rounded-lg bg-ink-50 border border-ink-200 p-3">
                <p className="text-[11px] text-ink-700 leading-relaxed line-clamp-3">{lastMsg.text}</p>
                <p className="text-[10px] text-ink-400 mt-1.5 flex items-center gap-1">
                  <Clock size={9} /> {lastMsg.t} · {contact.lastSeen}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-2">Notas internas</p>
              <p className="text-[12px] text-ink-600 leading-relaxed italic">{contact.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function ContactsView({ leads, tickets }: Props) {
  const { openChat, updateLead, toast } = useApp();
  const [query,    setQuery]    = useState('');
  const [stageFilter, setStageFilter] = useState<CRMStage | 'all'>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const all: ContactRow[] = useMemo(() => [
    ...leads.map(l => ({
      id: l.id, name: l.name, handle: l.handle, channel: l.channel,
      kind: 'lead' as const, tags: l.tags, hue: l.avatarHue,
      sub: l.intent, score: l.score, value: l.value, lastSeen: l.lastSeen,
      crmStage: l.crmStage ?? 'lead' as CRMStage, email: l.email, phone: l.phone,
      age: l.age, gender: l.gender, city: l.city, notes: l.notes,
      lastProcedure: l.lastProcedure, nextAppointment: l.nextAppointment,
      messages: l.messages,
    })),
    ...tickets.map(t => ({
      id: t.id, name: t.name, handle: t.handle, channel: t.channel,
      kind: 'ticket' as const, tags: t.tags, hue: t.avatarHue,
      sub: t.subject, score: null, value: null, lastSeen: t.lastSeen,
      crmStage: 'customer' as CRMStage, messages: t.messages,
    })),
  ], [leads, tickets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(c => {
      if (stageFilter !== 'all' && c.crmStage !== stageFilter) return false;
      if (!q) return true;
      return [c.name, c.handle, c.sub, c.email ?? '', c.city ?? ''].join(' ').toLowerCase().includes(q);
    });
  }, [all, query, stageFilter]);

  const selectedContact = selected ? all.find(c => c.id === selected) : null;

  const stats = [
    { label: 'Total contactos', value: all.length, color: 'text-ink-900' },
    { label: 'Leads activos',   value: leads.filter(l => l.column !== 'won' && l.column !== 'lost').length, color: 'text-primary' },
    { label: 'Pacientes activos', value: all.filter(c => c.crmStage === 'customer').length, color: 'text-emerald-600' },
    { label: 'LTV promedio', value: `$${Math.round(leads.filter(l => l.value > 0).reduce((a, l) => a + l.value, 0) / Math.max(leads.filter(l => l.value > 0).length, 1)).toLocaleString()}`, color: 'text-amber-600' },
  ];

  function handleUpdateStage(id: string, stage: CRMStage) {
    updateLead(id, { crmStage: stage });
    toast(`Etapa actualizada a "${CRM_STAGES[stage].label}"`, 'success');
  }

  const STAGE_FILTERS: { id: CRMStage | 'all'; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'contact', label: 'Contacto' },
    { id: 'lead', label: 'Lead' },
    { id: 'opportunity', label: 'Oportunidad' },
    { id: 'customer', label: 'Cliente / Paciente' },
  ];

  return (
    <div className="flex h-full min-h-0">
      {/* ── Left: List ───────────────────────────────────────────── */}
      <div className={`flex flex-col flex-1 min-w-0 overflow-hidden transition-all ${selectedContact ? '' : ''}`}>
        <div className="h-full overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-[18px] font-semibold tracking-tight text-ink-900">Contactos y Pacientes</h1>
                <p className="text-[12px] text-ink-500 mt-0.5">Base de pacientes, leads y contactos — clic para ver perfil completo</p>
              </div>
              <button onClick={() => toast('Exportando CSV…', 'info')}
                className="flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-[12px] font-medium text-ink-700 hover:bg-ink-50">
                <Download size={13} /> Exportar CSV
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {stats.map(s => (
                <div key={s.label} className="bg-white border border-ink-200 rounded-xl p-4">
                  <p className={`text-[22px] font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-ink-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar por nombre, teléfono, email..."
                  className="h-9 w-full rounded-md border border-ink-200 bg-white pl-8 pr-3 text-[13px] text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex items-center gap-1 bg-white border border-ink-200 rounded-md overflow-hidden text-[12px]">
                {STAGE_FILTERS.map(f => (
                  <button key={f.id} onClick={() => setStageFilter(f.id)}
                    className={`px-3 py-1.5 font-medium transition-colors ${stageFilter === f.id ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-50'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-ink-100 bg-ink-50">
                  <tr>
                    {['Contacto', 'Canal', 'Etapa CRM', 'Interés / Asunto', 'Score', 'Etiquetas', 'Último contacto', ''].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {filtered.map(c => {
                    const ch = CHANNELS[c.channel as keyof typeof CHANNELS];
                    const stageInfo = CRM_STAGES[c.crmStage ?? 'lead'];
                    const isSelected = c.id === selected;
                    return (
                      <tr key={c.id}
                          onClick={() => setSelected(isSelected ? null : c.id)}
                          className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary-soft' : 'hover:bg-ink-50'}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="grid size-8 place-items-center rounded-full text-white text-[11px] font-bold shrink-0"
                                 style={{ background: `hsl(${c.hue},65%,52%)` }}>
                              {initials(c.name)}
                            </div>
                            <div>
                              <p className="text-[13px] font-medium text-ink-900">{c.name}</p>
                              <p className="text-[11px] text-ink-400">{c.handle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="grid size-6 place-items-center rounded-full text-[9px] font-bold text-white"
                                style={{ background: ch?.color }}>{ch?.short}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold border"
                                style={{ background: stageInfo.soft, color: stageInfo.color, borderColor: stageInfo.color + '60' }}>
                            {stageInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <p className="text-[12px] text-ink-600 truncate">{c.sub}</p>
                        </td>
                        <td className="px-4 py-3">
                          {c.score !== null ? (
                            <span className="text-[12px] font-semibold tabular-nums"
                                  style={{ color: c.score >= 80 ? '#16a34a' : c.score >= 50 ? '#d97706' : '#dc2626' }}>
                              {c.score}
                            </span>
                          ) : <span className="text-ink-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {c.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-600">{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-ink-400">{c.lastSeen}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={e => { e.stopPropagation(); openChat(c.id, c.kind); }}
                            className="flex items-center gap-1 rounded-md bg-primary-soft border border-primary/20 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/10"
                          >
                            <MessageSquare size={10} /> Chat
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Detail panel ───────────────────────────────────── */}
      {selectedContact && (
        <div className="w-[320px] shrink-0 overflow-hidden border-l border-ink-200">
          <ContactDetail
            contact={selectedContact}
            onClose={() => setSelected(null)}
            onOpenChat={(id, kind) => { openChat(id, kind); }}
            onUpdateStage={handleUpdateStage}
          />
        </div>
      )}
    </div>
  );
}
