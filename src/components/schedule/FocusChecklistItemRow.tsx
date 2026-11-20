'use client';

import React from 'react';
import {
  BookOpen,
  FileQuestion,
  CalendarPlus,
  CheckCircle2,
  Circle
} from 'lucide-react';
import {
  EnrichedFocusWithIncidence
} from '@/services/examIncidenceService';
import { FocusAccuracyMetric } from '@/utils/focusPerformanceCalculator';
import { UserFocusProgress, UserScheduleItem } from '@/types/studySchedule';
import { Tooltip } from '@/components/ui';

interface FocusChecklistItemRowProps {
  node: EnrichedFocusWithIncidence;
  progress?: UserFocusProgress;
  metric: FocusAccuracyMetric;
  scheduledItems?: UserScheduleItem[];
  onToggleStudied: (foco: EnrichedFocusWithIncidence, isStudied: boolean) => void;
  onOpenQuickSchedule: (foco: EnrichedFocusWithIncidence) => void;
  onNavigateToResumo: (especialidade: string, foco: string) => void;
  onNavigateToQuestoes: (especialidade: string, foco: string) => void;
}

export const FocusChecklistItemRow: React.FC<FocusChecklistItemRowProps> = ({
  node,
  progress,
  metric,
  scheduledItems = [],
  onToggleStudied,
  onOpenQuickSchedule,
  onNavigateToResumo,
  onNavigateToQuestoes
}) => {
  const isStudied = Boolean(progress?.isStudied);
  const reviewCount = progress?.reviewCount || 0;
  const hasScheduledEvents = scheduledItems.length > 0;

  return (
    <div
      className={`group relative p-3 sm:p-3.5 rounded-xl border transition-all duration-150 ${
        isStudied
          ? 'bg-zinc-50/80 dark:bg-zinc-900/40 border-zinc-200/90 dark:border-zinc-800/60'
          : 'bg-white dark:bg-[#0c0c0e] border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        {/* Checkbox de Conclusão */}
        <button
          type="button"
          onClick={() => onToggleStudied(node, !isStudied)}
          className="mt-0.5 shrink-0 text-zinc-300 dark:text-zinc-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          title={isStudied ? 'Marcar como não estudado' : 'Marcar como estudado'}
          aria-label={isStudied ? 'Marcar como não estudado' : 'Marcar como estudado'}
        >
          {isStudied ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 fill-emerald-500/10" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Conteúdo Principal do Foco */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Breadcrumb e Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Tag da Especialidade */}
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: `${node.specialtyColor}18`,
                color: node.specialtyColor
              }}
            >
              {node.especialidade}
            </span>

            {/* Tema Ancestral */}
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate max-w-[140px] sm:max-w-[200px]">
              • {node.tema}
            </span>

            {/* Incidência na Instituição (Fogos) */}
            <span
              className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${node.incidence.badgeClass}`}
              title={`Incidência ${node.incidence.label}: ${node.incidence.fireCount} fogos`}
            >
              <span>{'🔥'.repeat(node.incidence.fireCount)}</span>
              <span>{node.incidence.label}</span>
            </span>
          </div>

          {/* Nome do Foco */}
          <h3
            className={`text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
              isStudied
                ? 'text-zinc-500 dark:text-zinc-400 line-through decoration-zinc-400/50'
                : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {node.foco}
          </h3>

          {/* Meta Linha de Indicadores e Ações */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Indicador de Rendimento Real de Questões */}
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${metric.badgeColorClass}`}
                title={`Rendimento real no site: ${metric.correct} acertos de ${metric.answered} questões feitas`}
              >
                <span>🎯</span>
                {metric.answered === 0 ? (
                  <span>Sem questões</span>
                ) : (
                  <span>
                    {metric.accuracyRate}% ({metric.correct}/{metric.answered})
                  </span>
                )}
              </span>

              {/* Indicador de Revisões */}
              {reviewCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  R{reviewCount}
                </span>
              )}

              {hasScheduledEvents && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  📅 No Calendário
                </span>
              )}
            </div>

            {/* Botões Rápidos */}
            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip content="Ler Resumo Clínico Oficial" position="top">
                <button
                  type="button"
                  onClick={() => onNavigateToResumo(node.especialidade, node.foco)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Ler resumo"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
              </Tooltip>

              <Tooltip content="Resolver Questões deste Foco" position="top">
                <button
                  type="button"
                  onClick={() => onNavigateToQuestoes(node.especialidade, node.foco)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Resolver questões"
                >
                  <FileQuestion className="w-3.5 h-3.5" />
                </button>
              </Tooltip>

              <Tooltip content="Agendar no Calendário / Revisão" position="top">
                <button
                  type="button"
                  onClick={() => onOpenQuickSchedule(node)}
                  className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  aria-label="Agendar"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
