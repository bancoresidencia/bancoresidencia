'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { HippocampusLoading } from '@/components/HippocampusLoading';
import { LandingPage } from '@/components/LandingPage';
import { isPlanId, type PlanId } from '@/config/plans';
import { useAuth } from '@/context/AuthContext';

const AuthScreen = dynamic(
  () => import('@/components/AuthScreen').then((module) => module.AuthScreen),
  { loading: () => <HippocampusLoading fullScreen={false} size="md" /> }
);

type AuthMode = 'login' | 'register';
type AuthRequest = { mode: AuthMode; planTitle?: string };

const legacyRoutes = new Map([
  ['home', '/dashboard'],
  ['agenda', '/agenda'],
  ['banco', '/questoes'],
  ['caderno_erros', '/caderno-de-erros'],
  ['cadernos', '/caderno-de-erros'],
  ['flashcards', '/flashcards'],
  ['resumos', '/resumos'],
  ['listas', '/listas'],
  ['provas', '/provas'],
  ['simulados', '/simulados'],
  ['stats', '/desempenho'],
  ['desempenho', '/desempenho'],
  ['ranking', '/ranking'],
  ['configuracoes', '/configuracoes'],
  ['curadoria', '/admin/curadoria'],
  ['reportes', '/admin/reportes'],
  ['auditoria_medevo', '/admin/medevo'],
]);

function readStoredPlan(): PlanId | null {
  try {
    const storedPlan = sessionStorage.getItem('pending_checkout_plan') ||
      localStorage.getItem('pending_checkout_plan');
    return isPlanId(storedPlan) ? storedPlan : null;
  } catch {
    return null;
  }
}

function HomeNavigation({
  onAuthRequest,
}: {
  onAuthRequest: (request: AuthRequest) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isSignedIn = Boolean(isAuthenticated && user);

  useEffect(() => {
    const legacyRoute = legacyRoutes.get(searchParams.get('tab') ?? '');
    if (!legacyRoute) return;

    const query = searchParams.get('q') || searchParams.get('search');
    router.replace(query && legacyRoute === '/questoes'
      ? '/questoes?search=' + encodeURIComponent(query)
      : legacyRoute);
  }, [router, searchParams]);

  useEffect(() => {
    if (isSignedIn || legacyRoutes.has(searchParams.get('tab') ?? '')) return;

    const authParam = searchParams.get('auth') || searchParams.get('mode');
    if (searchParams.get('login') === '1' || authParam === 'login') {
      onAuthRequest({ mode: 'login' });
      return;
    }
    if (authParam === 'register') {
      onAuthRequest({ mode: 'register' });
      return;
    }

    const planParam = searchParams.get('plan');
    const plan = isPlanId(planParam) ? planParam : readStoredPlan();
    if (plan && (searchParams.get('checkout') === '1' || planParam)) {
      onAuthRequest({ mode: 'register', planTitle: plan });
    }
  }, [isSignedIn, onAuthRequest, searchParams]);

  useEffect(() => {
    if (isLoading || !isSignedIn || legacyRoutes.has(searchParams.get('tab') ?? '')) return;

    try {
      sessionStorage.removeItem('pending_checkout_plan');
      localStorage.removeItem('pending_checkout_plan');
    } catch { }

    router.replace('/dashboard');
  }, [isLoading, isSignedIn, router, searchParams]);

  return null;
}

export default function RootHomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [authModal, setAuthModal] = useState<AuthRequest | null>(null);

  const handleOpenAuth = useCallback((mode: AuthMode = 'login', planTitle?: string) => {
    setAuthModal({ mode, planTitle });
  }, []);

  const handleDemoLogin = useCallback(() => handleOpenAuth('login'), [handleOpenAuth]);

  return (
    <>
      <Suspense fallback={null}>
        <HomeNavigation onAuthRequest={setAuthModal} />
      </Suspense>

      {!(isAuthenticated && user) && (
        <div
          className="min-h-screen bg-[var(--bg-page)] text-[var(--foreground)] flex flex-col font-inter"
          style={{ fontFamily: 'var(--font-inter), "Inter", sans-serif' }}
        >
          <LandingPage onOpenAuth={handleOpenAuth} onLoginDemo={handleDemoLogin} />

          {authModal && (
            <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
              <div className="w-full max-w-xl sm:max-w-[620px] my-auto py-3 sm:py-6">
                <AuthScreen
                  key={authModal.mode + '-' + (authModal.planTitle || 'default')}
                  initialMode={authModal.mode}
                  selectedPlanTitle={authModal.planTitle}
                  onClose={() => setAuthModal(null)}
                  onSuccess={() => {
                    setAuthModal(null);
                    try {
                      sessionStorage.removeItem('pending_checkout_plan');
                      localStorage.removeItem('pending_checkout_plan');
                    } catch { }
                    router.push('/dashboard');
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
