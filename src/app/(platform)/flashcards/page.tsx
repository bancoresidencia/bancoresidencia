'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FlashcardsView } from '@/components/FlashcardsView';
import { DeferredSkeleton } from '@/components/ui';
import { FlashcardsOrResumosSkeleton } from '@/components/layout/PlatformTabSkeletons';

function FlashcardsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isErrorsMode = searchParams.get('mode') === 'erros';
  const temaParam = searchParams.get('tema') || searchParams.get('foco') || '';

  const handleNavigateToBanco = (specialty?: string, tema?: string) => {
    const params = new URLSearchParams();
    if (specialty) params.set('especialidade', specialty);
    if (tema) params.set('tema', tema);
    params.set('mode', 'filtros');
    router.push(`/questoes?${params.toString()}`);
  };

  return (
    <FlashcardsView
      mode="flashcards"
      initialFilterErrorsOnly={isErrorsMode}
      initialSearchQuery={temaParam}
      onNavigateToBanco={handleNavigateToBanco}
    />
  );
}

export default function FlashcardsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <Suspense
        fallback={
          <DeferredSkeleton delayMs={150}>
            <FlashcardsOrResumosSkeleton />
          </DeferredSkeleton>
        }
      >
        <FlashcardsContent />
      </Suspense>
    </div>
  );
}
