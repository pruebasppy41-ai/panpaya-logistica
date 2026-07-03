import { createClient, SupabaseClient } from '@supabase/supabase-js';

/** Corrige el typo frecuente blwzyrk → blwzyk en despliegues Vercel */
function resolveSupabaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const fallback = 'https://eeikipgrdyctovblwzyk.supabase.co';
  if (!env) return fallback;
  if (env.includes('blwzyrk')) return env.replace('blwzyrk', 'blwzyk');
  return env;
}

const supabaseUrl = resolveSupabaseUrl();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

export const supabaseConfigOk = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey || 'missing-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export { supabaseUrl };
