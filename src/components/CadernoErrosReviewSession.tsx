'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  FileText,
  Send,
  Check,
  Building,
  Layers,
  Clock,
  Trophy,
  Brain,
  Scissors,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { UserAnswerItem, ErrorReasonType, Question } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { ERROR_REASON_CONFIG } from '@/utils/errorReasons';

interface CadernoErrosReviewSessionProps {
  questionIds: string[];
  questionsMap: Record<string, Question>;
  userAnswers: Record<string, UserAnswerItem>;
  onAnswerQuestion: (
    questionId: string,
    selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E',
    isCorrect: boolean
  ) => void;
  onUpdateAnswerMeta: (
    questionId: string,
    meta: {
      errorReason?: ErrorReasonType;
      studentNotes?: string;
      statusRetrial?: 'pendente' | 'recuperado';
    }
  ) => void;
  onClose: () => void;
  onNavigateToBanco?: (specialty?: string, tema?: string, subfoco?: string) => void;
}

interface SessionAnswerRecord {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  isCorrect: boolean;
  timestamp: number;
}

export const CadernoErrosReviewSession: React.FC<CadernoErrosReviewSessionProps> = ({
  questionIds,
  questionsMap,
  userAnswers,
  onAnswerQuestion,
  onUpdateAnswerMeta,
  onClose
}) => {
  const { accentConfig } = useTheme();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, SessionAnswerRecord>>({});
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | 'E' | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, Record<string, boolean>>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  const [savedNotesAlert, setSavedNotesAlert] = useState<Record<string, boolean>>({});
  const [isSessionFinished, setIsSessionFinished] = useState<boolean>(false);
  const [questionTimer, setQuestionTimer] = useState<number>(0);

  const currentQId = questionIds[currentIndex];
  const currentQuestion = questionsMap[currentQId];
  const originalAnswer = userAnswers[currentQId];
  const currentSessionAnswer = sessionAnswers[currentQId];

  // Identifica a alternativa que o aluno havia marcado anteriormente no erro
  const previousMistakeLetter =
    originalAnswer?.previousLetter ||
    (!originalAnswer?.isCorrect ? originalAnswer?.letter : undefined) ||
    originalAnswer?.attempts?.find((a) => !a.isCorrect)?.letter;

  // Temporizador da questão
  useEffect(() => {
    if (isSessionFinished || !!currentSessionAnswer) return;
    const interval = setInterval(() => {
      setQuestionTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentSessionAnswer, isSessionFinished, currentQId]);

  // Reseta seleção temporária ao mudar de questão (a menos que já tenha respondido nesta sessão)
  useEffect(() => {
    if (currentSessionAnswer) {
      setSelectedOption(currentSessionAnswer.letter);
    } else {
      setSelectedOption(null);
      setQuestionTimer(0);
    }
  }, [currentIndex, currentSessionAnswer]);

  // Helper para renderizar negrito
  const renderFormattedText = (text: string | null | undefined) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Alterna eliminação/risco da alternativa
  const toggleEliminate = (e: React.MouseEvent, letter: string) => {
    e.stopPropagation();
    setEliminatedOptions((prev) => {
      const qElims = prev[currentQId] || {};
      return {
        ...prev,
        [currentQId]: {
          ...qElims,
          [letter]: !qElims[letter]
        }
      };
    });
  };

  // Submissão da resposta da questão atual
  const handleConfirmAnswer = () => {
    if (!selectedOption || !currentQuestion || currentSessionAnswer) return;

    const isAnulada = Boolean(
      currentQuestion.isAnulada || currentQuestion.correctAnswer === 'ANULADA'
    );
    const isCorrect = isAnulada || selectedOption === currentQuestion.correctAnswer;

    // Registra na sessão atual
    setSessionAnswers((prev) => ({
      ...prev,
      [currentQId]: {
        letter: selectedOption,
        isCorrect,
        timestamp: Date.now()
      }
    }));

    // Dispara atualização global no sistema
    onAnswerQuestion(currentQId, selectedOption, isCorrect);

    // Se acertou, promove o status
    if (isCorrect) {
      onUpdateAnswerMeta(currentQId, { statusRetrial: 'recuperado' });
    }
  };

  // Manipulador de salvar anotação pessoal
  const handleSaveNotes = (qId: string) => {
    const text = localNotes[qId];
    if (text === undefined) return;
    onUpdateAnswerMeta(qId, { studentNotes: text.trim() });
    setSavedNotesAlert((prev) => ({ ...prev, [qId]: true }));
    setTimeout(() => {
      setSavedNotesAlert((prev) => ({ ...prev, [qId]: false }));
    }, 2000);
  };

  // Métricas da sessão
  const sessionStats = useMemo(() => {
    const answeredCount = Object.keys(sessionAnswers).length;
    const correctCount = Object.values(sessionAnswers).filter((a) => a.isCorrect).length;
    const wrongCount = answeredCount - correctCount;
    const superacaoPercent = answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0;
    return {
      total: questionIds.length,
      answeredCount,
      correctCount,
      wrongCount,
      superacaoPercent
    };
  }, [sessionAnswers, questionIds.length]);

  // Teclas de atalho (A, B, C, D, E e Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSessionFinished) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E'].includes(key) && !currentSessionAnswer) {
        const letter = key as 'A' | 'B' | 'C' | 'D' | 'E';
        if (currentQuestion?.options?.some((opt) => opt.letter === letter)) {
          setSelectedOption(letter);
        }
      } else if (e.key === 'Enter') {
        if (!currentSessionAnswer && selectedOption) {
          handleConfirmAnswer();
        } else if (currentSessionAnswer) {
          if (currentIndex < questionIds.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            setIsSessionFinished(true);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSessionAnswer, selectedOption, currentIndex, questionIds.length, isSessionFinished, currentQuestion]);

  const currentElims = eliminatedOptions[currentQId] || {};

  // ==========================================
  // TELA DE DESFECHO: RESUMO DA SESSÃO DE ERROS
  // ==========================================
  if (isSessionFinished) {
    const persistentErrorIds = questionIds.filter((id) => {
      const ans = sessionAnswers[id];
      return ans && !ans.isCorrect;
    });

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[var(--bg-card)] border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm text-center space-y-6">
          <div
            className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-md animate-bounce"
            style={{
              backgroundColor: accentConfig.bgRgba,
              color: accentConfig.primaryHex,
              border: `1px solid ${accentConfig.borderRgba}`
            }}
          >
            <Trophy className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sessão de Revisão Concluída!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-lg mx-auto">
              Você revisou suas questões erradas através do método de recuperação ativa às cegas. Veja sua taxa de superação abaixo:
            </p>
          </div>

          {/* Cards de Métricas Consolidadas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                Total Revisadas
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                {sessionStats.answeredCount}/{sessionStats.total}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Erros Superados
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {sessionStats.correctCount}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block flex items-center gap-1">
                <XCircle className="w-3 h-3 text-rose-500" />
                Ainda Pendentes
              </span>
              <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                {sessionStats.wrongCount}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                Taxa de Superação
              </span>
              <div
                className="text-2xl font-black font-mono mt-0.5"
                style={{ color: accentConfig.primaryHex }}
              >
                {sessionStats.superacaoPercent.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Relação das Questões da Sessão */}
          <div className="max-w-2xl mx-auto pt-4 border-t border-slate-100 dark:border-zinc-800/80 text-left space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
              Diagnóstico Questão a Questão:
            </h3>

            <div className="space-y-2">
              {questionIds.map((qId, idx) => {
                const q = questionsMap[qId];
                const orig = userAnswers[qId];
                const sess = sessionAnswers[qId];
                const prevLet =
                  orig?.previousLetter ||
                  (!orig?.isCorrect ? orig?.letter : undefined) ||
                  orig?.attempts?.find((a) => !a.isCorrect)?.letter;

                return (
                  <div
                    key={qId}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsSessionFinished(false);
                    }}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold font-mono flex items-center justify-center text-[11px] shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {q?.banca || 'Banca'} • {q?.year || '2025'}
                          {q?.especialidade && ` — ${q.especialidade}`}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>Anterior: <strong className="text-rose-600 dark:text-rose-400">[{prevLet || '?'}]</strong></span>
                          <span>→</span>
                          <span>Agora: <strong className={sess?.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>[{sess?.letter || 'Pendente'}]</strong></span>
                          <span>• Gabarito: <strong className="text-emerald-600 dark:text-emerald-400">[{q?.correctAnswer || '?'}]</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {sess?.isCorrect ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Superada
                        </span>
                      ) : sess ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Pendente
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200 dark:bg-zinc-800 text-slate-500">
                          Não respondida
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botões Finais de Ação */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {persistentErrorIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSessionAnswers({});
                  setCurrentIndex(0);
                  setIsSessionFinished(false);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-md hover:scale-102 flex items-center gap-2"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Revisar apenas os que persistem ({persistentErrorIds.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Voltar ao Caderno de Erros
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA PRINCIPAL: QUESTÃO EM REVISÃO
  // ==========================================
  const isAnswered = !!currentSessionAnswer;
  const isCurrentCorrect = isAnswered && currentSessionAnswer.isCorrect;
  const isCommentOpen = !!expandedComments[currentQId];
  const isNotesOpen = !!expandedNotes[currentQId];

  const currentReasonKey = originalAnswer?.errorReason;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Header Focado da Sessão de Revisão */}
      <div className="bg-white dark:bg-[var(--bg-card)] border border-slate-200 dark:border-zinc-800/80 p-4 rounded-3xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Caderno</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:border-zinc-800" />

          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: accentConfig.primaryHex }}
            />
            Revisão Ativa de Erros
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Temporizador */}
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {Math.floor(questionTimer / 60)}:
              {(questionTimer % 60).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Contador de Questão e Barra de Progresso */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Questão <strong className="text-slate-900 dark:text-white font-mono">{currentIndex + 1}</strong> de{' '}
              <span className="font-mono">{questionIds.length}</span>
            </span>

            <div className="w-20 sm:w-28 h-2 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-slate-200/60 dark:border-zinc-800">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / questionIds.length) * 100}%`,
                  backgroundColor: accentConfig.primaryHex
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Card Principal da Questão */}
      <div className="bg-white dark:bg-[var(--bg-card)] border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        {/* Topo do Card: Metadados da Questão */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 shadow-2xs">
              <Building className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
              <span>{currentQuestion?.banca || originalAnswer?.banca || 'Banca Oficial'}</span>
              <span className="text-slate-400">•</span>
              <span>{currentQuestion?.year || originalAnswer?.year || '2025'}</span>
            </span>

            {(currentQuestion?.code || originalAnswer?.code) && (
              <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 font-bold bg-slate-50 dark:bg-zinc-900/60 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-zinc-800">
                #{currentQuestion?.code || originalAnswer?.code}
              </span>
            )}

            <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{originalAnswer?.specialty || currentQuestion?.especialidade}</span>
              {(originalAnswer?.tema || currentQuestion?.tema) && (
                <span>• {originalAnswer?.tema || currentQuestion?.tema}</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
              {isAnswered ? (isCurrentCorrect ? 'Superada' : 'Ainda com Dificuldade') : 'Em Resolução Cega'}
            </span>
          </div>
        </div>

        {/* Enunciado da Questão */}
        <div className="text-slate-950 dark:text-zinc-100 text-[15px] sm:text-[16px] leading-relaxed font-normal whitespace-pre-line text-justify select-text">
          {currentQuestion?.statement ? (
            renderFormattedText(currentQuestion.statement)
          ) : (
            <p className="text-slate-400 italic">Carregando detalhes do enunciado...</p>
          )}
        </div>

        {/* Imagens Anexadas se houver */}
        {((currentQuestion?.images && currentQuestion.images.length > 0) || currentQuestion?.imageUrl) && (
          <div className="pt-1 flex flex-col gap-3">
            {(currentQuestion.images || (currentQuestion.imageUrl ? [currentQuestion.imageUrl] : [])).map((imgUrl, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 p-2.5 max-w-2xl shadow-inner"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`Imagem ${i + 1} da questão`}
                  className="w-full h-auto object-contain rounded-xl max-h-[460px]"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* BLOCO COMPARATIVO REVELADO APÓS A RESPOSTA (O CORE DO PEDIDO) */}
        {/* ======================================================== */}
        {isAnswered && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Banner de Celebração ou Reforço */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                isCurrentCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isCurrentCorrect ? (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5 stroke-[2.2]" />
                  </div>
                )}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">
                    {isCurrentCorrect
                      ? 'Erro Superado! Você acertou a questão!'
                      : 'Você errou novamente nesta revisão.'}
                  </h4>
                  <p className="text-[11px] opacity-90">
                    {isCurrentCorrect
                      ? 'Seu raciocínio clínico foi corrigido com sucesso e a questão foi promovida para Recuperada.'
                      : 'Não desanime! Analise o comparativo e a justificativa para fixar a conduta padrão-ouro.'}
                  </p>
                </div>
              </div>

              {isCurrentCorrect && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Trophy className="w-3.5 h-3.5" />
                  +1 Recuperada
                </span>
              )}
            </div>

            {/* Painel Comparativo Triplo: Resposta Atual vs Tentativa Anterior vs Gabarito Oficial */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800">
              {/* Coluna 1: Resposta Atual */}
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                  Sua Escolha Agora
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-lg font-mono font-bold flex items-center justify-center text-xs ${
                      isCurrentCorrect
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {currentSessionAnswer.letter}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isCurrentCorrect
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    Alternativa {currentSessionAnswer.letter} {isCurrentCorrect ? '(Correta)' : '(Incorreta)'}
                  </span>
                </div>
              </div>

              {/* Coluna 2: O que ele tinha marcado anteriormente (O REQUISITO CENTRAL!) */}
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500/90 dark:text-rose-400/90 block flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Você Havia Marcado Antes
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-mono font-bold flex items-center justify-center text-xs">
                    {previousMistakeLetter || '?'}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                      Alternativa {previousMistakeLetter || 'Não registrada'}
                    </span>
                    {originalAnswer?.timestamp && (
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                        em {new Date(originalAnswer.timestamp).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Coluna 3: Gabarito Oficial da Banca */}
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Gabarito Oficial
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center justify-center text-xs">
                    {currentQuestion?.correctAnswer || '?'}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Alternativa {currentQuestion?.correctAnswer || 'Oficial'}
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnóstico Comparativo Clínico */}
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
              <strong className="text-slate-900 dark:text-white">Análise da Tentativa: </strong>
              {isCurrentCorrect ? (
                <span>
                  Você eliminou o distrator anterior (Alternativa {previousMistakeLetter}) e selecionou a conduta correta (Alternativa {currentQuestion?.correctAnswer}). Parabéns pela evolução!
                </span>
              ) : currentSessionAnswer.letter === previousMistakeLetter ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  Atenção: você voltou a marcar a mesma alternativa {previousMistakeLetter} da primeira tentativa. Esse distrator representa sua principal armadilha nesta questão.
                </span>
              ) : (
                <span>
                  Você mudou de alternativa (marcou {previousMistakeLetter} da primeira vez e agora marcou {currentSessionAnswer.letter}), mas ainda caiu em outro distrator. O gabarito oficial é a Alternativa {currentQuestion?.correctAnswer}.
                </span>
              )}
            </div>
          </div>
        )}

        {/* 3. Alternativas (Renderização Limpa na Fase Cega vs Revelada no Pós-Resposta) */}
        <div className="space-y-2.5 pt-2">
          {currentQuestion?.options?.map((option) => {
            const isEliminated = !!currentElims[option.letter];
            const isChosen = (isAnswered ? currentSessionAnswer.letter : selectedOption) === option.letter;
            const isCorrectOption = isAnswered && option.letter === currentQuestion.correctAnswer;
            const isPreviousMistake = isAnswered && option.letter === previousMistakeLetter;

            // Estilos visuais quando ainda NÃO respondida (Cega)
            let optionClass =
              'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-800 dark:text-zinc-200';

            if (!isAnswered) {
              if (isChosen) {
                optionClass =
                  'border-slate-900 dark:border-white bg-slate-50 dark:bg-zinc-800/80 shadow-xs font-medium text-slate-950 dark:text-white';
              }
            } else {
              // Estilos quando JÁ respondida (Revelação)
              if (isCorrectOption) {
                optionClass =
                  'border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 shadow-xs font-medium';
              } else if (isChosen && !isCorrectOption) {
                optionClass =
                  'border-rose-500/50 bg-rose-500/10 text-rose-950 dark:text-rose-200 shadow-xs font-medium';
              } else if (isPreviousMistake) {
                optionClass =
                  'border-dashed border-rose-400/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300';
              } else {
                optionClass =
                  'border-slate-200/60 dark:border-zinc-800/60 opacity-60 text-slate-600 dark:text-zinc-400';
              }
            }

            return (
              <div
                key={option.letter}
                onClick={() => {
                  if (!isAnswered) {
                    setSelectedOption(option.letter);
                  }
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm flex items-start justify-between gap-3 transition-all ${optionClass} ${
                  !isAnswered ? 'cursor-pointer' : ''
                } ${isEliminated && !isAnswered ? 'opacity-35 line-through' : ''}`}
              >
                <div className="flex items-start gap-3 flex-1">
                  {/* Badge da Letra */}
                  <span
                    className={`w-7 h-7 rounded-xl font-mono font-bold flex items-center justify-center shrink-0 text-xs transition-colors ${
                      !isAnswered
                        ? isChosen
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        : isCorrectOption
                        ? 'bg-emerald-500 text-white font-black shadow-xs'
                        : isChosen
                        ? 'bg-rose-500 text-white font-black shadow-xs'
                        : isPreviousMistake
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'
                    }`}
                  >
                    {option.letter}
                  </span>

                  {/* Texto da Alternativa */}
                  <div className="space-y-1 flex-1 leading-relaxed pt-0.5">
                    <span className={isEliminated && !isAnswered ? 'line-through' : ''}>
                      {option.text}
                    </span>

                    {/* Tags Explicativas Pós-Resposta */}
                    {isAnswered && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {isCorrectOption && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            Gabarito Oficial
                          </span>
                        )}
                        {isChosen && (
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              isCurrentCorrect
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            Você Marcou Agora
                          </span>
                        )}
                        {isPreviousMistake && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                            Marcada Anteriormente
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão de Riscar/Eliminar Alternativa (apenas na fase cega) */}
                {!isAnswered && (
                  <button
                    type="button"
                    onClick={(e) => toggleEliminate(e, option.letter)}
                    title={isEliminated ? 'Restaurar alternativa' : 'Riscar/eliminar alternativa'}
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                      isEliminated
                        ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 border-transparent hover:border-slate-200 dark:hover:border-zinc-800'
                    }`}
                  >
                    <Scissors className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* 4. Ações Principais: Botão Confirmar Resposta (Fase Cega) */}
        {!isAnswered && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
            <span className="text-xs text-slate-400 dark:text-zinc-500 italic">
              Dica: Selecione a alternativa e aperte <strong>Enter</strong> ou clique em Confirmar.
            </span>

            <button
              type="button"
              disabled={!selectedOption}
              onClick={handleConfirmAnswer}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                selectedOption
                  ? 'text-white cursor-pointer hover:scale-102 active:scale-98'
                  : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed shadow-none'
              }`}
              style={selectedOption ? { backgroundColor: accentConfig.primaryHex } : undefined}
            >
              <span>Confirmar Resposta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 5. Comentário do Professor, Metacognição e Navegação (Fase Pós-Resposta) */}
        {isAnswered && (
          <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
            {/* Seletor Metacognitivo: Por que errou? (Se errou ou quiser atualizar) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-slate-400" />
                  Classificação Metacognitiva do Erro:
                </span>
                {currentReasonKey && ERROR_REASON_CONFIG[currentReasonKey] && (
                  <span className="text-[11px] text-slate-500 italic">
                    {ERROR_REASON_CONFIG[currentReasonKey].desc}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {Object.entries(ERROR_REASON_CONFIG).map(([reasonKey, config]) => {
                  const isSelected = currentReasonKey === reasonKey;
                  return (
                    <button
                      key={reasonKey}
                      type="button"
                      onClick={() => {
                        const next = isSelected ? undefined : (reasonKey as ErrorReasonType);
                        onUpdateAnswerMeta(currentQId, { errorReason: next });
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                        isSelected
                          ? `${config.bg} ${config.text} ${config.border} shadow-2xs font-bold scale-102`
                          : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:text-slate-900'
                      }`}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                      {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comentário do Professor & Take-Home Message */}
            {currentQuestion?.commentary && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedComments((prev) => ({
                      ...prev,
                      [currentQId]: !prev[currentQId]
                    }))
                  }
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Comentário Padrão-Ouro da Banca & Resolução Completa</span>
                  </div>
                  <span>{isCommentOpen ? 'Recolher' : 'Expandir Comentário'}</span>
                </button>

                {isCommentOpen && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-3 animate-in fade-in duration-150">
                    <p className="text-xs sm:text-[13px] leading-relaxed text-slate-800 dark:text-zinc-200 whitespace-pre-line font-normal">
                      {renderFormattedText(currentQuestion.commentary)}
                    </p>

                    {currentQuestion.takeHomeMessage && (
                      <div className="p-3 rounded-xl bg-white/80 dark:bg-black/40 border border-emerald-300/60 dark:border-emerald-700/40 text-xs font-medium text-emerald-950 dark:text-emerald-200">
                        <strong className="font-bold">Take-Home Message: </strong>
                        {currentQuestion.takeHomeMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bloco de Anotações Pessoais do Aluno */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  setExpandedNotes((prev) => ({
                    ...prev,
                    [currentQId]: !prev[currentQId]
                  }))
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>
                  {originalAnswer?.studentNotes
                    ? 'Ver Minha Nota Pessoal'
                    : 'Adicionar Nota / Flashcard Mental'}
                </span>
              </button>

              {isNotesOpen && (
                <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                      Minha Lição Aprendida para Não Errar na Prova:
                    </span>
                    {savedNotesAlert[currentQId] && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                        ✓ Salvo com sucesso!
                      </span>
                    )}
                  </div>

                  <textarea
                    rows={2}
                    value={
                      localNotes[currentQId] !== undefined
                        ? localNotes[currentQId]
                        : originalAnswer?.studentNotes || ''
                    }
                    onChange={(e) =>
                      setLocalNotes((prev) => ({
                        ...prev,
                        [currentQId]: e.target.value
                      }))
                    }
                    placeholder="Escreva a armadilha, a exceção ou a regra mnemônica desta questão..."
                    className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-amber-300/80 dark:border-amber-700/60 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveNotes(currentQId)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer transition-all shadow-xs flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Salvar Nota</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Barra Inferior de Navegação entre as Questões da Sessão */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < questionIds.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-md flex items-center gap-1.5 hover:scale-102"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    <span>Próxima Questão dos Erros</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSessionFinished(true)}
                    className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all cursor-pointer shadow-md flex items-center gap-2 hover:scale-102"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finalizar e Ver Resultados</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
