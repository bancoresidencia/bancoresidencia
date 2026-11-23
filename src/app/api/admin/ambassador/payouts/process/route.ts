import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/adminClient';
import { recordAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface ProcessPayoutBody {
  withdrawalId: string;
  action: 'complete' | 'reject';
  receiptUrl?: string;
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

    const body = (await req.json()) as ProcessPayoutBody;
    const { withdrawalId, action, receiptUrl, adminNotes } = body;

    if (!withdrawalId || typeof withdrawalId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Identificador do saque (withdrawalId) obrigatório.' },
        { status: 400 }
      );
    }

    if (!action || !['complete', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Ação inválida. Utilize complete ou reject.' },
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

    const { data: currentWithdrawal, error: fetchErr } = await supabase
      .from('ambassador_withdrawals')
      .select('id, user_id, amount, pix_key, pix_key_type, status, receipt_url, admin_notes')
      .eq('id', withdrawalId)
      .single();

    if (fetchErr || !currentWithdrawal) {
      return NextResponse.json(
        { success: false, error: 'Solicitação de saque não encontrada.' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const targetStatus = action === 'complete' ? 'completed' : 'rejected';
    const finalNotes = adminNotes || (action === 'complete' ? 'Saque liquidado com sucesso via PIX.' : 'Saque rejeitado pela administração.');

    const updates: Record<string, unknown> = {
      status: targetStatus,
      processed_at: now,
      admin_notes: finalNotes,
      updated_at: now
    };

    if (action === 'complete' && receiptUrl) {
      updates.receipt_url = receiptUrl;
    }

    const { data: updatedWithdrawal, error: updateErr } = await supabase
      .from('ambassador_withdrawals')
      .update(updates)
      .eq('id', withdrawalId)
      .select('id, user_id, amount, pix_key, pix_key_type, status, receipt_url, admin_notes, requested_at, processed_at')
      .single();

    if (updateErr) {
      console.error('[AdminPayoutProcess] Erro ao processar saque:', updateErr);
      return NextResponse.json(
        { success: false, error: 'Falha ao atualizar status do saque.' },
        { status: 500 }
      );
    }

    await recordAuditEvent({
      userId: auth.user?.id,
      userEmail: auth.user?.email,
      userRole: auth.role,
      action: 'PAYOUT_PROCESS',
      entityType: 'user',
      entityId: currentWithdrawal.user_id,
      oldValues: {
        withdrawal_id: currentWithdrawal.id,
        status: currentWithdrawal.status,
        amount: currentWithdrawal.amount
      },
      newValues: {
        withdrawal_id: withdrawalId,
        status: targetStatus,
        receipt_url: receiptUrl,
        admin_notes: finalNotes
      },
      reason: `Processamento de saque PIX: ${targetStatus}`
    });

    return NextResponse.json({
      success: true,
      message: action === 'complete' ? 'Saque liquidado com sucesso!' : 'Saque rejeitado.',
      withdrawal: updatedWithdrawal
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    console.error('[AdminPayoutProcess] Exceção:', msg);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar liquidação de saque.' },
      { status: 500 }
    );
  }
}
