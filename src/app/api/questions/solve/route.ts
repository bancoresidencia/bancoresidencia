import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { isRateLimited } from '@/lib/rateLimiter';
import {
  validateQuestionId,
  UUID_REGEX,
  isPrivilegedRole,
  extractTrustedClientIp,
  safeErrorMessage
} from '@/utils/security';
import { deriveDomainSecret } from '@/utils/serverCrypto';
import {
  formatWatermarkedResolution,
  getOrFetchCachedQuestion,
  resolveAuthenticatedUser
} from '@/lib/serverQuestionCache';

export const dynamic = 'force-dynamic';

const VALID_STUDENT_CHOICES = new Set(['A', 'B', 'C', 'D', 'E']);

// Rate limiter delegado ao módulo centralizado (Supabase-backed, serverless-safe)
// Ver src/lib/rateLimiter.ts
const RATE_LIMIT_WINDOW_S = 60;
const MAX_REQUESTS_PER_WINDOW = 60;

function extractClientIp(req: NextRequest): string {
  return extractTrustedClientIp(req);
}

// Cota de Visitante Stateless com Cookie Assinado HMAC-SHA256 (validação constant-time)
interface GuestQuotaPayload {
  date: string;
  ids: string[];
}

function getQuotaSecret(): Buffer {
  const secret = process.env.GUEST_QUOTA_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('GUEST_QUOTA_SECRET é obrigatório em produção.');
    }
    return deriveDomainSecret('bancoresidencia-dev-guest-quota-secret-key-32b', 'guest-quota-cookie-hmac-v1');
  }
  return deriveDomainSecret(secret, 'guest-quota-cookie-hmac-v1');
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

    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expectedSignature, 'utf8');
    if (sigBuf.byteLength !== expBuf.byteLength || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { date: todayStr, questionIds: new Set<string>() };
    }

    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const parsed: GuestQuotaPayload = JSON.parse(jsonStr);

    if (parsed.date !== todayStr || !Array.isArray(parsed.ids)) {
      return { date: todayStr, questionIds: new Set<string>() };
    }

    return { date: todayStr, questionIds: new Set(parsed.ids.slice(0, 50)) };
  } catch {
    return { date: todayStr, questionIds: new Set<string>() };
  }
}

function createSignedGuestQuotaCookie(questionIds: Set<string>): string {
  const todayStr = new Date().toISOString().slice(0, 10);
  const payload: GuestQuotaPayload = {
    date: todayStr,
    ids: Array.from(questionIds).slice(0, 50)
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getQuotaSecret())
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = extractClientIp(req);
    const supabaseAdmin = getSupabaseAdmin();

    // Estágio 1 em paralelo: rate limit por IP, parse do payload e identificação do usuário
    const [ipLimited, body, authenticatedUser] = await Promise.all([
      isRateLimited('solve_ip', clientIp, MAX_REQUESTS_PER_WINDOW, RATE_LIMIT_WINDOW_S),
      req.json().catch(() => null),
      resolveAuthenticatedUser(req, supabaseAdmin)
    ]);

    if (ipLimited) {
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

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Requisição inválida.' }, { status: 400 });
    }

    const {
      questionId, selectedOption, isPrefetch = false, studentNotes, errorReason,
      attemptId, writtenAnswer, readResolution, reviewed
    } = body as Record<string, unknown>;
    const readOnly = readResolution === true;
    const written = typeof writtenAnswer === 'string' ? writtenAnswer.trim() : null;
    if ((writtenAnswer !== undefined && (!written || written.length > 12000))
      || (attemptId !== undefined && (typeof attemptId !== 'string' || !UUID_REGEX.test(attemptId)))
      || (isPrefetch && (readOnly || written !== null))) {
      return NextResponse.json({ success: false, error: 'Resposta ou tentativa inválida.' }, { status: 400 });
    }

    // 1. Validação estrita do ID da questão
    if (typeof questionId !== 'string' || !questionId || !validateQuestionId(questionId)) {
      return NextResponse.json(
        { success: false, error: 'ID de questão inválido ou ausente.' },
        { status: 400 }
      );
    }

    // 2. Validação obrigatória de alternativa A-E em confirmações reais (impede bypass de débito na cota!)
    const studentChoice = typeof selectedOption === 'string' ? selectedOption.trim().toUpperCase() : '';
    if (!readOnly && written === null && !VALID_STUDENT_CHOICES.has(studentChoice)) {
      return NextResponse.json(
        { success: false, error: 'Selecione uma alternativa válida (A a E) para resolver a questão.' },
        { status: 400 }
      );
    }

    const now = Date.now();

    // Estágio 2 em paralelo: rate limit do usuário, verificação de plano e busca da questão (cache compartilhado)
    const [userLimited, profileResult, row] = await Promise.all([
      authenticatedUser
        ? isRateLimited('solve_user', authenticatedUser.id, MAX_REQUESTS_PER_WINDOW, RATE_LIMIT_WINDOW_S)
        : Promise.resolve(false),
      authenticatedUser
        ? supabaseAdmin
            .from('profiles')
            .select('role, subscription_plan, subscription_status, subscription_expires_at')
            .eq('id', authenticatedUser.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      getOrFetchCachedQuestion(supabaseAdmin, questionId, now)
    ]);

    if (userLimited) {
      return NextResponse.json(
        { success: false, error: 'Cadência de resolução acima do limite permitido. Aguarde alguns segundos.' },
        { status: 429, headers: { 'Retry-After': '15' } }
      );
    }

    // Verificação de Plano e Elegibilidade (CRÍTICO: executado ANTES de qualquer entrega de gabarito!)
    let isUnlimitedPlan = false;
    if (authenticatedUser && profileResult.data) {
      const profile = profileResult.data;
      const isAdminOrCurator = isPrivilegedRole(profile?.role);
      const plan = (profile?.subscription_plan || 'free').toLowerCase();
      const status = profile?.subscription_status || 'inactive';
      const expiresAt = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at).getTime() : null;
      const isNotExpired = expiresAt !== null ? expiresAt > now : false;
      const isProOrPremium = Boolean((plan === 'pro' || plan === 'premium') && status === 'active' && isNotExpired);

      isUnlimitedPlan = isAdminOrCurator || isProOrPremium;
    }

    // Blindagem Anti-Scraping & Paywall: isPrefetch é exclusivo para assinantes Pro/Premium ativos!
    if (isPrefetch && !isUnlimitedPlan) {
      return NextResponse.json(
        {
          success: false,
          requiresConfirmation: true,
          error: 'Confirme a resposta no botão Resolver para liberar o gabarito.'
        },
        { status: 200 }
      );
    }

    if (!row) {
      return NextResponse.json(
        { success: false, error: 'Questão não encontrada no sistema.' },
        { status: 404 }
      );
    }

    const isWrittenQuestion = ['dissertativa', 'discursiva'].includes(row.type.trim().toLowerCase());
    if (!readOnly && !isPrefetch && isWrittenQuestion !== (written !== null)) {
      return NextResponse.json({ success: false, error: 'Informe a resposta no formato da questão.' }, { status: 400 });
    }

    let savedWrittenAnswer: string | null = null;
    if (readOnly) {
      const guestCookie = parseAndVerifyGuestQuotaCookie(req.cookies.get('br_guest_quota')?.value);
      if (authenticatedUser) {
        const { data: answer, error } = await supabaseAdmin.from('user_answers')
          .select('written_answer').eq('user_id', authenticatedUser.id).eq('question_id', row.id).maybeSingle();
        if (error) return NextResponse.json({ success: false, error: 'Não foi possível carregar a resposta.' }, { status: 503 });
        if (!answer || (isWrittenQuestion && !answer.written_answer)) {
          return NextResponse.json({ success: false, error: 'Nenhuma resposta registrada.' }, { status: 404 });
        }
        savedWrittenAnswer = answer.written_answer;
      } else if (!guestCookie.questionIds.has(row.id)) {
        return NextResponse.json({ success: false, error: 'Nenhuma resposta registrada.' }, { status: 404 });
      }
    }

    const isAnulada = Boolean(row.is_anulada || row.correct_answer === 'ANULADA');
    const goldAnswer = (row.correct_answer || (isAnulada ? 'ANULADA' : '')).trim().toUpperCase();
    const isCorrect = written === null && (isAnulada || (Boolean(goldAnswer) && studentChoice === goldAnswer));

    // Cota diária estrita de 10 questões/dia para visitantes (Dual-Layer: Cookie HMAC + IP no Supabase)
    if (!authenticatedUser && !readOnly) {
      const guestQuota = parseAndVerifyGuestQuotaCookie(req.cookies.get('br_guest_quota')?.value);
      const hasSolvedInCookie = guestQuota.questionIds.has(row.id);

      if (guestQuota.questionIds.size >= 10 && !hasSolvedInCookie) {
        return NextResponse.json(
          {
            success: false,
            limitReached: true,
            error: 'Limite diário de 10 questões para visitantes atingido. Crie sua conta gratuita ou faça login para continuar resolvendo.',
            dailyResolvedCount: guestQuota.questionIds.size
          },
          { status: 403 }
        );
      }

      if (!hasSolvedInCookie) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const ipHash = crypto.createHash('sha256').update(clientIp + todayStr).digest('hex').slice(0, 16);
        const isIpDailyQuotaExceeded = await isRateLimited(
          'guest_solve_quota',
          `${ipHash}_${todayStr}`,
          10,
          86400
        );

        if (isIpDailyQuotaExceeded) {
          return NextResponse.json(
            {
              success: false,
              limitReached: true,
              error: 'Limite diário de 10 questões para visitantes atingido. Crie sua conta gratuita ou faça login para continuar resolvendo.',
              dailyResolvedCount: 10
            },
            { status: 403 }
          );
        }
      }
    }

    // Fast-Path de Prefetch (exclusivo para assinantes Pro/Premium/Admin já validados acima)
    if (isPrefetch && authenticatedUser) {
      const formatted = formatWatermarkedResolution(row.commentary || '', row.options, authenticatedUser.id);
      return NextResponse.json({
        success: true,
        isPrefetch: true,
        questionId: row.id,
        correctAnswer: row.correct_answer || (isAnulada ? 'ANULADA' : ''),
        isAnulada,
        isCorrect,
        commentary: formatted.commentary,
        options: formatted.options
      });
    }

    let serverNow = new Date().toISOString();
    if (authenticatedUser && !readOnly) {
      const { data: persisted, error } = await supabaseAdmin.rpc('persist_study_answer', {
        p_student_id: authenticatedUser.id,
        p_question_id: row.id,
        p_attempt_id: typeof attemptId === 'string' ? attemptId : crypto.randomUUID(),
        p_daily_limit: isUnlimitedPlan ? null : 10,
        p_answer: {
          selected_option: written === null ? studentChoice : null,
          written_answer: written,
          is_correct: isCorrect,
          reviewed: reviewed === true,
          specialty: row.especialidade, tema: row.tema, foco: row.foco, subfoco: row.subfoco,
          difficulty: row.difficulty, banca: row.banca, year: row.year,
          student_notes: typeof studentNotes === 'string' ? studentNotes.slice(0, 4000) : undefined,
          error_reason: typeof errorReason === 'string' ? errorReason.slice(0, 120) : undefined
        }
      });
      if (error || !persisted) {
        console.error('[API Solve] Falha ao persistir resposta:', error?.code);
        return NextResponse.json({ success: false, error: 'Não foi possível salvar a resposta. Tente novamente.' }, { status: 503 });
      }
      if (!persisted.accepted) {
        return NextResponse.json({
          success: false, limitReached: true, dailyResolvedCount: 10,
          error: 'Limite diário de 10 questões atingido no plano Gratuito.'
        }, { status: 403 });
      }
      serverNow = persisted.answered_at;
    }

    const watermarkId = authenticatedUser?.id || clientIp;
    const formatted = formatWatermarkedResolution(row.commentary || '', row.options, watermarkId);

    const responseObj = NextResponse.json({
      success: true,
      isPrefetch: false,
      answeredAt: serverNow,
      writtenAnswer: savedWrittenAnswer ?? written,
      limitReached: false,
      questionId: row.id,
      correctAnswer: goldAnswer,
      isAnulada,
      isCorrect,
      commentary: formatted.commentary,
      options: formatted.options
    });

    if (!authenticatedUser && row.id && !readOnly) {
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
    console.error('[API Solve] Exceção:', err);
    return NextResponse.json(
      { success: false, error: safeErrorMessage(err, 'Erro interno ao processar resposta.') },
      { status: 500 }
    );
  }
}
