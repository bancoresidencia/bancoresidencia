import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/components/ui/cn';
import type { LeaderboardStudent } from '@/types/ranking';
import { RankingPodiumOlympian } from './RankingPodiumOlympian';

export { RankingPodiumOlympian as RankingPodium };

const integer = new Intl.NumberFormat('pt-BR');
const percent = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

const detailsSummary =
  'list-none [&::-webkit-details-marker]:hidden cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary-color)]';
const listGrid =
  'grid grid-cols-[2.25rem_minmax(0,1fr)_auto_1rem] items-center gap-2 px-3 sm:gap-4 sm:px-5 md:grid-cols-[3.25rem_minmax(0,1fr)_6.5rem_6rem_6.5rem_1rem]';

export function CandidatePercentile({ student }: { student: LeaderboardStudent }) {
  const p = student.percentile;
  const colorClass =
    p >= 98
      ? 'border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/60 dark:text-amber-200 font-bold'
      : p >= 90
      ? 'border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/60 dark:text-emerald-200 font-bold'
      : p >= 80
      ? 'border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-700/60 dark:bg-sky-950/60 dark:text-sky-200 font-medium'
      : 'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-medium';

  return (
    <span className={cn('w-fit rounded-lg border px-2 py-0.5 text-xs tabular-nums shadow-2xs', colorClass)}>
      <span className="sr-only">Percentil TRI </span>
      {student.formattedPercentile.replace('.', ',')}
    </span>
  );
}

export function CandidateIdentity({ student }: { student: LeaderboardStudent }) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <span className="min-w-0 truncate font-semibold text-zinc-900 dark:text-zinc-100">
        {student.name}
      </span>
      <span className="rounded bg-zinc-200/80 px-1.5 py-0.2 font-mono text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        Nv. {student.level}
      </span>
      {student.isCurrentUser && (
        <Badge variant="theme" size="sm" className="font-semibold text-inherit motion-reduce:transition-none">
          Você
        </Badge>
      )}
    </span>
  );
}

function CandidateDetails({ student, list = false }: { student: LeaderboardStudent; list?: boolean }) {
  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-zinc-200/70 px-3 py-3 text-xs dark:border-zinc-800 sm:px-4">
      <div className="min-w-0">
        <dt className="text-zinc-600 dark:text-zinc-400">Instituição</dt>
        <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100 [overflow-wrap:anywhere]">
          {student.college || '—'}
        </dd>
      </div>
      <div className="min-w-0">
        <dt className="text-zinc-600 dark:text-zinc-400">Banca foco</dt>
        <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100 [overflow-wrap:anywhere]">
          {student.bancaFoco || 'Todas'}
        </dd>
      </div>
      <div className={cn(list && 'md:hidden')}>
        <dt className="text-zinc-600 dark:text-zinc-400">Questões feitas</dt>
        <dd className="mt-0.5 font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
          {integer.format(student.totalAnswered)}
        </dd>
      </div>
      <div className={cn(list && 'md:hidden')}>
        <dt className="text-zinc-600 dark:text-zinc-400">Acertos</dt>
        <dd className="mt-0.5 font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
          {percent.format(student.accuracy)}% · {integer.format(student.totalCorrect)}
        </dd>
      </div>
      <div>
        <dt className="text-zinc-600 dark:text-zinc-400">Dedicação (XP)</dt>
        <dd className="mt-0.5 font-medium tabular-nums text-amber-600 dark:text-amber-400">
          {integer.format(student.xp)} XP
        </dd>
      </div>
      <div>
        <dt className="text-zinc-600 dark:text-zinc-400">Especialidade Alvo</dt>
        <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100">
          {student.specialtyTarget || 'Geral'}
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
        <h2 id="ranking-list-heading" className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100 sm:text-lg">
          Classificação Geral de Candidatos
        </h2>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          A partir da 4ª colocação
        </span>
      </div>

      <Card noPadding className="overflow-hidden border-zinc-200/80 shadow-xs dark:border-zinc-800">
        <div
          aria-hidden="true"
          className={cn(
            listGrid,
            'hidden border-b border-zinc-200/80 bg-zinc-50/70 py-3 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 md:grid',
          )}
        >
          <span>Pos.</span>
          <span>Candidato</span>
          <span>Percentil</span>
          <span>Questões</span>
          <span>Acertos</span>
          <span className="sr-only">Ações</span>
        </div>

        <ol role="list" start={candidates[0].rank} className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
          {candidates.map((student) => (
            <li
              key={student.userId}
              className={cn(
                'transition-colors',
                student.isCurrentUser && 'bg-[var(--accent-subtle)] shadow-[inset_3px_0_0_var(--primary-color)]',
              )}
            >
              <details className="group">
                <summary className={cn(detailsSummary, listGrid, 'min-h-13 py-2.5 text-sm hover:bg-zinc-500/5')}>
                  <span className="text-xs font-bold tabular-nums text-zinc-500 dark:text-zinc-400">
                    {integer.format(student.rank)}º
                  </span>
                  <CandidateIdentity student={student} />
                  <CandidatePercentile student={student} />
                  <span className="hidden text-xs tabular-nums text-zinc-600 dark:text-zinc-300 md:inline font-medium">
                    {integer.format(student.totalAnswered)}
                  </span>
                  <span className="hidden text-xs tabular-nums text-zinc-600 dark:text-zinc-300 md:inline font-medium">
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
