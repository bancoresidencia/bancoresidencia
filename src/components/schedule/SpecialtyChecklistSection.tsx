'use client';

import React, { memo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SpecialtyChecklistGroup, UserFocusProgress, UserScheduleItem } from '@/types/studySchedule';
import { EnrichedFocusWithIncidence } from '@/services/examIncidenceService';
import { ChecklistProgressDonut } from './ChecklistProgressDonut';
import { TemaChecklistGroupRow } from './TemaChecklistGroupRow';
import { FocusAccuracyMetric } from '@/utils/focusPerformanceCalculator';

interface SpecialtyChecklistSectionProps {
  specialtyGroup: SpecialtyChecklistGroup;
  isExpanded: boolean;
  onToggleExpand: () => void;
  expandedTemaKeys: Set<string>;
  onToggleTema: (temaKey: string) => void;
  focusProgressMap: Record<string, UserFocusProgress>;
  performanceMap: Record<string, FocusAccuracyMetric>;
  scheduledItemsByFocus: Record<string, UserScheduleItem[]>;
  onToggleStudied: (node: EnrichedFocusWithIncidence, newStudied: boolean) => void;
  onOpenQuickSchedule: (node: EnrichedFocusWithIncidence) => void;
  onNavigateToResumo: (especialidade: string, foco: string) => void;
  onNavigateToQuestoes: (especialidade: string, foco: string) => void;
}

const SpecialtyChecklistSectionComponent: React.FC<SpecialtyChecklistSectionProps> = ({
  specialtyGroup,
  isExpanded,
  onToggleExpand,
  expandedTemaKeys,
  onToggleTema,
  focusProgressMap,
  performanceMap,
  scheduledItemsByFocus,
  onToggleStudied,
  onOpenQuickSchedule,
  onNavigateToResumo,
  onNavigateToQuestoes
}) => {
  const isComplete =
    specialtyGroup.progressPercent === 100 && specialtyGroup.totalFoci > 0;

  return (
    <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 overflow-hidden shadow-xs transition-shadow">
      {/* 1. Cabeçalho Mestre da Especialidade */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand();
          }
        }}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left cursor-pointer select-none bg-zinc-50/70 hover:bg-zinc-100/60 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/60 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          {/* Barra cromática canônica da Especialidade */}
          <span
            className="w-1.5 h-7 rounded-full shrink-0"
            style={{ backgroundColor: specialtyGroup.specialtyColor }}
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight truncate">
                {specialtyGroup.especialidade}
              </h3>

              {isComplete && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  Concluída
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {specialtyGroup.studiedFoci} de {specialtyGroup.totalFoci} focos estudados
              <span className="mx-1.5">•</span>
              {specialtyGroup.temas.length} {specialtyGroup.temas.length === 1 ? 'tema' : 'temas'}
            </p>
          </div>
        </div>

        {/* Lado Direito: Donut de Especialidade (~44px) + Chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <ChecklistProgressDonut
            size="md"
            percent={specialtyGroup.progressPercent}
            completed={specialtyGroup.studiedFoci}
            total={specialtyGroup.totalFoci}
            colorHex={specialtyGroup.specialtyColor}
            showLabel={true}
          />

          <span className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </span>
        </div>
      </div>

      {/* 2. Lista Sanfonada de Temas e Focos */}
      {isExpanded && (
        <div className="p-2 sm:p-3 space-y-1 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800/60">
          {specialtyGroup.temas.map((temaGroup) => {
            const temaKey = `${specialtyGroup.especialidade}::${temaGroup.tema}`;
            const isTemaExpanded = expandedTemaKeys.has(temaKey);

            return (
              <TemaChecklistGroupRow
                key={temaKey}
                temaGroup={temaGroup}
                specialtyColor={specialtyGroup.specialtyColor}
                isExpanded={isTemaExpanded}
                onToggleExpand={() => onToggleTema(temaKey)}
                focusProgressMap={focusProgressMap}
                performanceMap={performanceMap}
                scheduledItemsByFocus={scheduledItemsByFocus}
                onToggleStudied={onToggleStudied}
                onOpenQuickSchedule={onOpenQuickSchedule}
                onNavigateToResumo={onNavigateToResumo}
                onNavigateToQuestoes={onNavigateToQuestoes}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const SpecialtyChecklistSection = memo(SpecialtyChecklistSectionComponent);
