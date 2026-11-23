import { NextResponse } from 'next/server';
import { getStoredPlanPricing } from '@/services/planPricingService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/plans
 * Retorna os planos e preços ativos na plataforma para exibição pública e checkout.
 */
export async function GET() {
  try {
    const settings = await getStoredPlanPricing();

    return NextResponse.json(
      {
        success: true,
        showPricesOnSite: settings.showPricesOnSite,
        plans: settings.plans,
        updatedAt: settings.updatedAt
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
        }
      }
    );
  } catch (err) {
    console.error('[api/plans] Erro ao carregar planos:', err);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar planos.' },
      { status: 500 }
    );
  }
}
