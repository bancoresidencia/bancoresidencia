'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BookOpenCheck
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { renderFormattedMedicalText } from '@/utils/textSanitizer';
import questionsData from '@/data/landingDemoQuestions.json';
import { DemoTabKey } from '@/components/landing/landingData';
import { useScrollReveal } from '@/components/landing/useScrollReveal';

interface QuestionOption {
  letter: string;
  text: string;
}

interface DemoQuestion {
  id: string;
  banca: string;
  year: number;
  especialidade: string;
  tema: string;
  likes: number;
  dislikes: number;
  statement: string;
  options: QuestionOption[];
  correct_answer: string;
  commentary: string;
}

export interface ExternalDemoSelection {
  tab: DemoTabKey;
  questionIndex: number;
  bancaLabel?: string;
  nonce: number;
}

interface LandingDemoQuestionsSectionProps {
  onLoginDemo?: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  externalSelection?: ExternalDemoSelection | null;
}

const TABS: { id: DemoTabKey; label: string }[] = [
  { id: 'residencia', label: 'Residência' },
  { id: 'revalida', label: 'Revalida' },
  { id: 'internato', label: 'Internato' },
  { id: 'rplus', label: 'R+' }
];

export const LandingDemoQuestionsSection: React.FC<LandingDemoQuestionsSectionProps> = ({
  onOpenAuth,
  externalSelection
}) => {
  const { accentConfig } = useTheme();
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>(0.08);

  const [activeTab, setActiveTab] = useState<DemoTabKey>('residencia');
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [highlightedBanca, setHighlightedBanca] = useState<string | null>(null);
  const [lastAppliedNonce, setLastAppliedNonce] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  if (externalSelection && externalSelection.nonce !== lastAppliedNonce) {
    const list = (questionsData[externalSelection.tab] || []) as DemoQuestion[];
    const safeIdx =
      externalSelection.questionIndex >= 0 && externalSelection.questionIndex < list.length
        ? externalSelection.questionIndex
        : 0;
    setLastAppliedNonce(externalSelection.nonce);
    setActiveTab(externalSelection.tab);
    setQuestionIndex(safeIdx);
    setHighlightedBanca(externalSelection.bancaLabel || null);
  }

  const tabQuestions = (questionsData[activeTab] || []) as DemoQuestion[];
  const currentQuestion: DemoQuestion | undefined = tabQuestions[questionIndex] || tabQuestions[0];

  const currentKey = `${activeTab}-${questionIndex}`;
  const selectedAnswer = userAnswers[currentKey];
  const hasAnsweredAny = Object.keys(userAnswers).length > 0;

  const handleSelectTab = (tab: DemoTabKey) => {
    setActiveTab(tab);
    setQuestionIndex(0);
    setHighlightedBanca(null);
  };

  const handleSelectOption = (letter: string) => {
    if (selectedAnswer) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentKey]: letter
    }));
  };

  const handleNext = () => {
    if (questionIndex < tabQuestions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      setHighlightedBanca(null);
    }
  };

  const handlePrev = () => {
    if (questionIndex > 0) {
      setQuestionIndex((prev) => prev - 1);
      setHighlightedBanca(null);
    }
  };

  if (!currentQuestion) return null;

  const isAnswered = Boolean(selectedAnswer);
  const isCorrect = selectedAnswer === currentQuestion.correct_answer;

  return (
    <section className="py-18 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      <div ref={ref} className={`reveal-up ${isVisible ? 'is-visible' : ''}`}>
        {/* Cabeçalho da Seção com Abas Neutras Zinc */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3">
              <BookOpenCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Experimente Agora sem Cadastro</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-[42px] font-black tracking-[-0.035em] text-zinc-950 dark:text-white leading-tight">
              Resolução comentada na prática.
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base font-normal mt-2 max-w-xl">
              Selecione uma alternativa abaixo para inspecionar o padrão de fundamentação clínica alternativa por alternativa.
            </p>
          </div>

          {/* Seletor de Modalidade (Residência por padrão) */}
          <div
            role="tablist"
            aria-label="Modalidades de prova"
            className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-200/70 dark:bg-zinc-900 border border-zinc-300/70 dark:border-zinc-800 overflow-x-auto no-scrollbar shrink-0"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'shadow-xs'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-800/60'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: accentConfig.primaryHex,
                          color: accentConfig.primaryContrastHex
                        }
                      : undefined
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Interativo da Questão */}
        <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-black/60 overflow-hidden">
          {/* Barra Superior do Card */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-7 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 tabular-nums">
              <span
                className="px-2.5 py-0.5 rounded-md font-extrabold"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  color: accentConfig.primaryContrastHex
                }}
              >
                {TABS.find((t) => t.id === activeTab)?.label}
              </span>
              <span className="text-zinc-400">•</span>
              <span>
                Questão {questionIndex + 1} de {tabQuestions.length}
              </span>
              {highlightedBanca && (
                <span className="normal-case font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  Filtro ativo: {highlightedBanca}
                </span>
              )}
            </div>

            {/* Navegação Rápida por Número (1..5) */}
            <div className="flex items-center gap-1.5">
              {tabQuestions.map((_, idx) => {
                const isCurrent = idx === questionIndex;
                const answeredKey = `${activeTab}-${idx}`;
                const hasAnswered = Boolean(userAnswers[answeredKey]);
                const answerIsCorrect =
                  userAnswers[answeredKey] === tabQuestions[idx].correct_answer;

                return (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Ir para questão ${idx + 1}`}
                    onClick={() => {
                      setQuestionIndex(idx);
                      setHighlightedBanca(null);
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer tabular-nums ${
                      isCurrent
                        ? 'shadow-xs'
                        : hasAnswered
                          ? answerIsCorrect
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                    style={
                      isCurrent
                        ? {
                            backgroundColor: accentConfig.primaryHex,
                            color: accentConfig.primaryContrastHex
                          }
                        : undefined
                    }
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Corpo da Questão */}
          <div key={currentKey} className="p-5 sm:p-8 space-y-6 animate-in fade-in duration-200">
            {/* Metadados da Banca com Alto Contraste WCAG AA */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950">
                {currentQuestion.banca}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 tabular-nums">
                {currentQuestion.year}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {currentQuestion.especialidade}
              </span>
              {currentQuestion.tema && (
                <span className="hidden sm:inline-block px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  • {currentQuestion.tema}
                </span>
              )}
            </div>

            {/* Enunciado Clínico */}
            <div className="text-zinc-900 dark:text-zinc-100 text-sm sm:text-[15px] leading-relaxed font-normal">
              {renderFormattedMedicalText(currentQuestion.statement)}
            </div>

            {/* Alternativas */}
            <div className="space-y-2.5 pt-1">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.letter;
                const isOptionCorrect = option.letter === currentQuestion.correct_answer;

                let optionStyle =
                  'bg-zinc-50/80 dark:bg-[#18181b] border-zinc-200/90 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60';
                let badgeStyle =
                  'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200';

                if (isAnswered) {
                  if (isOptionCorrect) {
                    optionStyle =
                      'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500/70';
                    badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                  } else if (isSelected) {
                    optionStyle =
                      'bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500/70';
                    badgeStyle = 'bg-rose-600 text-white border-rose-600';
                  } else {
                    optionStyle =
                      'opacity-60 bg-zinc-50/40 dark:bg-[#121215] border-zinc-200 dark:border-zinc-800/60 text-zinc-600 dark:text-zinc-400';
                  }
                }

                return (
                  <button
                    key={option.letter}
                    type="button"
                    onClick={() => handleSelectOption(option.letter)}
                    disabled={isAnswered}
                    className={`w-full p-3.5 sm:p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all duration-150 cursor-pointer ${optionStyle}`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center font-extrabold text-xs shrink-0 transition-colors ${badgeStyle}`}
                    >
                      {isAnswered && isOptionCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : isAnswered && isSelected ? (
                        <XCircle className="w-4 h-4 text-white" />
                      ) : (
                        option.letter
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                      {renderFormattedMedicalText(option.text)}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Painel de Resolução Comentada (Revelado ao Responder) */}
            {isAnswered && (
              <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resposta Correta</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase text-rose-800 dark:text-rose-300 bg-rose-500/15 px-2.5 py-1 rounded-lg border border-rose-500/30">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Resposta Incorreta</span>
                      </span>
                    )}
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Gabarito Oficial:{' '}
                      <strong className="text-emerald-700 dark:text-emerald-400">
                        {currentQuestion.correct_answer}
                      </strong>
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <BookOpenCheck className="w-4 h-4" />
                    <span>Fundamentação Padrão-Ouro</span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  {renderFormattedMedicalText(currentQuestion.commentary)}
                </div>

                <div className="flex items-center justify-end pt-1">
                  {questionIndex < tabQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:opacity-95"
                      style={{
                        backgroundColor: accentConfig.primaryHex,
                        color: accentConfig.primaryContrastHex
                      }}
                    >
                      <span>Próxima Questão</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenAuth('register')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Desbloquear +200 Mil Questões</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Barra Inferior Anterior / Próxima */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200/70 dark:border-zinc-800/70">
              <button
                type="button"
                onClick={handlePrev}
                disabled={questionIndex === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 font-mono tabular-nums">
                {questionIndex + 1} / {tabQuestions.length}
              </span>

              <button
                type="button"
                onClick={handleNext}
                disabled={questionIndex === tabQuestions.length - 1}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>Próxima</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Chamada Contextual com Contraste WCAG AA Garantido */}
        <div className="mt-7 text-center">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {hasAnsweredAny
              ? 'Gostou da profundidade clínica dos comentários?'
              : 'Quer filtrar questões por banca, ano, especialidade e subfoco?'}{' '}
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="font-bold text-zinc-950 dark:text-white underline underline-offset-4 hover:opacity-80 cursor-pointer ml-1"
            >
              Crie sua conta gratuita e acesse +200 mil questões →
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};
