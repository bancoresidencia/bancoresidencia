'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StudentDataProvider } from '@/context/StudentDataContext';
import { AppShell } from '@/components/layout/AppShell';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.replace('/dashboard');
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--foreground)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-page)] text-[var(--foreground)]">
        <ShieldAlert className="w-12 h-12 text-rose-500 mb-3" />
        <h1 className="text-xl font-bold">Acesso Restrito</h1>
        <p className="text-xs text-slate-500 mt-1">
          Esta área é reservada para administradores e curadores médicos.
        </p>
      </div>
    );
  }

  return (
    <StudentDataProvider>
      <AppShell>{children}</AppShell>
    </StudentDataProvider>
  );
}

