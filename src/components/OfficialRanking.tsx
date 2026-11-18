'use client';

import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, RefreshCw, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { RankingCandidateList, RankingPodium } from '@/components/ranking/RankingStandings';
import { RANKING_MODALITIES, RANKING_TABS } from '@/types/ranking';
import type { LeaderboardResponse, RankingModality, RankingTab } from '@/types/ranking';
import { getRankingStatus } from '@/utils/irtModel';

const integer = new Intl.NumberFormat('pt-BR');
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const tabLabels: Record<RankingTab, string> = { all: 'Geral', official: 'Oficial', provisional: 'Provisório' };
const scopeNotes: Partial<Record<RankingTab, string>> = {
  official: 'A partir de 500 questões válidas.',
  provisional: 'De 150 a 499 questões válidas.',
};

interface OfficialRankingProps {
  data?: LeaderboardResponse;
  summary?: LeaderboardResponse;
  counts?: LeaderboardResponse;
  tab: RankingTab;
  modalidade: RankingModality | '';
  banca: string;
  institutions: string[];
  loading: boolean;
  error: boolean;
  onTabChange: (tab: RankingTab) => void;
  onModalityChange: (modality: RankingModality | '') => void;
  onPageChange: (offset: number) => void;
  onRefresh: () => void;
}

function PositionSummary({ summary, data, tab, filtered }: {
  summary: LeaderboardResponse;
  data?: LeaderboardResponse;
  tab: RankingTab;
  filtered: boolean;
}) {
  const student = summary.currentUser;
  const validCount = summary.currentUserProgress.totalAnswered;
  const status = getRankingStatus(validCount);
  const scopeRank = data?.currentScopeRank;
  const missing = status.missingForNextTier;
  const showScopePosition = scopeRank != null && (tab !== 'all' || filtered);
  const scopeLabel = tab === 'all' ? 'no recorte' : `no ${tabLabels[tab]}`;

  return (
    <Card className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-l-[3px] border-l-[var(--primary-color)] px-3.5 py-3.5 motion-reduce:transition-none sm:p-5" aria-labelledby="ranking-position-heading">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="ranking-position-heading" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Sua posição geral</h2>
          {student && <Badge variant="outline" size="sm" className="motion-reduce:transition-none">{status.badgeLabel}</Badge>}
        </div>
        {student ? (
          <p className="flex flex-wrap items-baseline gap-x-2">
            <strong className="font-heading text-3xl leading-none font-bold tracking-tight tabular-nums sm:text-4xl">{integer.format(student.rank)}º</strong>
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">de {integer.format(summary.globalTotalCandidates)} no geral</span>
          </p>
        ) : (
          <>
            <p className="font-heading text-xl font-semibold tracking-tight">Em progresso</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {missing === 1 ? 'Falta 1 questão válida' : `Faltam ${integer.format(missing)} questões válidas`} para entrar no Geral.
            </p>
          </>
        )}
        {showScopePosition && <p className="text-sm font-medium tabular-nums">{integer.format(scopeRank)}º {scopeLabel}</p>}
      </div>

      <dl className="flex flex-wrap gap-x-5 gap-y-2 sm:gap-x-8">
        <div>
          <dt className="text-xs text-zinc-600 dark:text-zinc-400">Questões válidas</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums sm:text-base">{integer.format(validCount)}</dd>
        </div>
        {student && (
          <div>
            <dt className="text-xs text-zinc-600 dark:text-zinc-400">Percentil geral</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums sm:text-base">{student.formattedPercentile.replace('.', ',')}</dd>
          </div>
        )}
      </dl>
    </Card>
  );
}

function moveTabFocus(event: KeyboardEvent<HTMLDivElement>) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const index = tabs.findIndex((button) => button === document.activeElement);
  if (index < 0) return;
  event.preventDefault();

  let next = index;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = tabs.length - 1;
  if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
  if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
  tabs[next]?.focus();
}

function RankingPagination({ data, loading, onPageChange }: {
  data: LeaderboardResponse;
  loading: boolean;
  onPageChange: (offset: number) => void;
}) {
  if (data.scopeTotal <= data.limit && data.offset === 0) return null;
  const end = Math.min(data.offset + data.limit, data.scopeTotal);
  const start = Math.max(4, data.offset + 1);
  const previousOffset = Math.max(0, Math.min(data.offset - data.limit, Math.floor((data.scopeTotal - 1) / data.limit) * data.limit));
  const range = start === end ? `Posição ${integer.format(start)}` : `Posições ${integer.format(start)}–${integer.format(end)}`;

  return (
    <nav aria-label="Páginas do ranking" className="flex flex-wrap items-center justify-between gap-3">
      <p aria-live="polite" className="text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
        {start <= end
          ? `${range} de ${integer.format(data.scopeTotal)}`
          : `${integer.format(data.scopeTotal)} candidatos`}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" className="min-h-11 min-w-11 motion-reduce:transition-none" aria-label="Página anterior" aria-disabled={loading || data.offset === 0} onClick={() => {
          if (!loading && data.offset > 0) onPageChange(previousOffset);
        }}>
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Button>
        <Button variant="outline" size="icon" className="min-h-11 min-w-11 motion-reduce:transition-none" aria-label="Próxima página" aria-disabled={loading || end >= data.scopeTotal} onClick={() => {
          if (!loading && end < data.scopeTotal) onPageChange(data.offset + data.limit);
        }}>
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}

export function OfficialRanking({
  data, summary, counts, tab, modalidade, banca, institutions, loading, error,
  onTabChange, onModalityChange, onPageChange, onRefresh,
}: OfficialRankingProps) {
  const [focusedTab, setFocusedTab] = useState<RankingTab | null>(null);
  const refreshButton = useRef<HTMLButtonElement>(null);
  const totals = counts ? { all: counts.totalCandidates, official: counts.officialCount, provisional: counts.provisionalCount } : undefined;
  const filtered = Boolean(modalidade || banca || institutions.length);
  const rows = data?.candidates.filter((candidate) => candidate.rank > 3) ?? [];

  return (
    <div className="space-y-4 sm:space-y-5">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl leading-tight font-bold tracking-tight sm:text-3xl">Ranking de candidatos</h1>
        <Button
          ref={refreshButton}
          variant="outline"
          className="min-h-11 min-w-11 shrink-0 px-2.5 motion-reduce:transition-none sm:px-3.5"
          aria-label="Atualizar ranking"
          aria-disabled={loading}
          onClick={() => { if (!loading) onRefresh(); }}
          leftIcon={<RefreshCw className={`size-4 ${loading ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" />}
        >
          <span className="hidden sm:inline">Atualizar</span>
        </Button>
      </header>

      {summary ? <PositionSummary summary={summary} data={data} tab={tab} filtered={filtered} /> : (
        loading && <Skeleton variant="card" className="h-28 motion-reduce:animate-none" />
      )}

      {error && (
        <Card variant="flat" className="text-sm text-zinc-700 motion-reduce:transition-none dark:text-zinc-200" role="status">
          <p className="font-semibold">Não foi possível atualizar o ranking.</p>
          {data ? <p>Último resultado deste recorte em {dateTime.format(new Date(data.generatedAt))}.</p> : (
            summary && <p>Posição geral consultada em {dateTime.format(new Date(summary.generatedAt))}.</p>
          )}
          <Button variant="outline" className="mt-2.5 min-h-11 motion-reduce:transition-none" onClick={() => {
            refreshButton.current?.focus();
            onRefresh();
          }}>Tentar novamente</Button>
        </Card>
      )}

      <Tabs value={tab} onValueChange={(value) => {
        const next = RANKING_TABS.find((option) => option === value);
        if (next && next !== tab) onTabChange(next);
      }}>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <TabsList
            aria-label="Classificação"
            className="grid min-w-0 grid-cols-3 sm:inline-flex"
            onKeyDown={moveTabFocus}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setFocusedTab(null);
            }}
          >
            {RANKING_TABS.map((option) => (
              <TabsTrigger
                key={option}
                id={`ranking-tab-${option}`}
                value={option}
                className="min-h-11 min-w-0 flex-wrap gap-x-1 gap-y-0 px-1.5 tabular-nums motion-reduce:transition-none sm:px-3"
                aria-controls="ranking-results"
                tabIndex={(focusedTab ?? tab) === option ? 0 : -1}
                onFocus={() => setFocusedTab(option)}
              >
                {tabLabels[option]}
                {totals && <span className="font-normal text-zinc-600 dark:text-zinc-400">{integer.format(totals[option])}</span>}
              </TabsTrigger>
            ))}
          </TabsList>

          <label className="relative inline-flex min-w-0 items-center sm:max-w-56">
            <span className="sr-only">Modalidade</span>
            <select
              value={modalidade}
              onChange={(event) => onModalityChange(RANKING_MODALITIES.find((option) => option === event.target.value) ?? '')}
              className="min-h-11 w-full appearance-none rounded-xl border border-[var(--card-border)] bg-[var(--bg-card)] py-2 pr-9 pl-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]"
            >
              <option value="">Todas as modalidades</option>
              {RANKING_MODALITIES.map((option) => <option value={option} key={option}>{option}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 size-4 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
          </label>
        </div>

        <p className="sr-only" role="status">{loading ? 'Carregando classificação…' : ''}</p>
        <TabsContent
          value={tab}
          id="ranking-results"
          aria-labelledby={`ranking-tab-${tab}`}
          aria-busy={loading}
          tabIndex={0}
          className="mt-4 space-y-4 rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] motion-reduce:animate-none sm:mt-5 sm:space-y-5"
        >
          {(scopeNotes[tab] || banca || institutions.length > 0) && (
            <div className="space-y-1 text-xs text-zinc-600 [overflow-wrap:anywhere] dark:text-zinc-400">
              {scopeNotes[tab] && <p>{scopeNotes[tab]}</p>}
              {banca && <p>Banca foco: {banca}</p>}
              {institutions.length > 0 && <p>Instituições: {institutions.join(', ')}</p>}
            </div>
          )}
          {data ? (
            data.scopeTotal > 0 ? (
              <>
                <RankingPodium leaders={data.leaders} />
                <RankingCandidateList key={data.offset} candidates={rows} />
                <RankingPagination data={data} loading={loading} onPageChange={onPageChange} />
              </>
            ) : (
              <Card className="flex items-center gap-3 text-sm text-zinc-700 motion-reduce:transition-none dark:text-zinc-300">
                <Trophy className="size-5 shrink-0 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
                Nenhum candidato neste recorte.
              </Card>
            )
          ) : loading && <Skeleton variant="card" className="h-36 motion-reduce:animate-none" />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
