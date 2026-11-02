'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmbeddedCheckoutScreen } from '@/components/EmbeddedCheckoutScreen';
import { PLANS, PlanId, PlanDefinition } from '@/config/plans';
import { Loader2 } from 'lucide-react';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planParam = searchParams.get('plan') as PlanId | null;
  const initialPlan: PlanDefinition =
    planParam && PLANS[planParam] ? PLANS[planParam] : PLANS.annual;

  return (
    <EmbeddedCheckoutScreen
      initialPlan={initialPlan}
      onSuccess={() => {
        router.push('/dashboard');
      }}
      onTestFree={() => {
        router.push('/dashboard');
      }}
      onBackToLanding={() => {
        router.push('/dashboard');
      }}
    />
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--foreground)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

