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
    features: [
      'Acesso completo a 133k+ questões comentadas',
      'Filtros avançados (ENARE, USP, AMRIGS, PSU-MG e mais)',
      'Métricas psicométricas TRI e cálculo de percentil',
      'Provas oficiais na íntegra com cronômetro real',
      'Garantia de 7 dias com reembolso incontestável'
    ]
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
    features: [
      '6 meses de acesso irrestrito',
      'Economia de 40% em relação ao plano mensal',
      'Cadernos e pastas de questões ilimitadas',
      'Ranking comparativo nacional em tempo real',
      'Garantia de 7 dias com reembolso incontestável'
    ]
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
    features: [
      '12 meses de acesso irrestrito (preparação completa)',
      'Economia de quase 50% em relação ao mensal',
      'Todas as provas de residência do ciclo 2026/2027',
      'Mentoria e análises de desempenho por IA',
      'Garantia de 7 dias com reembolso incontestável'
    ]
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
    features: [
      '24 meses de acesso irrestrito (R1 + R+ garantido)',
      'Economia máxima de 60% (R$ 19,90/mês)',
      'Atualização contínua de novas bancas e gabaritos',
      'Prioridade de suporte e recursos antecipados',
      'Garantia de 7 dias com reembolso incontestável'
    ]
  }
};

