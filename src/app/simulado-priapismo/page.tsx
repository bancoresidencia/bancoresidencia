'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, Share2, Sparkles, Award } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Question } from '@/types';
import { SIMULADO_PRIAPISMO_QUESTIONS } from '@/data/simuladoPriapismoData';
import { QuestionCard, HighlighterColor } from '@/components/QuestionCard';
import { SimuladoPriapismoHeader, FontSize } from '@/components/simulado-priapismo/SimuladoPriapismoHeader';
import { SimuladoQrModal } from '@/components/simulado-priapismo/SimuladoQrModal';

export default function SimuladoPriapismoPage() {
  const { accentConfig, mode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [highlightColor, setHighlightColor] = useState<HighlighterColor>('yellow');
  const [isStrikethroughActive, setIsStrikethroughActive] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('/simulado-priapismo');

  // Armazena as respostas do usuário nesta sessão de simulado
  const [sessionAnswers, setSessionAnswers] = useState<
    Record<string, { letter: 'A' | 'B' | 'C' | 'D' | 'E'; isCorrect: boolean }>
  >({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  const total = SIMULADO_PRIAPISMO_QUESTIONS.length;
  const currentQuestion = SIMULADO_PRIAPISMO_QUESTIONS[currentIndex];

  const handleAnswer = (
    questionId: string,
    selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E',
    isCorrect: boolean
  ) => {
    setSessionAnswers((prev) => ({
      ...prev,
      [questionId]: { letter: selectedLetter, isCorrect }
    }));
  };

  const handleResetSession = () => {
    setSessionAnswers({});
    setCurrentIndex(0);
    setIsCompletedModalOpen(false);
  };

  const answeredCount = Object.keys(sessionAnswers).length;
  const correctCount = Object.values(sessionAnswers).filter((a) => a.isCorrect).length;

  const isDark = mode === 'dark';

  return (
    <div
      className="min-h-screen flex flex-col transition-colors selection:bg-amber-300 selection:text-black bg-[#090D14] text-[#F1F5F9] dark:bg-[#090D14] dark:text-[#F1F5F9]"
      style={{
        backgroundColor: isDark ? '#090D14' : '#F8FAFC',
        color: isDark ? '#F1F5F9' : '#0F172A'
      }}
    >
      {/* Header Sandboxed com Cronômetro, Ajustes de Fonte, Marca-Texto, Acento e QR Code */}
      <SimuladoPriapismoHeader
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        activeColor={highlightColor}
        onSelectColor={setHighlightColor}
        onClearHighlights={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('clear-all-highlights'));
            try {
              SIMULADO_PRIAPISMO_QUESTIONS.forEach((q) => {
                sessionStorage.removeItem(`hipocampus_hl_${q.id}`);
                localStorage.removeItem(`hipocampus_hl_${q.id}`);
              });
            } catch {
              // ignore
            }
          }
        }}
        onOpenQrModal={() => setIsQrModalOpen(true)}
      />

      {/* Conteúdo Principal Sandboxed (Apenas as 2 Questões) */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col justify-between">
        <div className="w-full space-y-4">
          {/* Régua Sequencial Canônica de Questões (Círculos 1 e 2) */}
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Questões:
              </span>
              <div className="flex items-center gap-2">
                {SIMULADO_PRIAPISMO_QUESTIONS.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const sessionAns = sessionAnswers[q.id];
                  const isAnsweredInSession = Boolean(sessionAns);
                  const isCorrectInSession = sessionAns?.isCorrect;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full font-sans font-black text-xs sm:text-sm flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        isCurrent
                          ? 'text-white shadow-md ring-2 ring-offset-2 ring-blue-500/40'
                          : isAnsweredInSession
                            ? isCorrectInSession
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/60'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-700/60'
                            : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      style={isCurrent ? { backgroundColor: accentConfig.primaryHex } : undefined}
                      title={`Questão ${idx + 1}${
                        isAnsweredInSession
                          ? isCorrectInSession
                            ? ' (Acertou)'
                            : ' (Errou)'
                          : ''
                      }`}
                    >
                      <span>{idx + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Respondidas: <strong className="text-slate-900 dark:text-white font-bold">{answeredCount}</strong>/{total}
            </div>
          </div>

          {/* CARD DA QUESTÃO NATIVO DA PLATAFORMA (QuestionCard Canônico) */}
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            index={currentIndex}
            total={total}
            onAnswer={handleAnswer}
            userAnswer={sessionAnswers[currentQuestion.id]?.letter}
            fontSize={fontSize}
            onChangeFontSize={setFontSize}
            activeHighlighterColor={highlightColor}
            onSelectHighlighterColor={setHighlightColor}
            isStrikethroughActive={isStrikethroughActive}
            onToggleStrikethrough={() => setIsStrikethroughActive((prev) => !prev)}
            onNextQuestion={
              currentIndex < total - 1
                ? () => {
                    setCurrentIndex((prev) => prev + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                : undefined
            }
            hidePlanBadge={true}
          />
        </div>

        {/* Barra Inferior de Navegação entre as Questões */}
        <div className="w-full mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 touch-manipulation">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => {
              setCurrentIndex((prev) => Math.max(0, prev - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs touch-manipulation bg-white dark:bg-slate-900"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold text-center tabular-nums">
            <span className="hidden xs:inline">Questão </span>
            <strong className="text-slate-900 dark:text-white font-black text-sm">{currentIndex + 1}</strong>
            <span> / </span>
            <strong className="text-slate-900 dark:text-white font-black text-sm">{total}</strong>
          </div>

          {currentIndex >= total - 1 ? (
            <button
              type="button"
              onClick={() => setIsCompletedModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[44px] rounded-2xl text-xs font-black text-white shadow-md hover:scale-102 active:scale-[0.98] transition-transform cursor-pointer touch-manipulation"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <span>Concluir Simulado</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCurrentIndex((prev) => Math.min(total - 1, prev + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[44px] rounded-2xl text-xs font-black text-white shadow-md hover:scale-102 active:scale-[0.98] transition-transform cursor-pointer touch-manipulation"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>

      {/* Modal de Conclusão / Desempenho */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200 dark:border-white/10 max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="text-center space-y-3">
              <div
                className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Simulado Concluído!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Você finalizou as 2 questões de alto rendimento sobre Urgências Penianas e Priapismo.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 flex items-center justify-around my-4">
                <div className="text-center">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                    Acertos
                  </span>
                  <span className="text-2xl font-black text-emerald-500">
                    {correctCount}/{total}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                <div className="text-center">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                    Aproveitamento
                  </span>
                  <span className="text-2xl font-black text-blue-500">
                    {Math.round((correctCount / total) * 100)}%
                  </span>
                </div>
              </div>

              <div className="text-left text-xs text-slate-600 dark:text-slate-400 space-y-1 bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl">
                <strong className="text-amber-800 dark:text-amber-400 block font-bold mb-1">
                  💡 Take-Home Message Rápida:
                </strong>
                <p>• <strong>Priapismo Isquêmico (Baixo Fluxo):</strong> emergência dolorosa, sangue escuro, acidose profunda (pH &lt; 7,25). Conduta inicial: aspiração + fenilefrina.</p>
                <p>• <strong>Priapismo Não Isquêmico (Alto Fluxo):</strong> fístula após trauma perineal, indolor, sangue arterial (pH ≥ 7,40). Conduta: observação ou embolização.</p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleResetSession}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refazer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCompletedModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  <span>Revisar Resoluções</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal do QR Code para Compartilhamento Aberto */}
      <SimuladoQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        url={shareUrl}
      />
    </div>
  );
}
