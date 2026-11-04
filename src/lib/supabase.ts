import { createClient } from './supabase/client';

/**
 * Instância unificada do cliente Supabase baseada em @supabase/ssr.
 * Mantém sincronia de cookies de autenticação e sessão entre serviços,
 * páginas, componentes e rotas da Vercel.
 */
export const supabase = createClient();
export default supabase;

