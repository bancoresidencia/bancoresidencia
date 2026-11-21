'use client';

import React from 'react';
import { RefreshCw, TrendingUp, Sparkles, Award, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { LeaderboardResponse, RankingTab } from '@/types/ranking';
import { getLevelProgress } from '@/utils/xpModel';

const integer = new Intl.NumberFormat('pt-BR');

interface CandidateIdentityCardProps {
  summary: LeaderboardResponse;
  data?: LeaderboardResponse;
  tab: RankingTab;
  loading: boolean;
  onRefresh: () => void;
  onOpenEvolution: () => void;
}

export function CandidateIdentityCard({
  summary,
  data,
  tab,
  loading,
  onRefresh,
  onOpenEvolution,
}: CandidateIdentityCardProps) {
  const student = summary.currentUser;
  const progress = summary.currentUserProgress;
  const validCount = progress.totalAnswered;
  const status = progress.rankingStatus;
  const scopeRank = data?.currentScopeRank;
  const totalCandidates = data?.scopeTotal ?? summary.totalCandidates;
  const levelData = getLevelProgress(progress.totalXP);

  // Percentil relativo do topo (estilo OP.GG: "0.1367% of top")
  const topPercentage = student?.rank && totalCandidates > 0
    ? Math.max(0.01, Math.min(99.9, ((student.rank - 0.5) / Math.max(1, totalCandidates)) * 100))
    : null;

  const initials = student?.name
    ? student.name.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : 'DR';

  const isCalibrating = status === 'unranked' || status === 'calibrando' || validCount < 100;
  const missingForProvisional = Math.max(0, 100 - validCount);

  return (
    <Card className="relative overflow-hidden border-zinc-200/80 bg-zinc-50/80 p-4 transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-5">
      {/* Luz ambiente sutil decorativa */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-[var(--primary-color)] opacity-[0.06] blur-3xl dark:opacity-[0.12]"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        {/* Esquerda: Avatar com Badge de Nível + Identidade do Aluno */}
        <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
          {/* Avatar com Badge de Nível sobreposto no rodapé (estilo OP.GG) */}
          <div className="relative shrink-0">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 font-heading text-lg font-bold text-white shadow-md ring-2 ring-zinc-300 dark:ring-zinc-700 sm:size-16 sm:text-xl">
              {initials}
            </div>
            {/* Badge de Nível do Avatar */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-zinc-200 bg-zinc-900 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-amber-300 shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
              title={`Nível ${levelData.currentLevel} • ${integer.format(levelData.currentXP)} XP acumulado`}
            >
              {levelData.currentLevel}
            </div>
          </div>

          {/* Nome, Status e Meta Médica */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-heading text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-lg">
                {student?.name || 'Dr(a). Candidato(a)'}
              </span>
              <span className="rounded bg-zinc-200/70 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Nv. {levelData.currentLevel}
              </span>
              <Badge
                variant={status === 'official' ? 'success' : status === 'provisional' ? 'theme' : 'warning'}
                size="sm"
              >
                {status === 'official' ? 'Oficial Consolidado' : status === 'provisional' ? 'Provisório' : 'Em Calibração'}
              </Badge>
            </div>

            {/* Metadados de Concurso / Residência */}
            <p className="flex flex-wrap items-center gap-x-2 text-xs text-zinc-600 dark:text-zinc-400">
              {student?.specialtyTarget && (
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {student.specialtyTarget}
                </span>
              )}
              {student?.specialtyTarget && student?.bancaFoco && <span>•</span>}
              <span>Foco: {student?.bancaFoco || 'Todas as Bancas'}</span>
              {student?.college && <span>• {student.college}</span>}
            </p>

            {/* Posição no Ranking / Ladder Rank */}
            {student ? (
              <p className="flex flex-wrap items-baseline gap-x-2 pt-0.5 text-xs sm:text-sm">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  Ladder Rank: <strong className="font-heading text-sm font-extrabold text-[var(--primary-color)] sm:text-base">#{integer.format(student.rank)}</strong>
                </span>
                {topPercentage !== null && (
                  <span className="font-medium text-zinc-500 dark:text-zinc-400">
                    (Top {topPercentage < 0.1 ? topPercentage.toFixed(2) : topPercentage.toFixed(1)}% dos candidatos)
                  </span>
                )}
                {scopeRank && tab !== 'official' && (
                  <span className="text-xs text-zinc-500">
                    • #{integer.format(scopeRank)} no recorte
                  </span>
                )}
              </p>
            ) : isCalibrating ? (
              <div className="pt-1">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  Faltam {missingForProvisional} {missingForProvisional === 1 ? 'questão válida' : 'questões válidas'} para ingressar no Ranking Provisório (mínimo 100).
                </p>
                <div className="mt-1 h-1.5 w-44 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(5, (validCount / 100) * 100))}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Direita: Percentil Nobre em Destaque + Botões de Ação */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/60 pt-3 dark:border-zinc-800 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
          {/* Badge de Percentil de Elite em Destaque */}
          {student && (
            <div className="flex items-center gap-3 sm:flex-row-reverse">
              <div className="text-right">
                <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  Percentil TRI
                </span>
                <span className="font-heading text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                  {student.formattedPercentile.replace('.', ',')}
                </span>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                <Award className="size-6" />
              </div>
            </div>
          )}

          {/* Botões: Gráfico de Evolução (Tier Graph) e Atualizar */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenEvolution}
              className="gap-1.5 border-zinc-300 font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <TrendingUp className="size-3.5 text-[var(--primary-color)]" />
              <span>Gráfico de Evolução</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              aria-label="Atualizar ranking"
              className="gap-1 border-zinc-300 px-2.5 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Faixa inferior de resumo rápido: Questões, Acertos, XP, Constância */}
      <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-zinc-200/60 pt-2.5 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 sm:gap-x-7">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-zinc-500">Questões válidas:</span>
          <strong className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
            {integer.format(validCount)}
          </strong>
        </div>

        {student && (
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-zinc-500">Taxa de acertos:</span>
            <strong className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
              {student.accuracy.toFixed(1).replace('.', ',')}%
            </strong>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className="font-medium text-zinc-500">XP de dedicação:</span>
          <strong className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            {integer.format(levelData.currentXP)} XP
          </strong>
        </div>

        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3 text-amber-500" />
          <span>Próx. Nível {levelData.nextLevel}:</span>
          <span className="tabular-nums font-medium text-zinc-700 dark:text-zinc-300">
            {levelData.progressPercent}%
          </span>
        </div>
      </div>
    </Card>
  );
}
