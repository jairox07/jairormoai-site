"use client";

import { useState } from "react";
import Modal, { Field, inputCls } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { CHANNELS } from "@/lib/data";

interface Props {
  open: boolean;
  onClose: () => void;
}

const INTENTS = [
  "Consulta general", "Ortodoncia brackets transparentes", "Implantes dentales",
  "Blanqueamiento dental", "Limpieza dental", "Ortodoncia metálica",
  "Consulta de emergencia", "Seguimiento tratamiento",
];

export default function NewLeadModal({ open, onClose }: Props) {
  const { addLead, toast } = useApp();
  const [form, setForm] = useState({
    name: "", channel: "whatsapp", handle: "", intent: "", value: "", tags: "",
  });

  function set(k: keyof typeof form, v: string) {
    setForm(p => ({ ...p, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addLead({
      kind: "lead",
      name: form.name.trim(),
      channel: form.channel as keyof typeof CHANNELS,
      handle: form.handle || `@${form.name.toLowerCase().replace(/\s+/g, "")}`,
      intent: form.intent || "Consulta general",
      value: Number(form.value) || 0,
      score: 50,
      avatarHue: Math.floor(Math.random() * 360),
      column: "new",
      assignee: "sofia-ai",
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      lastSeen: "ahora",
      messages: [{
        id: "m0",
        from: "system",
        t: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        text: "Lead creado manualmente",
        type: "system",
      }],
      movedByAI: false,
    });
    toast(`Lead "${form.name}" creado`, "success");
    setForm({ name: "", channel: "whatsapp", handle: "", intent: "", value: "", tags: "" });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo Lead">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre completo *">
          <input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)}
            placeholder="Ej. Ana García López" required />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Canal">
            <select className={inputCls} value={form.channel} onChange={e => set("channel", e.target.value)}>
              {Object.entries(CHANNELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Handle / username">
            <input className={inputCls} value={form.handle} onChange={e => set("handle", e.target.value)}
              placeholder="@username o +52…" />
          </Field>
        </div>

        <Field label="Intención / producto de interés">
          <select className={inputCls} value={form.intent} onChange={e => set("intent", e.target.value)}>
            <option value="">Seleccionar…</option>
            {INTENTS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </Field>

        <Field label="Valor estimado (MXN)">
          <input className={inputCls} type="number" min={0} step={100} value={form.value}
            onChange={e => set("value", e.target.value)} placeholder="0" />
        </Field>

        <Field label="Etiquetas (separadas por coma)">
          <input className={inputCls} value={form.tags} onChange={e => set("tags", e.target.value)}
            placeholder="vip, urgente, referido" />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50 transition-colors">
            Cancelar
          </button>
          <button type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity">
            Crear Lead
          </button>
        </div>
      </form>
    </Modal>
  );
}
