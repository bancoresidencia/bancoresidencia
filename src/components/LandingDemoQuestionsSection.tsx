'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BookOpenCheck
} from 'lucide-react';
import questionsData from '@/data/landingDemoQuestions.json';

type TabKey = 'internato' | 'residencia' | 'revalida' | 'rplus';

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

interface LandingDemoQuestionsSectionProps {
  onLoginDemo: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

const TABS: { id: TabKey; label: string }[] = [
  { id: 'internato', label: 'Internato' },
  { id: 'residencia', label: 'Residência' },
  { id: 'revalida', label: 'Revalida' },
  { id: 'rplus', label: 'R+' }
];

export const LandingDemoQuestionsSection: React.FC<LandingDemoQuestionsSectionProps> = ({
  onLoginDemo,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('revalida');
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  
  // Respostas selecionadas por chave única (tab-index)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  // Votos de like/dislike por chave
  const [userVotes, setUserVotes] = useState<Record<string, 'like' | 'dislike'>>({});

  const tabQuestions = (questionsData[activeTab] || []) as DemoQuestion[];
  const currentQuestion: DemoQuestion | undefined = tabQuestions[questionIndex] || tabQuestions[0];

  const currentKey = `${activeTab}-${questionIndex}`;
  const selectedAnswer = userAnswers[currentKey];
  const currentVote = userVotes[currentKey];

  const handleSelectTab = (tab: TabKey) => {
    setActiveTab(tab);
    setQuestionIndex(0);
  };

  const handleSelectOption = (letter: string) => {
    if (selectedAnswer) return; // Não troca resposta se já respondeu
    setUserAnswers((prev) => ({
      ...prev,
      [currentKey]: letter
    }));
  };

  const handleVote = (vote: 'like' | 'dislike') => {
    setUserVotes((prev) => ({
      ...prev,
      [currentKey]: prev[currentKey] === vote ? undefined! : vote
    }));
  };

  const handleNext = () => {
    if (questionIndex < tabQuestions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (questionIndex > 0) {
      setQuestionIndex((prev) => prev - 1);
    }
  };

  if (!currentQuestion) return null;

  const isAnswered = Boolean(selectedAnswer);
  const isCorrect = selectedAnswer === currentQuestion.correct_answer;

  const dynamicLikes = currentQuestion.likes + (currentVote === 'like' ? 1 : 0);
  const dynamicDislikes = currentQuestion.dislikes + (currentVote === 'dislike' ? 1 : 0);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      {/* =========================================================================
          CABEÇALHO DA SEÇÃO COM TÍTULO E ABAS DE CATEGORIA
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
        <div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl tracking-tight text-slate-900 dark:text-white uppercase leading-tight">
            Na prática, faz sentido.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-normal mt-1.5 max-w-xl">
            Questões reais da plataforma. Responda e descubra o porquê.
          </p>
        </div>

        {/* Abas Superiores (Internato, Residência, Revalida, R+) */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-200/80 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-800 shadow-inner overflow-x-auto no-scrollbar shrink-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          CARD INTERATIVO DA QUESTÃO (ESTILO EXATO DA PLATAFORMA)
          ========================================================================= */}
      <div className="rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-black/70 overflow-hidden transition-all duration-200">
        {/* Barra Superior do Card */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800/70 bg-zinc-50/60 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            <span className="text-blue-600 dark:text-blue-400 font-black">
              {TABS.find((t) => t.id === activeTab)?.label}
            </span>
            <span>•</span>
            <span>
              Questão {questionIndex + 1} de {tabQuestions.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Avaliação Útil / Não Útil */}
            <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => handleVote('like')}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer hover:text-emerald-500 ${
                  currentVote === 'like' ? 'text-emerald-500 font-black' : ''
                }`}
                title="Questão de alta relevância"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{dynamicLikes}</span>
              </button>
              <button
                type="button"
                onClick={() => handleVote('dislike')}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer hover:text-rose-500 ${
                  currentVote === 'dislike' ? 'text-rose-500 font-black' : ''
                }`}
                title="Pouco relevante"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>{dynamicDislikes}</span>
              </button>
            </div>

            {/* Pílulas de Navegação por Número (1, 2, 3, 4, 5) */}
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
                    onClick={() => setQuestionIndex(idx)}
                    className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : hasAnswered
                        ? answerIsCorrect
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Corpo da Questão */}
        <div className="p-5 sm:p-8 space-y-6">
          {/* Tags de Identificação Médica */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
              {currentQuestion.banca}
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {currentQuestion.year}
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              {currentQuestion.especialidade}
            </span>
            {currentQuestion.tema && (
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-500 dark:text-slate-400">
                • {currentQuestion.tema}
              </span>
            )}
          </div>

          {/* Enunciado Clínico */}
          <div className="text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-relaxed font-normal">
            {currentQuestion.statement}
          </div>

          {/* Alternativas de Resposta */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.letter;
              const isOptionCorrect = option.letter === currentQuestion.correct_answer;

              let optionStyle =
                'bg-zinc-50/70 dark:bg-[var(--bg-input)] border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-[var(--primary-color)]/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/40';
              let badgeStyle =
                'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300';

              if (isAnswered) {
                if (isOptionCorrect) {
                  optionStyle =
                    'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500/80';
                  badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                } else if (isSelected) {
                  optionStyle =
                    'bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500/80';
                  badgeStyle = 'bg-rose-600 text-white border-rose-600';
                } else {
                  optionStyle =
                    'opacity-60 bg-zinc-50/40 dark:bg-[var(--bg-page)] border-zinc-200 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-400';
                }
              }

              return (
                <button
                  key={option.letter}
                  type="button"
                  onClick={() => handleSelectOption(option.letter)}
                  disabled={isAnswered}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all duration-200 cursor-pointer ${optionStyle} ${
                    !isAnswered ? 'hover:scale-[1.008]' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center font-heading font-black text-xs shrink-0 transition-colors shadow-xs ${badgeStyle}`}
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
                    {option.text}
                  </div>
                </button>
              );
            })}
          </div>

          {/* =========================================================================
              PAINEL DE RESOLUÇÃO COMENTADA PADRÃO-OURO (REVELADO AO RESPONDER)
              ========================================================================= */}
          {isAnswered && (
            <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-[var(--bg-input)] border border-zinc-200 dark:border-zinc-800 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-1 rounded-md border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resposta Correta!</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/70 px-2.5 py-1 rounded-md border border-rose-300 dark:border-rose-800">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Resposta Incorreta</span>
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Gabarito Oficial: <strong className="text-emerald-600 dark:text-emerald-400">{currentQuestion.correct_answer}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <BookOpenCheck className="w-3.5 h-3.5" />
                  <span>Resolução Comentada</span>
                </div>
              </div>

              {/* Texto explicativo clínico */}
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-white/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                {currentQuestion.commentary}
              </div>

              {/* Botão para próxima questão */}
              <div className="flex items-center justify-end pt-2">
                {questionIndex < tabQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-600/30"
                  >
                    <span>Próxima Questão</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onLoginDemo}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 transition-all cursor-pointer shadow-md shadow-emerald-600/30"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Acessar Todas as Questões (+130.000)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navegação Inferior (Anterior / Próxima) */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <button
              type="button"
              onClick={handlePrev}
              disabled={questionIndex === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <span className="text-xs font-bold text-slate-400 font-mono">
              {questionIndex + 1} / {tabQuestions.length}
            </span>

            <button
              type="button"
              onClick={handleNext}
              disabled={questionIndex === tabQuestions.length - 1}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Faixa Inferior de Conversão */}
      <div className="mt-8 text-center">
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Gostou da resolução comentada alternativa por alternativa?{' '}
          <button
            type="button"
            onClick={() => onOpenAuth('register')}
            className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Crie sua conta e acesse o banco completo agora →
          </button>
        </p>
      </div>
    </section>
  );
};
