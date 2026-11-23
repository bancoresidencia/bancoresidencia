import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/adminClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminSession(req, { requireStrictAdmin: true });
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso restrito exclusivamente a administradores.' },
        { status: auth.status || 403 }
      );
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({
        success: true,
        withdrawals: [],
        refundRequests: [],
        topAmbassadors: [],
        metrics: {
          pendingWithdrawalsCount: 0,
          pendingWithdrawalsAmount: 0,
          completedWithdrawalsCount: 0,
          completedWithdrawalsAmount: 0,
          pendingRefundsCount: 0
        }
      });
    }

    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status'); // all, pending, completed, rejected

    // 1. Consulta de Saques PIX
    let withdrawalsQuery = supabase
      .from('ambassador_withdrawals')
      .select('id, user_id, amount, pix_key, pix_key_type, valid_referrals_count, status, receipt_url, admin_notes, requested_at, processed_at')
      .order('requested_at', { ascending: false })
      .limit(100);

    if (statusFilter && statusFilter !== 'all') {
      withdrawalsQuery = withdrawalsQuery.eq('status', statusFilter);
    }

    const { data: withdrawals, error: withErr } = await withdrawalsQuery;
    if (withErr) {
      console.error('[AdminAmbassadorPayouts] Erro ao listar saques:', withErr);
      return NextResponse.json(
        { success: false, error: 'Falha ao buscar solicitações de saque.' },
        { status: 500 }
      );
    }

    // 2. Consulta de Solicitações de Reembolso Anuidade (Meta 10)
    const { data: refundRequests, error: refErr } = await supabase
      .from('ambassador_refund_requests')
      .select('id, user_id, valid_referrals_count, status, requested_at, processed_at')
      .order('requested_at', { ascending: false })
      .limit(50);

    if (refErr) {
      console.error('[AdminAmbassadorPayouts] Erro ao listar reembolsos:', refErr);
    }

    // 3. Hidratação com dados de perfis (nome, email, referral_code)
    const userIds = Array.from(
      new Set([
        ...(withdrawals || []).map((w) => w.user_id),
        ...(refundRequests || []).map((r) => r.user_id)
      ].filter(Boolean))
    );

    const userMap = new Map<string, { name: string; email: string; referral_code: string }>();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, referral_code')
        .in('id', userIds);

      if (profiles) {
        for (const p of profiles) {
          userMap.set(p.id, {
            name: p.name || 'Embaixador',
            email: p.email || '',
            referral_code: p.referral_code || ''
          });
        }
      }
    }

    const hydratedWithdrawals = (withdrawals || []).map((w) => {
      const u = userMap.get(w.user_id);
      return {
        ...w,
        userName: u ? u.name : 'Aluno desconhecido',
        userEmail: u ? u.email : '',
        referralCode: u ? u.referral_code : ''
      };
    });

    const hydratedRefunds = (refundRequests || []).map((r) => {
      const u = userMap.get(r.user_id);
      return {
        ...r,
        userName: u ? u.name : 'Aluno desconhecido',
        userEmail: u ? u.email : '',
        referralCode: u ? u.referral_code : ''
      };
    });

    // 4. Métricas de Saques e Reembolsos
    let pendingWithdrawalsCount = 0;
    let pendingWithdrawalsAmount = 0;
    let completedWithdrawalsCount = 0;
    let completedWithdrawalsAmount = 0;

    for (const w of withdrawals || []) {
      const amt = Number(w.amount) || 0;
      if (w.status === 'pending' || w.status === 'processing') {
        pendingWithdrawalsCount++;
        pendingWithdrawalsAmount += amt;
      } else if (w.status === 'completed') {
        completedWithdrawalsCount++;
        completedWithdrawalsAmount += amt;
      }
    }

    const pendingRefundsCount = (refundRequests || []).filter((r) => r.status === 'pending').length;

    // 5. Ranking de Top Embaixadores
    const { data: topReferrers } = await supabase
      .from('ambassador_referrals')
      .select('referrer_id, commission_amount, status');

    const rankingAgg = new Map<string, { totalReferrals: number; completedReferrals: number; totalEarnings: number }>();

    if (topReferrers) {
      for (const ref of topReferrers) {
        const current = rankingAgg.get(ref.referrer_id) || { totalReferrals: 0, completedReferrals: 0, totalEarnings: 0 };
        current.totalReferrals++;
        if (ref.status === 'completed') {
          current.completedReferrals++;
          current.totalEarnings += Number(ref.commission_amount) || 0;
        }
        rankingAgg.set(ref.referrer_id, current);
      }
    }

    const topUserIds = Array.from(rankingAgg.keys()).slice(0, 10);
    const topAmbassadorsList: Array<{
      id: string;
      name: string;
      email: string;
      referralCode: string;
      totalReferrals: number;
      completedReferrals: number;
      totalEarnings: number;
    }> = [];

    if (topUserIds.length > 0) {
      const { data: topProfiles } = await supabase
        .from('profiles')
        .select('id, name, email, referral_code')
        .in('id', topUserIds);

      if (topProfiles) {
        for (const p of topProfiles) {
          const stats = rankingAgg.get(p.id) || { totalReferrals: 0, completedReferrals: 0, totalEarnings: 0 };
          topAmbassadorsList.push({
            id: p.id,
            name: p.name || 'Embaixador',
            email: p.email || '',
            referralCode: p.referral_code || '',
            totalReferrals: stats.totalReferrals,
            completedReferrals: stats.completedReferrals,
            totalEarnings: parseFloat(stats.totalEarnings.toFixed(2))
          });
        }
      }
    }

    topAmbassadorsList.sort((a, b) => b.completedReferrals - a.completedReferrals || b.totalEarnings - a.totalEarnings);

    return NextResponse.json({
      success: true,
      withdrawals: hydratedWithdrawals,
      refundRequests: hydratedRefunds,
      topAmbassadors: topAmbassadorsList,
      metrics: {
        pendingWithdrawalsCount,
        pendingWithdrawalsAmount: parseFloat(pendingWithdrawalsAmount.toFixed(2)),
        completedWithdrawalsCount,
        completedWithdrawalsAmount: parseFloat(completedWithdrawalsAmount.toFixed(2)),
        pendingRefundsCount
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    console.error('[AdminAmbassadorPayouts] Exceção:', msg);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao consultar saques e embaixadores.' },
      { status: 500 }
    );
  }
}
