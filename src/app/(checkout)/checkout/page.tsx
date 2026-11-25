'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmbeddedCheckoutScreen } from '@/components/EmbeddedCheckoutScreen';
import { PLANS, PlanId, PlanDefinition } from '@/config/plans';
import { HippocampusLoading } from '@/components/HippocampusLoading';
import { captureReferralFromUrl } from '@/utils/referralCapture';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    void captureReferralFromUrl(searchParams);
  }, [searchParams]);

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
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
        } else {
          router.push('/');
        }
      }}
    />
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--foreground)]">
          <HippocampusLoading size="md" message="Carregando checkout seguro..." fullScreen={false} />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

