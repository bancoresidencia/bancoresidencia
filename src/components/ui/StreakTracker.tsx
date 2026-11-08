import React from 'react';
import { cn } from './cn';

export interface StreakDayItem {
  dayLabel: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom';
  dateStr: string;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
  detailText?: string;
}

export interface StreakTrackerProps {
  days: StreakDayItem[];
  accentHex?: string;
  accentBgRgba?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  showLabels?: boolean;
}

/**
 * StreakTracker: componente atômico para acompanhamento de consistência semanal (Segunda a Domingo).
 * Renderiza 7 micro-quadradinhos coesos, sem bordas, com cantos discretos e preenchimento sólido adaptado ao acento ativo.
 */
export const StreakTracker: React.FC<StreakTrackerProps> = ({
  days,
  accentHex,
  className,
  size = 'xs',
  showLabels = true
}) => {
  return (
    <div className={cn('inline-flex items-center gap-1 sm:gap-1.5 select-none', className)}>
      {days.map((day) => {
        const isDone = day.isCompleted;
        const isToday = day.isToday;
        const isFuture = day.isFuture;

        const titleText = `${day.dayLabel} (${day.dateStr}): ${
          isDone
            ? 'Meta cumprida!'
            : isToday
            ? 'Hoje (em andamento)'
            : isFuture
            ? 'Dia futuro'
            : 'Sem registro de estudo'
        }`;

        // Iniciais ultra-compactas de 1 letra para aproximação máxima dos quadradinhos
        const initialLabel = day.dayLabel.charAt(0);

        const sizeClasses =
          size === 'xs'
            ? 'w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2.5px]'
            : size === 'sm'
            ? 'w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px]'
            : 'w-4 h-4 sm:w-5 sm:h-5 rounded-[4px]';

        return (
          <div
            key={day.dateStr || day.dayLabel}
            className="flex flex-col items-center gap-0.5 group"
            title={titleText}
          >
            {/* Rótulo da Inicial do Dia da Semana */}
            {showLabels && (
              <span
                className={cn(
                  'text-[8px] sm:text-[9px] font-bold uppercase tracking-tight transition-colors leading-none',
                  isToday
                    ? 'font-black text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-400 dark:text-zinc-500'
                )}
              >
                {initialLabel}
              </span>
            )}

            {/* Micro-Quadradinho Sem Bordas, Totalmente Preenchido */}
            <div
              className={cn(
                'aspect-square border-0 transition-all duration-200',
                sizeClasses,
                isDone
                  ? 'shadow-2xs scale-100'
                  : isToday
                  ? 'bg-zinc-200 dark:bg-zinc-800 ring-1 ring-[var(--primary-color)] ring-offset-1 ring-offset-[var(--bg-card,#ffffff)] dark:ring-offset-[var(--card,#121215)]'
                  : isFuture
                  ? 'bg-zinc-100/60 dark:bg-zinc-800/40'
                  : 'bg-zinc-100 dark:bg-zinc-800/60'
              )}
              style={{
                backgroundColor: isDone
                  ? accentHex || 'var(--primary-color)'
                  : undefined
              }}
            />
          </div>
        );
      })}
    </div>
  );
};



