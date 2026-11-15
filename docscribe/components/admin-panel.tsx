"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Fecha } from "@/components/fecha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, periodoActual } from "@/lib/utils";
import type { Config } from "@/lib/config";

export type UsuarioAdmin = {
  id: string;
  email: string;
  tier: "free" | "pro";
  consultas_usadas: number;
  periodo: string;
  is_admin: boolean;
  activo: boolean;
  created_at: string;
  total_consultas: number;
};

type Disponibles = { stt: Record<string, boolean>; llm: Record<string, boolean> };

const OPCIONES_STT = [
  { v: "auto", t: "Automático (según claves del servidor)" },
  { v: "openai", t: "OpenAI Whisper" },
  { v: "local", t: "Whisper local" },
  { v: "mock", t: "Demo (simulado)" },
];
const OPCIONES_LLM = [
  { v: "auto", t: "Automático (según claves del servidor)" },
  { v: "gemini", t: "Gemini" },
  { v: "openai", t: "OpenAI" },
  { v: "ollama", t: "Ollama (local)" },
  { v: "mock", t: "Demo (simulado)" },
];

const MENSAJES: Record<string, string> = {
  NO_PUEDES_QUITARTE_ACCESO: "No puedes quitarte tu propio acceso de admin ni suspenderte.",
  NO_AUTORIZADO: "No tienes permiso para esta acción.",
  VALOR_INVALIDO: "Valor no válido.",
};

function Interruptor({ activo, onChange, etiqueta }: { activo: boolean; onChange: (v: boolean) => void; etiqueta: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={() => onChange(!activo)}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", activo ? "bg-brand-500" : "bg-slate-300")}
    >
      <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all", activo ? "left-6" : "left-1")} />
    </button>
  );
}

const selectCls =
  "h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus-visible:border-brand-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100";

export function AdminPanel({
  yoId,
  usuariosIniciales,
  configInicial,
  disponibles,
}: {
  yoId: string;
  usuariosIniciales: UsuarioAdmin[];
  configInicial: Config;
  disponibles: Disponibles;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [usuarios, setUsuarios] = useState(usuariosIniciales);
  const [config, setConfig] = useState(configInicial);
  const [filtro, setFiltro] = useState("");
  const [ocupadoId, setOcupadoId] = useState<string | null>(null);
  const [limiteTxt, setLimiteTxt] = useState(String(configInicial.limite_free));
  const [modeloTxt, setModeloTxt] = useState(configInicial.ollama_model);
  const [toast, setToast] = useState<{ texto: string; error?: boolean } | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  function avisar(texto: string, error = false) {
    setToast({ texto, error });
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setToast(null), 2500);
  }
  const traducir = (msg: string) => Object.entries(MENSAJES).find(([k]) => msg.includes(k))?.[1] ?? "No se pudo guardar.";

  async function guardarConfig<K extends keyof Config>(clave: K, valor: Config[K]) {
    const previo = config[clave];
    setConfig((c) => ({ ...c, [clave]: valor }));
    const { error } = await supabase.rpc("admin_guardar_config", { p_clave: clave, p_valor: valor });
    if (error) {
      setConfig((c) => ({ ...c, [clave]: previo }));
      avisar(traducir(error.message), true);
    } else {
      avisar("Guardado");
    }
  }

  async function actualizarUsuario(
    u: UsuarioAdmin,
    cambios: { tier?: "free" | "pro"; activo?: boolean; is_admin?: boolean; reiniciar?: boolean }
  ) {
    setOcupadoId(u.id);
    const { error } = await supabase.rpc("admin_actualizar_usuario", {
      p_id: u.id,
      p_tier: cambios.tier ?? null,
      p_activo: cambios.activo ?? null,
      p_is_admin: cambios.is_admin ?? null,
      p_reiniciar_contador: cambios.reiniciar ?? false,
    });
    setOcupadoId(null);
    if (error) return avisar(traducir(error.message), true);
    setUsuarios((lista) =>
      lista.map((x) =>
        x.id !== u.id
          ? x
          : {
              ...x,
              tier: cambios.tier ?? x.tier,
              activo: cambios.activo ?? x.activo,
              is_admin: cambios.is_admin ?? x.is_admin,
              consultas_usadas: cambios.reiniciar ? 0 : x.consultas_usadas,
              periodo: cambios.reiniciar ? periodoActual() : x.periodo,
            }
      )
    );
    avisar("Guardado");
  }

  const limiteNum = Number(limiteTxt);
  const limiteValido = limiteTxt.trim() !== "" && Number.isInteger(limiteNum) && limiteNum >= 0 && limiteNum <= 100000;
  const modeloValido = /^[A-Za-z0-9._:/-]{1,80}$/.test(modeloTxt);

  const visibles = usuarios.filter((u) => u.email.toLowerCase().includes(filtro.trim().toLowerCase()));
  const totalPro = usuarios.filter((u) => u.tier === "pro").length;
  const totalConsultas = usuarios.reduce((n, u) => n + Number(u.total_consultas), 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-3xl bg-white py-4 text-center shadow-soft">
        {[
          ["Usuarios", usuarios.length],
          ["Plan Pro", totalPro],
          ["Consultas", totalConsultas],
        ].map(([t, n]) => (
          <div key={t}>
            <p className="text-xl font-semibold text-slate-900">{n}</p>
            <p className="text-xs text-slate-500">{t}</p>
          </div>
        ))}
      </div>

      {/* Funcionalidades */}
      <section>
        <h2 className="mb-3 font-medium text-slate-900">Funcionalidades</h2>
        <div className="divide-y divide-slate-100 rounded-3xl bg-white shadow-soft">
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Nuevas consultas</p>
              <p className="text-xs text-slate-500">Apágalo para poner la app en mantenimiento.</p>
            </div>
            <Interruptor activo={config.nueva_consulta} onChange={(v) => guardarConfig("nueva_consulta", v)} etiqueta="Nuevas consultas" />
          </div>
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Enviar PDF por correo</p>
              <p className="text-xs text-slate-500">Botón “Correo” en las notas.</p>
            </div>
            <Interruptor activo={config.correo_pdf} onChange={(v) => guardarConfig("correo_pdf", v)} etiqueta="Enviar PDF por correo" />
          </div>
          <div className="p-4">
            <label className="text-sm font-medium text-slate-900" htmlFor="limite">
              Consultas al mes del plan Free
            </label>
            <div className="mt-2 flex gap-2">
              <Input id="limite" inputMode="numeric" value={limiteTxt} onChange={(e) => setLimiteTxt(e.target.value)} className="h-11" />
              <Button
                disabled={!limiteValido || limiteNum === config.limite_free}
                onClick={() => guardarConfig("limite_free", limiteNum)}
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Proveedores */}
      <section>
        <h2 className="mb-3 font-medium text-slate-900">Proveedores de IA</h2>
        <div className="space-y-4 rounded-3xl bg-white p-4 shadow-soft">
          <div>
            <label className="text-sm font-medium text-slate-900" htmlFor="stt">
              Transcripción (audio a texto)
            </label>
            <select
              id="stt"
              className={cn(selectCls, "mt-2")}
              value={config.stt_provider}
              onChange={(e) => guardarConfig("stt_provider", e.target.value)}
            >
              {OPCIONES_STT.map((o) => (
                <option key={o.v} value={o.v} disabled={!disponibles.stt[o.v]}>
                  {o.t}
                  {disponibles.stt[o.v] ? "" : " — sin configurar"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-900" htmlFor="llm">
              Redacción de la nota SOAP
            </label>
            <select
              id="llm"
              className={cn(selectCls, "mt-2")}
              value={config.llm_provider}
              onChange={(e) => guardarConfig("llm_provider", e.target.value)}
            >
              {OPCIONES_LLM.map((o) => (
                <option key={o.v} value={o.v} disabled={!disponibles.llm[o.v]}>
                  {o.t}
                  {disponibles.llm[o.v] ? "" : " — sin configurar"}
                </option>
              ))}
            </select>
          </div>
          {disponibles.llm.ollama && (
            <div>
              <label className="text-sm font-medium text-slate-900" htmlFor="modelo">
                Modelo de Ollama
              </label>
              <div className="mt-2 flex gap-2">
                <Input id="modelo" value={modeloTxt} onChange={(e) => setModeloTxt(e.target.value)} className="h-11" />
                <Button disabled={!modeloValido || modeloTxt === config.ollama_model} onClick={() => guardarConfig("ollama_model", modeloTxt)}>
                  Guardar
                </Button>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-500">
            Solo se pueden elegir los proveedores con credenciales en el servidor. Las API keys no se guardan aquí: se configuran como
            variables de entorno.
          </p>
        </div>
      </section>

      {/* Usuarios */}
      <section>
        <h2 className="mb-3 font-medium text-slate-900">Usuarios</h2>
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Buscar por correo" value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-10" />
        </div>
        <ul className="space-y-3">
          {visibles.map((u) => {
            const yo = u.id === yoId;
            const usadasMes = u.periodo === periodoActual() ? u.consultas_usadas : 0;
            const ocupado = ocupadoId === u.id;
            return (
              <li key={u.id} className={cn("rounded-3xl bg-white p-4 shadow-soft", !u.activo && "opacity-70")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {u.email}
                      {yo && <span className="ml-1 text-slate-400">(tú)</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {u.total_consultas} consultas · {usadasMes} este mes · alta <Fecha iso={u.created_at} formato="corta" />
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {u.is_admin && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700">Admin</span>}
                      {!u.activo && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700">Suspendido</span>}
                    </div>
                  </div>
                  <select
                    aria-label={`Plan de ${u.email}`}
                    className={cn(selectCls, "h-10 w-24 shrink-0")}
                    value={u.tier}
                    disabled={ocupado}
                    onChange={(e) => actualizarUsuario(u, { tier: e.target.value as "free" | "pro" })}
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" disabled={ocupado} onClick={() => actualizarUsuario(u, { reiniciar: true })}>
                    Reiniciar contador
                  </Button>
                  <Button size="sm" variant="outline" disabled={ocupado || yo} onClick={() => actualizarUsuario(u, { activo: !u.activo })}>
                    {u.activo ? "Suspender" : "Reactivar"}
                  </Button>
                  <Button size="sm" variant="outline" disabled={ocupado || yo} onClick={() => actualizarUsuario(u, { is_admin: !u.is_admin })}>
                    {u.is_admin ? "Quitar admin" : "Hacer admin"}
                  </Button>
                </div>
              </li>
            );
          })}
          {visibles.length === 0 && <li className="rounded-3xl bg-white p-6 text-center text-sm text-slate-500 shadow-soft">Sin resultados.</li>}
        </ul>
        <p className="mt-3 text-xs text-slate-400">El panel no muestra el contenido de las consultas, solo conteos.</p>
      </section>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "fixed inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-50 mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2",
            toast.error ? "bg-rose-500" : "bg-brand-600"
          )}
        >
          <Check className="h-4 w-4" /> {toast.texto}
        </div>
      )}
    </div>
  );
}
