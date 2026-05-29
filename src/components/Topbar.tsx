"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Search, Bell, LifeBuoy, Zap } from "lucide-react";
import type { View, SidebarMode } from "./Dashboard";
import { useApp } from "@/context/AppContext";
import NotificationsPanel from "./NotificationsPanel";

interface TopbarProps {
  view: View;
  sidebarMode: SidebarMode;
  setSidebarMode: (m: SidebarMode) => void;
  onNavigate: (v: View) => void;
  onOpenCommandPalette: () => void;
  onOpenInviteTeam: () => void;
}

const VIEW_LABELS: Record<View, { crumb: string; sub: string }> = {
  inbox:        { crumb: 'CRM',           sub: 'Bandeja unificada' },
  contacts:     { crumb: 'CRM',           sub: 'Contactos / Pacientes' },
  pipeline:     { crumb: 'CRM',           sub: 'Pipeline' },
  analytics:    { crumb: 'CRM',           sub: 'Analytics' },
  inventory:    { crumb: 'Operaciones',   sub: 'Inventario y Farmacia' },
  playbooks:    { crumb: 'CRM',           sub: 'Playbooks IA' },
  aistudio:     { crumb: 'CRM',           sub: 'AI Studio' },
  channels:     { crumb: 'Configuración', sub: 'Canales' },
  integrations: { crumb: 'Configuración', sub: 'Integraciones' },
  whitelabel:   { crumb: 'Configuración', sub: 'Marca Blanca' },
  team:         { crumb: 'Configuración', sub: 'Equipo' },
  help:         { crumb: 'Cuenta',        sub: 'Ayuda' },
};

export default function Topbar({
  view, sidebarMode, setSidebarMode, onNavigate,
  onOpenCommandPalette, onOpenInviteTeam,
}: TopbarProps) {
  const { crumb, sub } = VIEW_LABELS[view] ?? VIEW_LABELS.inbox;
  const { unreadCount } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);

  function toggleSidebar() {
    if (sidebarMode === 'hidden') setSidebarMode('expanded');
    else if (sidebarMode === 'expanded') setSidebarMode('rail');
    else setSidebarMode('hidden');
  }

  return (
    <header className="no-print flex h-[52px] shrink-0 items-center justify-between gap-4 border-b border-ink-200 bg-white px-4">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-2 text-[13px]">
        <button
          onClick={toggleSidebar}
          className="grid size-8 shrink-0 place-items-center rounded-md text-ink-500 hover:bg-ink-100"
          title={sidebarMode === 'hidden' ? 'Mostrar menú' : sidebarMode === 'expanded' ? 'Compactar menú' : 'Ocultar menú'}
        >
          {sidebarMode === 'hidden' ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
        <span className="text-ink-400">{crumb}</span>
        <span className="text-ink-300 text-[11px]">›</span>
        <span className="truncate font-semibold text-ink-900">{sub}</span>
        <span className="ml-2 hidden sm:inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ background: '#605BFF22', color: '#605BFF' }}>
          <span className="size-1.5 rounded-full" style={{ background: '#605BFF' }} />
          Admin
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-[12px] text-ink-500 hover:bg-ink-50 transition-colors"
        >
          <Search size={12} />
          <span>Buscar...</span>
          <kbd className="ml-1.5 rounded border border-ink-200 bg-ink-50 px-1 font-mono text-[10px] text-ink-500">⌘K</kbd>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative grid size-8 place-items-center rounded-md border border-ink-200 bg-white text-ink-600 hover:bg-ink-50 transition-colors"
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        <button
          onClick={() => onNavigate('help')}
          className="grid size-8 place-items-center rounded-md border border-ink-200 bg-white text-ink-600 hover:bg-ink-50 transition-colors"
          title="Ayuda"
        >
          <LifeBuoy size={14} />
        </button>

        <button
          onClick={onOpenInviteTeam}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-ink-900 px-3 text-[12px] font-medium text-white hover:bg-ink-800 transition-colors"
        >
          <Zap size={12} strokeWidth={2.25} /> Invitar al equipo
        </button>
      </div>
    </header>
  );
}
