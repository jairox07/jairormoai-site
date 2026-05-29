"use client";

import { useApp } from "@/context/AppContext";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

const ICONS = {
  success: CheckCircle2,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
};
const COLORS = {
  success: { bg: "#f0fdf4", border: "#bbf7d0", icon: "#16a34a", text: "#166534" },
  error:   { bg: "#fef2f2", border: "#fecaca", icon: "#dc2626", text: "#991b1b" },
  warning: { bg: "#fffbeb", border: "#fde68a", icon: "#d97706", text: "#92400e" },
  info:    { bg: "#eff6ff", border: "#bfdbfe", icon: "#2563eb", text: "#1e40af" },
};

export default function ToastRenderer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const Icon = ICONS[t.kind];
        const c    = COLORS[t.kind];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border shadow-lg px-4 py-3 w-80"
            style={{ animation: 'toast-slide-in 0.2s ease-out', background: c.bg, borderColor: c.border }}
          >
            <Icon size={16} style={{ color: c.icon }} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-[13px] font-medium leading-snug" style={{ color: c.text }}>
              {t.message}
            </p>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 rounded p-0.5 hover:bg-black/5 transition-colors"
              style={{ color: c.icon }}
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
