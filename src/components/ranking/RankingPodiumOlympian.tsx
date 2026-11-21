'use client';

import React from 'react';
import { Crown, Medal, Trophy, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
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

  // Organização dos 3 primeiros: 2º lugar (índice 1), 1º lugar (índice 0), 3º lugar (índice 2)
  const first = leaders[0];
  const second = leaders[1];
  const third = leaders[2];

  // Helper para renderizar um card de pódio
  const renderPodiumCard = (
    student: LeaderboardStudent | undefined,
    position: 1 | 2 | 3,
    extraClasses: string,
  ) => {
    if (!student) return null;

    const isFirst = position === 1;
    const isSecond = position === 2;

    const colorConfig = isFirst
      ? {
          border: 'border-amber-400/50 dark:border-amber-500/40 shadow-amber-500/10 shadow-lg',
          bgGradient: 'bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-zinc-900/60 dark:to-zinc-900/40',
          badgeBg: 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200',
          iconColor: 'text-amber-500 dark:text-amber-400',
          titleColor: 'text-amber-600 dark:text-amber-400',
          percentileColor: 'text-amber-600 dark:text-amber-400',
          glow: 'from-amber-400/20 to-transparent',
        }
      : isSecond
      ? {
          border: 'border-zinc-300 dark:border-zinc-700 shadow-md',
          bgGradient: 'bg-gradient-to-b from-zinc-200/40 via-zinc-100/20 to-transparent dark:from-zinc-800/40 dark:via-zinc-900/60 dark:to-zinc-900/40',
          badgeBg: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
          iconColor: 'text-zinc-400 dark:text-zinc-300',
          titleColor: 'text-zinc-600 dark:text-zinc-300',
          percentileColor: 'text-zinc-700 dark:text-zinc-200',
          glow: 'from-zinc-300/10 to-transparent',
        }
      : {
          border: 'border-orange-300/40 dark:border-orange-800/40 shadow-md',
          bgGradient: 'bg-gradient-to-b from-orange-200/30 via-orange-100/10 to-transparent dark:from-orange-950/25 dark:via-zinc-900/60 dark:to-zinc-900/40',
          badgeBg: 'bg-orange-100 text-orange-900 dark:bg-orange-900/60 dark:text-orange-200',
          iconColor: 'text-orange-600 dark:text-orange-400',
          titleColor: 'text-orange-700 dark:text-orange-400',
          percentileColor: 'text-orange-700 dark:text-orange-300',
          glow: 'from-orange-400/10 to-transparent',
        };

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
          'relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 sm:p-5',
          colorConfig.border,
          colorConfig.bgGradient,
          isFirst ? 'order-1 sm:order-2 sm:-translate-y-2.5 sm:py-6' : isSecond ? 'order-2 sm:order-1' : 'order-3 sm:order-3',
          extraClasses,
        )}
      >
        {/* Glow de iluminação do topo */}
        <div
          className={cn(
            'pointer-events-none absolute -top-8 left-1/2 size-32 -translate-x-1/2 rounded-full bg-gradient-radial blur-2xl',
            colorConfig.glow,
          )}
          aria-hidden="true"
        />

        {/* Topo: Medalha/Coroa + Posição */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-xl shadow-xs sm:size-9',
                colorConfig.badgeBg,
              )}
            >
              {isFirst ? (
                <Crown className={cn('size-5', colorConfig.iconColor)} aria-hidden="true" />
              ) : isSecond ? (
                <Trophy className={cn('size-4.5', colorConfig.iconColor)} aria-hidden="true" />
              ) : (
                <Medal className={cn('size-4.5', colorConfig.iconColor)} aria-hidden="true" />
              )}
            </span>
            <span className={cn('font-heading text-xs font-extrabold uppercase tracking-wider', colorConfig.titleColor)}>
              {position}º Lugar
            </span>
          </div>

          {student.isCurrentUser && (
            <Badge variant="theme" size="sm" className="font-semibold">
              Você
            </Badge>
          )}

          {isFirst && (
            <div className="hidden items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 sm:flex">
              <Sparkles className="size-3" />
              <span>Líder Nacional</span>
            </div>
          )}
        </div>

        {/* Corpo: Avatar + Nome + Nível */}
        <div className="my-3 space-y-1.5 text-center sm:my-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-zinc-900 font-heading text-sm font-bold text-white shadow-sm ring-2 ring-zinc-400/30 dark:ring-zinc-700 sm:size-14 sm:text-base">
            {initials}
          </div>

          <div className="pt-1">
            <p className="flex flex-wrap items-center justify-center gap-1.5 font-heading text-sm font-bold text-zinc-900 dark:text-zinc-100 sm:text-base">
              <span className="truncate max-w-[140px] sm:max-w-[180px]">{student.name}</span>
              <span className="rounded bg-zinc-200/80 px-1.5 py-0.2 font-mono text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Nv. {student.level}
              </span>
            </p>
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
              {student.specialtyTarget ? `${student.specialtyTarget} • ` : ''}
              {student.bancaFoco || 'Todas as Bancas'}
            </p>
          </div>
        </div>

        {/* Percentil em Destaque Expandido */}
        <div className="my-2 rounded-xl bg-zinc-900/5 p-2.5 text-center dark:bg-zinc-950/40">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Percentil TRI
          </span>
          <span className={cn('font-heading text-2xl font-black tracking-tight sm:text-3xl', colorConfig.percentileColor)}>
            {student.formattedPercentile.replace('.', ',')}
          </span>
        </div>

        {/* Rodapé do Card: Questões Feitas e Taxa de Acertos */}
        <div className="grid grid-cols-2 gap-2 border-t border-zinc-200/60 pt-2.5 text-center text-xs dark:border-zinc-800">
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
  };

  return (
    <section aria-labelledby="ranking-podium-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="ranking-podium-heading" className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100 sm:text-lg">
          Pódio de Elite Nacional
        </h2>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Top 3 Colocados
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end sm:gap-4">
        {/* Ordem de Pódio Clássico: 2º Lugar (Esquerda), 1º Lugar (Centro mais alto), 3º Lugar (Direita) */}
        {renderPodiumCard(second, 2, 'sm:min-h-[290px]')}
        {renderPodiumCard(first, 1, 'sm:min-h-[320px]')}
        {renderPodiumCard(third, 3, 'sm:min-h-[280px]')}
      </div>
    </section>
  );
}
