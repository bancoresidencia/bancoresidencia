'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthScreen } from '@/components/AuthScreen';
import { useAuth } from '@/context/AuthContext';
import { HippocampusLoading } from '@/components/HippocampusLoading';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();

  const nextRoute = searchParams.get('next') || '/dashboard';
  const modeParam = searchParams.get('mode') || searchParams.get('auth');
  const initialMode: 'login' | 'register' = modeParam === 'register' ? 'register' : 'login';

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(nextRoute);
    }
  }, [isLoading, isAuthenticated, user, nextRoute, router]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#09090b]">
        <HippocampusLoading size="md" message="Verificando acesso..." fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-page)] text-[var(--foreground)] flex items-start sm:items-center justify-center px-3 pt-[max(0.875rem,env(safe-area-inset-top,0px))] pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] sm:p-6 overflow-y-auto">
      <div className="w-full max-w-xl sm:max-w-[540px] my-auto">
        <AuthScreen
          initialMode={initialMode}
          onClose={() => router.push('/')}
          onSuccess={() => {
            router.push(nextRoute);
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-[#09090b]">
          <HippocampusLoading size="md" message="Verificando acesso..." fullScreen={false} />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

