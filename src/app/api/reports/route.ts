import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function isValidUuid(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Tenta identificar se há usuário autenticado via cookies da sessão
    let sessionUserId: string | null = null;
    let sessionUserEmail: string | null = null;
    let sessionUserName: string | null = null;

    try {
      const serverSupabase = await createServerClient();
      const { data: { user } } = await serverSupabase.auth.getUser();
      if (user) {
        sessionUserId = user.id;
        sessionUserEmail = user.email || null;
        sessionUserName = (user.user_metadata?.name as string) || (user.user_metadata?.full_name as string) || null;
      }
    } catch {
      // Ignora erro de sessão de cookies
    }

    // Suporte a Sincronização em Lote (Batch Sync) vinda de syncPendingLocalReportsToSupabase
    if (Array.isArray(body.reports) && body.reports.length > 0) {
      let insertedCount = 0;
      for (const item of body.reports) {
        const qId = item.questionId || item.question_id;
        if (!qId) continue;

        const reportId = isValidUuid(item.id) ? item.id : crypto.randomUUID();
        const repDetails = typeof item.details === 'string' ? item.details.trim() : '';
        const repReason = item.reason || 'Erro no gabarito ou enunciado';
        const repStatus = item.status === 'in_progress' ? 'in_review' : (item.status || 'pending');

        const baseRow: Record<string, unknown> = {
          id: reportId,
          question_id: String(qId),
          user_id: isValidUuid(item.userId || item.user_id) ? (item.userId || item.user_id) : sessionUserId,
          reason: repReason,
          details: repDetails,
          status: repStatus,
          created_at: item.createdAt || item.created_at || new Date().toISOString()
        };

        const enrichedRow = {
          ...baseRow,
          ...(item.userName || sessionUserName ? { user_name: item.userName || sessionUserName } : {}),
          ...(item.userEmail || sessionUserEmail ? { user_email: item.userEmail || sessionUserEmail } : {})
        };

        // Upsert para garantir idempotência
        const { error } = await supabaseAdmin.from('question_reports').upsert(enrichedRow, { onConflict: 'id' });

        if (error && (error.message.includes('column') || error.message.includes('foreign key'))) {
          // Fallback seguro sem FK inválida ou sem colunas novas
          if (error.message.includes('foreign key')) {
            baseRow.user_id = null;
          }
          const retryRes = await supabaseAdmin.from('question_reports').upsert(baseRow, { onConflict: 'id' });
          if (!retryRes.error) insertedCount++;
        } else if (!error) {
          insertedCount++;
        }
      }

      return NextResponse.json({
        success: true,
        syncedCount: insertedCount,
        message: `${insertedCount} denúncias sincronizadas com o banco central.`
      });
    }

    // Fluxo Padrão: Inserção de Reporte Individual
    const { questionId, reason, details, userMeta } = body;

    if (!questionId || typeof questionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID da questão inválido ou ausente.' },
        { status: 400 }
      );
    }

    if (!details || typeof details !== 'string' || details.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Por favor, descreva o apontamento com pelo menos 3 caracteres.' },
        { status: 400 }
      );
    }

    let finalUserId = sessionUserId;
    const finalUserEmail = sessionUserEmail || userMeta?.email || null;
    const finalUserName = sessionUserName || userMeta?.name || 'Estudante';

    if (!finalUserId && userMeta?.id && isValidUuid(userMeta.id)) {
      finalUserId = userMeta.id;
    }

    const reportId = crypto.randomUUID();
    const now = new Date().toISOString();

    const basePayload: Record<string, unknown> = {
      id: reportId,
      question_id: questionId,
      user_id: finalUserId,
      reason: reason || 'Erro no gabarito ou enunciado',
      details: details.trim(),
      status: 'pending',
      created_at: now
    };

    const enrichedPayload = {
      ...basePayload,
      ...(finalUserName ? { user_name: finalUserName } : {}),
      ...(finalUserEmail ? { user_email: finalUserEmail } : {})
    };

    let { error } = await supabaseAdmin.from('question_reports').insert(enrichedPayload);

    // Fallback 1: se der erro de coluna (migration não rodada) ou erro de foreign key de usuário
    if (error) {
      const retryPayload = { ...basePayload };
      if (error.message.includes('foreign key')) {
        retryPayload.user_id = null;
      }
      const fallbackRes = await supabaseAdmin.from('question_reports').insert(retryPayload);
      error = fallbackRes.error;
    }

    if (error) {
      console.error('[API Reports] Erro ao gravar denúncia no Supabase:', error);
      return NextResponse.json(
        { success: false, error: 'Falha ao registrar denúncia no banco de dados. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reportId,
      message: 'Apontamento registrado com sucesso. A equipe médica e curadoria foram notificadas!'
    });
  } catch (err) {
    console.error('[API Reports] Erro inesperado ao processar reporte:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar o apontamento.' },
      { status: 500 }
    );
  }
}
