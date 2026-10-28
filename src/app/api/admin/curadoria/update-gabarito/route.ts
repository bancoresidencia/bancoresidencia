import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { recordAuditEvent } from '@/lib/audit';

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

const VALID_LETTERS = new Set(['A', 'B', 'C', 'D', 'E', 'ANULADA', '']);

export async function POST(req: NextRequest) {
  try {
    // 1. Verificação estrita de autorização de Administrador / Curador
    const auth = await verifyAdminSession(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso negado: permissões insuficientes.' },
        { status: auth.status }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const {
      questionId,
      correctAnswer,
      newCorrectAnswer,
      isAnulada,
      commentary,
      options,
      reportId
    } = body;

    const targetAnswer = correctAnswer !== undefined ? correctAnswer : newCorrectAnswer;

    if (!questionId || typeof questionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID da questão inválido ou ausente.' },
        { status: 400 }
      );
    }

    const normAnswer = typeof targetAnswer === 'string' ? targetAnswer.trim().toUpperCase() : '';
    if (!VALID_LETTERS.has(normAnswer)) {
      return NextResponse.json(
        { success: false, error: `Alternativa inválida: "${targetAnswer}". Esperado A, B, C, D, E ou vazio.` },
        { status: 400 }
      );
    }

    // 2. Captura do snapshot anterior para rastreabilidade e integridade da auditoria
    let previousRow: { id: string; correct_answer?: string; is_anulada?: boolean; commentary?: string } | null = null;
    try {
      const prevRes = await supabaseAdmin
        .from('questions')
        .select('id, correct_answer, is_anulada, commentary')
        .eq('id', questionId)
        .maybeSingle();

      if (prevRes.data) {
        previousRow = prevRes.data;
      } else {
        const byCodePrev = await supabaseAdmin
          .from('questions')
          .select('id, correct_answer, is_anulada, commentary')
          .eq('code', questionId)
          .maybeSingle();
        previousRow = byCodePrev.data || null;
      }
    } catch (prevErr) {
      console.warn('[API Curadoria] Aviso ao ler estado anterior da questão:', prevErr);
    }

    const updatePayload: Record<string, unknown> = {
      correct_answer: normAnswer
    };

    if (typeof isAnulada === 'boolean') {
      updatePayload.is_anulada = isAnulada;
      if (isAnulada && !normAnswer) {
        updatePayload.correct_answer = 'ANULADA';
      }
    } else if (normAnswer === 'ANULADA') {
      updatePayload.is_anulada = true;
    }

    if (typeof commentary === 'string') {
      updatePayload.commentary = commentary.slice(0, 25000);
    }

    if (Array.isArray(options) && options.length > 0) {
      updatePayload.options = options;
    }

    // Gravação direta com service role (bypassa RLS de forma segura)
    const { data: initialData, error } = await supabaseAdmin
      .from('questions')
      .update(updatePayload)
      .eq('id', questionId)
      .select('id, code, correct_answer, is_anulada, commentary, options');

    let data = initialData;

    // Fallback: se não encontrou por ID, tentar por código
    if (!error && (!data || data.length === 0)) {
      const byCodeRes = await supabaseAdmin
        .from('questions')
        .update(updatePayload)
        .eq('code', questionId)
        .select('id, code, correct_answer, is_anulada, commentary, options');
      if (byCodeRes.data && byCodeRes.data.length > 0) {
        data = byCodeRes.data;
      }
    }

    if (error) {
      console.error('[API Curadoria] Erro no Supabase update:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
      if (!hasServiceKey) {
        return NextResponse.json(
          {
            success: false,
            error: 'Permissão negada (RLS do Supabase): A variável SUPABASE_SERVICE_ROLE_KEY não está configurada no painel da Vercel (Settings -> Environment Variables). Adicione-a para permitir a curadoria salvar gabaritos diretamente no banco.'
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Questão não encontrada no Supabase (verifique se o ID ou código existe).' },
        { status: 404 }
      );
    }

    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown-ip';

    // 3. Registro imutável de auditoria da alteração de gabarito
    const auditAction = updatePayload.is_anulada ? 'ANULATE_QUESTION' : 'UPDATE_GABARITO';
    await recordAuditEvent({
      userId: auth.user?.id || null,
      userEmail: auth.user?.email || (auth.isM2M ? 'm2m-service-role' : null),
      userRole: auth.role || 'admin',
      action: auditAction,
      entityType: 'question',
      entityId: data[0].id,
      oldValues: previousRow
        ? {
            correct_answer: previousRow.correct_answer,
            is_anulada: previousRow.is_anulada,
            commentary_preview: previousRow.commentary ? previousRow.commentary.slice(0, 200) : null
          }
        : null,
      newValues: {
        correct_answer: updatePayload.correct_answer,
        is_anulada: updatePayload.is_anulada,
        has_new_commentary: Boolean(updatePayload.commentary)
      },
      reason: reportId ? `Resolução da denúncia #${reportId}` : 'Curadoria manual de gabarito',
      ipAddress: clientIp,
      userAgent: req.headers.get('user-agent')
    });

    // Se reportId foi fornecido, atualiza o report para resolved no Supabase e audita
    if (reportId && typeof reportId === 'string') {
      try {
        const repPayload: Record<string, unknown> = {
          status: 'resolved',
          admin_notes: `Gabarito retificado para [${normAnswer}] e comentário padrão-ouro homologado pelo administrador.`,
          resolved_at: new Date().toISOString(),
          resolved_by: auth.user?.id || null
        };

        const { error: repUpdateErr } = await supabaseAdmin
          .from('question_reports')
          .update(repPayload)
          .eq('id', reportId);

        if (repUpdateErr && repUpdateErr.message.includes('admin_notes')) {
          delete repPayload.admin_notes;
          await supabaseAdmin
            .from('question_reports')
            .update(repPayload)
            .eq('id', reportId);
        }

        await recordAuditEvent({
          userId: auth.user?.id || null,
          userEmail: auth.user?.email || (auth.isM2M ? 'm2m-service-role' : null),
          userRole: auth.role || 'admin',
          action: 'RESOLVE_REPORT',
          entityType: 'question_report',
          entityId: reportId,
          newValues: { status: 'resolved', associated_question_id: data[0].id },
          reason: `Denúncia resolvida com atualização do gabarito para [${normAnswer}]`,
          ipAddress: clientIp,
          userAgent: req.headers.get('user-agent')
        });
      } catch (repErr) {
        console.warn('[API Curadoria] Aviso ao atualizar report:', repErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Gabarito e comentário salvos com sucesso no banco de dados.',
      updated: data[0]
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno do servidor';
    console.error('[API Curadoria] Exceção:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
