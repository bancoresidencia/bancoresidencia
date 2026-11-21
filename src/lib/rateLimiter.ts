/**
 * Rate Limiter Persistente — Serverless-safe
 *
 * Resolve C-1: Maps in-memory não funcionam no Vercel porque cada instância
 * serverless tem memória isolada. Esta implementação usa o Supabase (via RPC
 * atômico) como backend compartilhado entre todas as instâncias.
 *
 * Fallback automático para Map em memória em desenvolvimento local
 * (quando SUPABASE_SECRET_KEY não está configurada).
 *
 * Uso:
 *   const limited = await isRateLimited('ai_user', userId, 10, 60);
 *   if (limited) return 429;
 */

import { getSupabaseAdmin } from '@/lib/supabase/adminClient';

// ---------------------------------------------------------------------------
// Fallback in-memory (apenas dev local)
// ---------------------------------------------------------------------------
interface FallbackEntry {
  count: number;
  resetAt: number;
}
const fallbackMap = new Map<string, FallbackEntry>();

function isRateLimitedInMemory(id: string, limit: number, windowSeconds: number): boolean {
  const now = Date.now();
  const entry = fallbackMap.get(id);
  if (entry && entry.resetAt > now) {
    if (entry.count >= limit) return true;
    entry.count++;
    return false;
  }
  // Limpeza simples para evitar crescimento ilimitado em dev
  if (fallbackMap.size >= 2000) {
    for (const [k, v] of fallbackMap) {
      if (v.resetAt <= now) fallbackMap.delete(k);
      if (fallbackMap.size < 1500) break;
    }
  }
  fallbackMap.set(id, { count: 1, resetAt: now + windowSeconds * 1000 });
  return false;
}

// ---------------------------------------------------------------------------
// Backend Supabase (produção)
// ---------------------------------------------------------------------------

/**
 * Verifica e incrementa atomicamente o rate limit via Supabase RPC.
 *
 * @param prefix    Namespace do limite (ex: 'ai_user', 'solve_ip')
 * @param key       Identificador único dentro do namespace (userId, ip hash)
 * @param limit     Número máximo de requisições permitidas na janela
 * @param windowSeconds  Duração da janela em segundos (padrão: 60)
 * @returns `true` se o limite foi EXCEDIDO (bloquear), `false` se permitido
 */
export async function isRateLimited(
  prefix: string,
  key: string,
  limit: number,
  windowSeconds = 60
): Promise<boolean> {
  const id = `${prefix}:${key}`;
  const isProduction = process.env.NODE_ENV === 'production';

  // Em dev sem service key configurada: fallback em memória (comportamento seguro)
  if (!isProduction) {
    return isRateLimitedInMemory(id, limit, windowSeconds);
  }

  try {
    const supabase = getSupabaseAdmin();

    // Incremento atômico via função PL/pgSQL — sem race conditions
    const { data, error } = await supabase.rpc('rate_limit_increment', {
      p_id: id,
      p_window_s: windowSeconds,
    });

    if (error) {
      // Em caso de falha do banco (ex: timeout), fail-open com aviso:
      // preferimos não bloquear usuários legítimos a derrubar a plataforma.
      // O risco de Denial-of-Wallet em um único burst de falha é aceitável.
      console.warn('[RateLimiter] Supabase RPC falhou, fail-open:', error.message);
      return false;
    }

    const count = typeof data === 'number' ? data : Number(data);
    return count > limit;
  } catch (err) {
    console.warn('[RateLimiter] Exceção inesperada, fail-open:', err);
    return false;
  }
}

/**
 * Versão síncrona de compatibilidade retroativa (apenas para locais onde
 * a função ainda não pode ser async). Usa SEMPRE o fallback in-memory.
 * NÃO usar em produção para limites críticos — prefira isRateLimited().
 *
 * @deprecated Preferir isRateLimited() (async, Supabase-backed)
 */
export function isRateLimitedSync(
  prefix: string,
  key: string,
  limit: number,
  windowSeconds = 60
): boolean {
  return isRateLimitedInMemory(`${prefix}:${key}`, limit, windowSeconds);
}
