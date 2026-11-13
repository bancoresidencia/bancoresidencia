'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LandingPage } from '@/components/LandingPage';
import { AuthScreen } from '@/components/AuthScreen';
import { Logo } from '@/components/Logo';
import { PLANS, PlanId, PlanDefinition } from '@/config/plans';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { Loader2 } from 'lucide-react';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  // 1. Redirecionamento de compatibilidade para links legados com ?tab=...
  useEffect(() => {
    if (typeof window === 'undefined') return;
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

  // 2. Detecta intenção de compra pendente na URL ou Storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
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
        const planDef = PLANS[targetPlanId];
        setPendingCheckoutPlan(planDef);

        if (!isAuthenticated || !user) {
          if (isCheckoutParam || planParam) {
            setAuthModal({ isOpen: true, mode: 'register', planTitle: targetPlanId });
          }
        }
      }
    } catch { }
  }, [isAuthenticated, user, searchParams]);

  // 3. Encaminha usuários autenticados para o Dashboard ou Checkout
  const isUserFree = !user?.subscriptionPlan || user?.subscriptionPlan === 'free' || isSubscriptionExpired;
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (pendingCheckoutPlan && isUserFree && !isAdmin) {
        router.replace(`/checkout?plan=${encodeURIComponent(pendingCheckoutPlan.id)}`);
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, pendingCheckoutPlan, isUserFree, isAdmin, router]);

  const handleOpenAuth = useCallback((mode: 'login' | 'register' = 'login', planIdentifier?: string) => {
    if (planIdentifier) {
      const found = Object.values(PLANS).find(
        (p) => p.id === planIdentifier || p.name.toLowerCase() === planIdentifier.toLowerCase()
      );
      if (found) {
        setPendingCheckoutPlan(found);
      }
    }
    setAuthModal({ isOpen: true, mode, planTitle: planIdentifier });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--foreground)]">
        <div className="flex flex-col items-center gap-3">
          <Logo className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 animate-pulse" glow />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Carregando Hippocampus...
          </span>
        </div>
      </div>
    );
  }

  // Se já está autenticado, exibe tela de transição rápida enquanto o router.replace('/dashboard') conclui
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--foreground)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Acessando a plataforma médica...
          </span>
        </div>
      </div>
    );
  }

  // Visitante não autenticado: Landing Page completa
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--foreground)] flex flex-col font-sans">
      <LandingPage
        onOpenAuth={(mode = 'login', planTitle) => {
          handleOpenAuth(mode, planTitle);
        }}
        onLoginDemo={() => {
          handleOpenAuth('login');
        }}
      />

      {/* Modal de Autenticação (Login / Cadastro) */}
      {authModal.isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
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

export default function RootHomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--foreground)]">
          <div className="flex flex-col items-center gap-3">
            <Logo className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 animate-pulse" glow />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Carregando Hippocampus...
            </span>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
