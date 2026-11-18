import { NextRequest, NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const aiRateLimitMap = new Map<string, RateLimitRecord>();
const AI_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_AI_REQUESTS_PER_MINUTE = 15;
const MAX_AI_MAP_ENTRIES = 5000;

/**
 * Checa se o identificador (atrelado ao userId autenticado, imune a spoofing de IP)
 * excedeu o limite de requisições de IA por minuto, mantendo teto rígido FIFO em memória.
 */
export function isAiRateLimited(identifier: string, limit = MAX_AI_REQUESTS_PER_MINUTE): boolean {
  const now = Date.now();
  const record = aiRateLimitMap.get(identifier);

  if (record && record.resetAt >= now) {
    if (record.count >= limit) {
      return true;
    }
    record.count += 1;
    return false;
  }

  if (record) {
    aiRateLimitMap.delete(identifier);
  }

  if (aiRateLimitMap.size >= MAX_AI_MAP_ENTRIES) {
    let evicted = 0;
    for (const [key, val] of aiRateLimitMap.entries()) {
      if (val.resetAt < now || evicted < 250) {
        aiRateLimitMap.delete(key);
        evicted++;
        if (aiRateLimitMap.size < MAX_AI_MAP_ENTRIES - 250) break;
      }
    }
  }

  aiRateLimitMap.set(identifier, { count: 1, resetAt: now + AI_RATE_LIMIT_WINDOW_MS });
  return false;
}

export interface AiAuthResult {
  user: User | null;
  identifier: string;
  errorResponse?: NextResponse;
}

/**
 * Validador central de sessão obrigatória e rate limiting por usuário autenticado para rotas /api/ai/*
 * Mitiga Denial of Wallet e impede bypass via falsificação de X-Forwarded-For.
 */
export async function authenticateAiRequest(
  req?: NextRequest | Request,
  limitPerMinute = MAX_AI_REQUESTS_PER_MINUTE
): Promise<AiAuthResult> {
  const auth = await verifyStudentSession(req);

  if (!auth.authorized || !auth.user) {
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

  // Indexado estritamente por user.id autenticado (imune a rotação de cabeçalhos de IP)
  const identifier = `ai_user_${auth.user.id}`;

  if (isAiRateLimited(identifier, limitPerMinute)) {
    return {
      user: auth.user,
      identifier,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Limite de requisições de IA atingido temporariamente. Por favor, aguarde um momento antes de solicitar novamente.'
        },
        { status: 429, headers: { 'Retry-After': '30' } }
      )
    };
  }

  return {
    user: auth.user,
    identifier
  };
}
