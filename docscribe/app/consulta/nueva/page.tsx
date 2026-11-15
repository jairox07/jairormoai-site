import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { perfilCompleto } from "@/lib/perfil";
import { Recorder } from "@/components/recorder";

export const dynamic = "force-dynamic";

export default async function NuevaConsultaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await perfilCompleto(supabase, user.id))) redirect("/onboarding");

  const { data: perfil } = await supabase.from("perfiles").select("nombre, cedula, especialidad, clinica").eq("user_id", user.id).maybeSingle();
  const medico = perfil ? { nombre: perfil.nombre, cedula: perfil.cedula, especialidad: perfil.especialidad, clinica: perfil.clinica } : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pt-5">
      <header className="mb-2 flex items-center justify-between">
        <Link
          href="/dashboard"
          aria-label="Volver"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-soft transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-medium text-slate-900">Nueva consulta</h1>
        <span className="h-11 w-11" aria-hidden="true" />
      </header>
      <Recorder medico={medico} />
    </main>
  );
}
