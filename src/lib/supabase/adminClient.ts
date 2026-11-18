import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Verifica se o ambiente possui SUPABASE_SERVICE_ROLE_KEY configurada.
 */
export function isSupabaseAdminConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Cliente Supabase privilegiado (Service Role) exclusivo para rotas do servidor.
 * NUNCA faz fallback silencioso para NEXT_PUBLIC_SUPABASE_ANON_KEY em produção,
 * garantindo falha explícita (fail-closed) caso a credencial administrativa esteja ausente.
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    if (process.env.NODE_ENV !== 'production' && supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return createSupabaseClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
    }
    throw new Error('SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL não configurados no servidor.');
  }

  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
