'use client';

import { StudyInkLayer } from '@/components/StudyInkLayer';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Clock,
  Sparkles,
  Keyboard,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Star,
  Pencil,
  Plus,
  Check,
  BarChart3,
  Users,
  TrendingUp,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { AddFlashcardDrawer } from './flashcards/AddFlashcardDrawer';
import {
  FlashcardItem,
  FlashcardRating,
  FlashcardSchedulerSettings,
  FlashcardSessionMode,
  StudyMaterialItem
} from '@/types/flashcards';
import { previewRatingOptions } from '@/utils/ankiScheduler';
import {
  AnkiSessionQueueState,
  advanceCustomNoRescheduleQueue,
  advanceQueueAfterRating,
  buildAnkiSessionQueue,
  buildCustomNoRescheduleQueue,
  forceAdvanceWaitingCard,
  getLiveQueueCounts,
  pickNextCardFromQueue,
  reshufflePendingQueues,
  skipCurrentCardInQueue,
  stepBackInQueue
} from '@/utils/ankiSessionQueue';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useStudyTimer } from '@/context/StudyTimerContext';
import { flashcardsService, isUserCreatedFlashcardId } from '@/services/flashcardsService';

interface FlashcardStudySessionProps {
  cards: FlashcardItem[];
  onExit: () => void;
  onOpenMaterial?: (material: StudyMaterialItem) => void;
  initialShuffled?: boolean;
  schedulerSettings?: FlashcardSchedulerSettings;
  sessionMode?: FlashcardSessionMode;
}

export const FlashcardStudySession: React.FC<FlashcardStudySessionProps> = ({
  cards,
  onExit,
  onOpenMaterial,
  initialShuffled = false,
  schedulerSettings,
  sessionMode = 'srs'
}) => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();
  const { status: timerStatus, recordActivitySession } = useStudyTimer();
  const sessionStartIsoRef = useRef<string>(new Date().toISOString());
  const sessionStatsRef = useRef({ again: 0, hard: 0, good: 0, easy: 0 });
  const hasSavedStudySessionRef = useRef(false);
  const timerStatusRef = useRef(timerStatus);
  const recordActivityRef = useRef(recordActivitySession);
  useEffect(() => {
    timerStatusRef.current = timerStatus;
    recordActivityRef.current = recordActivitySession;
  }, [timerStatus, recordActivitySession]);

  const activeSchedulerSettings = useMemo(() => {
    return schedulerSettings || flashcardsService.getSchedulerSettings(user?.id);
  }, [schedulerSettings, user?.id]);

  const [activeSessionMode, setActiveSessionMode] = useState<FlashcardSessionMode>(sessionMode);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(initialShuffled);
  const [queueState, setQueueState] = useState<AnkiSessionQueueState>(() => {
    if (sessionMode === 'custom_no_reschedule') {
      return buildCustomNoRescheduleQueue(cards, new Date(), activeSchedulerSettings, initialShuffled);
    }
    return buildAnkiSessionQueue(cards, new Date(), activeSchedulerSettings, {
      filterDueOnly: false,
      shuffled: initialShuffled
    });
  });
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0
  });
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [waitingNowMs, setWaitingNowMs] = useState<number>(() => Date.now());
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Estado para Edição Direta no Card (sem modificar a estrutura visual)
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editPriority, setEditPriority] = useState<'essential' | 'standard'>('standard');

  // Drawer Central de Estatísticas do Flashcard
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Estado para Adicionar Novo Flashcard na Sessão (usa o AddFlashcardDrawer unificado -> Cartões Originais)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sessionToast, setSessionToast] = useState<string | null>(null);

  // Alterna o estado de embaralhar nas filas pendentes sem perder o progresso em learningQueue
  const toggleShuffle = () => {
    const nextShuffled = !isShuffled;
    setQueueState((prev) => reshufflePendingQueues(prev, nextShuffled));
    setIsFlipped(false);
    setIsInlineEditing(false);
    setShowStatsModal(false);
    setIsShuffled(nextShuffled);
  };

  // Timer da sessão + auto-despertador quando o próximo card de aprendizagem entra na janela
  useEffect(() => {
    if (queueState.isCompleted) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
      if (queueState.waitingForDueAtMs !== null) {
        const now = new Date();
        setWaitingNowMs(now.getTime());
        const learnAheadMs = Math.max(0, activeSchedulerSettings.learnAheadMinutes) * 60 * 1000;
        if (now.getTime() + learnAheadMs >= queueState.waitingForDueAtMs) {
          setQueueState((prev) => pickNextCardFromQueue(prev, now, activeSchedulerSettings));
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [queueState.isCompleted, queueState.waitingForDueAtMs, activeSchedulerSettings]);

  const currentCard = queueState.currentCard;
  const isCompleted = queueState.isCompleted;
  const liveCounts = useMemo(() => getLiveQueueCounts(queueState), [queueState]);

  useEffect(() => {
    sessionStatsRef.current = sessionStats;
  }, [sessionStats]);

  const flushFlashcardStudySession = useCallback(() => {
    if (hasSavedStudySessionRef.current || timerStatusRef.current !== 'idle') return;
    const s = sessionStatsRef.current;
    const totalReviewed = s.again + s.hard + s.good + s.easy;
    if (totalReviewed <= 0) return;
    hasSavedStudySessionRef.current = true;
    const firstCard = cards[0];
    recordActivityRef.current({
      startTime: sessionStartIsoRef.current,
      endTime: new Date().toISOString(),
      taxonomy: {
        especialidade: firstCard?.specialty,
        tema: firstCard?.theme,
        foco: firstCard?.focus,
        rawLabel: firstCard?.focus || firstCard?.theme || firstCard?.specialty || 'Flashcards'
      },
      studyType: 'flashcards',
      sessionSource: 'flashcards',
      questionsCount: totalReviewed,
      correctCount: s.good + s.easy,
      incorrectCount: s.again + s.hard
    }).catch(() => {});
  }, [cards]);

  useEffect(() => {
    if (isCompleted) {
      flushFlashcardStudySession();
    }
  }, [isCompleted, flushFlashcardStudySession]);

  useEffect(() => {
    return () => {
      flushFlashcardStudySession();
    };
  }, [flushFlashcardStudySession]);

  const handleToggleInlineEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;
    if (isInlineEditing) {
      setIsInlineEditing(false);
    } else {
      setEditFront(currentCard.front);
      setEditBack(currentCard.back);
      setEditComment(currentCard.comment || '');
      setEditPriority(currentCard.priority || 'standard');
      setIsInlineEditing(true);
    }
  };

  const handleCancelInlineEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsInlineEditing(false);
  };

  const handleSaveCardEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentCard || !editFront.trim() || !editBack.trim()) return;

    const updatedFields: Partial<FlashcardItem> = {
      front: editFront.trim(),
      back: editBack.trim(),
      comment: editComment.trim() || undefined,
      priority: editPriority
    };

    flashcardsService.saveCardEdit(currentCard.id, updatedFields, user?.id);

    // Atualiza imediatamente o card na sessão ativa
    setQueueState((prev) => ({
      ...prev,
      currentCard: prev.currentCard ? { ...prev.currentCard, ...updatedFields } : null
    }));

    setIsInlineEditing(false);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Formata tempo (mm:ss)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Parser do Cloze Deletion (Frente: omite com [...])
  const renderFrontContent = (text: string) => {
    const parts = text.split(/(\{\{c\d+::.*?\}\})/g);
    return parts.map((part, idx) => {
      if (part.startsWith('{{c') && part.includes('::')) {
        return (
          <span
            key={idx}
            className="inline-flex items-center px-2 py-0.5 mx-1 rounded-md font-mono font-bold text-xs sm:text-sm bg-zinc-200 dark:bg-zinc-700/80 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-600 shadow-2xs"
          >
            [...]
          </span>
        );
      }
      return part;
    });
  };

  // Parser do Cloze Deletion (Verso: renderiza frase completa com resposta em destaque)
  const renderBackClozeContent = (text: string) => {
    const parts = text.split(/(\{\{c\d+::.*?\}\})/g);
    return parts.map((part, idx) => {
      if (part.startsWith('{{c') && part.includes('::')) {
        const match = part.match(/\{\{c\d+::(.*?)\}\}/);
        const answer = match ? match[1] : part;
        return (
          <span
            key={idx}
            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md font-bold text-xs sm:text-sm bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs"
          >
            {answer}
          </span>
        );
      }
      return part;
    });
  };

  // Projeção determinística:
  // - Em modo custom_no_reschedule: mostra comportamento temporário da sessão sem alterar FSRS
  // - Em modo SRS / custom_reschedule: mostra projeção FSRS-5 idêntica ao cálculo real
  const getProjectedIntervalLabel = (card: FlashcardItem, rating: FlashcardRating): string => {
    if (activeSessionMode === 'custom_no_reschedule') {
      const step0 = Math.max(1, activeSchedulerSettings.learningStepsMinutes[0] || 1);
      const hardMins = Math.max(5, Math.min(15, step0 * 5));
      if (rating === 'again') return `${step0} min`;
      if (rating === 'hard') return `${hardMins} min`;
      return 'Concluir';
    }
    const previews = previewRatingOptions(card.progress, new Date(), activeSchedulerSettings);
    return previews[rating].label;
  };

  // Navegação direta entre cards na fila temporal
  const handlePrevCard = useCallback(() => {
    if (queueState.backStack.length > 0) {
      setIsFlipped(false);
      setIsInlineEditing(false);
      setShowStatsModal(false);
      setQueueState((prev) => stepBackInQueue(prev));
    }
  }, [queueState.backStack.length]);

  const handleNextCard = useCallback(() => {
    if (!currentCard) return;
    setIsFlipped(false);
    setIsInlineEditing(false);
    setShowStatsModal(false);
    setQueueState((prev) => skipCurrentCardInQueue(prev, new Date(), activeSchedulerSettings));
  }, [currentCard, activeSchedulerSettings]);

  // Avaliação do Card:
  // - Modo custom_no_reschedule: mantém fila temporária da sessão SEM chamar recordReview (preserva FSRS)
  // - Modo SRS / custom_reschedule: grava FSRS-5 normalmente e avança na fila temporal
  const handleRate = useCallback(
    (rating: FlashcardRating) => {
      if (!currentCard) return;

      const now = new Date();
      setSessionStats((prev) => ({
        ...prev,
        [rating]: prev[rating] + 1
      }));

      setIsFlipped(false);
      setIsInlineEditing(false);
      setShowStatsModal(false);

      if (activeSessionMode === 'custom_no_reschedule') {
        setQueueState((prev) =>
          advanceCustomNoRescheduleQueue(prev, rating, now, activeSchedulerSettings)
        );
        return;
      }

      const updatedProgress = flashcardsService.recordReview(currentCard.id, rating, user?.id);
      setQueueState((prev) =>
        advanceQueueAfterRating(prev, updatedProgress, rating, now, activeSchedulerSettings)
      );
    },
    [currentCard, user?.id, activeSchedulerSettings, activeSessionMode]
  );

  // Helper para validar imagens médicas reais (evita badges sintéticos)
  const isRealMedicalImage = (url?: string | null): boolean => {
    if (!url) return false;
    if (url.startsWith('data:image/svg+xml')) return false;
    return true;
  };

  // Atalhos de Teclado:
  // - Seta Direita (→): SÓ passa para o próximo flashcard (NÃO vira)
  // - Seta Esquerda (←): SÓ passa para o flashcard anterior (NÃO vira)
  // - Espaço ou Enter: Vira o flashcard (mostrar frente / verso)
  // - Teclas 1 a 4: Avaliações FSRS quando o verso está aberto
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      // Não interceptar se estiver digitando em input ou textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      // Se o modal de estatísticas estiver aberto, Esc ou Enter fecha
      if (showStatsModal) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault();
          setShowStatsModal(false);
          return;
        }
      }

      // Seta Direita -> SÓ passar para o próximo flashcard
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      }
      // Seta Esquerda -> SÓ voltar ao flashcard anterior
      else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      }
      // Espaço ou Enter -> Alternar Flip (Virar Flashcard)
      else if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
      // Teclas 1 a 4 quando o verso está aberto
      else if (isFlipped) {
        if (e.key === '1') {
          e.preventDefault();
          handleRate('again');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRate('hard');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRate('good');
        } else if (e.key === '4') {
          e.preventDefault();
          handleRate('easy');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, isCompleted, showStatsModal, handleRate, handleNextCard, handlePrevCard]);

  // Busca material de apoio correspondente
  const associatedMaterial = currentCard
    ? flashcardsService.getStudyMaterialByFocus(currentCard.focus, currentCard.specialty)
    : undefined;

  if (isCompleted) {
    const totalAnswered =
      sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy;
    const accuracy =
      totalAnswered > 0
        ? Math.round(((sessionStats.good + sessionStats.easy) / totalAnswered) * 100)
        : 100;

    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 text-center space-y-6 shadow-xs animate-in fade-in-50 duration-200">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xs"
          style={{ backgroundColor: accentConfig.primaryHex }}
        >
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-heading font-black text-zinc-900 dark:text-zinc-100">
            Sessão Concluída!
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {activeSessionMode === 'custom_no_reschedule'
              ? `${queueState.completedCount} ${queueState.completedCount === 1 ? 'card praticado' : 'cards praticados'} em Estudo Personalizado (agendamento FSRS preservado).`
              : `${queueState.completedCount} ${queueState.completedCount === 1 ? 'card consolidado' : 'cards consolidados'} com o algoritmo FSRS-5.`}
          </p>
        </div>

        {/* Resumo de Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <span className="block text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {formatTime(secondsElapsed)}
            </span>
            <span className="text-[10px] uppercase font-bold text-zinc-500">Tempo</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <span className="block text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {accuracy}%
            </span>
            <span className="text-[10px] uppercase font-bold text-zinc-500">Retenção</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <span className="block text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {sessionStats.good + sessionStats.easy}
            </span>
            <span className="text-[10px] uppercase font-bold text-zinc-500">Fixados</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <span className="block text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {sessionStats.again}
            </span>
            <span className="text-[10px] uppercase font-bold text-zinc-500">Repetidos</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setActiveSessionMode('custom_no_reschedule');
              setQueueState(
                buildCustomNoRescheduleQueue(cards, new Date(), activeSchedulerSettings, isShuffled)
              );
              setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
              setIsFlipped(false);
              setSecondsElapsed(0);
            }}
            className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Repassar os cartões novamente sem alterar as datas já agendadas no FSRS"
          >
            Revisar Novamente (Sem alterar FSRS)
          </button>

          <button
            type="button"
            onClick={onExit}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            Concluir & Sair
          </button>
        </div>
      </div>
    );
  }

  if (queueState.waitingForDueAtMs !== null && !currentCard) {
    const remainingSecs = Math.max(0, Math.ceil((queueState.waitingForDueAtMs - waitingNowMs) / 1000));
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 text-center space-y-5 shadow-xs animate-in fade-in-50 duration-200">
        <div
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xs"
          style={{ backgroundColor: accentConfig.primaryHex }}
        >
          <Clock className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-xl font-heading font-black text-zinc-900 dark:text-zinc-100">
            Aguardando Próximo Cartão em Aprendizagem
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Restam <strong>{queueState.learningQueue.length}</strong>{' '}
            {queueState.learningQueue.length === 1 ? 'cartão agendado' : 'cartões agendados'} fora da janela de antecipação ({activeSchedulerSettings.learnAheadMinutes} min).
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-2xl font-black text-zinc-900 dark:text-zinc-100">
          <Clock className="w-5 h-5 text-rose-500" />
          <span>{formatTime(remainingSecs)}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              setIsFlipped(false);
              setQueueState((prev) => forceAdvanceWaitingCard(prev));
            }}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            Estudar Próximo Agora Mesmo
          </button>

          <button
            type="button"
            onClick={onExit}
            className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            Concluir &amp; Sair
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* 1. Barra Superior da Sessão */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sair</span>
        </button>

        {/* Indicador de Progresso */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono font-bold text-xs"
            title="Contagem ao vivo estilo Anki: Novos • Aprender • Revisar"
          >
            <span
              className={`text-blue-600 dark:text-blue-400 ${queueState.currentBucket === 'new' ? 'underline decoration-2 underline-offset-4' : ''
                }`}
            >
              {liveCounts.novo}
            </span>
            <span className="text-zinc-400">+</span>
            <span
              className={`text-rose-600 dark:text-rose-400 ${queueState.currentBucket === 'learning' ? 'underline decoration-2 underline-offset-4' : ''
                }`}
            >
              {liveCounts.aprender}
            </span>
            <span className="text-zinc-400">+</span>
            <span
              className={`text-emerald-600 dark:text-emerald-400 ${queueState.currentBucket === 'review' ? 'underline decoration-2 underline-offset-4' : ''
                }`}
            >
              {liveCounts.revisar}
            </span>
          </div>

          {/* Botão de Embaralhar / Ordem Original (Apenas ícone) */}
          <button
            type="button"
            onClick={toggleShuffle}
            title={isShuffled ? 'Embaralhado (Clique para voltar à ordem original e ir ao card 1)' : 'Ordem original (Clique para embaralhar e ir ao card 1)'}
            aria-label={isShuffled ? 'Embaralhado' : 'Original'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${isShuffled
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-2xs'
              : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Botão Adicionar Flashcard diretamente na Sessão (Apenas ícone) */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            title="Adicionar novo flashcard nesta sessão"
            aria-label="Adicionar Flashcard"
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Botão para abrir Drawer Central de Estatísticas do Card (Apenas ícone) */}
          <button
            type="button"
            onClick={() => setShowStatsModal(true)}
            title="Estatísticas do Flashcard & Comparativo com Outros Usuários"
            aria-label="Estatísticas do Flashcard"
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          {/* Atalhos de Teclado (Apenas ícone no desktop/tablet) */}
          <button
            type="button"
            onClick={() => setShowShortcuts((prev) => !prev)}
            title="Consultar atalhos de teclado"
            aria-label="Atalhos de teclado"
            className="hidden sm:inline-flex p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal/Painel de Atalhos de Teclado */}
      {showShortcuts && (
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-2 animate-in fade-in-50 duration-150 shadow-2xs">
          <div className="flex justify-between items-center font-bold text-zinc-900 dark:text-zinc-100">
            <div className="flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-zinc-500" />
              <span>Atalhos de Teclado</span>
            </div>
            <button
              type="button"
              onClick={() => setShowShortcuts(false)}
              className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-700 dark:text-zinc-300">Virar Flashcard / Resposta</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">Espaço</kbd>
                <span className="text-zinc-400">ou</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">Enter</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-700 dark:text-zinc-300">Próximo Flashcard</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">→</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-700 dark:text-zinc-300">Flashcard Anterior</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">←</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-700 dark:text-zinc-300">Avaliações FSRS (Verso)</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">1</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">2</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">3</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">4</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Discreto de Estudo Personalizado Sem Reagendamento */}
      {activeSessionMode === 'custom_no_reschedule' && (
        <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Estudo Personalizado • Agendamento FSRS original preservado (sem reagendamento)</span>
        </div>
      )}

      {/* 2. Barra de Progresso Fina */}
      <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${Math.min(100, Math.max(4, (queueState.completedCount / Math.max(1, queueState.totalInitialDue)) * 100))}%`,
            backgroundColor: accentConfig.primaryHex
          }}
        />
      </div>

      {/* 3. Card 3D Interativo (Flip) */}
      <div
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const isPenOpen = typeof window !== 'undefined' && localStorage.getItem('study-ink-open') === 'true';
          if (
            isPenOpen ||
            target.closest('button, a, input, textarea, [role="button"], svg, aside, [data-study-ink-active="true"]')
          ) {
            return;
          }
          if (!isInlineEditing) {
            setIsFlipped((prev) => !prev);
          }
        }}
        className="w-full min-h-[300px] sm:min-h-[400px] p-5 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 shadow-xs cursor-pointer flex flex-col justify-between transition-all duration-200 select-none touch-manipulation group relative isolate overflow-hidden"
      >
        <StudyInkLayer content={`flashcard:${currentCard.id}`} />
        {/* Topo do Card */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: accentConfig.primaryHex }}
            />
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {currentCard.focus}
            </span>
            {queueState.isCurrentLearnAhead && (
              <span
                title="Cartão de aprendizagem antecipado dentro do Learn-Ahead Limit"
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              >
                Antecipado
              </span>
            )}
            {isInlineEditing && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Editando {!isFlipped ? 'Frente' : 'Verso'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentCard.priority === 'essential' && (
              <span title="Essencial na Prova" className="inline-flex items-center">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
              </span>
            )}
            {/* Contagem retirada de dentro do flashcard (conforme solicitado) */}
            {isInlineEditing ? (
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setEditPriority((p) => (p === 'essential' ? 'standard' : 'essential'))}
                  title={editPriority === 'essential' ? 'Essencial na Prova (Clique para padrão)' : 'Padrão (Clique para marcar essencial)'}
                  className={`p-1 rounded-lg border transition-colors cursor-pointer ${editPriority === 'essential'
                      ? 'border-amber-500/40 bg-amber-500/15 text-amber-500'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-400'
                    }`}
                >
                  <Star className={`w-3.5 h-3.5 ${editPriority === 'essential' ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleSaveCardEdit}
                  title="Salvar alterações no flashcard"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Salvar</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancelInlineEdit}
                  title="Cancelar edição"
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleToggleInlineEdit}
                title="Editar flashcard direto no card (salvo apenas para você)"
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo Central */}
        <div className="my-auto py-4 text-center">
          {!isFlipped ? (
            <div className="space-y-4 max-w-xl mx-auto">
              {isInlineEditing ? (
                <textarea
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  rows={Math.max(2, Math.ceil((editFront || '').length / 45))}
                  placeholder="Pergunta ou enunciado do flashcard..."
                  className="w-full text-base sm:text-lg font-medium leading-relaxed text-center text-zinc-900 dark:text-zinc-100 bg-transparent border-b-2 border-dashed border-amber-500/60 hover:border-amber-500 focus:border-amber-500 outline-none resize-none transition-colors p-1"
                />
              ) : (
                <div className="text-base sm:text-lg font-medium leading-relaxed text-zinc-900 dark:text-zinc-100">
                  {renderFrontContent(currentCard.front)}
                </div>
              )}
              {isRealMedicalImage(currentCard.imageFrontUrl) && (
                <div className="pt-2">
                  <img
                    src={currentCard.imageFrontUrl!}
                    alt="Achado clínico (Frente)"
                    className="max-h-48 mx-auto rounded-xl border border-zinc-200 dark:border-zinc-700 object-contain shadow-2xs"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 max-w-xl mx-auto animate-in fade-in-50 duration-150">
              {/* Resposta Principal em Destaque */}
              {isInlineEditing ? (
                <textarea
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  rows={Math.max(1, Math.ceil((editBack || '').length / 35))}
                  placeholder="Resposta do flashcard..."
                  className="w-full text-lg sm:text-2xl font-heading font-black tracking-tight text-center bg-transparent border-b-2 border-dashed border-amber-500/60 hover:border-amber-500 focus:border-amber-500 outline-none resize-none transition-colors p-1"
                  style={{ color: accentConfig.primaryHex }}
                />
              ) : (
                <div
                  className="text-lg sm:text-2xl font-heading font-black tracking-tight"
                  style={{ color: accentConfig.primaryHex }}
                >
                  {currentCard.back}
                </div>
              )}

              {/* Se for card com Cloze Deletion, renderiza a frase contextualizada preenchida */}
              {!isInlineEditing && currentCard.front.includes('{{c') && (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed text-left">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-600 dark:text-zinc-300 mb-1">
                    Enunciado Completo Preenchido
                  </div>
                  {renderBackClozeContent(currentCard.front)}
                </div>
              )}

              {/* Imagem médica diagnóstica autêntica se houver */}
              {isRealMedicalImage(currentCard.imageUrl) && (
                <div className="pt-2">
                  <img
                    src={currentCard.imageUrl!}
                    alt="Achado diagnóstico"
                    className="max-h-48 mx-auto rounded-xl border border-zinc-200 dark:border-zinc-700 object-contain shadow-2xs"
                  />
                </div>
              )}

              {/* Explicação Médica / Comentário */}
              {isInlineEditing ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-dashed border-amber-500/40 text-left text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Explicação Clínica</span>
                  </div>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    rows={Math.max(2, Math.ceil((editComment || '').length / 55))}
                    placeholder="Justificativa clínica opcional..."
                    className="w-full bg-transparent border border-zinc-200 dark:border-zinc-700 focus:border-amber-500 rounded-lg p-2 leading-relaxed text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 outline-none resize-none transition-colors"
                  />
                </div>
              ) : (
                currentCard.comment && (
                  <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 text-left text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Explicação Clínica</span>
                    </div>
                    <p className="leading-relaxed">{currentCard.comment}</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Ações & Botões de Avaliação FSRS */}
      {isFlipped ? (
        <div className="space-y-3 animate-in fade-in-50 duration-150">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => handleRate('again')}
              className="min-h-[52px] px-1.5 py-2.5 sm:p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex flex-col items-center justify-center transition-all cursor-pointer touch-manipulation active:scale-95 shadow-2xs"
            >
              <span className="text-[11px] sm:text-sm font-bold whitespace-nowrap">
                De novo<span className="hidden sm:inline"> (1)</span>
              </span>
              <span className="text-[10px] font-medium opacity-80">
                {getProjectedIntervalLabel(currentCard, 'again')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleRate('hard')}
              className="min-h-[52px] px-1.5 py-2.5 sm:p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex flex-col items-center justify-center transition-all cursor-pointer touch-manipulation active:scale-95 shadow-2xs"
            >
              <span className="text-[11px] sm:text-sm font-bold whitespace-nowrap">
                Difícil<span className="hidden sm:inline"> (2)</span>
              </span>
              <span className="text-[10px] font-medium opacity-80">
                {getProjectedIntervalLabel(currentCard, 'hard')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleRate('good')}
              className="min-h-[52px] px-1.5 py-2.5 sm:p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center transition-all cursor-pointer touch-manipulation active:scale-95 shadow-2xs"
            >
              <span className="text-[11px] sm:text-sm font-bold whitespace-nowrap">
                Bom<span className="hidden sm:inline"> (3)</span>
              </span>
              <span className="text-[10px] font-medium opacity-80">
                {getProjectedIntervalLabel(currentCard, 'good')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleRate('easy')}
              className="min-h-[52px] px-1.5 py-2.5 sm:p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex flex-col items-center justify-center transition-all cursor-pointer touch-manipulation active:scale-95 shadow-2xs"
            >
              <span className="text-[11px] sm:text-sm font-bold whitespace-nowrap">
                Fácil<span className="hidden sm:inline"> (4)</span>
              </span>
              <span className="text-[10px] font-medium opacity-80">
                {getProjectedIntervalLabel(currentCard, 'easy')}
              </span>
            </button>
          </div>

          {/* Navegação Rápida no Verso (Voltar / Pular card sem avaliar FSRS) */}
          <div className="flex items-center justify-between gap-2 pt-1 text-xs select-none">
            <button
              type="button"
              onClick={handlePrevCard}
              disabled={queueState.backStack.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-[11px] font-semibold cursor-pointer"
              title="Voltar ao flashcard anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-semibold transition-colors cursor-pointer"
              title="Ver novamente a pergunta na frente do card"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Ver Pergunta</span>
            </button>

            <button
              type="button"
              onClick={handleNextCard}
              disabled={liveCounts.totalRemaining <= 1}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-[11px] font-semibold cursor-pointer"
              title="Pular para o próximo flashcard sem registrar avaliação"
            >
              <span>Pular / Próximo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {queueState.backStack.length > 0 && (
            <button
              type="button"
              onClick={handlePrevCard}
              className="min-w-[46px] min-h-[46px] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center cursor-pointer touch-manipulation active:scale-95 shadow-2xs"
              title="Card anterior"
              aria-label="Card anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFlipped(true)}
            className="w-full sm:w-auto min-h-[46px] px-8 sm:px-10 py-3 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs cursor-pointer touch-manipulation hover:opacity-95 transition-all flex items-center justify-center active:scale-95"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <span>Mostrar Resposta</span>
          </button>

          <button
            type="button"
            onClick={handleNextCard}
            className="min-w-[46px] min-h-[46px] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center cursor-pointer touch-manipulation active:scale-95 shadow-2xs"
            title="Próximo card"
            aria-label="Próximo card"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Drawer / Modal Central de Estatísticas do Flashcard & Comparativo com Outros Alunos */}
      {showStatsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-150"
          onClick={() => setShowStatsModal(false)}
        >
          <div
            className="w-full max-w-lg p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Drawer */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Estatísticas do Flashcard
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    {currentCard.theme} • {currentCard.focus}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStatsModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo com verificação se o aluno já respondeu */}
            {(() => {
              const stats = flashcardsService.getCardCommunityStats(currentCard, user?.id);
              const userProgress = flashcardsService.loadSavedProgress(user?.id)[currentCard.id] || currentCard.progress;
              const hasAnswered = (userProgress && userProgress.repetitions > 0) || (userProgress && userProgress.lastRating);

              return (
                <div className="space-y-4 text-xs">
                  {/* Aviso se o aluno ainda não respondeu este flashcard */}
                  {!hasAnswered ? (
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-3 text-amber-800 dark:text-amber-300">
                      <Clock className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                      <div className="space-y-1">
                        <p className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                          Nenhuma resposta registrada ainda por você
                        </p>
                        <p className="text-[11px] leading-relaxed text-amber-700/90 dark:text-amber-400/90">
                          Você ainda não respondeu este flashcard. Suas métricas individuais de fixação, repetições e estabilidade FSRS serão calculadas assim que você avaliar este card (De novo, Difícil, Bom ou Fácil).
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Bloco com métricas do aluno se já respondeu */
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                          Seu Desempenho neste Card
                        </span>
                        {stats.userLastRating && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300">
                            Última: {stats.userLastRating === 'again' ? 'De novo' : stats.userLastRating === 'hard' ? 'Difícil' : stats.userLastRating === 'good' ? 'Bom' : 'Fácil'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                        <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                          <span className="block text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                            {stats.userTotalReviews}x
                          </span>
                          <span className="text-[10px] text-zinc-500">Revisões Suas</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                          <span className="block text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {stats.userRetentionRate}%
                          </span>
                          <span className="text-[10px] text-zinc-500">Sua Fixação</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                          <span className="block text-base font-bold font-mono text-purple-600 dark:text-purple-400">
                            Top {Math.max(1, 100 - stats.comparisonPercentile)}%
                          </span>
                          <span className="text-[10px] text-zinc-500">Seu Percentil</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comparativo com a Comunidade (Outros Candidatos) */}
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-500" />
                        Comunidade de Candidatos de Residência
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {stats.totalStudents.toLocaleString('pt-BR')} alunos
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                        <span className="block text-base font-bold font-mono text-blue-600 dark:text-blue-400">
                          {stats.communityRetentionRate}%
                        </span>
                        <span className="text-[10px] text-zinc-500">Taxa Média de Acerto</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                        <span className="block text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                          {stats.difficultyLabel}
                        </span>
                        <span className="text-[10px] text-zinc-500">Dificuldade Percebida</span>
                      </div>
                    </div>

                    {/* Barra de Distribuição das Respostas */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span>Distribuição de Respostas na Plataforma:</span>
                        <span>Tempo médio: <strong>{stats.averageSeconds}s</strong></span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex overflow-hidden">
                        <div
                          style={{ width: `${stats.goodPercent + stats.easyPercent}%` }}
                          className="bg-emerald-500 h-full"
                          title={`Bom/Fácil: ${stats.goodPercent + stats.easyPercent}%`}
                        />
                        <div
                          style={{ width: `${stats.hardPercent}%` }}
                          className="bg-amber-500 h-full"
                          title={`Difícil: ${stats.hardPercent}%`}
                        />
                        <div
                          style={{ width: `${stats.againPercent}%` }}
                          className="bg-rose-500 h-full"
                          title={`De novo: ${stats.againPercent}%`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Bom/Fácil ({stats.goodPercent + stats.easyPercent}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500" /> Difícil ({stats.hardPercent}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500" /> De novo ({stats.againPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Rodapé */}
            <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowStatsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Unificado de Criação -> Cartões Originais */}
      <AddFlashcardDrawer
        isOpen={isAddModalOpen}
        initialDeckId={
          currentCard?.deckId && isUserCreatedFlashcardId(currentCard.id)
            ? currentCard.deckId
            : 'deck-padrao'
        }
        initialSpecialty={currentCard?.specialty || 'Clínica Médica'}
        initialTema={currentCard?.theme}
        initialFoco={currentCard?.focus}
        onClose={() => setIsAddModalOpen(false)}
        onCardSaved={(savedCard, deckName) => {
          if (savedCard) {
            setQueueState((prev) => ({
              ...prev,
              newQueue: [savedCard, ...prev.newQueue],
              totalInitialDue: prev.totalInitialDue + 1
            }));
          }
          setSessionToast(`Salvo em Cartões Originais → ${deckName || 'Baralho Padrão'}`);
          setTimeout(() => setSessionToast(null), 4000);
        }}
      />

      {sessionToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{sessionToast}</span>
        </div>
      )}
    </div>
  );
};
