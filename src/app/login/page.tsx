'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthScreen } from '@/components/AuthScreen';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();

  const nextRoute = searchParams.get('next') || '/dashboard';

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(nextRoute);
    }
  }, [isLoading, isAuthenticated, user, nextRoute, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--foreground)] flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-xl sm:max-w-[620px] my-auto">
        <AuthScreen
          initialMode="login"
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
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

