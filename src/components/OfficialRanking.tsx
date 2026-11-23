'use client';

import React, { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, RefreshCw, Trophy, Layers, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { CandidateIdentityCard } from '@/components/ranking/CandidateIdentityCard';
import { RankingPodiumOlympian } from '@/components/ranking/RankingPodiumOlympian';
import { RankingCandidateList } from '@/components/ranking/RankingStandings';
import { StudentEvolutionDrawer } from '@/components/ranking/StudentEvolutionDrawer';
import { RANKING_MODALITIES, RANKING_TABS } from '@/types/ranking';
import type { LeaderboardResponse, RankingModality, RankingTab } from '@/types/ranking';

const integer = new Intl.NumberFormat('pt-BR');
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const tabLabels: Record<RankingTab, string> = {
  official: '🏆 Oficial (≥500)',
  provisional: '🎯 Provisório (100–499)',
  xp: '⚡ Ranking de XP',
};

const scopeNotes: Record<RankingTab, string> = {
  official: 'Classificação oficial de alto prestígio psicométrico (TRI 2PL) a partir de 500 questões válidas.',
  provisional: 'Classificação preliminar baseada na TRI para candidatos de 100 a 499 questões válidas.',
  xp: 'Classificação por constância e esforço acumulado em resolução de questões, flashcards e leitura de materiais.',
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

function RankingPagination({
  data,
  loading,
  onPageChange,
}: {
  data: LeaderboardResponse;
  loading: boolean;
  onPageChange: (offset: number) => void;
}) {
  if (data.scopeTotal <= data.limit && data.offset === 0) return null;
  const end = Math.min(data.offset + data.limit, data.scopeTotal);
  const start = Math.max(4, data.offset + 1);
  const previousOffset = Math.max(
    0,
    Math.min(data.offset - data.limit, Math.floor((data.scopeTotal - 1) / data.limit) * data.limit),
  );
  const range = start === end ? `Posição ${integer.format(start)}` : `Posições ${integer.format(start)}–${integer.format(end)}`;

  return (
    <nav aria-label="Páginas do ranking" className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <p aria-live="polite" className="text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
        {start <= end ? `${range} de ${integer.format(data.scopeTotal)}` : `${integer.format(data.scopeTotal)} candidatos`}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="min-h-9 min-w-9 motion-reduce:transition-none"
          aria-label="Página anterior"
          aria-disabled={loading || data.offset === 0}
          onClick={() => {
            if (!loading && data.offset > 0) onPageChange(previousOffset);
          }}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="min-h-9 min-w-9 motion-reduce:transition-none"
          aria-label="Próxima página"
          aria-disabled={loading || end >= data.scopeTotal}
          onClick={() => {
            if (!loading && end < data.scopeTotal) onPageChange(data.offset + data.limit);
          }}
        >
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}

export function OfficialRanking({
  data,
  summary,
  counts,
  tab,
  modalidade,
  banca,
  institutions,
  loading,
  error,
  onTabChange,
  onModalityChange,
  onPageChange,
  onRefresh,
}: OfficialRankingProps) {
  const [focusedTab, setFocusedTab] = useState<RankingTab | null>(null);
  const [isEvolutionOpen, setIsEvolutionOpen] = useState(false);
  const refreshButton = useRef<HTMLButtonElement>(null);

  const totals = counts
    ? {
        official: counts.officialCount,
        provisional: counts.provisionalCount,
        xp: counts.totalCandidates,
      }
    : undefined;

  const rows = data?.candidates.filter((candidate) => candidate.rank > 3) ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Cabeçalho da Página */}
      <header className="flex flex-wrap items-center justify-between gap-3">
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

        <Button
          ref={refreshButton}
          variant="outline"
          size="sm"
          className="min-h-9 gap-1.5 px-3 motion-reduce:transition-none"
          aria-label="Atualizar ranking"
          aria-disabled={loading}
          onClick={() => {
            if (!loading) onRefresh();
          }}
        >
          <RefreshCw className={`size-3.5 ${loading ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" />
          <span className="hidden sm:inline">Atualizar</span>
        </Button>
      </header>

      {/* Hero Card do Estudante no Padrão Bento */}
      {summary ? (
        <CandidateIdentityCard
          summary={summary}
          data={data}
          tab={tab}
          loading={loading}
          onRefresh={onRefresh}
          onOpenEvolution={() => setIsEvolutionOpen(true)}
        />
      ) : (
        loading && <Skeleton variant="card" className="h-32 motion-reduce:animate-none" />
      )}

      {/* Erro de conexão / atualização */}
      {error && (
        <Card variant="flat" className="border-red-500/20 bg-red-50/50 p-4 text-sm text-red-900 motion-reduce:transition-none dark:border-red-500/30 dark:bg-red-950/20 dark:text-red-200" role="status">
          <p className="font-bold">Não foi possível atualizar o ranking neste momento.</p>
          {data ? (
            <p className="text-xs mt-0.5">Exibindo último resultado em {dateTime.format(new Date(data.generatedAt))}.</p>
          ) : (
            summary && <p className="text-xs mt-0.5">Última consulta geral em {dateTime.format(new Date(summary.generatedAt))}.</p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-2.5 min-h-9 motion-reduce:transition-none"
            onClick={() => {
              refreshButton.current?.focus();
              onRefresh();
            }}
          >
            Tentar novamente
          </Button>
        </Card>
      )}

      {/* Abas e Filtros de Modalidade */}
      <Tabs
        value={tab}
        onValueChange={(value) => {
          const next = RANKING_TABS.find((option) => option === value);
          if (next && next !== tab) onTabChange(next);
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList
            aria-label="Classificação"
            className="grid min-w-0 grid-cols-3 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900 sm:inline-flex"
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
                className="min-h-9 min-w-0 flex-wrap gap-x-1.5 px-3 text-xs font-semibold tabular-nums motion-reduce:transition-none sm:text-xs"
                aria-controls="ranking-results"
                tabIndex={(focusedTab ?? tab) === option ? 0 : -1}
                onFocus={() => setFocusedTab(option)}
              >
                <span>{tabLabels[option]}</span>
                {totals && totals[option] !== undefined && (
                  <span className="font-normal text-zinc-500 dark:text-zinc-400">
                    ({integer.format(totals[option])})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Seletor de Modalidade Estilizado */}
          <div className="relative inline-flex min-w-0 items-center sm:max-w-64">
            <Layers className="pointer-events-none absolute left-3 size-3.5 text-zinc-400" aria-hidden="true" />
            <select
              value={modalidade}
              onChange={(event) =>
                onModalityChange(RANKING_MODALITIES.find((option) => option === event.target.value) ?? '')
              }
              aria-label="Filtrar por modalidade"
              className="min-h-9.5 w-full appearance-none rounded-xl border border-zinc-200/90 bg-white py-1.5 pr-8 pl-8.5 text-xs font-medium text-zinc-800 shadow-2xs outline-none transition-colors hover:border-zinc-300 focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] dark:border-zinc-800 dark:bg-[#121215] dark:text-zinc-200"
            >
              <option value="">Todas as modalidades</option>
              {RANKING_MODALITIES.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-zinc-400" aria-hidden="true" />
          </div>
        </div>

        <p className="sr-only" role="status">
          {loading ? 'Carregando classificação…' : ''}
        </p>

        {/* Conteúdo da Aba */}
        <TabsContent
          value={tab}
          id="ranking-results"
          aria-labelledby={`ranking-tab-${tab}`}
          aria-busy={loading}
          tabIndex={0}
          className="mt-4 space-y-4 rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] sm:mt-5 sm:space-y-5"
        >
          {/* Legenda do recorte */}
          {(scopeNotes[tab] || banca || institutions.length > 0) && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-3.5 text-xs text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-400">
              <Target className="mt-0.5 size-4 shrink-0 text-[var(--primary-color)]" aria-hidden="true" />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-medium text-zinc-800 dark:text-zinc-200">{scopeNotes[tab]}</p>
                {(banca || institutions.length > 0) && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {banca ? `Banca foco: ${banca}` : ''}
                    {banca && institutions.length > 0 ? ' • ' : ''}
                    {institutions.length > 0 ? `Instituições: ${institutions.join(', ')}` : ''}
                  </p>
                )}
              </div>
            </div>
          )}

          {data ? (
            data.scopeTotal > 0 ? (
              <>
                {/* Destaque para os Líderes (Top 3) */}
                <RankingPodiumOlympian leaders={data.leaders} />

                {/* Demais Posições a partir do 4º Lugar */}
                <RankingCandidateList key={data.offset} candidates={rows} />

                {/* Paginação */}
                <RankingPagination data={data} loading={loading} onPageChange={onPageChange} />
              </>
            ) : (
              <Card className="flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white p-6 text-sm text-zinc-700 shadow-xs dark:border-zinc-800 dark:bg-[#121215] dark:text-zinc-300">
                <Trophy className="size-5 shrink-0 text-zinc-400" aria-hidden="true" />
                <span>Nenhum candidato encontrado com os critérios e recorte selecionados.</span>
              </Card>
            )
          ) : (
            loading && <Skeleton variant="card" className="h-48 motion-reduce:animate-none" />
          )}
        </TabsContent>
      </Tabs>

      {/* Gaveta Lateral de Evolução do Estudante */}
      <StudentEvolutionDrawer
        isOpen={isEvolutionOpen}
        onClose={() => setIsEvolutionOpen(false)}
        student={data?.currentUser ?? summary?.currentUser ?? null}
        history={data?.history}
      />
    </div>
  );
}
