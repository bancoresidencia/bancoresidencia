import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com permissões de Service Role para rotas do servidor.
 * Permite atualização de perfis e pedidos sem restrição de RLS.
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase URL ou Service Role Key não configurados.');
  }

  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

