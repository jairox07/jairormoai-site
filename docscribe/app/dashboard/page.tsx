import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLive } from "@/components/dashboard-live";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: perfil }, { data: consultas }] = await Promise.all([
    supabase.from("users").select("tier, consultas_usadas, periodo").eq("id", user.id).single(),
    supabase
      .from("consultas")
      .select("id, fecha, nota_soap_final")
      .order("fecha", { ascending: false })
      .limit(10),
  ]);

  return (
    <DashboardLive
      userId={user.id}
      email={user.email ?? ""}
      perfilInicial={perfil}
      consultasIniciales={consultas ?? []}
    />
  );
}
