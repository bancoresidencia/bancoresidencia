import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Verifica se o servidor tem uma credencial privilegiada configurada.
 */
export function isSupabaseAdminConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabaseSecretKey());
}

function getSupabaseSecretKey(): string | undefined {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

/**
 * Cliente Supabase privilegiado (Service Role) exclusivo para rotas do servidor.
 * NUNCA faz fallback para a chave publicável em produção,
 * garantindo falha explícita (fail-closed) caso a credencial administrativa esteja ausente.
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = getSupabaseSecretKey();

  if (!supabaseUrl || !serviceKey) {
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (process.env.NODE_ENV !== 'production' && supabaseUrl && publishableKey) {
      return createSupabaseClient(supabaseUrl, publishableKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
    }
    throw new Error('SUPABASE_SECRET_KEY ou NEXT_PUBLIC_SUPABASE_URL não configurados no servidor.');
  }

  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
