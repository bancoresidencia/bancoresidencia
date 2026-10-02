'use client';

import React, { useState } from 'react';
import { Question } from '@/types';
import { CheckCircle2, XCircle, BookOpen, ChevronDown, ChevronUp, Building, Layers } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  onAnswer: (questionId: string, selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E', isCorrect: boolean) => void;
  userAnswer?: 'A' | 'B' | 'C' | 'D' | 'E';
  fontSize?: 'sm' | 'base' | 'lg';
  onChangeFontSize?: (size: 'sm' | 'base' | 'lg') => void;
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
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | 'E' | null>(userAnswer || null);
  const [showCommentary, setShowCommentary] = useState(false);

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

  const isAnswered = selected !== null;

  const handleSelectOption = (letter: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (isAnswered) return;
    setSelected(letter);
    const isCorrect = letter === question.correctAnswer;
    onAnswer(question.id, letter, isCorrect);
    setShowCommentary(true);
  };

  return (
    <article className="bento-card bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header com Badges Médicos */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Instituição & Ano */}
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shadow-xs">
            <Building className="w-3.5 h-3.5 text-blue-500" />
            <span>{question.institution}</span>
            <span className="text-slate-400">•</span>
            <span>{question.year}</span>
          </span>

          {/* Especialidade */}
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
            {question.especialidade || question.specialty}
          </span>

          {/* Dificuldade */}
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-xl border shadow-xs ${
              question.difficulty === 'Fácil'
                ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50'
                : question.difficulty === 'Médio'
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
            }`}
          >
            {question.difficulty}
          </span>

          {question.tipoProva && (
            <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-800">
              {question.tipoProva}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onChangeFontSize && (
            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold shadow-xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 px-1 font-semibold">Fonte:</span>
              <button
                type="button"
                onClick={() => onChangeFontSize('sm')}
                title="Fonte Compacta (Concursos)"
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
            Questão {index + 1} de {total} <span className="opacity-60">({question.code})</span>
          </span>
        </div>
      </div>

      {/* Subtema / Hierarquia Clínica */}
      {(question.subtheme || question.tema) && (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>Tema:</span>
          <strong className="text-slate-900 dark:text-slate-200 font-semibold">
            {question.subtheme || `${question.tema}${question.foco ? ` > ${question.foco}` : ''}`}
          </strong>
        </div>
      )}

      {/* Enunciado Clínico com Tipografia Ajustável & Alta Legibilidade */}
      <div className={`${statementSizeClass} text-slate-900 dark:text-slate-100 leading-relaxed font-normal whitespace-pre-line tracking-tight`}>
        {question.statement}
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

      {/* Alternativas (Múltipla Escolha) ou Campo Discursivo */}
      {question.options && question.options.length > 0 ? (
        <div className="space-y-3 pt-2">
          {question.options.map((option) => {
            const isCurrentSelected = selected === option.letter;
            const isCorrect = option.letter === question.correctAnswer;

            let optionStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs';

            if (isAnswered) {
              if (isCorrect) {
                optionStyle = 'border-emerald-500/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30 shadow-sm';
              } else if (isCurrentSelected && !isCorrect) {
                optionStyle = 'border-rose-500/80 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/30 shadow-sm';
              } else {
                optionStyle = 'opacity-50 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-slate-400 dark:text-slate-500';
              }
            }

            return (
              <button
                key={option.letter}
                onClick={() => handleSelectOption(option.letter)}
                disabled={isAnswered}
                className={`w-full text-left ${optionPaddingClass} border transition-all duration-200 flex items-start cursor-pointer disabled:cursor-default ${optionStyle}`}
              >
                <span
                  className={`${badgeSizeClass} rounded-xl flex items-center justify-center font-extrabold shrink-0 mt-0.5 shadow-xs transition-colors ${
                    isAnswered && isCorrect
                      ? 'bg-emerald-600 text-white'
                      : isAnswered && isCurrentSelected && !isCorrect
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {option.letter}
                </span>

                <span className={`${optionSizeClass} text-slate-900 dark:text-slate-100 flex-1 pt-0.5 font-medium`}>
                  {option.text}
                </span>

                {isAnswered && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                )}
                {isAnswered && isCurrentSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="pt-2 space-y-3">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Questão Dissertativa
            </span>
            <textarea
              placeholder="Digite seu raciocínio clínico, diagnóstico sindrômico e condutas aqui..."
              className="w-full h-32 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
            />
            <button
              onClick={() => {
                setShowCommentary(true);
                onAnswer(question.id, 'A', true);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md hover:scale-102"
            >
              Revelar Gabarito e Padrão de Resposta
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
            <span>{showCommentary ? 'Ocultar comentário do professor' : 'Ver comentário do professor e gabarito detalhado'}</span>
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
              <p className={`${fontSize === 'sm' ? 'text-[12.5px] sm:text-[13px] leading-relaxed' : fontSize === 'lg' ? 'text-sm sm:text-base leading-relaxed' : 'text-xs sm:text-sm leading-relaxed'} font-normal text-slate-800 dark:text-slate-300`}>
                {question.commentary}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
