'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Plus,
  RefreshCw,
  Check,
  X,
  Play,
  Brain,
  AlertOctagon,
  Trophy,
  Activity,
  Layers,
  Filter,
  CheckCircle2,
  Trash2,
  BookOpen
} from 'lucide-react';
import { DailyScheduleSlot, CalendarViewMode, TimelineFilter } from './scheduleTypes';
import { MonthlyStudyCalendarView } from './MonthlyStudyCalendarView';
import { useStudyTimer, formatSecondsToShort, getLocalDateStr } from '@/context/StudyTimerContext';
import { StudySession } from '@/types/studyTimer';
import { CORE_SPECIALTIES } from '@/services/taxonomySearchService';

// Ícone Oficial do Google
const GoogleIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAY_NAMES_WEEK_VIEW = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

interface GoogleCalendarScheduleViewProps {
  events: DailyScheduleSlot[];
  timelineFilter: TimelineFilter;
  setTimelineFilter: (f: TimelineFilter) => void;
  isGoogleCalendarConnected: boolean;
  onOpenAddManual: () => void;
  onOpenCreateTask?: () => void;
  onOpenAddDrawer?: () => void;
  onOpenAiCommand: () => void;
  onOpenAiDrawer: () => void;
  hasAiSuggestions: boolean;
  onSyncGoogle?: () => void;
  isSyncingGoogle?: boolean;
  onExportSlotToGoogle?: (slot: DailyScheduleSlot) => void | Promise<void>;
  exportingSlotId?: string | null;
  exportedSlotIds?: Record<string, boolean>;
  onRemoveTask: (taskId: string) => void;
  onAction?: (action: string, slot: DailyScheduleSlot) => void;
  cleanEventDescription: (desc?: string) => string;
  isHospitalOrDutyEvent: (slot: DailyScheduleSlot) => boolean;
  primaryAccentHex?: string;
  userScheduledTasks?: DailyScheduleSlot[];
  onSyncAllTasksToGoogle?: () => void;
  onClearUserScheduledTasks?: () => void;
  isBatchSyncing?: boolean;
}

export const GoogleCalendarScheduleView: React.FC<GoogleCalendarScheduleViewProps> = ({
  events,
  timelineFilter,
  setTimelineFilter,
  isGoogleCalendarConnected,
  onOpenAddManual,
  onOpenCreateTask,
  onOpenAddDrawer,
  onOpenAiCommand,
  onOpenAiDrawer,
  hasAiSuggestions,
  onSyncGoogle,
  isSyncingGoogle,
  onExportSlotToGoogle,
  exportingSlotId,
  exportedSlotIds = {},
  onRemoveTask,
  onAction,
  cleanEventDescription,
  isHospitalOrDutyEvent,
  primaryAccentHex = '#2563eb',
  userScheduledTasks = [],
  onSyncAllTasksToGoogle,
  onClearUserScheduledTasks,
  isBatchSyncing = false
}) => {
  // Sessões de Estudo Cronometradas (Aprovado App Engine)
  const { allSessions, deleteSession } = useStudyTimer();

  // Estado do Modo de Visualização do Google Agenda (Dia, Semana, Mês, Ano)
  const [viewMode, setViewMode] = useState<CalendarViewMode>('dia');

  // Estado do Drawer Central para Adicionar Bloco de Estudo ou Tarefa
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  // Fecha o drawer central com tecla ESC
  useEffect(() => {
    if (!isAddDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddDrawerOpen]);

  // Data Selecionada e Data Atual
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [nowDate, setNowDate] = useState<Date>(() => new Date());

  // Atualiza o relógio em tempo real a cada 30 segundos para movimentar a linha de transição de horário (pausado quando em background)
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      setNowDate(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const currentMinutesNow = nowDate.getHours() * 60 + nowDate.getMinutes();

  // Verifica se a data atual selecionada é hoje
  const isSelectedDateToday = useMemo(() => {
    const today = new Date();
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  }, [currentDate]);

  // Filtragem dos eventos conforme as duas categorizações independentes
  const filteredEvents = useMemo(() => {
    let list = events;
    if (timelineFilter === 'estudos') {
      list = list.filter(s => s.isStudySession || s.category === 'estudo' || s.category === 'flashcard' || s.category === 'revisao' || s.category === 'simulado');
    } else if (timelineFilter === 'tarefas') {
      list = list.filter(s => s.isCalendarTask || s.source === 'google' || isHospitalOrDutyEvent(s));
    } else if (timelineFilter === 'google') {
      list = list.filter(s => s.source === 'google');
    }
    return [...list].sort((a, b) => a.startMinutes - b.startMinutes);
  }, [events, timelineFilter, isHospitalOrDutyEvent]);

  // Contadores para o filtro
  const studyCount = useMemo(() => events.filter(s => s.isStudySession || s.category === 'estudo' || s.category === 'flashcard' || s.category === 'revisao' || s.category === 'simulado').length, [events]);
  const taskCount = useMemo(() => events.filter(s => s.isCalendarTask || s.source === 'google' || isHospitalOrDutyEvent(s)).length, [events, isHospitalOrDutyEvent]);
  const googleCount = useMemo(() => events.filter(s => s.source === 'google').length, [events]);

  // Navegação de datas: Hoje, Anterior, Próximo
  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'dia') {
      d.setDate(d.getDate() - 1);
    } else if (viewMode === 'semana') {
      d.setDate(d.getDate() - 7);
    } else if (viewMode === 'mes') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === 'ano') {
      d.setFullYear(d.getFullYear() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'dia') {
      d.setDate(d.getDate() + 1);
    } else if (viewMode === 'semana') {
      d.setDate(d.getDate() + 7);
    } else if (viewMode === 'mes') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === 'ano') {
      d.setFullYear(d.getFullYear() + 1);
    }
    setCurrentDate(d);
  };

  // Título formatado da data exibida conforme o modo de visão
  const formattedTitle = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = MONTH_NAMES[currentDate.getMonth()];
    const day = currentDate.getDate();

    if (viewMode === 'dia') {
      const weekday = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][currentDate.getDay()];
      return `${weekday}, ${day} de ${month} de ${year}`;
    }
    if (viewMode === 'semana') {
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = (startOfWeek.getDay() + 6) % 7; // Segunda = 0
      startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.getDate()} – ${endOfWeek.getDate()} de ${MONTH_NAMES[startOfWeek.getMonth()]} de ${year}`;
      }
      return `${startOfWeek.getDate()} de ${MONTH_NAMES[startOfWeek.getMonth()]} – ${endOfWeek.getDate()} de ${MONTH_NAMES[endOfWeek.getMonth()]} de ${year}`;
    }
    if (viewMode === 'mes') {
      return `${month} de ${year}`;
    }
    if (viewMode === 'ano') {
      return `${year}`;
    }
    return '';
  }, [currentDate, viewMode]);

  // Estilização dos Cards no estilo Google Calendar
  const getEventStyle = (slot: DailyScheduleSlot) => {
    const isHospital = isHospitalOrDutyEvent(slot);
    if (isHospital) {
      return {
        cardBg: 'bg-slate-500/10 dark:bg-slate-900/50 border-l-4 border-slate-500 hover:bg-slate-500/15',
        badgeBg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/25',
        dotColor: 'bg-slate-500'
      };
    }
    if (slot.isCalendarTask) {
      return {
        cardBg: 'bg-zinc-100/80 dark:bg-[#151518] border-l-4 border-emerald-500 hover:bg-zinc-100 dark:hover:bg-[#18181c]',
        badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
        dotColor: 'bg-emerald-500'
      };
    }
    if (slot.isStudySession) {
      return {
        cardBg: 'bg-blue-500/10 dark:bg-blue-950/25 border-l-4 border-blue-600 hover:bg-blue-500/15',
        badgeBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
        dotColor: 'bg-blue-600'
      };
    }
    if (slot.source === 'google') {
      return {
        cardBg: 'bg-emerald-500/10 dark:bg-emerald-950/30 border-l-4 border-emerald-500 hover:bg-emerald-500/15',
        badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        dotColor: 'bg-emerald-500'
      };
    }
    if (slot.category === 'flashcard') {
      return {
        cardBg: 'bg-purple-500/10 dark:bg-purple-950/30 border-l-4 border-purple-500 hover:bg-purple-500/15',
        badgeBg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
        dotColor: 'bg-purple-500'
      };
    }
    if (slot.category === 'simulado') {
      return {
        cardBg: 'bg-amber-500/10 dark:bg-amber-950/30 border-l-4 border-amber-500 hover:bg-amber-500/15',
        badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
        dotColor: 'bg-amber-500'
      };
    }
    if (slot.category === 'revisao') {
      return {
        cardBg: 'bg-rose-500/10 dark:bg-rose-950/30 border-l-4 border-rose-500 hover:bg-rose-500/15',
        badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
        dotColor: 'bg-rose-500'
      };
    }
    // Default Estudo / Treino TRI
    return {
      cardBg: 'bg-blue-500/10 dark:bg-blue-950/30 border-l-4 border-blue-600 hover:bg-blue-500/15',
      badgeBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
      dotColor: 'bg-blue-600'
    };
  };

  // Horas da grade diária (06:00 às 23:00)
  const DAY_HOURS = useMemo(() => {
    const list: number[] = [];
    for (let h = 6; h <= 23; h++) {
      list.push(h);
    }
    return list;
  }, []);

  return (
    <div className="space-y-4">
      {/* ── TOOLBAR SUPERIOR ESTILO GOOGLE AGENDA ── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800 space-y-3">
        {/* Linha 1: Controles de Data e Seletor de Visão (Dia / Semana / Mês / Ano) */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Navegação de Datas Google Calendar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleGoToday}
              className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors shadow-2xs"
            >
              Hoje
            </button>

            <div className="flex items-center">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                title="Período anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                title="Próximo período"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-heading text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 ml-1">
              {formattedTitle}
            </h3>
          </div>

          {/* Seletor de Modo de Visualização do Google Agenda (Dia, Semana, Mês, Ano) */}
          <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-800/80 p-0.5 rounded-xl border border-zinc-300/60 dark:border-zinc-700/60">
            {[
              { id: 'dia', label: 'Dia' },
              { id: 'semana', label: 'Semana' },
              { id: 'mes', label: 'Mês' },
              { id: 'ano', label: 'Ano' }
            ].map(tab => {
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewMode(tab.id as CalendarViewMode)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${active
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Linha 2: Ações & Filtros de Atividade */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80">
          {/* Pílulas de Filtro (Todos / Estudos / Google) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1">
              <Filter className="w-2.5 h-2.5" />
              Filtrar:
            </span>
            {[
              { id: 'todos', label: `Todos (${events.length})` },
              { id: 'tarefas', label: `Tarefas (${taskCount})` },
              { id: 'estudos', label: `Sessões de Estudo (${studyCount})` },
              { id: 'google', label: `Google (${googleCount})` }
            ].map(f => {
              const isActive = timelineFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTimelineFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Botões de Ação: IA, Criar Tarefa, + Novo Bloco, Sincronizar Google */}
          <div className="flex items-center gap-2 flex-wrap">
            {userScheduledTasks.length > 0 && onSyncAllTasksToGoogle && (
              <button
                type="button"
                onClick={onSyncAllTasksToGoogle}
                disabled={isBatchSyncing}
                className="px-2.5 py-1.5 rounded-xl border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Sincronizar blocos adicionados ao Google Agenda"
              >
                <GoogleIcon className="w-3.5 h-3.5" />
                <span>{isBatchSyncing ? 'Sincronizando...' : 'Sincronizar c/ Google'}</span>
              </button>
            )}

            {userScheduledTasks.length > 0 && onClearUserScheduledTasks && (
              <button
                type="button"
                onClick={onClearUserScheduledTasks}
                className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-rose-500 hover:border-rose-500/30 text-xs font-medium transition-colors cursor-pointer"
                title="Limpar tarefas adicionadas e voltar ao Google Agenda limpo"
              >
                Limpar
              </button>
            )}

            {/* Botão Quadrado "+" no Canto Direito */}
            <button
              type="button"
              onClick={() => setIsAddDrawerOpen(true)}
              className="w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer shrink-0"
              style={{ backgroundColor: primaryAccentHex }}
              title="Adicionar à Agenda"
              aria-label="Adicionar à agenda"
            >
              <Plus className="w-5 h-5 stroke-[2.8]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── CORPO PRINCIPAL DO CALENDÁRIO CONFORME A VISÃO SELECIONADA ── */}
      {viewMode === 'dia' && (
        <DayView
          filteredEvents={filteredEvents}
          DAY_HOURS={DAY_HOURS}
          nowDate={nowDate}
          currentDate={currentDate}
          allSessions={allSessions}
          onDeleteSession={deleteSession}
          currentMinutesNow={currentMinutesNow}
          isSelectedDateToday={isSelectedDateToday}
          getEventStyle={getEventStyle}
          cleanEventDescription={cleanEventDescription}
          isHospitalOrDutyEvent={isHospitalOrDutyEvent}
          onExportSlotToGoogle={onExportSlotToGoogle}
          exportingSlotId={exportingSlotId}
          exportedSlotIds={exportedSlotIds}
          onRemoveTask={onRemoveTask}
          onAction={onAction}
          primaryAccentHex={primaryAccentHex}
          onOpenAiCommand={onOpenAiCommand}
          onOpenAddManual={onOpenAddManual}
          onOpenCreateTask={onOpenCreateTask}
          onOpenAddDrawer={() => setIsAddDrawerOpen(true)}
        />
      )}

      {viewMode === 'semana' && (
        <WeekView
          currentDate={currentDate}
          nowDate={nowDate}
          currentMinutesNow={currentMinutesNow}
          events={filteredEvents}
          getEventStyle={getEventStyle}
          onSelectDate={(d) => {
            setCurrentDate(d);
            setViewMode('dia');
          }}
        />
      )}

      {viewMode === 'mes' && (
        <MonthlyStudyCalendarView
          allSessions={allSessions}
          googleEvents={events}
          primaryAccentHex={primaryAccentHex}
          onDeleteSession={deleteSession}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onSelectDateToDayView={(d) => {
            setCurrentDate(d);
            setViewMode('dia');
          }}
        />
      )}

      {viewMode === 'ano' && (
        <YearView
          currentDate={currentDate}
          nowDate={nowDate}
          events={filteredEvents}
          onSelectDate={(d) => {
            setCurrentDate(d);
            setViewMode('dia');
          }}
        />
      )}

      {/* ── DRAWER / MODAL CENTRAL: ESCOLHER ADICIONAR BLOCO OU TAREFA ── */}
      {isAddDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddDrawerOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-drawer-title"
          >
            {/* Botão Fechar */}
            <button
              type="button"
              onClick={() => setIsAddDrawerOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Cabeçalho */}
            <div className="space-y-1 pr-6">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: primaryAccentHex }}
                >
                  <Plus className="w-5 h-5 stroke-[2.8]" />
                </div>
                <div>
                  <h3 id="add-drawer-title" className="font-heading font-black text-base sm:text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Adicionar à Agenda
                  </h3>
                </div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pt-1">
                Escolha o que você deseja registrar no seu cronograma de estudos:
              </p>
            </div>

            {/* Opções Centrais */}
            <div className="space-y-3">
              {/* Opção 1: Novo Bloco de Estudo */}
              <button
                type="button"
                onClick={() => {
                  setIsAddDrawerOpen(false);
                  onOpenAddManual();
                }}
                className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-left flex items-start gap-3.5 group cursor-pointer shadow-2xs"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: primaryAccentHex }}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Novo Bloco de Estudo
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Estudo
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
                    Registre uma sessão de teoria, resolução de questões, revisão ou simulado com tempo e disciplina.
                  </p>
                </div>
              </button>

              {/* Opção 2: Criar Tarefa / Plantão */}
              {onOpenCreateTask && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddDrawerOpen(false);
                    onOpenCreateTask();
                  }}
                  className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-left flex items-start gap-3.5 group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500 text-white shadow-xs group-hover:scale-105 transition-transform">
                    <CalendarPlus className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Criar Tarefa / Plantão
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Compromisso
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
                      Adicione plantão hospitalar, reunião, aula, compromisso pessoal ou intervalo no calendário.
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── COMPONENTE: VISUALIZAÇÃO DIA (COM LINHA DE TRANSIÇÃO DO HORÁRIO GOOGLE CALENDAR) ──
interface DayViewProps {
  onOpenAddDrawer?: () => void;
  filteredEvents: DailyScheduleSlot[];
  DAY_HOURS: number[];
  nowDate: Date;
  currentDate: Date;
  allSessions?: StudySession[];
  onDeleteSession?: (sessionId: string) => void;
  currentMinutesNow: number;
  isSelectedDateToday: boolean;
  getEventStyle: (slot: DailyScheduleSlot) => { cardBg: string; badgeBg: string; dotColor: string };
  cleanEventDescription: (desc?: string) => string;
  isHospitalOrDutyEvent: (slot: DailyScheduleSlot) => boolean;
  onExportSlotToGoogle?: (slot: DailyScheduleSlot) => void | Promise<void>;
  exportingSlotId?: string | null;
  exportedSlotIds?: Record<string, boolean>;
  onRemoveTask: (taskId: string) => void;
  onAction?: (action: string, slot: DailyScheduleSlot) => void;
  primaryAccentHex: string;
  onOpenAiCommand: () => void;
  onOpenAddManual: () => void;
  onOpenCreateTask?: () => void;
}

const DayView: React.FC<DayViewProps> = ({
  filteredEvents,
  DAY_HOURS,
  nowDate,
  currentDate,
  allSessions = [],
  onDeleteSession,
  currentMinutesNow,
  isSelectedDateToday,
  getEventStyle,
  cleanEventDescription,
  isHospitalOrDutyEvent,
  onExportSlotToGoogle,
  exportingSlotId,
  exportedSlotIds = {},
  onRemoveTask,
  onAction,
  primaryAccentHex,
  onOpenAiCommand,
  onOpenAddManual,
  onOpenCreateTask,
  onOpenAddDrawer
}) => {
  // Sessões Realizadas no Cronômetro para o Dia Selecionado (respeitando o fuso local do estudante)
  const selectedDateStr = useMemo(() => {
    return getLocalDateStr(currentDate);
  }, [currentDate]);

  const dayRealizedSessions = useMemo(() => {
    return allSessions.filter((s) => s.startTime && getLocalDateStr(s.startTime) === selectedDateStr);
  }, [allSessions, selectedDateStr]);

  const dayTotalRealizedSec = useMemo(() => {
    return dayRealizedSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  }, [dayRealizedSessions]);

  // Filtra os eventos da agenda estritamente para o dia atualmente selecionado
  const dayFilteredEvents = useMemo(() => {
    return filteredEvents.filter((s) => {
      const slotDate = s.date || (s.startTime && s.startTime.includes('-') ? s.startTime.split('T')[0] : getLocalDateStr(new Date()));
      return slotDate === selectedDateStr;
    });
  }, [filteredEvents, selectedDateStr]);

  // Cálculo da posição da Linha de Transição do Horário (Current Time Indicator)
  // Grade vai de 06:00 (360m) a 24:00 (1440m)
  const startDayMinutes = 6 * 60; // 360
  const endDayMinutes = 24 * 60;  // 1440
  const totalGridMinutes = endDayMinutes - startDayMinutes; // 1080 min

  const isCurrentTimeInDayRange = currentMinutesNow >= startDayMinutes && currentMinutesNow <= endDayMinutes;
  const timePercentage = Math.min(100, Math.max(0, ((currentMinutesNow - startDayMinutes) / totalGridMinutes) * 100));

  const formattedCurrentTime = useMemo(() => {
    const h = String(nowDate.getHours()).padStart(2, '0');
    const m = String(nowDate.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }, [nowDate]);

  // Se não houver eventos ou sessões na grade para o dia selecionado
  if (dayFilteredEvents.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto shadow-2xs">
          <Calendar className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Nenhum compromisso marcado para este dia
          </h5>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Seu cronograma está livre! Adicione uma atividade usando o botão + ou sincronize sua conta do Google Agenda.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
          {onOpenAddDrawer ? (
            <button
              type="button"
              onClick={onOpenAddDrawer}
              className="px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: primaryAccentHex }}
            >
              <Plus className="w-4 h-4 stroke-[2.8]" />
              <span>Adicionar Bloco ou Tarefa</span>
            </button>
          ) : (
            <>
              {onOpenCreateTask && (
                <button
                  type="button"
                  onClick={onOpenCreateTask}
                  className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Criar Tarefa</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenAddManual}
                className="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                style={{ backgroundColor: primaryAccentHex }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Novo Bloco</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onOpenAiCommand}
            className="px-3.5 py-2 rounded-xl border border-blue-500/30 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mentor IA</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grade de Horários com a Linha de Transição */}
      {dayFilteredEvents.length > 0 ? (
        <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-3 sm:p-5 overflow-hidden">
          <div className="space-y-3">
            {dayFilteredEvents.map((slot, idx) => {
              const style = getEventStyle(slot);
              const isHospital = isHospitalOrDutyEvent(slot);
              const isUserAdded = slot.source === 'plataforma';
              const isCurrentActive =
                isSelectedDateToday &&
                currentMinutesNow >= slot.startMinutes &&
                currentMinutesNow < slot.endMinutes;
              const isPast = isSelectedDateToday && slot.endMinutes <= currentMinutesNow;

              return (
                <React.Fragment key={slot.id || idx}>
                  {/* Card do Bloco estilo Google Agenda */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${style.cardBg} ${isCurrentActive
                      ? 'ring-2 ring-blue-500/50 shadow-md'
                      : isPast
                        ? 'opacity-70'
                        : 'shadow-2xs'
                      }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                        <span className="font-mono text-[10px] font-bold text-zinc-500">
                          {slot.startTime.split(':')[0]}h
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: primaryAccentHex }} />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            {slot.startTime} – {slot.endTime}
                          </span>

                          {/* Badge "AGORA" se o bloco estiver em andamento */}
                          {isCurrentActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Agora ({slot.endMinutes - currentMinutesNow}m restantes)
                            </span>
                          )}

                          {/* Badges de Categoria: Distinção Clara entre Obrigação vs Sessão de Estudo */}
                          {slot.isStudySession ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                              <Clock className="w-2.5 h-2.5" />
                              Sessão de Estudo
                            </span>
                          ) : slot.isCalendarTask ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300/40 dark:border-zinc-700">
                              Obrigação
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style.badgeBg}`}>
                              {isHospital
                                ? 'Plantão / Internato'
                                : slot.category === 'flashcard'
                                  ? 'Flashcards FSRS'
                                  : slot.category === 'simulado'
                                    ? 'Simulado Blitz'
                                    : slot.category === 'revisao'
                                      ? 'Caderno de Erros'
                                      : 'Treino TRI'}
                            </span>
                          )}

                          {/* Quantidade de Questões em Destaque */}
                          {slot.questionsCount !== undefined && slot.questionsCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
                              {slot.questionsCount}Q ({slot.correctCount || 0} acertos)
                            </span>
                          )}

                          {slot.source === 'google' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <Check className="w-2.5 h-2.5" />
                              Google Agenda
                            </span>
                          )}

                          {slot.isAiSuggested && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              <Sparkles className="w-2.5 h-2.5" />
                              Sugerido por IA
                            </span>
                          )}
                        </div>

                        <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {slot.title}
                        </h5>
                      </div>
                    </div>

                    {/* Ações do Bloco */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      {slot.action && onAction && (
                        <button
                          type="button"
                          onClick={() => onAction(slot.action!, slot)}
                          className="px-3 py-1.5 rounded-xl text-white text-xs font-bold cursor-pointer transition-opacity hover:opacity-95 shadow-2xs"
                          style={{ backgroundColor: primaryAccentHex }}
                        >
                          {slot.action === 'treinar' && 'Treinar'}
                          {slot.action === 'flashcards' && 'Revisar FSRS'}
                          {slot.action === 'caderno_erros' && 'Abrir Erros'}
                          {slot.action === 'simulado' && 'Simulado'}
                        </button>
                      )}

                      {slot.source === 'plataforma' && onExportSlotToGoogle && (
                        exportedSlotIds[slot.id] ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Salvo</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onExportSlotToGoogle(slot)}
                            disabled={exportingSlotId === slot.id}
                            className="px-2 py-1.5 rounded-lg border border-blue-500/25 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100/70 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                            title="Salvar no Google Agenda"
                          >
                            <GoogleIcon className="w-3 h-3" />
                            <span className="hidden sm:inline">+ Google</span>
                          </button>
                        )
                      )}

                      {onRemoveTask && (
                        <button
                          type="button"
                          onClick={() => onRemoveTask(slot.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title={slot.source === 'google' ? "Excluir do Google Agenda" : "Remover do cronograma"}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* ── LINHA QUE MOSTRA A TRANSIÇÃO DO HORÁRIO (GOOGLE CALENDAR CURRENT TIME INDICATOR) ── */}
          {isSelectedDateToday && isCurrentTimeInDayRange && (
            <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-red-500 font-mono font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-3.5" />
                <span>Linha de Transição Atual: {formattedCurrentTime}</span>
              </div>
              <div className="h-[2px] bg-red-500 flex-1 rounded-full shadow-2xs" />
              <span className="text-[10px] text-zinc-400 font-mono">Google Calendar Live Sync</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

// ── COMPONENTE: VISUALIZAÇÃO SEMANA ESTILO GOOGLE CALENDAR ──
interface WeekViewProps {
  currentDate: Date;
  nowDate: Date;
  currentMinutesNow: number;
  events: DailyScheduleSlot[];
  getEventStyle: (slot: DailyScheduleSlot) => { cardBg: string; badgeBg: string; dotColor: string };
  onSelectDate: (d: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  nowDate,
  currentMinutesNow,
  events,
  getEventStyle,
  onSelectDate
}) => {
  // Gera os 7 dias da semana (Segunda a Domingo)
  const weekDays = useMemo(() => {
    const list: Date[] = [];
    const base = new Date(currentDate);
    const dayOfWeek = (base.getDay() + 6) % 7; // Segunda = 0
    base.setDate(base.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      list.push(d);
    }
    return list;
  }, [currentDate]);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-3 sm:p-4 overflow-hidden">
      {/* Cabeçalho da Semana (7 Colunas com Nome e Dia) */}
      <div className="grid grid-cols-7 gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-2 text-center">
        {weekDays.map((d, i) => {
          const isToday =
            d.getDate() === nowDate.getDate() &&
            d.getMonth() === nowDate.getMonth() &&
            d.getFullYear() === nowDate.getFullYear();

          return (
            <div
              key={i}
              onClick={() => onSelectDate(d)}
              className="p-1 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                {WEEKDAY_NAMES_WEEK_VIEW[i]}
              </span>
              <div
                className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs mt-0.5 ${isToday
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-zinc-800 dark:text-zinc-200'
                  }`}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grade da Semana: 7 Colunas para os eventos */}
      <div className="grid grid-cols-7 gap-1.5 pt-3 min-h-[320px]">
        {weekDays.map((d, colIdx) => {
          const isToday =
            d.getDate() === nowDate.getDate() &&
            d.getMonth() === nowDate.getMonth() &&
            d.getFullYear() === nowDate.getFullYear();

          // Atividades de hoje são mostradas na coluna correspondente
          const dayEvents = isToday ? events : [];

          return (
            <div
              key={colIdx}
              onClick={() => onSelectDate(d)}
              className={`p-1.5 rounded-xl border border-dashed flex flex-col gap-1.5 cursor-pointer transition-all ${isToday
                ? 'border-blue-500/40 bg-blue-50/20 dark:bg-blue-950/20'
                : 'border-zinc-200/60 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
            >
              {dayEvents.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-[10px] text-zinc-400 text-center p-2">
                  {isToday ? 'Clique para ver o dia' : 'Sem tarefas'}
                </div>
              ) : (
                dayEvents.map(s => {
                  const style = getEventStyle(s);
                  return (
                    <div
                      key={s.id}
                      className={`p-1.5 rounded-lg border text-[10px] space-y-0.5 ${style.cardBg}`}
                    >
                      <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300 block truncate">
                        {s.startTime}
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                        {s.title}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── COMPONENTE: VISUALIZAÇÃO ANO ESTILO GOOGLE CALENDAR ──
interface YearViewProps {
  currentDate: Date;
  nowDate: Date;
  events: DailyScheduleSlot[];
  onSelectDate: (d: Date) => void;
}

const YearView: React.FC<YearViewProps> = ({
  currentDate,
  nowDate,
  events,
  onSelectDate
}) => {
  const currentYear = currentDate.getFullYear();

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-3 sm:p-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {MONTH_NAMES.map((mName, mIdx) => {
          const isCurrentMonth =
            nowDate.getFullYear() === currentYear && nowDate.getMonth() === mIdx;

          // Dias do mês
          const daysInMonth = new Date(currentYear, mIdx + 1, 0).getDate();
          const firstDayWeekday = new Date(currentYear, mIdx, 1).getDay();

          return (
            <div
              key={mIdx}
              onClick={() => onSelectDate(new Date(currentYear, mIdx, 1))}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${isCurrentMonth
                ? 'border-blue-500/40 bg-blue-50/15 dark:bg-blue-950/20'
                : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
            >
              <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {mName}
              </h5>

              {/* Mini grade dos dias */}
              <div className="grid grid-cols-7 gap-1 text-center text-[8px] font-mono">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((wd, wdi) => (
                  <span key={wdi} className="text-zinc-400 font-bold">
                    {wd}
                  </span>
                ))}

                {/* Padding inicial */}
                {Array.from({ length: firstDayWeekday }).map((_, pi) => (
                  <span key={`pad-${pi}`} />
                ))}

                {/* Dias */}
                {Array.from({ length: daysInMonth }).map((_, di) => {
                  const dayNum = di + 1;
                  const isToday =
                    nowDate.getFullYear() === currentYear &&
                    nowDate.getMonth() === mIdx &&
                    nowDate.getDate() === dayNum;

                  return (
                    <span
                      key={dayNum}
                      className={`py-0.5 rounded ${isToday
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                    >
                      {dayNum}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
