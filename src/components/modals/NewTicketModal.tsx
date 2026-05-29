"use client";

import { useState } from "react";
import Modal, { Field, inputCls } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { CHANNELS, PRIORITIES } from "@/lib/data";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Soporte técnico", "Facturación / pagos", "Consulta de producto",
  "Queja / reclamación", "Garantía", "Otro",
];

export default function NewTicketModal({ open, onClose }: Props) {
  const { addTicket, toast } = useApp();
  const [form, setForm] = useState({
    name: "", channel: "whatsapp", handle: "", subject: "",
    priority: "normal", category: "",
  });

  function set(k: keyof typeof form, v: string) {
    setForm(p => ({ ...p, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.subject.trim()) return;
    addTicket({
      kind: "ticket",
      name: form.name.trim(),
      channel: form.channel as keyof typeof CHANNELS,
      handle: form.handle || `@${form.name.toLowerCase().replace(/\s+/g, "")}`,
      subject: form.subject.trim(),
      priority: form.priority as import("@/lib/data").Priority,
      category: form.category || "Consulta de producto",
      column: "new",
      assignee: "sofia-ai",
      avatarHue: Math.floor(Math.random() * 360),
      tags: [],
      lastSeen: "ahora",
      sla: "8h",
      breached: false,
      messages: [{
        id: "m0",
        from: "system",
        t: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        text: "Ticket abierto manualmente",
        type: "system",
      }],
    });
    toast(`Ticket "${form.subject.slice(0, 40)}" creado`, "success");
    setForm({ name: "", channel: "whatsapp", handle: "", subject: "", priority: "normal", category: "" });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo Ticket de Soporte">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre del cliente *">
          <input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)}
            placeholder="Ej. María Rodríguez" required />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Canal">
            <select className={inputCls} value={form.channel} onChange={e => set("channel", e.target.value)}>
              {Object.entries(CHANNELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Handle">
            <input className={inputCls} value={form.handle} onChange={e => set("handle", e.target.value)}
              placeholder="@username" />
          </Field>
        </div>

        <Field label="Asunto *">
          <input className={inputCls} value={form.subject} onChange={e => set("subject", e.target.value)}
            placeholder="Descripción breve del problema" required />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Prioridad">
            <select className={inputCls} value={form.priority} onChange={e => set("priority", e.target.value)}>
              {Object.entries(PRIORITIES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Categoría">
            <select className={inputCls} value={form.category} onChange={e => set("category", e.target.value)}>
              <option value="">Seleccionar…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50 transition-colors">
            Cancelar
          </button>
          <button type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity">
            Abrir Ticket
          </button>
        </div>
      </form>
    </Modal>
  );
}
