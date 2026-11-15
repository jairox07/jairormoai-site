"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Fecha } from "@/components/fecha";
import { Button } from "@/components/ui/button";
import { formatTiempo } from "@/lib/utils";

type Grabacion = {
  id: string;
  expediente: string | null;
  fecha: string;
  audio_segundos: number | null;
  email: string;
  audio_path: string;
};

const BUCKET = "consultas-audio";

// Solo muestra código de expediente, correo del doctor, fecha y duración. Nada del paciente ni de la nota.
export function AdminGrabaciones({ retencionDias }: { retencionDias: number }) {
  const supabase = useMemo(() => createClient(), []);
  const [lista, setLista] = useState<Grabacion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null); // id de la grabación o "purga"

  useEffect(() => {
    supabase.rpc("admin_listar_grabaciones").then(({ data, error }) => {
      if (error) setError("No se pudieron cargar las grabaciones.");
      else setLista((data as Grabacion[]) ?? []);
    });
  }, [supabase]);

  const vencidas = (lista ?? []).filter((g) => Date.now() - new Date(g.fecha).getTime() > retencionDias * 86_400_000);

  // Primero se borra el archivo (la API de Storage; borrarlo con SQL lo deja huérfano) y luego se quita la ruta de la consulta.
  async function quitar(grabaciones: Grabacion[]) {
    const { error: errArchivo } = await supabase.storage.from(BUCKET).remove(grabaciones.map((g) => g.audio_path));
    if (errArchivo) throw new Error("No se pudieron borrar los archivos.");
    for (const g of grabaciones) {
      const { error: errBase } = await supabase.rpc("admin_borrar_audio", { p_id: g.id });
      if (errBase) throw new Error("Se borró el archivo pero no se pudo actualizar la consulta.");
    }
    const ids = new Set(grabaciones.map((g) => g.id));
    setLista((prev) => (prev ? prev.filter((x) => !ids.has(x.id)) : prev));
  }

  async function borrarUna(g: Grabacion) {
    if (!window.confirm("¿Borrar esta grabación? Se elimina el archivo de audio y no se puede recuperar. La nota no se borra.")) return;
    setOcupado(g.id);
    setError(null);
    setMensaje(null);
    try {
      await quitar([g]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo borrar la grabación.");
    }
    setOcupado(null);
  }

  async function purgar() {
    if (vencidas.length === 0) return;
    if (!window.confirm(`¿Borrar ${vencidas.length} grabación(es) vencida(s)? Se eliminan los archivos y no se pueden recuperar. Las notas no se borran.`)) return;
    setOcupado("purga");
    setError(null);
    setMensaje(null);
    try {
      await quitar(vencidas);
      setMensaje(`Se borraron ${vencidas.length} grabación(es) vencida(s).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar la purga.");
    }
    setOcupado(null);
  }

  if (lista === null && !error) return <p className="text-sm text-slate-500">Cargando grabaciones…</p>;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-soft">
        <p className="text-sm text-slate-600">
          Retención: <strong>{retencionDias === 0 ? "no se guarda" : `${retencionDias} días`}</strong> · Vencidas: <strong>{vencidas.length}</strong>
        </p>
        <Button size="sm" disabled={vencidas.length === 0 || ocupado !== null} onClick={purgar}>
          <Trash2 /> Purgar vencidas
        </Button>
      </div>

      {error && <p role="alert" className="mb-3 text-sm text-rose-600">{error}</p>}
      {mensaje && <p role="status" className="mb-3 text-sm text-brand-700">{mensaje}</p>}
      {lista && lista.length === 0 && (
        <p className="rounded-3xl bg-white p-6 text-center text-sm text-slate-500 shadow-soft">No hay grabaciones guardadas.</p>
      )}
      <ul className="space-y-3">
        {lista?.map((g) => {
          const vencida = vencidas.some((v) => v.id === g.id);
          return (
            <li key={g.id} className="flex items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-soft">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {g.expediente ?? "Sin código"}
                  {vencida && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">Vencida</span>}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {g.email} · <Fecha iso={g.fecha} formato="lista" />
                  {g.audio_segundos ? ` · ${formatTiempo(Math.round(g.audio_segundos))}` : ""}
                </p>
              </div>
              <Button size="sm" variant="outline" disabled={ocupado !== null} onClick={() => borrarUna(g)} aria-label="Borrar grabación">
                <Trash2 /> Borrar
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
