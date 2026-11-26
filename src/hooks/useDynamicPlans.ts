'use client';

import { useEffect, useState } from 'react';
import { isPlanId, PLANS, type PlanDefinition, type PlanId } from '@/config/plans';
import type { PlanPricingItem } from '@/types/planPricing';

interface PlansApiResponse {
  success?: boolean;
  showPricesOnSite?: boolean;
  plans?: Partial<Record<PlanId, Partial<PlanPricingItem>>>;
}

interface DynamicPlansState {
  plans: Record<PlanId, PlanDefinition>;
  showPricesOnSite: boolean;
  isLoaded: boolean;
}

let cachedState: DynamicPlansState | null = null;
let inflightRequest: Promise<DynamicPlansState> | null = null;

function mergeDynamicPlans(
  remotePlans?: Partial<Record<PlanId, Partial<PlanPricingItem>>>
): Record<PlanId, PlanDefinition> {
  if (!remotePlans) return PLANS;

  const merged = { ...PLANS };
  for (const key of Object.keys(PLANS) as PlanId[]) {
    const remote = remotePlans[key];
    if (!remote || !isPlanId(key)) continue;

    const base = PLANS[key];
    merged[key] = {
      ...base,
      name: typeof remote.name === 'string' && remote.name.trim() ? remote.name : base.name,
      badge: typeof remote.badge === 'string' ? remote.badge : base.badge,
      durationMonths: typeof remote.durationMonths === 'number' ? remote.durationMonths : base.durationMonths,
      durationDays: typeof remote.durationDays === 'number' ? remote.durationDays : base.durationDays,
      monthlyEquivalent: typeof remote.monthlyEquivalent === 'number' ? remote.monthlyEquivalent : base.monthlyEquivalent,
      totalPrice: typeof remote.totalPrice === 'number' ? remote.totalPrice : base.totalPrice,
      maxInstallments: typeof remote.maxInstallments === 'number' ? remote.maxInstallments : base.maxInstallments,
      installmentValue: typeof remote.installmentValue === 'number' ? remote.installmentValue : base.installmentValue,
      savingsPercentage: typeof remote.savingsPercentage === 'number' ? remote.savingsPercentage : base.savingsPercentage,
    };
  }
  return merged;
}

async function fetchDynamicPlans(): Promise<DynamicPlansState> {
  if (cachedState) return cachedState;
  if (inflightRequest) return inflightRequest;

  inflightRequest = fetch('/api/plans')
    .then((res) => res.json() as Promise<PlansApiResponse>)
    .then((data) => {
      const next: DynamicPlansState = {
        plans: mergeDynamicPlans(data.success ? data.plans : undefined),
        showPricesOnSite:
          data.success && typeof data.showPricesOnSite === 'boolean'
            ? data.showPricesOnSite
            : true,
        isLoaded: true,
      };
      if (data.success) {
        cachedState = next;
      }
      return next;
    })
    .catch(() => ({
      plans: PLANS,
      showPricesOnSite: true,
      isLoaded: true,
    }))
    .finally(() => {
      inflightRequest = null;
    });

  return inflightRequest;
}

/**
 * Loads active plan pricing from `/api/plans` with fallback to static `PLANS`.
 */
export function useDynamicPlans(enabled = true): DynamicPlansState {
  const [state, setState] = useState<DynamicPlansState>(() =>
    cachedState ?? {
      plans: PLANS,
      showPricesOnSite: true,
      isLoaded: false,
    }
  );

  useEffect(() => {
    if (!enabled || cachedState) return;
    let cancelled = false;
    void fetchDynamicPlans().then((next) => {
      if (!cancelled) {
        setState(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}
