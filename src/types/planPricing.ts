import { PlanId } from '@/config/plans';

export interface PlanPricingItem {
  id: PlanId;
  name: string;
  badge?: string;
  totalPrice: number;
  monthlyEquivalent: number;
  maxInstallments: number;
  installmentValue: number;
  savingsPercentage: number;
  durationMonths: number;
  durationDays: number;
  billingText: string;
  savingsLabel: string;
  hasSavings: boolean;
  audienceTag: string;
}

export interface PlatformPricingSettings {
  showPricesOnSite: boolean;
  plans: Record<PlanId, PlanPricingItem>;
  updatedAt: string;
  updatedBy?: string;
}
