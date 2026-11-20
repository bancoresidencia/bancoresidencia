'use client';

import React, { memo } from 'react';
import { ChevronDown, ChevronRight, Flame } from 'lucide-react';
import { TemaChecklistGroup, UserFocusProgress, UserScheduleItem } from '@/types/studySchedule';
import { EnrichedFocusWithIncidence } from '@/services/examIncidenceService';
import { ChecklistProgressDonut } from './ChecklistProgressDonut';
import { FocusChecklistItemRow } from './FocusChecklistItemRow';
import { FocusAccuracyMetric } from '@/utils/focusPerformanceCalculator';

interface TemaChecklistGroupRowProps {
  temaGroup: TemaChecklistGroup;
  specialtyColor: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  focusProgressMap: Record<string, UserFocusProgress>;
  performanceMap: Record<string, FocusAccuracyMetric>;
  scheduledItemsByFocus: Record<string, UserScheduleItem[]>;
  onToggleStudied: (node: EnrichedFocusWithIncidence, newStudied: boolean) => void;
  onOpenQuickSchedule: (node: EnrichedFocusWithIncidence) => void;
  onNavigateToResumo: (especialidade: string, foco: string) => void;
  onNavigateToQuestoes: (especialidade: string, foco: string) => void;
}

const TemaChecklistGroupRowComponent: React.FC<TemaChecklistGroupRowProps> = ({
  temaGroup,
  specialtyColor,
  isExpanded,
  onToggleExpand,
  focusProgressMap,
  performanceMap,
  scheduledItemsByFocus,
  onToggleStudied,
  onOpenQuickSchedule,
  onNavigateToResumo,
  onNavigateToQuestoes
}) => {
  const isCompleted = temaGroup.progressPercent === 100 && temaGroup.totalFoci > 0;

  return (
    <div className="w-full">
      {/* 1. Cabeçalho do Tema (Sub-accordion compacto) */}
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
        className={`group w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer select-none rounded-lg ${
          isExpanded
            ? 'bg-zinc-100/70 dark:bg-zinc-800/60'
            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {/* Chevron */}
          <span className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-transform">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>

          {/* Nome do Tema */}
          <span
            className={`text-xs font-semibold truncate ${
              isCompleted
                ? 'text-zinc-700 dark:text-zinc-300'
                : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {temaGroup.tema}
          </span>

          {/* Selo de Top Incidência no Tema */}
          {temaGroup.hasExtremeIncidence && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shrink-0"
              title="Contém foco com Altíssima Incidência (Top 15%)"
            >
              <Flame className="w-3 h-3 fill-red-500 text-red-500" />
              Top
            </span>
          )}
        </div>

        {/* Lado Direito: Contagem de Focos + Mini-Donut */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 tabular-nums">
            {temaGroup.studiedFoci}/{temaGroup.totalFoci}
          </span>

          {/* Mini-Donut de Andamento do Tema (~28px) */}
          <ChecklistProgressDonut
            size="sm"
            percent={temaGroup.progressPercent}
            completed={temaGroup.studiedFoci}
            total={temaGroup.totalFoci}
            colorHex={specialtyColor}
            showLabel={false}
          />
        </div>
      </div>

      {/* 2. Lista de Focos Pertencentes ao Tema */}
      {isExpanded && (
        <div className="mt-1 mb-2 ml-3.5 sm:ml-5 pl-2 sm:pl-3 border-l-2 border-zinc-200/80 dark:border-zinc-800/80 divide-y divide-zinc-100 dark:divide-zinc-800/40">
          {temaGroup.foci.map((node) => (
            <FocusChecklistItemRow
              key={node.focusKey}
              node={node}
              progress={focusProgressMap[node.focusKey]}
              metric={performanceMap[node.foco.toLowerCase()] || {
                focus: node.foco,
                total: 0,
                answered: 0,
                correct: 0,
                wrong: 0,
                accuracyRate: 0,
                status: 'sem_dados'
              }}
              scheduledItems={scheduledItemsByFocus[node.foco.toLowerCase()]}
              onToggleStudied={onToggleStudied}
              onOpenQuickSchedule={onOpenQuickSchedule}
              onNavigateToResumo={onNavigateToResumo}
              onNavigateToQuestoes={onNavigateToQuestoes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TemaChecklistGroupRow = memo(TemaChecklistGroupRowComponent);
