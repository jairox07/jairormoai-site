"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, FileText, Loader2, LogOut, Mic, Radio, ShieldCheck, Stethoscope, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/bottom-nav";
import { Fecha } from "@/components/fecha";
import { Button } from "@/components/ui/button";
import { cn, periodoActual } from "@/lib/utils";

type Perfil = { tier: "free" | "pro"; consultas_usadas: number; periodo: string };
type ConsultaResumen = { id: string; fecha: string; nota_soap_final: { analisis?: string[] } | null };

export function DashboardLive({
  userId,
  email,
  perfilInicial,
  consultasIniciales,
  limite,
  esAdmin,
}: {
  userId: string;
  email: string;
  perfilInicial: Perfil | null;
  consultasIniciales: ConsultaResumen[];
  limite: number;
  esAdmin: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [perfil, setPerfil] = useState<Perfil | null>(perfilInicial);
  const [consultas, setConsultas] = useState<ConsultaResumen[]>(consultasIniciales);
  const [enVivo, setEnVivo] = useState(false);
  const [nuevaId, setNuevaId] = useState<string | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [borrandoId, setBorrandoId] = useState<string | null>(null);
  const quitarResaltado = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let canal: ReturnType<typeof supabase.channel> | null = null;
    let cancelado = false;

    async function refrescarPerfil() {
      const { data } = await supabase
        .from("users")
        .select("tier, consultas_usadas, periodo")
        .eq("id", userId)
        .single();
      if (data && !cancelado) setPerfil(data as Perfil);
    }

    async function iniciar() {
      // El canal necesita el JWT del usuario para que RLS filtre los eventos.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) supabase.realtime.setAuth(session.access_token);
      if (cancelado) return;

      canal = supabase
        .channel(`consultas-${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "consultas", filter: `user_id=eq.${userId}` },
          (payload) => {
            const fila = payload.new as ConsultaResumen;
            setConsultas((prev) =>
              prev.some((c) => c.id === fila.id)
                ? prev
                : [{ id: fila.id, fecha: fila.fecha, nota_soap_final: fila.nota_soap_final }, ...prev]
                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                    .slice(0, 10)
            );
            setNuevaId(fila.id);
            if (quitarResaltado.current) clearTimeout(quitarResaltado.current);
            quitarResaltado.current = setTimeout(() => setNuevaId(null), 6000);
            refrescarPerfil();
          }
        )
        .subscribe((estado) => setEnVivo(estado === "SUBSCRIBED"));
    }

    iniciar();

    return () => {
      cancelado = true;
      if (quitarResaltado.current) clearTimeout(quitarResaltado.current);
      if (canal) supabase.removeChannel(canal);
    };
  }, [supabase, userId]);

  // RLS (consultas_delete_own) garantiza que solo se borran las propias.
  // Borrar NO devuelve cuota: consultas_usadas cuenta las generadas en el mes.
  async function borrar(id: string) {
    setBorrandoId(id);
    const { error } = await supabase.from("consultas").delete().eq("id", id);
    if (!error) {
      const { data } = await supabase
        .from("consultas")
        .select("id, fecha, nota_soap_final")
        .order("fecha", { ascending: false })
        .limit(10);
      setConsultas((data as ConsultaResumen[] | null) ?? consultas.filter((c) => c.id !== id));
    }
    setBorrandoId(null);
    setConfirmandoId(null);
  }

  const esPro = perfil?.tier === "pro";
  const usadas = perfil && perfil.periodo === periodoActual() ? perfil.consultas_usadas : 0;
  const restantes = Math.max(limite - usadas, 0);
  const pct = Math.min((usadas / limite) * 100, 100);
  const bloqueado = !esPro && restantes === 0;

  const usuario = email.split("@")[0] || "doctor";
  const nombre = usuario.charAt(0).toUpperCase() + usuario.slice(1);

  return (
    <>
      <main className="mx-auto max-w-lg px-4 pb-44 pt-6 md:max-w-5xl md:px-8 md:pb-12 md:pt-10">
        <header className="mb-6 flex items-center gap-3 md:mb-10">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
            {nombre.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-slate-900 md:text-2xl">Hola, {nombre}</h1>
            <p className="text-sm text-slate-500 md:text-base">¿Listo para tu próxima consulta?</p>
          </div>
          {esAdmin && (
            <Link
              href="/admin"
              aria-label="Administración"
              title="Administración"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-soft transition-colors hover:bg-brand-50"
            >
              <ShieldCheck className="h-5 w-5" />
            </Link>
          )}
          <span
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-soft"
            title={enVivo ? "Sincronizado en tiempo real" : "Conectando…"}
            aria-label={enVivo ? "Sincronizado en tiempo real" : "Conectando"}
          >
            <Radio className={cn("h-5 w-5", enVivo ? "text-brand-500" : "text-slate-300")} />
            <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
              {enVivo && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
              <span className={cn("relative inline-flex h-2 w-2 rounded-full", enVivo ? "bg-emerald-500" : "bg-slate-300")} />
            </span>
          </span>
          {/* Escritorio: acciones en la cabecera (en móvil van en la barra inferior) */}
          <div className="hidden items-center gap-2 md:flex">
            {bloqueado ? (
              <Button size="lg" disabled>
                Límite alcanzado
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/consulta/nueva">
                  <Mic className="!size-5" /> Nueva consulta
                </Link>
              </Button>
            )}
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="ghost" size="lg">
                <LogOut /> Salir
              </Button>
            </form>
          </div>
        </header>

        <div className="md:grid md:grid-cols-[340px_1fr] md:items-start md:gap-8">
          <div className="md:sticky md:top-6">
        <p className="mb-3 text-center text-sm text-slate-500 md:text-left">Resumen del mes</p>

        <section className="rounded-3xl bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <Stethoscope className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">Consultas restantes</p>
              <p className="text-sm text-slate-500">{esPro ? "Plan Pro" : "Plan Free"}</p>
            </div>
            <p className="text-3xl font-semibold text-brand-600">
              {esPro ? (
                "∞"
              ) : (
                <>
                  {restantes}
                  <span className="text-base font-normal text-slate-400"> / {limite}</span>
                </>
              )}
            </p>
          </div>

          {!esPro && (
            <>
              <div
                className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-brand-50"
                role="progressbar"
                aria-valuenow={usadas}
                aria-valuemin={0}
                aria-valuemax={limite}
              >
                <div
                  className={cn("h-full rounded-full transition-all duration-500", pct >= 90 ? "bg-rose-400" : "bg-brand-500")}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4 text-brand-500" />
                {bloqueado ? "Límite alcanzado. Se reinicia el día 1." : "Se reinicia el día 1 de cada mes"}
              </div>
            </>
          )}
        </section>
          </div>

        <section className="mt-8 md:mt-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium text-slate-900">Consultas recientes</h2>
            {consultas.length > 0 && <span className="text-sm text-brand-600">{consultas.length} notas</span>}
          </div>

          {consultas.length > 0 ? (
            <ul className="space-y-3">
              {consultas.map((c) => (
                <li key={c.id} className="relative">
                  {confirmandoId === c.id ? (
                    <div className="flex items-center justify-between gap-3 rounded-3xl bg-rose-50 p-4 ring-1 ring-rose-100">
                      <p className="text-sm text-rose-800">¿Eliminar esta nota? No se puede deshacer.</p>
                      <div className="flex shrink-0 gap-2">
                        <Button size="sm" variant="outline" disabled={borrandoId === c.id} onClick={() => setConfirmandoId(null)}>
                          No
                        </Button>
                        <Button size="sm" variant="destructive" disabled={borrandoId === c.id} onClick={() => borrar(c.id)}>
                          {borrandoId === c.id ? <Loader2 className="animate-spin" /> : "Eliminar"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/consulta/${c.id}`}
                        className={cn(
                          "flex items-center gap-3 rounded-3xl bg-white p-3 pr-14 shadow-soft transition-all hover:shadow-md",
                          c.id === nuevaId && "ring-2 ring-brand-300 animate-in fade-in slide-in-from-top-2 duration-500"
                        )}
                      >
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
                          <FileText className="h-6 w-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            <Fecha iso={c.fecha} formato="lista" />
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{c.nota_soap_final?.analisis?.[0] ?? "Nota SOAP"}</p>
                        </div>
                        {c.id === nuevaId && (
                          <span className="absolute right-14 top-3 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-medium text-white">
                            Nueva
                          </span>
                        )}
                      </Link>
                      <button
                        type="button"
                        aria-label="Eliminar consulta"
                        onClick={() => setConfirmandoId(c.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2.5 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500 shadow-soft">
              Aún no tienes consultas. Toca el botón azul para grabar la primera.
            </p>
          )}
        </section>
        </div>
      </main>

      <BottomNav bloqueado={bloqueado} />
    </>
  );
}
