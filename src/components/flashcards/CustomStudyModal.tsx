'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  X,
  Play,
  ShieldCheck,
  CalendarClock,
  RotateCcw,
  Star,
  AlertOctagon,
  Layers
} from 'lucide-react';
import {
  CustomStudyFilterType,
  CustomStudyLaunchOptions,
  CustomStudySortOrder,
  FlashcardItem
} from '@/types/flashcards';
import { filterCardsForCustomStudy } from '@/utils/ankiSessionQueue';
import { useTheme } from '@/context/ThemeContext';

interface CustomStudyModalProps {
  isOpen: boolean;
  title: string;
  cards: FlashcardItem[];
  errorCardIds?: Set<string>;
  defaultFilterType?: CustomStudyFilterType;
  onClose: () => void;
  onLaunch: (filteredCards: FlashcardItem[], title: string, options: CustomStudyLaunchOptions) => void;
}

const FILTER_PRESETS: Array<{
  id: CustomStudyFilterType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'all',
    label: 'Todos os cartões selecionados (Modo Cram)',
    description: 'Estuda todos os cartões do tópico de uma vez — ideal para véspera de prova.',
    icon: Layers
  },
  {
    id: 'due',
    label: 'Apenas cartões vencidos hoje',
    description: 'Inclui novos e revisões pendentes na data de hoje.',
    icon: CalendarClock
  },
  {
    id: 'forgotten_today',
    label: 'Esquecidos hoje ("De novo")',
    description: 'Revisa apenas cartões em que você errou ou clicou em "De novo" hoje.',
    icon: RotateCcw
  },
  {
    id: 'ahead',
    label: 'Adiantar revisões futuras',
    description: 'Antecipa revisões agendadas para os próximos dias.',
    icon: Sparkles
  },
  {
    id: 'new_only',
    label: 'Apenas cartões novos',
    description: 'Mostra somente cartões que você ainda não estudou nenhuma vez.',
    icon: Sparkles
  },
  {
    id: 'essential_only',
    label: 'Apenas Essenciais de Prova',
    description: 'Filtra somente cartões marcados como alta incidência.',
    icon: Star
  },
  {
    id: 'errors_only',
    label: 'Vinculados aos meus Erros',
    description: 'Foca apenas nos cartões ligados às questões que você errou.',
    icon: AlertOctagon
  }
];

export const CustomStudyModal: React.FC<CustomStudyModalProps> = ({
  isOpen,
  title,
  cards,
  errorCardIds,
  defaultFilterType = 'all',
  onClose,
  onLaunch
}) => {
  const { accentConfig } = useTheme();

  const [filterType, setFilterType] = useState<CustomStudyFilterType>(defaultFilterType);
  const [aheadDays, setAheadDays] = useState<number>(3);
  const [sortOrder, setSortOrder] = useState<CustomStudySortOrder>('random');
  const [limitInput, setLimitInput] = useState<string>('');
  const [reschedule, setReschedule] = useState<boolean>(false);

  const options: CustomStudyLaunchOptions = useMemo(
    () => ({
      filterType,
      aheadDays,
      sortOrder,
      limitCards: limitInput.trim() ? Math.max(1, Number(limitInput) || 0) : undefined,
      reschedule
    }),
    [filterType, aheadDays, sortOrder, limitInput, reschedule]
  );

  const matchingCards = useMemo(() => {
    return filterCardsForCustomStudy(cards, options, new Date(), errorCardIds);
  }, [cards, options, errorCardIds]);

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchingCards.length === 0) return;
    onLaunch(matchingCards, title, options);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
                Estudo Personalizado (Modelo Anki)
              </h3>
              <p className="text-[11px] text-zinc-500 truncate">
                {title} • {cards.length} cartões disponíveis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
          {/* Seleção do Tipo de Estudo Personalizado */}
          <div className="space-y-2">
            <label className="font-bold uppercase tracking-wider text-[11px] text-zinc-500 block">
              1. O que deseja estudar agora?
            </label>

            <div className="grid grid-cols-1 gap-1.5">
              {FILTER_PRESETS.map((opt) => {
                if (opt.id === 'errors_only' && (!errorCardIds || errorCardIds.size === 0)) {
                  return null;
                }
                const Icon = opt.icon;
                const isSelected = filterType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFilterType(opt.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-zinc-50 dark:bg-zinc-900/90 border-blue-500/60 ring-1 ring-blue-500/20'
                        : 'bg-white dark:bg-[#151519] border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isSelected ? 'text-blue-500' : 'text-zinc-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                        {opt.label}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {opt.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {filterType === 'ahead' && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <span className="font-bold text-blue-700 dark:text-blue-300">
                  Adiantar revisões dos próximos:
                </span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={aheadDays}
                  onChange={(e) => setAheadDays(Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-blue-300 dark:border-blue-700 font-mono text-center font-bold"
                />
                <span className="text-blue-700 dark:text-blue-300 font-semibold">dias</span>
              </div>
            )}
          </div>

          {/* Ordem e Limite */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Ordem dos cartões
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as CustomStudySortOrder)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="random">Aleatória (Embaralhada)</option>
                <option value="most_overdue">Mais atrasados primeiro</option>
                <option value="most_lapsed">Com mais lapsos (difíceis)</option>
                <option value="default">Ordem padrão do baralho</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Limite de cartões (opcional)
              </label>
              <input
                type="number"
                min={1}
                placeholder="Todos"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Toggle Crítico Estilo Anki: Reagendar vs Preservar Agendamento */}
          <label
            className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${
              !reschedule
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
            }`}
          >
            <input
              type="checkbox"
              checked={reschedule}
              onChange={(e) => setReschedule(e.target.checked)}
              className="mt-0.5 rounded cursor-pointer"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Reagendar cartões com base nas minhas respostas</span>
              </div>
              <p className="text-[11px] opacity-85 leading-relaxed">
                {!reschedule
                  ? 'Desmarcado (Recomendado): modo Cram / prática livre. Suas respostas controlam apenas esta sessão e NÃO alteram datas futuras nem intervalos do algoritmo FSRS.'
                  : 'Marcado: suas respostas nesta sessão atualizarão normalmente os intervalos e datas futuras no algoritmo FSRS.'}
              </p>
            </div>
          </label>
        </form>

        {/* Rodapé */}
        <div className="px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/70 dark:bg-zinc-900/50">
          <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-300">
            {matchingCards.length} {matchingCards.length === 1 ? 'cartão selecionado' : 'cartões selecionados'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={matchingCards.length === 0}
              onClick={handleConfirm}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 disabled:opacity-40 inline-flex items-center gap-1.5"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Iniciar Estudo ({matchingCards.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
