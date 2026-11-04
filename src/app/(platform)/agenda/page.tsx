'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AgendaView } from '@/components/AgendaView';

export default function AgendaPage() {
  const router = useRouter();

  const handleNavigateToBanco = (specialty?: string, tema?: string) => {
    const params = new URLSearchParams();
    if (specialty) params.set('especialidade', specialty);
    if (tema) params.set('tema', tema);
    params.set('mode', 'filtros');
    router.push(`/questoes?${params.toString()}`);
  };

  const handleNavigateToFlashcards = () => {
    router.push('/flashcards');
  };

  const handleNavigateToCadernoErros = () => {
    router.push('/caderno-de-erros');
  };

  const handleNavigateToSimulados = () => {
    router.push('/simulados');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <AgendaView
        onNavigateToBanco={handleNavigateToBanco}
        onNavigateToFlashcards={handleNavigateToFlashcards}
        onNavigateToCadernoErros={handleNavigateToCadernoErros}
        onNavigateToSimulados={handleNavigateToSimulados}
      />
    </div>
  );
}
