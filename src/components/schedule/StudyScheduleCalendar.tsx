'use client';

import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import {
  UserStudySchedule,
  UserScheduleItem,
  UserFocusProgress
} from '@/types/studySchedule';
import { CalendarDayCell } from './CalendarDayCell';
import { CalendarItemCard } from './CalendarItemCard';
import { CalendarTopToolbar } from './CalendarTopToolbar';
import { CalendarListView } from './CalendarListView';
import { getDayOfWeek } from '@/utils/scheduleDistributionEngine';

export type CalendarViewMode = 'month' | 'week' | 'list';

interface StudyScheduleCalendarProps {
  schedule: UserStudySchedule | null;
  items: UserScheduleItem[];
  focusProgressMap: Record<string, UserFocusProgress>;
  onMoveItem: (itemId: string, newDate: string) => void;
  onToggleComplete: (itemId: string, completed: boolean) => void;
  onDeleteItem: (itemId: string) => void;
  onNavigateToResumo: (especialidade: string, foco: string) => void;
  onNavigateToQuestoes: (especialidade: string, foco: string) => void;
  onOpenChecklist?: () => void;
  onOpenAutoGenerator?: () => void;
  onQuickAddAtDate?: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAY_NAMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const WEEKDAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export const StudyScheduleCalendar: React.FC<StudyScheduleCalendarProps> = ({
  schedule,
  items,
  focusProgressMap: _focusProgressMap,
  onMoveItem,
  onToggleComplete,
  onDeleteItem,
  onNavigateToResumo,
  onNavigateToQuestoes,
  onOpenChecklist,
  onOpenAutoGenerator,
  onQuickAddAtDate
}) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const allowedDaysSet = useMemo(
    () => new Set(schedule?.weeklyStudyDays || [1, 2, 3, 4, 5]),
    [schedule]
  );

  // Mapeamento de itens por data (YYYY-MM-DD)
  const itemsByDate = useMemo(() => {
    const map: Record<string, UserScheduleItem[]> = {};
    for (const item of items) {
      if (!map[item.scheduledDate]) map[item.scheduledDate] = [];
      map[item.scheduledDate].push(item);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.orderIndex - b.orderIndex);
    }
    return map;
  }, [items]);

  // Navegação
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 14);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 14);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // 1. Grid do Mês
  const monthGridDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    let startDayOfWeek = firstDayOfMonth.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Segunda = 0

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const grid = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(Date.UTC(year, month - 1, dayNum));
      const dateStr = prevDate.toISOString().split('T')[0];
      grid.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isAllowedDay: allowedDaysSet.has(getDayOfWeek(dateStr)),
        items: itemsByDate[dateStr] || []
      });
    }

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const curDate = new Date(Date.UTC(year, month, dayNum));
      const dateStr = curDate.toISOString().split('T')[0];
      grid.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isAllowedDay: allowedDaysSet.has(getDayOfWeek(dateStr)),
        items: itemsByDate[dateStr] || []
      });
    }

    const remaining = 7 - (grid.length % 7);
    if (remaining < 7) {
      for (let dayNum = 1; dayNum <= remaining; dayNum++) {
        const nextDate = new Date(Date.UTC(year, month + 1, dayNum));
        const dateStr = nextDate.toISOString().split('T')[0];
        grid.push({
          dateStr,
          dayNumber: dayNum,
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
          isAllowedDay: allowedDaysSet.has(getDayOfWeek(dateStr)),
          items: itemsByDate[dateStr] || []
        });
      }
    }

    return grid;
  }, [year, month, todayStr, allowedDaysSet, itemsByDate]);

  // 2. Dias da Semana Ativa
  const weekDays = useMemo(() => {
    const cur = new Date(currentDate);
    let day = cur.getDay();
    day = day === 0 ? 6 : day - 1;
    cur.setDate(cur.getDate() - day);

    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(cur);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({
        dateStr,
        dayNumber: d.getDate(),
        weekdayLabel: WEEKDAY_SHORT[i],
        isCurrentMonth: d.getMonth() === month,
        isToday: dateStr === todayStr,
        isAllowedDay: allowedDaysSet.has(getDayOfWeek(dateStr)),
        items: itemsByDate[dateStr] || []
      });
    }
    return result;
  }, [currentDate, month, todayStr, allowedDaysSet, itemsByDate]);

  // 3. Dias da Visão em Lista
  const listDays = useMemo(() => {
    const result = [];
    const base = new Date(currentDate);
    for (let i = 0; i < 21; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayItems = itemsByDate[dateStr] || [];
      if (dayItems.length > 0 || allowedDaysSet.has(getDayOfWeek(dateStr))) {
        result.push({
          dateStr,
          dayNumber: d.getDate(),
          monthLabel: MONTH_NAMES[d.getMonth()],
          weekdayLabel: WEEKDAY_NAMES[getDayOfWeek(dateStr) === 0 ? 6 : getDayOfWeek(dateStr) - 1],
          isToday: dateStr === todayStr,
          items: dayItems
        });
      }
    }
    return result;
  }, [currentDate, itemsByDate, allowedDaysSet, todayStr]);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card,#ffffff)] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 rounded-2xl border border-[var(--card-border,#e4e4e7)] dark:border-zinc-800 shadow-xs overflow-hidden select-none">
      {/* 1. Barra de Controles e Navegação */}
      <CalendarTopToolbar
        monthName={MONTH_NAMES[month]}
        year={year}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onOpenChecklist={onOpenChecklist}
        onOpenAutoGenerator={onOpenAutoGenerator}
      />

      {/* 2. Visualização Selecionada */}
      <div className="flex-1 overflow-y-auto">
        {/* MODO MÊS AMPLO */}
        {viewMode === 'month' && (
          <div className="flex flex-col h-full min-w-[650px] sm:min-w-0">
            <div className="grid grid-cols-7 border-b border-[var(--card-border,#e4e4e7)] dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center py-2.5">
              {WEEKDAY_SHORT.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
              {monthGridDays.map((cell) => (
                <CalendarDayCell
                  key={cell.dateStr}
                  dateStr={cell.dateStr}
                  dayNumber={cell.dayNumber}
                  isCurrentMonth={cell.isCurrentMonth}
                  isToday={cell.isToday}
                  isAllowedDay={cell.isAllowedDay}
                  items={cell.items}
                  onMoveItem={onMoveItem}
                  onToggleComplete={onToggleComplete}
                  onDeleteItem={onDeleteItem}
                  onNavigateToResumo={onNavigateToResumo}
                  onNavigateToQuestoes={onNavigateToQuestoes}
                  onQuickAddAtDate={onQuickAddAtDate}
                />
              ))}
            </div>
          </div>
        )}

        {/* MODO SEMANA DETALHADA */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-1 sm:grid-cols-7 h-full min-h-[500px] border-b border-[var(--card-border,#e4e4e7)] dark:border-zinc-800 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800">
            {weekDays.map((col) => (
              <div
                key={col.dateStr}
                className={`flex flex-col p-3 space-y-2.5 ${
                  col.isToday ? 'bg-blue-50/20 dark:bg-blue-950/10' : 'bg-transparent'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      {col.weekdayLabel}
                    </span>
                    <span className="text-base font-bold font-mono text-zinc-800 dark:text-zinc-200">
                      {col.dayNumber}
                    </span>
                  </div>
                  {onQuickAddAtDate && (
                    <button
                      type="button"
                      onClick={() => onQuickAddAtDate(col.dateStr)}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                  {col.items.length === 0 ? (
                    <div className="py-8 text-center text-zinc-300 dark:text-zinc-700 text-xs">
                      Sem tarefas
                    </div>
                  ) : (
                    col.items.map((item) => (
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
        )}

        {/* MODO LISTA / TIMELINE */}
        {viewMode === 'list' && (
          <CalendarListView
            days={listDays}
            onToggleComplete={onToggleComplete}
            onDeleteItem={onDeleteItem}
            onNavigateToResumo={onNavigateToResumo}
            onNavigateToQuestoes={onNavigateToQuestoes}
            onQuickAddAtDate={onQuickAddAtDate}
          />
        )}
      </div>
    </div>
  );
};
