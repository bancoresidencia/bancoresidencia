import React from 'react';
import { DeferredSkeleton } from '@/components/ui';
import { FlashcardsOrResumosSkeleton } from '@/components/layout/PlatformTabSkeletons';

export default function FlashcardsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <DeferredSkeleton delayMs={150}>
        <FlashcardsOrResumosSkeleton />
      </DeferredSkeleton>
    </div>
  );
}
