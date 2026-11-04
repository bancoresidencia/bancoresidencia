'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check, Plus, Clock, Brain, AlertOctagon, Trophy, CheckCircle2, ChevronRight } from 'lucide-react';
import { DailyScheduleSlot, AiScheduleAnalysis } from './scheduleTypes';

// Ícone Oficial do Google
const GoogleIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

interface AiScheduleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AiScheduleAnalysis | null;
  userScheduledTasks: DailyScheduleSlot[];
  onAddTasks: (tasks: DailyScheduleSlot[]) => void;
  onRemoveTask: (taskId: string) => void;
  onExportToGoogle?: (slot: DailyScheduleSlot) => void | Promise<void>;
  exportingSlotId?: string | null;
  exportedSlotIds?: Record<string, boolean>;
}

export const AiScheduleDrawer: React.FC<AiScheduleDrawerProps> = ({
  isOpen,
  onClose,
  analysis,
  userScheduledTasks,
  onAddTasks,
  onRemoveTask,
  onExportToGoogle,
  exportingSlotId,
  exportedSlotIds = {}
}) => {
  const suggestions = analysis?.suggestions || [];

  // Estado para armazenar quais sugestões estão selecionadas para adição
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Inicializa a seleção com todos os itens não adicionados por padrão
  useEffect(() => {
    if (isOpen && suggestions.length > 0) {
      const initialSelected = suggestions
        .map(s => s.id);
      setSelectedIds(initialSelected);
      setSuccessToast(null);
    }
  }, [isOpen, suggestions]);

  if (!isOpen) return null;

  const isAllSelected = suggestions.length > 0 && selectedIds.length === suggestions.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(suggestions.map(s => s.id));
    }
  };

  const handleToggleSingle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddSelectedToOfficialSchedule = () => {
    const tasksToAdd = suggestions.filter(s => selectedIds.includes(s.id));
    if (tasksToAdd.length === 0) return;

    onAddTasks(tasksToAdd);
    setSuccessToast(`${tasksToAdd.length} atividade(s) adicionada(s) ao cronograma oficial com sucesso!`);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleAddAllToOfficialSchedule = () => {
    if (suggestions.length === 0) return;
    onAddTasks(suggestions);
    setSuccessToast(`Todas as ${suggestions.length} atividades foram adicionadas ao cronograma oficial!`);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'estudo':
        return { label: 'Treino TRI', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case 'flashcard':
        return { label: 'Flashcards FSRS', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
      case 'simulado':
        return { label: 'Simulado Blitz', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'caderno_erros':
      case 'revisao':
        return { label: 'Caderno de Erros', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
      default:
        return { label: 'Estudo Focado', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    }
  };

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] bg-white dark:bg-[#0e121a] border border-blue-500/30 rounded-3xl shadow-2xl flex flex-col z-10 animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO DO DRAWER CENTRAL SECUNDÁRIO */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-blue-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Otimização de Horários Livres (Mentor IA)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 hidden sm:inline-block">
                  Pré-visualização IA
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Janelas ociosas cruzadas com foco de alto rendimento TRI & FSRS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            title="Fechar pré-visualização"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FEEDBACK DE SUCESSO (SE HOUVER) */}
        {successToast && (
          <div className="m-4 mb-0 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* CORPO DO DRAWER: RESUMO & LISTA DE SUGESTÕES */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* Card de Resumo da Análise e Gaps Livres */}
          {analysis && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                {analysis.summary}
              </p>
              {analysis.freeGaps && analysis.freeGaps.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-zinc-200/60 dark:border-zinc-800 text-xs">
                  <span className="font-bold text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">
                    Gaps Livres Identificados:
                  </span>
                  {analysis.freeGaps.map((g, gi) => (
                    <span
                      key={gi}
                      className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20"
                    >
                      {g.startTime} às {g.endTime} ({g.durationMinutes}m)
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BARRA DE SELEÇÃO E OPÇÕES DO CRONOGRAMA OFICIAL */}
          <div className="p-3 rounded-2xl bg-blue-50/40 dark:bg-[#121722] border border-blue-500/20 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                />
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {selectedIds.length === suggestions.length
                    ? 'Todas selecionadas'
                    : `${selectedIds.length} de ${suggestions.length} selecionadas`}
                </span>
              </label>
            </div>

            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Escolha quais atividades deseja integrar ao seu cronograma oficial
            </span>
          </div>

          {/* LISTA DE ATIVIDADES SUGERIDAS PELA IA */}
          <div className="space-y-3">
            {suggestions.map((sug) => {
              const isSelected = selectedIds.includes(sug.id);
              const isAlreadyAdded = userScheduledTasks.some(
                t => t.id === sug.id || (t.startTime === sug.startTime && t.title === sug.title)
              );
              const catBadge = getCategoryBadge(sug.category);

              return (
                <div
                  key={sug.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${isSelected
                      ? 'bg-blue-50/20 dark:bg-[#131926] border-blue-500/50 shadow-xs ring-1 ring-blue-500/20'
                      : 'bg-white dark:bg-[#141822] border-zinc-200 dark:border-zinc-800 opacity-80'
                    }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Checkbox de Inclusão no Cronograma Oficial */}
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSingle(sug.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                        title={isSelected ? 'Desmarcar do cronograma oficial' : 'Marcar para o cronograma oficial'}
                      />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                          {sug.startTime} - {sug.endTime}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catBadge.bg}`}>
                          {catBadge.label}
                        </span>
                        {isAlreadyAdded && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                            <Check className="w-2.5 h-2.5" />
                            Já no Cronograma
                          </span>
                        )}
                      </div>

                      <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {sug.title}
                      </h5>

                      {sug.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {sug.description}
                        </p>
                      )}

                      {sug.rationale && (
                        <p className="text-[11px] text-blue-600 dark:text-blue-300 italic pt-0.5">
                          💡 {sug.rationale}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* AÇÕES INDIVIDUAIS POR ATIVIDADE */}
                  <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                    {/* Botão de Adicionar/Remover Individual */}
                    {isAlreadyAdded ? (
                      <button
                        type="button"
                        onClick={() => onRemoveTask(sug.id)}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors cursor-pointer"
                        title="Remover esta tarefa do cronograma oficial"
                      >
                        Remover
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAddTasks([sug])}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar</span>
                      </button>
                    )}

                    {/* Botão de Enviar ao Google Agenda */}
                    {onExportToGoogle && (
                      <button
                        type="button"
                        onClick={() => onExportToGoogle(sug)}
                        disabled={exportingSlotId === sug.id || Boolean(exportedSlotIds[sug.id])}
                        className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-blue-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        title="Salvar direto no seu Google Agenda"
                      >
                        <GoogleIcon className="w-3.5 h-3.5" />
                        <span>{exportedSlotIds[sug.id] ? 'Salvo' : '+ Google'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RODAPÉ DO DRAWER CENTRAL COM AÇÕES OFICIAIS */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer transition-colors"
          >
            Fechar / Manter Cronograma Atual
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddSelectedToOfficialSchedule}
              disabled={selectedIds.length === 0}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Adicionar Selecionadas ao Cronograma Oficial ({selectedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={handleAddAllToOfficialSchedule}
              className="px-3.5 py-2.5 rounded-2xl border border-blue-500/30 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-bold cursor-pointer transition-colors"
            >
              Adicionar Todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
