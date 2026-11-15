import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generarNotaSoap } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CHARS = 60_000;

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const transcripcion = typeof body?.transcripcion === "string" ? body.transcripcion.trim() : "";
  if (!transcripcion) return NextResponse.json({ error: "Transcripción vacía." }, { status: 400 });
  if (transcripcion.length > MAX_CHARS) {
    return NextResponse.json({ error: "Transcripción demasiado larga." }, { status: 413 });
  }

  let resultado;
  try {
    resultado = await generarNotaSoap(transcripcion);
  } catch (e) {
    console.error("[soap]", e);
    return NextResponse.json({ error: "No se pudo estructurar la nota. Intenta de nuevo." }, { status: 502 });
  }

  // Inserta + descuenta cuota de forma atómica (ver supabase/schema.sql)
  const { data: id, error } = await supabase.rpc("registrar_consulta", {
    p_transcripcion: transcripcion,
    p_nota: resultado.nota,
  });

  if (error) {
    if (error.message.includes("LIMITE_ALCANZADO")) {
      return NextResponse.json({ error: "Alcanzaste el límite de 20 consultas este mes." }, { status: 402 });
    }
    console.error("[soap] registrar_consulta", error);
    return NextResponse.json({ error: "No se pudo guardar la consulta." }, { status: 500 });
  }

  return NextResponse.json({ id, nota: resultado.nota, simulado: resultado.simulado });
}
