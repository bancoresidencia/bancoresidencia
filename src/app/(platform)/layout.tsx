'use client';

import React from 'react';
import { StudentDataProvider } from '@/context/StudentDataContext';
import { TabAvailabilityProvider } from '@/context/TabAvailabilityContext';
import { StudyTimerProvider } from '@/context/StudyTimerContext';
import { AppShell } from '@/components/layout/AppShell';
import { HippocampusLoading } from '@/components/HippocampusLoading';
import { useAuth } from '@/context/AuthContext';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading && !user) {
    return <HippocampusLoading fullScreen message="Sincronizando ambiente..." />;
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
