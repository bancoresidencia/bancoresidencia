import React from 'react';
import { DeferredSkeleton } from '@/components/ui';
import { CronogramaSkeleton } from '@/components/layout/PlatformTabSkeletons';

export default function CronogramaLoading() {
  return (
    <div className="p-3 sm:p-5 lg:p-6 max-w-[1700px] mx-auto">
      <DeferredSkeleton delayMs={150}>
        <CronogramaSkeleton />
      </DeferredSkeleton>
    </div>
  );
}
