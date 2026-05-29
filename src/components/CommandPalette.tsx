"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Inbox, Users, BarChart3, Bot, Settings, Zap, Layers, HelpCircle } from "lucide-react";

interface Action {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  category: string;
  onSelect: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: import("./Dashboard").View) => void;
}

export default function CommandPalette({ open, onClose, onNavigate }: Props) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  const allActions: Action[] = useMemo(() => [
    { id: "inbox",        label: "Bandeja unificada",  description: "CRM · Ventas y Soporte",      icon: Inbox,     category: "Vistas", onSelect: () => { onNavigate("inbox"); onClose(); } },
    { id: "contacts",     label: "Contactos",           description: "Leads y clientes",            icon: Users,     category: "Vistas", onSelect: () => { onNavigate("contacts"); onClose(); } },
    { id: "analytics",    label: "Analytics",           description: "KPIs y métricas",             icon: BarChart3, category: "Vistas", onSelect: () => { onNavigate("analytics"); onClose(); } },
    { id: "playbooks",    label: "Playbooks",           description: "Automatizaciones",            icon: Zap,       category: "Vistas", onSelect: () => { onNavigate("playbooks"); onClose(); } },
    { id: "aistudio",     label: "AI Studio",           description: "Base de conocimiento e IA",  icon: Bot,       category: "Vistas", onSelect: () => { onNavigate("aistudio"); onClose(); } },
    { id: "channels",     label: "Canales",             description: "WhatsApp, Instagram, Web",   icon: Layers,    category: "Vistas", onSelect: () => { onNavigate("channels"); onClose(); } },
    { id: "integrations", label: "Integraciones",       description: "Stripe, Google, APIs",       icon: Settings,  category: "Vistas", onSelect: () => { onNavigate("integrations"); onClose(); } },
    { id: "whitelabel",   label: "White Label",         description: "Marca y personalización",    icon: Settings,  category: "Ajustes", onSelect: () => { onNavigate("whitelabel"); onClose(); } },
    { id: "team",         label: "Equipo",              description: "Miembros y roles",           icon: Users,     category: "Ajustes", onSelect: () => { onNavigate("team"); onClose(); } },
    { id: "help",         label: "Centro de ayuda",     description: "Documentación y soporte",    icon: HelpCircle,category: "Ayuda",   onSelect: () => { onNavigate("help"); onClose(); } },
  ], [onNavigate, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allActions;
    return allActions.filter(a =>
      a.label.toLowerCase().includes(q) ||
      (a.description ?? "").toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  }, [query, allActions]);

  useEffect(() => { setCursor(0); }, [filtered.length]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
      if (e.key === "Enter") { filtered[cursor]?.onSelect(); }
      if (e.key === "Escape") { onClose(); }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, cursor, onClose]);

  if (!open) return null;

  const groups = [...new Set(filtered.map(a => a.category))];

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[560px] rounded-2xl bg-white shadow-2xl overflow-hidden border border-ink-200">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-ink-100">
          <Search size={16} className="text-ink-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar vistas, acciones, leads…"
            className="flex-1 text-[14px] text-ink-900 placeholder:text-ink-400 outline-none bg-transparent"
          />
          <kbd className="rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10px] font-mono text-ink-500">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-[13px] text-ink-400">Sin resultados para "{query}"</p>
          )}
          {groups.map(group => (
            <div key={group}>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-ink-400">{group}</p>
              {filtered.filter(a => a.category === group).map((action, idx) => {
                const globalIdx = filtered.indexOf(action);
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={action.onSelect}
                    onMouseEnter={() => setCursor(globalIdx)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors ${cursor === globalIdx ? "bg-primary/5 text-primary" : "text-ink-700 hover:bg-ink-50"}`}
                  >
                    <div className={`grid size-8 shrink-0 place-items-center rounded-lg ${cursor === globalIdx ? "bg-primary/10" : "bg-ink-100"}`}>
                      <Icon size={14} className={cursor === globalIdx ? "text-primary" : "text-ink-500"} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">{action.label}</p>
                      {action.description && <p className="text-[11px] text-ink-400">{action.description}</p>}
                    </div>
                    {cursor === globalIdx && (
                      <kbd className="ml-auto rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10px] font-mono text-ink-500">↵</kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
