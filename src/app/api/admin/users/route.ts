import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/adminClient';
import { sanitizePostgrestTerm, safeErrorMessage } from '@/utils/security';

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
        users: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        metrics: { totalUsers: 0, activePro: 0, trialFree: 0, churned: 0, conversionRate: 0 }
      });
    }

    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const rawSearch = searchParams.get('search');
    const search = rawSearch ? sanitizePostgrestTerm(rawSearch).trim() : '';
    const roleFilter = searchParams.get('role'); // all, student, curator, admin
    const planFilter = searchParams.get('plan'); // all, free, pro, premium
    const statusFilter = searchParams.get('status'); // all, active, inactive, canceled, refunded

    // 1. Consulta agregada de métricas gerais (KPIs)
    const { data: allProfiles, error: metricsErr } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status');

    let totalUsers = 0;
    let activePro = 0;
    let trialFree = 0;
    let churned = 0;

    if (!metricsErr && allProfiles) {
      totalUsers = allProfiles.length;
      for (const p of allProfiles) {
        if (p.subscription_status === 'active' && p.subscription_plan !== 'free') {
          activePro++;
        } else if (p.subscription_status === 'canceled' || p.subscription_status === 'refunded') {
          churned++;
        } else {
          trialFree++;
        }
      }
    }

    const conversionRate = totalUsers > 0 ? parseFloat(((activePro / totalUsers) * 100).toFixed(1)) : 0;

    // 2. Consulta paginada com filtros
    let query = supabase
      .from('profiles')
      .select('id, name, email, role, specialty_target, college, graduation_year, avatar_url, subscription_plan, subscription_status, subscription_duration, subscription_started_at, subscription_expires_at, guarantee_expires_at, referral_code, referred_by_code, created_at, updated_at', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,college.ilike.%${search}%,referral_code.ilike.%${search}%`);
    }

    if (roleFilter && roleFilter !== 'all') {
      if (roleFilter === 'curator') {
        query = query.in('role', ['curator', 'curador']);
      } else {
        query = query.eq('role', roleFilter);
      }
    }

    if (planFilter && planFilter !== 'all') {
      query = query.eq('subscription_plan', planFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('subscription_status', statusFilter);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, count, error: listErr } = await query;

    if (listErr) {
      console.error('[AdminUsers] Erro ao listar usuários:', listErr);
      return NextResponse.json(
        { success: false, error: 'Falha ao buscar usuários.' },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      users: users || [],
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      metrics: {
        totalUsers,
        activePro,
        trialFree,
        churned,
        conversionRate
      }
    });
  } catch (err: unknown) {
    console.error('[AdminUsers] Exceção na listagem:', err);
    return NextResponse.json(
      { success: false, error: safeErrorMessage(err, 'Erro interno ao consultar usuários.') },
      { status: 500 }
    );
  }
}
