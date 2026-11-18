'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FlashcardsView } from '@/components/FlashcardsView';
import { HippocampusLoading } from '@/components/HippocampusLoading';

function ResumosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const specialtyParam = searchParams.get('especialidade') || undefined;
  const searchParam = searchParams.get('q') || searchParams.get('tema') || searchParams.get('foco') || '';

  const handleNavigateToBanco = (specialty?: string, tema?: string, subfoco?: string, subSubfoco?: string) => {
    const params = new URLSearchParams();
    if (specialty) params.set('especialidade', specialty);
    if (tema) params.set('tema', tema);
    if (subfoco) params.set('subfoco', subfoco);
    if (subSubfoco) params.set('subSubfoco', subSubfoco);
    params.set('mode', 'filtros');
    router.push(`/questoes?${params.toString()}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <FlashcardsView
        mode="resumos"
        initialSpecialty={specialtyParam}
        initialSearchQuery={searchParam}
        onNavigateToBanco={handleNavigateToBanco}
      />
    </div>
  );
}

export default function ResumosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center p-8">
          <HippocampusLoading size="md" message="Carregando acervo de resumos..." fullScreen={false} />
        </div>
      }
    >
      <ResumosContent />
    </Suspense>
  );
}

