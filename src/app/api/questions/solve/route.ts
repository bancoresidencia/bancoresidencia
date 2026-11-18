import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { validateQuestionId, isPrivilegedRole } from '@/utils/security';
import { injectZeroWidthWatermark } from '@/utils/watermark';
import { sanitizeMedicalText, unpackStructuredCommentary } from '@/utils/textSanitizer';
import { findCanonicalQuestionByIdOrCode } from '@/services/canonicalQuestionStore';

export const dynamic = 'force-dynamic';

const VALID_STUDENT_CHOICES = new Set(['A', 'B', 'C', 'D', 'E']);

// In-Memory Rate Limiter com teto FIFO contra raspagem acelerada e OOM (Max 60 req/min por IP)
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;
const MAX_MAP_ENTRIES = 5000;

function extractClientIp(req: NextRequest): string {
  const vercelIp = req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
  if (vercelIp) return vercelIp;
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return 'unknown-ip';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (entry && entry.resetAt >= now) {
    if (entry.count >= MAX_REQUESTS_PER_WINDOW) return true;
    entry.count++;
    return false;
  }

  if (entry) rateLimitMap.delete(key);

  if (rateLimitMap.size >= MAX_MAP_ENTRIES) {
    let evicted = 0;
    for (const [k, val] of rateLimitMap.entries()) {
      if (val.resetAt < now || evicted < 250) {
        rateLimitMap.delete(k);
        evicted++;
        if (rateLimitMap.size < MAX_MAP_ENTRIES - 250) break;
      }
    }
  }

  rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  return false;
}

// Cota de Visitante Stateless com Cookie Assinado HMAC-SHA256 (validação constant-time)
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

interface GuestDailyQuota {
  date: string;
  questionIds: Set<string>;
}
const guestDailyQuotaMap = new Map<string, GuestDailyQuota>();

function checkGuestQuota(clientIp: string, questionId: string): { limitReached: boolean; count: number } {
  const todayStr = new Date().toISOString().slice(0, 10);
  let entry = guestDailyQuotaMap.get(clientIp);

  if (!entry || entry.date !== todayStr) {
    if (guestDailyQuotaMap.size >= MAX_MAP_ENTRIES) {
      const oldestKey = guestDailyQuotaMap.keys().next().value;
      if (oldestKey) guestDailyQuotaMap.delete(oldestKey);
    }
    entry = { date: todayStr, questionIds: new Set<string>() };
    guestDailyQuotaMap.set(clientIp, entry);
  }

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
    const clientIp = extractClientIp(req);

    if (isRateLimited(`ip_${clientIp}`)) {
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

    // 1. Validação estrita do ID da questão
    if (!questionId || !validateQuestionId(questionId)) {
      return NextResponse.json(
        { success: false, error: 'ID de questão inválido ou ausente.' },
        { status: 400 }
      );
    }

    // 2. Validação obrigatória de alternativa A-E em confirmações reais (impede bypass de débito na cota!)
    const studentChoice = typeof selectedOption === 'string' ? selectedOption.trim().toUpperCase() : '';
    if (!VALID_STUDENT_CHOICES.has(studentChoice)) {
      return NextResponse.json(
        { success: false, error: 'Selecione uma alternativa válida (A a E) para resolver a questão.' },
        { status: 400 }
      );
    }

    // 3. Verificação de Identidade (Bearer Token ou Cookies SSR) ANTES de qualquer acesso a gabaritos
    let authenticatedUser: { id: string; appRole?: string } | null = null;
    const supabaseAdmin = getSupabaseAdmin();

    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token.length > 20) {
        const { data: { user: authUser } } = await supabaseAdmin.auth.getUser(token);
        if (authUser) {
          authenticatedUser = { id: authUser.id, appRole: authUser.app_metadata?.role as string | undefined };
        }
      }
    }

    if (!authenticatedUser) {
      try {
        const supabaseServer = await createSupabaseServerClient();
        const { data: { user: cookieUser } } = await supabaseServer.auth.getUser();
        if (cookieUser) {
          authenticatedUser = { id: cookieUser.id, appRole: cookieUser.app_metadata?.role as string | undefined };
        }
      } catch {
        // visitante não autenticado
      }
    }

    if (authenticatedUser && isRateLimited(`user_${authenticatedUser.id}`)) {
      return NextResponse.json(
        { success: false, error: 'Cadência de resolução acima do limite permitido. Aguarde alguns segundos.' },
        { status: 429, headers: { 'Retry-After': '15' } }
      );
    }

    const now = Date.now();

    // 4. Verificação de Plano e Elegibilidade (CRÍTICO: executado ANTES do fast-path isPrefetch!)
    let isUnlimitedPlan = false;
    if (authenticatedUser) {
      if (isPrivilegedRole(authenticatedUser.appRole)) {
        isUnlimitedPlan = true;
      } else {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role, subscription_plan, subscription_status, subscription_expires_at')
          .eq('id', authenticatedUser.id)
          .maybeSingle();

        const isAdminOrCurator = isPrivilegedRole(profile?.role);
        const plan = (profile?.subscription_plan || 'free').toLowerCase();
        const status = profile?.subscription_status || 'inactive';
        const expiresAt = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at).getTime() : null;
        // Exige data de expiração válida no futuro para planos pagos (ou admin/curador isento)
        const isNotExpired = expiresAt !== null ? expiresAt > now : false;
        const isProOrPremium = Boolean((plan === 'pro' || plan === 'premium') && status === 'active' && isNotExpired);

        isUnlimitedPlan = isAdminOrCurator || isProOrPremium;
      }
    }

    // 4.1 Blindagem Anti-Scraping & Paywall: isPrefetch é exclusivo para assinantes Pro/Premium ativos!
    // Visitantes e contas Gratuitas resolvem normalmente ao clicar em "Resolver" (com contabilização na cota diária).
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

    // 5. Carrega questão (cache em memória com limite FIFO)
    let row: CachedQuestionData | null = null;
    const cached = questionCache.get(questionId);
    if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
      row = cached;
    } else {
      const found = await findCanonicalQuestionByIdOrCode<{
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
      }>(
        supabaseAdmin,
        questionId,
        'id, code, correct_answer, is_anulada, commentary, options, especialidade, tema, foco, subfoco, difficulty, banca, year'
      );

      if (found.row) {
        if (questionCache.size >= MAX_MAP_ENTRIES) {
          const oldestKey = questionCache.keys().next().value;
          if (oldestKey) questionCache.delete(oldestKey);
        }
        const cacheEntry: CachedQuestionData = {
          id: found.row.id,
          code: found.row.code || '',
          correct_answer: found.row.correct_answer || '',
          is_anulada: Boolean(found.row.is_anulada),
          commentary: found.row.commentary || '',
          options: Array.isArray(found.row.options) ? found.row.options : [],
          especialidade: found.row.especialidade || null,
          tema: found.row.tema || null,
          foco: found.row.foco || null,
          subfoco: found.row.subfoco || null,
          difficulty: found.row.difficulty || null,
          banca: found.row.banca || null,
          year: found.row.year ? Number(found.row.year) : null,
          cachedAt: now
        };
        questionCache.set(found.row.id, cacheEntry);
        if (found.row.code) {
          questionCache.set(found.row.code, cacheEntry);
        }
        row = cacheEntry;
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
    const isCorrect = isAnulada ? true : (goldAnswer ? studentChoice === goldAnswer : false);

    // 6. Cota diária estrita de 10 questões/dia para visitantes e plano Gratuito
    if (!authenticatedUser) {
      const guestQuota = parseAndVerifyGuestQuotaCookie(req.cookies.get('br_guest_quota')?.value);
      const guestCheck = checkGuestQuota(clientIp, row.id);
      const hasSolvedInCookie = guestQuota.questionIds.has(row.id);
      const isOverLimit = (guestQuota.questionIds.size >= 10 || guestCheck.limitReached) && !hasSolvedInCookie;

      if (isOverLimit) {
        return NextResponse.json(
          {
            success: false,
            limitReached: true,
            error: 'Limite diário de 10 questões para visitantes atingido. Crie sua conta gratuita ou faça login para continuar resolvendo.',
            dailyResolvedCount: Math.max(guestQuota.questionIds.size, guestCheck.count)
          },
          { status: 403 }
        );
      }
    } else if (!isUnlimitedPlan) {
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);
      const startIso = startOfDay.toISOString();

      const { count } = await supabaseAdmin
        .from('user_answers')
        .select('question_id', { count: 'exact', head: true })
        .eq('user_id', authenticatedUser.id)
        .gte('answered_at', startIso);

      const dailyCount = count || 0;

      if (dailyCount >= 10) {
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

    // 7. Fast-Path Instantâneo de Prefetch (exclusivo para assinantes Pro/Premium/Admin já validados acima)
    if (isPrefetch && authenticatedUser) {
      const watermarkId = authenticatedUser.id;
      const unpacked = unpackStructuredCommentary(row.commentary || '', Array.isArray(row.options) ? row.options : []);
      const watermarkedCommentary = injectZeroWidthWatermark(sanitizeMedicalText(unpacked.commentary), watermarkId);
      const rawOpts = unpacked.options;
      const watermarkedOpts = rawOpts.map((opt: unknown) => {
        if (opt && typeof opt === 'object' && ('justification' in opt || 'explanation' in opt)) {
          const optObj = opt as { justification?: string; explanation?: string; [key: string]: unknown };
          const wmJust = injectZeroWidthWatermark(
            sanitizeMedicalText(optObj.justification || optObj.explanation || ''),
            watermarkId
          );
          return {
            ...optObj,
            explanation: wmJust,
            justification: wmJust
          };
        }
        return opt;
      });

      return NextResponse.json({
        success: true,
        isPrefetch: true,
        questionId: row.id,
        correctAnswer: row.correct_answer || (isAnulada ? 'ANULADA' : ''),
        isAnulada,
        isCorrect,
        commentary: watermarkedCommentary,
        options: watermarkedOpts
      });
    }

    const serverNow = new Date().toISOString();

    // 8. Persistência obrigatória na confirmação oficial (garante contabilização da cota e métricas TRI)
    if (authenticatedUser) {
      const targetUserId = authenticatedUser.id;
      const targetQuestionId = row.id;

      try {
        let finalAttempts = Array.isArray(attempts) && attempts.length > 0
          ? attempts.slice(-20).map((att: unknown) => {
              const a = (att && typeof att === 'object' ? att : {}) as { letter?: string; timestamp?: number };
              const l = typeof a.letter === 'string' && VALID_STUDENT_CHOICES.has(a.letter.toUpperCase())
                ? a.letter.toUpperCase()
                : studentChoice;
              return {
                letter: l,
                isCorrect: isAnulada ? true : (goldAnswer ? l === goldAnswer : false),
                timestamp: typeof a.timestamp === 'number' ? a.timestamp : Date.now()
              };
            })
          : [{ letter: studentChoice, isCorrect, timestamp: Date.now() }];

        const { data: existingRow } = await supabaseAdmin
          .from('user_answers')
          .select('attempts, student_notes, error_reason, is_correct, status_retrial')
          .eq('user_id', targetUserId)
          .eq('question_id', targetQuestionId)
          .maybeSingle();

        if (existingRow && Array.isArray(existingRow.attempts) && existingRow.attempts.length > 0) {
          const combinedMap = new Map<string, { letter: string; isCorrect: boolean; timestamp: number }>();
          for (const att of existingRow.attempts as Array<{ letter?: string; isCorrect?: boolean; timestamp?: number }>) {
            if (att && att.timestamp && att.letter) {
              combinedMap.set(`${att.timestamp}_${att.letter}`, {
                letter: att.letter,
                isCorrect: Boolean(att.isCorrect),
                timestamp: att.timestamp
              });
            }
          }
          for (const att of finalAttempts) {
            combinedMap.set(`${att.timestamp}_${att.letter}`, att);
          }
          finalAttempts = Array.from(combinedMap.values()).sort((a, b) => a.timestamp - b.timestamp).slice(-30);
        }

        // Preserva notas e classificação de erro anteriores do aluno quando não enviadas explicitamente na requisição
        const preservedNotes =
          typeof studentNotes === 'string'
            ? studentNotes.slice(0, 4000)
            : (existingRow?.student_notes ?? null);

        const preservedErrorReason =
          typeof errorReason === 'string'
            ? errorReason.slice(0, 120)
            : (existingRow?.error_reason ?? null);

        const hadPreviousError =
          Boolean(existingRow && existingRow.is_correct === false) ||
          finalAttempts.slice(0, -1).some((att) => !att.isCorrect);

        const finalStatusRetrial =
          typeof statusRetrial === 'string'
            ? statusRetrial.slice(0, 32)
            : !isCorrect
            ? 'pendente'
            : hadPreviousError
            ? 'recuperado'
            : (existingRow?.status_retrial ?? null);

        await supabaseAdmin.from('user_answers').upsert(
          {
            user_id: targetUserId,
            question_id: targetQuestionId,
            selected_option: studentChoice,
            is_correct: isCorrect,
            answered_at: serverNow,
            specialty: row.especialidade || 'Clínica Médica',
            tema: row.tema || 'Geral',
            foco: row.foco || null,
            subfoco: row.subfoco || null,
            difficulty: row.difficulty || 'Médio',
            banca: row.banca || 'Geral',
            year: row.year ? Number(row.year) : 2024,
            attempts: finalAttempts,
            student_notes: preservedNotes,
            error_reason: preservedErrorReason,
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

    // 9. Resposta com marca d'água esteganográfica forense preservada
    const watermarkId = authenticatedUser?.id || clientIp;
    const unpacked = unpackStructuredCommentary(row.commentary || '', Array.isArray(row.options) ? row.options : []);
    const watermarkedCommentary = injectZeroWidthWatermark(sanitizeMedicalText(unpacked.commentary), watermarkId);
    const rawOpts = unpacked.options;
    const watermarkedOpts = rawOpts.map((opt: unknown) => {
      if (opt && typeof opt === 'object' && ('justification' in opt || 'explanation' in opt)) {
        const optObj = opt as { justification?: string; explanation?: string; [key: string]: unknown };
        const cleanJustification = sanitizeMedicalText(optObj.justification || optObj.explanation || '');
        const wmJust = injectZeroWidthWatermark(cleanJustification, watermarkId);
        return {
          ...optObj,
          explanation: wmJust,
          justification: wmJust
        };
      }
      return opt;
    });

    const responseObj = NextResponse.json({
      success: true,
      isPrefetch: false,
      answeredAt: serverNow,
      limitReached: false,
      questionId: row.id,
      correctAnswer: goldAnswer,
      isAnulada,
      isCorrect,
      commentary: watermarkedCommentary,
      options: watermarkedOpts
    });

    if (!authenticatedUser && row.id) {
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
