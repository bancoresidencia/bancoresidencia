'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Building2,
  Sliders,
  X
} from 'lucide-react';
import {
  ScheduleDistributionStrategy
} from '@/types/studySchedule';
import { getAvailableTargetInstitutions } from '@/services/examIncidenceService';

interface AutoScheduleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: {
    targetInstitution: string;
    targetExamDate: string;
    startDate: string;
    strategy: ScheduleDistributionStrategy;
    weeklyStudyDays: number[];
    dailyFocusTarget: number;
    includeRevisions: boolean;
    maxFociLimit: number;
  }) => Promise<void>;
}

export const AutoScheduleGeneratorModal: React.FC<AutoScheduleGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate
}) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getDefaultExamDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  };

  const institutions = React.useMemo(() => getAvailableTargetInstitutions(), []);

  const [targetInstitution, setTargetInstitution] = useState<string>('ENARE');
  const [targetExamDate, setTargetExamDate] = useState<string>(getDefaultExamDate());
  const [startDate, setStartDate] = useState<string>(getTodayStr());
  const [strategy, setStrategy] = useState<ScheduleDistributionStrategy>('spiral_cycle');
  const [weeklyStudyDays, setWeeklyStudyDays] = useState<number[]>([1, 2, 3, 4, 5]); // Seg a Sex
  const [dailyFocusTarget, setDailyFocusTarget] = useState<number>(2);
  const [includeRevisions, setIncludeRevisions] = useState<boolean>(true);
  const [maxFociLimit, setMaxFociLimit] = useState<number>(180);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    setWeeklyStudyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (weeklyStudyDays.length === 0) return;
    setIsSubmitting(true);
    try {
      await onGenerate({
        targetInstitution,
        targetExamDate,
        startDate,
        strategy,
        weeklyStudyDays,
        dailyFocusTarget,
        includeRevisions,
        maxFociLimit
      });
      onClose();
    } catch (err) {
      console.error('Falha ao gerar cronograma:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[var(--bg-card,#ffffff)] dark:bg-[#0e0e11] border border-[var(--card-border,#e4e4e7)] dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="generator-title"
      >
        {/* Topo */}
        <div className="px-6 py-4.5 border-b border-[var(--card-border,#e4e4e7)] dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="generator-title" className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Gerador Inteligente de Cronograma
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Distribuição automática dos Focos priorizando a incidência da sua prova.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* 1. Seleção da Instituição da Prova */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-zinc-400" />
              Instituição / Prova-Alvo
            </label>
            <select
              value={targetInstitution}
              onChange={(e) => setTargetInstitution(e.target.value)}
              className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
            >
              {institutions.slice(0, 40).map((inst) => (
                <option key={inst.key} value={inst.sigla}>
                  {inst.sigla} — {inst.nome} {inst.popular ? '★' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Datas: Início e Prova */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Data de Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Data Estimada da Prova
              </label>
              <input
                type="date"
                value={targetExamDate}
                onChange={(e) => setTargetExamDate(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* 3. Seleção da Estratégia de Distribuição (3 Algoritmos) */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-zinc-400" />
              Algoritmo de Distribuição dos Conteúdos
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Opção 1: Ciclos em Escadinha */}
              <div
                onClick={() => setStrategy('spiral_cycle')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  strategy === 'spiral_cycle'
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/20'
                    : 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="text-blue-500 font-mono">01.</span>
                    Ciclos em Escadinha (Recomendado)
                  </span>
                  {strategy === 'spiral_cycle' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                      Selecionado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Agrupa temas em blocos de 2 a 3 temas afins (ex: Cardio + Pneumo + Gastro), alternando os focos do bloco. Ao finalizar, sobe o degrau para o próximo ciclo de temas, sem ficar nem disperso nem monótono.
                </p>
              </div>

              {/* Opção 2: Proporcional Clássico */}
              <div
                onClick={() => setStrategy('proportional_classic')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  strategy === 'proportional_classic'
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/20'
                    : 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="text-blue-500 font-mono">02.</span>
                    Proporcional Clássico por Especialidade
                  </span>
                  {strategy === 'proportional_classic' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                      Selecionado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Intercala dia a dia entre as grandes especialidades (Clínica, Cirurgia, Pediatria, Ginecologia e Obstetrícia, Preventiva), mantendo contato contínuo com todas as frentes.
                </p>
              </div>

              {/* Opção 3: Sequencial por Tema */}
              <div
                onClick={() => setStrategy('sequential_theme')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  strategy === 'sequential_theme'
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/20'
                    : 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="text-blue-500 font-mono">03.</span>
                    Sequencial por Tema (Imersão Total)
                  </span>
                  {strategy === 'sequential_theme' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                      Selecionado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Esgota todos os focos de um tema completo antes de começar o próximo (ex: finaliza toda a Cardiologia, depois toda a Pneumologia). Ideal para quem prefere foco linear estrito.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Rotina Semanal (Dias de Estudo) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Dias da Semana de Estudo
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {[
                { day: 1, label: 'Seg' },
                { day: 2, label: 'Ter' },
                { day: 3, label: 'Qua' },
                { day: 4, label: 'Qui' },
                { day: 5, label: 'Sex' },
                { day: 6, label: 'Sáb' },
                { day: 0, label: 'Dom' }
              ].map((d) => {
                const isActive = weeklyStudyDays.includes(d.day);
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => toggleDay(d.day)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      isActive
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Carga Diária & Revisões */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Meta Diária (Focos/dia)
              </label>
              <select
                value={dailyFocusTarget}
                onChange={(e) => setDailyFocusTarget(Number(e.target.value))}
                className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
              >
                <option value={1}>1 Foco por dia (Ritmo leve)</option>
                <option value={2}>2 Focos por dia (Padrão ouro)</option>
                <option value={3}>3 Focos por dia (Intensivo)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Revisões Espaçadas Automáticas
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer h-[38px]">
                <input
                  type="checkbox"
                  checked={includeRevisions}
                  onChange={(e) => setIncludeRevisions(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                />
                <span>Agendar R1 (+7d) & R2 (+30d)</span>
              </label>
            </div>
          </div>

          {/* Rodapé com Botão */}
          <div className="pt-3 border-t border-[var(--card-border,#e4e4e7)] dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || weeklyStudyDays.length === 0}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              {isSubmitting ? 'Gerando Cronograma...' : 'Montar Cronograma no Calendário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
