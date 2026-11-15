import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// Configuración global editable desde /admin (tabla app_config). Sin secretos: las API keys son variables de entorno.
export type Config = {
  stt_provider: string; // auto | openai | local | mock
  llm_provider: string; // auto | gemini | openai | ollama | mock
  ollama_model: string;
  correo_pdf: boolean; // permite "Enviar a mi correo"
  nueva_consulta: boolean; // interruptor general: false = mantenimiento
  limite_free: number; // consultas/mes del plan Free
  retencion_audio_dias: number; // días que se conserva el audio; 0 = no guardarlo
};

export const CONFIG_DEFECTO: Config = {
  stt_provider: "auto",
  llm_provider: "auto",
  ollama_model: "qwen2.5:7b",
  correo_pdf: true,
  nueva_consulta: true,
  limite_free: 20,
  retencion_audio_dias: 30,
};

export async function cargarConfig(supabase: SupabaseClient): Promise<Config> {
  const { data } = await supabase.from("app_config").select("clave, valor");
  const cfg: Record<string, unknown> = { ...CONFIG_DEFECTO };
  for (const fila of data ?? []) if (fila.clave in CONFIG_DEFECTO) cfg[fila.clave] = fila.valor;
  return cfg as Config;
}

// Qué proveedores tienen credenciales/servicio en ESTE servidor (para el panel admin).
export function proveedoresDisponibles() {
  return {
    stt: {
      auto: true,
      mock: true,
      openai: Boolean(process.env.OPENAI_API_KEY),
      local: Boolean(process.env.STT_LOCAL_URL),
    },
    llm: {
      auto: true,
      mock: true,
      gemini: Boolean(process.env.GEMINI_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      ollama: Boolean(process.env.OLLAMA_MODEL || process.env.OLLAMA_URL),
    },
  };
}
