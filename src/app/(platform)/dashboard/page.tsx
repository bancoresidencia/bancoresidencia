'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const StudentHomeDashboard = dynamic(
  () => import('@/components/StudentHomeDashboard').then((mod) => mod.StudentHomeDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs text-slate-400 font-medium">Carregando painel de estudos...</span>
      </div>
    )
  }
);
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
      agenda: '/agenda',
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200 min-w-0 overflow-x-clip">
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

