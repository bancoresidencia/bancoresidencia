'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { UserScheduleItem } from '@/types/studySchedule';
import { CalendarItemCard } from './CalendarItemCard';

interface CalendarDayCellProps {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isAllowedDay: boolean; // se é dia de estudo ou de folga
  items: UserScheduleItem[];
  onMoveItem: (itemId: string, targetDate: string) => void;
  onToggleComplete: (itemId: string, completed: boolean) => void;
  onDeleteItem: (itemId: string) => void;
  onNavigateToResumo: (especialidade: string, foco: string) => void;
  onNavigateToQuestoes: (especialidade: string, foco: string) => void;
  onQuickAddAtDate?: (dateStr: string) => void;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  dateStr,
  dayNumber,
  isCurrentMonth,
  isToday,
  isAllowedDay,
  items,
  onMoveItem,
  onToggleComplete,
  onDeleteItem,
  onNavigateToResumo,
  onNavigateToQuestoes,
  onQuickAddAtDate
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      onMoveItem(itemId, dateStr);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group/cell relative min-h-[110px] sm:min-h-[135px] p-2 flex flex-col border border-[var(--card-border,#e4e4e7)]/70 dark:border-zinc-800/60 transition-all duration-150 ${
        isCurrentMonth
          ? isAllowedDay
            ? 'bg-white dark:bg-[#0c0c0e]'
            : 'bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-400'
          : 'bg-zinc-100/40 dark:bg-zinc-950/70 text-zinc-400/60'
      } ${
        isDragOver
          ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/30'
          : ''
      }`}
    >
      {/* Topo da Célula: Número do Dia & Botão + */}
      <div className="flex items-center justify-between mb-1.5 shrink-0">
        <span
          className={`text-xs font-mono font-semibold flex items-center justify-center ${
            isToday
              ? 'w-6 h-6 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
              : isCurrentMonth
                ? 'text-zinc-800 dark:text-zinc-200'
                : 'text-zinc-400 dark:text-zinc-600'
          }`}
        >
          {dayNumber}
        </span>

        {/* Quantidade de Focos / Botão Adicionar */}
        <div className="flex items-center gap-1">
          {items.length > 0 && (
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-medium">
              {items.length} {items.length === 1 ? 'foco' : 'focos'}
            </span>
          )}

          {isCurrentMonth && onQuickAddAtDate && (
            <button
              type="button"
              onClick={() => onQuickAddAtDate(dateStr)}
              className="p-1 rounded-md text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 opacity-70 sm:opacity-0 group-hover/cell:opacity-100 transition-all cursor-pointer"
              title="Adicionar estudo nesta data"
              aria-label="Adicionar estudo nesta data"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Lista de Focos Agendados */}
      <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[170px] no-scrollbar">
        {items.map((item) => (
          <CalendarItemCard
            key={item.id}
            item={item}
            onToggleComplete={onToggleComplete}
            onDeleteItem={onDeleteItem}
            onNavigateToResumo={onNavigateToResumo}
            onNavigateToQuestoes={onNavigateToQuestoes}
          />
        ))}
      </div>
    </div>
  );
};
