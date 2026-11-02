'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StatsDashboard } from '@/components/StatsDashboard';
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

  const handleNavigateToBancoWithSubfoco = (specialty: string, tema: string, subfoco: string) => {
    const params = new URLSearchParams({
      especialidade: specialty,
      tema,
      subfoco,
      mode: 'filtros'
    });
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

