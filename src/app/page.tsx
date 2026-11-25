'use client';

import { Suspense, useCallback, useEffect, useState, type SyntheticEvent } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { HippocampusLoading } from '@/components/HippocampusLoading';
import { HippocampusStartupStatus } from '@/components/HippocampusStartupStatus';
import { LandingPage } from '@/components/LandingPage';
import { isPlanId, type PlanId } from '@/config/plans';
import { useAuth } from '@/context/AuthContext';
import { captureReferralFromUrl } from '@/utils/referralCapture';
import { useOverlayDismiss } from '@/hooks/useOverlayDismiss';

const loadAuthScreen = () => import('@/components/AuthScreen').then((module) => module.AuthScreen);

const AuthScreen = dynamic(loadAuthScreen,
  { loading: () => <HippocampusLoading fullScreen={false} size="md" /> }
);

function warmAuthScreen(event: SyntheticEvent) {
  if (event.target instanceof Element && event.target.closest('[data-landing-auth]')) {
    void loadAuthScreen().catch(() => {});
  }
}

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
    void captureReferralFromUrl(searchParams);
  }, [searchParams]);

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const [authModal, setAuthModal] = useState<AuthRequest | null>(null);

  const handleOpenAuth = useCallback((mode: AuthMode = 'login', planTitle?: string) => {
    setAuthModal({ mode, planTitle });
  }, []);

  const handleCloseAuth = useCallback(() => {
    setAuthModal(null);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('checkout') || url.searchParams.has('login') || url.searchParams.has('auth') || url.searchParams.has('plan')) {
          url.searchParams.delete('checkout');
          url.searchParams.delete('login');
          url.searchParams.delete('auth');
          url.searchParams.delete('plan');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        }
      } catch {}
    }
  }, []);

  const handleDemoLogin = useCallback(() => handleOpenAuth('login'), [handleOpenAuth]);

  useOverlayDismiss({ isOpen: Boolean(authModal), onClose: handleCloseAuth });

  return (
    <>
      <Suspense fallback={null}>
        <HomeNavigation onAuthRequest={setAuthModal} />
      </Suspense>

      {isAuthenticated && user ? (
        <HippocampusStartupStatus message="Preparando seu ambiente..." />
      ) : (
        <div
          className="min-h-screen bg-[var(--bg-page)] text-[var(--foreground)] flex flex-col font-inter"
          data-hippo-startup-pending={isLoading || undefined}
          style={{ fontFamily: 'var(--font-inter), "Inter", sans-serif' }}
          onPointerOver={warmAuthScreen}
          onPointerDownCapture={warmAuthScreen}
          onFocusCapture={warmAuthScreen}
        >
          <LandingPage onOpenAuth={handleOpenAuth} onLoginDemo={handleDemoLogin} />

          {authModal && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn cursor-pointer"
              onClick={(e) => {
                if (e.target === e.currentTarget) handleCloseAuth();
              }}
            >
              <div className="w-full max-w-xl sm:max-w-[620px] my-auto py-3 sm:py-6 cursor-default">
                <AuthScreen
                  key={authModal.mode + '-' + (authModal.planTitle || 'default')}
                  initialMode={authModal.mode}
                  selectedPlanTitle={authModal.planTitle}
                  onClose={handleCloseAuth}
                  onSuccess={() => {
                    handleCloseAuth();
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
