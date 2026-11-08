'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Calendar,
  CalendarPlus,
  Clock,
  Sparkles,
  RotateCcw,
  Plus,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  X,
  Lightbulb,
  Trash2,
  BookOpen,
  Search
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useStudentData } from '@/context/StudentDataContext';
import { useStudyTimer, formatSecondsToShort, getLocalDateStr } from '@/context/StudyTimerContext';
import { searchTaxonomy, TaxonomyItem, CORE_SPECIALTIES } from '@/services/taxonomySearchService';
import { SelectedTaxonomy } from '@/types/studyTimer';
import { GoogleCalendarScheduleView } from './dashboard/GoogleCalendarScheduleView';
import { AiScheduleDrawer } from './dashboard/AiScheduleDrawer';
import {
  DailyScheduleSlot,
  AiScheduleAnalysis,
  TimelineFilter
} from './dashboard/scheduleTypes';
import {
  buildGoogleCalendarTemplateUrl,
  fetchTodayEventsFromGoogleApi,
  createEventInGoogleCalendarApi,
  createEventsBatchInGoogleCalendarApi,
  fetchGoogleCalendarAccountEmail,
  startGoogleOAuthPopup,
  startGoogleOAuthRedirect,
  generateIcsContent,
  downloadIcsFile
} from '@/services/googleCalendarService';

const GoogleIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const DEFAULT_GOOGLE_CLIENT_ID = '323022146503-csbd1pq8s2g22l3mghaaea4kocl2acfn.apps.googleusercontent.com';

const CRITICAL_SUBTOPICS_MAP: Record<string, Array<{ name: string; defaultAccuracy: number }>> = {
  cirurgia: [
    { name: 'Abdome Agudo', defaultAccuracy: 0 },
    { name: 'Trauma Abdominal (ATLS)', defaultAccuracy: 25 },
    { name: 'Hérnias da Parede', defaultAccuracy: 33 }
  ],
  clinica: [
    { name: 'Insuficiência Cardíaca', defaultAccuracy: 20 },
    { name: 'Sepse e Choque', defaultAccuracy: 30 },
    { name: 'Diabetes e Complicações', defaultAccuracy: 40 }
  ],
  pediatria: [
    { name: 'Aleitamento Materno', defaultAccuracy: 25 },
    { name: 'Infecções Respiratórias (IVAS)', defaultAccuracy: 35 },
    { name: 'Triagens Neonatais', defaultAccuracy: 40 }
  ],
  ginecologia: [
    { name: 'Sangramento Uterino Anormal', defaultAccuracy: 15 },
    { name: 'Rastreamento CA Colo', defaultAccuracy: 30 },
    { name: 'Climatério e TH', defaultAccuracy: 35 }
  ],
  obstetricia: [
    { name: 'Hemorragias da Gestação', defaultAccuracy: 20 },
    { name: 'Pré-Eclâmpsia e Eclâmpsia', defaultAccuracy: 28 },
    { name: 'Vitalidade Fetal e Parto', defaultAccuracy: 40 }
  ],
  preventiva: [
    { name: 'Estudos Epidemiológicos', defaultAccuracy: 18 },
    { name: 'Princípios e Diretrizes SUS', defaultAccuracy: 30 },
    { name: 'Testes Diagnósticos (Sens/Espec)', defaultAccuracy: 38 }
  ]
};

interface AgendaViewProps {
  onNavigateToBanco?: (specialty?: string, tema?: string) => void;
  onNavigateToFlashcards?: () => void;
  onNavigateToCadernoErros?: () => void;
  onNavigateToSimulados?: () => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  onNavigateToBanco,
  onNavigateToFlashcards,
  onNavigateToCadernoErros,
  onNavigateToSimulados
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { accentConfig } = useTheme();
  const { stats, dailyGoal, userAnswers, pendingErrorsCount } = useStudentData();

  // ── ESTADOS DE CONEXÃO COM GOOGLE AGENDA ──
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bancoresidencia_google_calendar_connected') === 'true';
    }
    return false;
  });

  const [calendarSyncMode, setCalendarSyncMode] = useState<'ical' | 'api'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('bancoresidencia_google_calendar_mode') as 'ical' | 'api') || 'api';
    }
    return 'api';
  });

  const [googleCalendarAccount, setGoogleCalendarAccount] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bancoresidencia_google_calendar_account') || 'Minha Agenda';
    }
    return 'Minha Agenda';
  });

  const [googleIcalUrl, setGoogleIcalUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bancoresidencia_google_ical_url') || '';
    }
    return '';
  });

  const [googleAccessToken, setGoogleAccessToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bancoresidencia_google_access_token') || '';
    }
    return '';
  });

  const [googleClientId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bancoresidencia_google_client_id') || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
    }
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
  });

  const [lastCalendarSyncTime, setLastCalendarSyncTime] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bancoresidencia_google_last_sync') || '';
    }
    return '';
  });

  const [realCalendarEvents, setRealCalendarEvents] = useState<DailyScheduleSlot[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bancoresidencia_real_calendar_events');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const [userScheduledTasks, setUserScheduledTasks] = useState<DailyScheduleSlot[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bancoresidencia_user_scheduled_tasks');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const [exportingSlotId, setExportingSlotId] = useState<string | null>(null);
  const [exportedSlotIds, setExportedSlotIds] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bancoresidencia_exported_slots');
        if (saved) return JSON.parse(saved);
      } catch { }
    }
    return {};
  });

  const { todaySessions, deleteSession, addManualSession } = useStudyTimer();

  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [calendarSyncError, setCalendarSyncError] = useState<string | null>(null);
  const [calendarSyncSuccessMsg, setCalendarSyncSuccessMsg] = useState<string | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('todos');

  // Modais de Criação
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showManualStudyModal, setShowManualStudyModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [customDelayMinutes, setCustomDelayMinutes] = useState(60);
  const [showAiCommandModal, setShowAiCommandModal] = useState(false);
  const [aiUserCommand, setAiUserCommand] = useState('');
  const [showAiScheduleDrawer, setShowAiScheduleDrawer] = useState(false);
  const [isAnalyzingSchedule, setIsAnalyzingSchedule] = useState(false);
  const [scheduleAiAnalysis, setScheduleAiAnalysis] = useState<AiScheduleAnalysis | null>(null);
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);

  // Campos Modal "Criar Tarefa" (Obrigação do Calendário)
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(() => getLocalDateStr(new Date()));
  const [taskStart, setTaskStart] = useState('08:00');
  const [taskEnd, setTaskEnd] = useState('17:00');
  const [taskDescription, setTaskDescription] = useState('');

  // Campos Modal "Novo Bloco" (Registro Manual de Sessão de Estudo)
  const [manualStudyTaxonomy, setManualStudyTaxonomy] = useState<SelectedTaxonomy>({});
  const [manualStudyStart, setManualStudyStart] = useState('14:00');
  const [manualStudyEnd, setManualStudyEnd] = useState('15:30');

  // Estados de busca de taxonomia (idênticos ao relógio oficial)
  const [taxonomyQuery, setTaxonomyQuery] = useState('');
  const [taxonomyResults, setTaxonomyResults] = useState<TaxonomyItem[]>([]);
  const [isLoadingTaxonomy, setIsLoadingTaxonomy] = useState(false);
  const [isTaxonomyDropdownOpen, setIsTaxonomyDropdownOpen] = useState(false);
  const taxonomyInputRef = React.useRef<HTMLInputElement>(null);
  const taxonomyContainerRef = React.useRef<HTMLDivElement>(null);

  // Fecha dropdown de taxonomia ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (taxonomyContainerRef.current && !taxonomyContainerRef.current.contains(e.target as Node)) {
        setIsTaxonomyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadTaxonomySuggestions = useCallback(async (q: string) => {
    setIsLoadingTaxonomy(true);
    try {
      const results = await searchTaxonomy(q, 15);
      setTaxonomyResults(results);
    } finally {
      setIsLoadingTaxonomy(false);
    }
  }, []);

  // Sessões Realizadas Hoje (Mais recente no topo / ordem decrescente)
  const sortedTodaySessions = useMemo(() => {
    return [...todaySessions].sort((a, b) => {
      const timeA = new Date(a.endTime || a.startTime || a.createdAt).getTime();
      const timeB = new Date(b.endTime || b.startTime || b.createdAt).getTime();
      return timeB - timeA;
    });
  }, [todaySessions]);

  // Estatísticas agregadas de estudo do dia
  const todayStats = useMemo(() => {
    const totalSeconds = todaySessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
    const totalQuestions = todaySessions.reduce((acc, s) => acc + (s.questionsCount || 0), 0);
    const totalCorrect = todaySessions.reduce((acc, s) => acc + (s.correctCount || 0), 0);
    return {
      totalSeconds,
      totalTimeFormatted: formatSecondsToShort(totalSeconds),
      totalQuestions,
      totalCorrect
    };
  }, [todaySessions]);

  // Sincronização entre abas do navegador via Storage Event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bancoresidencia_user_scheduled_tasks' && e.newValue) {
        try { setUserScheduledTasks(JSON.parse(e.newValue)); } catch { }
      }
      if (e.key === 'bancoresidencia_real_calendar_events' && e.newValue) {
        try { setRealCalendarEvents(JSON.parse(e.newValue)); } catch { }
      }
      if (e.key === 'bancoresidencia_google_calendar_connected') {
        setIsGoogleCalendarConnected(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Limpeza de descrições brutas do Google
  const cleanEventDescription = useCallback((desc?: string) => {
    if (!desc) return '';
    const lower = desc.toLowerCase().trim();
    if (
      lower.includes('evento importado') ||
      lower.includes('evento sincronizado') ||
      lower.includes('google calendar api') ||
      lower.includes('via google')
    ) {
      return '';
    }
    return desc;
  }, []);

  // Detecção de plantões e compromissos hospitalares
  const isHospitalOrDutyEvent = useCallback((slot: DailyScheduleSlot) => {
    if (slot.source !== 'google') return false;
    const text = `${slot.title} ${slot.description || ''} ${slot.location || ''}`.toLowerCase();
    return (
      text.includes('plant') ||
      text.includes('internat') ||
      text.includes('enferm') ||
      text.includes('uti') ||
      text.includes('cirurg') ||
      text.includes('ps') ||
      text.includes('pronto') ||
      text.includes('hospital') ||
      text.includes('ambul') ||
      text.includes('round') ||
      text.includes('estágio') ||
      text.includes('estagio')
    );
  }, []);

  // União ordenada dos eventos (Tarefas de Calendário + Sessões de Estudo sobreponíveis)
  const daySchedule = useMemo<DailyScheduleSlot[]>(() => {
    const slots: DailyScheduleSlot[] = [];
    const existingIds = new Set<string>();

    // 1. Eventos do Google Agenda (Obrigações)
    if (isGoogleCalendarConnected) {
      for (const ev of realCalendarEvents) {
        slots.push({ ...ev, isCalendarTask: true });
        existingIds.add(ev.id);
      }
    }

    // 2. Tarefas e compromissos criados na plataforma
    if (userScheduledTasks.length > 0) {
      for (const task of userScheduledTasks) {
        if (!existingIds.has(task.id)) {
          slots.push(task);
          existingIds.add(task.id);
        }
      }
    }

    // 3. Sessões de Estudo realizadas hoje (independentes e sobreponíveis)
    for (const sess of todaySessions) {
      const sessSlotId = `sess_slot_${sess.id}`;
      const legacyTaskId = `task_${sess.id}`;
      if (existingIds.has(sessSlotId) || existingIds.has(legacyTaskId)) continue;

      const sDate = new Date(sess.startTime);
      const eDate = new Date(sess.endTime);
      const startMinutes = isNaN(sDate.getTime()) ? 0 : sDate.getHours() * 60 + sDate.getMinutes();
      const endMinutes = isNaN(eDate.getTime()) ? startMinutes + 60 : Math.max(startMinutes + 1, eDate.getHours() * 60 + eDate.getMinutes());
      const topicTitle =
        sess.taxonomy.subfoco ||
        sess.taxonomy.foco ||
        sess.taxonomy.tema ||
        sess.taxonomy.especialidade ||
        'Estudo Realizado';

      slots.push({
        id: sessSlotId,
        title: topicTitle === 'Treino Geral' ? 'Treino de Questões' : `Estudo: ${topicTitle}`,
        category: 'estudo',
        startTime: `${String(Math.floor(startMinutes / 60)).padStart(2, '0')}:${String(startMinutes % 60).padStart(2, '0')}`,
        endTime: `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`,
        startMinutes,
        endMinutes,
        source: 'plataforma',
        description: sess.questionsCount ? `${sess.questionsCount} questões resolvidas (${sess.correctCount || 0} acertos)` : 'Sessão de estudo realizada',
        action: 'treinar',
        isStudySession: true,
        questionsCount: sess.questionsCount,
        correctCount: sess.correctCount,
        date: getLocalDateStr(sess.startTime)
      });
      existingIds.add(sessSlotId);
    }

    slots.sort((a, b) => a.startMinutes - b.startMinutes);
    return slots;
  }, [isGoogleCalendarConnected, realCalendarEvents, userScheduledTasks, todaySessions]);

  // Cálculo da Atividade Atual / Período
  const currentPeriodInfo = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (daySchedule.length === 0) {
      return {
        status: 'livre' as const,
        currentMinutes,
        slot: {
          id: 'agenda_livre_dia',
          title: isGoogleCalendarConnected
            ? 'Agenda Livre Hoje'
            : 'Conecte sua Agenda',
          category: 'pausa' as const,
          startTime: '08:00',
          endTime: '22:00',
          startMinutes: 480,
          endMinutes: 1320,
          source: 'google' as const,
          description: isGoogleCalendarConnected
            ? 'Nenhum compromisso marcado no Google Agenda hoje. Seus horários estão 100% livres para estudo.'
            : 'Conecte seu Google Agenda para sincronizar sua rotina médica com a plataforma.',
          location: 'Agenda'
        },
        progressPercent: 0,
        minutesRemaining: 0,
        nextSlot: null,
        label: 'Horário Livre'
      };
    }

    const activeSlot = daySchedule.find(
      (slot) => currentMinutes >= slot.startMinutes && currentMinutes < slot.endMinutes
    );

    if (activeSlot) {
      const elapsed = currentMinutes - activeSlot.startMinutes;
      const total = activeSlot.endMinutes - activeSlot.startMinutes;
      const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
      const minutesRemaining = activeSlot.endMinutes - currentMinutes;
      const nextUpcoming = daySchedule.find((s) => s.startMinutes >= activeSlot.endMinutes);

      return {
        status: 'em_andamento' as const,
        currentMinutes,
        slot: activeSlot,
        progressPercent,
        minutesRemaining,
        nextSlot: nextUpcoming || null,
        label: `Agora (${activeSlot.startTime} - ${activeSlot.endTime})`
      };
    }

    const upcomingSlot = daySchedule.find((s) => s.startMinutes > currentMinutes);
    if (upcomingSlot) {
      const minutesUntil = upcomingSlot.startMinutes - currentMinutes;
      return {
        status: 'proximo' as const,
        currentMinutes,
        slot: upcomingSlot,
        progressPercent: 0,
        minutesUntil,
        nextSlot: null,
        label: `Próximo Bloco (${upcomingSlot.startTime} - ${upcomingSlot.endTime})`
      };
    }

    return {
      status: 'noturno' as const,
      currentMinutes,
      slot: {
        id: 'descanso_noturno',
        title: 'Descanso & Consolidação de Memória',
        category: 'pausa' as const,
        startTime: '22:30',
        endTime: '07:30',
        startMinutes: 1350,
        endMinutes: 450,
        source: 'plataforma' as const,
        description: 'Rotina de hoje concluída. O cérebro consolida sinapses de estudo durante o sono reparador.',
        location: 'Repouso'
      },
      progressPercent: 100,
      nextSlot: daySchedule[0] || null,
      label: 'Período Noturno (Descanso)'
    };
  }, [daySchedule, isGoogleCalendarConnected]);

  // Estatísticas de Cronobiologia & Energia Mental
  const cognitiveEnergyStats = useMemo(() => {
    const shifts = {
      morning: { label: 'Manhã', range: '06h – 12h', resolvidas: 0, acertos: 0, taxa: 0 },
      afternoon: { label: 'Tarde', range: '12h – 18h', resolvidas: 0, acertos: 0, taxa: 0 },
      night: { label: 'Noite', range: '18h – 24h', resolvidas: 0, acertos: 0, taxa: 0 }
    };

    if (userAnswers && Object.keys(userAnswers).length > 0) {
      Object.values(userAnswers).forEach((ans) => {
        if (!ans || !ans.timestamp) return;
        const h = new Date(ans.timestamp).getHours();
        if (h >= 6 && h < 12) {
          shifts.morning.resolvidas++;
          if (ans.isCorrect) shifts.morning.acertos++;
        } else if (h >= 12 && h < 18) {
          shifts.afternoon.resolvidas++;
          if (ans.isCorrect) shifts.afternoon.acertos++;
        } else {
          shifts.night.resolvidas++;
          if (ans.isCorrect) shifts.night.acertos++;
        }
      });

      shifts.morning.taxa = shifts.morning.resolvidas > 0 ? Math.round((shifts.morning.acertos / shifts.morning.resolvidas) * 100) : 0;
      shifts.afternoon.taxa = shifts.afternoon.resolvidas > 0 ? Math.round((shifts.afternoon.acertos / shifts.afternoon.resolvidas) * 100) : 0;
      shifts.night.taxa = shifts.night.resolvidas > 0 ? Math.round((shifts.night.acertos / shifts.night.resolvidas) * 100) : 0;
    }

    const totalResolvidas = shifts.morning.resolvidas + shifts.afternoon.resolvidas + shifts.night.resolvidas;
    const hasData = totalResolvidas >= 5;

    let bestShift: string | null = null;
    let bestShiftTaxa = 0;
    if (hasData) {
      const candidates = [
        { name: 'Manhã', taxa: shifts.morning.taxa, count: shifts.morning.resolvidas },
        { name: 'Tarde', taxa: shifts.afternoon.taxa, count: shifts.afternoon.resolvidas },
        { name: 'Noite', taxa: shifts.night.taxa, count: shifts.night.resolvidas }
      ].filter(c => c.count >= 2);

      if (candidates.length > 0) {
        candidates.sort((a, b) => b.taxa - a.taxa);
        bestShift = candidates[0].name;
        bestShiftTaxa = candidates[0].taxa;
      }
    }

    const fatigueAlert = Boolean(
      hasData &&
      shifts.night.resolvidas >= 3 &&
      shifts.morning.taxa > 0 &&
      shifts.night.taxa < shifts.morning.taxa - 15
    );

    return {
      hasData,
      bestShift,
      bestShiftTaxa,
      fatigueAlert,
      morning: shifts.morning,
      afternoon: shifts.afternoon,
      night: shifts.night
    };
  }, [userAnswers]);

  // Pacing diário
  const todayAnswered = useMemo(() => {
    if (!userAnswers) return 0;
    const today = getLocalDateStr(new Date());
    return Object.values(userAnswers).filter((ans) => {
      if (!ans || !ans.timestamp) return false;
      const d = getLocalDateStr(ans.timestamp);
      return d === today;
    }).length;
  }, [userAnswers]);

  const todayStudyMinutes = useMemo(() => {
    return Math.round(todayAnswered * 2.2);
  }, [todayAnswered]);

  // ── Sincronização iCal ──
  const syncIcalEvents = async (urlToSync?: string, isSilent = false): Promise<boolean> => {
    const targetUrl = (urlToSync !== undefined ? urlToSync : googleIcalUrl).trim();
    if (!targetUrl) {
      if (!isSilent) setCalendarSyncError('Por favor, cole o Endereço Secreto iCal (.ics) da sua agenda.');
      return false;
    }

    setIsSyncingCalendar(true);
    if (!isSilent) {
      setCalendarSyncError(null);
      setCalendarSyncSuccessMsg(null);
    }

    try {
      const res = await fetch('/api/calendar/sync-ical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível sincronizar com o link informado.');
      }

      const events: DailyScheduleSlot[] = data.events || [];
      setRealCalendarEvents(events);
      const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      setLastCalendarSyncTime(nowStr);
      setIsGoogleCalendarConnected(true);
      setCalendarSyncMode('ical');

      if (data.calendarName) {
        setGoogleCalendarAccount(data.calendarName);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('bancoresidencia_google_calendar_connected', 'true');
        localStorage.setItem('bancoresidencia_google_calendar_mode', 'ical');
        localStorage.setItem('bancoresidencia_google_ical_url', targetUrl);
        localStorage.setItem('bancoresidencia_real_calendar_events', JSON.stringify(events));
        localStorage.setItem('bancoresidencia_google_last_sync', nowStr);
        if (data.calendarName) {
          localStorage.setItem('bancoresidencia_google_calendar_account', data.calendarName);
        }
      }

      if (events.length > 0) {
        setCalendarSyncSuccessMsg(`${events.length} compromisso(s) sincronizados via link iCal!`);
      } else {
        setCalendarSyncSuccessMsg('Agenda conectada com sucesso! Nenhum compromisso agendado para hoje (rotina livre de estudos).');
      }
      return true;
    } catch (err: any) {
      const msg = err?.name === 'TimeoutError'
        ? 'Tempo limite esgotado ao tentar sincronizar a agenda.'
        : (err?.message || 'Falha ao sincronizar agenda.');
      if (!isSilent) setCalendarSyncError(msg);
      return false;
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  // ── Sincronização Google API ──
  const handleConnectGoogleViaApi = () => {
    const cId = (googleClientId || '').trim();
    if (!cId) {
      setCalendarSyncError('Informe um Google Client ID válido para conectar via Google API.');
      return;
    }

    setIsSyncingCalendar(true);
    setCalendarSyncError(null);
    setCalendarSyncSuccessMsg(null);

    startGoogleOAuthPopup(
      cId,
      async (accessToken) => {
        try {
          setGoogleAccessToken(accessToken);
          setIsGoogleCalendarConnected(true);
          setCalendarSyncMode('api');

          if (typeof window !== 'undefined') {
            localStorage.setItem('bancoresidencia_google_access_token', accessToken);
            localStorage.setItem('bancoresidencia_google_client_id', cId);
            localStorage.setItem('bancoresidencia_google_calendar_mode', 'api');
            localStorage.setItem('bancoresidencia_google_calendar_connected', 'true');
          }

          const [events, accountEmail] = await Promise.all([
            fetchTodayEventsFromGoogleApi(accessToken).catch(() => []),
            fetchGoogleCalendarAccountEmail(accessToken).catch(() => null)
          ]);

          setRealCalendarEvents(events as any);
          const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
          setLastCalendarSyncTime(nowStr);

          if (accountEmail) {
            setGoogleCalendarAccount(accountEmail);
          }

          if (typeof window !== 'undefined') {
            localStorage.setItem('bancoresidencia_real_calendar_events', JSON.stringify(events));
            localStorage.setItem('bancoresidencia_google_last_sync', nowStr);
            if (accountEmail) {
              localStorage.setItem('bancoresidencia_google_calendar_account', accountEmail);
            }
          }

          if (events.length > 0) {
            setCalendarSyncSuccessMsg(`${events.length} evento(s) sincronizados via Google Calendar API!`);
          } else {
            setCalendarSyncSuccessMsg('Conectado via Google API! Nenhum evento para hoje (rotina livre de estudos).');
          }
          setIsGoogleModalOpen(false);
        } catch (fetchErr: any) {
          setCalendarSyncError(fetchErr?.message || 'Falha ao buscar eventos da Google Calendar API.');
        } finally {
          setIsSyncingCalendar(false);
        }
      },
      (oauthErr) => {
        setIsSyncingCalendar(false);
        const rawMsg = oauthErr?.message || oauthErr?.error || '';
        if (rawMsg.includes('popup_closed')) {
          setCalendarSyncError('Janela do Google fechada antes de autorizar. Tente novamente.');
        } else {
          setCalendarSyncError('Não foi possível conectar via Google. Verifique popups ou use o link iCal.');
        }
      }
    );
  };

  const handleSyncNow = async () => {
    if (calendarSyncMode === 'api' && googleAccessToken) {
      setIsSyncingCalendar(true);
      setCalendarSyncError(null);
      try {
        const events = await fetchTodayEventsFromGoogleApi(googleAccessToken);
        setRealCalendarEvents(events as any);
        const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        setLastCalendarSyncTime(nowStr);
        if (typeof window !== 'undefined') {
          localStorage.setItem('bancoresidencia_real_calendar_events', JSON.stringify(events));
          localStorage.setItem('bancoresidencia_google_last_sync', nowStr);
        }
        setCalendarSyncSuccessMsg(`Sincronizado! ${events.length} eventos atualizados.`);
      } catch (err: any) {
        setCalendarSyncError(err?.message || 'Falha ao atualizar via Google API.');
      } finally {
        setIsSyncingCalendar(false);
      }
    } else if (googleIcalUrl) {
      await syncIcalEvents(googleIcalUrl);
    } else {
      setIsGoogleModalOpen(true);
    }
  };

  const handleDisconnectGoogleCalendar = () => {
    setIsGoogleCalendarConnected(false);
    setRealCalendarEvents([]);
    setGoogleAccessToken('');
    setGoogleIcalUrl('');
    setGoogleCalendarAccount('Minha Agenda');
    setLastCalendarSyncTime('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bancoresidencia_google_calendar_connected');
      localStorage.removeItem('bancoresidencia_google_calendar_mode');
      localStorage.removeItem('bancoresidencia_google_access_token');
      localStorage.removeItem('bancoresidencia_google_ical_url');
      localStorage.removeItem('bancoresidencia_real_calendar_events');
      localStorage.removeItem('bancoresidencia_google_last_sync');
      localStorage.removeItem('bancoresidencia_google_calendar_account');
    }
    setIsGoogleModalOpen(false);
    setCalendarSyncSuccessMsg('Google Agenda desconectado.');
  };

  // Botão de Emergência: "Atrasei no Plantão"
  const handleReorganizeDelayedSchedule = (delayMinutes: number = 60) => {
    const minsToUse = Math.max(15, Math.min(360, delayMinutes));
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    setUserScheduledTasks((prev) => {
      if (prev.length === 0) return prev;

      const formatMins = (m: number) => {
        const h = Math.floor(m / 60) % 24;
        const min = m % 60;
        return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      };

      let runningMins = Math.max(currentMins + 10, 8 * 60);
      const updated = prev.map((task) => {
        if (task.endMinutes <= currentMins) return task;
        const duration = Math.max(20, task.endMinutes - task.startMinutes);
        const newStart = Math.max(runningMins, task.startMinutes + minsToUse);
        const newEnd = newStart + duration;
        runningMins = newEnd + 15;

        return {
          ...task,
          startMinutes: newStart,
          endMinutes: newEnd,
          startTime: formatMins(newStart),
          endTime: formatMins(newEnd),
          rationale: `Reorganizado após atraso de ${minsToUse}m no plantão/rotina. Horário protegido sem sobrecarga.`
        };
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('bancoresidencia_user_scheduled_tasks', JSON.stringify(updated));
      }
      return updated;
    });

    setShowDelayModal(false);
    setCalendarSyncSuccessMsg(`Cronograma reorganizado com sucesso (+${minsToUse}m)! A IA adaptou seus blocos restantes.`);
  };

  // ── 1. CRIAR TAREFA DE CALENDÁRIO (OBRIGAÇÃO) ──
  const handleCreateCalendarTask = () => {
    if (!taskTitle.trim()) return;

    const [sh, sm] = taskStart.split(':').map(Number);
    const [eh, em] = taskEnd.split(':').map(Number);
    const startMins = (sh || 0) * 60 + (sm || 0);
    const endMins = (eh || 0) * 60 + (em || 0);

    const newTask: DailyScheduleSlot = {
      id: `cal_task_${Date.now()}`,
      title: taskTitle.trim(),
      category: 'hospital',
      startTime: taskStart,
      endTime: taskEnd,
      startMinutes: startMins,
      endMinutes: endMins > startMins ? endMins : startMins + 60,
      source: 'plataforma',
      description: taskDescription.trim() || 'Obrigação / Tarefa de Calendário',
      date: taskDate || getLocalDateStr(new Date()),
      isCalendarTask: true,
      rationale: 'Obrigação / Tarefa de calendário adicionada.'
    };

    setUserScheduledTasks((prev) => {
      const updated = [...prev, newTask];
      if (typeof window !== 'undefined') {
        localStorage.setItem('bancoresidencia_user_scheduled_tasks', JSON.stringify(updated));
      }
      return updated;
    });

    setTaskTitle('');
    setTaskDescription('');
    setShowCreateTaskModal(false);
    setCalendarSyncSuccessMsg(`Tarefa "${newTask.title}" adicionada com sucesso à sua agenda!`);
  };

  // ── 2. REGISTRO MANUAL DE SESSÃO DE ESTUDO (NOVO BLOCO) ──
  const handleCreateManualStudySession = async () => {
    const topicLabel =
      manualStudyTaxonomy.rawLabel ||
      manualStudyTaxonomy.subfoco ||
      manualStudyTaxonomy.foco ||
      manualStudyTaxonomy.tema ||
      manualStudyTaxonomy.especialidade;

    if (!topicLabel) {
      setCalendarSyncError('Selecione ou busque uma matéria/assunto para registrar o estudo.');
      return;
    }

    try {
      await addManualSession({
        taxonomy: manualStudyTaxonomy,
        startTime: manualStudyStart,
        endTime: manualStudyEnd,
        date: getLocalDateStr(new Date())
      });

      setManualStudyTaxonomy({});
      setTaxonomyQuery('');
      setShowManualStudyModal(false);
      setCalendarSyncSuccessMsg(`Sessão de estudo em "${topicLabel}" registrada com sucesso!`);
    } catch (err) {
      console.error('Erro ao salvar sessão manual:', err);
      setCalendarSyncError('Não foi possível salvar a sessão de estudo.');
    }
  };

  // Exportar 1 Bloco para Google Agenda
  const handleExportSlotToGoogle = async (slot: DailyScheduleSlot) => {
    setExportingSlotId(slot.id);
    try {
      if (calendarSyncMode === 'api' && googleAccessToken) {
        await createEventInGoogleCalendarApi(googleAccessToken, {
          title: slot.title,
          startTime: slot.startTime,
          endTime: slot.endTime,
          description: cleanEventDescription(slot.description),
          location: slot.location
        });
        setExportedSlotIds(prev => {
          const next = { ...prev, [slot.id]: true };
          if (typeof window !== 'undefined') {
            localStorage.setItem('bancoresidencia_exported_slots', JSON.stringify(next));
          }
          return next;
        });
        setCalendarSyncSuccessMsg(`✓ Bloco "${slot.title}" gravado com sucesso no seu Google Agenda!`);
      } else {
        const templateUrl = buildGoogleCalendarTemplateUrl({
          title: slot.title,
          startTime: slot.startTime,
          endTime: slot.endTime,
          description: cleanEventDescription(slot.description),
          location: slot.location
        });
        setExportedSlotIds(prev => {
          const next = { ...prev, [slot.id]: true };
          if (typeof window !== 'undefined') {
            localStorage.setItem('bancoresidencia_exported_slots', JSON.stringify(next));
          }
          return next;
        });
        window.open(templateUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      const templateUrl = buildGoogleCalendarTemplateUrl({
        title: slot.title,
        startTime: slot.startTime,
        endTime: slot.endTime,
        description: cleanEventDescription(slot.description),
        location: slot.location
      });
      window.open(templateUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setTimeout(() => setExportingSlotId(null), 800);
    }
  };

  // Sincronizar todos os blocos com o Google Agenda
  const handleSyncAllTasksToGoogle = async () => {
    let tasksToSync = [...userScheduledTasks.filter(t => t.source === 'plataforma')];

    if (scheduleAiAnalysis?.suggestions && scheduleAiAnalysis.suggestions.length > 0) {
      const existingIds = new Set(tasksToSync.map(t => t.id));
      const suggestionsToAdd = scheduleAiAnalysis.suggestions.filter(s => !existingIds.has(s.id));
      if (suggestionsToAdd.length > 0) {
        tasksToSync = [...tasksToSync, ...suggestionsToAdd];
        setUserScheduledTasks(prev => {
          const prevIds = new Set(prev.map(p => p.id));
          const newItems = suggestionsToAdd.filter(s => !prevIds.has(s.id)).map(s => ({ ...s, isAiSuggested: true }));
          const updated = [...prev, ...newItems];
          if (typeof window !== 'undefined') {
            localStorage.setItem('bancoresidencia_user_scheduled_tasks', JSON.stringify(updated));
          }
          return updated;
        });
      }
    }

    if (tasksToSync.length === 0) {
      setCalendarSyncError('Nenhuma tarefa ou sugestão de estudo disponível para sincronizar.');
      return;
    }

    setIsBatchSyncing(true);
    setCalendarSyncError(null);

    try {
      if (calendarSyncMode === 'api' && googleAccessToken) {
        const batchInputs = tasksToSync.map(t => ({
          title: t.title,
          startTime: t.startTime,
          endTime: t.endTime,
          description: cleanEventDescription(t.description),
          location: t.location || 'Plataforma Banco Residência'
        }));
        const res = await createEventsBatchInGoogleCalendarApi(googleAccessToken, batchInputs);
        setCalendarSyncSuccessMsg(`${res.success} bloco(s) gravado(s) diretamente no seu Google Agenda!`);
      } else {
        const batchInputs = tasksToSync.map(t => ({
          title: t.title,
          startTime: t.startTime,
          endTime: t.endTime,
          description: cleanEventDescription(t.description),
          location: t.location || 'Plataforma Banco Residência'
        }));
        const icsData = generateIcsContent(batchInputs);
        downloadIcsFile('estudos_hoje_google_agenda.ics', icsData);
        setCalendarSyncSuccessMsg('Arquivo .ics gerado com sucesso! Salve ou importe no Google Agenda.');
      }

      const newlyExported: Record<string, boolean> = {};
      tasksToSync.forEach(t => { newlyExported[t.id] = true; });
      setExportedSlotIds(prev => {
        const next = { ...prev, ...newlyExported };
        if (typeof window !== 'undefined') {
          localStorage.setItem('bancoresidencia_exported_slots', JSON.stringify(next));
        }
        return next;
      });
    } catch (err: any) {
      setCalendarSyncError(err?.message || 'Falha ao sincronizar tarefas com Google Agenda.');
    } finally {
      setIsBatchSyncing(false);
    }
  };

  const handleRemoveScheduledTask = (taskId: string) => {
    setUserScheduledTasks((prev) => {
      const updated = prev.filter(t => t.id !== taskId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bancoresidencia_user_scheduled_tasks', JSON.stringify(updated));
      }
      return updated;
    });
    setExportedSlotIds(prev => {
      const next = { ...prev };
      delete next[taskId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('bancoresidencia_exported_slots', JSON.stringify(next));
      }
      return next;
    });
  };

  const handleClearUserScheduledTasks = () => {
    setUserScheduledTasks([]);
    setExportedSlotIds({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bancoresidencia_user_scheduled_tasks');
      localStorage.removeItem('bancoresidencia_exported_slots');
      localStorage.removeItem('bancoresidencia_batch_sync_completed');
    }
    setCalendarSyncSuccessMsg('Cronograma redefinido para os eventos oficiais do Google Agenda.');
  };

  // Análise com IA
  const handleAnalyzeScheduleWithAi = async (customPrompt?: string) => {
    setIsAnalyzingSchedule(true);
    setShowAiScheduleDrawer(true);
    setShowAiCommandModal(false);
    setCalendarSyncError(null);

    const commandToUse = (customPrompt !== undefined ? customPrompt : aiUserCommand).trim();
    const nowObj = new Date();
    const currentH = nowObj.getHours();
    const currentM = nowObj.getMinutes();
    const currentMinutes = currentH * 60 + currentM;
    const currentTimeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;

    const weaknessesList: Array<{ subtopic: string; specialty: string; accuracy: number }> = [];
    if (userAnswers && Object.keys(userAnswers).length > 0) {
      const themeMap: Record<string, { total: number; correct: number; specialty: string }> = {};
      Object.values(userAnswers).forEach((ans) => {
        if (ans.tema) {
          const t = ans.tema.trim();
          if (!themeMap[t]) themeMap[t] = { total: 0, correct: 0, specialty: ans.specialty || 'Geral' };
          themeMap[t].total += 1;
          if (ans.isCorrect) themeMap[t].correct += 1;
        }
      });
      Object.entries(themeMap)
        .filter(([, data]) => data.total >= 2)
        .map(([subtopic, data]) => ({
          subtopic,
          specialty: data.specialty,
          accuracy: Math.round((data.correct / data.total) * 100)
        }))
        .filter(item => item.accuracy < 50)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5)
        .forEach(w => weaknessesList.push(w));
    }

    if (weaknessesList.length === 0) {
      const defaults = CRITICAL_SUBTOPICS_MAP['clinica'] || [];
      defaults.forEach(d => {
        weaknessesList.push({
          subtopic: d.name,
          specialty: 'Clínica Médica',
          accuracy: d.defaultAccuracy
        });
      });
    }

    try {
      const res = await fetch('/api/ai/schedule-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: realCalendarEvents,
          userCommand: commandToUse,
          currentMinutes,
          userContext: {
            currentTime: currentTimeStr,
            currentMinutes,
            recommendedArea: 'Clínica Médica',
            targetExamName: user?.targetExamName || 'ENARE 2026',
            dailyGoal: dailyGoal || 30,
            todayAnswered,
            todayStudyMinutes,
            performance: {
              overallAccuracy: stats.totalAnswered > 0 ? (stats.accuracyRate || 0) : 0,
              totalAnswered: stats.totalAnswered || 0,
              areas: []
            },
            criticalWeaknesses: weaknessesList,
            errorNotebook: {
              pendingCount: pendingErrorsCount,
              mostCriticalSpecialty: 'Clínica Médica'
            },
            spacedRepetition: {
              dueToday: 15,
              overdueCount: 0,
              total: 100,
              desiredRetention: 90
            },
            cognitiveEnergy: {
              hasData: cognitiveEnergyStats.hasData,
              bestShift: cognitiveEnergyStats.bestShift,
              morning: { taxa: cognitiveEnergyStats.morning.taxa, resolvidas: cognitiveEnergyStats.morning.resolvidas },
              afternoon: { taxa: cognitiveEnergyStats.afternoon.taxa, resolvidas: cognitiveEnergyStats.afternoon.resolvidas },
              night: { taxa: cognitiveEnergyStats.night.taxa, resolvidas: cognitiveEnergyStats.night.resolvidas },
              fatigueAlert: cognitiveEnergyStats.fatigueAlert
            }
          }
        }),
        signal: AbortSignal.timeout(15000)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível analisar os horários com IA.');
      }

      setScheduleAiAnalysis({
        summary: data.summary || '',
        freeGaps: data.freeGaps || [],
        suggestions: data.suggestions || []
      });
    } catch {
      const customHint = commandToUse ? ` (orientado por: "${commandToUse}")` : '';
      const topWeakness = weaknessesList[0];

      setScheduleAiAnalysis({
        summary: `Plano adaptativo gerado pelo Preceptor${customHint}. Intervalos livres cruzados com suas vulnerabilidades clínicas e revisão espaçada.`,
        freeGaps: [
          { startTime: '14:00', endTime: '16:00', durationMinutes: 120 },
          { startTime: '19:30', endTime: '21:00', durationMinutes: 90 }
        ],
        suggestions: [
          {
            id: 'ai_sug_fallback_1',
            title: `Treino TRI: ${topWeakness ? `${topWeakness.specialty} (${topWeakness.subtopic})` : 'Clínica Médica'}`,
            category: 'estudo',
            startTime: '14:00',
            endTime: '15:15',
            startMinutes: 840,
            endMinutes: 915,
            source: 'plataforma',
            action: 'treinar',
            isAiSuggested: true,
            description: `Bloco de questões inéditas de ${topWeakness ? topWeakness.subtopic : 'Clínica'} com foco em calibragem TRI`,
            rationale: 'Janela da tarde ideal para ganho de proficiência em tópicos com taxa de acerto inferior a 50%.'
          },
          {
            id: 'ai_sug_fallback_2',
            title: 'Revisão Metacognitiva & Flashcards FSRS',
            category: 'flashcard',
            startTime: '19:30',
            endTime: '20:30',
            startMinutes: 1170,
            endMinutes: 1230,
            source: 'plataforma',
            action: 'flashcards',
            isAiSuggested: true,
            description: 'Repetição espaçada com FSRS para consolidação duradoura na memória de longo prazo.',
            rationale: 'Estudo ativo leve antes do período de descanso, prevenindo a fadiga mental.'
          }
        ]
      });
    } finally {
      setIsAnalyzingSchedule(false);
    }
  };

  const isCurrentActive = currentPeriodInfo.status === 'em_andamento';
  const activeSlot = isCurrentActive ? currentPeriodInfo.slot : null;

  return (
    <div className="space-y-6">
      {/* ── 1. CABEÇALHO ELEGANTE DA ABA AGENDA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: `${accentConfig.primaryHex}20`, color: accentConfig.primaryHex }}
            >
              <CalendarDays className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-zinc-100 tracking-tight">
                Agenda
              </h1>
            </div>
          </div>
        </div>

        {/* Botões Rápidos de Topo */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Botão 1: Criar Tarefa (Obrigação do Calendário) */}
          <button
            type="button"
            onClick={() => setShowCreateTaskModal(true)}
            className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4 text-emerald-500" />
            <span>Criar Tarefa</span>
          </button>

          {/* Botão 2: Novo Bloco (Registro Manual de Sessão de Estudo) */}
          <button
            type="button"
            onClick={() => setShowManualStudyModal(true)}
            className="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:opacity-95"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Plus className="w-4 h-4" />
            <span>Novo Bloco</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAiCommandModal(true)}
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Mentor IA</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDelayModal(true)}
            className="px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Atrasei no plantão: reajustar blocos restantes"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span>Atrasei</span>
          </button>
        </div>
      </div>

      {/* Alertas de Feedback */}
      {calendarSyncSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{calendarSyncSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setCalendarSyncSuccessMsg(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:opacity-70 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {calendarSyncError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{calendarSyncError}</span>
          </div>
          <button
            type="button"
            onClick={() => setCalendarSyncError(null)}
            className="text-rose-600 dark:text-rose-400 hover:opacity-70 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── 2. GRID PRINCIPAL (5 COLS ESQUERDA / 7 COLS DIREITA) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── COLUNA ESQUERDA: CONTROLE E SESSÕES REALIZADAS DO DIA (lg:col-span-5) ── */}
        <div className="lg:col-span-5 space-y-4">

          {/* Botão Sincronizar Google Agenda */}
          <button
            type="button"
            onClick={isGoogleCalendarConnected ? handleSyncNow : () => setIsGoogleModalOpen(true)}
            disabled={isSyncingCalendar}
            className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title={isGoogleCalendarConnected ? "Sincronizar Google Agenda agora" : "Conectar e Sincronizar Google Agenda"}
          >
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span>{isSyncingCalendar ? 'Sincronizando...' : 'Sincronizar Google Agenda'}</span>
            {isGoogleCalendarConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Google Agenda Conectada" />
            )}
          </button>

          {/* ── SESSÕES DE ESTUDO REALIZADAS HOJE (A MAIS RECENTE NO TOPO) ── */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            {/* Cabeçalho Limpo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${accentConfig.primaryHex}15`, color: accentConfig.primaryHex }}
                >
                  <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    Sessões de Hoje
                  </h3>
                </div>
              </div>

              {/* Resumo Direto de Métricas (Microcopy cirúrgico: sem adjetivos, tabular) */}
              <div className="flex items-center gap-1.5 text-[11px] font-bold font-mono">
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {todayStats.totalTimeFormatted}
                </span>
                {todayStats.totalQuestions > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    {todayStats.totalQuestions}Q
                  </span>
                )}
              </div>
            </div>

            {/* Lista das Sessões de Hoje (A mais recente no topo) */}
            {sortedTodaySessions.length === 0 ? (
              <div className="py-6 px-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-1 bg-zinc-50/50 dark:bg-zinc-900/30">
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Nenhuma sessão realizada hoje
                </p>
                <p className="text-[11px] text-zinc-400">
                  Inicie o cronômetro no topo ou clique em + Novo Bloco.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-0.5 scrollbar-thin">
                {sortedTodaySessions.map((sess) => {
                  const specColor =
                    CORE_SPECIALTIES.find(
                      (c) => c.name.toLowerCase() === (sess.taxonomy.especialidade || '').toLowerCase()
                    )?.color || accentConfig.primaryHex;

                  const topicTitle =
                    sess.taxonomy.subfoco ||
                    sess.taxonomy.foco ||
                    sess.taxonomy.tema ||
                    sess.taxonomy.especialidade ||
                    'Estudo Geral';

                  let startFormatted = '';
                  let endFormatted = '';
                  try {
                    const sDate = new Date(sess.startTime);
                    const eDate = new Date(sess.endTime);
                    startFormatted = sDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    endFormatted = eDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  } catch { }

                  return (
                    <div
                      key={sess.id}
                      className="p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between gap-2.5 relative overflow-hidden"
                    >
                      {/* Faixa lateral cromática da especialidade médica */}
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: specColor }} />

                      <div className="min-w-0 pl-1.5 space-y-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {topicTitle}
                          </span>
                          {sess.taxonomy.especialidade && sess.taxonomy.especialidade !== topicTitle && (
                            <span className="text-[9px] font-semibold text-zinc-400 truncate hidden sm:inline">
                              • {sess.taxonomy.especialidade}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                          {startFormatted && (
                            <span>{startFormatted} – {endFormatted}</span>
                          )}
                          {/* Quantidade de Questões em destaque cirúrgico */}
                          {sess.questionsCount && sess.questionsCount > 0 ? (
                            <span className="font-bold text-blue-600 dark:text-blue-400 font-sans">
                              • {sess.questionsCount} questões ({sess.correctCount || 0} acertos)
                            </span>
                          ) : (
                            <span className="text-zinc-400 font-sans italic">
                              • Teoria / Revisão
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono tabular-nums font-bold text-[11px] text-zinc-700 dark:text-zinc-300 bg-zinc-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                          {sess.durationFormatted}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Excluir o registro de estudo "${topicTitle}"?`)) {
                              deleteSession(sess.id);
                            }
                          }}
                          className="p-1 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                          title="Excluir este registro de estudo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Banner Compacto de Bloco em Andamento (Aparece apenas quando houver atividade ao vivo) */}
          {isCurrentActive && activeSlot && (
            <div className="p-3.5 rounded-2xl border border-blue-500/40 bg-blue-500/5 dark:bg-blue-950/20 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Em Andamento Agora
                  </span>
                </div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                  {activeSlot.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToBanco ? onNavigateToBanco('Clínica Médica') : router.push('/questoes')}
                className="px-3 py-1.5 rounded-xl text-white text-xs font-bold shrink-0 cursor-pointer transition-all hover:opacity-95 shadow-2xs"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                Continuar
              </button>
            </div>
          )}
        </div>

        {/* ── COLUNA DIREITA: CRONOGRAMA VISUAL GOOGLE AGENDA (lg:col-span-7) ── */}
        <div className="lg:col-span-7 space-y-4">
          <GoogleCalendarScheduleView
            events={daySchedule}
            timelineFilter={timelineFilter}
            setTimelineFilter={setTimelineFilter}
            isGoogleCalendarConnected={isGoogleCalendarConnected}
            onOpenAddManual={() => setShowManualStudyModal(true)}
            onOpenCreateTask={() => setShowCreateTaskModal(true)}
            onOpenAiCommand={() => setShowAiCommandModal(true)}
            onOpenAiDrawer={() => setShowAiScheduleDrawer(true)}
            hasAiSuggestions={Boolean(scheduleAiAnalysis?.suggestions && scheduleAiAnalysis.suggestions.length > 0)}
            onSyncGoogle={handleSyncNow}
            isSyncingGoogle={isSyncingCalendar}
            onExportSlotToGoogle={handleExportSlotToGoogle}
            exportingSlotId={exportingSlotId}
            exportedSlotIds={exportedSlotIds}
            onRemoveTask={handleRemoveScheduledTask}
            onAction={(action) => {
              if (action === 'treinar') {
                if (onNavigateToBanco) onNavigateToBanco('Clínica Médica');
                else router.push('/questoes');
              } else if (action === 'caderno_erros') {
                if (onNavigateToCadernoErros) onNavigateToCadernoErros();
                else router.push('/caderno-de-erros');
              } else if (action === 'flashcards') {
                if (onNavigateToFlashcards) onNavigateToFlashcards();
                else router.push('/flashcards');
              } else if (action === 'simulado') {
                if (onNavigateToSimulados) onNavigateToSimulados();
                else router.push('/simulados');
              }
            }}
            cleanEventDescription={cleanEventDescription}
            isHospitalOrDutyEvent={isHospitalOrDutyEvent}
            primaryAccentHex={accentConfig.primaryHex}
            userScheduledTasks={userScheduledTasks}
            onSyncAllTasksToGoogle={handleSyncAllTasksToGoogle}
            onClearUserScheduledTasks={handleClearUserScheduledTasks}
            isBatchSyncing={isBatchSyncing}
          />
        </div>
      </div>

      {/* ── 3. MODAIS DE SUPORTE ── */}

      {/* Modal 1: Conexão Google Agenda */}
      {isGoogleModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsGoogleModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-xs">
                  <GoogleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Conectar Google Agenda
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Sincronize sua rotina médica e internato
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Seletor de Modo: Google vs Link iCal */}
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setCalendarSyncMode('api')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${calendarSyncMode === 'api'
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
              >
                <GoogleIcon className="w-3.5 h-3.5" />
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => setCalendarSyncMode('ical')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${calendarSyncMode === 'ical'
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
              >
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Link iCal (.ics)</span>
              </button>
            </div>

            {calendarSyncMode === 'api' ? (
              <div className="space-y-4">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  Conecte sua conta do Google com 1 clique para sincronizar plantões e exportar blocos de estudo diretamente.
                </p>

                <button
                  type="button"
                  disabled={isSyncingCalendar}
                  onClick={handleConnectGoogleViaApi}
                  className="w-full py-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <GoogleIcon className="w-4 h-4" />
                  <span>{isSyncingCalendar ? 'Abrindo autenticação Google...' : 'Continuar com o Google'}</span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => startGoogleOAuthRedirect(googleClientId)}
                    className="text-[11px] text-blue-500 hover:underline cursor-pointer"
                  >
                    Problemas com popup? Abrir via redirecionamento
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
                  <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-blue-500" />
                    Como obter o link iCal no Google Agenda:
                  </span>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    <li>Abra o Google Agenda no navegador</li>
                    <li>Clique em Configurações ⚙️ &gt; Configurações das minhas agendas</li>
                    <li>Clique em <strong>Integrar agenda</strong></li>
                    <li>Copie o link em <strong>"Endereço secreto no formato iCal"</strong> (.ics)</li>
                  </ol>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Endereço secreto no formato iCal (.ics)
                  </label>
                  <input
                    type="url"
                    value={googleIcalUrl}
                    onChange={(e) => setGoogleIcalUrl(e.target.value)}
                    placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2.5">
              {isGoogleCalendarConnected ? (
                <>
                  <button
                    type="button"
                    onClick={handleDisconnectGoogleCalendar}
                    className="flex-1 py-2.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/10 cursor-pointer transition-colors"
                  >
                    Desconectar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (calendarSyncMode === 'api') handleSyncNow();
                      else syncIcalEvents(googleIcalUrl);
                      setIsGoogleModalOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCalendar ? 'animate-spin' : ''}`} />
                    <span>Sincronizar</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsGoogleModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isSyncingCalendar}
                    onClick={() => {
                      if (calendarSyncMode === 'api') handleConnectGoogleViaApi();
                      else syncIcalEvents(googleIcalUrl);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCalendar ? 'animate-spin' : ''}`} />
                    <span>Conectar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Reajuste "Atrasei no Plantão" */}
      {showDelayModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowDelayModal(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-xs">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Atrasei no Plantão
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Reajuste os blocos pendentes de hoje sem sobrecarga
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDelayModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Quanto tempo você gostaria de adiar suas tarefas restantes?
              </label>

              <div className="grid grid-cols-5 gap-1.5">
                {[30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setCustomDelayMinutes(mins)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${customDelayMinutes === mins
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                  >
                    +{mins}m
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Ou digite os minutos exatos de atraso:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="15"
                    max="360"
                    step="15"
                    value={customDelayMinutes}
                    onChange={(e) => setCustomDelayMinutes(Math.max(15, Number(e.target.value) || 15))}
                    className="w-24 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <span className="text-xs text-zinc-500 font-medium">minutos de tolerância/descanso</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowDelayModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleReorganizeDelayedSchedule(customDelayMinutes)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reorganizar (+{customDelayMinutes}m)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 1: CRIAR TAREFA DE CALENDÁRIO (OBRIGAÇÃO) ── */}
      {showCreateTaskModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowCreateTaskModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Criar Tarefa
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Adicione um compromisso, plantão ou aula à sua grade
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateTaskModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Campo 1: Título */}
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Título da Tarefa
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Ex: Plantão Pronto-Socorro Infantil, Aula Teórica, Reunião Clínica"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Campo 2: Dia */}
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Dia
                </label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium font-mono"
                />
              </div>

              {/* Campos 3 e 4: Início e Término */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    value={taskStart}
                    onChange={(e) => setTaskStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Horário de Término
                  </label>
                  <input
                    type="time"
                    value={taskEnd}
                    onChange={(e) => setTaskEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Campo 5: Descrição */}
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Observações, plantonistas, sala, preparativos ou detalhes da obrigação..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowCreateTaskModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateCalendarTask}
                disabled={!taskTitle.trim()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Salvar Tarefa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: NOVO BLOCO (REGISTRO MANUAL DE SESSÃO DE ESTUDO) ── */}
      {showManualStudyModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowManualStudyModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: `${accentConfig.primaryHex}20`, color: accentConfig.primaryHex }}
                >
                  <Clock className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Novo Bloco de Estudo
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Registro manual de sessão de estudo com assunto e horários
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManualStudyModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Campo 1: Assunto (Funções do relógio oficial) */}
              <div ref={taxonomyContainerRef} className="relative">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Assunto de Estudo
                </label>

                {/* Se já tiver assunto selecionado */}
                {(manualStudyTaxonomy.rawLabel || manualStudyTaxonomy.subfoco || manualStudyTaxonomy.tema || manualStudyTaxonomy.especialidade) ? (
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {manualStudyTaxonomy.subfoco || manualStudyTaxonomy.foco || manualStudyTaxonomy.tema || manualStudyTaxonomy.especialidade}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {manualStudyTaxonomy.rawLabel || [manualStudyTaxonomy.especialidade, manualStudyTaxonomy.tema, manualStudyTaxonomy.foco, manualStudyTaxonomy.subfoco].filter(Boolean).join(' › ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setManualStudyTaxonomy({});
                        setIsTaxonomyDropdownOpen(true);
                        setTimeout(() => taxonomyInputRef.current?.focus(), 50);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Alterar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Input de Busca */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        ref={taxonomyInputRef}
                        type="text"
                        value={taxonomyQuery}
                        onFocus={() => {
                          setIsTaxonomyDropdownOpen(true);
                          loadTaxonomySuggestions(taxonomyQuery);
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTaxonomyQuery(val);
                          setIsTaxonomyDropdownOpen(true);
                          loadTaxonomySuggestions(val);
                        }}
                        placeholder="Buscar por tema, doença ou especialidade..."
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                    </div>

                    {/* Atalhos Rápidos das 6 Grandes Áreas (1-Toque) */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {CORE_SPECIALTIES.map((spec) => (
                        <button
                          key={spec.name}
                          type="button"
                          onClick={() => {
                            setManualStudyTaxonomy({
                              especialidade: spec.name,
                              rawLabel: spec.name
                            });
                            setIsTaxonomyDropdownOpen(false);
                            setTaxonomyQuery('');
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: spec.color }} />
                          <span>{spec.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Dropdown de Resultados da Busca */}
                    {isTaxonomyDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 shadow-xl p-1 divide-y divide-zinc-100 dark:divide-zinc-800">
                        {isLoadingTaxonomy ? (
                          <div className="p-3 text-center text-xs text-zinc-400">
                            Buscando taxonomia médica...
                          </div>
                        ) : taxonomyResults.length === 0 ? (
                          <div className="p-3 text-center text-xs text-zinc-400">
                            Nenhum assunto encontrado para &ldquo;{taxonomyQuery}&rdquo;
                          </div>
                        ) : (
                          taxonomyResults.map((item, idx) => (
                            <button
                              key={`${item.especialidade}_${item.tema}_${item.subfoco || idx}`}
                              type="button"
                              onClick={() => {
                                setManualStudyTaxonomy({
                                  especialidade: item.especialidade,
                                  tema: item.tema,
                                  foco: item.foco,
                                  subfoco: item.subfoco,
                                  rawLabel: item.breadcrumb
                                });
                                setIsTaxonomyDropdownOpen(false);
                                setTaxonomyQuery('');
                              }}
                              className="w-full text-left p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer group"
                            >
                              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-500">
                                {item.subfoco || item.foco || item.tema || item.especialidade}
                              </div>
                              <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                                {item.breadcrumb}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Campos 2 e 3: Horário de Início e Horário de Término (APENAS) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    value={manualStudyStart}
                    onChange={(e) => setManualStudyStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Horário de Término
                  </label>
                  <input
                    type="time"
                    value={manualStudyEnd}
                    onChange={(e) => setManualStudyEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowManualStudyModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateManualStudySession}
                disabled={!(manualStudyTaxonomy.rawLabel || manualStudyTaxonomy.subfoco || manualStudyTaxonomy.tema || manualStudyTaxonomy.especialidade)}
                className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xs hover:opacity-95 disabled:opacity-50"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Salvar Sessão</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Prompt Customizado de IA */}
      {showAiCommandModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAiCommandModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Otimizador de Rotina (Mentor IA)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Comande a IA para planejar exatamente o que você precisa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiCommandModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Qual é o seu comando ou período livre?
                </label>
                <textarea
                  rows={3}
                  value={aiUserCommand}
                  onChange={(e) => setAiUserCommand(e.target.value)}
                  placeholder='Ex: "O que fazer das 14h às 18h?", "Tive plantão pesado, monte uma rotina mais leve com 20 questões e flashcards"'
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Chips Rápidos */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Sugestões rápidas de comando:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'O que fazer das 14h às 18h?',
                    'Organizar rotina pós-plantão cansativo',
                    'Encaixar 30 questões da minha área fraca',
                    'Tenho apenas 1h livre hoje à noite'
                  ].map((presetPrompt, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setAiUserCommand(presetPrompt)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200/80 dark:border-zinc-700 transition-colors cursor-pointer text-left"
                    >
                      💡 {presetPrompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowAiCommandModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleAnalyzeScheduleWithAi(aiUserCommand)}
                disabled={isAnalyzingSchedule}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingSchedule ? 'animate-spin' : ''}`} />
                <span>{isAnalyzingSchedule ? 'Gerando...' : 'Gerar Cronograma IA'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Secundário: Sugestões de IA */}
      <AiScheduleDrawer
        isOpen={showAiScheduleDrawer}
        onClose={() => setShowAiScheduleDrawer(false)}
        analysis={scheduleAiAnalysis}
        userScheduledTasks={userScheduledTasks}
        onAddTasks={(tasks) => {
          setUserScheduledTasks(prev => {
            const prevIds = new Set(prev.map(p => p.id));
            const newItems = tasks
              .filter(s => !prevIds.has(s.id))
              .map(s => ({ ...s, isAiSuggested: true }));
            const updated = [...prev, ...newItems];
            if (typeof window !== 'undefined') {
              localStorage.setItem('bancoresidencia_user_scheduled_tasks', JSON.stringify(updated));
            }
            return updated;
          });
          setCalendarSyncSuccessMsg(`${tasks.length} atividade(s) adicionada(s) ao cronograma!`);
        }}
        onRemoveTask={handleRemoveScheduledTask}
        onExportToGoogle={handleExportSlotToGoogle}
        exportingSlotId={exportingSlotId}
        exportedSlotIds={exportedSlotIds}
      />
    </div>
  );
};
