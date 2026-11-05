import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateQuestionId } from '@/utils/security';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createSupabaseAdminClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

// In-Memory Rate Limiter contra abuso de lotes (Max 40 requisições de batch por minuto por IP)
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const batchRateLimitMap = new Map<string, RateLimitEntry>();
const BATCH_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_BATCH_REQUESTS_PER_WINDOW = 40;
const MAX_BATCH_SIZE = 60;

function isBatchRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = batchRateLimitMap.get(ip);

  if (batchRateLimitMap.size > 5000) {
    for (const [key, val] of batchRateLimitMap.entries()) {
      if (val.resetAt < now) {
        batchRateLimitMap.delete(key);
      }
    }
  }

  if (!entry || entry.resetAt < now) {
    batchRateLimitMap.set(ip, { count: 1, resetAt: now + BATCH_RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_BATCH_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count++;
  return false;
}

// Cota de Visitante Stateless com Cookie Assinado HMAC-SHA256
interface GuestQuotaPayload {
  date: string;
  ids: string[];
}

function getQuotaSecret(): string {
  const secret = process.env.GUEST_QUOTA_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('GUEST_QUOTA_SECRET ou SUPABASE_SERVICE_ROLE_KEY obrigatório em produção.');
    }
    return 'bancoresidencia-dev-guest-quota-secret-key-32b';
  }
  return secret;
}

function parseAndVerifyGuestQuotaCookie(cookieValue?: string | null): { date: string; questionIds: Set<string> } {
  const todayStr = new Date().toISOString().slice(0, 10);
  if (!cookieValue) {
    return { date: todayStr, questionIds: new Set<string>() };
  }

  try {
    const parts = cookieValue.split('.');
    if (parts.length !== 2) {
      return { date: todayStr, questionIds: new Set<string>() };
    }
    const [payloadB64, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', getQuotaSecret())
      .update(payloadB64)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return { date: todayStr, questionIds: new Set<string>() };
    }

    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const parsed: GuestQuotaPayload = JSON.parse(jsonStr);

    if (parsed.date !== todayStr || !Array.isArray(parsed.ids)) {
      return { date: todayStr, questionIds: new Set<string>() };
    }

    return { date: todayStr, questionIds: new Set(parsed.ids) };
  } catch {
    return { date: todayStr, questionIds: new Set<string>() };
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown-ip';

    if (isBatchRateLimited(clientIp)) {
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

    if (!Array.isArray(rawIds) || rawIds.length === 0) {
      return NextResponse.json({ success: true, resolutions: {}, count: 0 });
    }

    // Validação estrita de cada ID e limite por requisição
    const validIds = rawIds
      .filter((id): id is string => typeof id === 'string' && validateQuestionId(id))
      .slice(0, MAX_BATCH_SIZE);

    if (validIds.length === 0) {
      return NextResponse.json({ success: true, resolutions: {}, count: 0 });
    }

    // 1. Identificar se o usuário está autenticado
    let authenticatedUser: { id: string } | null = null;
    const supabaseAdmin = getSupabaseAdmin();

    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: authUser } } = await supabaseAdmin.auth.getUser(token);
      if (authUser) {
        authenticatedUser = { id: authUser.id };
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

    // 2. Para visitantes, respeitar a cota diária de 10 questões
    let allowedIds = validIds;
    let guestLimitReached = false;

    if (!authenticatedUser) {
      const quotaCookie = req.cookies.get('br_guest_quota_v1')?.value;
      const { questionIds: guestSolvedToday } = parseAndVerifyGuestQuotaCookie(quotaCookie);
      const guestUsedCount = guestSolvedToday.size;
      const guestRemainingQuota = Math.max(0, 10 - guestUsedCount);

      if (guestRemainingQuota === 0) {
        guestLimitReached = true;
        // Se a cota já expirou, permite rever apenas as questões que o visitante já respondeu hoje
        allowedIds = validIds.filter((id) => guestSolvedToday.has(id));
      } else {
        // Permite carregar até a cota restante
        const alreadyAnswered = validIds.filter((id) => guestSolvedToday.has(id));
        const newQuestions = validIds.filter((id) => !guestSolvedToday.has(id));
        const allowedNew = newQuestions.slice(0, guestRemainingQuota);
        allowedIds = [...alreadyAnswered, ...allowedNew];
        if (newQuestions.length > guestRemainingQuota) {
          guestLimitReached = true;
        }
      }
    }

    if (allowedIds.length === 0) {
      return NextResponse.json({
        success: true,
        resolutions: {},
        count: 0,
        guestLimitReached: true
      });
    }

    // 3. Consulta em lote no PostgreSQL via Primary Key (WHERE id = ANY(allowedIds))
    const { data, error } = await supabaseAdmin
      .from('questions')
      .select('id, code, correct_answer, is_anulada, commentary, options')
      .in('id', allowedIds);

    if (error) {
      console.error('[/api/questions/solve-batch] Erro no Supabase:', error.message || error);
      return NextResponse.json(
        { success: false, error: 'Erro ao carregar lote de resoluções.' },
        { status: 500 }
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

    ((data || []) as QuestionBatchRow[]).forEach((row) => {
      const isAnulada = Boolean(row.is_anulada || row.correct_answer === 'ANULADA');
      const rawAnswer = (row.correct_answer || (isAnulada ? 'ANULADA' : '')).trim().toUpperCase();
      const validLetters = new Set(['A', 'B', 'C', 'D', 'E', 'ANULADA']);
      const correctAnswer = validLetters.has(rawAnswer)
        ? (rawAnswer as 'A' | 'B' | 'C' | 'D' | 'E' | 'ANULADA')
        : (isAnulada ? 'ANULADA' : '');

      resolutions[row.id] = {
        questionId: row.id,
        code: row.code || '',
        correctAnswer,
        isAnulada,
        commentary: row.commentary || '',
        options: Array.isArray(row.options) ? row.options : []
      };
    });

    return NextResponse.json({
      success: true,
      resolutions,
      count: Object.keys(resolutions).length,
      guestLimitReached
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    console.error('[/api/questions/solve-batch] Exceção:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

