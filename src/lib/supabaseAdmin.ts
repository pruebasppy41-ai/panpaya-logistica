import { createClient } from "@supabase/supabase-js";

function resolveSupabaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const fallback = "https://eeikipgrdyctovblwzyk.supabase.co";
  if (!env) return fallback;
  if (env.includes("blwzyrk")) return env.replace("blwzyrk", "blwzyk");
  return env;
}

const supabaseUrl = resolveSupabaseUrl();
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

if (!serviceKey) {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY no configurada — la API de Excel no podrá escribir en BD"
  );
}

export function createSupabaseAdmin() {
  if (!serviceKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en variables de entorno del servidor");
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
