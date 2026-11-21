'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStudentData } from '@/context/StudentDataContext';
import {
  UserStudySchedule,
  UserScheduleItem,
  UserFocusProgress,
  ScheduleDistributionStrategy,
  ScheduleItemType
} from '@/types/studySchedule';
import {
  loadUserSchedule,
  saveUserSchedule,
  saveScheduleItemsBatch,
  moveScheduleItem,
  toggleScheduleItemCompletion,
  deleteScheduleItem
} from '@/services/studyScheduleService';
import { addDays, generateStudyScheduleItems } from '@/utils/scheduleDistributionEngine';
import { EnrichedFocusWithIncidence } from '@/services/examIncidenceService';
import { StudyScheduleCalendar } from '@/components/schedule/StudyScheduleCalendar';
import { FocusChecklistDrawer } from '@/components/schedule/FocusChecklistDrawer';
import { AutoScheduleGeneratorModal } from '@/components/schedule/AutoScheduleGeneratorModal';
import { AddDayScheduleContentModal } from '@/components/schedule/AddDayScheduleContentModal';
import { ScheduleAnalyticsHeader } from '@/components/schedule/ScheduleAnalyticsHeader';
import { HippocampusLoading } from '@/components/HippocampusLoading';

export default function CronogramaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { userAnswers } = useStudentData();

  const [isLoading, setIsLoading] = useState(true);
  const [schedule, setSchedule] = useState<UserStudySchedule | null>(null);
  const [items, setItems] = useState<UserScheduleItem[]>([]);
  const [focusProgressMap, setFocusProgressMap] = useState<Record<string, UserFocusProgress>>({});

  // Layout Responsivo: alternador entre Calendário e Checklist no mobile / drawer no desktop
  const [activeTabMobile, setActiveTabMobile] = useState<'calendar' | 'checklist'>('calendar');
  const [isChecklistDrawerOpen, setIsChecklistDrawerOpen] = useState(false);

  // Modais
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState<string | null>(null);

  // Carregamento de dados
  const loadData = useCallback(async () => {
    try {
      const data = await loadUserSchedule(user?.id);
      setSchedule(data.schedule);
      setItems(data.items);
      setFocusProgressMap(data.focusProgress);
    } catch (err) {
      console.error('[CronogramaPage] Falha ao carregar:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ações do Calendário
  const handleMoveItem = async (itemId: string, newDate: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, scheduledDate: newDate } : i))
    );
    await moveScheduleItem(itemId, newDate, undefined, user?.id);
  };

  const handleToggleComplete = async (itemId: string, completed: boolean) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, isCompleted: completed } : i))
    );
    await toggleScheduleItemCompletion(itemId, completed, user?.id);
  };

  const handleDeleteItem = async (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await deleteScheduleItem(itemId, user?.id);
  };

  const handleNavigateToResumo = (especialidade: string, foco: string) => {
    router.push(`/resumos?especialidade=${encodeURIComponent(especialidade)}&foco=${encodeURIComponent(foco)}`);
  };

  const handleNavigateToQuestoes = (especialidade: string, foco: string) => {
    const params = new URLSearchParams();
    params.set('especialidade', especialidade);
    params.set('foco', foco);
    params.set('mode', 'filtros');
    router.push(`/questoes?${params.toString()}`);
  };

  // Gerador Automático (Etapa 2)
  const handleAutoGenerate = async (params: {
    targetInstitution: string;
    targetExamDate: string;
    startDate: string;
    strategy: ScheduleDistributionStrategy;
    weeklyStudyDays: number[];
    dailyFocusTarget: number;
    includeRevisions: boolean;
    maxFociLimit: number;
  }) => {
    const newScheduleId = schedule?.id || `sched_${Date.now()}`;
    const newSchedule: UserStudySchedule = {
      id: newScheduleId,
      userId: user?.id || 'guest',
      title: `Cronograma Oficial • ${params.targetInstitution}`,
      targetExam: params.targetInstitution,
      targetExamDate: params.targetExamDate,
      startDate: params.startDate,
      weeklyStudyDays: params.weeklyStudyDays,
      dailyFocusTarget: params.dailyFocusTarget,
      isActive: true,
      autoRevisionIntervals: params.includeRevisions ? [7, 30] : [],
      settings: {
        rhythm: params.strategy === 'proportional_classic' ? 'moderado' : 'intensivo'
      }
    };

    await saveUserSchedule(newSchedule, user?.id);

    const generatedItems = generateStudyScheduleItems({
      scheduleId: newScheduleId,
      userId: user?.id || 'guest',
      targetInstitution: params.targetInstitution,
      startDate: params.startDate,
      targetExamDate: params.targetExamDate,
      strategy: params.strategy,
      weeklyStudyDays: params.weeklyStudyDays,
      dailyFocusTarget: params.dailyFocusTarget,
      includeRevisions: params.includeRevisions,
      revisionIntervals: [7, 30],
      maxFociLimit: params.maxFociLimit
    });

    await saveScheduleItemsBatch(generatedItems, user?.id);
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-8">
        <HippocampusLoading size="md" message="Carregando seu cronograma de estudos..." fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 lg:p-6 max-w-[1700px] mx-auto space-y-4 animate-in fade-in duration-150">
      {/* 1. Painel de Acompanhamento / Métricas Analíticas */}
      <ScheduleAnalyticsHeader
        items={items}
        focusProgressMap={focusProgressMap}
        userAnswers={userAnswers}
      />

      {/* 2. Barra de Acesso e Alternância Mobile */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-semibold w-full shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTabMobile('calendar')}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              activeTabMobile === 'calendar'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            📅 Calendário Completo
          </button>
          <button
            type="button"
            onClick={() => setActiveTabMobile('checklist')}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              activeTabMobile === 'checklist'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            📋 Checklist de Conteúdos
          </button>
        </div>
      </div>

      {/* 3. Área Principal com Split View ou Drawer */}
      <div className="flex items-start gap-4 lg:h-[calc(100vh-190px)] min-h-[580px] relative">
        {/* Painel do Calendário (Ocupa o centro em Desktop) */}
        <div
          className={`flex-1 h-full w-full ${
            activeTabMobile === 'calendar' ? 'block' : 'hidden lg:block'
          }`}
        >
          <StudyScheduleCalendar
            schedule={schedule}
            items={items}
            focusProgressMap={focusProgressMap}
            onMoveItem={handleMoveItem}
            onToggleComplete={handleToggleComplete}
            onDeleteItem={handleDeleteItem}
            onNavigateToResumo={handleNavigateToResumo}
            onNavigateToQuestoes={handleNavigateToQuestoes}
            onOpenChecklist={() => setIsChecklistDrawerOpen((prev) => !prev)}
            onOpenAutoGenerator={() => setIsGeneratorOpen(true)}
            onQuickAddAtDate={() => setIsChecklistDrawerOpen(true)}
          />
        </div>

        {/* Gaveta / Split View do Checklist */}
        <div
          className={`h-full border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl lg:shadow-xs transition-all duration-200 ${
            activeTabMobile === 'checklist'
              ? 'w-full block'
              : isChecklistDrawerOpen
                ? 'w-full lg:w-[460px] xl:w-[500px] block'
                : 'hidden'
          }`}
        >
          <FocusChecklistDrawer
            scheduleId={schedule?.id}
            targetInstitution={schedule?.targetExam || 'ENARE'}
            focusProgressMap={focusProgressMap}
            scheduledItems={items}
            onRefreshData={loadData}
            isDrawer={true}
            onCloseDrawer={() => {
              setIsChecklistDrawerOpen(false);
              setActiveTabMobile('calendar');
            }}
          />
        </div>
      </div>

      {/* 3. Modal de Geração Automática */}
      <AutoScheduleGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onGenerate={handleAutoGenerate}
      />
    </div>
  );
}
