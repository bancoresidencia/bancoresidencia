'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  CalendarPlus,
  X,
  BookOpen
} from 'lucide-react';
import { ScheduleItemType } from '@/types/studySchedule';

interface QuickScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  focoNode: {
    especialidade: string;
    tema: string;
    foco: string;
    specialtyColor: string;
  } | null;
  onConfirmSchedule: (params: {
    date: string;
    itemType: ScheduleItemType;
    notes?: string;
    autoScheduleRevisions: boolean;
    intervals: number[];
  }) => Promise<void>;
}

export const QuickScheduleModal: React.FC<QuickScheduleModalProps> = ({
  isOpen,
  onClose,
  focoNode,
  onConfirmSchedule
}) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [itemType, setItemType] = useState<ScheduleItemType>('theory');
  const [autoScheduleRevisions, setAutoScheduleRevisions] = useState<boolean>(true);
  const [selectedIntervals, setSelectedIntervals] = useState<number[]>([7, 30]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !focoNode) return null;

  const toggleInterval = (days: number) => {
    setSelectedIntervals((prev) =>
      prev.includes(days) ? prev.filter((d) => d !== days) : [...prev, days].sort((a, b) => a - b)
    );
  };

  const handleApplyCombo = (intervals: number[]) => {
    setSelectedIntervals(intervals);
    setAutoScheduleRevisions(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    setIsSubmitting(true);
    try {
      await onConfirmSchedule({
        date: selectedDate,
        itemType,
        notes: notes.trim() || undefined,
        autoScheduleRevisions,
        intervals: selectedIntervals
      });
      onClose();
    } catch (err) {
      console.error('[QuickScheduleModal] Falha ao agendar:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-[var(--bg-card,#ffffff)] dark:bg-[#0e0e11] border border-[var(--card-border,#e4e4e7)] dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Cabeçalho */}
        <div className="px-6 py-4.5 border-b border-[var(--card-border,#e4e4e7)] dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: focoNode.specialtyColor }}
            />
            <div className="min-w-0">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 truncate block">
                {focoNode.especialidade} • {focoNode.tema}
              </span>
              <h2 id="modal-title" className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {focoNode.foco}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Seleção de Data */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-zinc-400" />
                Data do Estudo
              </span>
              <span className="text-[11px] text-zinc-400 font-normal">
                {selectedDate === getTodayStr() ? 'Hoje' : selectedDate === getTomorrowStr() ? 'Amanhã' : ''}
              </span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayStr())}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  selectedDate === getTodayStr()
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(getTomorrowStr())}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  selectedDate === getTomorrowStr()
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                Amanhã
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="py-1.5 px-3 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
                required
              />
            </div>
          </div>

          {/* 2. Tipo de Sessão */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              Modalidade da Sessão
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'theory', label: '1º Estudo / Teoria' },
                { id: 'review_1', label: 'Revisão R1' },
                { id: 'questions', label: 'Treino de Questões' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setItemType(m.id as ScheduleItemType)}
                  className={`py-2 px-2.5 text-xs font-medium rounded-xl border text-center transition-all ${
                    itemType === m.id
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent font-semibold shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Revisões Espaçadas Automáticas */}
          {itemType === 'theory' && (
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  <input
                    type="checkbox"
                    checked={autoScheduleRevisions}
                    onChange={(e) => setAutoScheduleRevisions(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-zinc-300 dark:border-zinc-700 focus:ring-0 cursor-pointer"
                  />
                  <span>Programar ciclos de revisão automática</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleApplyCombo([7, 30])}
                  className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  R1 (+7d) & R2 (+30d)
                </button>
              </div>

              {autoScheduleRevisions && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-100">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { days: 1, label: '+1 dia' },
                      { days: 7, label: '+7 dias (R1)' },
                      { days: 14, label: '+14 dias' },
                      { days: 30, label: '+30 dias (R2)' },
                      { days: 60, label: '+60 dias (R3)' }
                    ].map((p) => {
                      const isSelected = selectedIntervals.includes(p.days);
                      return (
                        <button
                          key={p.days}
                          type="button"
                          onClick={() => toggleInterval(p.days)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    Se a data calculada cair em dia de descanso, ela será movida automaticamente para o próximo dia útil.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 4. Anotações */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Anotações do Estudante (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Focar em conduta do ATLS e critérios cirúrgicos..."
              className="w-full py-2 px-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          {/* Rodapé com Botões */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--card-border,#e4e4e7)] dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedDate}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              {isSubmitting ? 'Agendando...' : 'Confirmar no Calendário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
