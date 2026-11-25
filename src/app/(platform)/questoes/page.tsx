'use client';

import { useSearchParams } from 'next/navigation';
import { PracticeExam } from '@/components/PracticeExam';
import React, { Suspense } from 'react';
import { QuestoesView } from '@/components/QuestoesView';
import { DeferredSkeleton } from '@/components/ui';
import { QuestoesFiltersSkeleton } from '@/components/layout/PlatformTabSkeletons';

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
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <DeferredSkeleton delayMs={150}>
            <QuestoesFiltersSkeleton />
          </DeferredSkeleton>
        </div>
      }
    >
      <QuestionActivity />
    </Suspense>
  );
}

