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

// Solo muestra código de expediente, correo del doctor, fecha y duración. Nada del paciente ni de la nota.
export function AdminGrabaciones() {
  const supabase = useMemo(() => createClient(), []);
  const [lista, setLista] = useState<Grabacion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [borrando, setBorrando] = useState<string | null>(null);

  useEffect(() => {
    supabase.rpc("admin_listar_grabaciones").then(({ data, error }) => {
      if (error) setError("No se pudieron cargar las grabaciones.");
      else setLista((data as Grabacion[]) ?? []);
    });
  }, [supabase]);

  async function borrarAudio(g: Grabacion) {
    if (!window.confirm("¿Borrar esta grabación? Se elimina el archivo de audio y no se puede recuperar. La nota no se borra.")) return;
    setBorrando(g.id);
    setError(null);
    // 1) La base quita la ruta y nos da el archivo; 2) se borra el archivo del almacenamiento.
    const { data: ruta, error: errBase } = await supabase.rpc("admin_borrar_audio", { p_id: g.id });
    if (errBase) {
      setError("No se pudo borrar la grabación.");
      setBorrando(null);
      return;
    }
    const { error: errArchivo } = await supabase.storage.from("consultas-audio").remove([(ruta as string) ?? g.audio_path]);
    if (errArchivo) setError("La ruta se quitó, pero el archivo no se pudo borrar. Intenta de nuevo.");
    setLista((prev) => (prev ? prev.filter((x) => x.id !== g.id) : prev));
    setBorrando(null);
  }

  if (lista === null && !error) return <p className="text-sm text-slate-500">Cargando grabaciones…</p>;

  return (
    <section>
      {error && <p role="alert" className="mb-3 text-sm text-rose-600">{error}</p>}
      {lista && lista.length === 0 && (
        <p className="rounded-3xl bg-white p-6 text-center text-sm text-slate-500 shadow-soft">No hay grabaciones guardadas.</p>
      )}
      <ul className="space-y-3">
        {lista?.map((g) => (
          <li key={g.id} className="flex items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-soft">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{g.expediente ?? "Sin código"}</p>
              <p className="truncate text-xs text-slate-500">
                {g.email} · <Fecha iso={g.fecha} formato="lista" />
                {g.audio_segundos ? ` · ${formatTiempo(Math.round(g.audio_segundos))}` : ""}
              </p>
            </div>
            <Button size="sm" variant="outline" disabled={borrando === g.id} onClick={() => borrarAudio(g)} aria-label="Borrar grabación">
              <Trash2 /> Borrar
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
