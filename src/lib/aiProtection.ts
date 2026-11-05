import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const aiRateLimitMap = new Map<string, RateLimitRecord>();
const AI_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_AI_REQUESTS_PER_MINUTE = 15; // Máximo de 15 requisições de IA por minuto por usuário/IP

/**
 * Limpa periodicamente entradas expiradas do cache de rate limit
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  if (aiRateLimitMap.size > 2000) {
    for (const [key, value] of aiRateLimitMap.entries()) {
      if (value.resetAt < now) {
        aiRateLimitMap.delete(key);
      }
    }
  }
}

/**
 * Checa se o identificador excedeu o limite de requisições de IA por minuto
 */
export function isAiRateLimited(identifier: string, limit = MAX_AI_REQUESTS_PER_MINUTE): boolean {
  cleanupExpiredEntries();
  const now = Date.now();
  const record = aiRateLimitMap.get(identifier);

  if (!record || record.resetAt < now) {
    aiRateLimitMap.set(identifier, { count: 1, resetAt: now + AI_RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count += 1;
  return false;
}

export interface AiAuthResult {
  user: User | null;
  identifier: string;
  errorResponse?: NextResponse;
}

/**
 * Validador de sessão obrigatória e rate limiting para rotas de IA
 * Exige usuário autenticado no Supabase e bloqueia abuso de cotas (Denial of Wallet).
 */
export async function authenticateAiRequest(req?: NextRequest | Request): Promise<AiAuthResult> {
  let authUser: User | null = null;

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user) {
      authUser = user;
    }
  } catch {
    // Falha esperada fora do contexto de cookies
  }

  if (!authUser) {
    return {
      user: null,
      identifier: 'anon',
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Acesso não autorizado: faça login na plataforma para utilizar os assistentes de inteligência artificial.'
        },
        { status: 401 }
      )
    };
  }

  const clientIp = req?.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                   req?.headers.get('x-real-ip') ||
                   'unknown-ip';

  const identifier = `user_${authUser.id}_ip_${clientIp}`;

  if (isAiRateLimited(identifier)) {
    return {
      user: authUser,
      identifier,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Limite de requisições de IA atingido temporariamente. Por favor, aguarde um momento antes de solicitar novamente.'
        },
        { status: 429 }
      )
    };
  }

  return {
    user: authUser,
    identifier
  };
}

