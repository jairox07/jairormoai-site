"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, Check, Loader2, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SoapResult } from "@/components/soap-result";
import { cn, formatTiempo } from "@/lib/utils";
import type { NotaSoap } from "@/lib/types";

type Estado = "idle" | "grabando" | "procesando" | "estructurando" | "listo" | "error";

// 24 kbps ≈ 10.8 MB/hora. 120 min ≈ 21.6 MB. En Vercel el body máx. es 4.5 MB (~25 min): ver MAX_AUDIO_MB.
const MAX_SEGUNDOS = 120 * 60;
const BARRAS = 24;

function elegirMimeType() {
  const candidatos = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return candidatos.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "";
}

export function Recorder() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [segundos, setSegundos] = useState(0);
  const [niveles, setNiveles] = useState<number[]>(() => Array(BARRAS).fill(0.05));
  const [error, setError] = useState<string | null>(null);
  const [nota, setNota] = useState<NotaSoap | null>(null);
  const [simulado, setSimulado] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const wakeRef = useRef<WakeLockSentinel | null>(null);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const limpiarMedios = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current = null;
    audioCtxRef.current = null;
    wakeRef.current?.release().catch(() => {});
    wakeRef.current = null;
  }, []);

  useEffect(() => limpiarMedios, [limpiarMedios]);

  async function procesar(audio: Blob) {
    try {
      setEstado("procesando");
      const fd = new FormData();
      const ext = audio.type.includes("mp4") ? "m4a" : audio.type.includes("ogg") ? "ogg" : "webm";
      fd.append("audio", audio, `consulta.${ext}`);

      const r1 = await fetch("/api/transcribe", { method: "POST", body: fd });
      const d1 = await r1.json();
      if (!r1.ok) throw new Error(d1.error ?? "No se pudo transcribir el audio.");

      setEstado("estructurando");
      const r2 = await fetch("/api/soap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcripcion: d1.texto }),
      });
      const d2 = await r2.json();
      if (!r2.ok) throw new Error(d2.error ?? "No se pudo generar la nota.");

      setSimulado(Boolean(d1.simulado || d2.simulado));
      setNota(d2.nota);
      setEstado("listo");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
      setEstado("error");
    }
  }

  async function iniciar() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
      streamRef.current = stream;
      // Pantalla encendida: en el celular, bloquearla corta la grabación en sesiones largas.
      navigator.wakeLock?.request("screen").then((l) => (wakeRef.current = l)).catch(() => {});

      // Web Audio API: analizador para el medidor de nivel en vivo
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const step = Math.floor(data.length / BARRAS) || 1;
        setNiveles(Array.from({ length: BARRAS }, (_, i) => Math.max(0.05, (data[i * step] ?? 0) / 255)));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      // Captura
      const mimeType = elegirMimeType();
      const rec = new MediaRecorder(stream, {
        ...(mimeType && { mimeType }),
        audioBitsPerSecond: 24_000,
      });
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        limpiarMedios();
        if (blob.size < 1000) {
          setError("La grabación está vacía. Intenta de nuevo.");
          setEstado("error");
          return;
        }
        procesar(blob);
      };
      rec.start(1000);
      recorderRef.current = rec;

      setSegundos(0);
      timerRef.current = setInterval(() => {
        setSegundos((s) => {
          if (s + 1 >= MAX_SEGUNDOS) detener();
          return s + 1;
        });
      }, 1000);
      setEstado("grabando");
    } catch (e) {
      limpiarMedios();
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "Permite el acceso al micrófono para grabar la consulta."
          : "No se pudo acceder al micrófono."
      );
      setEstado("error");
    }
  }

  function detener() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  // ── Resultado ──
  if (estado === "listo" && nota) {
    return (
      <div className="pb-10">
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-brand-50 p-3.5 text-sm font-medium text-brand-700">
          <Check className="h-4 w-4" /> Nota guardada en tu historial.
        </div>
        {simulado && (
          <p className="mb-4 rounded-2xl border border-dashed border-slate-300 p-3 text-xs text-slate-500">
            Modo demo: sin API keys configuradas, se usó una transcripción/nota simulada.
          </p>
        )}
        <SoapResult nota={nota} autoEnviar />
        <Button asChild variant="outline" size="lg" className="mt-6 w-full">
          <Link href="/dashboard">Ir al inicio</Link>
        </Button>
      </div>
    );
  }

  // ── Carga ──
  if (estado === "procesando" || estado === "estructurando") {
    const pasos = [
      { key: "procesando", label: "Procesando audio..." },
      { key: "estructurando", label: "Estructurando nota médica..." },
    ];
    const actual = pasos.findIndex((p) => p.key === estado);
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 pb-24" aria-live="polite">
        <Loader2 className="h-14 w-14 animate-spin text-primary" />
        <ol className="space-y-3">
          {pasos.map((p, i) => (
            <li
              key={p.key}
              className={cn(
                "flex items-center gap-3 text-base",
                i > actual && "text-muted-foreground/50",
                i === actual && "font-medium"
              )}
            >
              {i < actual ? (
                <Check className="h-5 w-5 text-primary" />
              ) : i === actual ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <span className="h-5 w-5 rounded-full border-2" />
              )}
              {p.label}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // ── Grabación ──
  const grabando = estado === "grabando";
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 pb-16">
      <div className="w-full rounded-3xl bg-white px-6 py-7 text-center shadow-soft">
        <p className="text-sm text-slate-500">{grabando ? "Grabando consulta…" : "Listo para grabar"}</p>
        <p className="mt-1 text-6xl font-light tabular-nums tracking-tight text-slate-900" aria-live="off">
          {formatTiempo(segundos)}
        </p>
        <div className="mt-5 flex h-14 items-center justify-center gap-1" aria-hidden="true">
          {niveles.map((n, i) => (
            <span
              key={i}
              className={cn("w-1.5 rounded-full transition-[height] duration-75", grabando ? "bg-brand-500" : "bg-brand-100")}
              style={{ height: `${Math.round(n * 56)}px` }}
            />
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <span className="absolute h-44 w-44 rounded-full bg-brand-500/10" />
        <span className="absolute h-36 w-36 rounded-full bg-brand-500/15" />
        <button
          type="button"
          onClick={grabando ? detener : iniciar}
          aria-label={grabando ? "Detener grabación" : "Iniciar grabación"}
          className={cn(
            "relative flex h-28 w-28 items-center justify-center rounded-full text-white shadow-xl transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300",
            grabando ? "bg-rose-500 shadow-rose-500/40 hover:bg-rose-600" : "bg-brand-500 shadow-brand-500/40 hover:bg-brand-600"
          )}
        >
          {grabando && <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/40" />}
          {grabando ? <Square className="relative h-10 w-10 fill-current" /> : <Mic className="h-12 w-12" />}
        </button>
      </div>
      <p className="-mt-3 text-sm font-medium text-slate-700">{grabando ? "Toca para detener" : "Toca para empezar"}</p>

      {error && (
        <p role="alert" className="flex max-w-xs items-start gap-2 text-sm text-rose-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <p className="max-w-xs text-center text-xs text-slate-400">
        Informa al paciente que la consulta se graba. Máximo {MAX_SEGUNDOS / 60} min.
      </p>
    </div>
  );
}
