"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Loader2, Mail, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fecha } from "@/components/fecha";
import { copiarTexto } from "@/lib/clipboard";
import { construirPdf } from "@/lib/pdf";
import { MEMBRETE, SECCIONES_SOAP, notaATexto, type NotaSoap, type Paciente } from "@/lib/types";
import { cn } from "@/lib/utils";

const CLAVE_AUTO = "docscribe.autoEmail";
const accion = "h-auto min-w-0 flex-1 flex-col gap-1 rounded-3xl py-3 text-xs";

// autoEnviar: true solo cuando la nota acaba de generarse (pantalla de grabación), no al reabrir una guardada.
export function SoapResult({
  nota,
  fecha,
  autoEnviar = false,
  paciente,
  numero,
  expediente,
  consultaId,
  cabecera = true,
}: {
  nota: NotaSoap;
  fecha?: string;
  autoEnviar?: boolean;
  paciente?: Paciente;
  numero?: number | null;
  expediente?: string | null;
  consultaId?: string;
  cabecera?: boolean; // false cuando la página ya muestra el paciente
}) {
  const fechaConsulta = fecha ? new Date(fecha) : new Date();
  const [toast, setToast] = useState<{ texto: string; error?: boolean } | null>(null);
  const [puedeCompartir, setPuedeCompartir] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [autoEmail, setAutoEmail] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoYaEnviado = useRef(false);

  // Web Share API: solo en el cliente (móviles, Safari/macOS, algunos Chrome).
  useEffect(() => {
    setPuedeCompartir(typeof navigator !== "undefined" && typeof navigator.share === "function");
    let auto = false;
    try {
      auto = localStorage.getItem(CLAVE_AUTO) === "1";
    } catch {}
    setAutoEmail(auto);
    if (auto && autoEnviar && !autoYaEnviado.current) {
      autoYaEnviado.current = true;
      enviarCorreo();
    }
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function avisar(texto: string, error = false) {
    setToast({ texto, error });
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setToast(null), 2200);
  }

  async function copiar() {
    const ok = await copiarTexto(notaATexto(nota, fechaConsulta, paciente, numero));
    ok ? avisar("¡Copiado!") : avisar("No se pudo copiar", true);
  }

  async function compartir() {
    const texto = notaATexto(nota, fechaConsulta, paciente, numero);
    try {
      await navigator.share({ title: MEMBRETE, text: texto });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // el usuario cerró el menú
      const ok = await copiarTexto(texto); // fallback
      ok ? avisar("No se pudo compartir; texto copiado") : avisar("No se pudo compartir", true);
    }
  }

  async function exportarPdf() {
    const doc = await construirPdf(nota, fechaConsulta, paciente, numero, expediente);
    const nombreArchivo = expediente ?? `expediente-soap-${fechaConsulta.toISOString().slice(0, 10)}`;
    doc.save(`${nombreArchivo}.pdf`);
  }

  // Envía el PDF al correo del usuario (el servidor decide el destinatario).
  async function enviarCorreo() {
    setEnviando(true);
    try {
      if (!consultaId) throw new Error("La nota aún no está guardada. Intenta de nuevo en un momento.");
      const doc = await construirPdf(nota, fechaConsulta, paciente, numero, expediente);
      const pdfBase64 = doc.output("datauristring").split(",")[1];
      // El servidor toma paciente, expediente y fecha de la base: el cliente solo manda el ID.
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64, consulta_id: consultaId }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "No se pudo enviar el correo.");
      avisar(`PDF enviado a ${d.to}`);
    } catch (e) {
      avisar(e instanceof Error ? e.message : "No se pudo enviar el correo.", true);
    } finally {
      setEnviando(false);
    }
  }

  function cambiarAuto(valor: boolean) {
    setAutoEmail(valor);
    try {
      localStorage.setItem(CLAVE_AUTO, valor ? "1" : "0");
    } catch {}
  }

  return (
    <div className="space-y-4">
      {cabecera && paciente && (
        <div className="flex items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-soft">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-900">{paciente.nombre}</p>
            <p className="text-xs text-slate-500">
              {paciente.edad !== null && `${paciente.edad} años · `}
              <Fecha iso={fechaConsulta.toISOString()} formato="corta" />
            </p>
          </div>
          {numero ? (
            <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">#{numero}</span>
          ) : null}
        </div>
      )}
      <div role="toolbar" aria-label="Acciones de la nota" className="flex gap-2">
        <Button variant="secondary" onClick={copiar} className={accion}>
          <Copy className="!size-5" /> Copiar
        </Button>
        {puedeCompartir && (
          <Button variant="secondary" onClick={compartir} className={accion}>
            <Share className="!size-5" /> Compartir
          </Button>
        )}
        <Button variant="secondary" onClick={enviarCorreo} disabled={enviando} className={accion}>
          {enviando ? <Loader2 className="!size-5 animate-spin" /> : <Mail className="!size-5" />} Correo
        </Button>
      </div>
      {autoEnviar && (
        <label className="flex cursor-pointer items-center gap-2 px-1 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={autoEmail}
            onChange={(e) => cambiarAuto(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-brand-500"
          />
          Enviarme el PDF por correo al terminar cada consulta
        </label>
      )}

      {SECCIONES_SOAP.map(({ key, letra, titulo }) => (
        <Card key={key}>
          <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 font-semibold text-brand-600">
              {letra}
            </span>
            <CardTitle className="text-base">{titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700 marker:text-brand-400">
              {nota[key].map((linea, i) => (
                <li key={i}>{linea}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      <Button onClick={exportarPdf} size="lg" className="w-full">
        <Download /> Exportar PDF
      </Button>

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
