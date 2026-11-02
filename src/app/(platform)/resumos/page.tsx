'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FlashcardsView } from '@/components/FlashcardsView';

export default function ResumosPage() {
  const router = useRouter();

  const handleNavigateToBanco = (specialty?: string, tema?: string) => {
    const params = new URLSearchParams();
    if (specialty) params.set('especialidade', specialty);
    if (tema) params.set('tema', tema);
    params.set('mode', 'filtros');
    router.push(`/questoes?${params.toString()}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <FlashcardsView
        mode="resumos"
        onNavigateToBanco={handleNavigateToBanco}
      />
    </div>
  );
}

