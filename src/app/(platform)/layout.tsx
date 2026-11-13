'use client';

import React from 'react';
import { StudentDataProvider } from '@/context/StudentDataContext';
import { TabAvailabilityProvider } from '@/context/TabAvailabilityContext';
import { StudyTimerProvider } from '@/context/StudyTimerContext';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // Enquanto a autenticação estiver checando a sessão e não houver usuário em cache,
  // evita exibir o dashboard em estado de visitante temporário ("Médico Residente", 0 métricas)
  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--foreground)]">
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-200">
          <Logo className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 animate-pulse" glow />
          <span className="text-xs font-semibold tracking-wide text-slate-500 dark:text-zinc-400">
            Carregando sua plataforma médica...
          </span>
        </div>
      </div>
    );
  }

  return (
    <StudentDataProvider>
      <TabAvailabilityProvider>
        <StudyTimerProvider>
          <AppShell>{children}</AppShell>
        </StudyTimerProvider>
      </TabAvailabilityProvider>
    </StudentDataProvider>
  );
}
