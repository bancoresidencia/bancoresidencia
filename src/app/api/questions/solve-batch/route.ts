import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import {
  validateQuestionId,
  isPrivilegedRole,
  extractTrustedClientIpFromHeaders,
  safeErrorMessage
} from '@/utils/security';
import { verifySessionTicket } from '@/utils/securityTickets';
import { injectZeroWidthWatermark } from '@/utils/watermark';
import { sanitizeMedicalText, unpackStructuredCommentary } from '@/utils/textSanitizer';
import { findCanonicalQuestionsByIdsOrCodes } from '@/services/canonicalQuestionStore';

export const dynamic = 'force-dynamic';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const batchRateLimitMap = new Map<string, RateLimitEntry>();
const BATCH_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_BATCH_REQUESTS_PER_WINDOW = 30;
const MAX_BATCH_SIZE = 50;
const MAX_MAP_SIZE = 3000;

function isBatchRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = batchRateLimitMap.get(key);

  if (entry && entry.resetAt >= now) {
    if (entry.count >= MAX_BATCH_REQUESTS_PER_WINDOW) return true;
    entry.count++;
    return false;
  }

  if (entry) batchRateLimitMap.delete(key);

  if (batchRateLimitMap.size >= MAX_MAP_SIZE) {
    const oldest = batchRateLimitMap.keys().next().value;
    if (oldest) batchRateLimitMap.delete(oldest);
  }

  batchRateLimitMap.set(key, { count: 1, resetAt: now + BATCH_RATE_LIMIT_WINDOW_MS });
  return false;
}

interface UserCadenceEntry {
  batchCount: number;
  firstRequestAt: number;
}
const userCadenceMap = new Map<string, UserCadenceEntry>();

function checkUserCadence(userId: string): boolean {
  const now = Date.now();
  const entry = userCadenceMap.get(userId);

  if (!entry || now - entry.firstRequestAt > 30000) {
    if (userCadenceMap.size >= MAX_MAP_SIZE) {
      const oldest = userCadenceMap.keys().next().value;
      if (oldest) userCadenceMap.delete(oldest);
    }
    userCadenceMap.set(userId, { batchCount: 1, firstRequestAt: now });
    return true;
  }

  entry.batchCount++;
  return entry.batchCount <= 10;
}


export async function POST(req: NextRequest) {
  try {
    const clientIp = extractTrustedClientIpFromHeaders(req.headers);

    if (isBatchRateLimited(`ip_${clientIp}`)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limite de pré-carregamento atingido. Aguarde alguns segundos.'
        },
        {
          status: 429,
          headers: { 'Retry-After': '15' }
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawIds = body.questionIds;
    const sessionTicket = body.sessionTicket;

    if (!Array.isArray(rawIds) || rawIds.length === 0) {
      return NextResponse.json({ success: true, resolutions: {}, count: 0 });
    }

    const validIds = rawIds
      .filter((id): id is string => typeof id === 'string' && validateQuestionId(id))
      .slice(0, MAX_BATCH_SIZE);

    if (validIds.length === 0) {
      return NextResponse.json({ success: true, resolutions: {}, count: 0 });
    }

    // 1. Identificar usuário autenticado
    let authenticatedUser: { id: string } | null = null;
    const supabaseAdmin = getSupabaseAdmin();

    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token.length > 20) {
        const { data: { user: authUser } } = await supabaseAdmin.auth.getUser(token);
        if (authUser) {
          authenticatedUser = { id: authUser.id };
        }
      }
    }

    if (!authenticatedUser) {
      try {
        const supabaseServer = await createSupabaseServerClient();
        const { data: { user: cookieUser } } = await supabaseServer.auth.getUser();
        if (cookieUser) {
          authenticatedUser = { id: cookieUser.id };
        }
      } catch {
        // visitante não autenticado
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Autenticação necessária para pré-carregamento em lote.',
          requiresAuth: true
        },
        { status: 401 }
      );
    }

    // 2. Blindagem de Paywall & Anti-Scraping: solve-batch é estritamente exclusivo para assinantes Pro/Premium ativos ou Admins
    const now = Date.now();
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, subscription_plan, subscription_status, subscription_expires_at')
      .eq('id', authenticatedUser.id)
      .maybeSingle();

    const plan = (profile?.subscription_plan || 'free').toLowerCase();
    const expiresAt = profile?.subscription_expires_at ? Date.parse(profile.subscription_expires_at) : 0;
    const isProActive = (plan === 'pro' || plan === 'premium')
      && profile?.subscription_status === 'active' && expiresAt > now;
    const isEligibleForBatch = isPrivilegedRole(profile?.role) || isProActive;

    if (!isEligibleForBatch) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pré-carregamento em lote disponível exclusivamente para assinantes Pro ou Premium.'
        },
        { status: 403 }
      );
    }

    // 3. Validação do Ticket de Sessão Criptografado (Session Binding estrito ao userId autenticado)
    const ticketVerification = verifySessionTicket(sessionTicket, validIds, authenticatedUser.id);
    if (!ticketVerification.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: ticketVerification.error || 'Ticket de sessão inválido ou expirado.'
        },
        { status: 403 }
      );
    }

    // 4. Telemetria de Cadência Humana
    if (!checkUserCadence(authenticatedUser.id) || isBatchRateLimited(`user_${authenticatedUser.id}`)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cadência de leitura inumana detectada. Por favor, aguarde alguns segundos antes de solicitar novos lotes.'
        },
        {
          status: 429,
          headers: { 'Retry-After': '10' }
        }
      );
    }

    interface QuestionBatchRow {
      id: string;
      code?: string;
      correct_answer?: string;
      is_anulada?: boolean;
      commentary?: string;
      options?: unknown[];
    }

    const rows = await findCanonicalQuestionsByIdsOrCodes<QuestionBatchRow>(
      supabaseAdmin,
      validIds,
      'id, code, correct_answer, is_anulada, commentary, options'
    );

    const resolutions: Record<
      string,
      {
        questionId: string;
        code: string;
        correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E' | 'ANULADA' | '';
        isAnulada: boolean;
        commentary: string;
        options: unknown[];
      }
    > = {};

    const userIdForWatermark = authenticatedUser.id;

    rows.forEach((row) => {
      const isAnulada = Boolean(row.is_anulada || row.correct_answer === 'ANULADA');
      const rawAnswer = (row.correct_answer || (isAnulada ? 'ANULADA' : '')).trim().toUpperCase();
      const validLetters = new Set(['A', 'B', 'C', 'D', 'E', 'ANULADA']);
      const correctAnswer = validLetters.has(rawAnswer)
        ? (rawAnswer as 'A' | 'B' | 'C' | 'D' | 'E' | 'ANULADA')
        : (isAnulada ? 'ANULADA' : '');

      const unpacked = unpackStructuredCommentary(row.commentary || '', Array.isArray(row.options) ? row.options : []);
      const watermarkedCommentary = injectZeroWidthWatermark(sanitizeMedicalText(unpacked.commentary), userIdForWatermark);
      const rawOptions = unpacked.options;
      const watermarkedOptions = rawOptions.map((opt: unknown) => {
        if (opt && typeof opt === 'object') {
          const optObj = opt as {
            text?: string;
            explanation?: string;
            justification?: string;
            [key: string]: unknown;
          };
          const nextOpt: Record<string, unknown> = { ...optObj };
          if (typeof optObj.text === 'string') {
            nextOpt.text = sanitizeMedicalText(optObj.text);
          }
          if (typeof optObj.explanation === 'string' && optObj.explanation.trim()) {
            nextOpt.explanation = injectZeroWidthWatermark(
              sanitizeMedicalText(optObj.explanation),
              userIdForWatermark
            );
          }
          if (typeof optObj.justification === 'string' && optObj.justification.trim()) {
            nextOpt.justification = injectZeroWidthWatermark(
              sanitizeMedicalText(optObj.justification),
              userIdForWatermark
            );
          }
          return nextOpt;
        }
        return opt;
      });

      resolutions[row.id] = {
        questionId: row.id,
        code: row.code || '',
        correctAnswer,
        isAnulada,
        commentary: watermarkedCommentary,
        options: watermarkedOptions
      };
    });

    return NextResponse.json({
      success: true,
      resolutions,
      count: Object.keys(resolutions).length
    });
  } catch (err: unknown) {
    console.error('[/api/questions/solve-batch] Exceção:', err);
    return NextResponse.json(
      { success: false, error: safeErrorMessage(err, 'Erro interno no pré-carregamento.') },
      { status: 500 }
    );
  }
}
