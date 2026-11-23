'use client';

import React from 'react';
import { ChevronDown, Stethoscope, Building2, Target } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/components/ui/cn';
import type { LeaderboardStudent } from '@/types/ranking';
import { RankingPodiumOlympian } from './RankingPodiumOlympian';

export { RankingPodiumOlympian as RankingPodium };

const integer = new Intl.NumberFormat('pt-BR');
const percent = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

const detailsSummary =
  'list-none [&::-webkit-details-marker]:hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary-color)]';
const listGrid =
  'grid grid-cols-[2.5rem_minmax(0,1fr)_auto_1.25rem] items-center gap-2 px-3.5 py-3 sm:gap-4 sm:px-5 md:grid-cols-[3.5rem_minmax(0,1.8fr)_7rem_6rem_6.5rem_1.5rem]';

export function CandidatePercentile({ student }: { student: LeaderboardStudent }) {
  const p = student.percentile;
  const colorClass =
    p >= 98
      ? 'border-amber-400/40 bg-amber-50 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200 font-bold'
      : p >= 90
      ? 'border-emerald-400/40 bg-emerald-50 text-emerald-900 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold'
      : p >= 80
      ? 'border-sky-400/40 bg-sky-50 text-sky-900 dark:border-sky-700/50 dark:bg-sky-950/40 dark:text-sky-200 font-semibold'
      : 'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-medium';

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center justify-center rounded-lg border px-2.5 py-0.5 text-xs tabular-nums shadow-2xs',
        colorClass,
      )}
    >
      <span className="sr-only">Percentil TRI </span>
      {student.formattedPercentile.replace('.', ',')}
    </span>
  );
}

export function CandidateIdentity({ student }: { student: LeaderboardStudent }) {
  return (
    <div className="min-w-0 space-y-0.5">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="truncate font-heading text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {student.name}
        </span>

        {student.isCurrentUser && (
          <Badge variant="theme" size="sm" className="font-semibold">
            Você
          </Badge>
        )}
      </div>

      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
        {student.specialtyTarget ? `${student.specialtyTarget} • ` : ''}
        {student.bancaFoco || 'Todas as Bancas'}
        {student.college ? ` • ${student.college}` : ''}
      </p>
    </div>
  );
}

function CandidateDetails({ student, list = false }: { student: LeaderboardStudent; list?: boolean }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-zinc-100 bg-zinc-50/60 px-4 py-3 text-xs dark:border-zinc-800/80 dark:bg-zinc-900/30 sm:grid-cols-4 sm:px-6">
      <div className="min-w-0">
        <dt className="text-zinc-500 dark:text-zinc-400">Faculdade / Origem</dt>
        <dd className="mt-0.5 truncate font-medium text-zinc-800 dark:text-zinc-200">
          {student.college || '—'}
        </dd>
      </div>

      <div className="min-w-0">
        <dt className="text-zinc-500 dark:text-zinc-400">Banca Foco</dt>
        <dd className="mt-0.5 truncate font-medium text-zinc-800 dark:text-zinc-200">
          {student.bancaFoco || 'Todas'}
        </dd>
      </div>

      <div>
        <dt className="text-zinc-500 dark:text-zinc-400">Dedicação Acumulada</dt>
        <dd className="mt-0.5 font-medium tabular-nums text-amber-600 dark:text-amber-400">
          {integer.format(student.xp)} XP
        </dd>
      </div>

      <div>
        <dt className="text-zinc-500 dark:text-zinc-400">Especialidade Alvo</dt>
        <dd className="mt-0.5 truncate font-medium text-zinc-800 dark:text-zinc-200">
          {student.specialtyTarget || 'Geral'}
        </dd>
      </div>

      <div className={cn('sm:hidden', list && 'block')}>
        <dt className="text-zinc-500 dark:text-zinc-400">Questões Realizadas</dt>
        <dd className="mt-0.5 font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
          {integer.format(student.totalAnswered)}
        </dd>
      </div>

      <div className={cn('sm:hidden', list && 'block')}>
        <dt className="text-zinc-500 dark:text-zinc-400">Taxa de Acertos</dt>
        <dd className="mt-0.5 font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
          {percent.format(student.accuracy)}% ({integer.format(student.totalCorrect)} certas)
        </dd>
      </div>
    </dl>
  );
}

export function RankingCandidateList({ candidates }: { candidates: LeaderboardStudent[] }) {
  if (candidates.length === 0) return null;

  return (
    <section aria-labelledby="ranking-list-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="ranking-list-heading"
          className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
        >
          Classificação Geral de Candidatos
        </h2>
        <span className="text-xs text-zinc-400">A partir da 4ª colocação</span>
      </div>

      <Card noPadding className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-[#121215]">
        {/* Cabeçalho da Tabela */}
        <div
          aria-hidden="true"
          className={cn(
            listGrid,
            'hidden border-b border-zinc-200/80 bg-zinc-50/80 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:text-zinc-400 md:grid',
          )}
        >
          <span>Pos.</span>
          <span>Candidato</span>
          <span>Percentil</span>
          <span>Questões</span>
          <span>Acertos</span>
          <span className="sr-only">Ações</span>
        </div>

        {/* Linhas da Tabela */}
        <ol role="list" start={candidates[0].rank} className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
          {candidates.map((student) => (
            <li
              key={student.userId}
              className={cn(
                'transition-colors',
                student.isCurrentUser
                  ? 'bg-[var(--accent-subtle)] shadow-[inset_3px_0_0_var(--primary-color)]'
                  : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40',
              )}
            >
              <details className="group">
                <summary className={cn(detailsSummary, listGrid, 'min-h-12')}>
                  <span className="font-heading text-xs font-bold tabular-nums text-zinc-600 dark:text-zinc-400">
                    #{integer.format(student.rank)}
                  </span>

                  <CandidateIdentity student={student} />

                  <CandidatePercentile student={student} />

                  <span className="hidden font-mono text-xs tabular-nums text-zinc-600 dark:text-zinc-300 md:inline font-medium">
                    {integer.format(student.totalAnswered)}
                  </span>

                  <span className="hidden font-mono text-xs tabular-nums font-semibold text-zinc-800 dark:text-zinc-200 md:inline">
                    {percent.format(student.accuracy)}%
                  </span>

                  <ChevronDown
                    aria-hidden="true"
                    className="size-4 text-zinc-400 transition-transform duration-200 group-open:rotate-180 dark:text-zinc-500"
                  />
                </summary>

                <CandidateDetails student={student} list />
              </details>
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
}
