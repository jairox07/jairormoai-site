"use client";

/**
 * Multi-Chat Dock
 * ─────────────────────────────────────────────────────────────────
 * WhatsApp/Meta/Instagram policy: 1 phone number = 1 WABA.
 * Multiple AGENTS can handle different conversation THREADS via API.
 * Each thread = 1 customer. This dock lets agents have multiple
 * customer threads open simultaneously — each in a floating window
 * that can be minimized to the bottom bar.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Minus, MessageSquare, Send, Bot, User, ChevronUp, Maximize2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { CHANNELS, type Lead, type Ticket, type Message } from "@/lib/data";

export interface ChatThread {
  id: string;       // lead or ticket id
  kind: 'lead' | 'ticket';
  minimized: boolean;
}

interface Props {
  threads: ChatThread[];
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onRestore: (id: string) => void;
  onSelectMain: (id: string) => void; // navigate to inbox + select
  aiName: string;
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function nowLabel() {
  const d = new Date();
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

/* ─── Single floating chat window ────────────────────────────────── */
function FloatingChat({
  thread, card, onClose, onMinimize, onMaximize, aiName,
  onSend,
}: {
  thread: ChatThread;
  card: Lead | Ticket;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  aiName: string;
  onSend: (text: string) => void;
}) {
  const [composer, setComposer] = useState('');
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [card.messages.length]);

  function send() {
    if (!composer.trim()) return;
    onSend(composer.trim());
    setComposer('');
  }

  const ch = CHANNELS[card.channel as keyof typeof CHANNELS];
  const isLead = card.kind === 'lead';

  return (
    <div
      className="flex flex-col bg-white rounded-t-xl shadow-2xl border border-ink-200 overflow-hidden"
      style={{ width: 300, height: 420 }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none shrink-0"
        style={{ background: 'var(--primary)', color: 'white' }}
        onClick={onMinimize}
      >
        <div className="grid size-7 shrink-0 place-items-center rounded-full font-bold text-[11px] text-white"
             style={{ background: `hsl(${card.avatarHue},65%,52%)` }}>
          {initials(card.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold truncate">{card.name}</p>
          <p className="text-[10px] opacity-75 truncate">{ch?.label} · {card.handle}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={e => { e.stopPropagation(); onMaximize(); }}
            className="grid size-5 place-items-center rounded hover:bg-white/20 transition-colors">
            <Maximize2 size={11} />
          </button>
          <button onClick={e => { e.stopPropagation(); onMinimize(); }}
            className="grid size-5 place-items-center rounded hover:bg-white/20 transition-colors">
            <Minus size={11} />
          </button>
          <button onClick={e => { e.stopPropagation(); onClose(); }}
            className="grid size-5 place-items-center rounded hover:bg-white/20 transition-colors">
            <X size={11} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-ink-50">
        {card.messages.slice(-20).map((msg, i) => {
          if (msg.type === 'system' || msg.type === 'handoff' || msg.type === 'ai_note') {
            return (
              <div key={i} className="flex justify-center">
                <span className="rounded-full bg-ink-200/60 px-2 py-0.5 text-[9px] text-ink-500">{msg.text}</span>
              </div>
            );
          }
          if (msg.type === 'payment_card') {
            return (
              <div key={i} className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-[10px]">
                <p className="font-semibold text-emerald-800">💳 Liga de pago · {msg.status === 'paid' ? '✓ Pagado' : 'Pendiente'}</p>
                <p className="text-emerald-700">${msg.amount?.toLocaleString()} MXN — {msg.concept}</p>
              </div>
            );
          }
          const isMe = msg.from === 'human';
          const isAI = msg.from === 'ai';
          const isLead = msg.from === 'lead';
          return (
            <div key={i} className={`flex gap-1.5 ${isLead ? 'justify-end' : 'justify-start'}`}>
              {(isAI || isMe) && (
                <div className={`grid size-5 shrink-0 place-items-center rounded-full mt-0.5 ${isAI ? 'bg-primary-soft' : 'bg-ink-100'}`}>
                  {isAI ? <Bot size={10} className="text-primary" /> : <User size={10} className="text-ink-500" />}
                </div>
              )}
              <div className={`max-w-[75%] rounded-xl px-2.5 py-1.5 text-[11px] leading-snug ${
                isLead ? 'bg-ink-200 text-ink-800' : isAI ? 'bg-primary text-white' : 'bg-white border border-ink-200 text-ink-800'
              }`}>
                {msg.text}
                <span className={`ml-1.5 text-[9px] opacity-60`}>{msg.t}</span>
              </div>
            </div>
          );
        })}
        <div ref={chatEnd} />
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-ink-200 bg-white px-2 py-2 flex items-center gap-2">
        <input
          value={composer}
          onChange={e => setComposer(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Escribe un mensaje…"
          className="flex-1 rounded-lg border border-ink-200 bg-ink-50 px-2.5 py-1.5 text-[11px] text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        <button onClick={send} disabled={!composer.trim()}
          className="grid size-7 place-items-center rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-30">
          <Send size={11} />
        </button>
      </div>
    </div>
  );
}

/* ─── Minimized tab ───────────────────────────────────────────────── */
function MinimizedTab({ card, unread, onRestore, onClose }: {
  card: Lead | Ticket; unread: number; onRestore: () => void; onClose: () => void;
}) {
  const ch = CHANNELS[card.channel as keyof typeof CHANNELS];
  return (
    <div
      className="flex items-center gap-2 rounded-t-xl border border-b-0 border-ink-200 bg-white px-3 py-2 cursor-pointer shadow-md hover:bg-ink-50 transition-colors"
      style={{ minWidth: 160 }}
      onClick={onRestore}
    >
      <div className="grid size-6 shrink-0 place-items-center rounded-full text-white text-[10px] font-bold"
           style={{ background: `hsl(${card.avatarHue},65%,52%)` }}>
        {initials(card.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-ink-900 truncate">{card.name}</p>
        <p className="text-[9px] text-ink-400 truncate">{ch?.short}</p>
      </div>
      {unread > 0 && (
        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">{unread}</span>
      )}
      <button onClick={e => { e.stopPropagation(); onClose(); }}
        className="grid size-4 place-items-center rounded text-ink-400 hover:text-ink-700 hover:bg-ink-100">
        <X size={10} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DOCK CONTAINER
═══════════════════════════════════════════════════════════════════ */
export default function MultiChatDock({ threads, onClose, onMinimize, onRestore, onSelectMain, aiName }: Props) {
  const { leads, tickets, setLeads, setTickets } = useApp();

  function getCard(t: ChatThread): Lead | Ticket | undefined {
    return t.kind === 'lead'
      ? leads.find(l => l.id === t.id)
      : tickets.find(tk => tk.id === t.id);
  }

  function handleSend(thread: ChatThread, text: string) {
    const msg: Omit<Message, 'id'> = { from: 'human', t: nowLabel(), text, by: 'Agente' };
    if (thread.kind === 'lead') {
      setLeads(p => p.map(l => l.id === thread.id ? { ...l, messages: [...l.messages, msg as Message] } : l));
    } else {
      setTickets(p => p.map(tk => tk.id === thread.id ? { ...tk, messages: [...tk.messages, msg as Message] } : tk));
    }
  }

  const open      = threads.filter(t => !t.minimized);
  const minimized = threads.filter(t => t.minimized);

  if (threads.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-4 z-[800] flex items-end gap-3 pointer-events-none">
      {/* Open floating windows */}
      {open.map(t => {
        const card = getCard(t);
        if (!card) return null;
        return (
          <div key={t.id} className="pointer-events-auto">
            <FloatingChat
              thread={t}
              card={card}
              aiName={aiName}
              onClose={() => onClose(t.id)}
              onMinimize={() => onMinimize(t.id)}
              onMaximize={() => { onSelectMain(t.id); }}
              onSend={(text) => handleSend(t, text)}
            />
          </div>
        );
      })}

      {/* Minimized tabs */}
      {minimized.length > 0 && (
        <div className="pointer-events-auto flex items-end gap-2 pb-0">
          {minimized.map(t => {
            const card = getCard(t);
            if (!card) return null;
            return (
              <MinimizedTab
                key={t.id}
                card={card}
                unread={0}
                onRestore={() => onRestore(t.id)}
                onClose={() => onClose(t.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
