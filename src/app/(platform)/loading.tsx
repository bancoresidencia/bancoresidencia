'use client';

import React from 'react';
import { DeferredSkeleton } from '@/components/ui';
import { GenericTabSkeleton } from '@/components/layout/PlatformTabSkeletons';

/**
 * Transição entre abas da plataforma Hippocampus:
 * exibe skeleton estrutural apenas quando a transição ultrapassa o limiar rápido (150ms).
 */
export default function PlatformLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-w-0">
      <DeferredSkeleton delayMs={150}>
        <GenericTabSkeleton />
      </DeferredSkeleton>
    </div>
  );
}
