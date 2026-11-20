'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentData } from '@/context/StudentDataContext';
import { useAuth } from '@/context/AuthContext';
import {
  getEnrichedFociForInstitution,
  getAvailableTargetInstitutions,
  EnrichedFocusWithIncidence
} from '@/services/examIncidenceService';
import { calculateFociPerformanceMap, getMetricForFocus } from '@/utils/focusPerformanceCalculator';
import { UserFocusProgress, UserScheduleItem, ScheduleItemType } from '@/types/studySchedule';
import { upsertFocusProgress, saveScheduleItemsBatch } from '@/services/studyScheduleService';
import { addDays } from '@/utils/scheduleDistributionEngine';
import { FocusChecklistItemRow } from './FocusChecklistItemRow';
import { FocusChecklistHeader } from './FocusChecklistHeader';
import { QuickScheduleModal } from './QuickScheduleModal';

interface FocusChecklistDrawerProps {
  scheduleId?: string;
  targetInstitution?: string;
  focusProgressMap: Record<string, UserFocusProgress>;
  scheduledItems?: UserScheduleItem[];
  onRefreshData?: () => void;
  isDrawer?: boolean;
  onCloseDrawer?: () => void;
}

export const FocusChecklistDrawer: React.FC<FocusChecklistDrawerProps> = ({
  scheduleId = 'default_schedule',
  targetInstitution = 'ENARE',
  focusProgressMap,
  scheduledItems = [],
  onRefreshData,
  isDrawer = false,
  onCloseDrawer
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { userAnswers } = useStudentData();

  const [currentInstitution, setCurrentInstitution] = useState<string>(targetInstitution);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'studied' | 'with_revision'>('all');
  const [incidenceFilter, setIncidenceFilter] = useState<'all' | 'extreme_only' | 'high_plus'>('all');
  const [quickScheduleFocus, setQuickScheduleFocus] = useState<EnrichedFocusWithIncidence | null>(null);

  // 1. Instituições disponíveis
  const availableInstitutions = useMemo(() => getAvailableTargetInstitutions(), []);

  // 2. Performance real das questões
  const performanceMap = useMemo(() => calculateFociPerformanceMap(userAnswers), [userAnswers]);

  // 3. Focos enriquecidos com a incidência da instituição
  const enrichedFoci = useMemo(
    () => getEnrichedFociForInstitution(currentInstitution),
    [currentInstitution]
  );

  // 4. Mapeamento de itens agendados por Foco
  const scheduledItemsByFocus = useMemo(() => {
    const map: Record<string, UserScheduleItem[]> = {};
    for (const item of scheduledItems) {
      const key = item.foco.toLowerCase();
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }
    return map;
  }, [scheduledItems]);

  // 5. Lista de especialidades únicas
  const specialties = useMemo(() => {
    const set = new Set<string>();
    enrichedFoci.forEach((f) => set.add(f.especialidade));
    return Array.from(set);
  }, [enrichedFoci]);

  // 6. Filtragem
  const filteredFoci = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return enrichedFoci.filter((node) => {
      if (selectedSpecialty !== 'all' && node.especialidade !== selectedSpecialty) return false;

      const prog = focusProgressMap[node.focusKey];
      const isStudied = Boolean(prog?.isStudied);
      const hasRevision = Boolean(prog?.reviewCount && prog.reviewCount > 0);

      if (statusFilter === 'pending' && isStudied) return false;
      if (statusFilter === 'studied' && !isStudied) return false;
      if (statusFilter === 'with_revision' && !hasRevision) return false;

      if (incidenceFilter === 'extreme_only' && node.incidence.fireCount !== 4) return false;
      if (incidenceFilter === 'high_plus' && node.incidence.fireCount < 3) return false;

      if (q) {
        const inFoco = node.foco.toLowerCase().includes(q);
        const inTema = node.tema.toLowerCase().includes(q);
        const inEsp = node.especialidade.toLowerCase().includes(q);
        if (!inFoco && !inTema && !inEsp) return false;
      }

      return true;
    });
  }, [enrichedFoci, selectedSpecialty, statusFilter, incidenceFilter, searchQuery, focusProgressMap]);

  // 7. Estatísticas gerais do checklist
  const stats = useMemo(() => {
    const total = enrichedFoci.length;
    let studied = 0;
    for (const f of enrichedFoci) {
      if (focusProgressMap[f.focusKey]?.isStudied) studied++;
    }
    const percent = total > 0 ? Math.round((studied / total) * 100) : 0;
    return { total, studied, percent };
  }, [enrichedFoci, focusProgressMap]);

  // Ações
  const handleToggleStudied = async (node: EnrichedFocusWithIncidence, newStudied: boolean) => {
    try {
      await upsertFocusProgress(
        {
          especialidade: node.especialidade,
          tema: node.tema,
          foco: node.foco,
          isStudied: newStudied
        },
        user?.id
      );
      onRefreshData?.();
    } catch (err) {
      console.error('Falha ao alternar foco:', err);
    }
  };

  const handleConfirmQuickSchedule = async (params: {
    date: string;
    itemType: ScheduleItemType;
    notes?: string;
    autoScheduleRevisions: boolean;
    intervals: number[];
  }) => {
    if (!quickScheduleFocus) return;

    const itemsToAdd: UserScheduleItem[] = [
      {
        id: `item_manual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        scheduleId,
        userId: user?.id || 'guest',
        especialidade: quickScheduleFocus.especialidade,
        tema: quickScheduleFocus.tema,
        foco: quickScheduleFocus.foco,
        scheduledDate: params.date,
        itemType: params.itemType,
        isCompleted: false,
        orderIndex: 0,
        notes: params.notes || null
      }
    ];

    if (params.autoScheduleRevisions && params.intervals.length > 0) {
      params.intervals.forEach((days, idx) => {
        const revDate = addDays(params.date, days);
        const rType: ScheduleItemType = idx === 0 ? 'review_1' : idx === 1 ? 'review_2' : 'review_3';
        itemsToAdd.push({
          id: `item_manual_rev_${Date.now()}_${idx}`,
          scheduleId,
          userId: user?.id || 'guest',
          especialidade: quickScheduleFocus.especialidade,
          tema: quickScheduleFocus.tema,
          foco: quickScheduleFocus.foco,
          scheduledDate: revDate,
          itemType: rType,
          isCompleted: false,
          orderIndex: 10 + idx
        });
      });
    }

    await saveScheduleItemsBatch(itemsToAdd, user?.id);
    onRefreshData?.();
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card,#ffffff)] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none">
      {/* 1. Header do Checklist */}
      <FocusChecklistHeader
        currentInstitution={currentInstitution}
        onInstitutionChange={setCurrentInstitution}
        availableInstitutions={availableInstitutions}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSpecialty={selectedSpecialty}
        onSpecialtyChange={setSelectedSpecialty}
        specialties={specialties}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        incidenceFilter={incidenceFilter}
        onIncidenceFilterChange={setIncidenceFilter}
        stats={stats}
        isDrawer={isDrawer}
        onCloseDrawer={onCloseDrawer}
      />

      {/* 2. Lista de Focos Rolável */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
        {filteredFoci.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 space-y-2">
            <p className="text-sm font-medium">Nenhum foco encontrado com os filtros atuais.</p>
            <p className="text-xs">Tente limpar a pesquisa ou selecionar &quot;Todas as Áreas&quot;.</p>
          </div>
        ) : (
          filteredFoci.map((node) => (
            <FocusChecklistItemRow
              key={node.focusKey}
              node={node}
              progress={focusProgressMap[node.focusKey]}
              metric={getMetricForFocus(node.foco, performanceMap)}
              scheduledItems={scheduledItemsByFocus[node.foco.toLowerCase()]}
              onToggleStudied={handleToggleStudied}
              onOpenQuickSchedule={(f) => setQuickScheduleFocus(f)}
              onNavigateToResumo={(esp, foco) => {
                router.push(`/resumos?especialidade=${encodeURIComponent(esp)}&foco=${encodeURIComponent(foco)}`);
              }}
              onNavigateToQuestoes={(esp, foco) => {
                const params = new URLSearchParams();
                params.set('especialidade', esp);
                params.set('foco', foco);
                params.set('mode', 'filtros');
                router.push(`/questoes?${params.toString()}`);
              }}
            />
          ))
        )}
      </div>

      {/* 3. Modal de Agendamento Rápido */}
      {quickScheduleFocus && (
        <QuickScheduleModal
          isOpen={Boolean(quickScheduleFocus)}
          focoNode={quickScheduleFocus}
          onClose={() => setQuickScheduleFocus(null)}
          onConfirmSchedule={handleConfirmQuickSchedule}
        />
      )}
    </div>
  );
};
