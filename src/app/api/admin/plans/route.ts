import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import {
  getStoredPlanPricing,
  savePlanPricing,
  getDefaultPricingSettings,
  PlatformPricingSettings,
  PlanPricingItem
} from '@/services/planPricingService';
import { PlanId } from '@/config/plans';

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

    const settings = await getStoredPlanPricing();
    const defaults = getDefaultPricingSettings();

    return NextResponse.json({
      success: true,
      settings,
      defaults
    });
  } catch (err) {
    console.error('[api/admin/plans] Erro no GET:', err);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar configurações de planos.' },
      { status: 500 }
    );
  }
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

    const body = (await req.json()) as Partial<PlatformPricingSettings>;
    if (!body || typeof body !== 'object' || !body.plans) {
      return NextResponse.json(
        { success: false, error: 'Payload inválido. Objeto de planos é obrigatório.' },
        { status: 400 }
      );
    }

    const validPlanIds: PlanId[] = ['monthly', 'semiannual', 'annual', 'biennial'];

    // Validação estrita dos valores dos planos
    for (const pid of validPlanIds) {
      const p = body.plans[pid] as Partial<PlanPricingItem> | undefined;
      if (!p) {
        return NextResponse.json(
          { success: false, error: `Configuração do plano "${pid}" não fornecida.` },
          { status: 400 }
        );
      }

      if (typeof p.totalPrice !== 'number' || isNaN(p.totalPrice) || p.totalPrice <= 0) {
        return NextResponse.json(
          { success: false, error: `Preço total do plano "${pid}" deve ser um número positivo válido.` },
          { status: 400 }
        );
      }

      if (typeof p.monthlyEquivalent !== 'number' || isNaN(p.monthlyEquivalent) || p.monthlyEquivalent <= 0) {
        return NextResponse.json(
          { success: false, error: `Equivalente mensal do plano "${pid}" deve ser um número positivo válido.` },
          { status: 400 }
        );
      }

      if (typeof p.maxInstallments !== 'number' || !Number.isInteger(p.maxInstallments) || p.maxInstallments < 1 || p.maxInstallments > 36) {
        return NextResponse.json(
          { success: false, error: `Número de parcelas do plano "${pid}" deve ser um inteiro entre 1 e 36.` },
          { status: 400 }
        );
      }
    }

    const result = await savePlanPricing(body as PlatformPricingSettings, auth.user?.email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Falha ao salvar configurações no Supabase.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Planos e preços atualizados com sucesso no Supabase e integrados ao Mercado Pago.',
      settings: result.settings
    });
  } catch (err) {
    console.error('[api/admin/plans] Erro no POST:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar atualização de planos.' },
      { status: 500 }
    );
  }
}
