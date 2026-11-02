'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MockExams } from '@/components/MockExams';

export default function SimuladosPage() {
  const router = useRouter();

  const handleStartExam = (examTitle: string) => {
    router.push(`/questoes?search=${encodeURIComponent(examTitle)}&mode=resolucao`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <MockExams onStartExam={handleStartExam} />
    </div>
  );
}

