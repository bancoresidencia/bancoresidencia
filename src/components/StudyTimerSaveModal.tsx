'use client';

import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  X,
  BookOpen,
  FileQuestion,
  Brain,
  RotateCcw,
  Trophy,
  Sparkles,
  CalendarDays
} from 'lucide-react';
import { useStudyTimer } from '@/context/StudyTimerContext';
import { StudyType } from '@/types/studyTimer';

const STUDY_TYPES: Array<{ id: StudyType; label: string; icon: React.ReactNode }> = [
  { id: 'questoes', label: 'Questões', icon: <FileQuestion className="w-3.5 h-3.5" /> },
  { id: 'teoria', label: 'Teoria / Leitura', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'flashcards', label: 'Flashcards', icon: <Brain className="w-3.5 h-3.5" /> },
  { id: 'revisao', label: 'Revisão', icon: <RotateCcw className="w-3.5 h-3.5" /> },
  { id: 'simulado', label: 'Simulado', icon: <Trophy className="w-3.5 h-3.5" /> },
  { id: 'outro', label: 'Outro', icon: <Sparkles className="w-3.5 h-3.5" /> }
];

export const StudyTimerSaveModal: React.FC = () => {
  const {
    status,
    formattedTime,
    selectedTaxonomy,
    saveSession,
    closeSaveModal
  } = useStudyTimer();

  const [studyType, setStudyType] = useState<StudyType>('questoes');
  const [questionsCount, setQuestionsCount] = useState<string>('');
  const [correctCount, setCorrectCount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  if (status !== 'modal_saving') return null;

  const topicTitle =
    selectedTaxonomy.subfoco ||
    selectedTaxonomy.foco ||
    selectedTaxonomy.tema ||
    selectedTaxonomy.especialidade ||
    'Estudo Geral';

  const breadcrumb =
    selectedTaxonomy.rawLabel ||
    [
      selectedTaxonomy.especialidade,
      selectedTaxonomy.tema,
      selectedTaxonomy.foco,
      selectedTaxonomy.subfoco
    ]
      .filter(Boolean)
      .join(' › ') ||
    'Matéria livre';

  const qCount = parseInt(questionsCount, 10) || 0;
  const cCount = parseInt(correctCount, 10) || 0;
  const accuracyPercent = qCount > 0 ? Math.round((cCount / qCount) * 100) : null;

  const handleConfirmSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveSession({
        studyType,
        questionsCount: qCount,
        correctCount: cCount,
        notes: notes.trim()
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={closeSaveModal}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                Finalizar Sessão de Estudo
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Grave seu tempo líquido e integre diretamente na Agenda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeSaveModal}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Destaque: Tempo Líquido & Tópico */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
              Tempo Líquido Computado
            </span>
            <div className="text-2xl sm:text-3xl font-black font-[var(--font-inter)] tabular-nums tracking-tight text-emerald-700 dark:text-emerald-300">
              {formattedTime}
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate block mt-0.5">
              {topicTitle}
            </span>
          </div>

          <div className="shrink-0 text-right">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Sessão Fechada</span>
            </span>
          </div>
        </div>

        {/* Breadcrumb da Taxonomia */}
        <div className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 truncate">
          <span className="font-semibold text-zinc-500 shrink-0">Conteúdo:</span>
          <span className="truncate font-mono">{breadcrumb}</span>
        </div>

        <form onSubmit={handleConfirmSave} className="space-y-4">
          {/* Seletor de Tipo de Estudo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
              Tipo de Estudo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STUDY_TYPES.map((t) => {
                const isSelected = studyType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setStudyType(t.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Registro de Exercícios / Questões (Opcional - Idêntico ao Aprovado) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Questões Realizadas (Opcional)
              </label>
              {accuracyPercent !== null && (
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  {accuracyPercent}% de aproveitamento
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  min="0"
                  placeholder="Total de questões"
                  value={questionsCount}
                  onChange={(e) => setQuestionsCount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:border-blue-500 font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  placeholder="Total de acertos"
                  value={correctCount}
                  onChange={(e) => setCorrectCount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:border-blue-500 font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                />
              </div>
            </div>
          </div>

          {/* Anotações da Sessão */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
              Anotações da Sessão
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Revisar critérios de Duke, doses de IECA vs BRA..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:border-blue-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-none"
            />
          </div>

          {/* Ações Finais */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeSaveModal}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              Voltar ao Cronômetro
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <CalendarDays className="w-4 h-4" />
              <span>{isSaving ? 'Gravando...' : 'Salvar na Agenda'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
