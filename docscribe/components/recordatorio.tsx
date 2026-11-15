"use client";

import { useEffect } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

// Recordatorio estilo "¿Sigues ahí?" cuando la consulta lleva 15 s sin empezar a grabar.
export function RecordatorioNota({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="recordatorio-titulo"
        aria-describedby="recordatorio-desc"
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-md shadow-brand-500/30">
          <Mic className="h-7 w-7" />
        </span>
        <h2 id="recordatorio-titulo" className="mt-4 text-lg font-semibold text-slate-900">
          ¿Sigues ahí?
        </h2>
        <p id="recordatorio-desc" className="mt-2 text-sm text-slate-600">
          Tu consulta todavía no está grabando. Escribe el nombre del paciente y toca el micrófono para no perder la consulta.
        </p>
        <Button className="mt-5 w-full" onClick={onCerrar}>
          Sí, estoy aquí
        </Button>
      </div>
    </div>
  );
}
