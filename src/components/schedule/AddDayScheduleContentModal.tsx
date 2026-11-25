'use client';

import React, { useState, useMemo } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { ScheduleItemType } from '@/types/studySchedule';
import {
  getEnrichedFociForInstitution,
  EnrichedFocusWithIncidence
} from '@/services/examIncidenceService';
import { DayContentFocoList } from './DayContentFocoList';
import { useOverlayDismiss } from '@/hooks/useOverlayDismiss';
import { BackArrowButton } from '@/components/ui/BackArrowButton';

export interface AddDayScheduleContentModalProps {
  isOpen: boolean;
  dateStr: string | null;
  targetInstitution?: string;
  onClose: () => void;
  onConfirmAdd: (params: {
    focoNode: EnrichedFocusWithIncidence;
    date: string;
    itemType: ScheduleItemType;
    notes?: string;
    autoScheduleRevisions: boolean;
    intervals: number[];
  }) => Promise<void>;
}

export const AddDayScheduleContentModal: React.FC<AddDayScheduleContentModalProps> = ({
  isOpen,
  dateStr,
  targetInstitution = 'ENARE',
  onClose,
  onConfirmAdd
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedFoco, setSelectedFoco] = useState<EnrichedFocusWithIncidence | null>(null);
  const [itemType, setItemType] = useState<ScheduleItemType>('theory');
  const [autoScheduleRevisions, setAutoScheduleRevisions] = useState<boolean>(true);
  const [selectedIntervals, setSelectedIntervals] = useState<number[]>([7, 30]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useOverlayDismiss({
    isOpen: isOpen && !!dateStr,
    onClose
  });

  // 1. Catálogo completo de focos enriquecidos
  const enrichedFoci = useMemo(
    () => getEnrichedFociForInstitution(targetInstitution),
    [targetInstitution]
  );

  // 2. Especialidades únicas
  const specialties = useMemo(() => {
    const set = new Set<string>();
    enrichedFoci.forEach((f) => set.add(f.especialidade));
    return Array.from(set);
  }, [enrichedFoci]);

  // 3. Filtragem de focos por busca e especialidade
  const filteredFoci = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedFoci.filter((f) => {
      if (selectedSpecialty !== 'all' && f.especialidade !== selectedSpecialty) return false;
      if (q) {
        const inFoco = f.foco.toLowerCase().includes(q);
        const inTema = f.tema.toLowerCase().includes(q);
        const inEsp = f.especialidade.toLowerCase().includes(q);
        if (!inFoco && !inTema && !inEsp) return false;
      }
      return true;
    });
  }, [enrichedFoci, selectedSpecialty, searchQuery]);

  if (!isOpen || !dateStr) return null;

  // Formatação amigável da data (ex: "Quarta-feira, 18 de Novembro de 2026")
  const formattedDate = (() => {
    try {
      const parts = dateStr.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dateObj = new Date(y, m, d);
      return dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFoco || !dateStr || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onConfirmAdd({
        focoNode: selectedFoco,
        date: dateStr,
        itemType,
        notes: notes.trim() || undefined,
        autoScheduleRevisions,
        intervals: selectedIntervals
      });
      onClose();
    } catch (err) {
      console.error('[AddDayScheduleContentModal] Erro ao adicionar:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0e0e11] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Cabeçalho do Modal */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/60 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 id="add-modal-title" className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Adicionar Estudo ao Calendário
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize mt-0.5 truncate">
                📅 {formattedDate}
              </p>
            </div>
          </div>

          <BackArrowButton
            onClick={onClose}
            variant="ghost"
            title="Fechar"
            ariaLabel="Fechar modal"
          />
        </div>

        {/* 2. Formulário / Conteúdo Rolável */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <DayContentFocoList
            filteredFoci={filteredFoci}
            selectedFoco={selectedFoco}
            onSelectFoco={setSelectedFoco}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            specialties={specialties}
            selectedSpecialty={selectedSpecialty}
            onSelectSpecialty={setSelectedSpecialty}
          />

          {/* Configurações de Estudo */}
          {selectedFoco && (
            <div className="space-y-3.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 animate-in fade-in duration-150">
              {/* Tipo de Estudo */}
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  2. Tipo de Atividade:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'theory', label: '📖 1º Estudo / Teoria' },
                    { id: 'review_1', label: '🔄 Revisão R1' },
                    { id: 'questions', label: '❓ Questões' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setItemType(t.id as ScheduleItemType)}
                      className={`py-2 px-2.5 rounded-xl border font-semibold text-center transition-all ${
                        itemType === t.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-2xs'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Revisões Espaçadas */}
              <div className="space-y-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoScheduleRevisions}
                    onChange={(e) => setAutoScheduleRevisions(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-300 dark:border-zinc-700"
                  />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Agendar revisões espaçadas a partir deste dia (+7d, +30d)
                  </span>
                </label>

                {autoScheduleRevisions && (
                  <div className="flex items-center gap-1.5 pl-6 pt-1">
                    {[
                      { label: '+7 dias (R1)', val: 7 },
                      { label: '+14 dias', val: 14 },
                      { label: '+30 dias (R2)', val: 30 }
                    ].map((p) => {
                      const active = selectedIntervals.includes(p.val);
                      return (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() => {
                            setSelectedIntervals((prev) =>
                              prev.includes(p.val)
                                ? prev.filter((x) => x !== p.val)
                                : [...prev, p.val].sort((a, b) => a - b)
                            );
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                            active
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Observações / Notas */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  Notas / Observações (opcional):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Focar em conduta do ATLS ou critérios diagnósticos..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </div>
          )}

          {/* 3. Rodapé com Ações */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!selectedFoco || isSubmitting}
              className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 text-white shadow-xs transition-all ${
                !selectedFoco || isSubmitting
                  ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-98 cursor-pointer'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {isSubmitting ? 'Agendando...' : 'Adicionar ao Calendário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
