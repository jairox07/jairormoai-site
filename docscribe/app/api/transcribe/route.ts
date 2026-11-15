import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transcribirAudio } from "@/lib/ai";
import { LIMITE_FREE, periodoActual } from "@/lib/utils";

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

  // Pre-chequeo de cuota (antes de gastar en STT). El chequeo definitivo es atómico en SQL.
  const { data: perfil } = await supabase
    .from("users")
    .select("tier, consultas_usadas, periodo")
    .eq("id", user.id)
    .single();
  const usadas = perfil?.periodo === periodoActual() ? perfil.consultas_usadas : 0;
  if (perfil?.tier !== "pro" && usadas >= LIMITE_FREE) {
    return NextResponse.json({ error: "Alcanzaste el límite de 20 consultas este mes." }, { status: 402 });
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
    const { texto, simulado } = await transcribirAudio(audio);
    if (!texto) return NextResponse.json({ error: "No se detectó voz en el audio." }, { status: 422 });
    return NextResponse.json({ texto, simulado });
  } catch (e) {
    console.error("[transcribe]", e);
    return NextResponse.json({ error: "Falló la transcripción. Intenta de nuevo." }, { status: 502 });
  }
}
