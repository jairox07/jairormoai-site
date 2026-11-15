import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cargarConfig } from "@/lib/config";
import { transcribirAudio } from "@/lib/ai";
import { periodoActual } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 300;

// Local: 40 MB (~2 h). En Vercel pon MAX_AUDIO_MB=4 (su límite de body es 4.5 MB).
const MAX_MB = Number(process.env.MAX_AUDIO_MB) || 40;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const cfg = await cargarConfig(supabase);
  if (!cfg.nueva_consulta) {
    return NextResponse.json({ error: "El servicio está en mantenimiento. Intenta más tarde." }, { status: 503 });
  }

  // Pre-chequeo de cuenta y cuota (antes de gastar en STT). El chequeo definitivo es atómico en SQL.
  const { data: perfil } = await supabase
    .from("users")
    .select("tier, consultas_usadas, periodo, activo, licencia_estado, puede_grabar")
    .eq("id", user.id)
    .single();
  if (perfil?.activo === false) {
    return NextResponse.json({ error: "Tu cuenta está suspendida. Contacta al administrador." }, { status: 403 });
  }
  if (perfil && perfil.licencia_estado !== "activa") {
    return NextResponse.json({ error: "Tu licencia no está activa. Contacta al administrador." }, { status: 403 });
  }
  if (perfil?.puede_grabar === false) {
    return NextResponse.json({ error: "Tu cuenta no tiene permiso para grabar consultas." }, { status: 403 });
  }
  const usadas = perfil?.periodo === periodoActual() ? perfil.consultas_usadas : 0;
  if (perfil?.tier !== "pro" && usadas >= cfg.limite_free) {
    return NextResponse.json({ error: `Alcanzaste el límite de ${cfg.limite_free} consultas este mes.` }, { status: 402 });
  }

  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: "No se recibió audio." }, { status: 400 });
  }
  if (audio.size > MAX_BYTES) {
    return NextResponse.json({ error: `El audio es demasiado grande (máx. ${MAX_MB} MB).` }, { status: 413 });
  }

  try {
    const { texto, simulado, duracion } = await transcribirAudio(audio, cfg.stt_provider);
    if (!texto) return NextResponse.json({ error: "No se detectó voz en el audio." }, { status: 422 });
    return NextResponse.json({ texto, simulado, duracion });
  } catch (e) {
    console.error("[transcribe]", e);
    return NextResponse.json({ error: "Falló la transcripción. Intenta de nuevo." }, { status: 502 });
  }
}
