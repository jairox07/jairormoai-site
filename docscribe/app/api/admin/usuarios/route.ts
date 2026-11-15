import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const LICENCIAS = ["activa", "cancelada", "pendiente_pago"] as const;

// Crea una cuenta para un doctor invitado. Solo admins. La configuración (plan, licencia, capacidades)
// pasa por admin_actualizar_usuario(), así que las mismas reglas de SQL aplican.
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { data: esAdmin } = await supabase.rpc("is_admin");
  if (!esAdmin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const tier = body?.tier === "pro" ? "pro" : "free";
  const licencia = LICENCIAS.includes(body?.licencia_estado) ? (body.licencia_estado as (typeof LICENCIAS)[number]) : "activa";
  const vence = typeof body?.licencia_vence === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.licencia_vence) ? body.licencia_vence : null;
  const puedeGrabar = body?.puede_grabar !== false;
  const puedeCorreo = body?.puede_correo !== false;

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Correo no válido." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 72) {
    return NextResponse.json({ error: "La contraseña temporal debe tener entre 8 y 72 caracteres." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor." }, { status: 501 });
  }

  // email_confirm: el doctor entra directo con la contraseña temporal (no hay correo de confirmación).
  const { data: creado, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !creado.user) {
    const duplicado = /already|registered|exists/i.test(error?.message ?? "");
    return NextResponse.json(
      { error: duplicado ? "Ya existe una cuenta con ese correo." : "No se pudo crear la cuenta." },
      { status: duplicado ? 409 : 400 }
    );
  }

  const id = creado.user.id;
  const { error: errConfig } = await supabase.rpc("admin_actualizar_usuario", {
    p_id: id,
    p_tier: tier,
    p_activo: null,
    p_is_admin: null,
    p_reiniciar_contador: false,
    p_licencia_estado: licencia,
    p_licencia_vence: vence,
    p_puede_grabar: puedeGrabar,
    p_puede_correo: puedeCorreo,
  });
  if (errConfig) {
    // Sin configuración válida no dejamos una cuenta a medias.
    await admin.auth.admin.deleteUser(id);
    console.error("[admin/usuarios] configuración", errConfig);
    return NextResponse.json({ error: "No se pudo configurar la cuenta. Se revirtió." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    id,
    email,
    tier,
    licencia_estado: licencia,
    licencia_vence: vence,
    puede_grabar: puedeGrabar,
    puede_correo: puedeCorreo,
  });
}
