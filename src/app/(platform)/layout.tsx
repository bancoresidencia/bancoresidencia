'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { StudentDataProvider } from '@/context/StudentDataContext';
import { TabAvailabilityProvider } from '@/context/TabAvailabilityContext';
import { StudyTimerProvider } from '@/context/StudyTimerContext';
import { AppShell } from '@/components/layout/AppShell';
import { HippocampusLoading } from '@/components/HippocampusLoading';
import { useAuth } from '@/context/AuthContext';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const isCheckout = pathname === '/checkout';

  useEffect(() => {
    if (!isLoading && !user && !isCheckout) {
      router.replace(`/login?mode=register&next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, isCheckout, pathname, router]);

  if (isLoading && !user) {
    return <HippocampusLoading fullScreen message="Sincronizando ambiente..." />;
  }

  if (!user && !isCheckout) {
    return <HippocampusLoading fullScreen message="Redirecionando para criação de conta..." />;
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
