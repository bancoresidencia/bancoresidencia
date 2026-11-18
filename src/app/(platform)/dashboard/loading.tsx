import React from 'react';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-w-0 overflow-x-clip">
      <DashboardSkeleton />
    </div>
  );
}
