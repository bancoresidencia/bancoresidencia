'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  MoreVertical,
  Trash2,
  FileQuestion
} from 'lucide-react';
import { UserScheduleItem, ScheduleItemType } from '@/types/studySchedule';
import { SPECIALTY_COLORS } from '@/services/examIncidenceService';
import { Tooltip } from '@/components/ui';

interface CalendarItemCardProps {
  item: UserScheduleItem;
  onToggleComplete: (itemId: string, completed: boolean) => void;
  onDeleteItem: (itemId: string) => void;
  onNavigateToResumo: (especialidade: string, foco: string) => void;
  onNavigateToQuestoes: (especialidade: string, foco: string) => void;
  onQuickReschedule?: (itemId: string, newDate: string) => void;
}

export const CalendarItemCard: React.FC<CalendarItemCardProps> = ({
  item,
  onToggleComplete,
  onDeleteItem,
  onNavigateToResumo,
  onNavigateToQuestoes
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const color = SPECIALTY_COLORS[item.especialidade] || '#8b5cf6';

  const getItemTypeBadge = (type: ScheduleItemType) => {
    switch (type) {
      case 'review_1':
        return { label: 'R1', badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25' };
      case 'review_2':
        return { label: 'R2', badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25' };
      case 'review_3':
        return { label: 'R3', badgeClass: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25' };
      case 'questions':
        return { label: 'Questões', badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25' };
      case 'theory':
      default:
        return { label: 'Teoria', badgeClass: 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300/60 dark:border-zinc-700' };
    }
  };

  const typeBadge = getItemTypeBadge(item.itemType);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`group relative p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
        item.isCompleted
          ? 'bg-zinc-50/70 dark:bg-zinc-900/30 border-zinc-200/60 dark:border-zinc-800/40 opacity-70'
          : 'bg-white dark:bg-[#121216] border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs hover:shadow-xs'
      }`}
      style={{
        borderLeftWidth: '3.5px',
        borderLeftColor: color
      }}
    >
      <div className="flex items-start justify-between gap-1.5 min-w-0">
        {/* Checkbox de Conclusão */}
        <button
          type="button"
          onClick={() => onToggleComplete(item.id, !item.isCompleted)}
          className="mt-0.5 shrink-0 text-zinc-300 dark:text-zinc-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          title={item.isCompleted ? 'Desmarcar' : 'Concluir'}
          aria-label={item.isCompleted ? 'Desmarcar' : 'Concluir'}
        >
          {item.isCompleted ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/15" />
          ) : (
            <Circle className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Título do Foco */}
        <div className="flex-1 min-w-0">
          <Tooltip content={`${item.especialidade} › ${item.tema}: ${item.foco}`} position="top">
            <span
              className={`block text-[11px] sm:text-xs font-semibold leading-snug truncate ${
                item.isCompleted
                  ? 'text-zinc-400 dark:text-zinc-500 line-through'
                  : 'text-zinc-800 dark:text-zinc-200'
              }`}
            >
              {item.foco}
            </span>
          </Tooltip>

          {/* Badge de Modalidade */}
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${typeBadge.badgeClass}`}
            >
              {typeBadge.label}
            </span>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 truncate max-w-[100px]">
              {item.tema}
            </span>
          </div>
        </div>

        {/* Menu de Ações Rápidas */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity"
            title="Ações do item"
            aria-label="Ações do item"
          >
            <MoreVertical className="w-3 h-3" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-6 z-50 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onNavigateToResumo(item.especialidade, item.foco);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Ler Resumo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onNavigateToQuestoes(item.especialidade, item.foco);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  <FileQuestion className="w-3.5 h-3.5" />
                  Questões
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteItem(item.id);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-t border-zinc-100 dark:border-zinc-800 mt-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
