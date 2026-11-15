import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONFIG_DEFECTO } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 60;

const LOTE = 500;

// Tarea programada: borra los audios más viejos que retencion_audio_dias.
// Se protege con CRON_SECRET (Vercel Cron lo manda como "Authorization: Bearer <secreto>") y usa la llave de servicio
// para ver todos los audios. Los archivos se borran con la API de Storage (borrarlos con SQL los deja huérfanos).
async function purgar(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return NextResponse.json({ error: "Falta CRON_SECRET en el servidor." }, { status: 501 });

  const recibido = Buffer.from(request.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${secreto}`);
  if (recibido.length !== esperado.length || !timingSafeEqual(recibido, esperado)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." }, { status: 501 });
  }

  const { data: cfg } = await admin.from("app_config").select("valor").eq("clave", "retencion_audio_dias").maybeSingle();
  const dias = typeof cfg?.valor === "number" ? cfg.valor : CONFIG_DEFECTO.retencion_audio_dias;
  const limite = new Date(Date.now() - dias * 86_400_000).toISOString();

  let purgados = 0;
  // Por lotes, para no cargar todo de una vez.
  for (;;) {
    const { data: filas, error } = await admin
      .from("consultas")
      .select("id, audio_path")
      .not("audio_path", "is", null)
      .lt("fecha", limite)
      .limit(LOTE);
    if (error) return NextResponse.json({ error: "No se pudo consultar.", purgados }, { status: 500 });
    if (!filas || filas.length === 0) break;

    // Primero el archivo; solo si se borró se quita la ruta (así no queda nada huérfano ni a medias).
    const { error: errArchivo } = await admin.storage.from("consultas-audio").remove(filas.map((f) => f.audio_path as string));
    if (errArchivo) return NextResponse.json({ error: "No se pudieron borrar los archivos.", purgados }, { status: 502 });
    const { error: errBase } = await admin
      .from("consultas")
      .update({ audio_path: null })
      .in("id", filas.map((f) => f.id));
    if (errBase) return NextResponse.json({ error: "Archivos borrados; falló actualizar las consultas.", purgados }, { status: 500 });

    purgados += filas.length;
    if (filas.length < LOTE) break;
  }

  return NextResponse.json({ ok: true, retencion_dias: dias, purgados });
}

export const GET = purgar;
export const POST = purgar;
