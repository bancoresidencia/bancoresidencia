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
import { calculateFociPerformanceMap } from '@/utils/focusPerformanceCalculator';
import { UserFocusProgress, UserScheduleItem, ScheduleItemType } from '@/types/studySchedule';
import { upsertFocusProgress, saveScheduleItemsBatch } from '@/services/studyScheduleService';
import { addDays } from '@/utils/scheduleDistributionEngine';
import {
  buildChecklistHierarchy,
  filterChecklistHierarchy
} from '@/utils/checklistHierarchyBuilder';
import { FocusChecklistHeader } from './FocusChecklistHeader';
import { SpecialtyChecklistSection } from './SpecialtyChecklistSection';
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

  // Estado de expansão sanfonada das Especialidades e Temas
  const [expandedSpecialties, setExpandedSpecialties] = useState<Set<string>>(
    () => new Set(['Clínica Médica'])
  );
  const [expandedTemas, setExpandedTemas] = useState<Set<string>>(
    () => new Set(['Clínica Médica::Cardiologia', 'Clínica Médica::Hipertensão Arterial Sistêmica'])
  );

  // 1. Catálogo de Instituições disponíveis
  const availableInstitutions = useMemo(() => getAvailableTargetInstitutions(), []);

  // 2. Performance real das questões respondidas pelo aluno
  const performanceMap = useMemo(() => calculateFociPerformanceMap(userAnswers), [userAnswers]);

  // 3. Focos enriquecidos com a incidência estatística da instituição selecionada
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

  // 6. Construção da Árvore Hierárquica Canônica (Especialidade -> Tema -> Foco)
  const fullHierarchy = useMemo(
    () => buildChecklistHierarchy(enrichedFoci, focusProgressMap),
    [enrichedFoci, focusProgressMap]
  );

  // 7. Filtragem da Árvore com detecção de ramos auto-expandidos
  const { tree: filteredHierarchy, autoExpandedKeys } = useMemo(() => {
    return filterChecklistHierarchy(
      fullHierarchy,
      {
        searchQuery,
        selectedSpecialty,
        statusFilter,
        incidenceFilter
      },
      focusProgressMap
    );
  }, [fullHierarchy, searchQuery, selectedSpecialty, statusFilter, incidenceFilter, focusProgressMap]);

  // 8. Especialidades e Temas efetivamente expandidos (incorpora auto-expansão em filtros/busca)
  const isFilterActive = Boolean(
    searchQuery.trim() || incidenceFilter !== 'all' || statusFilter !== 'all'
  );

  const effectiveExpandedSpecialties = useMemo(() => {
    if (isFilterActive && autoExpandedKeys.specialties.size > 0) {
      const merged = new Set(expandedSpecialties);
      autoExpandedKeys.specialties.forEach((k) => merged.add(k));
      return merged;
    }
    return expandedSpecialties;
  }, [expandedSpecialties, autoExpandedKeys.specialties, isFilterActive]);

  const effectiveExpandedTemas = useMemo(() => {
    if (isFilterActive && autoExpandedKeys.temas.size > 0) {
      const merged = new Set(expandedTemas);
      autoExpandedKeys.temas.forEach((k) => merged.add(k));
      return merged;
    }
    return expandedTemas;
  }, [expandedTemas, autoExpandedKeys.temas, isFilterActive]);

  // 9. Estatísticas globais do checklist
  const stats = useMemo(() => {
    const total = enrichedFoci.length;
    let studied = 0;
    for (const f of enrichedFoci) {
      if (focusProgressMap[f.focusKey]?.isStudied) studied++;
    }
    const percent = total > 0 ? Math.round((studied / total) * 100) : 0;
    return { total, studied, percent };
  }, [enrichedFoci, focusProgressMap]);

  // Controles de Expansão
  const handleToggleSpecialty = (esp: string) => {
    setExpandedSpecialties((prev) => {
      const next = new Set(prev);
      if (next.has(esp)) next.delete(esp);
      else next.add(esp);
      return next;
    });
  };

  const handleToggleTema = (temaKey: string) => {
    setExpandedTemas((prev) => {
      const next = new Set(prev);
      if (next.has(temaKey)) next.delete(temaKey);
      else next.add(temaKey);
      return next;
    });
  };

  const handleExpandAll = () => {
    const allEsp = new Set<string>();
    const allTemas = new Set<string>();
    for (const esp of filteredHierarchy) {
      allEsp.add(esp.especialidade);
      for (const t of esp.temas) {
        allTemas.add(`${esp.especialidade}::${t.tema}`);
      }
    }
    setExpandedSpecialties(allEsp);
    setExpandedTemas(allTemas);
  };

  const handleCollapseAll = () => {
    setExpandedSpecialties(new Set());
    setExpandedTemas(new Set());
  };

  const areAllExpanded = useMemo(() => {
    if (filteredHierarchy.length === 0) return false;
    for (const esp of filteredHierarchy) {
      if (!expandedSpecialties.has(esp.especialidade)) return false;
    }
    return true;
  }, [filteredHierarchy, expandedSpecialties]);

  // Ações do Foco
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
        notes: params.notes
      }
    ];

    if (params.autoScheduleRevisions && params.intervals.length > 0) {
      params.intervals.forEach((days, idx) => {
        const revDate = addDays(params.date, days);
        const revType: ScheduleItemType = idx === 0 ? 'review_1' : idx === 1 ? 'review_2' : 'review_3';
        itemsToAdd.push({
          id: `item_rev_${Date.now()}_${days}_${Math.random().toString(36).slice(2, 6)}`,
          scheduleId,
          userId: user?.id || 'guest',
          especialidade: quickScheduleFocus.especialidade,
          tema: quickScheduleFocus.tema,
          foco: quickScheduleFocus.foco,
          scheduledDate: revDate,
          itemType: revType,
          isCompleted: false,
          orderIndex: idx + 1
        });
      });
    }

    await saveScheduleItemsBatch(itemsToAdd, user?.id);
    setQuickScheduleFocus(null);
    onRefreshData?.();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900 overflow-hidden">
      {/* 1. Cabeçalho Compacto do Checklist com Controles de Expansão */}
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
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        areAllExpanded={areAllExpanded}
      />

      {/* 2. Lista Sanfonada Hierárquica (Especialidade -> Tema -> Foco) */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/40">
        {filteredHierarchy.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 space-y-1.5">
            <p className="text-xs font-semibold">Nenhum conteúdo encontrado com os filtros atuais.</p>
            <p className="text-[11px]">Tente limpar a pesquisa ou selecionar &quot;Todas as Áreas&quot;.</p>
          </div>
        ) : (
          filteredHierarchy.map((specialtyGroup) => {
            const isEspExpanded = effectiveExpandedSpecialties.has(
              specialtyGroup.especialidade
            );

            return (
              <SpecialtyChecklistSection
                key={specialtyGroup.especialidade}
                specialtyGroup={specialtyGroup}
                isExpanded={isEspExpanded}
                onToggleExpand={() => handleToggleSpecialty(specialtyGroup.especialidade)}
                expandedTemaKeys={effectiveExpandedTemas}
                onToggleTema={handleToggleTema}
                focusProgressMap={focusProgressMap}
                performanceMap={performanceMap}
                scheduledItemsByFocus={scheduledItemsByFocus}
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
            );
          })
        )}
      </div>

      {/* 3. Modal de Agendamento Rápido no Calendário */}
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
