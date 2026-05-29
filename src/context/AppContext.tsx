"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  LEADS, TICKETS, SALES_STATUSES, SUPPORT_STATUSES,
  DEFAULT_BRAND, DEFAULT_CONNECTIONS, PLAYBOOKS,
  type Lead, type Ticket, type KanbanStatus, type Message,
} from "@/lib/data";
import type { ChatThread } from "@/components/MultiChatDock";

/* ─── Toast ────────────────────────────────────────────────────── */
export type ToastKind = "success" | "error" | "info" | "warning";
export interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

/* ─── Notification ──────────────────────────────────────────────── */
export interface Notification {
  id: string;
  icon: string;
  tint: string;
  view?: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

/* ─── Context value ─────────────────────────────────────────────── */
interface AppCtx {
  // Data
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  salesStatuses: KanbanStatus[];
  setSalesStatuses: React.Dispatch<React.SetStateAction<KanbanStatus[]>>;
  supportStatuses: KanbanStatus[];
  setSupportStatuses: React.Dispatch<React.SetStateAction<KanbanStatus[]>>;
  brand: typeof DEFAULT_BRAND;
  setBrand: React.Dispatch<React.SetStateAction<typeof DEFAULT_BRAND>>;
  connections: typeof DEFAULT_CONNECTIONS;
  setConnections: React.Dispatch<React.SetStateAction<typeof DEFAULT_CONNECTIONS>>;
  playbooks: typeof PLAYBOOKS;
  setPlaybooks: React.Dispatch<React.SetStateAction<typeof PLAYBOOKS>>;
  autopilot: boolean;
  setAutopilot: React.Dispatch<React.SetStateAction<boolean>>;

  // Toasts
  toasts: Toast[];
  toast: (msg: string, kind?: ToastKind) => void;
  removeToast: (id: string) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (n: Omit<Notification, "id" | "read" | "time">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  unreadCount: number;

  // Lead helpers
  addLead: (lead: Omit<Lead, "id">) => Lead;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  moveLead: (id: string, column: string) => void;
  addMessage: (leadId: string, msg: Omit<Message, "id">) => void;

  // Ticket helpers
  addTicket: (ticket: Omit<Ticket, "id">) => Ticket;
  updateTicket: (id: string, patch: Partial<Ticket>) => void;
  moveTicket: (id: string, column: string) => void;

  // Multi-chat dock
  chatThreads: ChatThread[];
  openChat: (id: string, kind: 'lead' | 'ticket') => void;
  closeChat: (id: string) => void;
  minimizeChat: (id: string) => void;
  restoreChat: (id: string) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

let _idCounter = 1000;
function uid(prefix = "x") { return `${prefix}-${++_idCounter}-${Date.now()}`; }

function nowTime() {
  const d = new Date();
  return d.getHours().toString().padStart(2,"0") + ":" + d.getMinutes().toString().padStart(2,"0");
}

function seedNotifications(): Notification[] {
  return [
    { id:"n1", icon:"sparkles", tint:"#605BFF", view:"inbox", title:"Sofía IA calificó un lead", body:"Juan Pérez — score 96, Ortodoncia brackets transparentes", time:"hace 1 min", read:false },
    { id:"n2", icon:"credit-card", tint:"#16A34A", view:"analytics", title:"Pago recibido · Stripe", body:"Sofía cerró $8,330 MXN vía liga de pago — Juan Pérez", time:"hace 3 min", read:false },
    { id:"n3", icon:"alert-triangle", tint:"#F59E0B", view:"inbox", title:"SLA por vencer", body:"Marco Herrera — ticket #t-003, vence en 1h", time:"hace 12 min", read:false },
    { id:"n4", icon:"bar-chart-3", tint:"#0EA5E9", view:"analytics", title:"Reporte semanal listo", body:"47,210 mensajes · +18.6% ingresos vs semana anterior", time:"hoy 09:00", read:true },
  ];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [leads,           setLeads]           = useState<Lead[]>(LEADS);
  const [tickets,         setTickets]         = useState<Ticket[]>(TICKETS);
  const [salesStatuses,   setSalesStatuses]   = useState<KanbanStatus[]>(SALES_STATUSES);
  const [supportStatuses, setSupportStatuses] = useState<KanbanStatus[]>(SUPPORT_STATUSES);
  const [brand,           setBrand]           = useState(DEFAULT_BRAND);
  const [connections,     setConnections]     = useState(DEFAULT_CONNECTIONS);
  const [playbooks,       setPlaybooks]       = useState(PLAYBOOKS);
  const [autopilot,       setAutopilot]       = useState(true);
  const [toasts,          setToasts]          = useState<Toast[]>([]);
  const [notifications,   setNotifications]   = useState<Notification[]>(seedNotifications);
  const [chatThreads,     setChatThreads]     = useState<ChatThread[]>([]);

  // Sync primary color CSS var
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", brand.primaryColor);
  }, [brand.primaryColor]);

  /* ── Toasts ─────────────────────────────────────────────────── */
  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = uid("toast");
    setToasts(p => [...p, { id, message, kind }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  /* ── Notifications ───────────────────────────────────────────── */
  const addNotification = useCallback((n: Omit<Notification, "id" | "read" | "time">) => {
    const notif: Notification = { ...n, id: uid("notif"), read: false, time: "ahora" };
    setNotifications(p => [notif, ...p]);
  }, []);
  const markAllRead = useCallback(() => setNotifications(p => p.map(n => ({ ...n, read: true }))), []);
  const markRead    = useCallback((id: string) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n)), []);
  const unreadCount = notifications.filter(n => !n.read).length;

  /* ── Lead helpers ────────────────────────────────────────────── */
  const addLead = useCallback((data: Omit<Lead, "id">): Lead => {
    const lead: Lead = { ...data, id: uid("l") };
    setLeads(p => [lead, ...p]);
    addNotification({ icon:"user-plus", tint:"#605BFF", view:"inbox", title:"Nuevo lead creado", body:`${lead.name} — ${lead.channel}` });
    return lead;
  }, [addNotification]);

  const updateLead = useCallback((id: string, patch: Partial<Lead>) => {
    setLeads(p => p.map(l => l.id === id ? { ...l, ...patch } : l));
  }, []);

  const moveLead = useCallback((id: string, column: string) => {
    setLeads(p => p.map(l => l.id === id ? { ...l, column } : l));
    toast("Lead movido", "info");
  }, [toast]);

  const addMessage = useCallback((leadId: string, msg: Omit<Message, "id">) => {
    const m: Message = { ...msg, id: uid("msg") };
    setLeads(p => p.map(l => l.id === leadId ? { ...l, messages: [...l.messages, m] } : l));
  }, []);

  /* ── Ticket helpers ──────────────────────────────────────────── */
  const addTicket = useCallback((data: Omit<Ticket, "id">): Ticket => {
    const ticket: Ticket = { ...data, id: uid("t") };
    setTickets(p => [ticket, ...p]);
    addNotification({ icon:"life-buoy", tint:"#F59E0B", view:"inbox", title:"Nuevo ticket abierto", body:`${ticket.name} — ${ticket.subject}` });
    return ticket;
  }, [addNotification]);

  const updateTicket = useCallback((id: string, patch: Partial<Ticket>) => {
    setTickets(p => p.map(t => t.id === id ? { ...t, ...patch } : t));
  }, []);

  const moveTicket = useCallback((id: string, column: string) => {
    setTickets(p => p.map(t => t.id === id ? { ...t, column } : t));
    toast("Ticket movido", "info");
  }, [toast]);

  /* ── Multi-chat dock ─────────────────────────────────────────── */
  const openChat = useCallback((id: string, kind: 'lead' | 'ticket') => {
    setChatThreads(p => {
      if (p.find(t => t.id === id)) {
        // restore if minimized
        return p.map(t => t.id === id ? { ...t, minimized: false } : t);
      }
      return [...p, { id, kind, minimized: false }];
    });
  }, []);

  const closeChat    = useCallback((id: string) => setChatThreads(p => p.filter(t => t.id !== id)), []);
  const minimizeChat = useCallback((id: string) => setChatThreads(p => p.map(t => t.id === id ? { ...t, minimized: true } : t)), []);
  const restoreChat  = useCallback((id: string) => setChatThreads(p => p.map(t => t.id === id ? { ...t, minimized: false } : t)), []);

  return (
    <Ctx.Provider value={{
      leads, setLeads, tickets, setTickets,
      salesStatuses, setSalesStatuses, supportStatuses, setSupportStatuses,
      brand, setBrand, connections, setConnections, playbooks, setPlaybooks,
      autopilot, setAutopilot,
      toasts, toast, removeToast,
      notifications, addNotification, markAllRead, markRead, unreadCount,
      addLead, updateLead, moveLead, addMessage,
      addTicket, updateTicket, moveTicket,
      chatThreads, openChat, closeChat, minimizeChat, restoreChat,
    }}>
      {children}
    </Ctx.Provider>
  );
}
