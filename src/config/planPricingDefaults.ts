import { PLANS, PlanId } from '@/config/plans';
import { LANDING_PRICING_PLANS } from '@/components/landing/landingData';
import { PlatformPricingSettings, PlanPricingItem } from '@/types/planPricing';

/**
 * Padrão canônico de fábrica dos 4 planos
 */
export function getDefaultPricingSettings(): PlatformPricingSettings {
  const landingMap = new Map(LANDING_PRICING_PLANS.map((p) => [p.id, p]));

  const plans: Record<PlanId, PlanPricingItem> = {
    monthly: {
      id: 'monthly',
      name: PLANS.monthly.name,
      badge: PLANS.monthly.badge,
      totalPrice: PLANS.monthly.totalPrice,
      monthlyEquivalent: PLANS.monthly.monthlyEquivalent,
      maxInstallments: PLANS.monthly.maxInstallments,
      installmentValue: PLANS.monthly.installmentValue,
      savingsPercentage: PLANS.monthly.savingsPercentage,
      durationMonths: PLANS.monthly.durationMonths,
      durationDays: PLANS.monthly.durationDays,
      billingText: landingMap.get('monthly')?.billingText || 'Cobrança mensal avulsa • Cancele quando quiser',
      savingsLabel: landingMap.get('monthly')?.savingsLabel || 'Flexibilidade sem fidelidade',
      hasSavings: false,
      audienceTag: landingMap.get('monthly')?.audienceTag || 'Para experimentar no seu ritmo'
    },
    semiannual: {
      id: 'semiannual',
      name: PLANS.semiannual.name,
      badge: PLANS.semiannual.badge || 'Reta Final • 6 Meses',
      totalPrice: PLANS.semiannual.totalPrice,
      monthlyEquivalent: PLANS.semiannual.monthlyEquivalent,
      maxInstallments: PLANS.semiannual.maxInstallments,
      installmentValue: PLANS.semiannual.installmentValue,
      savingsPercentage: PLANS.semiannual.savingsPercentage,
      durationMonths: PLANS.semiannual.durationMonths,
      durationDays: PLANS.semiannual.durationDays,
      billingText: landingMap.get('semiannual')?.billingText || 'R$ 179,40 à vista ou até 6x de R$ 29,90 (sujeito a taxas)',
      savingsLabel: landingMap.get('semiannual')?.savingsLabel || 'Economize R$ 120,00 (40% OFF)',
      hasSavings: true,
      audienceTag: landingMap.get('semiannual')?.audienceTag || 'Ideal para revisão intensiva pré-prova'
    },
    annual: {
      id: 'annual',
      name: PLANS.annual.name,
      badge: PLANS.annual.badge || 'Mais Escolhido • 1 Ano',
      totalPrice: PLANS.annual.totalPrice,
      monthlyEquivalent: PLANS.annual.monthlyEquivalent,
      maxInstallments: PLANS.annual.maxInstallments,
      installmentValue: PLANS.annual.installmentValue,
      savingsPercentage: PLANS.annual.savingsPercentage,
      durationMonths: PLANS.annual.durationMonths,
      durationDays: PLANS.annual.durationDays,
      billingText: landingMap.get('annual')?.billingText || 'R$ 310,80 à vista ou até 12x de R$ 25,90 (sujeito a taxas)',
      savingsLabel: landingMap.get('annual')?.savingsLabel || 'Economize R$ 288,00 (48% OFF)',
      hasSavings: true,
      audienceTag: landingMap.get('annual')?.audienceTag || 'Ciclo completo rumo à aprovação'
    },
    biennial: {
      id: 'biennial',
      name: PLANS.biennial.name,
      badge: PLANS.biennial.badge || 'Melhor Custo-Benefício • 2 Anos',
      totalPrice: PLANS.biennial.totalPrice,
      monthlyEquivalent: PLANS.biennial.monthlyEquivalent,
      maxInstallments: PLANS.biennial.maxInstallments,
      installmentValue: PLANS.biennial.installmentValue,
      savingsPercentage: PLANS.biennial.savingsPercentage,
      durationMonths: PLANS.biennial.durationMonths,
      durationDays: PLANS.biennial.durationDays,
      billingText: landingMap.get('biennial')?.billingText || 'Equivalente mensal nos 24 meses • R$ 477,60 à vista ou até 12x de R$ 39,80 (sujeito a taxas)',
      savingsLabel: landingMap.get('biennial')?.savingsLabel || 'Economize R$ 720,00 (60% OFF)',
      hasSavings: true,
      audienceTag: landingMap.get('biennial')?.audienceTag || 'Perfeito para 5º e 6º ano (Internato)'
    }
  };

  return {
    showPricesOnSite: false,
    plans,
    updatedAt: new Date().toISOString()
  };
}
