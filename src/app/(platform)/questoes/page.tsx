'use client';

import { useSearchParams } from 'next/navigation';
import { PracticeExam } from '@/components/PracticeExam';
import React, { Suspense } from 'react';
import { QuestoesView } from '@/components/QuestoesView';
import { HippocampusLoading } from '@/components/HippocampusLoading';

function QuestionActivity() {
  const params = useSearchParams()
  if (params.get('examMode') === 'exam' && params.get('examId')) {
    return <PracticeExam exam={params.get('examId')!} institution={params.get('instituicao') || ''} year={Number(params.get('ano'))} />
  }
  return <QuestoesView />
}

export default function QuestoesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <HippocampusLoading size="md" message="Carregando Banco de Questões..." fullScreen={false} />
        </div>
      }
    >
      <QuestionActivity />
    </Suspense>
  );
}

