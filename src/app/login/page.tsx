'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthScreen } from '@/components/AuthScreen';
import { useAuth } from '@/context/AuthContext';
import { HippocampusStartupStatus } from '@/components/HippocampusStartupStatus';

const checkingAccess = <HippocampusStartupStatus message="Verificando acesso..." />;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();

  const rawNext = searchParams.get('next');
  const nextRoute = (rawNext && !rawNext.startsWith('/checkout')) ? rawNext : '/dashboard';

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(nextRoute);
    }
  }, [isLoading, isAuthenticated, user, nextRoute, router]);

  if (isLoading) {
    return checkingAccess;
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-page)] text-[var(--foreground)] flex items-start sm:items-center justify-center px-3 pt-[max(0.875rem,env(safe-area-inset-top,0px))] pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] sm:p-6 overflow-y-auto">
      <div className="w-full max-w-xl sm:max-w-[540px] my-auto">
        <AuthScreen
          initialMode="login"
          onClose={() => router.push('/')}
          onSuccess={() => {
            try {
              sessionStorage.removeItem('pending_checkout_plan');
              localStorage.removeItem('pending_checkout_plan');
            } catch { }
            router.push(nextRoute);
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={checkingAccess}>
      <LoginContent />
    </Suspense>
  );
}

