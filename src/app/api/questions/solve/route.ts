import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateQuestionId, validateAnswerOption } from '@/utils/security';

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

// In-Memory Rate Limiter contra raspagem acelerada (Max 60 requisições por minuto por IP)
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Limpeza de entradas expiradas periodicamente
  if (rateLimitMap.size > 5000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count++;
  return false;
}


// Cota de Visitante Stateless com Cookie Assinado HMAC-SHA256 (Imune a reinicialização de lambdas Vercel)
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

function createSignedGuestQuotaCookie(questionIds: Set<string>): string {
  const todayStr = new Date().toISOString().slice(0, 10);
  const payload: GuestQuotaPayload = {
    date: todayStr,
    ids: Array.from(questionIds)
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getQuotaSecret())
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

// Rastreamento de cota diária de visitantes por IP contra evasão de login em aba anônima
interface GuestDailyQuota {
  date: string;
  questionIds: Set<string>;
}
const guestDailyQuotaMap = new Map<string, GuestDailyQuota>();

function checkGuestQuota(clientIp: string, questionId: string): { limitReached: boolean; count: number } {
  const todayStr = new Date().toISOString().slice(0, 10);
  let entry = guestDailyQuotaMap.get(clientIp);

  if (!entry || entry.date !== todayStr) {
    entry = { date: todayStr, questionIds: new Set<string>() };
    guestDailyQuotaMap.set(clientIp, entry);
  }

  // Limpeza preventiva de IPs antigos se mapa crescer
  if (guestDailyQuotaMap.size > 10000) {
    for (const [k, v] of guestDailyQuotaMap.entries()) {
      if (v.date !== todayStr) guestDailyQuotaMap.delete(k);
    }
  }

  // Se já respondeu esta questão hoje, permite rever/re-tentar
  if (entry.questionIds.has(questionId)) {
    return { limitReached: false, count: entry.questionIds.size };
  }

  if (entry.questionIds.size >= 10) {
    return { limitReached: true, count: entry.questionIds.size };
  }

  return { limitReached: false, count: entry.questionIds.size };
}

function recordGuestSolve(clientIp: string, questionId: string) {
  const todayStr = new Date().toISOString().slice(0, 10);
  let entry = guestDailyQuotaMap.get(clientIp);
  if (!entry || entry.date !== todayStr) {
    entry = { date: todayStr, questionIds: new Set<string>() };
    guestDailyQuotaMap.set(clientIp, entry);
  }
  entry.questionIds.add(questionId);
}

// Cache em memória no Serverless Edge com TTL de 30 minutos para gabaritos
interface CachedQuestionData {
  id: string;
  code: string;
  correct_answer: string;
  is_anulada: boolean;
  commentary: string;
  options: unknown[];
  especialidade?: string | null;
  tema?: string | null;
  foco?: string | null;
  subfoco?: string | null;
  difficulty?: string | null;
  banca?: string | null;
  year?: number | null;
  cachedAt: number;
}
const questionCache = new Map<string, CachedQuestionData>();
const CACHE_TTL_MS = 30 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    // 1. Verificação de Rate Limit por IP contra raspagem
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown-ip';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limite de resolução temporariamente atingido. Aguarde alguns segundos.'
        },
        {
          status: 429,
          headers: { 'Retry-After': '15' }
        }
      );
    }

    const body = await req.json();
    const {
      questionId,
      selectedOption,
      isPrefetch = false,
      attempts,
      studentNotes,
      errorReason,
      statusRetrial
    } = body;

    // 2. Validação estrita do ID
    if (!questionId || !validateQuestionId(questionId)) {
      return NextResponse.json(
        { success: false, error: 'ID de questão inválido ou ausente.' },
        { status: 400 }
      );
    }

    // 3. Validação da alternativa se informada
    if (selectedOption !== undefined && selectedOption !== null && selectedOption !== '') {
      if (!validateAnswerOption(selectedOption)) {
        return NextResponse.json(
          { success: false, error: 'Alternativa informada inválida.' },
          { status: 400 }
        );
      }
    }

    const now = Date.now();
    let row: CachedQuestionData | {
      id: string;
      code?: string;
      correct_answer?: string;
      is_anulada?: boolean;
      commentary?: string;
      options?: unknown[];
      especialidade?: string | null;
      tema?: string | null;
      foco?: string | null;
      subfoco?: string | null;
      difficulty?: string | null;
      banca?: string | null;
      year?: number | null;
    } | null = null;

    // 4. Cache em memória ultra-rápido (0ms)
    const cached = questionCache.get(questionId);
    if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
      row = cached;
    } else {
      const supabaseAdmin = getSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from('questions')
        .select('id, code, correct_answer, is_anulada, commentary, options, especialidade, tema, foco, subfoco, difficulty, banca, year')
        .eq('id', questionId)
        .maybeSingle();

      if (!data && !error) {
        const byCodeRes = await supabaseAdmin
          .from('questions')
          .select('id, code, correct_answer, is_anulada, commentary, options, especialidade, tema, foco, subfoco, difficulty, banca, year')
          .eq('code', questionId)
          .maybeSingle();
        if (byCodeRes.error) {
          console.error('[API Solve] Erro ao consultar questão por código:', byCodeRes.error);
        }
        row = byCodeRes.data;
      } else {
        row = data;
      }

      if (error) {
        console.error('[API Solve] Erro ao consultar questão:', error);
        return NextResponse.json({ success: false, error: 'Erro no banco de dados.' }, { status: 500 });
      }

      if (row) {
        const cacheEntry: CachedQuestionData = {
          id: row.id,
          code: row.code || '',
          correct_answer: row.correct_answer || '',
          is_anulada: Boolean(row.is_anulada),
          commentary: row.commentary || '',
          options: Array.isArray(row.options) ? row.options : [],
          especialidade: row.especialidade || null,
          tema: row.tema || null,
          foco: row.foco || null,
          subfoco: row.subfoco || null,
          difficulty: row.difficulty || null,
          banca: row.banca || null,
          year: row.year ? Number(row.year) : null,
          cachedAt: now
        };
        questionCache.set(row.id, cacheEntry);
        if (row.code) {
          questionCache.set(row.code, cacheEntry);
        }
      }
    }

    if (!row) {
      return NextResponse.json(
        { success: false, error: 'Questão não encontrada no sistema.' },
        { status: 404 }
      );
    }

    const isAnulada = Boolean(row.is_anulada || row.correct_answer === 'ANULADA');
    const goldAnswer = (row.correct_answer || (isAnulada ? 'ANULADA' : '')).trim().toUpperCase();
    const isCorrect = isAnulada ? true : (goldAnswer ? selectedOption.toUpperCase() === goldAnswer : false);

    // Fast-Path Instantâneo para Prefetch (< 25ms): devolve gabarito e justificativa imediatamente,
    // sem chamadas redundantes a Auth/Quota/Upsert, enquanto o aluno lê as opções
    if (isPrefetch) {
      return NextResponse.json({
        success: true,
        isPrefetch: true,
        questionId: row.id,
        correctAnswer: row.correct_answer || (isAnulada ? 'ANULADA' : ''),
        isAnulada,
        isCorrect,
        commentary: row.commentary || '',
        options: row.options || []
      });
    }

    // 5. Verificação de Autenticação e Cota Diária (Plano Gratuito / Visitantes)
    let authenticatedUser: { id: string } | null = null;
    const supabaseAdmin = getSupabaseAdmin();

    // 5.1 Identificar usuário autenticado via Bearer Token (Header)
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: authUser } } = await supabaseAdmin.auth.getUser(token);
      if (authUser) {
        authenticatedUser = { id: authUser.id };
      }
    }

    // 5.2 Se não encontrou no header, verifica cookies de sessão
    if (!authenticatedUser) {
      try {
        const supabaseServer = await createSupabaseServerClient();
        const { data: { user: cookieUser } } = await supabaseServer.auth.getUser();
        if (cookieUser) {
          authenticatedUser = { id: cookieUser.id };
        }
      } catch {
        // Sem cookies de sessão
      }
    }

    // 5.3 Validação de plano e contagem diária no Supabase (apenas em confirmação oficial, prefetch não bloqueia nem debita)
    if (!isPrefetch && authenticatedUser) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role, subscription_plan, subscription_status, subscription_expires_at')
        .eq('id', authenticatedUser.id)
        .maybeSingle();

      const userRole = (profile?.role || '').toLowerCase();
      const isAdminOrCurator = Boolean(
        userRole === 'admin' ||
        userRole === 'curator' ||
        userRole === 'curador' ||
        userRole === 'superadmin'
      );

      const plan = (profile?.subscription_plan || 'free').toLowerCase();
      const status = profile?.subscription_status || 'inactive';
      const expiresAt = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at).getTime() : null;
      const isNotExpired = expiresAt === null || expiresAt > now;
      const isProOrPremium = Boolean((plan === 'pro' || plan === 'premium') && status === 'active' && isNotExpired);

      const isUnlimitedPlan = isAdminOrCurator || isProOrPremium;

      // Se for plano gratuito, verifica o limite estrito de 10 questões/dia
      if (!isUnlimitedPlan) {
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const startIso = startOfDay.toISOString();

        const { count, error: countErr } = await supabaseAdmin
          .from('user_answers')
          .select('question_id', { count: 'exact', head: true })
          .eq('user_id', authenticatedUser.id)
          .gte('answered_at', startIso);

        const dailyCount = count || 0;

        if (dailyCount >= 10) {
          // Checa se esta questão específica já foi respondida hoje pelo usuário (permite rever/re-tentar)
          const { data: alreadySolvedToday } = await supabaseAdmin
            .from('user_answers')
            .select('question_id')
            .eq('user_id', authenticatedUser.id)
            .eq('question_id', row.id)
            .gte('answered_at', startIso)
            .maybeSingle();

          if (!alreadySolvedToday) {
            return NextResponse.json(
              {
                success: false,
                limitReached: true,
                error: 'Limite diário de 10 questões atingido no plano Gratuito. Faça upgrade para o Pro para continuar resolvendo sem limites.',
                dailyResolvedCount: dailyCount
              },
              { status: 403 }
            );
          }
        }
      }
    } else if (!isPrefetch) {
      // 5.4 Visitante não autenticado: verificação via cookie criptográfico assinado + fallback por IP
      const guestQuota = parseAndVerifyGuestQuotaCookie(req.cookies.get('br_guest_quota')?.value);
      const guestCheck = checkGuestQuota(clientIp, row.id);

      const hasSolvedInCookie = guestQuota.questionIds.has(row.id);
      const isOverLimit = (guestQuota.questionIds.size >= 10 || guestCheck.limitReached) && !hasSolvedInCookie;

      if (isOverLimit) {
        return NextResponse.json(
          {
            success: false,
            limitReached: true,
            error: 'Limite diário de 10 questões para visitantes atingido. Crie sua conta ou faça login para continuar resolvendo.',
            dailyResolvedCount: Math.max(guestQuota.questionIds.size, guestCheck.count)
          },
          { status: 403 }
        );
      }
    }

    // 6. Confirmação da escolha do aluno
    const studentChoice = typeof selectedOption === 'string' ? selectedOption.trim().toUpperCase() : '';

    const serverNow = new Date().toISOString();

    // 7. Sincronização em background com metadados clínicos completos (apenas em confirmação oficial, NUNCA no prefetch)
    if (!isPrefetch && studentChoice && row.id) {
      if (authenticatedUser) {
        const targetUserId = authenticatedUser.id;
        const targetQuestionId = row.id;
        const targetChoice = studentChoice;
        const targetIsCorrect = isCorrect;
        const finalStatusRetrial = statusRetrial || (targetIsCorrect ? 'recuperado' : 'pendente');

        // Persistência com await garantido: previne congelamento prematuro de lambdas na Vercel
        try {
          // Reconciliação Monotônica de Tentativas: busca tentativas anteriores para não apagar histórico
          let finalAttempts = Array.isArray(attempts) && attempts.length > 0
            ? attempts
            : [{ letter: targetChoice, isCorrect: targetIsCorrect, timestamp: Date.now() }];

          const { data: existingRow } = await supabaseAdmin
            .from('user_answers')
            .select('attempts')
            .eq('user_id', targetUserId)
            .eq('question_id', targetQuestionId)
            .maybeSingle();

          if (existingRow && Array.isArray(existingRow.attempts) && existingRow.attempts.length > 0) {
            const combinedMap = new Map<string, any>();
            for (const att of existingRow.attempts) {
              if (att && att.timestamp) combinedMap.set(`${att.timestamp}_${att.letter}`, att);
            }
            for (const att of finalAttempts) {
              if (att && att.timestamp) combinedMap.set(`${att.timestamp}_${att.letter}`, att);
            }
            finalAttempts = Array.from(combinedMap.values()).sort((a, b) => a.timestamp - b.timestamp);
          }

          await supabaseAdmin.from('user_answers').upsert(
            {
              user_id: targetUserId,
              question_id: targetQuestionId,
              selected_option: targetChoice,
              is_correct: targetIsCorrect,
              answered_at: serverNow,
              specialty: row.especialidade || null,
              tema: row.tema || null,
              foco: row.foco || null,
              subfoco: row.subfoco || null,
              difficulty: row.difficulty || null,
              banca: row.banca || null,
              year: row.year ? Number(row.year) : null,
              attempts: finalAttempts,
              student_notes: studentNotes || null,
              error_reason: errorReason || null,
              status_retrial: finalStatusRetrial
            },
            { onConflict: 'user_id,question_id' }
          );
        } catch (authSyncErr) {
          console.warn('[API Solve] Erro ao persistir resposta no banco:', authSyncErr);
        }
      } else {
        recordGuestSolve(clientIp, row.id);
      }
    }

    // Resposta imediata em poucos milissegundos
    const responseObj = NextResponse.json({
      success: true,
      isPrefetch: Boolean(isPrefetch),
      answeredAt: serverNow,
      limitReached: false,
      questionId: row.id,
      correctAnswer: goldAnswer,
      isAnulada,
      isCorrect,
      commentary: row.commentary || '',
      options: Array.isArray(row.options) ? row.options : []
    });

    // Se for confirmação oficial de visitante, atualiza o cookie assinado inviolável
    if (!authenticatedUser && !isPrefetch && row.id) {
      const guestQuota = parseAndVerifyGuestQuotaCookie(req.cookies.get('br_guest_quota')?.value);
      guestQuota.questionIds.add(row.id);
      const signedCookie = createSignedGuestQuotaCookie(guestQuota.questionIds);
      responseObj.cookies.set('br_guest_quota', signedCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 * 2,
        path: '/'
      });
    }

    return responseObj;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno do servidor';
    console.error('[API Solve] Exceção:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
