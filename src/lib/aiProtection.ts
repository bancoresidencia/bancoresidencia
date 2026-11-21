import { NextRequest, NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { isRateLimited } from '@/lib/rateLimiter';

const DEFAULT_AI_LIMIT_PER_MINUTE = 15;

export interface AiAuthResult {
  user: User | null;
  identifier: string;
  errorResponse?: NextResponse;
}

/**
 * Validador central de sessão obrigatória e rate limiting por usuário autenticado para rotas /api/ai/*
 * Mitiga Denial of Wallet e impede bypass via falsificação de X-Forwarded-For.
 *
 * Rate limiting backed pelo Supabase (serverless-safe) — substitui Map in-memory
 * que era bypassável por cold starts em múltiplas instâncias Vercel.
 */
export async function authenticateAiRequest(
  req?: NextRequest | Request,
  limitPerMinute = DEFAULT_AI_LIMIT_PER_MINUTE
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
  const userId = auth.user.id;
  const limited = await isRateLimited('ai_user', userId, limitPerMinute, 60);

  if (limited) {
    return {
      user: auth.user,
      identifier: `ai_user_${userId}`,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Limite de requisições de IA atingido temporariamente. Por favor, aguarde um momento antes de solicitar novamente.'
        },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    };
  }

  return {
    user: auth.user,
    identifier: `ai_user_${userId}`
  };
}

/**
 * @deprecated Usar authenticateAiRequest() que já inclui rate limiting serverless-safe.
 * Mantido apenas para compatibilidade com chamadas diretas de isAiRateLimited()
 * no estudo-generator (que gerencia seu próprio flow de auth).
 */
export async function isAiRateLimited(identifier: string, limit = DEFAULT_AI_LIMIT_PER_MINUTE): Promise<boolean> {
  // O identifier já vem no formato "study_gen_<userId>" — extraímos o sufixo como key
  const key = identifier.replace(/^[^_]+_/, '') || identifier;
  return isRateLimited('ai_legacy', key, limit, 60);
}
