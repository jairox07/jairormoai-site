import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cargarConfig } from "@/lib/config";
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

  const cfg = await cargarConfig(supabase);
  if (!cfg.nueva_consulta) {
    return NextResponse.json({ error: "El servicio está en mantenimiento. Intenta más tarde." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const transcripcion = typeof body?.transcripcion === "string" ? body.transcripcion.trim() : "";
  if (!transcripcion) return NextResponse.json({ error: "Transcripción vacía." }, { status: 400 });
  if (transcripcion.length > MAX_CHARS) {
    return NextResponse.json({ error: "Transcripción demasiado larga." }, { status: 413 });
  }

  // Paciente: validado aquí y de nuevo en SQL. Se revisa antes de gastar en la IA.
  const paciente = typeof body?.paciente === "string" ? body.paciente.trim() : "";
  if (paciente.length < 2 || paciente.length > 120) {
    return NextResponse.json({ error: "Escribe el nombre del paciente (2 a 120 caracteres)." }, { status: 400 });
  }
  const edadRaw = body?.edad;
  const edad = edadRaw === null || edadRaw === undefined || edadRaw === "" ? null : Number(edadRaw);
  if (edad !== null && (!Number.isInteger(edad) || edad < 0 || edad > 130)) {
    return NextResponse.json({ error: "La edad debe ser un número entre 0 y 130." }, { status: 400 });
  }

  // Duración del audio (la reporta el STT local); se guarda para el consumo del admin.
  const audioSegundos = typeof body?.audio_segundos === "number" && body.audio_segundos >= 0 ? body.audio_segundos : null;

  let resultado;
  try {
    resultado = await generarNotaSoap(transcripcion, { proveedor: cfg.llm_provider, ollamaModel: cfg.ollama_model });
  } catch (e) {
    console.error("[soap]", e);
    return NextResponse.json({ error: "No se pudo estructurar la nota. Intenta de nuevo." }, { status: 502 });
  }

  // Inserta + descuenta cuota + asigna número de consulta de forma atómica (ver supabase/schema.sql)
  const { data, error } = await supabase.rpc("registrar_consulta", {
    p_transcripcion: transcripcion,
    p_nota: resultado.nota,
    p_paciente: paciente,
    p_edad: edad,
    p_uso: {
      entrada: resultado.uso.entrada,
      salida: resultado.uso.salida,
      audio_segundos: audioSegundos,
    },
  });

  if (error) {
    if (error.message.includes("LIMITE_ALCANZADO")) {
      return NextResponse.json({ error: `Alcanzaste el límite de ${cfg.limite_free} consultas este mes.` }, { status: 402 });
    }
    if (error.message.includes("CUENTA_SUSPENDIDA")) {
      return NextResponse.json({ error: "Tu cuenta está suspendida. Contacta al administrador." }, { status: 403 });
    }
    if (error.message.includes("LICENCIA_INACTIVA")) {
      return NextResponse.json({ error: "Tu licencia no está activa. Contacta al administrador." }, { status: 403 });
    }
    if (error.message.includes("NO_PUEDE_GRABAR")) {
      return NextResponse.json({ error: "Tu cuenta no tiene permiso para grabar consultas." }, { status: 403 });
    }
    if (error.message.includes("PACIENTE_INVALIDO") || error.message.includes("EDAD_INVALIDA")) {
      return NextResponse.json({ error: "Datos del paciente no válidos." }, { status: 400 });
    }
    console.error("[soap] registrar_consulta", error);
    return NextResponse.json({ error: "No se pudo guardar la consulta." }, { status: 500 });
  }

  const fila = data as { id: string; numero: number };
  return NextResponse.json({
    id: fila.id,
    numero: fila.numero,
    paciente: { nombre: paciente, edad },
    nota: resultado.nota,
    simulado: resultado.simulado,
  });
}
