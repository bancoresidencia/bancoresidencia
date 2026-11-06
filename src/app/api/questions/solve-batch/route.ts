import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateQuestionId } from '@/utils/security';
import { verifySessionTicket } from '@/utils/securityTickets';
import { injectZeroWidthWatermark } from '@/utils/watermark';

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

// Telemetria de Cadência Humana (Behavioral Rate Limiter)
// Um médico/estudante leva no mínimo 30 a 90 segundos por questão.
// Solicitar mais de 5 lotes de 20 questões em 20 segundos é inumano (100 questões em 20s = 0,2s/questão).
interface UserCadenceEntry {
  batchCount: number;
  firstRequestAt: number;
}
const userCadenceMap = new Map<string, UserCadenceEntry>();

function checkUserCadence(userId: string): boolean {
  const now = Date.now();
  const entry = userCadenceMap.get(userId);

  // Janela calibrada para navegação rápida de estudantes (até 10 trocas de página em 30s)
  // Bloqueia apenas robôs de raspagem que disparam centenas de requisições por segundo
  if (!entry || now - entry.firstRequestAt > 30000) {
    userCadenceMap.set(userId, { batchCount: 1, firstRequestAt: now });
    return true;
  }

  entry.batchCount++;
  if (entry.batchCount > 10) {
    return false;
  }

  return true;
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
    const sessionTicket = body.sessionTicket;

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

    // 1. Identificar usuário autenticado (Fase 1.2: Rota em lote é exclusiva para alunos logados)
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

    // 2. Validação do Ticket de Sessão Criptografado (Fase 2: Session Binding)
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

    // 3. Telemetria de Cadência de Leitura Humana (Fase 4: Behavioral Limiter)
    if (!checkUserCadence(authenticatedUser.id)) {
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

    // 4. Consulta em lote no PostgreSQL via Primary Key (WHERE id = ANY(validIds))
    const { data, error } = await supabaseAdmin
      .from('questions')
      .select('id, code, correct_answer, is_anulada, commentary, options')
      .in('id', validIds);

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

    const userIdForWatermark = authenticatedUser.id;

    ((data || []) as QuestionBatchRow[]).forEach((row) => {
      const isAnulada = Boolean(row.is_anulada || row.correct_answer === 'ANULADA');
      const rawAnswer = (row.correct_answer || (isAnulada ? 'ANULADA' : '')).trim().toUpperCase();
      const validLetters = new Set(['A', 'B', 'C', 'D', 'E', 'ANULADA']);
      const correctAnswer = validLetters.has(rawAnswer)
        ? (rawAnswer as 'A' | 'B' | 'C' | 'D' | 'E' | 'ANULADA')
        : (isAnulada ? 'ANULADA' : '');

      // Injeção de Marca d'Água Esteganográfica Forense (Fase 3: Zero-Width Watermarking)
      const watermarkedCommentary = injectZeroWidthWatermark(row.commentary || '', userIdForWatermark);
      const rawOptions = Array.isArray(row.options) ? row.options : [];
      const watermarkedOptions = rawOptions.map((opt: unknown) => {
        if (opt && typeof opt === 'object' && 'justification' in opt) {
          const optObj = opt as { justification?: string; [key: string]: unknown };
          return {
            ...optObj,
            justification: injectZeroWidthWatermark(optObj.justification || '', userIdForWatermark)
          };
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
    const msg = err instanceof Error ? err.message : 'Erro interno';
    console.error('[/api/questions/solve-batch] Exceção:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
