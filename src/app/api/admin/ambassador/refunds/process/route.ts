import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/adminClient';
import { recordAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface ProcessRefundBody {
  refundRequestId: string;
  action: 'approve' | 'reject';
  adminNotes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminSession(req, { requireStrictAdmin: true });
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso restrito exclusivamente a administradores.' },
        { status: auth.status || 403 }
      );
    }

    const body = (await req.json()) as ProcessRefundBody;
    const { refundRequestId, action, adminNotes } = body;

    if (!refundRequestId || typeof refundRequestId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Identificador da solicitação (refundRequestId) obrigatório.' },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Ação inválida. Utilize approve ou reject.' },
        { status: 400 }
      );
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Banco de dados administrativo indisponível.' },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: currentRequest, error: fetchErr } = await supabase
      .from('ambassador_refund_requests')
      .select('id, user_id, valid_referrals_count, status')
      .eq('id', refundRequestId)
      .single();

    if (fetchErr || !currentRequest) {
      return NextResponse.json(
        { success: false, error: 'Solicitação de reembolso não encontrada.' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const targetStatus = action === 'approve' ? 'approved' : 'rejected';

    const updates: Record<string, unknown> = {
      status: targetStatus,
      processed_at: now,
      updated_at: now
    };

    const { data: updatedRequest, error: updateErr } = await supabase
      .from('ambassador_refund_requests')
      .update(updates)
      .eq('id', refundRequestId)
      .select('id, user_id, valid_referrals_count, status, requested_at, processed_at')
      .single();

    if (updateErr) {
      console.error('[AdminRefundProcess] Erro ao processar reembolso:', updateErr);
      return NextResponse.json(
        { success: false, error: 'Falha ao atualizar status da solicitação de reembolso.' },
        { status: 500 }
      );
    }

    await recordAuditEvent({
      userId: auth.user?.id,
      userEmail: auth.user?.email,
      userRole: auth.role,
      action: 'REFUND_PROCESS',
      entityType: 'user',
      entityId: currentRequest.user_id,
      oldValues: {
        refund_request_id: currentRequest.id,
        status: currentRequest.status
      },
      newValues: {
        refund_request_id: refundRequestId,
        status: targetStatus
      },
      reason: adminNotes || `Processamento de reembolso integral Meta 10: ${targetStatus}`
    });

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Reembolso integral aprovado com sucesso!' : 'Reembolso rejeitado.',
      refundRequest: updatedRequest
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    console.error('[AdminRefundProcess] Exceção:', msg);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar reembolso.' },
      { status: 500 }
    );
  }
}
