import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente con la llave de servicio de Supabase. SOLO para el servidor y SOLO para crear cuentas de login.
// Nunca se importa desde componentes cliente (server-only lo impide en build).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
