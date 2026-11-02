'use client';

import React, { useMemo } from 'react';
import { OfficialRanking } from '@/components/OfficialRanking';
import { useAuth } from '@/context/AuthContext';
import { useStudentData } from '@/context/StudentDataContext';
import { getOfficialRanking } from '@/utils/percentile';

export default function RankingPage() {
  const { user } = useAuth();
  const { stats, performanceFilters } = useStudentData();

  const ranking = useMemo(() => {
    return getOfficialRanking(performanceFilters, {
      answered: stats.totalAnswered,
      correct: stats.totalCorrect,
      name: user?.name || 'Você'
    });
  }, [performanceFilters, stats.totalAnswered, stats.totalCorrect, user?.name]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <OfficialRanking
        ranking={ranking}
        filters={performanceFilters}
        userQuestions={stats.totalAnswered}
        userPercentile={stats.percentileInfo.percentile ?? undefined}
        userCorrect={stats.totalCorrect}
        userName={user?.name || 'Você'}
      />
    </div>
  );
}
