'use client';

import React from 'react';
import { RefreshCw, TrendingUp, Award, Target, Sparkles, Building2, Stethoscope, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { LeaderboardResponse, RankingTab } from '@/types/ranking';
import { getLevelProgress } from '@/utils/xpModel';

const integer = new Intl.NumberFormat('pt-BR');
const percent = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

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

  // Percentil relativo do topo (ex: Top 2.4%)
  const topPercentage =
    student?.rank && totalCandidates > 0
      ? Math.max(0.01, Math.min(99.9, ((student.rank - 0.5) / Math.max(1, totalCandidates)) * 100))
      : null;

  const initials = student?.name
    ? student.name
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'DR';

  const isCalibrating = status === 'unranked' || status === 'calibrando' || validCount < 100;
  const missingForProvisional = Math.max(0, 100 - validCount);

  return (
    <Card className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs transition-all duration-200 dark:border-zinc-800 dark:bg-[#121215] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        {/* Esquerda: Identidade do Médico & Alvo de Residência */}
        <div className="flex min-w-0 items-start gap-3.5 sm:items-center sm:gap-4">
          {/* Avatar Neutro Canônico */}
          <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl border border-zinc-200/90 bg-zinc-100 font-heading text-base font-bold text-zinc-800 shadow-2xs dark:border-zinc-700/80 dark:bg-zinc-800/90 dark:text-zinc-200 sm:size-15 sm:text-lg">
            {initials}
          </div>

          {/* Nome, Status e Metadados Médicos */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-heading text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-lg">
                {student?.name || 'Dr(a). Candidato(a)'}
              </h2>

              <Badge
                variant={status === 'official' ? 'success' : status === 'provisional' ? 'theme' : 'warning'}
                size="sm"
                className="font-medium"
              >
                {status === 'official'
                  ? 'Oficial Consolidado (TRI)'
                  : status === 'provisional'
                  ? 'Provisório'
                  : 'Em Calibração'}
              </Badge>

              <Badge variant="outline" size="sm" className="font-mono text-zinc-600 dark:text-zinc-400">
                Nível {levelData.currentLevel}
              </Badge>
            </div>

            {/* Metadados: Especialidade Alvo, Banca Foco e Faculdade */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
              {student?.specialtyTarget ? (
                <span className="flex items-center gap-1 font-medium text-zinc-800 dark:text-zinc-200">
                  <Stethoscope className="size-3.5 text-zinc-400 dark:text-zinc-500" />
                  {student.specialtyTarget}
                </span>
              ) : (
                <span className="text-zinc-500">Residência Médica</span>
              )}

              <span className="text-zinc-300 dark:text-zinc-700">•</span>

              <span className="flex items-center gap-1">
                <Target className="size-3.5 text-zinc-400 dark:text-zinc-500" />
                Foco: {student?.bancaFoco || 'Todas as Bancas'}
              </span>

              {student?.college && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3.5 text-zinc-400 dark:text-zinc-500" />
                    {student.college}
                  </span>
                </>
              )}
            </div>

            {/* Posição Nacional */}
            {student ? (
              <div className="flex flex-wrap items-baseline gap-x-2 pt-0.5 text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
                <span>
                  Posição Nacional:{' '}
                  <strong className="font-heading font-black text-[var(--primary-color)]">
                    #{integer.format(student.rank)}
                  </strong>
                </span>

                {topPercentage !== null && (
                  <span className="font-medium text-zinc-500 dark:text-zinc-400">
                    (Top {topPercentage < 0.1 ? topPercentage.toFixed(2) : topPercentage.toFixed(1)}% dos candidatos)
                  </span>
                )}

                {scopeRank && tab !== 'official' && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    • #{integer.format(scopeRank)} no recorte atual
                  </span>
                )}
              </div>
            ) : isCalibrating ? (
              <div className="pt-1">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  Faltam {missingForProvisional} {missingForProvisional === 1 ? 'questão válida' : 'questões válidas'}{' '}
                  para ingressar no Ranking Provisório (mínimo 100).
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

        {/* Direita: Percentil TRI & Ações */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800/80 sm:flex-nowrap lg:border-t-0 lg:pt-0">
          {/* Caixa de Percentil */}
          {student && (
            <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3.5 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="text-right">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Percentil TRI
                </span>
                <span className="font-heading text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                  {student.formattedPercentile.replace('.', ',')}
                </span>
              </div>
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                <Award className="size-5" />
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenEvolution}
              className="min-h-9 gap-1.5 font-medium"
            >
              <TrendingUp className="size-3.5 text-[var(--primary-color)]" />
              <span>Gráfico de Evolução</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              aria-label="Atualizar dados do ranking"
              className="min-h-9 gap-1 px-2.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Faixa inferior de métricas rápidas no padrão Bento */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-zinc-100 pt-3 text-xs text-zinc-600 dark:border-zinc-800/80 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">Questões válidas:</span>
          <strong className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
            {integer.format(validCount)}
          </strong>
        </div>

        {student && (
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Taxa de acertos:</span>
            <strong className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
              {percent.format(student.accuracy)}%
            </strong>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">Dedicação acumulada:</span>
          <strong className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            {integer.format(levelData.currentXP)} XP
          </strong>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-500">
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
