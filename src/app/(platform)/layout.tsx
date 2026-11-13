'use client';

import React from 'react';
import { StudentDataProvider } from '@/context/StudentDataContext';
import { TabAvailabilityProvider } from '@/context/TabAvailabilityContext';
import { StudyTimerProvider } from '@/context/StudyTimerContext';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // Enquanto a autenticação estiver checando a sessão, o HippocampusGlobalSplash cobre a tela
  if (isLoading && !user) {
    return null;
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
