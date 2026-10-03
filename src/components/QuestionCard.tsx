'use client';

import React, { useState, useRef } from 'react';
import { Question } from '@/types';
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Building,
  Layers,
  Highlighter,
  Eraser,
  Strikethrough,
  Send,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  onAnswer: (questionId: string, selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E', isCorrect: boolean) => void;
  userAnswer?: 'A' | 'B' | 'C' | 'D' | 'E';
  fontSize?: 'sm' | 'base' | 'lg';
  onChangeFontSize?: (size: 'sm' | 'base' | 'lg') => void;
}

interface TextHighlight {
  id: string;
  text: string;
  color: 'yellow' | 'green' | 'pink';
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  total,
  onAnswer,
  userAnswer,
  fontSize = 'sm',
  onChangeFontSize
}) => {
  const { accentConfig } = useTheme();

  // Estados de resolução da questão (seleção prévia vs confirmação no botão Resolver)
  const [pendingSelected, setPendingSelected] = useState<'A' | 'B' | 'C' | 'D' | 'E' | null>(userAnswer || null);
  const [isAnswered, setIsAnswered] = useState<boolean>(!!userAnswer);
  const [showCommentary, setShowCommentary] = useState<boolean>(!!userAnswer);

  // Estado de alternativas riscadas/cortadas pelo aluno
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, boolean>>({});

  // Estados de Marcador de Texto (Highlight)
  const [highlights, setHighlights] = useState<TextHighlight[]>([]);
  const [activeHighlighterColor, setActiveHighlighterColor] = useState<'yellow' | 'green' | 'pink'>('yellow');

  const statementRef = useRef<HTMLDivElement>(null);

  // Visibilidade dos detalhes extras da questão (Banca e Ano aparecem por padrão; demais detalhes apenas se o aluno apertar)
  const [showDetails, setShowDetails] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('medevo_question_show_details');
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return false; // Padrão: oculto
  });

  const toggleShowDetails = () => {
    setShowDetails((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('medevo_question_show_details', String(next));
      }
      return next;
    });
  };

  // Sincroniza estado de forma limpa durante a renderização quando a questão ou a resposta mudam
  const currentKey = `${question.id}-${userAnswer || ''}`;
  const [prevQuestionKey, setPrevQuestionKey] = useState(currentKey);
  if (prevQuestionKey !== currentKey) {
    setPrevQuestionKey(currentKey);
    setPendingSelected(userAnswer || null);
    setIsAnswered(!!userAnswer);
    setShowCommentary(!!userAnswer);
    setEliminatedOptions({});
    setHighlights([]);
  }

  // Captura seleção de texto dentro do enunciado e destaca automaticamente com a cor ativa
  const handleStatementMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length >= 2) {
      addHighlight(selectedText, activeHighlighterColor);
    }
  };

  const addHighlight = (text: string, color: 'yellow' | 'green' | 'pink') => {
    if (!text.trim()) return;
    // Evita duplicar exatamente o mesmo trecho com a mesma cor
    const alreadyExists = highlights.some((h) => h.text === text && h.color === color);
    if (!alreadyExists) {
      const newHighlight: TextHighlight = {
        id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text,
        color
      };
      setHighlights((prev) => [...prev, newHighlight]);
    }
    window.getSelection()?.removeAllRanges();
  };

  const removeHighlight = (id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

  const clearAllHighlights = () => {
    setHighlights([]);
  };

  // Alterna o corte/risco de uma alternativa (eliminar distrator)
  const toggleEliminateOption = (letter: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAnswered) return;
    setEliminatedOptions((prev) => ({
      ...prev,
      [letter]: !prev[letter]
    }));
  };

  // Seleciona a alternativa (apenas seleciona, NÃO envia logo)
  const handleSelectOption = (letter: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (isAnswered) return;
    // Se estava riscada, desseleciona o risco ao escolher
    if (eliminatedOptions[letter]) {
      setEliminatedOptions((prev) => ({ ...prev, [letter]: false }));
    }
    setPendingSelected(letter);
  };

  // Envio final ao apertar o botão "Resolver"
  const handleConfirmAnswer = () => {
    if (isAnswered || !pendingSelected) return;
    setIsAnswered(true);
    const isCorrect = pendingSelected === question.correctAnswer;
    onAnswer(question.id, pendingSelected, isCorrect);
    setShowCommentary(true);
  };

  // Mapeamento dinâmico de fontes ergonômicas
  const statementSizeClass =
    fontSize === 'sm'
      ? 'text-[13.5px] sm:text-[14px] leading-relaxed'
      : fontSize === 'lg'
      ? 'text-base sm:text-lg leading-relaxed'
      : 'text-sm sm:text-base leading-relaxed';

  const optionSizeClass =
    fontSize === 'sm'
      ? 'text-[12.5px] sm:text-[13px] leading-relaxed'
      : fontSize === 'lg'
      ? 'text-sm sm:text-base leading-relaxed'
      : 'text-xs sm:text-sm leading-relaxed';

  const optionPaddingClass =
    fontSize === 'sm'
      ? 'p-3 sm:p-3.5 rounded-xl gap-3'
      : fontSize === 'lg'
      ? 'p-4 sm:p-5 rounded-2xl gap-4'
      : 'p-3.5 sm:p-4 rounded-xl gap-3.5';

  const badgeSizeClass =
    fontSize === 'sm'
      ? 'w-6.5 h-6.5 text-[11px]'
      : fontSize === 'lg'
      ? 'w-8 h-8 text-xs'
      : 'w-7 h-7 text-xs';

  // Renderizador do enunciado com suporte a destaques múltiplos do marca-texto
  const renderHighlightedStatement = (statement: string) => {
    if (highlights.length === 0) {
      return <span>{statement}</span>;
    }

    // Cria regex com todas as palavras/trechos destacados
    const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length);
    const escapedTerms = sortedHighlights.map((h) =>
      h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    const parts = statement.split(regex);

    return (
      <>
        {parts.map((part, i) => {
          const matchedHl = sortedHighlights.find(
            (h) => h.text.toLowerCase() === part.toLowerCase()
          );

          if (matchedHl) {
            const colorClasses =
              matchedHl.color === 'yellow'
                ? 'bg-amber-300 dark:bg-amber-400 text-black dark:text-black font-semibold border-b-2 border-amber-500'
                : matchedHl.color === 'green'
                ? 'bg-emerald-300 dark:bg-emerald-400 text-black dark:text-black font-semibold border-b-2 border-emerald-500'
                : 'bg-pink-300 dark:bg-pink-400 text-black dark:text-black font-semibold border-b-2 border-pink-500';

            return (
              <mark
                key={i}
                onClick={() => removeHighlight(matchedHl.id)}
                title="Clique para remover este destaque"
                className={`cursor-pointer px-1 py-0.5 rounded-md transition-all hover:opacity-85 ${colorClasses}`}
              >
                {part}
              </mark>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  const isUserCorrect = isAnswered && pendingSelected === question.correctAnswer;

  return (
    <article className="bento-card bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative transition-all">
      {/* Header com Badges Médicos & Ferramentas da Questão */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Banca e Ano: Sempre visíveis por padrão conforme solicitado */}
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shadow-xs">
            <Building className="w-3.5 h-3.5 text-blue-500" />
            <span>{question.institution}</span>
            <span className="text-slate-400">•</span>
            <span>{question.year}</span>
          </span>

          {/* Botão para Revelar/Ocultar detalhes da questão (Especialidade, Dificuldade, Tema) */}
          <button
            type="button"
            onClick={toggleShowDetails}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
              showDetails
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300'
                : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={showDetails ? 'Ocultar detalhes extras da questão' : 'Visualizar detalhes extras (especialidade, nível e temas)'}
          >
            {showDetails ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-blue-500" />
                <span>Ocultar Detalhes</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Ver Detalhes</span>
              </>
            )}
          </button>

          {/* Badges Extras: Visíveis APENAS se o aluno apertar para ver detalhes */}
          {showDetails && (
            <>
              {(question.especialidade || question.specialty) && (
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs animate-in fade-in duration-150">
                  {question.especialidade || question.specialty}
                </span>
              )}

              {question.difficulty && (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-xl border shadow-xs animate-in fade-in duration-150 ${
                    question.difficulty === 'Fácil'
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50'
                      : question.difficulty === 'Médio'
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                      : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
                  }`}
                >
                  {question.difficulty}
                </span>
              )}

              {question.tipoProva && (
                <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
                  {question.tipoProva}
                </span>
              )}
            </>
          )}
        </div>

        {/* Ferramentas: Marca-texto, Tamanho de Fonte e Contador */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Seletor do Marca-Texto */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold shadow-xs">
            <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 px-1 font-semibold">
              <Highlighter className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Marca-texto:</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveHighlighterColor('yellow')}
              title="Marca-texto Amarelo"
              className={`w-5 h-5 rounded-md transition-all cursor-pointer border ${
                activeHighlighterColor === 'yellow'
                  ? 'bg-amber-300 border-amber-500 ring-2 ring-amber-400/40 scale-105'
                  : 'bg-amber-200 border-amber-300 opacity-60 hover:opacity-100'
              }`}
            />
            <button
              type="button"
              onClick={() => setActiveHighlighterColor('green')}
              title="Marca-texto Verde"
              className={`w-5 h-5 rounded-md transition-all cursor-pointer border ${
                activeHighlighterColor === 'green'
                  ? 'bg-emerald-300 border-emerald-500 ring-2 ring-emerald-400/40 scale-105'
                  : 'bg-emerald-200 border-emerald-300 opacity-60 hover:opacity-100'
              }`}
            />
            <button
              type="button"
              onClick={() => setActiveHighlighterColor('pink')}
              title="Marca-texto Rosa"
              className={`w-5 h-5 rounded-md transition-all cursor-pointer border ${
                activeHighlighterColor === 'pink'
                  ? 'bg-pink-300 border-pink-500 ring-2 ring-pink-400/40 scale-105'
                  : 'bg-pink-200 border-pink-300 opacity-60 hover:opacity-100'
              }`}
            />
            {highlights.length > 0 && (
              <button
                type="button"
                onClick={clearAllHighlights}
                title="Limpar todas as marcações desta questão"
                className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 px-1 py-0.5 rounded transition-colors cursor-pointer ml-1"
              >
                <Eraser className="w-3 h-3" />
                <span className="hidden md:inline">Limpar ({highlights.length})</span>
              </button>
            )}
          </div>

          {/* Ajuste de Fonte */}
          {onChangeFontSize && (
            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold shadow-xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 px-1 font-semibold">Fonte:</span>
              <button
                type="button"
                onClick={() => onChangeFontSize('sm')}
                title="Fonte Compacta"
                className={`px-1.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  fontSize === 'sm'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => onChangeFontSize('base')}
                title="Fonte Padrão"
                className={`px-1.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  fontSize === 'base'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => onChangeFontSize('lg')}
                title="Fonte Grande"
                className={`px-1.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  fontSize === 'lg'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                A+
              </button>
            </div>
          )}

          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
            {index + 1}/{total}
          </span>
        </div>
      </div>

      {/* Tema, Foco e Subfoco Clínico (Exibido apenas se o aluno apertar para ver detalhes) */}
      {showDetails && (question.subtheme || question.tema) && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 animate-in fade-in duration-150">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-semibold">Tema:</span>
          <span className="text-slate-900 dark:text-slate-200 font-bold">
            {question.subtheme || question.tema}
          </span>
          {question.foco && (
            <>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                {question.foco}
              </span>
            </>
          )}
          {question.subfoco && (
            <>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-600 dark:text-slate-400 italic">
                {question.subfoco}
              </span>
            </>
          )}
        </div>
      )}

      {/* Enunciado Clínico com Marcador de Texto Ativo - Texto Justificado */}
      <div className="relative">
        <div
          ref={statementRef}
          onMouseUp={handleStatementMouseUp}
          onTouchEnd={handleStatementMouseUp}
          className={`${statementSizeClass} text-slate-900 dark:text-slate-100 leading-relaxed font-normal whitespace-pre-line tracking-tight select-text text-justify selection:bg-amber-300 selection:text-black dark:selection:bg-amber-400 dark:selection:text-black`}
          style={{ textAlign: 'justify', textJustify: 'inter-word' }}
        >
          {renderHighlightedStatement(question.statement)}
        </div>
      </div>

      {/* Imagens Anexadas */}
      {((question.images && question.images.length > 0) || question.imageUrl) && (
        <div className="pt-2 flex flex-col gap-3">
          {(question.images || (question.imageUrl ? [question.imageUrl] : [])).map((imgUrl, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 p-3 max-w-2xl shadow-inner"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={`Imagem ${i + 1} da questão`}
                className="w-full h-auto object-contain rounded-xl max-h-[480px]"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* Alternativas (Múltipla Escolha) com Riscador e Seleção Prévia */}
      {question.options && question.options.length > 0 ? (
        <div className="space-y-3 pt-2">
          {question.options.map((option) => {
            const isEliminated = !!eliminatedOptions[option.letter];
            const isPending = pendingSelected === option.letter;
            const isCorrect = option.letter === question.correctAnswer;

            // Estilos condicionais (Antes de Responder vs Depois de Responder)
            let optionContainerStyle =
              'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs';

            if (!isAnswered) {
              if (isPending) {
                optionContainerStyle =
                  'border-blue-500 dark:border-blue-400 bg-blue-50/70 dark:bg-blue-950/50 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/30 shadow-sm font-semibold';
              } else if (isEliminated) {
                optionContainerStyle =
                  'border-slate-200 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-950/30 text-slate-400 dark:text-slate-500 opacity-60';
              }
            } else {
              // Já respondeu
              if (isCorrect) {
                optionContainerStyle =
                  'border-emerald-500/80 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/30 shadow-sm font-semibold';
              } else if (isPending && !isCorrect) {
                optionContainerStyle =
                  'border-rose-500/80 bg-rose-50/80 dark:bg-rose-950/50 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500/30 shadow-sm';
              } else {
                optionContainerStyle =
                  'opacity-45 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-400 dark:text-slate-500';
              }
            }

            return (
              <div
                key={option.letter}
                onClick={() => handleSelectOption(option.letter)}
                className={`w-full text-left ${optionPaddingClass} border transition-all duration-200 flex items-start justify-between group rounded-2xl ${
                  !isAnswered ? 'cursor-pointer' : 'cursor-default'
                } ${optionContainerStyle}`}
              >
                <div className="flex items-start gap-3 flex-1">
                  {/* Letra da Alternativa */}
                  <span
                    className={`${badgeSizeClass} rounded-xl flex items-center justify-center font-extrabold shrink-0 mt-0.5 shadow-xs transition-colors ${
                      isAnswered && isCorrect
                        ? 'bg-emerald-600 text-white'
                        : isAnswered && isPending && !isCorrect
                        ? 'bg-rose-600 text-white'
                        : isPending
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400/50'
                        : isEliminated
                        ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 line-through'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {option.letter}
                  </span>

                  {/* Texto da Alternativa */}
                  <span
                    className={`${optionSizeClass} flex-1 pt-0.5 font-medium transition-all ${
                      isEliminated && !isPending && !isAnswered
                        ? 'line-through text-slate-400 dark:text-slate-500 opacity-60 italic'
                        : ''
                    }`}
                  >
                    {option.text}
                  </span>
                </div>

                {/* Ações da Alternativa: Riscar (Cortar) + Ícones de Acerto/Erro */}
                <div className="flex items-center gap-2 shrink-0 ml-3 pt-0.5">
                  {/* Botão de Cortar/Riscar (apenas antes de responder) */}
                  {!isAnswered && (
                    <button
                      type="button"
                      onClick={(e) => toggleEliminateOption(option.letter, e)}
                      title={
                        isEliminated
                          ? 'Restaurar alternativa descartada'
                          : 'Riscar alternativa (descartar distrator)'
                      }
                      className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        isEliminated
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold border border-rose-300 dark:border-rose-800'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Feedback Visual pós-resposta */}
                  {isAnswered && isCorrect && (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span className="hidden sm:inline">Correta</span>
                    </div>
                  )}
                  {isAnswered && isPending && !isCorrect && (
                    <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold">
                      <XCircle className="w-5 h-5 shrink-0" />
                      <span className="hidden sm:inline">Incorreta</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* BARRA DE AÇÃO: BOTÃO "RESOLVER" (Ao selecionar, confirma envio) */}
          {!isAnswered ? (
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {pendingSelected ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>
                      Alternativa <strong className="text-blue-600 dark:text-blue-400 font-black">{pendingSelected}</strong> selecionada.
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Selecione uma alternativa acima e clique em Resolver para confirmar.</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleConfirmAnswer}
                disabled={!pendingSelected}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer ${
                  pendingSelected
                    ? 'text-white hover:scale-102 active:scale-98 shadow-md'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
                style={
                  pendingSelected
                    ? {
                        backgroundColor: accentConfig.primaryHex,
                        boxShadow: `0 4px 14px 0 ${accentConfig.bgRgba}`
                      }
                    : undefined
                }
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {pendingSelected ? 'Resolver Questão' : 'Selecione uma Alternativa'}
                </span>
              </button>
            </div>
          ) : (
            /* Banner pós-resposta */
            <div
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold border shadow-xs ${
                isUserCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                {isUserCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>
                  {isUserCorrect
                    ? 'Parabéns! Você acertou a questão!'
                    : `Você errou esta questão. O gabarito oficial é Alternativa ${question.correctAnswer}.`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowCommentary(!showCommentary)}
                className="text-[11px] underline cursor-pointer hover:opacity-80"
              >
                {showCommentary ? 'Recolher Gabarito' : 'Ver Comentário'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Questão Dissertativa */
        <div className="pt-2 space-y-3">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Questão Dissertativa
            </span>
            <textarea
              placeholder="Digite seu raciocínio clínico, hipótese diagnóstica e condutas aqui..."
              className="w-full h-32 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
            />
            <button
              onClick={() => {
                setShowCommentary(true);
                setIsAnswered(true);
                onAnswer(question.id, 'A', true);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md hover:scale-102 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Resolver e Ver Padrão de Resposta</span>
            </button>
          </div>
        </div>
      )}

      {/* Gabarito Comentado e Raciocínio Clínico */}
      {(isAnswered || showCommentary) && (
        <div className="pt-2">
          <button
            onClick={() => setShowCommentary(!showCommentary)}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {showCommentary
                ? 'Ocultar comentário do professor'
                : 'Ver comentário do professor e raciocínio clínico'}
            </span>
            {showCommentary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showCommentary && (
            <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-slate-950 border border-emerald-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 space-y-2.5 shadow-inner">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {question.options && question.options.length > 0
                    ? `Resposta Correta: Alternativa ${question.correctAnswer}`
                    : 'Padrão de Resposta Oficial:'}
                </span>
              </div>
              <p
                className={`${
                  fontSize === 'sm'
                    ? 'text-[12.5px] sm:text-[13px] leading-relaxed'
                    : fontSize === 'lg'
                    ? 'text-sm sm:text-base leading-relaxed'
                    : 'text-xs sm:text-sm leading-relaxed'
                } font-normal text-slate-800 dark:text-slate-300`}
              >
                {question.commentary}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
