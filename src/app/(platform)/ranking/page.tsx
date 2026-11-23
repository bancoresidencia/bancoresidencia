'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { OfficialRanking } from '@/components/OfficialRanking';
import { useAuth } from '@/context/AuthContext';
import { useStudentData } from '@/context/StudentDataContext';
import type { LeaderboardResponse, RankingModality, RankingTab } from '@/types/ranking';
import { RANKING_PERCENTILE_EVENT, rankingPercentileStorageKey } from '@/utils/rankingPercentileCache';

const PAGE_SIZE = 25;
const MAX_CACHED_SCOPES = 8;
const PAGE_CLASS = 'mx-auto w-full min-w-0 max-w-6xl p-4 pb-24 sm:p-6 lg:p-8';

interface Selection {
  tab: RankingTab;
  modalidade: RankingModality | '';
  offset: number;
  revision: number;
  refresh: boolean;
}

interface RankingState {
  scopes: Map<string, LeaderboardResponse>;
  latest: { data: LeaderboardResponse; filterKey: string } | null;
  completedRequest: string | null;
  error: boolean;
}

function StudentRanking({ userId }: { userId: string }) {
  const { performanceFilters } = useStudentData();
  const [selection, setSelection] = useState<Selection>({
    tab: 'official', modalidade: '', offset: 0, revision: 0, refresh: false,
  });
  const [state, setState] = useState<RankingState>(() => ({
    scopes: new Map(), latest: null, completedRequest: null, error: false,
  }));

  const filters = new URLSearchParams({ limit: String(PAGE_SIZE), platformScores: 'false' });
  const banca = performanceFilters.banca === 'Todas' ? '' : performanceFilters.banca;
  const institutions = performanceFilters.institutions.slice(0, 15);
  if (banca) filters.set('banca', banca);
  for (const institution of institutions) filters.append('institution', institution);
  if (selection.modalidade) filters.set('modalidade', selection.modalidade);
  const filterKey = filters.toString();
  filters.set('tab', selection.tab);
  const scopeKey = filters.toString();
  filters.set('offset', String(selection.offset));
  if (selection.refresh) filters.set('refresh', 'true');
  const query = filters.toString();
  const requestKey = `${query}:${selection.revision}`;

  useEffect(() => {
    const controller = new AbortController();
    async function loadRanking() {
      try {
        const response = await fetch(`/api/ranking?${query}`, { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('Ranking indisponível.');
        const data: LeaderboardResponse = await response.json();
        if (controller.signal.aborted) return;
        if (!data.success) throw new Error('Ranking indisponível.');
        setState((previous) => {
          const scopes = new Map(previous.scopes);
          scopes.delete(scopeKey);
          scopes.set(scopeKey, data);
          const oldestScope = scopes.keys().next().value;
          if (scopes.size > MAX_CACHED_SCOPES && oldestScope) scopes.delete(oldestScope);
          return { scopes, latest: { data, filterKey }, completedRequest: requestKey, error: false };
        });

        try {
          const key = rankingPercentileStorageKey(userId);
          if (data.currentUser) localStorage.setItem(key, String(data.currentUser.percentile));
          else localStorage.removeItem(key);
          window.dispatchEvent(new Event(RANKING_PERCENTILE_EVENT));
        } catch { /* Ranking data is still available without local storage. */ }
      } catch {
        if (controller.signal.aborted) return;
        setState((previous) => ({ ...previous, completedRequest: requestKey, error: true }));
      }
    }
    void loadRanking();
    return () => controller.abort();
  }, [query, requestKey, scopeKey, filterKey, userId]);

  function changeSelection(changes: Partial<Omit<Selection, 'revision'>>) {
    setSelection((previous) => ({ ...previous, refresh: false, ...changes, revision: previous.revision + 1 }));
  }

  const loading = state.completedRequest !== requestKey;
  const activeData = state.scopes.get(scopeKey);
  const counts = activeData ?? (state.latest?.filterKey === filterKey ? state.latest.data : undefined);

  return (
    <OfficialRanking
      data={activeData}
      summary={state.latest?.data}
      counts={counts}
      tab={selection.tab}
      modalidade={selection.modalidade}
      banca={banca}
      institutions={institutions}
      loading={loading}
      error={!loading && state.error}
      onTabChange={(tab) => changeSelection({ tab, offset: 0 })}
      onModalityChange={(modalidade) => changeSelection({ modalidade, offset: 0 })}
      onPageChange={(offset) => changeSelection({ offset })}
      onRefresh={() => changeSelection({ refresh: true })}
    />
  );
}

export default function RankingPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className={PAGE_CLASS}>
      {user ? (
        <StudentRanking key={user.id} userId={user.id} />
      ) : (
        <Card className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-[#121215]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-zinc-200/80 bg-zinc-50 text-[var(--primary-color)] shadow-2xs dark:border-zinc-800 dark:bg-[#121215]">
              <Trophy className="size-5" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
                Ranking Nacional de Candidatos
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Classificação psicométrica oficial por Teoria de Resposta ao Item (TRI 2PL)
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400" role="status">
            {isLoading
              ? 'Carregando ranking…'
              : 'Faça login na plataforma para consultar sua posição consolidada e a classificação nacional.'}
          </p>
        </Card>
      )}
    </div>
  );
}
