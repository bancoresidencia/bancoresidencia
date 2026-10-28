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

export async function POST(req: NextRequest) {
  try {
    // 1. Verificação de Rate Limit por IP
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
    const { questionId, selectedOption } = body;

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

    const supabaseAdmin = getSupabaseAdmin();

    // 4. Busca do gabarito e comentários no banco via Service Role (Gabarito Oculto)
    let { data: row, error } = await supabaseAdmin
      .from('questions')
      .select('id, code, correct_answer, is_anulada, commentary, options')
      .eq('id', questionId)
      .maybeSingle();

    if (!row && !error) {
      // Fallback por código da questão
      const byCodeRes = await supabaseAdmin
        .from('questions')
        .select('id, code, correct_answer, is_anulada, commentary, options')
        .eq('code', questionId)
        .maybeSingle();
      row = byCodeRes.data;
      error = byCodeRes.error;
    }

    if (error) {
      console.error('[API Solve] Erro ao consultar questão:', error);
      return NextResponse.json({ success: false, error: 'Erro no banco de dados.' }, { status: 500 });
    }

    if (!row) {
      return NextResponse.json(
        { success: false, error: 'Questão não encontrada no sistema.' },
        { status: 404 }
      );
    }

    // 5. Avaliação da resposta
    const isAnulada = Boolean(row.is_anulada || row.correct_answer === 'ANULADA');
    const goldAnswer = (row.correct_answer || (isAnulada ? 'ANULADA' : '')).trim().toUpperCase();
    const studentChoice = typeof selectedOption === 'string' ? selectedOption.trim().toUpperCase() : '';

    const isCorrect = isAnulada
      ? true
      : studentChoice.length > 0 && studentChoice === goldAnswer;

    // 6. Sincronização automática com a conta do aluno se logado
    if (studentChoice) {
      try {
        const supabaseServer = await createSupabaseServerClient();
        const {
          data: { user }
        } = await supabaseServer.auth.getUser();

        if (user) {
          await supabaseAdmin.from('user_answers').upsert(
            {
              user_id: user.id,
              question_id: row.id,
              selected_option: studentChoice,
              is_correct: isCorrect,
              answered_at: new Date().toISOString()
            },
            { onConflict: 'user_id,question_id' }
          );
        }
      } catch (authSyncErr) {
        console.warn('[API Solve] Aviso ao registrar histórico do aluno:', authSyncErr);
      }
    }

    return NextResponse.json({
      success: true,
      questionId: row.id,
      correctAnswer: goldAnswer,
      isAnulada,
      isCorrect,
      commentary: row.commentary || '',
      options: Array.isArray(row.options) ? row.options : []
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno do servidor';
    console.error('[API Solve] Exceção:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
