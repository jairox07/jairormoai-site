import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cargarConfig } from "@/lib/config";

export const runtime = "nodejs";

const MAX_BASE64 = 14_000_000; // ≈ 10 MB de PDF

// Envía el PDF de la nota al correo del propio usuario (no acepta destinatario desde el cliente:
// así no se puede usar como relay de correo ni mandar datos clínicos a terceros por error).
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
  const fecha = new Date(typeof body?.fecha === "string" ? body.fecha : Date.now());
  const fechaTxt = (isNaN(fecha.getTime()) ? new Date() : fecha).toLocaleDateString("es-MX", { dateStyle: "long" });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "DocScribe <onboarding@resend.dev>",
      to: [user.email],
      subject: `DocScribe - Expediente Clínico (${fechaTxt})`,
      text: "Adjuntamos la nota clínica SOAP de tu consulta. Es un borrador generado con IA: revísalo antes de usarlo.",
      attachments: [{ filename: `expediente-soap.pdf`, content: pdfBase64 }],
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
