'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LandingPage } from '@/components/LandingPage';
import { AuthScreen } from '@/components/AuthScreen';
import { PLANS, PlanId, PlanDefinition } from '@/config/plans';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { HippocampusLoading } from '@/components/HippocampusLoading';

interface LandingQueryEffectsProps {
  isAuthenticated: boolean;
  hasUser: boolean;
  onPendingPlanDetected: (plan: PlanDefinition, openRegisterModal: boolean, planId: PlanId) => void;
  onOpenLoginFromQuery: () => void;
}

function LandingQueryEffects({
  isAuthenticated,
  hasUser,
  onPendingPlanDetected,
  onOpenLoginFromQuery
}: LandingQueryEffectsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Compatibilidade para links legados ?tab=...
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (!tabParam) return;

    const routeMap: Record<string, string> = {
      home: '/dashboard',
      agenda: '/agenda',
      banco: '/questoes',
      caderno_erros: '/caderno-de-erros',
      cadernos: '/caderno-de-erros',
      flashcards: '/flashcards',
      resumos: '/resumos',
      listas: '/listas',
      provas: '/provas',
      simulados: '/simulados',
      stats: '/desempenho',
      desempenho: '/desempenho',
      ranking: '/ranking',
      configuracoes: '/configuracoes',
      curadoria: '/admin/curadoria',
      reportes: '/admin/reportes',
      auditoria_medevo: '/admin/medevo'
    };

    const targetRoute = routeMap[tabParam];
    if (targetRoute) {
      const qParam = searchParams.get('q') || searchParams.get('search');
      if (qParam && targetRoute === '/questoes') {
        router.replace(`/questoes?search=${encodeURIComponent(qParam)}`);
      } else {
        router.replace(targetRoute);
      }
    }
  }, [searchParams, router]);

  // 2. Intenção de plano pendente ou redirecionamento ?auth=login
  useEffect(() => {
    try {
      const authParam = searchParams.get('auth');
      if (authParam === 'login' && (!isAuthenticated || !hasUser)) {
        onOpenLoginFromQuery();
        return;
      }

      const planParam = searchParams.get('plan') as PlanId | null;
      const isCheckoutParam = searchParams.get('checkout') === '1';
      const storedPlan = (sessionStorage.getItem('pending_checkout_plan') ||
        localStorage.getItem('pending_checkout_plan')) as PlanId | null;

      const targetPlanId =
        planParam && PLANS[planParam]
          ? planParam
          : storedPlan && PLANS[storedPlan]
            ? storedPlan
            : null;

      if (targetPlanId && PLANS[targetPlanId]) {
        const shouldOpenModal = (!isAuthenticated || !hasUser) && Boolean(isCheckoutParam || planParam);
        onPendingPlanDetected(PLANS[targetPlanId], shouldOpenModal, targetPlanId);
      }
    } catch {
      // ignore storage errors
    }
  }, [isAuthenticated, hasUser, searchParams, onPendingPlanDetected, onOpenLoginFromQuery]);

  return null;
}

export default function RootHomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const { isSubscriptionExpired } = useSubscription();

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register';
    planTitle?: string;
  }>({
    isOpen: false,
    mode: 'login'
  });

  const [pendingCheckoutPlan, setPendingCheckoutPlan] = useState<PlanDefinition | null>(null);

  const isUserFree =
    !user?.subscriptionPlan || user?.subscriptionPlan === 'free' || isSubscriptionExpired;

  // Redirecionamento não-bloqueante: visitantes frios veem o HTML SSR imediato da LandingPage (< 0.6s LCP)
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (pendingCheckoutPlan && isUserFree && !isAdmin) {
        router.replace(`/checkout?plan=${encodeURIComponent(pendingCheckoutPlan.id)}`);
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, pendingCheckoutPlan, isUserFree, isAdmin, router]);

  const handlePendingPlanDetected = useCallback(
    (plan: PlanDefinition, openRegisterModal: boolean, planId: PlanId) => {
      setPendingCheckoutPlan(plan);
      if (openRegisterModal) {
        setAuthModal({ isOpen: true, mode: 'register', planTitle: planId });
      }
    },
    []
  );

  const handleOpenLoginFromQuery = useCallback(() => {
    setAuthModal({ isOpen: true, mode: 'login' });
  }, []);

  const handleOpenAuth = useCallback(
    (mode: 'login' | 'register' = 'login', planIdentifier?: string) => {
      if (planIdentifier) {
        const found = Object.values(PLANS).find(
          (p) => p.id === planIdentifier || p.name.toLowerCase() === planIdentifier.toLowerCase()
        );
        if (found) {
          setPendingCheckoutPlan(found);
        }
      }
      setAuthModal({ isOpen: true, mode, planTitle: planIdentifier });
    },
    []
  );

  if (!isLoading && isAuthenticated && user) {
    return <HippocampusLoading fullScreen message="Acessando painel..." />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--foreground)] flex flex-col font-sans">
      <Suspense fallback={null}>
        <LandingQueryEffects
          isAuthenticated={isAuthenticated}
          hasUser={Boolean(user)}
          onPendingPlanDetected={handlePendingPlanDetected}
          onOpenLoginFromQuery={handleOpenLoginFromQuery}
        />
      </Suspense>

      <LandingPage
        onOpenAuth={(mode = 'login', planTitle) => {
          handleOpenAuth(mode, planTitle);
        }}
        onLoginDemo={() => {
          handleOpenAuth('login');
        }}
      />

      {authModal.isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-xl sm:max-w-[620px] my-auto py-3 sm:py-6">
            <AuthScreen
              initialMode={authModal.mode}
              selectedPlanTitle={authModal.planTitle}
              onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
              onSuccess={(intendedPlan) => {
                setAuthModal({ isOpen: false, mode: 'login' });
                const target = (intendedPlan || authModal.planTitle) as PlanId | undefined;
                if (target && PLANS[target]) {
                  setPendingCheckoutPlan(PLANS[target]);
                  router.push(`/checkout?plan=${encodeURIComponent(target)}`);
                } else {
                  router.push('/dashboard');
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
