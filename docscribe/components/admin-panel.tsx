"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Fecha } from "@/components/fecha";
import { CrearUsuario, type NuevoUsuario } from "@/components/crear-usuario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, periodoActual } from "@/lib/utils";
import type { Config } from "@/lib/config";

export type Licencia = "activa" | "cancelada" | "pendiente_pago";
export type LicenciaVisible = Licencia | "por_vencer";

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
  licencia_estado: Licencia;
  licencia_vence: string | null;
  licencia_visible: LicenciaVisible;
  puede_grabar: boolean;
  puede_correo: boolean;
  tokens_entrada: number;
  tokens_salida: number;
  audio_minutos: number;
};

type Disponibles = { stt: Record<string, boolean>; llm: Record<string, boolean> };
type Pestana = "general" | "usuarios";

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

const ETIQUETA_LICENCIA: Record<LicenciaVisible, string> = {
  activa: "Activa",
  por_vencer: "Por vencer",
  cancelada: "Cancelada",
  pendiente_pago: "Pendiente de pago",
};
const COLOR_LICENCIA: Record<LicenciaVisible, string> = {
  activa: "bg-brand-100 text-brand-700",
  por_vencer: "bg-amber-100 text-amber-800",
  cancelada: "bg-rose-100 text-rose-700",
  pendiente_pago: "bg-slate-200 text-slate-700",
};

// Igual que la columna licencia_visible de SQL: activa y vence en ≤ 7 días = "por vencer".
function visibleLicencia(estado: Licencia, vence: string | null): LicenciaVisible {
  if (estado !== "activa" || !vence) return estado;
  const dias = (new Date(vence + "T00:00:00").getTime() - Date.now()) / 86_400_000;
  return dias <= 7 ? "por_vencer" : "activa";
}

const MENSAJES: Record<string, string> = {
  NO_PUEDES_QUITARTE_ACCESO: "No puedes quitarte tu propio acceso ni tu licencia.",
  NO_AUTORIZADO: "No tienes permiso para esta acción.",
  VALOR_INVALIDO: "Valor no válido.",
  LICENCIA_INVALIDA: "Estado de licencia no válido.",
};

const numero = (n: number) => Number(n || 0).toLocaleString("es-MX");

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
  const [pestana, setPestana] = useState<Pestana>("general");
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

  type Cambios = {
    tier?: "free" | "pro";
    activo?: boolean;
    is_admin?: boolean;
    reiniciar?: boolean;
    licencia_estado?: Licencia;
    licencia_vence?: string | null;
    puede_grabar?: boolean;
    puede_correo?: boolean;
  };

  async function actualizarUsuario(u: UsuarioAdmin, cambios: Cambios) {
    setOcupadoId(u.id);
    const { error } = await supabase.rpc("admin_actualizar_usuario", {
      p_id: u.id,
      p_tier: cambios.tier ?? null,
      p_activo: cambios.activo ?? null,
      p_is_admin: cambios.is_admin ?? null,
      p_reiniciar_contador: cambios.reiniciar ?? false,
      p_licencia_estado: cambios.licencia_estado ?? null,
      p_licencia_vence: cambios.licencia_vence ?? null,
      p_puede_grabar: cambios.puede_grabar ?? null,
      p_puede_correo: cambios.puede_correo ?? null,
    });
    setOcupadoId(null);
    if (error) return avisar(traducir(error.message), true);

    setUsuarios((lista) =>
      lista.map((x) => {
        if (x.id !== u.id) return x;
        const estado = cambios.licencia_estado ?? x.licencia_estado;
        const vence = cambios.licencia_vence !== undefined ? cambios.licencia_vence : x.licencia_vence;
        return {
          ...x,
          tier: cambios.tier ?? x.tier,
          activo: cambios.activo ?? x.activo,
          is_admin: cambios.is_admin ?? x.is_admin,
          licencia_estado: estado,
          licencia_vence: vence,
          licencia_visible: visibleLicencia(estado, vence),
          puede_grabar: cambios.puede_grabar ?? x.puede_grabar,
          puede_correo: cambios.puede_correo ?? x.puede_correo,
          consultas_usadas: cambios.reiniciar ? 0 : x.consultas_usadas,
          periodo: cambios.reiniciar ? periodoActual() : x.periodo,
        };
      })
    );
    avisar("Guardado");
  }

  // Usuario recién creado: se agrega a la lista sin recargar la página.
  function alCrear(n: NuevoUsuario) {
    const vis = visibleLicencia(n.licencia_estado, n.licencia_vence);
    setUsuarios((lista) => [
      {
        id: n.id,
        email: n.email,
        tier: n.tier,
        consultas_usadas: 0,
        periodo: periodoActual(),
        is_admin: false,
        activo: true,
        created_at: new Date().toISOString(),
        total_consultas: 0,
        licencia_estado: n.licencia_estado,
        licencia_vence: n.licencia_vence,
        licencia_visible: vis,
        puede_grabar: n.puede_grabar,
        puede_correo: n.puede_correo,
        tokens_entrada: 0,
        tokens_salida: 0,
        audio_minutos: 0,
      },
      ...lista,
    ]);
    avisar(`Cuenta creada: ${n.email}`);
  }

  const limiteNum = Number(limiteTxt);
  const limiteValido = limiteTxt.trim() !== "" && Number.isInteger(limiteNum) && limiteNum >= 0 && limiteNum <= 100000;
  const modeloValido = /^[A-Za-z0-9._:/-]{1,80}$/.test(modeloTxt);

  const visibles = usuarios.filter((u) => u.email.toLowerCase().includes(filtro.trim().toLowerCase()));
  const totalPro = usuarios.filter((u) => u.tier === "pro").length;
  const totalConsultas = usuarios.reduce((n, u) => n + Number(u.total_consultas), 0);
  const totalTokensEntrada = usuarios.reduce((n, u) => n + Number(u.tokens_entrada), 0);
  const totalTokensSalida = usuarios.reduce((n, u) => n + Number(u.tokens_salida), 0);
  const totalAudio = usuarios.reduce((n, u) => n + Number(u.audio_minutos), 0);

  return (
    <div className="space-y-6">
      {/* Pestañas */}
      <div role="tablist" aria-label="Secciones del admin" className="grid grid-cols-2 gap-2 rounded-3xl bg-white p-1.5 shadow-soft">
        {(
          [
            ["general", "General"],
            ["usuarios", "Usuarios"],
          ] as const
        ).map(([id, t]) => (
          <button
            key={id}
            role="tab"
            aria-selected={pestana === id}
            onClick={() => setPestana(id)}
            className={cn(
              "h-11 rounded-2xl text-sm font-medium transition-colors",
              pestana === id ? "bg-brand-500 text-white shadow-md shadow-brand-500/30" : "text-slate-600 hover:bg-brand-50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {pestana === "general" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-slate-100 text-center shadow-soft sm:grid-cols-4">
            {[
              ["Usuarios", numero(usuarios.length)],
              ["Plan Pro", numero(totalPro)],
              ["Consultas", numero(totalConsultas)],
              ["Tokens (entrada / salida)", `${numero(totalTokensEntrada)} / ${numero(totalTokensSalida)}`],
            ].map(([t, n]) => (
              <div key={t} className="bg-white py-4">
                <p className="text-lg font-semibold text-slate-900">{n}</p>
                <p className="text-xs text-slate-500">{t}</p>
              </div>
            ))}
          </div>
          <p className="-mt-4 text-center text-xs text-slate-400">Audio transcrito: {totalAudio.toLocaleString("es-MX", { maximumFractionDigits: 1 })} min</p>

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
                  <Button disabled={!limiteValido || limiteNum === config.limite_free} onClick={() => guardarConfig("limite_free", limiteNum)}>
                    Guardar
                  </Button>
                </div>
                <p className="mt-2 text-xs text-slate-500">Se cuenta por mes y se reinicia solo el día 1. Borrar notas no devuelve consultas.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-medium text-slate-900">Proveedores de IA</h2>
            <div className="space-y-4 rounded-3xl bg-white p-4 shadow-soft">
              <div>
                <label className="text-sm font-medium text-slate-900" htmlFor="stt">
                  Transcripción (audio a texto)
                </label>
                <select id="stt" className={cn(selectCls, "mt-2")} value={config.stt_provider} onChange={(e) => guardarConfig("stt_provider", e.target.value)}>
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
                <select id="llm" className={cn(selectCls, "mt-2")} value={config.llm_provider} onChange={(e) => guardarConfig("llm_provider", e.target.value)}>
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
                Solo se pueden elegir proveedores con credenciales en el servidor. Las API keys no se guardan aquí: son variables de entorno.
              </p>
            </div>
          </section>
        </div>
      )}

      {pestana === "usuarios" && (
        <section>
          <CrearUsuario onCreado={alCrear} />
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar por correo" value={filtro} onChange={(e) => setFiltro(e.target.value)} className="pl-10" />
          </div>

          <ul className="space-y-3">
            {visibles.map((u) => {
              const yo = u.id === yoId;
              const usadasMes = u.periodo === periodoActual() ? u.consultas_usadas : 0;
              const ocupado = ocupadoId === u.id;
              const licencia = u.licencia_visible;
              return (
                <li key={u.id} className={cn("space-y-4 rounded-3xl bg-white p-4 shadow-soft", !u.activo && "opacity-80")}>
                  {/* Cabecera */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {u.email}
                        {yo && <span className="ml-1 text-slate-400">(tú)</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Alta <Fecha iso={u.created_at} formato="corta" />
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", COLOR_LICENCIA[licencia])}>
                          Licencia: {ETIQUETA_LICENCIA[licencia]}
                        </span>
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

                  {/* Consumo */}
                  <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    {[
                      ["Este mes", u.tier === "pro" ? `${usadasMes} · Pro` : `${usadasMes}`],
                      ["Consultas totales", numero(u.total_consultas)],
                      ["Tokens entrada / salida", `${numero(u.tokens_entrada)} / ${numero(u.tokens_salida)}`],
                      ["Audio", `${Number(u.audio_minutos).toLocaleString("es-MX", { maximumFractionDigits: 1 })} min`],
                    ].map(([t, v]) => (
                      <div key={t} className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-500">{t}</p>
                        <p className="mt-0.5 font-medium text-slate-900">{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Capacidades */}
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between gap-3 p-3">
                      <span className="text-sm text-slate-700">Puede grabar consultas</span>
                      <Interruptor
                        activo={u.puede_grabar}
                        etiqueta={`Puede grabar: ${u.email}`}
                        onChange={(v) => actualizarUsuario(u, { puede_grabar: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 p-3">
                      <span className="text-sm text-slate-700">Puede enviar PDF por correo</span>
                      <Interruptor
                        activo={u.puede_correo}
                        etiqueta={`Puede enviar correo: ${u.email}`}
                        onChange={(v) => actualizarUsuario(u, { puede_correo: v })}
                      />
                    </div>
                  </div>

                  {/* Licencia */}
                  <LicenciaEditor
                    key={`${u.id}-${u.licencia_estado}-${u.licencia_vence ?? ""}`}
                    estado={u.licencia_estado}
                    vence={u.licencia_vence}
                    ocupado={ocupado}
                    yo={yo}
                    onGuardar={(estado, vence) => actualizarUsuario(u, { licencia_estado: estado, licencia_vence: vence })}
                  />

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2">
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
            {visibles.length === 0 && (
              <li className="rounded-3xl bg-white p-6 text-center text-sm text-slate-500 shadow-soft">Sin resultados.</li>
            )}
          </ul>
          <p className="mt-3 text-xs text-slate-400">El panel no muestra el contenido de las consultas, solo conteos.</p>
        </section>
      )}

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

function LicenciaEditor({
  estado,
  vence,
  ocupado,
  yo,
  onGuardar,
}: {
  estado: Licencia;
  vence: string | null;
  ocupado: boolean;
  yo: boolean;
  onGuardar: (estado: Licencia, vence: string | null) => void;
}) {
  const [estadoTxt, setEstadoTxt] = useState<Licencia>(estado);
  const [venceTxt, setVenceTxt] = useState(vence ?? "");
  const cambio = estadoTxt !== estado || (venceTxt || null) !== (vence ?? null);

  return (
    <div className="grid gap-2 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div>
        <label className="text-[11px] text-slate-500" htmlFor={`lic-${estado}-${vence}`}>
          Estado de la licencia
        </label>
        <select
          id={`lic-${estado}-${vence}`}
          className={cn(selectCls, "mt-1 h-10")}
          value={estadoTxt}
          disabled={ocupado}
          onChange={(e) => setEstadoTxt(e.target.value as Licencia)}
        >
          <option value="activa">Activa</option>
          <option value="pendiente_pago">Pendiente de pago</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>
      <div>
        <label className="text-[11px] text-slate-500" htmlFor={`vence-${estado}-${vence}`}>
          Vence
        </label>
        <Input
          id={`vence-${estado}-${vence}`}
          type="date"
          value={venceTxt}
          disabled={ocupado}
          onChange={(e) => setVenceTxt(e.target.value)}
          className="mt-1 h-10"
        />
      </div>
      <Button size="sm" disabled={!cambio || ocupado || (yo && estadoTxt !== "activa")} onClick={() => onGuardar(estadoTxt, venceTxt || null)}>
        Guardar licencia
      </Button>
    </div>
  );
}
