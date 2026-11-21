'use client';

import React, { memo } from 'react';
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

const FocusChecklistItemRowComponent: React.FC<FocusChecklistItemRowProps> = ({
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
      className={`group px-3 py-2 sm:px-3.5 flex items-center justify-between gap-2.5 transition-colors ${isStudied
          ? 'bg-zinc-50/50 dark:bg-zinc-900/30'
          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
        }`}
    >
      {/* 1. Esquerda: Checkbox + Ponto Cromático + Foco & Tema */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Checkbox de Conclusão */}
        <button
          type="button"
          onClick={() => onToggleStudied(node, !isStudied)}
          className="shrink-0 text-zinc-300 dark:text-zinc-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          title={isStudied ? 'Marcar como não estudado' : 'Marcar como estudado'}
          aria-label={isStudied ? 'Marcar como não estudado' : 'Marcar como estudado'}
        >
          {isStudied ? (
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-400 fill-emerald-500/15" />
          ) : (
            <Circle className="w-4.5 h-4.5" />
          )}
        </button>

        {/* Ponto indicador de Especialidade */}
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: node.specialtyColor }}
          title={node.especialidade}
        />

        {/* Nome do Foco com suporte a quebra em até 2 linhas e leitura 100% nítida */}
        <div className="min-w-0 flex-1 pr-1.5">
          <span
            className={`text-xs font-semibold line-clamp-2 leading-snug break-words transition-colors ${isStudied
                ? 'text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-700'
                : 'text-zinc-800 dark:text-zinc-100'
              }`}
            title={`${node.especialidade} › ${node.tema}: ${node.foco}`}
          >
            {node.foco}
          </span>
        </div>
      </div>

      {/* 2. Direita: Badges Compactos + Ações Rápidas */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Microbadge de Incidência (Fogos) */}
        <span
          className="text-[10px] font-mono px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0"
          title={`Incidência ${node.incidence.label}: ${node.incidence.fireCount} fogos`}
        >
          {'🔥'.repeat(node.incidence.fireCount)}
        </span>

        {/* Microbadge de Rendimento Real de Questões */}
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${metric.badgeColorClass}`}
          title={`Rendimento real: ${metric.correct}/${metric.answered} (${metric.accuracyRate}%)`}
        >
          {metric.answered === 0 ? '--' : `${metric.accuracyRate}%`}
        </span>

        {/* Indicador de Revisões / Calendário */}
        {reviewCount > 0 && (
          <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
            R{reviewCount}
          </span>
        )}
        {hasScheduledEvents && (
          <span
            className="text-[10px] text-purple-600 dark:text-purple-400"
            title="Agendado no Calendário"
          >
            📅
          </span>
        )}

        {/* Divisória sutil */}
        <span className="w-px h-3 bg-zinc-200 dark:bg-zinc-800 mx-0.5 shrink-0" />

        {/* Ações Rápidas: Ícone de Agendar no Calendário (Destaque) + Resumo + Questões */}
        <div className="flex items-center gap-0.5">
          {/* 1. Agendar no Calendário (Sempre acessível conforme solicitado) */}
          <Tooltip content="Agendar no Calendário" position="top">
            <button
              type="button"
              onClick={() => onOpenQuickSchedule(node)}
              className="p-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              aria-label="Agendar no Calendário"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {/* 2. Ler Resumo */}
          <Tooltip content="Ler Resumo Oficial" position="top">
            <button
              type="button"
              onClick={() => onNavigateToResumo(node.especialidade, node.foco)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Ler Resumo"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {/* 3. Resolver Questões */}
          <Tooltip content="Resolver Questões deste Foco" position="top">
            <button
              type="button"
              onClick={() => onNavigateToQuestoes(node.especialidade, node.foco)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Resolver Questões"
            >
              <FileQuestion className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export const FocusChecklistItemRow = memo(FocusChecklistItemRowComponent, (prev, next) => {
  return (
    prev.node.focusKey === next.node.focusKey &&
    prev.progress?.isStudied === next.progress?.isStudied &&
    prev.progress?.reviewCount === next.progress?.reviewCount &&
    prev.metric.answered === next.metric.answered &&
    prev.metric.accuracyRate === next.metric.accuracyRate &&
    (prev.scheduledItems?.length || 0) === (next.scheduledItems?.length || 0)
  );
});
