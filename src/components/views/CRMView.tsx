"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Search, Filter, Plus, MoreHorizontal, Bot, User,
  ChevronDown, CreditCard, Handshake, AlertCircle,
  Send, Zap, MapPin, Link, CalendarDays, Settings2, X, Check,
} from "lucide-react";
import {
  CHANNELS, PRIORITIES,
  type Lead, type Ticket, type KanbanStatus, type Message,
} from "@/lib/data";
import { useApp } from "@/context/AppContext";
import NewLeadModal   from "@/components/modals/NewLeadModal";
import NewTicketModal from "@/components/modals/NewTicketModal";
import Modal, { Field, inputCls } from "@/components/ui/Modal";

/* ─── Props ─────────────────────────────────────────────────────── */
interface CRMViewProps {
  mode: 'sales' | 'support';
  setMode: (m: 'sales' | 'support') => void;
  leads: Lead[];
  setLeads: (fn: (p: Lead[]) => Lead[]) => void;
  tickets: Ticket[];
  setTickets: (fn: (p: Ticket[]) => Ticket[]) => void;
  salesStatuses: KanbanStatus[];
  setSalesStatuses: (fn: (p: KanbanStatus[]) => KanbanStatus[]) => void;
  supportStatuses: KanbanStatus[];
  setSupportStatuses: (fn: (p: KanbanStatus[]) => KanbanStatus[]) => void;
  selectedId: string;
  setSelectedId: (id: string) => void;
  aiName: string;
  autopilot: boolean;
  setAutopilot: (v: boolean) => void;
}

type Card = Lead | Ticket;

/* ─── Helpers ────────────────────────────────────────────────────── */
function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function nowLabel() {
  const d = new Date();
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}

/* ─── Avatar ─────────────────────────────────────────────────────── */
function Avatar({ name, hue, size = 28 }: { name: string; hue: number; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `hsl(${hue},65%,52%)` }}
    >
      {initials(name)}
    </div>
  );
}

/* ─── Channel dot ────────────────────────────────────────────────── */
function ChannelDot({ ch }: { ch?: string }) {
  const key = (ch ?? '') as keyof typeof CHANNELS;
  const info = CHANNELS[key];
  if (!info) return null;
  return (
    <span
      className="grid size-5 shrink-0 place-items-center rounded-full text-[9px] font-bold text-white"
      style={{ background: info.color }}
      title={info.label}
    >
      {info.short}
    </span>
  );
}

/* ─── Score badge ────────────────────────────────────────────────── */
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
  return (
    <span className="flex items-center gap-0.5 text-[11px] font-semibold tabular-nums" style={{ color }}>
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {score}
    </span>
  );
}

/* ─── Priority pill ──────────────────────────────────────────────── */
function PriorityPill({ priority }: { priority: string }) {
  const p = PRIORITIES[priority as keyof typeof PRIORITIES];
  if (!p) return null;
  return (
    <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
          style={{ background: p.soft, color: p.color }}>
      {p.label}
    </span>
  );
}

/* ─── Kanban card ────────────────────────────────────────────────── */
function KanbanCard({ card, isSelected, onClick, isLead, onDragStart }: {
  card: Card; isSelected: boolean; onClick: () => void; isLead: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  const lead   = isLead ? (card as Lead) : null;
  const ticket = !isLead ? (card as Ticket) : null;

  return (
    <button
      draggable
      onDragStart={e => onDragStart(e, card.id)}
      onClick={onClick}
      className={[
        'w-full text-left rounded-xl border bg-white p-3 transition-all hover:shadow-sm cursor-grab active:cursor-grabbing select-none',
        isSelected ? 'border-primary shadow-sm ring-1 ring-primary/20' : 'border-ink-200 hover:border-ink-300',
        (card as Lead).movedByAI ? 'ring-1 ring-primary/20' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Avatar name={card.name} hue={card.avatarHue} size={22} />
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-ink-900 truncate">{card.name}</div>
            <div className="text-[10px] text-ink-400 truncate">{card.handle}</div>
          </div>
        </div>
        <ChannelDot ch={card.channel} />
      </div>

      {lead && (
        <>
          <p className="text-[11px] text-ink-500 line-clamp-2 mb-2 leading-snug">
            {lead.messages[lead.messages.length - 1]?.text ?? lead.intent}
          </p>
          <div className="text-[10px] text-ink-400 mb-2">{lead.intent}</div>
        </>
      )}
      {ticket && (
        <p className="text-[11px] text-ink-500 line-clamp-2 mb-2 leading-snug">{ticket.subject}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {lead   && <ScoreBadge score={lead.score} />}
          {ticket && <PriorityPill priority={ticket.priority} />}
          {(card as Lead).movedByAI && (
            <span className="text-[9px] font-semibold text-primary bg-primary-soft rounded px-1 py-0.5">IA</span>
          )}
          {(card as Ticket).breached && (
            <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 rounded px-1 py-0.5 flex items-center gap-0.5">
              <AlertCircle size={9} /> SLA
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-ink-400">
          {lead && lead.value > 0 && (
            <span className="tabular-nums font-medium text-ink-600">${lead.value.toLocaleString()}</span>
          )}
          <span>{card.lastSeen}</span>
        </div>
      </div>
    </button>
  );
}

/* ─── Message bubble ─────────────────────────────────────────────── */
function MessageBubble({ msg, aiName }: { msg: Message; aiName: string }) {
  if (msg.type === 'payment_card') {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={14} className="text-emerald-600" />
            <span className="text-[11px] font-semibold text-emerald-800">Liga de pago · {msg.method}</span>
            <span className={`ml-auto text-[10px] font-semibold rounded-full px-2 py-0.5 ${msg.status === 'paid' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-100 text-amber-700'}`}>
              {msg.status === 'paid' ? '✓ Pagado' : 'Pendiente'}
            </span>
          </div>
          <p className="text-[12px] font-medium text-emerald-900">${msg.amount?.toLocaleString()} MXN</p>
          <p className="text-[11px] text-emerald-700">{msg.concept}</p>
          <p className="text-[9px] text-emerald-500 mt-1">{msg.t}</p>
        </div>
      </div>
    );
  }

  if (msg.type === 'handoff') {
    return (
      <div className="flex justify-center">
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5">
          <Handshake size={12} className="text-amber-600" />
          <span className="text-[11px] text-amber-800 font-medium">{msg.text}</span>
        </div>
      </div>
    );
  }

  if (msg.type === 'system') {
    return (
      <div className="flex justify-center">
        <div className="flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1 text-[10px] text-ink-600">
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.type === 'ai_note') {
    return (
      <div className="mx-2 rounded-lg border border-primary/20 bg-primary-soft p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Bot size={12} className="text-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Nota de IA</span>
        </div>
        <p className="text-[11px] text-ink-700 leading-relaxed">{msg.text}</p>
      </div>
    );
  }

  const isAI    = msg.from === 'ai';
  const isHuman = msg.from === 'human';
  const isLead  = msg.from === 'lead';

  return (
    <div className={`flex gap-2 ${isLead ? 'justify-end' : 'justify-start'}`}>
      {(isAI || isHuman) && (
        <div className={`grid size-6 shrink-0 place-items-center rounded-full mt-0.5 ${isAI ? 'bg-primary-soft' : 'bg-ink-100'}`}>
          {isAI ? <Bot size={12} className="text-primary" /> : <User size={12} className="text-ink-500" />}
        </div>
      )}
      <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${
        isLead  ? 'bg-ink-100 text-ink-800 rounded-tr-sm'
        : isAI  ? 'bg-primary text-white rounded-tl-sm'
        : 'bg-white border border-ink-200 text-ink-800 rounded-tl-sm'
      }`}>
        {isHuman && (
          <p className="text-[10px] font-semibold mb-0.5" style={{ color: isAI ? 'rgba(255,255,255,0.7)' : '#71717a' }}>
            {msg.by}
          </p>
        )}
        <p className="text-[12px] leading-relaxed">{msg.text}</p>
        <div className={`flex items-center gap-1 mt-1 ${isLead ? 'justify-end' : 'justify-start'}`}>
          {isAI && <span className="text-[9px] text-white/60 font-medium">{aiName} · IA</span>}
          {isAI && <span className="text-[9px] text-white/40">·</span>}
          <span className={`text-[9px] ${isLead ? 'text-ink-400' : isAI ? 'text-white/50' : 'text-ink-400'}`}>{msg.t}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Column Editor Modal ────────────────────────────────────────── */
function ColumnEditorModal({
  open, onClose, statuses, setStatuses
}: {
  open: boolean; onClose: () => void;
  statuses: KanbanStatus[];
  setStatuses: (fn: (p: KanbanStatus[]) => KanbanStatus[]) => void;
}) {
  const [local, setLocal] = useState<KanbanStatus[]>([]);
  useEffect(() => { if (open) setLocal([...statuses]); }, [open, statuses]);

  function save() {
    setStatuses(() => local);
    onClose();
  }

  function updateTitle(id: string, title: string) {
    setLocal(p => p.map(s => s.id === id ? { ...s, title } : s));
  }
  function updateColor(id: string, color: string) {
    setLocal(p => p.map(s => s.id === id ? { ...s, color } : s));
  }

  return (
    <Modal open={open} onClose={onClose} title="Editar columnas del Kanban" width={440}>
      <div className="space-y-2 mb-4">
        {local.map(s => (
          <div key={s.id} className="flex items-center gap-3 rounded-lg border border-ink-200 px-3 py-2">
            <input
              type="color"
              value={s.color}
              onChange={e => updateColor(s.id, e.target.value)}
              className="size-7 cursor-pointer rounded border-0 p-0"
            />
            <input
              value={s.title}
              onChange={e => updateTitle(s.id, e.target.value)}
              className="flex-1 rounded border-0 bg-transparent text-[13px] font-medium text-ink-800 focus:outline-none focus:ring-1 focus:ring-primary/30 rounded-md px-2 py-1"
            />
            <span className="text-[10px] text-ink-400 font-mono">{s.id}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose}
          className="rounded-lg border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50 transition-colors">
          Cancelar
        </button>
        <button onClick={save}
          className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity">
          Guardar cambios
        </button>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CRM VIEW
═══════════════════════════════════════════════════════════════════ */
export default function CRMView({
  mode, setMode,
  leads, setLeads,
  tickets, setTickets,
  salesStatuses, setSalesStatuses,
  supportStatuses, setSupportStatuses,
  selectedId, setSelectedId,
  aiName, autopilot, setAutopilot,
}: CRMViewProps) {
  const { toast, addNotification } = useApp();
  const isSupport = mode === 'support';
  const cards     = isSupport ? tickets as Card[] : leads as Card[];
  const statuses  = isSupport ? supportStatuses : salesStatuses;
  const setStatuses = isSupport ? setSupportStatuses : setSalesStatuses;

  const [query,      setQuery]      = useState('');
  const [chFilter,   setChFilter]   = useState('all');
  const [composer,   setComposer]   = useState('');
  const [dragId,     setDragId]     = useState<string | null>(null);
  const [dropCol,    setDropCol]    = useState<string | null>(null);

  // Modals
  const [newLeadOpen,   setNewLeadOpen]   = useState(false);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [colEditorOpen, setColEditorOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter(c => {
      if (chFilter !== 'all' && c.channel !== chFilter) return false;
      if (!q) return true;
      const hay = [c.name, (c as Lead).intent ?? '', (c as Ticket).subject ?? '', c.handle].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [cards, query, chFilter]);

  const byCol = useMemo(() => {
    const map: Record<string, Card[]> = Object.fromEntries(statuses.map(s => [s.id, []]));
    filtered.forEach(c => { if (map[c.column]) map[c.column].push(c); });
    return map;
  }, [filtered, statuses]);

  const selected = (cards.find(c => c.id === selectedId) ?? filtered[0] ?? cards[0]) as Lead | Ticket | undefined;
  const isLead = selected?.kind === 'lead';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId, selected?.messages.length]);

  /* ── Drag & Drop ─────────────────────────────────────────────── */
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropCol(colId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (!dragId) return;
    const card = cards.find(c => c.id === dragId);
    if (!card || card.column === colId) { setDragId(null); setDropCol(null); return; }

    const colTitle = statuses.find(s => s.id === colId)?.title ?? colId;

    if (isSupport) {
      setTickets(p => p.map(t => t.id === dragId ? { ...t, column: colId } : t));
    } else {
      setLeads(p => p.map(l => l.id === dragId ? { ...l, column: colId } : l));
    }
    toast(`${card.name} movido a "${colTitle}"`, "success");
    addNotification({
      icon: "bar-chart-3", tint: "#605BFF", view: "inbox",
      title: `${isSupport ? 'Ticket' : 'Lead'} movido`,
      body: `${card.name} → ${colTitle}`,
    });
    setDragId(null);
    setDropCol(null);
  }, [dragId, cards, statuses, isSupport, setLeads, setTickets, toast, addNotification]);

  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setDropCol(null);
  }, []);

  /* ── Send message ────────────────────────────────────────────── */
  function sendMessage() {
    if (!selected || !composer.trim()) return;
    const msg: Omit<Message, "id"> = {
      from: 'human', t: nowLabel(), text: composer.trim(), by: 'Pablo'
    };
    if (isLead) {
      setLeads(p => p.map(l => l.id === selected.id ? { ...l, messages: [...l.messages, msg as Message] } : l));
    } else {
      setTickets(p => p.map(t => t.id === selected.id ? { ...t, messages: [...t.messages, msg as Message] } : t));
    }
    setComposer('');
  }

  /* ── Quick action chips ──────────────────────────────────────── */
  function handleChip(label: string) {
    if (!selected) return;
    if (label.includes('Liga de pago')) {
      const payMsg: Omit<Message, "id"> = {
        from: 'ai', t: nowLabel(), text: '',
        type: 'payment_card', method: 'Stripe', amount: 8330,
        concept: 'Pago tratamiento ortodoncia', status: 'pending',
      };
      if (isLead) {
        setLeads(p => p.map(l => l.id === selected.id ? { ...l, messages: [...l.messages, payMsg as Message] } : l));
      } else {
        setTickets(p => p.map(t => t.id === selected.id ? { ...t, messages: [...t.messages, payMsg as Message] } : t));
      }
      toast("Liga de pago Stripe generada", "success");
      return;
    }
    if (label.includes('Agendar cita')) {
      const bookMsg: Omit<Message, "id"> = {
        from: 'ai', t: nowLabel(),
        text: '📅 Te comparto los horarios disponibles esta semana:\n• Lun 19 may · 10:00 am\n• Mar 20 may · 3:00 pm\n• Mié 21 may · 11:00 am\n¿Cuál te acomoda mejor?',
      };
      if (isLead) {
        setLeads(p => p.map(l => l.id === selected.id ? { ...l, messages: [...l.messages, bookMsg as Message] } : l));
      } else {
        setTickets(p => p.map(t => t.id === selected.id ? { ...t, messages: [...t.messages, bookMsg as Message] } : t));
      }
      toast("Horarios de cita enviados", "info");
      return;
    }
    if (label.includes('Ubicación')) {
      const locMsg: Omit<Message, "id"> = {
        from: 'ai', t: nowLabel(),
        text: '📍 Estamos en Av. Insurgentes Sur 1602, Col. Crédito Constructor, CDMX. A 2 min del metro Barranca del Muerto. ¡Te esperamos!',
      };
      if (isLead) {
        setLeads(p => p.map(l => l.id === selected.id ? { ...l, messages: [...l.messages, locMsg as Message] } : l));
      } else {
        setTickets(p => p.map(t => t.id === selected.id ? { ...t, messages: [...t.messages, locMsg as Message] } : t));
      }
      toast("Ubicación enviada", "info");
      return;
    }
    // Cotización
    const quotMsg: Omit<Message, "id"> = {
      from: 'ai', t: nowLabel(),
      text: '💳 Cotización ortodoncia brackets transparentes:\n• Enganche: $5,000 MXN\n• 12 MSI sin intereses desde $2,083/mes\n• Total: $25,000 MXN\n\nIncluye consultas de seguimiento mensuales. ¿Te enviamos el contrato para revisión?',
    };
    if (isLead) {
      setLeads(p => p.map(l => l.id === selected.id ? { ...l, messages: [...l.messages, quotMsg as Message] } : l));
    } else {
      setTickets(p => p.map(t => t.id === selected.id ? { ...t, messages: [...t.messages, quotMsg as Message] } : t));
    }
    toast("Cotización enviada", "success");
  }

  /* ── Tomar control / Autopilot ───────────────────────────────── */
  function takeControl() {
    if (!selected) return;
    if (isLead) {
      setLeads(p => p.map(l => l.id === selected.id ? { ...l, assignee: 'Pablo' } : l));
    } else {
      setTickets(p => p.map(t => t.id === selected.id ? { ...t, assignee: 'Pablo' } : t));
    }
    toast("Control tomado — ahora tú manejas esta conversación", "info");
  }

  return (
    <div className="flex h-full min-h-0 gap-0">
      {/* ── Left: Kanban ─────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col border-r border-ink-200">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-semibold tracking-tight">
              {isSupport ? 'CRM · Soporte' : 'CRM · Ventas'}
            </h1>
            <span className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[11px] font-medium text-ink-600 tabular-nums">
              {filtered.length}
            </span>
            <div className="flex rounded-md border border-ink-200 overflow-hidden text-[12px]">
              <button
                onClick={() => setMode('sales')}
                className={`px-3 py-1 font-medium transition-colors ${mode === 'sales' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-50'}`}
              >
                Ventas
              </button>
              <button
                onClick={() => setMode('support')}
                className={`px-3 py-1 font-medium transition-colors ${mode === 'support' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-50'}`}
              >
                Soporte
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutopilot(!autopilot)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                autopilot ? 'bg-primary text-white' : 'border border-ink-200 text-ink-600 hover:bg-ink-50'
              }`}
            >
              <span className={`size-1.5 rounded-full ${autopilot ? 'bg-white animate-pulse' : 'bg-ink-400'}`} />
              {autopilot ? 'Autopilot ON' : 'Autopilot OFF'}
            </button>

            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar lead, producto..."
                className="h-8 rounded-md border border-ink-200 bg-white pl-7 pr-3 text-[12px] text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/20 w-44"
              />
            </div>

            <div className="relative">
              <select
                value={chFilter}
                onChange={e => setChFilter(e.target.value)}
                className="h-8 rounded-md border border-ink-200 bg-white pl-3 pr-7 text-[12px] text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                <option value="all">Todos los canales</option>
                {Object.entries(CHANNELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setColEditorOpen(true)}
              className="flex h-8 items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 text-[12px] font-medium text-ink-700 hover:bg-ink-50"
            >
              <Settings2 size={12} /> Editar columnas
            </button>

            <button
              onClick={() => isSupport ? setNewTicketOpen(true) : setNewLeadOpen(true)}
              className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12px] font-medium text-white hover:opacity-90"
            >
              <Plus size={12} /> {isSupport ? 'Nuevo Ticket' : 'Nuevo Lead'}
            </button>
          </div>
        </div>

        {/* Kanban columns with DnD */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-3 p-4 h-full" style={{ minWidth: 'max-content' }}>
            {statuses.map(status => {
              const colCards = byCol[status.id] ?? [];
              const isDropTarget = dropCol === status.id;
              return (
                <div
                  key={status.id}
                  className={`w-[220px] flex flex-col shrink-0 rounded-xl transition-colors ${isDropTarget ? 'bg-primary/5 ring-2 ring-primary/20' : ''}`}
                  onDragOver={e => handleDragOver(e, status.id)}
                  onDrop={e => handleDrop(e, status.id)}
                  onDragLeave={() => setDropCol(null)}
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 px-1" style={{ borderColor: status.color }}>
                    <span className="size-2 rounded-full" style={{ background: status.color }} />
                    <h3 className="text-[12px] font-semibold text-ink-700 flex-1">{status.title}</h3>
                    <span className="text-[10px] bg-ink-100 text-ink-500 rounded px-1.5 py-0.5 font-medium tabular-nums">
                      {colCards.length}
                    </span>
                  </div>

                  <div className={`flex-1 overflow-y-auto space-y-2 pr-0.5 rounded-lg p-1 ${isDropTarget ? 'min-h-[60px]' : ''}`}>
                    {colCards.map(card => (
                      <KanbanCard
                        key={card.id}
                        card={card}
                        isLead={!isSupport}
                        isSelected={card.id === selectedId}
                        onClick={() => setSelectedId(card.id)}
                        onDragStart={handleDragStart}
                      />
                    ))}
                    {colCards.length === 0 && (
                      <div className={`rounded-xl border-2 border-dashed p-4 text-center transition-colors ${isDropTarget ? 'border-primary/40 bg-primary/5' : 'border-ink-100'}`}>
                        <p className="text-[10px] text-ink-400">{isDropTarget ? 'Soltar aquí' : `Sin ${isSupport ? 'tickets' : 'leads'}`}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right: Chat panel ────────────────────────────────────── */}
      {selected ? (
        <div className="w-[380px] shrink-0 flex flex-col bg-white">
          {/* Chat header */}
          <div className="border-b border-ink-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar name={selected.name} hue={selected.avatarHue} size={36} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-ink-900 truncate">{selected.name}</span>
                  <ChannelDot ch={selected.channel} />
                </div>
                <div className="text-[11px] text-ink-500">
                  {CHANNELS[selected.channel as keyof typeof CHANNELS]?.label} · {selected.handle}
                </div>
              </div>
              <button className="text-ink-400 hover:text-ink-700">
                <MoreHorizontal size={15} />
              </button>
            </div>

            {/* Meta row */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              {isLead && (
                <>
                  <div>
                    <p className="text-ink-400 uppercase tracking-wide text-[9px] font-semibold mb-0.5">Score IA</p>
                    <ScoreBadge score={(selected as Lead).score} />
                  </div>
                  <div>
                    <p className="text-ink-400 uppercase tracking-wide text-[9px] font-semibold mb-0.5">Producto</p>
                    <p className="text-ink-700 font-medium truncate">{(selected as Lead).intent}</p>
                  </div>
                  <div>
                    <p className="text-ink-400 uppercase tracking-wide text-[9px] font-semibold mb-0.5">Valor</p>
                    <p className="text-ink-700 font-medium">
                      {(selected as Lead).value > 0 ? `$${(selected as Lead).value.toLocaleString()}` : '—'}
                    </p>
                  </div>
                </>
              )}
              {!isLead && (
                <>
                  <div>
                    <p className="text-ink-400 uppercase tracking-wide text-[9px] font-semibold mb-0.5">Prioridad</p>
                    <PriorityPill priority={(selected as Ticket).priority} />
                  </div>
                  <div>
                    <p className="text-ink-400 uppercase tracking-wide text-[9px] font-semibold mb-0.5">Categoría</p>
                    <p className="text-ink-700 font-medium">{(selected as Ticket).category}</p>
                  </div>
                  <div>
                    <p className="text-ink-400 uppercase tracking-wide text-[9px] font-semibold mb-0.5">SLA</p>
                    <p className={`font-medium ${(selected as Ticket).breached ? 'text-rose-600' : 'text-amber-600'}`}>
                      {(selected as Ticket).sla ?? '—'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Status / assignee / tags */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 rounded-md border border-ink-200 px-2 py-1 text-[11px] text-ink-700">
                {statuses.find(s => s.id === selected.column)?.title ?? selected.column}
                <ChevronDown size={10} className="text-ink-400" />
              </div>
              <div className="flex items-center gap-1 rounded-md border border-ink-200 px-2 py-1 text-[11px] text-ink-700">
                {selected.assignee === 'sofia-ai' ? `${aiName} IA` : selected.assignee ?? 'Sin asignar'}
              </div>
              {selected.tags.slice(0, 2).map(tag => (
                <span key={tag} className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-600">{tag}</span>
              ))}
            </div>

            {/* Autopilot bar */}
            {autopilot && selected.assignee === 'sofia-ai' && (
              <div className="mt-2 flex items-center justify-between rounded-md bg-primary-soft px-3 py-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-primary font-medium">
                  <Bot size={12} />
                  {aiName} está respondiendo automáticamente
                </div>
                <button
                  onClick={takeControl}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Tomar control
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ink-50">
            {selected.messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} aiName={aiName} />
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-ink-200 bg-white px-4 py-3">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                { icon: CreditCard,   label: '/ Cotización 12 MSI' },
                { icon: MapPin,       label: '/ Ubicación sucursal' },
                { icon: Link,         label: '/ Liga de pago Stripe' },
                { icon: CalendarDays, label: '/ Agendar cita' },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => handleChip(label)}
                  className="flex items-center gap-1 rounded-md border border-ink-200 bg-white px-2 py-1 text-[10px] text-ink-600 hover:bg-ink-50 hover:border-primary/30 transition-colors"
                >
                  <Icon size={10} />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-md border border-ink-200 bg-ink-50 px-3 py-2">
              <input
                value={composer}
                onChange={e => setComposer(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Escribe un mensaje o presiona /"
                className="flex-1 bg-transparent text-[12px] text-ink-700 placeholder:text-ink-400 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!composer.trim()}
                className="grid size-7 place-items-center rounded-md bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-30"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-[380px] shrink-0 flex items-center justify-center bg-white">
          <div className="text-center p-8">
            <div className="grid size-12 place-items-center rounded-2xl bg-ink-100 mx-auto mb-3">
              <Bot size={20} className="text-ink-400" />
            </div>
            <p className="text-[13px] font-medium text-ink-600">Selecciona un lead</p>
            <p className="text-[11px] text-ink-400 mt-1">para ver el historial de conversación</p>
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────── */}
      <NewLeadModal   open={newLeadOpen}   onClose={() => setNewLeadOpen(false)} />
      <NewTicketModal open={newTicketOpen} onClose={() => setNewTicketOpen(false)} />
      <ColumnEditorModal
        open={colEditorOpen}
        onClose={() => setColEditorOpen(false)}
        statuses={statuses}
        setStatuses={setStatuses}
      />
    </div>
  );
}
