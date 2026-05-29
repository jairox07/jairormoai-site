"use client";

import { useState } from "react";
import Modal, { Field, inputCls } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { UserPlus } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ROLES = ["Admin", "Agente", "Supervisor", "Solo lectura"];

export default function InviteTeamModal({ open, onClose }: Props) {
  const { toast } = useApp();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Agente");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    toast(`Invitación enviada a ${email}`, "success");
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setEmail("");
      onClose();
    }, 1500);
  }

  return (
    <Modal open={open} onClose={onClose} title="Invitar al equipo" width={420}>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-primary-soft p-4 mb-2">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10">
            <UserPlus size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-primary">Invita a tu equipo</p>
            <p className="text-[11px] text-ink-600 mt-0.5">Recibirán un email con acceso al panel.</p>
          </div>
        </div>

        <Field label="Email">
          <input className={inputCls} type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="agente@tuempresa.com" required />
        </Field>

        <Field label="Rol">
          <select className={inputCls} value={role} onChange={e => setRole(e.target.value)}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={sent}
            className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-70">
            {sent ? "Enviando…" : "Enviar invitación"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
