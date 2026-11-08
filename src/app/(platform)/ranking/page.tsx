'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { OfficialRanking } from '@/components/OfficialRanking';
import { useAuth } from '@/context/AuthContext';
import { useStudentData } from '@/context/StudentDataContext';
import { getOfficialRanking } from '@/utils/percentile';
import { LeaderboardResponse } from '@/services/rankingService';

export default function RankingPage() {
  const { user } = useAuth();
  const { stats, performanceFilters, userAnswers } = useStudentData();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);

  // Lista de tentativas reais do aluno logado
  const userAttempts = useMemo(() => {
    return Object.entries(userAnswers).map(([qid, a]) => ({
      question_id: qid,
      difficulty: a.difficulty,
      correct: a.isCorrect,
      user_id: user?.id || 'current-user',
      timestamp: a.timestamp || 0,
      banca: a.banca,
      year: a.year
    }));
  }, [userAnswers, user?.id]);

  // Ranking local de contingência imediata (0ms)
  const localFallbackRanking = useMemo(() => {
    return getOfficialRanking(performanceFilters, {
      answered: stats.totalAnswered,
      correct: stats.totalCorrect,
      name: user?.name || 'Você',
      attempts: userAttempts
    });
  }, [performanceFilters, stats.totalAnswered, stats.totalCorrect, user?.name, userAttempts]);

  // Busca o ranking consolidado em tempo real da base de dados do Supabase
  const fetchLeaderboard = useCallback(async (refresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (performanceFilters.banca && performanceFilters.banca !== 'Todas') {
        params.set('banca', performanceFilters.banca);
      }
      if (performanceFilters.institutions && performanceFilters.institutions.length > 0) {
        params.set('institution', performanceFilters.institutions[0]);
      }
      if (performanceFilters.modalidade) {
        params.set('modalidade', performanceFilters.modalidade);
      }
      if (refresh) {
        params.set('refresh', 'true');
      }

      const res = await fetch(`/api/ranking?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Falha ao sincronizar dados do ranking.');
      }
      const data: LeaderboardResponse = await res.json();
      if (data && data.success) {
        setLeaderboardData(data);
      }
    } catch (err) {
      console.warn('[RankingPage] Usando ranking local devido a instabilidade:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar ranking.');
    } finally {
      setIsLoading(false);
    }
  }, [performanceFilters.banca, performanceFilters.institutions, performanceFilters.modalidade]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <OfficialRanking
        ranking={localFallbackRanking}
        candidates={leaderboardData?.candidates}
        currentUserLeaderboard={leaderboardData?.currentUser}
        filters={performanceFilters}
        userQuestions={stats.totalAnswered}
        userPercentile={leaderboardData?.currentUser?.percentile ?? stats.percentileInfo.percentile ?? undefined}
        userCorrect={stats.totalCorrect}
        userName={user?.name || 'Você'}
        isLoading={isLoading}
        onRefresh={() => fetchLeaderboard(true)}
      />
    </div>
  );
}
