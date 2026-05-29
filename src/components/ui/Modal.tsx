"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}

export default function Modal({ open, onClose, title, children, width = 480 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative z-10 rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]"
        style={{ width }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-200 px-6 py-4 shrink-0">
          <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            className="grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Reusable field wrapper ─────────────────────────────────────── */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-ink-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

/* ─── Reusable input styles ──────────────────────────────────────── */
export const inputCls =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all";
