'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OfficialExams } from '@/components/OfficialExams';
import { OfficialExamItem, ExamResolutionMode } from '@/types/officialExams';

export default function ProvasPage() {
  const router = useRouter();

  const handleStartExam = (
    institution: string,
    year: number,
    banca?: string,
    examDetails?: OfficialExamItem,
    mode?: ExamResolutionMode
  ) => {
    const params = new URLSearchParams({
      instituicao: institution,
      ano: String(year),
      mode: 'resolucao'
    });
    if (banca) params.set('banca', banca);
    if (mode) params.set('examMode', mode);
    if (examDetails?.id) params.set('examId', examDetails.id);

    router.push(`/questoes?${params.toString()}`);
  };

  const handleExploreInFilters = (institution: string, year: number) => {
    router.push(
      `/questoes?instituicao=${encodeURIComponent(institution)}&ano=${year}&mode=filtros`
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <OfficialExams
        onStartExam={handleStartExam}
        onExploreInFilters={handleExploreInFilters}
      />
    </div>
  );
}

