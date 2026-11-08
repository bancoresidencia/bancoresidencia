'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  CalendarDays,
  FileCheck,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { StudySession } from '@/types/studyTimer';
import { DailyScheduleSlot } from './scheduleTypes';
import { CORE_SPECIALTIES } from '@/services/taxonomySearchService';
import { formatSecondsToShort, useStudyTimer } from '@/context/StudyTimerContext';
import { DayStudyDetailsModal } from './DayStudyDetailsModal';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface MonthlyStudyCalendarViewProps {
  allSessions?: StudySession[];
  googleEvents?: DailyScheduleSlot[];
  onDeleteSession?: (sessionId: string) => void;
  primaryAccentHex?: string;
  currentDate?: Date;
  onDateChange?: (d: Date) => void;
  onSelectDateToDayView?: (d: Date) => void;
}

export const MonthlyStudyCalendarView: React.FC<MonthlyStudyCalendarViewProps> = ({
  allSessions: propSessions,
  googleEvents = [],
  onDeleteSession,
  primaryAccentHex = '#2563eb',
  currentDate: propCurrentDate,
  onDateChange,
  onSelectDateToDayView
}) => {
  const { allSessions: contextSessions, deleteSession: contextDeleteSession } = useStudyTimer();
  const allSessions = propSessions && propSessions.length > 0 ? propSessions : contextSessions;
  const activeDeleteSession = onDeleteSession || contextDeleteSession;

  // Mês e Ano atualmente exibidos (sincronizado com prop externa se fornecida)
  const [internalCurrentDate, setInternalCurrentDate] = useState<Date>(() => propCurrentDate || new Date());
  const currentDate = propCurrentDate || internalCurrentDate;

  const updateCurrentDate = (newDate: Date) => {
    if (onDateChange) onDateChange(newDate);
    setInternalCurrentDate(newDate);
  };

  const nowDate = useMemo(() => new Date(), []);

  // Modal de Detalhes do Dia Selecionado
  const [selectedDayDateStr, setSelectedDayDateStr] = useState<string | null>(null);

  // Navegação de Mês
  const handlePrevMonth = () => {
    updateCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    updateCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleJumpToToday = () => {
    updateCurrentDate(new Date());
  };

  // Mapeamento de Sessões por Data ("YYYY-MM-DD")
  const sessionsByDate = useMemo(() => {
    const map: Record<string, StudySession[]> = {};
    for (const sess of allSessions) {
      if (!sess.startTime) continue;
      const dateKey = sess.startTime.split('T')[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(sess);
    }
    return map;
  }, [allSessions]);

  // Mapeamento de Eventos Google por Data ("YYYY-MM-DD")
  const googleEventsByDate = useMemo(() => {
    const map: Record<string, DailyScheduleSlot[]> = {};
    for (const evt of googleEvents) {
      const dateKey = evt.date || nowDate.toISOString().split('T')[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(evt);
    }
    return map;
  }, [googleEvents, nowDate]);

  // Geração da Matriz de Células Mensais (Quadrados lado a lado)
  const monthCells = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const cells: Array<{ date: Date; dateStr: string; isCurrentMonth: boolean }> = [];

    // Dias do mês anterior
    const firstDayOfWeek = firstDay.getDay(); // 0 = Domingo
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      cells.push({ date: d, dateStr, isCurrentMonth: false });
    }

    // Dias do mês atual
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ date: dateObj, dateStr, isCurrentMonth: true });
    }

    // Dias do mês seguinte para completar as 7 colunas
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        cells.push({ date: d, dateStr, isCurrentMonth: false });
      }
    }

    return cells;
  }, [currentDate]);

  // Estatísticas Rápidas do Mês
  const monthStats = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    let totalSeconds = 0;
    let daysWithStudy = 0;
    let totalSessions = 0;

    for (const [dateKey, list] of Object.entries(sessionsByDate)) {
      const [y, m] = dateKey.split('-').map(Number);
      if (y === currentYear && m === currentMonth + 1) {
        if (list.length > 0) {
          daysWithStudy += 1;
          totalSessions += list.length;
          totalSeconds += list.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
        }
      }
    }

    return {
      totalFormatted: formatSecondsToShort(totalSeconds),
      daysWithStudy,
      totalSessions
    };
  }, [sessionsByDate, currentDate]);

  const selectedDaySessions = selectedDayDateStr ? sessionsByDate[selectedDayDateStr] || [] : [];
  const selectedDayGoogleEvents = selectedDayDateStr ? googleEventsByDate[selectedDayDateStr] || [] : [];

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* ── 1. CABEÇALHO DO MÊS COM NAVEGAÇÃO & METAS DO MÊS (Estilo Aprovado) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* Navegação de Mês */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <h2 className="text-base sm:text-lg font-black font-[var(--font-inter)] tracking-tight text-zinc-900 dark:text-zinc-100 min-w-[180px] text-center">
            {MONTH_NAMES[currentDate.getMonth()]} de {currentDate.getFullYear()}
          </h2>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Próximo Mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleJumpToToday}
            className="ml-2 px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors cursor-pointer"
          >
            Hoje
          </button>
        </div>

        {/* Resumo do Mês em Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{monthStats.totalFormatted} estudados</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>{monthStats.totalSessions} sessões</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold">
            {monthStats.daysWithStudy} dias ativos
          </div>
        </div>
      </div>

      {/* ── 2. GRADE MENSAL DE QUADRADOS LADO A LADO ── */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-3 sm:p-5 shadow-xs overflow-hidden">
        {/* Cabeçalho dos Dias da Semana (Dom a Sáb) */}
        <div className="grid grid-cols-7 gap-1.5 border-b border-zinc-200/80 dark:border-zinc-800 pb-3 text-center">
          {WEEKDAY_NAMES.map((w, i) => (
            <span
              key={i}
              className={`text-[11px] font-black uppercase tracking-wider ${
                i === 0 || i === 6 ? 'text-zinc-400' : 'text-slate-600 dark:text-zinc-300'
              }`}
            >
              {w}
            </span>
          ))}
        </div>

        {/* Matriz com Quadrados Lado a Lado */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-3">
          {monthCells.map((cell, idx) => {
            const isToday =
              cell.date.getDate() === nowDate.getDate() &&
              cell.date.getMonth() === nowDate.getMonth() &&
              cell.date.getFullYear() === nowDate.getFullYear();

            const daySessions = sessionsByDate[cell.dateStr] || [];
            const dayGoogleEvents = googleEventsByDate[cell.dateStr] || [];
            const hasStudy = daySessions.length > 0;
            const hasGoogle = dayGoogleEvents.length > 0;

            const dayTotalSec = daySessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
            const dayTotalFormatted = formatSecondsToShort(dayTotalSec);

            // Cores das especialidades presentes no dia
            const specialtyColors = Array.from(
              new Set(
                daySessions.map((s) => {
                  return (
                    CORE_SPECIALTIES.find(
                      (c) => c.name.toLowerCase() === (s.taxonomy.especialidade || '').toLowerCase()
                    )?.color || '#3b82f6'
                  );
                })
              )
            ).slice(0, 4);

            return (
              <div
                key={idx}
                onClick={() => setSelectedDayDateStr(cell.dateStr)}
                className={`min-h-[82px] sm:min-h-[105px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                  !cell.isCurrentMonth
                    ? 'border-transparent opacity-30 bg-zinc-50/40 dark:bg-zinc-900/10'
                    : isToday
                    ? 'border-blue-500/60 bg-blue-50/20 dark:bg-blue-950/20 ring-2 ring-blue-500/30'
                    : hasStudy
                    ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 hover:border-emerald-500/60 shadow-2xs'
                    : 'border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
                title={`Clique para inspecionar ${cell.dateStr}`}
              >
                {/* Linha Superior: Número do Dia + Indicador Hoje / Google */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black w-6 h-6 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                      isToday
                        ? 'bg-blue-600 text-white shadow-xs'
                        : hasStudy
                        ? 'text-emerald-700 dark:text-emerald-300 font-extrabold'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>

                  {/* Indicadores de Status */}
                  <div className="flex items-center gap-1">
                    {hasGoogle && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"
                        title="Possui compromissos do Google Agenda"
                      />
                    )}
                    {hasStudy && (
                      <span
                        className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                        title="Estudo realizado neste dia"
                      />
                    )}
                  </div>
                </div>

                {/* Conteúdo Central: Estatísticas de Estudo Realizado (Idêntico ao Aprovado) */}
                {hasStudy ? (
                  <div className="mt-1 space-y-0.5">
                    {/* Quantidade de Sessões: "X Ativ." */}
                    <div className="text-[10px] sm:text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 truncate">
                      <FileCheck className="w-3 h-3 shrink-0" />
                      <span>{daySessions.length} {daySessions.length === 1 ? 'Ativ.' : 'Ativ.'}</span>
                    </div>

                    {/* Duração Total Acumulada no Dia: "Xh Ym" na fonte Inter */}
                    <div className="text-xs sm:text-[13px] font-black font-[var(--font-inter)] tabular-nums tracking-tight text-emerald-800 dark:text-emerald-200 truncate flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{dayTotalFormatted}</span>
                    </div>

                    {/* Bolinhas coloridas das matérias */}
                    <div className="flex items-center gap-1 pt-0.5">
                      {specialtyColors.map((color, ci) => (
                        <span
                          key={ci}
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ) : hasGoogle ? (
                  /* Mostra plantão/compromisso preservado do Google */
                  <div className="mt-1">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md truncate block">
                      {dayGoogleEvents[0]?.title || 'Compromisso'}
                    </span>
                  </div>
                ) : (
                  <div className="h-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. MODAL DE DETALHES DO DIA SELECIONADO (Estilo Aprovado) ── */}
      {selectedDayDateStr && (
        <DayStudyDetailsModal
          isOpen={Boolean(selectedDayDateStr)}
          onClose={() => setSelectedDayDateStr(null)}
          dateStr={selectedDayDateStr}
          sessions={selectedDaySessions}
          googleEvents={selectedDayGoogleEvents}
          onDeleteSession={activeDeleteSession}
          onNavigateToDayView={(dateStr) => {
            if (onSelectDateToDayView) {
              const [y, m, d] = dateStr.split('-').map(Number);
              onSelectDateToDayView(new Date(y, m - 1, d));
            }
          }}
        />
      )}
    </div>
  );
};
