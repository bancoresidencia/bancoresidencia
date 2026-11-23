'use client';

import React from 'react';
import { Trophy, Medal, Award, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/components/ui/cn';
import type { LeaderboardStudent } from '@/types/ranking';

const integer = new Intl.NumberFormat('pt-BR');
const percent = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

interface RankingPodiumOlympianProps {
  leaders: LeaderboardStudent[];
}

export function RankingPodiumOlympian({ leaders }: RankingPodiumOlympianProps) {
  if (!leaders || leaders.length === 0) return null;

  // Garantir até 3 líderes
  const topThree = leaders.slice(0, 3);

  const positionStyles = {
    1: {
      badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      icon: Trophy,
      label: '1º Lugar',
      cardBorder: 'border-amber-400/30 dark:border-amber-500/30',
      pillText: 'Líder Geral',
    },
    2: {
      badgeBg: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
      icon: Medal,
      label: '2º Lugar',
      cardBorder: 'border-zinc-200/80 dark:border-zinc-800',
      pillText: 'Vice-Líder',
    },
    3: {
      badgeBg: 'bg-amber-900/10 text-amber-800 dark:text-amber-500 border-amber-800/20',
      icon: Medal,
      label: '3º Lugar',
      cardBorder: 'border-zinc-200/80 dark:border-zinc-800',
      pillText: '3ª Colocação',
    },
  } as const;

  return (
    <section aria-labelledby="top-leaders-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="top-leaders-heading"
          className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
        >
          Liderança Nacional (Top 3)
        </h2>
        <span className="text-xs text-zinc-400">Classificação TRI 2PL</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
        {topThree.map((student, index) => {
          const position = (index + 1) as 1 | 2 | 3;
          const config = positionStyles[position];
          const IconComponent = config.icon;

          const initials = student.name
            .split(' ')
            .map((n) => n[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase();

          return (
            <div
              key={student.userId}
              className={cn(
                'relative flex flex-col justify-between rounded-2xl border bg-white p-4 shadow-xs transition-all duration-200 dark:bg-[#121215] sm:p-5',
                config.cardBorder,
                student.isCurrentUser && 'ring-2 ring-[var(--primary-color)]',
              )}
            >
              {/* Topo do Card: Posição e Badges */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold',
                    config.badgeBg,
                  )}
                >
                  <IconComponent className="size-3.5" aria-hidden="true" />
                  <span>{config.label}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {student.isCurrentUser && (
                    <Badge variant="theme" size="sm">
                      Você
                    </Badge>
                  )}
                  {position === 1 && (
                    <span className="hidden items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 sm:inline-flex">
                      <Sparkles className="size-3" />
                      <span>{config.pillText}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Informações do Candidato */}
              <div className="my-3.5 flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-100 font-heading text-sm font-bold text-zinc-800 dark:border-zinc-700/80 dark:bg-zinc-800/90 dark:text-zinc-200">
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-sm font-bold text-zinc-900 dark:text-zinc-100 sm:text-base">
                    {student.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {student.specialtyTarget ? `${student.specialtyTarget} • ` : ''}
                    {student.bancaFoco || 'Todas as Bancas'}
                  </p>
                </div>
              </div>

              {/* Bloco de Percentil TRI */}
              <div className="mb-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-2.5 text-center dark:border-zinc-800/60 dark:bg-zinc-900/40">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Percentil TRI
                </span>
                <span className="font-heading text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {student.formattedPercentile.replace('.', ',')}
                </span>
              </div>

              {/* Rodapé: Questões e Acertos */}
              <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 pt-2.5 text-center text-xs dark:border-zinc-800/80">
                <div>
                  <span className="block text-[10px] text-zinc-500">Questões</span>
                  <strong className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                    {integer.format(student.totalAnswered)}
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500">Acertos</span>
                  <strong className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                    {percent.format(student.accuracy)}%
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
