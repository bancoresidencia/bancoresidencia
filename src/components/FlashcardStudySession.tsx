'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Clock,
  Sparkles,
  RotateCw,
  BookOpen,
  Keyboard,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { FlashcardItem, FlashcardRating, StudyMaterialItem } from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { flashcardsService } from '@/services/flashcardsService';

interface FlashcardStudySessionProps {
  cards: FlashcardItem[];
  onExit: () => void;
  onOpenMaterial?: (material: StudyMaterialItem) => void;
}

export const FlashcardStudySession: React.FC<FlashcardStudySessionProps> = ({
  cards,
  onExit,
  onOpenMaterial
}) => {
  const { accentConfig } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCards, setSessionCards] = useState<FlashcardItem[]>(cards);
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0
  });
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Timer da sessão
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const currentCard = sessionCards[currentIndex];

  // Formata tempo (mm:ss)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Parser do Cloze Deletion
  const renderFrontContent = (text: string) => {
    // Substitui {{c1::palavra}} por um marcador visual [...]
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

  // Avaliação do Card via FSRS
  const handleRate = useCallback(
    (rating: FlashcardRating) => {
      if (!currentCard) return;

      flashcardsService.recordReview(currentCard.id, rating);

      setSessionStats((prev) => ({
        ...prev,
        [rating]: prev[rating] + 1
      }));

      // Se for "again", adiciona ao final da sessão para consolidação
      if (rating === 'again') {
        setSessionCards((prev) => [...prev, currentCard]);
      }

      // Avança para o próximo card
      if (currentIndex + 1 < sessionCards.length) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsCompleted(true);
      }
    },
    [currentCard, currentIndex, sessionCards.length]
  );

  // Helper para validar imagens médicas reais (evita badges sintéticos)
  const isRealMedicalImage = (url?: string | null): boolean => {
    if (!url) return false;
    if (url.startsWith('data:image/svg+xml')) return false;
    return true;
  };

  // Navegação direta entre cards
  const handlePrevCard = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNextCard = useCallback(() => {
    if (currentIndex + 1 < sessionCards.length) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  }, [currentIndex, sessionCards.length]);

  // Atalhos de Teclado (Setas do teclado para passar, Espaço/Enter para virar, 1 a 4 para classificar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      // Não interceptar se estiver digitando em input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      // Seta Direita -> Virar ou Passar para o próximo
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) {
          // Shift + Seta Direita -> Avança direto sem pontuar
          handleNextCard();
        } else if (!isFlipped) {
          // Se ainda está na frente, vira para mostrar o verso
          setIsFlipped(true);
        } else {
          // Se já está no verso, passa para o próximo card com avaliação 'Bom'
          handleRate('good');
        }
      }
      // Seta Esquerda -> Voltar ou De novo
      else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) {
          // Shift + Seta Esquerda -> Volta card anterior
          handlePrevCard();
        } else if (isFlipped) {
          // Se está no verso, marca como 'De novo' (<10 min)
          handleRate('again');
        } else if (currentIndex > 0) {
          // Se está na frente, volta para o card anterior
          handlePrevCard();
        }
      }
      // Espaço, Enter, Seta Cima ou Seta Baixo -> Alternar Flip
      else if (e.code === 'Space' || e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
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
  }, [isFlipped, isCompleted, handleRate, handleNextCard, handlePrevCard, currentIndex]);

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
              setSessionCards(cards);
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

          <button
            type="button"
            onClick={() => setShowShortcuts((prev) => !prev)}
            title="Consultar atalhos de teclado"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Keyboard className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span className="text-xs font-semibold">Atalhos</span>
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
              <span className="text-zinc-700 dark:text-zinc-300">Mostrar Resposta / Virar</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">Espaço</kbd>
                <span className="text-zinc-400">ou</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">→</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-700 dark:text-zinc-300">Pular Card</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">Shift + →</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-700 dark:text-zinc-300">Card Anterior</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">Shift + ←</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-700 dark:text-zinc-300">Avaliações (Verso)</span>
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
        onClick={() => setIsFlipped((prev) => !prev)}
        className="w-full min-h-[340px] sm:min-h-[400px] p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 shadow-xs cursor-pointer flex flex-col justify-between transition-all duration-200 select-none group relative overflow-hidden"
      >
        {/* Topo do Card */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: accentConfig.primaryHex }}
            />
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {currentCard.focus}
            </span>
          </div>
        </div>

        {/* Conteúdo Central */}
        <div className="my-auto py-4 text-center">
          {!isFlipped ? (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="text-base sm:text-lg font-medium leading-relaxed text-zinc-900 dark:text-zinc-100">
                {renderFrontContent(currentCard.front)}
              </div>
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
              <div
                className="text-lg sm:text-2xl font-heading font-black tracking-tight"
                style={{ color: accentConfig.primaryHex }}
              >
                {currentCard.back}
              </div>

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
              {currentCard.comment && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 text-left text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Explicação Clínica</span>
                  </div>
                  <p className="leading-relaxed">{currentCard.comment}</p>
                </div>
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
              className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <span className="text-xs sm:text-sm font-bold">De novo</span>
              <span className="text-[10px] font-medium opacity-80">&lt;10 min</span>
            </button>

            <button
              type="button"
              onClick={() => handleRate('hard')}
              className="p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <span className="text-xs sm:text-sm font-bold">Difícil</span>
              <span className="text-[10px] font-medium opacity-80">1 dia</span>
            </button>

            <button
              type="button"
              onClick={() => handleRate('good')}
              className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <span className="text-xs sm:text-sm font-bold">Bom</span>
              <span className="text-[10px] font-medium opacity-80">2-3 dias</span>
            </button>

            <button
              type="button"
              onClick={() => handleRate('easy')}
              className="p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <span className="text-xs sm:text-sm font-bold">Fácil</span>
              <span className="text-[10px] font-medium opacity-80">5-7 dias</span>
            </button>
          </div>

          {/* Atalho para o Resumo Clínico do Tema */}
          {associatedMaterial && onOpenMaterial && (
            <button
              type="button"
              onClick={() => onOpenMaterial(associatedMaterial)}
              className="w-full py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ver Resumo Completo de {associatedMaterial.focus}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={handlePrevCard}
              className="px-3 sm:px-4 py-3 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Voltar ao card anterior"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFlipped(true)}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <RotateCw className="w-4 h-4" />
            <span>Mostrar Resposta</span>
          </button>

          <button
            type="button"
            onClick={handleNextCard}
            className="px-3 sm:px-4 py-3 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Pular card"
          >
            <span className="hidden sm:inline">Pular</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
