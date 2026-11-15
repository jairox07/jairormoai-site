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

// Cédula profesional: 6 a 8 dígitos (la NOM-004 pide la del médico en sus notas). No se verifica contra el registro de la SEP.
export const CEDULA = /^\d{6,8}$/;

// El perfil está completo cuando acepta la versión vigente del aviso y tiene cédula.
export function perfilVigente(p: { aviso_version?: string | null; cedula?: string | null } | null | undefined) {
  return p?.aviso_version === AVISO_VERSION && Boolean(p?.cedula);
}

export async function perfilCompleto(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("perfiles").select("aviso_version, cedula").eq("user_id", userId).maybeSingle();
  return perfilVigente(data);
}
