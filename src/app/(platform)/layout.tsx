'use client';

import React from 'react';
import { StudentDataProvider } from '@/context/StudentDataContext';
import { AppShell } from '@/components/layout/AppShell';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentDataProvider>
      <AppShell>{children}</AppShell>
    </StudentDataProvider>
  );
}

