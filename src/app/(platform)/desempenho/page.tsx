'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const StatsDashboard = dynamic(
  () => import('@/components/StatsDashboard').then((mod) => mod.StatsDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs text-slate-400 font-medium">Carregando métricas psicométricas...</span>
      </div>
    )
  }
);
import { useAuth } from '@/context/AuthContext';
import { useStudentData } from '@/context/StudentDataContext';

export default function DesempenhoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    stats,
    performanceFilters,
    setPerformanceFilters,
    handleResetPerformanceFilters,
    userAnswers
  } = useStudentData();

  const handleNavigateToBancoWithSubfoco = (specialty: string, tema: string, subfoco: string, subSubfoco?: string) => {
    const params = new URLSearchParams({
      especialidade: specialty,
      tema,
      subfoco,
      mode: 'filtros'
    });
    if (subSubfoco) params.set('subSubfoco', subSubfoco);
    router.push(`/questoes?${params.toString()}`);
  };

  const handleNavigateToRanking = () => {
    router.push('/ranking');
  };

  const handleNavigateToCadernoErros = () => {
    router.push('/caderno-de-erros');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <StatsDashboard
        stats={stats}
        filters={performanceFilters}
        onFilterChange={setPerformanceFilters}
        onResetFilters={handleResetPerformanceFilters}
        onNavigateToBancoWithSubfoco={handleNavigateToBancoWithSubfoco}
        onNavigateToRanking={handleNavigateToRanking}
        onNavigateToCadernoErros={handleNavigateToCadernoErros}
        userAnswers={userAnswers}
        user={user}
      />
    </div>
  );
}

