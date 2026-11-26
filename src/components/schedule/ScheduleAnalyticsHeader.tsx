'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  Target,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Award
} from 'lucide-react';
import { UserScheduleItem, FocusProgressMap } from '@/types/studySchedule';
import { SPECIALTY_COLORS } from '@/services/examIncidenceService';
import { UserAnswerItem } from '@/types';

interface ScheduleAnalyticsHeaderProps {
  items: UserScheduleItem[];
  focusProgressMap: FocusProgressMap;
  userAnswers: Record<string, UserAnswerItem>;
  totalCatalogFoci?: number;
  syncStatus?: 'synced' | 'offline' | 'error';
}

export const ScheduleAnalyticsHeader: React.FC<ScheduleAnalyticsHeaderProps> = ({
  items,
  focusProgressMap,
  userAnswers,
  totalCatalogFoci = 786,
  syncStatus = 'synced'
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // 1. Métrica: Focos Estudados
  const progressList = Object.values(focusProgressMap);
  const studiedFociCount = progressList.filter((p) => p.isStudied).length;
  const studiedPercentage = totalCatalogFoci > 0
    ? Math.min(100, Math.round((studiedFociCount / totalCatalogFoci) * 100))
    : 0;

  // Breakdown por Especialidade dos Focos Estudados
  const specialtyCounts: Record<string, number> = {};
  progressList.forEach((p) => {
    if (p.isStudied && p.especialidade) {
      specialtyCounts[p.especialidade] = (specialtyCounts[p.especialidade] || 0) + 1;
    }
  });

  // 2. Métrica: Revisões Espaçadas (R1, R2, R3)
  const r1Items = items.filter((it) => it.itemType === 'review_1');
  const r1Done = r1Items.filter((it) => it.isCompleted).length;

  const r2Items = items.filter((it) => it.itemType === 'review_2');
  const r2Done = r2Items.filter((it) => it.isCompleted).length;

  const r3Items = items.filter((it) => it.itemType === 'review_3');
  const r3Done = r3Items.filter((it) => it.isCompleted).length;

  const totalRevisionsScheduled = r1Items.length + r2Items.length + r3Items.length;
  const totalRevisionsDone = r1Done + r2Done + r3Done;
  const revisionAdherence = totalRevisionsScheduled > 0
    ? Math.round((totalRevisionsDone / totalRevisionsScheduled) * 100)
    : 0;

  // 3. Métrica: Rendimento Real de Questões nos Focos
  let questionsTotal = 0;
  let questionsCorrect = 0;

  // Conjunto de focos únicos do cronograma
  const scheduledFocusNames = new Set(items.map((it) => it.foco.trim().toLowerCase()));

  Object.values(userAnswers).forEach((ans) => {
    if (ans.foco && scheduledFocusNames.has(ans.foco.trim().toLowerCase())) {
      questionsTotal += 1;
      if (ans.isCorrect) {
        questionsCorrect += 1;
      }
    }
  });

  // Se o aluno ainda não tiver questões nos focos do cronograma, pega geral do site
  const hasScheduleQuestions = questionsTotal > 0;
  const totalSiteQuestions = Object.keys(userAnswers).length;
  const totalSiteCorrect = Object.values(userAnswers).filter((a) => a.isCorrect).length;

  const displayQuestionsTotal = hasScheduleQuestions ? questionsTotal : totalSiteQuestions;
  const displayQuestionsCorrect = hasScheduleQuestions ? questionsCorrect : totalSiteCorrect;

  const accuracyRate = displayQuestionsTotal > 0
    ? Math.round((displayQuestionsCorrect / displayQuestionsTotal) * 100)
    : 0;

  const getAccuracyColor = (rate: number, total: number) => {
    if (total === 0) return 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800';
    if (rate >= 80) return 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60';
    if (rate >= 60) return 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60';
    return 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60';
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-[var(--card-border,#e4e4e7)] dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden transition-all duration-200">
      {/* Barra de Título e Recolhimento */}
      <div className="px-4 py-3 sm:px-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shadow-2xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Painel de Acompanhamento do Cronograma
              <span
                className={`hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : syncStatus === 'error'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                {syncStatus === 'synced'
                  ? 'Sincronizado'
                  : syncStatus === 'error'
                    ? 'Erro de sincronização'
                    : 'Modo offline'}
              </span>
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-xs font-medium"
          aria-label={isExpanded ? 'Recolher métricas' : 'Expandir métricas'}
        >
          <span className="hidden sm:inline text-zinc-400 text-[11px]">
            {isExpanded ? 'Ocultar' : 'Expandir'}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Conteúdo Expansível com as 3 Barras */}
      {isExpanded && (
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 animate-in fade-in-50 duration-150">
          {/* Card 1: Focos Estudados */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-800/30 flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Conteúdos Foco Estudados
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Acervo Oficial de Teoria
                  </p>
                </div>
              </div>
              <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                {studiedPercentage}%
              </span>
            </div>

            {/* Barra de Progresso Focos */}
            <div className="space-y-1">
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${studiedPercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-medium">
                <span>{studiedFociCount} concluídos</span>
                <span>{totalCatalogFoci - studiedFociCount} restantes</span>
              </div>
            </div>

            {/* Micro Tags por Especialidade */}
            <div className="flex flex-wrap gap-1 pt-1">
              {Object.entries(SPECIALTY_COLORS).slice(0, 4).map(([spec]) => {
                const count = specialtyCounts[spec] || 0;
                return (
                  <span
                    key={spec}
                    className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 truncate max-w-[110px]"
                    title={`${spec}: ${count} focos`}
                  >
                    {spec.split(' ')[0]}: <strong className="text-zinc-800 dark:text-zinc-200">{count}</strong>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Card 2: Ciclos de Revisão Espaçada */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-800/30 flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Ciclos de Revisão
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Retenção R1, R2 & R3
                  </p>
                </div>
              </div>
              <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                {revisionAdherence}%
              </span>
            </div>

            {/* Barra de Progresso Revisões */}
            <div className="space-y-1">
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 dark:bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${revisionAdherence}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-medium">
                <span>{totalRevisionsDone} realizadas</span>
                <span>{totalRevisionsScheduled - totalRevisionsDone} pendentes</span>
              </div>
            </div>

            {/* Mini pílulas R1 / R2 / R3 */}
            <div className="grid grid-cols-3 gap-1 pt-1 text-center">
              <div className="bg-zinc-100 dark:bg-zinc-800/80 py-1 px-1.5 rounded-lg">
                <div className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                  {r1Done}/{r1Items.length}
                </div>
                <div className="text-[9px] text-zinc-400 font-medium">R1 (+7d)</div>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800/80 py-1 px-1.5 rounded-lg">
                <div className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                  {r2Done}/{r2Items.length}
                </div>
                <div className="text-[9px] text-zinc-400 font-medium">R2 (+30d)</div>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800/80 py-1 px-1.5 rounded-lg">
                <div className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                  {r3Done}/{r3Items.length}
                </div>
                <div className="text-[9px] text-zinc-400 font-medium">R3 (+60d)</div>
              </div>
            </div>
          </div>

          {/* Card 3: Rendimento de Questões nos Conteúdos */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-800/30 flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Rendimento de Questões
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {hasScheduleQuestions ? 'Focos do Cronograma' : 'Total Geral do Usuário'}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getAccuracyColor(
                  accuracyRate,
                  displayQuestionsTotal
                )}`}
              >
                {displayQuestionsTotal > 0 ? `${accuracyRate}%` : 'Sem dados'}
              </span>
            </div>

            {/* Barra de Progresso Questões */}
            <div className="space-y-1">
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    accuracyRate >= 80 ? 'bg-emerald-500' : accuracyRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${displayQuestionsTotal > 0 ? accuracyRate : 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-medium">
                <span>{displayQuestionsCorrect} acertos</span>
                <span>{displayQuestionsTotal} questões feitas</span>
              </div>
            </div>

            {/* Rodapé do Rendimento */}
            <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500">
              <span className="flex items-center gap-1 font-medium">
                <Award className="w-3 h-3 text-amber-500" />
                Taxa de acerto real
              </span>
              <span className="font-mono text-zinc-400">
                {displayQuestionsCorrect}/{displayQuestionsTotal} resolvidos
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
