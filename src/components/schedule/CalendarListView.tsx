'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { UserScheduleItem } from '@/types/studySchedule';
import { CalendarItemCard } from './CalendarItemCard';

interface ListDayData {
  dateStr: string;
  dayNumber: number;
  monthLabel: string;
  weekdayLabel: string;
  isToday: boolean;
  items: UserScheduleItem[];
}

interface CalendarListViewProps {
  days: ListDayData[];
  onToggleComplete: (itemId: string, completed: boolean) => void;
  onDeleteItem: (itemId: string) => void;
  onNavigateToResumo: (especialidade: string, foco: string) => void;
  onNavigateToQuestoes: (especialidade: string, foco: string) => void;
  onQuickAddAtDate?: (dateStr: string) => void;
}

export const CalendarListView: React.FC<CalendarListViewProps> = ({
  days,
  onToggleComplete,
  onDeleteItem,
  onNavigateToResumo,
  onNavigateToQuestoes,
  onQuickAddAtDate
}) => {
  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto">
      {days.map((day) => (
        <div
          key={day.dateStr}
          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                  day.isToday
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {day.dayNumber} {day.monthLabel}
              </span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {day.weekdayLabel}
              </span>
            </div>
            {onQuickAddAtDate && (
              <button
                type="button"
                onClick={() => onQuickAddAtDate(day.dateStr)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Foco
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {day.items.length === 0 ? (
              <div className="py-2 text-zinc-400 dark:text-zinc-500 text-xs italic">
                Nenhum conteúdo agendado para este dia.
              </div>
            ) : (
              day.items.map((item) => (
                <CalendarItemCard
                  key={item.id}
                  item={item}
                  onToggleComplete={onToggleComplete}
                  onDeleteItem={onDeleteItem}
                  onNavigateToResumo={onNavigateToResumo}
                  onNavigateToQuestoes={onNavigateToQuestoes}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
