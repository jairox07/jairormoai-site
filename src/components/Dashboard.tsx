"use client";

import { useState, useEffect } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import Sidebar from "./Sidebar";
import Topbar  from "./Topbar";
import ToastRenderer from "./ui/Toast";
import CommandPalette from "./CommandPalette";
import InviteTeamModal from "./modals/InviteTeamModal";
import MultiChatDock from "./MultiChatDock";

import CRMView           from "./views/CRMView";
import ContactsView      from "./views/ContactsView";
import PipelineView      from "./views/PipelineView";
import AnalyticsView     from "./views/AnalyticsView";
import PlaybooksView     from "./views/PlaybooksView";
import AIStudioView      from "./views/AIStudioView";
import ChannelsView      from "./views/ChannelsView";
import IntegrationsView  from "./views/IntegrationsView";
import WhiteLabelView    from "./views/WhiteLabelView";
import TeamView          from "./views/TeamView";
import HelpView          from "./views/HelpView";
import InventoryView     from "./views/InventoryView";

import { LEADS } from "@/lib/data";

export type View =
  | 'inbox' | 'contacts' | 'pipeline' | 'analytics' | 'playbooks' | 'aistudio'
  | 'channels' | 'integrations' | 'whitelabel' | 'team' | 'help' | 'inventory';

export type SidebarMode = 'hidden' | 'rail' | 'expanded';

/* ─── Inner shell — all state via AppContext ─────────────────────── */
function DashboardShell() {
  const {
    leads, setLeads, tickets, setTickets,
    salesStatuses, setSalesStatuses, supportStatuses, setSupportStatuses,
    brand, setBrand, connections, setConnections, playbooks, setPlaybooks,
    autopilot, setAutopilot,
    chatThreads, openChat, closeChat, minimizeChat, restoreChat,
  } = useApp();

  const [view,         setView]         = useState<View>('inbox');
  const [crmMode,      setCrmMode]      = useState<'sales' | 'support'>('sales');
  const [sidebarMode,  setSidebarMode]  = useState<SidebarMode>('expanded');
  const [selectedId,   setSelectedId]  = useState<string>(LEADS[0].id);
  const [cmdOpen,      setCmdOpen]      = useState(false);
  const [inviteOpen,   setInviteOpen]  = useState(false);

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const newCount = leads.filter(l => l.column === 'new').length +
                   tickets.filter(t => t.column === 'new').length;

  function renderView() {
    switch (view) {
      case 'inbox':
        return (
          <CRMView
            mode={crmMode} setMode={setCrmMode}
            leads={leads} setLeads={setLeads}
            tickets={tickets} setTickets={setTickets}
            salesStatuses={salesStatuses} setSalesStatuses={setSalesStatuses}
            supportStatuses={supportStatuses} setSupportStatuses={setSupportStatuses}
            selectedId={selectedId} setSelectedId={setSelectedId}
            aiName={brand.assistantName}
            autopilot={autopilot} setAutopilot={setAutopilot}
          />
        );
      case 'contacts':     return <ContactsView leads={leads} tickets={tickets} />;
      case 'pipeline':     return <PipelineView leads={leads} salesStatuses={salesStatuses} />;
      case 'analytics':    return <AnalyticsView />;
      case 'playbooks':    return <PlaybooksView playbooks={playbooks} setPlaybooks={setPlaybooks} />;
      case 'aistudio':     return <AIStudioView brand={brand} setBrand={setBrand} />;
      case 'channels':     return <ChannelsView connections={connections} setConnections={setConnections} />;
      case 'integrations': return <IntegrationsView />;
      case 'whitelabel':   return <WhiteLabelView brand={brand} setBrand={setBrand} />;
      case 'team':         return <TeamView />;
      case 'help':         return <HelpView />;
      case 'inventory':    return <InventoryView />;
      default:             return null;
    }
  }

  return (
    <div className="relative flex h-screen min-h-0 bg-ink-50 overflow-hidden">
      <Sidebar
        activeView={view}
        onNavigate={setView}
        mode={sidebarMode}
        setMode={setSidebarMode}
        brand={brand}
        newCount={newCount}
        autopilot={autopilot}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          view={view}
          sidebarMode={sidebarMode}
          setSidebarMode={setSidebarMode}
          onNavigate={setView}
          onOpenCommandPalette={() => setCmdOpen(true)}
          onOpenInviteTeam={() => setInviteOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-hidden">
          {renderView()}
        </main>
      </div>

      <ToastRenderer />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onNavigate={setView} />
      <InviteTeamModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <MultiChatDock
        threads={chatThreads}
        onClose={closeChat}
        onMinimize={minimizeChat}
        onRestore={restoreChat}
        onSelectMain={(id) => { setSelectedId(id); setView('inbox'); }}
        aiName={brand.assistantName}
      />
    </div>
  );
}

/* ─── Root ───────────────────────────────────────────────────────── */
export default function Dashboard() {
  return (
    <AppProvider>
      <DashboardShell />
    </AppProvider>
  );
}
