import React from 'react';
import { DeferredSkeleton } from '@/components/ui';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

export default function DashboardLoading() {
  return (
    <div data-hippo-startup-pending className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-w-0 overflow-x-clip">
      <DeferredSkeleton delayMs={150}>
        <DashboardSkeleton />
      </DeferredSkeleton>
    </div>
  );
}
