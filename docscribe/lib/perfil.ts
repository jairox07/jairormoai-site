import type { SupabaseClient } from "@supabase/supabase-js";

// Si cambias el texto del aviso, sube la versión: todos los doctores tendrán que aceptarlo de nuevo.
export const AVISO_VERSION = "2026-11";

export const ESPECIALIDADES = [
  "Medicina general",
  "Medicina interna",
  "Pediatría",
  "Ginecología y obstetricia",
  "Cirugía general",
  "Neurocirugía",
  "Neurología",
  "Cardiología",
  "Traumatología y ortopedia",
  "Dermatología",
  "Oftalmología",
  "Otorrinolaringología",
  "Urología",
  "Psiquiatría",
  "Psicología",
  "Nutrición",
  "Odontología",
  "Medicina del deporte",
  "Rehabilitación y fisioterapia",
] as const;

// El perfil está completo cuando existe y acepta la versión vigente del aviso.
export async function perfilCompleto(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("perfiles").select("aviso_version").eq("user_id", userId).maybeSingle();
  return data?.aviso_version === AVISO_VERSION;
}
