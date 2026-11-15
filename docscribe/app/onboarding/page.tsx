import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { perfilVigente } from "@/lib/perfil";
import { WizardRegistro } from "@/components/wizard-registro";

export const dynamic = "force-dynamic";
export const metadata = { title: "Configura tu consultorio · DocScribe" };

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Si ya aceptó la versión vigente, no hay nada que hacer. Si cambió el aviso, se prellenan sus datos.
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre, clinica, especialidad, rfc, cedula, aviso_version")
    .eq("user_id", user.id)
    .maybeSingle();
  if (perfilVigente(perfil)) redirect("/dashboard");

  return (
    <WizardRegistro
      inicial={{
        nombre: perfil?.nombre ?? "",
        clinica: perfil?.clinica ?? "",
        especialidad: perfil?.especialidad ?? "",
        rfc: perfil?.rfc ?? "",
        cedula: perfil?.cedula ?? "",
      }}
    />
  );
}
