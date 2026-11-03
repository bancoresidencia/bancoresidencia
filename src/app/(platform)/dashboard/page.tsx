'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StudentHomeDashboard } from '@/components/StudentHomeDashboard';
import { useAuth } from '@/context/AuthContext';
import { useStudentData } from '@/context/StudentDataContext';
import { ActiveTab, QuestionList } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    stats,
    dailyGoal,
    updateDailyGoal,
    lists,
    performanceFilters,
    userAnswers
  } = useStudentData();

  const handleNavigate = (tab: ActiveTab) => {
    const routeMap: Record<string, string> = {
      home: '/dashboard',
      banco: '/questoes',
      caderno_erros: '/caderno-de-erros',
      flashcards: '/flashcards',
      resumos: '/resumos',
      listas: '/listas',
      provas: '/provas',
      simulados: '/simulados',
      stats: '/desempenho',
      ranking: '/ranking',
      configuracoes: '/configuracoes'
    };
    router.push(routeMap[tab] || '/dashboard');
  };

  const handleContinueList = (list: QuestionList) => {
    router.push(`/questoes?listId=${encodeURIComponent(list.id)}`);
  };

  const handleStartOfficialExam = (institution: string, year: number) => {
    router.push(`/provas?institution=${encodeURIComponent(institution)}&year=${year}`);
  };

  const handleNavigateToBancoWithSpecialty = (specialty: string) => {
    router.push(`/questoes?especialidade=${encodeURIComponent(specialty)}`);
  };

  const handleStartTopicPractice = (specialty: string, tema?: string) => {
    router.push(
      `/questoes?especialidade=${encodeURIComponent(specialty)}${
        tema ? `&tema=${encodeURIComponent(tema)}` : ''
      }`
    );
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0 max-w-full overflow-x-clip">
      <StudentHomeDashboard
        studentName={user?.name || 'Médico Residente'}
        stats={stats}
        dailyGoal={dailyGoal}
        onUpdateDailyGoal={updateDailyGoal}
        allLists={lists}
        modalidade={performanceFilters.modalidade}
        onNavigate={handleNavigate}
        onContinueList={handleContinueList}
        onStartOfficialExam={handleStartOfficialExam}
        onNavigateToBancoWithSpecialty={handleNavigateToBancoWithSpecialty}
        onStartTopicPractice={handleStartTopicPractice}
        userAnswers={userAnswers}
      />
    </div>
  );
}

