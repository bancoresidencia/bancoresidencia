import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/adminClient';
import { recordAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface SubscriptionUpdateBody {
  userId: string;
  action: 'grant_pro' | 'extend' | 'cancel' | 'set_role';
  plan?: 'free' | 'pro' | 'premium';
  durationDays?: number;
  expiresAt?: string;
  role?: 'student' | 'curator' | 'admin';
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

    const body = (await req.json()) as Partial<SubscriptionUpdateBody>;
    const { userId, action, plan, durationDays, expiresAt, role, adminNotes } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Identificador de usuário (userId) obrigatório.' },
        { status: 400 }
      );
    }

    if (!action || !['grant_pro', 'extend', 'cancel', 'set_role'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Ação inválida. Utilize grant_pro, extend, cancel ou set_role.' },
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

    const { data: currentProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, name, email, role, subscription_plan, subscription_status, subscription_expires_at')
      .eq('id', userId)
      .single();

    if (profileErr || !currentProfile) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    const now = new Date();
    const updates: Record<string, unknown> = {
      updated_at: now.toISOString()
    };

    if (action === 'grant_pro') {
      const selectedPlan = plan || 'pro';
      const days = Number(durationDays) > 0 ? Number(durationDays) : 30;
      const targetExpiration = expiresAt ? new Date(expiresAt) : new Date(now.getTime() + days * 86400000);

      updates.subscription_plan = selectedPlan;
      updates.subscription_status = 'active';
      updates.subscription_started_at = now.toISOString();
      updates.subscription_expires_at = targetExpiration.toISOString();
    } else if (action === 'extend') {
      const days = Number(durationDays) > 0 ? Number(durationDays) : 30;
      const currentExpiry = currentProfile.subscription_expires_at
        ? new Date(currentProfile.subscription_expires_at)
        : now;
      const baseDate = currentExpiry > now ? currentExpiry : now;
      const newExpiry = new Date(baseDate.getTime() + days * 86400000);

      updates.subscription_expires_at = newExpiry.toISOString();
      updates.subscription_status = 'active';
    } else if (action === 'cancel') {
      updates.subscription_status = 'canceled';
    } else if (action === 'set_role') {
      if (!role || !['student', 'curator', 'admin'].includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Papel inválido. Permitidos: student, curator, admin.' },
          { status: 400 }
        );
      }
      updates.role = role;
    }

    const { data: updatedProfile, error: updateErr } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('id, name, email, role, subscription_plan, subscription_status, subscription_expires_at, updated_at')
      .single();

    if (updateErr) {
      console.error('[AdminSubscription] Erro ao atualizar perfil:', updateErr);
      return NextResponse.json(
        { success: false, error: 'Falha ao persistir alterações na assinatura/perfil.' },
        { status: 500 }
      );
    }

    await recordAuditEvent({
      userId: auth.user?.id,
      userEmail: auth.user?.email,
      userRole: auth.role,
      action: action === 'set_role' ? 'ROLE_UPDATE' : 'SUBSCRIPTION_UPDATE',
      entityType: 'user',
      entityId: userId,
      oldValues: {
        role: currentProfile.role,
        subscription_plan: currentProfile.subscription_plan,
        subscription_status: currentProfile.subscription_status,
        subscription_expires_at: currentProfile.subscription_expires_at
      },
      newValues: updates,
      reason: adminNotes || `Ação administrativa: ${action}`
    });

    return NextResponse.json({
      success: true,
      message: 'Assinatura/perfil atualizado com sucesso.',
      profile: updatedProfile
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    console.error('[AdminSubscription] Exceção:', msg);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar atualização de assinatura.' },
      { status: 500 }
    );
  }
}
