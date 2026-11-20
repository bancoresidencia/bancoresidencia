'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarDays,
  ListOrdered,
  Sparkles,
  Layers
} from 'lucide-react';
import { CalendarViewMode } from './StudyScheduleCalendar';

interface CalendarTopToolbarProps {
  monthName: string;
  year: number;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onOpenChecklist?: () => void;
  onOpenAutoGenerator?: () => void;
}

export const CalendarTopToolbar: React.FC<CalendarTopToolbarProps> = ({
  monthName,
  year,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  onOpenChecklist,
  onOpenAutoGenerator
}) => {
  return (
    <div className="p-4 sm:p-5 border-b border-[var(--card-border,#e4e4e7)] dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
      {/* Navegação Mês/Ano */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={onPrev}
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors"
            title="Anterior"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={onNext}
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors"
            title="Próximo"
            aria-label="Próximo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {monthName} <span className="font-mono text-zinc-400 font-normal">{year}</span>
        </h2>
      </div>

      {/* Modos de Visão & Ações Rápidas */}
      <div className="flex items-center gap-2">
        {/* Seletor de Visão (Mês, Semana, Lista) */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => onViewModeChange('month')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'month'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mês</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('week')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'week'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Semana</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lista</span>
          </button>
        </div>

        {/* Botão de Abrir Checklist Lateral */}
        {onOpenChecklist && (
          <button
            type="button"
            onClick={onOpenChecklist}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Checklist</span>
          </button>
        )}

        {/* Botão de Gerar Cronograma Automático */}
        {onOpenAutoGenerator && (
          <button
            type="button"
            onClick={onOpenAutoGenerator}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Montar Automático</span>
          </button>
        )}
      </div>
    </div>
  );
};
