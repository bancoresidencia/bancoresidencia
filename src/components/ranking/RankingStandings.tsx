import { ChevronDown, Medal, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/components/ui/cn';
import type { LeaderboardStudent } from '@/types/ranking';

const integer = new Intl.NumberFormat('pt-BR');
const percent = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

const rankStyles = [
  {
    card: 'border-amber-200/80 dark:border-amber-800/55 bg-linear-to-br from-amber-50/90 to-transparent dark:from-amber-950/35 dark:to-transparent',
    icon: 'bg-amber-100 text-amber-800 dark:bg-amber-900/55 dark:text-amber-200',
  },
  { card: '', icon: 'bg-zinc-200/70 text-zinc-700 dark:bg-zinc-700/70 dark:text-zinc-100' },
  { card: '', icon: 'bg-orange-100/75 text-orange-800 dark:bg-orange-950/75 dark:text-orange-200' },
];

const detailsSummary = 'list-none [&::-webkit-details-marker]:hidden cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary-color)]';
const listGrid = 'grid grid-cols-[2.35rem_minmax(0,1fr)_auto_1rem] items-center gap-2 px-3 sm:gap-4 sm:px-5 md:grid-cols-[3rem_minmax(0,1fr)_6rem_6rem_5rem_1rem]';

function CandidatePercentile({ student }: { student: LeaderboardStudent }) {
  return (
    <span className="w-fit rounded-lg bg-zinc-100 px-2 py-1 text-xs font-semibold tabular-nums text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
      <span className="sr-only">Percentil geral </span>{student.formattedPercentile.replace('.', ',')}
    </span>
  );
}

function CandidateIdentity({ student }: { student: LeaderboardStudent }) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <span className="min-w-0 [overflow-wrap:anywhere]">{student.name}</span>
      {student.isCurrentUser && (
        <Badge variant="theme" size="sm" className="text-inherit motion-reduce:transition-none">Você</Badge>
      )}
    </span>
  );
}

function CandidateDetails({ student, list = false }: { student: LeaderboardStudent; list?: boolean }) {
  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-zinc-200/70 px-3 py-3 text-xs dark:border-zinc-800 sm:px-4">
      <div className="min-w-0">
        <dt className="text-zinc-600 dark:text-zinc-400">Instituição</dt>
        <dd className="mt-0.5 font-medium [overflow-wrap:anywhere]">{student.college || '—'}</dd>
      </div>
      <div className="min-w-0">
        <dt className="text-zinc-600 dark:text-zinc-400">Banca foco</dt>
        <dd className="mt-0.5 font-medium [overflow-wrap:anywhere]">{student.bancaFoco}</dd>
      </div>
      <div className={cn(list && 'md:hidden')}>
        <dt className="text-zinc-600 dark:text-zinc-400">Questões válidas</dt>
        <dd className="mt-0.5 font-medium tabular-nums">{integer.format(student.totalAnswered)}</dd>
      </div>
      <div className={cn(list && 'md:hidden')}>
        <dt className="text-zinc-600 dark:text-zinc-400">Acertos</dt>
        <dd className="mt-0.5 font-medium tabular-nums">{percent.format(student.accuracy)}% · {integer.format(student.totalCorrect)}</dd>
      </div>
    </dl>
  );
}

export function RankingPodium({ leaders }: { leaders: LeaderboardStudent[] }) {
  if (leaders.length === 0) return null;

  return (
    <section aria-labelledby="ranking-podium-heading">
      <h2 id="ranking-podium-heading" className="mb-2.5 font-heading text-base font-semibold sm:text-lg">Pódio</h2>
      <ol role="list" className="grid items-start gap-2 sm:grid-cols-[1.18fr_1fr_1fr] sm:gap-3">
        {leaders.map((student, index) => {
          const winner = index === 0;
          const Icon = winner ? Trophy : Medal;
          const style = rankStyles[index];

          return (
            <li key={student.userId} className="min-w-0">
              <Card noPadding className={cn('motion-reduce:transition-none', style.card)}>
                <details className="group">
                  <summary className={cn(detailsSummary, 'grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto_0.875rem] items-center gap-2 rounded-2xl p-2.5 sm:relative sm:flex sm:items-start sm:justify-center sm:gap-2.5 sm:p-4', winner ? 'sm:min-h-40' : 'sm:min-h-36')}>
                    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-10', style.icon)}>
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0 sm:flex sm:flex-1 sm:flex-col sm:gap-1">
                      <span className="block text-xs font-medium tabular-nums text-zinc-600 dark:text-zinc-400">{student.rank}º lugar</span>
                      <span className={cn('block font-heading text-sm leading-snug font-semibold', winner ? 'sm:text-xl' : 'sm:text-lg')}>
                        <CandidateIdentity student={student} />
                      </span>
                      <span className="mt-1 hidden sm:block"><CandidatePercentile student={student} /></span>
                    </span>
                    <span className="sm:hidden"><CandidatePercentile student={student} /></span>
                    <ChevronDown aria-hidden="true" className="size-3.5 text-zinc-500 group-open:rotate-180 dark:text-zinc-400 sm:absolute sm:right-4 sm:bottom-4" />
                  </summary>
                  <CandidateDetails student={student} />
                </details>
              </Card>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function RankingCandidateList({ candidates }: { candidates: LeaderboardStudent[] }) {
  if (candidates.length === 0) return null;

  return (
    <section aria-labelledby="ranking-list-heading">
      <h2 id="ranking-list-heading" className="mb-2.5 font-heading text-base font-semibold sm:text-lg">Demais posições</h2>
      <Card noPadding className="motion-reduce:transition-none">
        <div aria-hidden="true" className={cn(listGrid, 'hidden border-b border-zinc-200/70 py-3 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 md:grid')}>
          <span>Posição</span><span>Candidato</span><span>Percentil geral</span><span>Questões</span><span>Acertos</span>
        </div>
        <ol role="list" start={candidates[0].rank} className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
          {candidates.map((student) => (
            <li key={student.userId} className={cn('first:rounded-t-xl last:rounded-b-2xl', student.isCurrentUser && 'bg-[var(--accent-subtle)] shadow-[inset_3px_0_0_var(--primary-color)]')}>
              <details className="group">
                <summary className={cn(detailsSummary, listGrid, 'min-h-13 py-2.5 text-sm hover:bg-zinc-500/5')}>
                  <span className="text-xs font-semibold tabular-nums text-zinc-600 dark:text-zinc-400">{integer.format(student.rank)}º</span>
                  <span className="min-w-0 font-medium"><CandidateIdentity student={student} /></span>
                  <CandidatePercentile student={student} />
                  <span className="hidden text-xs tabular-nums text-zinc-600 dark:text-zinc-400 md:inline">
                    {integer.format(student.totalAnswered)} <span className="sr-only">questões válidas</span>
                  </span>
                  <span className="hidden text-xs tabular-nums text-zinc-600 dark:text-zinc-400 md:inline">
                    {percent.format(student.accuracy)}% <span className="sr-only">de acertos</span>
                  </span>
                  <ChevronDown aria-hidden="true" className="size-4 text-zinc-500 group-open:rotate-180 dark:text-zinc-400" />
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
