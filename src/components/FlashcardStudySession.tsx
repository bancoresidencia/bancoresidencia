'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { FlashcardItem, FlashcardRating, StudyMaterialItem, CardCommunityStats } from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { flashcardsService } from '@/services/flashcardsService';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface FlashcardStudySessionProps {
  cards: FlashcardItem[];
  onExit: () => void;
  onOpenMaterial?: (material: StudyMaterialItem) => void;
  initialShuffled?: boolean;
}

export const FlashcardStudySession: React.FC<FlashcardStudySessionProps> = ({
  cards,
  onExit,
  onOpenMaterial,
  initialShuffled = false
}) => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(initialShuffled);
  const [sessionCards, setSessionCards] = useState<FlashcardItem[]>(() => {
    return initialShuffled ? shuffleArray(cards) : cards;
  });
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0
  });
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Estado para Edição Direta no Card (sem modificar a estrutura visual)
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editPriority, setEditPriority] = useState<'essential' | 'standard'>('standard');

  // Drawer Central de Estatísticas do Flashcard
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Estado para Adicionar Novo Flashcard na Sessão
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newPriority, setNewPriority] = useState<'essential' | 'standard'>('standard');

  // Alterna o estado de embaralhar (vai SEMPRE para o flashcard 1)
  const toggleShuffle = () => {
    if (!isShuffled) {
      setSessionCards(shuffleArray(cards));
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsInlineEditing(false);
      setShowStatsModal(false);
      setIsShuffled(true);
    } else {
      setSessionCards(cards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsInlineEditing(false);
      setShowStatsModal(false);
      setIsShuffled(false);
    }
  };

  // Timer da sessão
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const currentCard = sessionCards[currentIndex];

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

    flashcardsService.saveCardEdit(currentCard.id, updatedFields);

    // Atualiza imediatamente o card na sessão ativa
    setSessionCards((prev) =>
      prev.map((c, idx) => (idx === currentIndex ? { ...c, ...updatedFields } : c))
    );

    setIsInlineEditing(false);
  };

  const handleOpenAddModal = () => {
    setNewFront('');
    setNewBack('');
    setNewComment('');
    setNewPriority('standard');
    setIsAddModalOpen(true);
  };

  const handleSaveNewCard = () => {
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: FlashcardItem = {
      id: `fc-user-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      comment: newComment.trim() || undefined,
      specialty: currentCard?.specialty || 'Geral',
      theme: currentCard?.theme || 'Geral',
      focus: currentCard?.focus || currentCard?.theme || 'Geral',
      priority: newPriority
    };

    flashcardsService.saveNewFlashcard(newCard, user?.id);

    // Adiciona o novo card logo após o card atual na sessão ativa
    setSessionCards((prev) => {
      const copy = [...prev];
      copy.splice(currentIndex + 1, 0, newCard);
      return copy;
    });

    setIsAddModalOpen(false);
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

  // Projeção dinâmica de intervalos FSRS baseada na repetição real do card
  const getProjectedIntervalLabel = (card: FlashcardItem, rating: FlashcardRating): string => {
    const isEssential = card.priority === 'essential';
    const reps = card.progress?.repetitions || 0;
    const currentInterval = card.progress?.intervalDays || (isEssential ? 1 : 2);
    const ease = card.progress?.easeFactor || 2.5;

    if (rating === 'again') {
      return isEssential ? '<1 min' : '<10 min';
    }
    if (rating === 'hard') {
      return isEssential ? '<5 min' : '1 dia';
    }
    if (rating === 'good') {
      if (isEssential) {
        if (reps <= 1) return '<10 min';
        const d = Math.max(2, Math.round(currentInterval * ease));
        return `${d}d`;
      } else {
        if (reps <= 1) return '2 dias';
        const d = Math.max(2, Math.round(currentInterval * ease));
        return `${d}d`;
      }
    }
    if (rating === 'easy') {
      if (isEssential) {
        if (reps <= 1) return '<2 dias';
        const d = Math.max(3, Math.round(Math.max(currentInterval, 1.5) * ease * 1.3));
        return `${d}d`;
      } else {
        if (reps <= 1) return '<4 dias';
        const d = Math.max(4, Math.round(Math.max(currentInterval, 2) * ease * 1.3));
        return `${d}d`;
      }
    }
    return '';
  };

  // Avança para o próximo card limpando estados efêmeros
  const goToNextCard = useCallback(() => {
    setIsFlipped(false);
    setIsInlineEditing(false);
    setShowStatsModal(false);
    if (currentIndex + 1 < sessionCards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  }, [currentIndex, sessionCards.length]);

  // Navegação direta entre cards
  const handlePrevCard = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setIsInlineEditing(false);
      setShowStatsModal(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNextCard = useCallback(() => {
    goToNextCard();
  }, [goToNextCard]);

  // Avaliação do Card via FSRS
  const handleRate = useCallback(
    (rating: FlashcardRating) => {
      if (!currentCard) return;

      flashcardsService.recordReview(currentCard.id, rating, user?.id);

      setSessionStats((prev) => ({
        ...prev,
        [rating]: prev[rating] + 1
      }));

      // Se for "again", adiciona ao final da sessão para consolidação
      if (rating === 'again') {
        setSessionCards((prev) => [...prev, currentCard]);
      }

      goToNextCard();
    },
    [currentCard, goToNextCard]
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
            {cards.length} cards revisados com o algoritmo FSRS.
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
              const base = isShuffled ? shuffleArray(cards) : cards;
              setSessionCards(base);
              setCurrentIndex(0);
              setIsFlipped(false);
              setIsCompleted(false);
              setSecondsElapsed(0);
            }}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            Revisar Novamente
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

          <div className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs">
            {currentIndex + 1} / {sessionCards.length}
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

          {/* Atalhos de Teclado (Apenas ícone) */}
          <button
            type="button"
            onClick={() => setShowShortcuts((prev) => !prev)}
            title="Consultar atalhos de teclado"
            aria-label="Atalhos de teclado"
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
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

      {/* 2. Barra de Progresso Fina */}
      <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${((currentIndex + 1) / sessionCards.length) * 100}%`,
            backgroundColor: accentConfig.primaryHex
          }}
        />
      </div>

      {/* 3. Card 3D Interativo (Flip) */}
      <div
        onClick={() => {
          if (!isInlineEditing) {
            setIsFlipped((prev) => !prev);
          }
        }}
        className="w-full min-h-[340px] sm:min-h-[400px] p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 shadow-xs cursor-pointer flex flex-col justify-between transition-all duration-200 select-none group relative overflow-hidden"
      >
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
                  className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                    editPriority === 'essential'
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
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleRate('again')}
              className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              <span className="text-xs sm:text-sm font-bold">De novo (1)</span>
              <span className="text-[10px] font-medium opacity-80">
                {getProjectedIntervalLabel(currentCard, 'again')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleRate('hard')}
              className="p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              <span className="text-xs sm:text-sm font-bold">Difícil (2)</span>
              <span className="text-[10px] font-medium opacity-80">
                {getProjectedIntervalLabel(currentCard, 'hard')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleRate('good')}
              className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              <span className="text-xs sm:text-sm font-bold">Bom (3)</span>
              <span className="text-[10px] font-medium opacity-80">
                {getProjectedIntervalLabel(currentCard, 'good')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleRate('easy')}
              className="p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              <span className="text-xs sm:text-sm font-bold">Fácil (4)</span>
              <span className="text-[10px] font-medium opacity-80">
                {getProjectedIntervalLabel(currentCard, 'easy')}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={handlePrevCard}
              className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
              title="Card anterior"
              aria-label="Card anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFlipped(true)}
            className="w-full sm:w-auto px-8 sm:px-10 py-3 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all flex items-center justify-center active:scale-95"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <span>Mostrar Resposta</span>
          </button>

          <button
            type="button"
            onClick={handleNextCard}
            className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
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
              const stats = flashcardsService.getCardCommunityStats(currentCard);
              const userProgress = flashcardsService.loadSavedProgress()[currentCard.id] || currentCard.progress;
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

      {/* Modal de Adicionar Flashcard diretamente na Sessão */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-150"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  <span>Adicionar Flashcard</span>
                </h3>
                <p className="text-[11px] text-zinc-500">
                  O flashcard será salvo no seu acervo pessoal e incluído nesta sessão.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                  Frente do Cartão (Pergunta / Enunciado) *
                </label>
                <textarea
                  rows={3}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="Ex: Qual o exame padrão-ouro para confirmação diagnóstica de apendicite aguda na gestante?"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                  Verso do Cartão (Resposta) *
                </label>
                <textarea
                  rows={2}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="Ex: Ultrassonografia (1ª linha) ou Ressonância Magnética (quando USG duvidosa)"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                  Explicação Clínica (Comentário opcional)
                </label>
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ex: Evitar TC no primeiro trimestre devido à radiação ionizante..."
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                  Prioridade do Card
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPriority('standard')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${newPriority === 'standard'
                      ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                  >
                    Padrão
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPriority('essential')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${newPriority === 'essential'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-amber-600'
                      }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Essencial na Prova</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!newFront.trim() || !newBack.trim()}
                onClick={handleSaveNewCard}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Adicionar à Sessão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
