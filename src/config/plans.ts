export type PlanId = 'monthly' | 'semiannual' | 'annual' | 'biennial';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  badge?: string;
  durationMonths: number;
  durationDays: number;
  monthlyEquivalent: number;
  totalPrice: number;
  maxInstallments: number;
  installmentValue: number;
  savingsPercentage: number;
  features: string[];
}

export const STANDARD_PLAN_BENEFITS = [
  '+200k questões',
  'Flashcards direcionados',
  'Materiais de Estudo',
  'Desempenho e Evolução',
  'Caderno de Erros e Mais'
];

export const PLANS: Record<PlanId, PlanDefinition> = {
  monthly: {
    id: 'monthly',
    name: 'Plano Mensal',
    durationMonths: 1,
    durationDays: 30,
    monthlyEquivalent: 49.90,
    totalPrice: 49.90,
    maxInstallments: 1,
    installmentValue: 49.90,
    savingsPercentage: 0,
    features: STANDARD_PLAN_BENEFITS
  },
  semiannual: {
    id: 'semiannual',
    name: 'Plano Semestral',
    durationMonths: 6,
    durationDays: 180,
    monthlyEquivalent: 29.90,
    totalPrice: 179.40,
    maxInstallments: 6,
    installmentValue: 29.90,
    savingsPercentage: 40,
    features: STANDARD_PLAN_BENEFITS
  },
  annual: {
    id: 'annual',
    name: 'Plano Anual',
    badge: 'Mais Popular',
    durationMonths: 12,
    durationDays: 365,
    monthlyEquivalent: 25.90,
    totalPrice: 310.80,
    maxInstallments: 12,
    installmentValue: 25.90,
    savingsPercentage: 48,
    features: STANDARD_PLAN_BENEFITS
  },
  biennial: {
    id: 'biennial',
    name: 'Plano Bienal (2 Anos)',
    badge: 'Melhor Custo-Benefício',
    durationMonths: 24,
    durationDays: 730,
    monthlyEquivalent: 19.90,
    totalPrice: 477.60,
    maxInstallments: 24,
    installmentValue: 19.90,
    savingsPercentage: 60,
    features: STANDARD_PLAN_BENEFITS
  }
};

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && Object.hasOwn(PLANS, value);
}

