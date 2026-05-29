"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import {
  Sparkles, CreditCard, AlertTriangle, BarChart3,
  UserPlus, LifeBuoy, Bell, Check,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  sparkles:      Sparkles,
  "credit-card": CreditCard,
  "alert-triangle": AlertTriangle,
  "bar-chart-3": BarChart3,
  "user-plus":   UserPlus,
  "life-buoy":   LifeBuoy,
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ open, onClose }: Props) {
  const { notifications, markAllRead, markRead, unreadCount } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-[360px] rounded-2xl border border-ink-200 bg-white shadow-2xl z-[500] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-ink-600" />
          <span className="text-[13px] font-semibold text-ink-900">Notificaciones</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            <Check size={11} /> Marcar todo como leído
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-ink-50">
        {notifications.length === 0 && (
          <div className="py-10 text-center text-[12px] text-ink-400">
            Sin notificaciones
          </div>
        )}
        {notifications.map(n => {
          const Icon = ICON_MAP[n.icon] ?? Bell;
          return (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-ink-50 ${n.read ? "opacity-60" : ""}`}
            >
              <div
                className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full"
                style={{ background: n.tint + "20" }}
              >
                <Icon size={14} style={{ color: n.tint }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[12px] font-semibold text-ink-900 leading-snug ${!n.read ? "text-ink-950" : ""}`}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-ink-500 truncate mt-0.5">{n.body}</p>
                <p className="text-[10px] text-ink-400 mt-0.5">{n.time}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-ink-100 px-4 py-2 text-center">
        <button className="text-[11px] font-medium text-primary hover:underline">
          Ver todas las notificaciones
        </button>
      </div>
    </div>
  );
}
