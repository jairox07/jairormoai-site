"use client";

import {
  Inbox, Users, TrendingUp, BarChart3, Sparkles, Brain,
  PlugZap, Blocks, Palette, UsersRound, LifeBuoy,
  ChevronLeft, ChevronRight, PanelLeftClose, Zap, Package,
} from "lucide-react";
import type { View, SidebarMode } from "./Dashboard";
import type { DEFAULT_BRAND } from "@/lib/data";

interface SidebarProps {
  activeView: View;
  onNavigate: (v: View) => void;
  mode: SidebarMode;
  setMode: (m: SidebarMode) => void;
  brand: typeof DEFAULT_BRAND;
  newCount: number;
  autopilot: boolean;
}

type NavItem = {
  id: View;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  count?: number;
};

const PRIMARY_NAV: Omit<NavItem, 'count'>[] = [
  { id: 'inbox',     label: 'Bandeja',     icon: Inbox },
  { id: 'contacts',  label: 'Contactos',   icon: Users },
  { id: 'pipeline',  label: 'Pipeline',    icon: TrendingUp },
  { id: 'analytics', label: 'Analytics',   icon: BarChart3 },
  { id: 'inventory', label: 'Inventario',  icon: Package },
  { id: 'playbooks', label: 'Playbooks IA',icon: Sparkles },
  { id: 'aistudio',  label: 'AI Studio',   icon: Brain },
];

const CONFIG_NAV: Omit<NavItem, 'count'>[] = [
  { id: 'channels',     label: 'Canales',      icon: PlugZap },
  { id: 'integrations', label: 'Integraciones',icon: Blocks },
  { id: 'whitelabel',   label: 'Marca Blanca', icon: Palette },
  { id: 'team',         label: 'Equipo',       icon: UsersRound },
];

const ACCOUNT_NAV: Omit<NavItem, 'count'>[] = [
  { id: 'help', label: 'Ayuda', icon: LifeBuoy },
];

export default function Sidebar({ activeView, onNavigate, mode, setMode, brand, newCount, autopilot }: SidebarProps) {
  const isExpanded = mode === 'expanded';
  const isRail     = mode === 'rail';
  const isHidden   = mode === 'hidden';

  const sidebarWidth = isHidden ? 0 : isRail ? 60 : 232;

  function NavGroup({ label, items }: { label: string; items: Omit<NavItem, 'count'>[] }) {
    return (
      <div className="mb-3">
        {isExpanded && (
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">{label}</div>
        )}
        <div className="space-y-0.5">
          {items.map((item) => {
            const count = item.id === 'inbox' ? newCount : undefined;
            const active = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={isRail ? item.label : undefined}
                className={[
                  'group relative flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors',
                  active ? 'bg-primary-soft text-primary' : 'text-ink-700 hover:bg-ink-50',
                  isRail ? 'justify-center' : '',
                ].join(' ')}
              >
                <Icon
                  size={16}
                  strokeWidth={active ? 2.25 : 1.85}
                />
                {isExpanded && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {count != null && count > 0 && (
                      <span className={[
                        'rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                        active ? 'bg-white/70 text-primary ring-1 ring-primary/30' : 'bg-ink-100 text-ink-600',
                      ].join(' ')}>
                        {count}
                      </span>
                    )}
                  </>
                )}
                {isRail && count != null && count > 0 && (
                  <span className="absolute right-1 top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-rose-500 px-0.5 text-[9px] font-bold text-white ring-2 ring-white">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className="no-print flex shrink-0 flex-col border-r border-ink-200 bg-white overflow-hidden"
        style={{
          width: sidebarWidth,
          borderRightWidth: isHidden ? 0 : 1,
          transition: 'width 200ms ease',
        }}
      >
        {/* Brand / logo */}
        <div className="flex items-center gap-2.5 border-b border-ink-200 px-3 py-3.5">
          {brand.logoDataUrl ? (
            <img src={brand.logoDataUrl} alt="logo" className="size-8 shrink-0 rounded-lg object-contain" />
          ) : (
            <div
              className="grid size-8 shrink-0 place-items-center rounded-lg text-[15px] font-bold text-white"
              style={{ background: brand.primaryColor }}
            >
              {brand.logoMonogram}
            </div>
          )}
          {isExpanded && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold tracking-tight">{brand.brandName}</div>
                <div className="truncate text-[10px] text-ink-500">Conversational Commerce</div>
              </div>
              <button
                onClick={() => setMode('rail')}
                className="grid size-7 place-items-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                title="Compactar sidebar"
              >
                <ChevronLeft size={14} />
              </button>
            </>
          )}
        </div>

        {/* Rail controls */}
        {isRail && (
          <div className="flex flex-col items-center gap-1 py-2 border-b border-ink-200">
            <button
              onClick={() => setMode('expanded')}
              className="grid size-7 place-items-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              title="Expandir sidebar"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setMode('hidden')}
              className="grid size-7 place-items-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              title="Ocultar sidebar"
            >
              <PanelLeftClose size={14} />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <NavGroup label="Operación"    items={PRIMARY_NAV} />
          <NavGroup label="Configuración" items={CONFIG_NAV} />
          <NavGroup label="Cuenta"        items={ACCOUNT_NAV} />
        </nav>

        {/* AI card */}
        {isExpanded && (
          <div className="mx-2 mb-2 rounded-lg border border-ink-200 bg-primary-soft p-3">
            <div className="flex items-center gap-2">
              <div
                className="grid size-7 shrink-0 place-items-center rounded-md text-white"
                style={{ background: brand.primaryColor }}
              >
                <Zap size={13} strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-semibold">{brand.assistantName} IA</div>
                <div className="flex items-center gap-1 text-[10px] text-ink-500">
                  <span className={`size-1.5 rounded-full ${autopilot ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {autopilot ? 'activa · respondiendo' : 'piloto manual'}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-ink-500">
              <span>Uso del mes</span>
              <span className="font-medium text-ink-700 tabular-nums">42,180 / 50k</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full" style={{ width: '84%', background: brand.primaryColor }} />
            </div>
          </div>
        )}

        {/* User */}
        <div className="border-t border-ink-200 p-2">
          <div className={`flex items-center gap-2 rounded-md p-1.5 hover:bg-ink-50 ${isRail ? 'justify-center' : ''}`}>
            <div
              className="grid size-7 shrink-0 place-items-center rounded-full text-white text-[11px] font-bold"
              style={{ background: `hsl(210, 70%, 55%)` }}
            >
              PR
            </div>
            {isExpanded && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-semibold">Pablo Reyes</div>
                <div className="text-[10px] text-ink-500">Plan Growth · pro@...</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Floating "show sidebar" tab */}
      {isHidden && (
        <button
          onClick={() => setMode('expanded')}
          className="no-print absolute left-0 top-3 z-30 flex h-8 items-center gap-1.5 rounded-r-md border border-l-0 border-ink-200 bg-white px-2 text-[12px] font-medium text-ink-700 shadow-sm hover:bg-ink-50"
          title="Mostrar menú lateral"
        >
          <ChevronRight size={14} /> Menú
        </button>
      )}
    </>
  );
}
