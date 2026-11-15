import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cargarConfig } from "@/lib/config";
import { perfilCompleto } from "@/lib/perfil";
import { DashboardLive } from "@/components/dashboard-live";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  // Primer ingreso (o aviso nuevo): se completa el perfil antes de usar la app.
  if (!(await perfilCompleto(supabase, user.id))) redirect("/onboarding");

  const [{ data: perfil }, { data: consultas }, cfg] = await Promise.all([
    supabase.from("users").select("tier, consultas_usadas, periodo, is_admin").eq("id", user.id).single(),
    supabase
      .from("consultas")
      .select("id, fecha, nota_soap_final, paciente_nombre, paciente_edad, numero, audio_path, audio_segundos")
      .order("fecha", { ascending: false })
      .limit(10),
    cargarConfig(supabase),
  ]);

  return (
    <DashboardLive
      userId={user.id}
      email={user.email ?? ""}
      perfilInicial={perfil}
      consultasIniciales={consultas ?? []}
      limite={cfg.limite_free}
      esAdmin={Boolean(perfil?.is_admin)}
    />
  );
}
