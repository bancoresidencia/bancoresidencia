'use client';

import React, { useState } from 'react';
import { Question } from '@/types';
import { CheckCircle2, XCircle, HelpCircle, BookOpen } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  onAnswer: (questionId: string, selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E', isCorrect: boolean) => void;
  userAnswer?: 'A' | 'B' | 'C' | 'D' | 'E';
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  total,
  onAnswer,
  userAnswer
}) => {
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | 'E' | null>(userAnswer || null);
  const [showCommentary, setShowCommentary] = useState(false);

  const isAnswered = selected !== null;

  const handleSelectOption = (letter: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (isAnswered) return;
    setSelected(letter);
    const isCorrect = letter === question.correctAnswer;
    onAnswer(question.id, letter, isCorrect);
    setShowCommentary(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
      {/* Header com Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-500/10 text-blue-400">
            {question.institution} • {question.year}
          </span>
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-medium">
            {question.specialty}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {question.difficulty}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Questão {index + 1} de {total} ({question.code})
        </span>
      </div>

      {/* Subtema */}
      <div className="text-xs font-medium text-slate-400">
        Tema: <span className="text-slate-200">{question.subtheme}</span>
      </div>

      {/* Enunciado */}
      <div className="text-sm md:text-base text-slate-100 leading-relaxed font-normal whitespace-pre-line">
        {question.statement}
      </div>

      {/* Alternativas */}
      <div className="space-y-2.5 pt-2">
        {question.options.map((option) => {
          const isCurrentSelected = selected === option.letter;
          const isCorrect = option.letter === question.correctAnswer;

          let optionStyle = 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 hover:border-slate-700 text-slate-200';

          if (isAnswered) {
            if (isCorrect) {
              optionStyle = 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200 ring-1 ring-emerald-500/40';
            } else if (isCurrentSelected && !isCorrect) {
              optionStyle = 'border-rose-500/60 bg-rose-950/30 text-rose-200 ring-1 ring-rose-500/40';
            } else {
              optionStyle = 'opacity-60 border-slate-800 bg-slate-950/40 text-slate-400';
            }
          }

          return (
            <button
              key={option.letter}
              onClick={() => handleSelectOption(option.letter)}
              disabled={isAnswered}
              className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${optionStyle}`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  isAnswered && isCorrect
                    ? 'bg-emerald-500 text-slate-950'
                    : isAnswered && isCurrentSelected && !isCorrect
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {option.letter}
              </span>
              <span className="text-sm leading-snug flex-1">{option.text}</span>
              {isAnswered && isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {isAnswered && isCurrentSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Ações e Gabarito Comentado */}
      {isAnswered && (
        <div className="pt-2">
          <button
            onClick={() => setShowCommentary(!showCommentary)}
            className="flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            {showCommentary ? 'Ocultar comentário do professor' : 'Ver comentário do professor e gabarito detalhado'}
          </button>

          {showCommentary && (
            <div className="mt-3 p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs md:text-sm text-slate-300 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Resposta Correta: Alternativa {question.correctAnswer}
              </div>
              <p className="leading-relaxed text-slate-300">{question.commentary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
