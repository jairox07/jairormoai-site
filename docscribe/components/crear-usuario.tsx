"use client";

import { useState } from "react";
import { Check, Copy, RefreshCw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type NuevoUsuario = {
  id: string;
  email: string;
  tier: "free" | "pro";
  licencia_estado: "activa" | "cancelada" | "pendiente_pago";
  licencia_vence: string | null;
  puede_grabar: boolean;
  puede_correo: boolean;
};

const CARACTERES = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generarClave() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => CARACTERES[b % CARACTERES.length]).join("");
}

const selectCls =
  "h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus-visible:border-brand-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100";

// Alta de doctores invitados. La contraseña temporal se muestra una sola vez para copiarla.
export function CrearUsuario({ onCreado }: { onCreado: (u: NuevoUsuario) => void }) {
  const [abierto, setAbierto] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generarClave);
  const [tier, setTier] = useState<"free" | "pro">("free");
  const [licencia, setLicencia] = useState<NuevoUsuario["licencia_estado"]>("activa");
  const [vence, setVence] = useState("");
  const [puedeGrabar, setPuedeGrabar] = useState(true);
  const [puedeCorreo, setPuedeCorreo] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creada, setCreada] = useState<{ email: string; password: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const claveValida = password.length >= 8;

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          tier,
          licencia_estado: licencia,
          licencia_vence: vence || null,
          puede_grabar: puedeGrabar,
          puede_correo: puedeCorreo,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "No se pudo crear la cuenta.");
      onCreado(d as NuevoUsuario);
      setCreada({ email: d.email, password });
      setEmail("");
      setPassword(generarClave());
      setVence("");
      setAbierto(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
    } finally {
      setEnviando(false);
    }
  }

  async function copiarClave() {
    if (!creada) return;
    try {
      await navigator.clipboard.writeText(`Correo: ${creada.email}\nContraseña temporal: ${creada.password}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setError("No se pudo copiar. Anota la contraseña antes de cerrar.");
    }
  }

  return (
    <div className="mb-4 space-y-3">
      {creada && (
        <div role="status" className="space-y-2 rounded-3xl bg-brand-50 p-4 text-sm text-brand-900 ring-1 ring-brand-200">
          <p className="font-medium">Cuenta creada para {creada.email}.</p>
          <p className="text-xs">Comparte esta contraseña temporal. No se vuelve a mostrar.</p>
          <p className="rounded-xl bg-white px-3 py-2 font-mono text-sm text-slate-900">{creada.password}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={copiarClave}>
              {copiado ? <Check /> : <Copy />} {copiado ? "Copiado" : "Copiar"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCreada(null)}>
              Listo
            </Button>
          </div>
        </div>
      )}

      {!abierto ? (
        <Button variant="secondary" className="w-full" onClick={() => setAbierto(true)}>
          <UserPlus /> Crear usuario
        </Button>
      ) : (
        <form onSubmit={crear} className="space-y-3 rounded-3xl bg-white p-4 shadow-soft">
          <p className="text-sm font-medium text-slate-900">Nuevo doctor invitado</p>
          <Input type="email" placeholder="correo@clinica.com" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
          <div className="flex gap-2">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 font-mono" aria-label="Contraseña temporal" />
            <Button type="button" variant="outline" size="icon" aria-label="Generar contraseña" onClick={() => setPassword(generarClave())}>
              <RefreshCw />
            </Button>
          </div>
          <p className="text-[11px] text-slate-500">Mínimo 8 caracteres. Compártela con el doctor por un canal seguro.</p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500" htmlFor="nuevo-tier">Plan</label>
              <select id="nuevo-tier" className={cn(selectCls, "mt-1 h-10")} value={tier} onChange={(e) => setTier(e.target.value as "free" | "pro")}>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500" htmlFor="nuevo-licencia">Licencia</label>
              <select id="nuevo-licencia" className={cn(selectCls, "mt-1 h-10")} value={licencia} onChange={(e) => setLicencia(e.target.value as NuevoUsuario["licencia_estado"])}>
                <option value="activa">Activa</option>
                <option value="pendiente_pago">Pendiente de pago</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-500" htmlFor="nuevo-vence">Vence (opcional)</label>
            <Input id="nuevo-vence" type="date" value={vence} onChange={(e) => setVence(e.target.value)} className="mt-1 h-10" />
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={puedeGrabar} onChange={(e) => setPuedeGrabar(e.target.checked)} className="h-4 w-4 accent-brand-500" />
              Puede grabar
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={puedeCorreo} onChange={(e) => setPuedeCorreo(e.target.checked)} className="h-4 w-4 accent-brand-500" />
              Puede enviar correo
            </label>
          </div>

          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={enviando || !emailValido || !claveValida} className="flex-1">
              {enviando ? "Creando…" : "Crear cuenta"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
