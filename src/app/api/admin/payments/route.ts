import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/adminClient';
import { sanitizePostgrestTerm } from '@/utils/security';

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
        orders: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        metrics: {
          totalGmv: 0,
          approvedOrders: 0,
          ticketMedio: 0,
          pixCount: 0,
          cardCount: 0,
          pendingCount: 0,
          refundedCount: 0
        }
      });
    }

    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const rawSearch = searchParams.get('search');
    const search = rawSearch ? sanitizePostgrestTerm(rawSearch).trim() : '';
    const statusFilter = searchParams.get('status'); // all, approved, pending, cancelled, refunded
    const methodFilter = searchParams.get('payment_method'); // all, pix, credit_card

    // 1. Agregação de métricas
    const { data: allOrders, error: metricsErr } = await supabase
      .from('orders')
      .select('amount, status, payment_method');

    let totalGmv = 0;
    let approvedOrders = 0;
    let pixCount = 0;
    let cardCount = 0;
    let pendingCount = 0;
    let refundedCount = 0;

    if (!metricsErr && allOrders) {
      for (const ord of allOrders) {
        const val = Number(ord.amount) || 0;
        if (ord.status === 'approved') {
          totalGmv += val;
          approvedOrders++;
          if (ord.payment_method === 'pix' || ord.payment_method === 'account_money') {
            pixCount++;
          } else {
            cardCount++;
          }
        } else if (ord.status === 'pending') {
          pendingCount++;
        } else if (ord.status === 'refunded' || ord.status === 'charged_back') {
          refundedCount++;
        }
      }
    }

    const ticketMedio = approvedOrders > 0 ? parseFloat((totalGmv / approvedOrders).toFixed(2)) : 0;

    // 2. Consulta paginada de pedidos
    let query = supabase
      .from('orders')
      .select(
        'id, user_id, plan_id, plan_name, amount, currency, installments, payment_method, status, qr_code, ticket_url, refund_id, mp_payment_id, created_at, updated_at',
        { count: 'exact' }
      );

    if (search) {
      query = query.or(`id.ilike.%${search}%,mp_payment_id.ilike.%${search}%,plan_name.ilike.%${search}%`);
    }

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (methodFilter && methodFilter !== 'all') {
      query = query.eq('payment_method', methodFilter);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: orders, count, error: listErr } = await query;

    if (listErr) {
      console.error('[AdminPayments] Erro ao listar pedidos:', listErr);
      return NextResponse.json(
        { success: false, error: 'Falha ao buscar pedidos.' },
        { status: 500 }
      );
    }

    // 3. Hidratação com nome e e-mail do usuário
    const userIds = Array.from(new Set((orders || []).map((o) => o.user_id).filter(Boolean)));
    const userMap = new Map<string, { name: string; email: string }>();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      if (profiles) {
        for (const p of profiles) {
          userMap.set(p.id, { name: p.name || 'Sem nome', email: p.email || '' });
        }
      }
    }

    const hydratedOrders = (orders || []).map((ord) => {
      const u = userMap.get(ord.user_id);
      return {
        ...ord,
        userName: u ? u.name : 'Aluno desconhecido',
        userEmail: u ? u.email : ''
      };
    });

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      orders: hydratedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      metrics: {
        totalGmv: parseFloat(totalGmv.toFixed(2)),
        approvedOrders,
        ticketMedio,
        pixCount,
        cardCount,
        pendingCount,
        refundedCount
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    console.error('[AdminPayments] Exceção:', msg);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao consultar histórico de pagamentos.' },
      { status: 500 }
    );
  }
}
