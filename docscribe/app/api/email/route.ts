import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cargarConfig } from "@/lib/config";

export const runtime = "nodejs";

const MAX_BASE64 = 14_000_000; // ≈ 10 MB de PDF
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Envía el PDF de una consulta al correo del propio usuario. El destinatario NO viene del cliente.
// Paciente, expediente y fecha se leen de la base (RLS: solo consultas propias), no del navegador.
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  if (!(await cargarConfig(supabase)).correo_pdf) {
    return NextResponse.json({ error: "El envío por correo está desactivado." }, { status: 403 });
  }
  const { data: perfil } = await supabase.from("users").select("puede_correo").eq("id", user.id).single();
  if (perfil?.puede_correo === false) {
    return NextResponse.json({ error: "Tu cuenta no tiene permiso para enviar correos." }, { status: 403 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Correo no configurado (falta RESEND_API_KEY en el servidor)." }, { status: 501 });
  }

  const body = await request.json().catch(() => null);
  const pdfBase64 = typeof body?.pdfBase64 === "string" ? body.pdfBase64 : "";
  if (!pdfBase64 || pdfBase64.length > MAX_BASE64 || !/^[A-Za-z0-9+/=]+$/.test(pdfBase64)) {
    return NextResponse.json({ error: "PDF inválido." }, { status: 400 });
  }
  const consultaId = typeof body?.consulta_id === "string" ? body.consulta_id : "";
  if (!UUID.test(consultaId)) return NextResponse.json({ error: "Consulta no válida." }, { status: 400 });

  const { data: c } = await supabase
    .from("consultas")
    .select("expediente, paciente_nombre, paciente_edad, numero, fecha")
    .eq("id", consultaId)
    .maybeSingle();
  if (!c) return NextResponse.json({ error: "Consulta no encontrada." }, { status: 404 });

  // Zona fija: en el servidor (UTC) la hora saldría corrida.
  const fechaTxt = new Date(c.fecha).toLocaleString("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  });
  const expediente = c.expediente ?? "Sin código";
  const paciente = `${c.paciente_nombre ?? "Sin nombre"}${c.paciente_edad !== null ? ` (${c.paciente_edad} años)` : ""}`;

  const texto = [
    "DocScribe - Expediente clínico",
    "",
    `Expediente: ${expediente}`,
    `Paciente: ${paciente}`,
    `Fecha de la consulta: ${fechaTxt}`,
    c.numero ? `Consulta #${c.numero}` : null,
    "",
    "Adjuntamos la nota clínica SOAP en PDF. Es un borrador generado con IA: revísalo antes de usarlo.",
  ]
    .filter((linea) => linea !== null)
    .join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "DocScribe <onboarding@resend.dev>",
      to: [user.email],
      // El asunto solo lleva el código de expediente: el nombre del paciente va dentro del correo.
      subject: `DocScribe · Expediente ${expediente}`,
      text: texto,
      attachments: [{ filename: `${expediente}.pdf`, content: pdfBase64 }],
    }),
  });

  if (!res.ok) {
    console.error("[email]", res.status, await res.text());
    const hint =
      res.status === 403
        ? " Con onboarding@resend.dev solo se puede enviar al correo de tu cuenta de Resend; verifica un dominio para otros destinatarios."
        : "";
    return NextResponse.json({ error: `No se pudo enviar el correo.${hint}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true, to: user.email });
}
