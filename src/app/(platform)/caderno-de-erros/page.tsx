'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CadernoDeErros } from '@/components/CadernoDeErros';
import { useStudentData } from '@/context/StudentDataContext';

export default function CadernoDeErrosPage() {
  const router = useRouter();
  const { userAnswers, updateAnswerMeta, recordAnswer } = useStudentData();

  const handleStartTreinoErros = (questionIds: string[]) => {
    if (!questionIds || questionIds.length === 0) return;
    router.push(`/questoes?ids=${questionIds.join(',')}&mode=resolucao`);
  };

  const handleNavigateToBanco = (specialty?: string, tema?: string, subfoco?: string) => {
    const params = new URLSearchParams();
    if (specialty) params.set('especialidade', specialty);
    if (tema) params.set('tema', tema);
    if (subfoco) params.set('subfoco', subfoco);
    params.set('mode', 'filtros');
    router.push(`/questoes?${params.toString()}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <CadernoDeErros
        userAnswers={userAnswers}
        onUpdateAnswerMeta={updateAnswerMeta}
        onAnswerQuestion={recordAnswer}
        onStartTreinoErros={handleStartTreinoErros}
        onNavigateToBanco={handleNavigateToBanco}
      />
    </div>
  );
}

