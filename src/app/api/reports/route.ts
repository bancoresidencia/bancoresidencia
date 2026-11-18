import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';

export const dynamic = 'force-dynamic';

interface ReportRateLimitEntry {
  count: number;
  resetAt: number;
}
const reportRateLimitMap = new Map<string, ReportRateLimitEntry>();
const MAX_REPORT_RATE_LIMIT_ENTRIES = 5000;

function isReportRateLimited(key: string): boolean {
  const now = Date.now();
  if (reportRateLimitMap.size >= MAX_REPORT_RATE_LIMIT_ENTRIES) {
    for (const [k, v] of reportRateLimitMap.entries()) {
      if (v.resetAt < now) reportRateLimitMap.delete(k);
    }
    while (reportRateLimitMap.size >= MAX_REPORT_RATE_LIMIT_ENTRIES) {
      const oldestKey = reportRateLimitMap.keys().next().value;
      if (oldestKey === undefined) break;
      reportRateLimitMap.delete(oldestKey);
    }
  }
  const entry = reportRateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    reportRateLimitMap.set(key, { count: 1, resetAt: now + 60000 });
    return false;
  }
  if (entry.count >= 20) {
    return true;
  }
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticação obrigatória de estudante (impede spam anônimo e falsificação de autoria)
    const auth = await verifyStudentSession(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, error: 'Faça login na plataforma para enviar apontamentos à curadoria.' },
        { status: 401 }
      );
    }

    const sessionUserId = auth.user.id;
    const sessionUserEmail = auth.user.email || null;
    const sessionUserName =
      (auth.user.user_metadata?.name as string) ||
      (auth.user.user_metadata?.full_name as string) ||
      'Estudante';

    if (isReportRateLimited(`user:${sessionUserId}`)) {
      return NextResponse.json(
        { success: false, error: 'Limite de reportes excedido. Por favor, aguarde alguns instantes.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const supabaseAdmin = getSupabaseAdmin();

    // Suporte a Sincronização em Lote (Batch Sync) vinda de syncPendingLocalReportsToSupabase
    if (Array.isArray(body.reports) && body.reports.length > 0) {
      const cappedBatch = body.reports.slice(0, 25);
      let insertedCount = 0;

      for (const item of cappedBatch) {
        if (!item || typeof item !== 'object') continue;
        const rawQId = (item as Record<string, unknown>).questionId ?? (item as Record<string, unknown>).question_id;
        if (!rawQId || typeof rawQId !== 'string') continue;
        const qId = rawQId.trim().slice(0, 120);
        if (!qId) continue;

        const rawDetails = (item as Record<string, unknown>).details;
        const repDetails = typeof rawDetails === 'string' ? rawDetails.trim().slice(0, 2000) : '';
        const rawReason = (item as Record<string, unknown>).reason;
        const repReason =
          typeof rawReason === 'string' && rawReason.trim()
            ? rawReason.trim().slice(0, 200)
            : 'Erro no gabarito ou enunciado';

        const baseRow: Record<string, unknown> = {
          id: crypto.randomUUID(),
          question_id: qId,
          user_id: sessionUserId,
          reason: repReason,
          details: repDetails,
          status: 'pending',
          created_at: new Date().toISOString()
        };

        const enrichedRow = {
          ...baseRow,
          ...(sessionUserName ? { user_name: sessionUserName.slice(0, 120) } : {}),
          ...(sessionUserEmail ? { user_email: sessionUserEmail.slice(0, 180) } : {})
        };

        // Insert estrito com UUID gerado no servidor (impede sobrescrita via upsert de ID arbitrário)
        const { error } = await supabaseAdmin.from('question_reports').insert(enrichedRow);

        if (error && error.message.includes('column')) {
          const retryRes = await supabaseAdmin.from('question_reports').insert(baseRow);
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
    const { questionId, reason, details } = body;

    if (!questionId || typeof questionId !== 'string' || !questionId.trim()) {
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

    const reportId = crypto.randomUUID();
    const now = new Date().toISOString();
    const safeReason =
      typeof reason === 'string' && reason.trim()
        ? reason.trim().slice(0, 200)
        : 'Erro no gabarito ou enunciado';

    const basePayload: Record<string, unknown> = {
      id: reportId,
      question_id: questionId.trim().slice(0, 120),
      user_id: sessionUserId,
      reason: safeReason,
      details: details.trim().slice(0, 2000),
      status: 'pending',
      created_at: now
    };

    const enrichedPayload = {
      ...basePayload,
      ...(sessionUserName ? { user_name: sessionUserName.slice(0, 120) } : {}),
      ...(sessionUserEmail ? { user_email: sessionUserEmail.slice(0, 180) } : {})
    };

    let { error } = await supabaseAdmin.from('question_reports').insert(enrichedPayload);

    if (error && error.message.includes('column')) {
      const fallbackRes = await supabaseAdmin.from('question_reports').insert(basePayload);
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
