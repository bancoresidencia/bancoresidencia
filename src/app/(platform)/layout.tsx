'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentDataProvider } from '@/context/StudentDataContext';
import { TabAvailabilityProvider } from '@/context/TabAvailabilityContext';
import { StudyTimerProvider } from '@/context/StudyTimerContext';
import { AppShell } from '@/components/layout/AppShell';
import { HippocampusStartupStatus } from '@/components/HippocampusStartupStatus';
import { useAuth } from '@/context/AuthContext';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <HippocampusStartupStatus message="Sincronizando ambiente..." />;
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
