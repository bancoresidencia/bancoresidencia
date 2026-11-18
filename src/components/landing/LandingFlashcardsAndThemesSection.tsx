'use client';

import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  RotateCcw,
  Eye,
  Sun,
  Moon,
  Palette,
  Check
} from 'lucide-react';
import { useTheme, ACCENT_CONFIGS, AccentColor } from '@/context/ThemeContext';
import { useScrollReveal } from './useScrollReveal';

interface ClozeCardSample {
  id: string;
  tag: string;
  promptBefore: string;
  cloze1: string;
  promptMid: string;
  cloze2: string;
  promptAfter: string;
  pearl: string;
}

const CLOZE_SAMPLES: ClozeCardSample[] = [
  {
    id: 'cad',
    tag: 'Endocrinologia & Emergência • USP / ENARE',
    promptBefore: 'Na Cetoacidose Diabética, se o potássio sérico inicial for ',
    cloze1: '< 3,3 mEq/L',
    promptMid: ', deve-se suspender temporariamente a insulina regular e ',
    cloze2: 'repor KCl endovenoso',
    promptAfter: ' primeiro para prevenir arritmias ventriculares fatais.',
    pearl: 'Se K⁺ estiver entre 3,3 e 5,2 mEq/L, inicia-se insulina junto com 20–30 mEq de K⁺ por litro de solução.'
  },
  {
    id: 'leriche',
    tag: 'Cirurgia Vascular • ENARE / SUS-SP',
    promptBefore: 'A Síndrome de Leriche decorre da oclusão aterosclerótica da ',
    cloze1: 'bifurcação aortoilíaca',
    promptMid: ' e cursa com a tríade clássica: claudicação glútea, ',
    cloze2: 'pulsos femorais abolidos',
    promptAfter: ' e disfunção erétil.',
    pearl: 'O tratamento cirúrgico padrão em doença extensa aortoilíaca TASC D é a derivação aortobifemoral.'
  }
];

const THEME_SWATCHES: { id: AccentColor; shortName: string }[] = [
  { id: 'blue', shortName: 'Azul' },
  { id: 'green', shortName: 'Esmeralda' },
  { id: 'orange', shortName: 'Laranja' },
  { id: 'purple', shortName: 'Roxo' },
  { id: 'red', shortName: 'Carmesim' },
  { id: 'rose', shortName: 'Rosa' },
  { id: 'neutral', shortName: 'Monocromático' }
];

export const LandingFlashcardsAndThemesSection: React.FC = () => {
  const { mode, accent, accentConfig, setAccent, toggleMode } = useTheme();
  const { ref: flashRef, isVisible: flashVisible } = useScrollReveal<HTMLDivElement>(0.12);
  const { ref: themeRef, isVisible: themeVisible } = useScrollReveal<HTMLDivElement>(0.12);

  const [cardIdx, setCardIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [fsrsFeedback, setFsrsFeedback] = useState<string | null>(null);

  const currentCard = CLOZE_SAMPLES[cardIdx];

  const handleRateCard = (intervalLabel: string) => {
    setFsrsFeedback(`Revisão agendada para ${intervalLabel} • Curva FSRS atualizada`);
    setTimeout(() => {
      setFsrsFeedback(null);
    }, 3200);
  };

  const handleNextSample = () => {
    setIsRevealed(false);
    setFsrsFeedback(null);
    setCardIdx((prev) => (prev + 1) % CLOZE_SAMPLES.length);
  };

  return (
    <section
      id="flashcards"
      className="scroll-mt-20 py-18 sm:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16 sm:space-y-20">
        {/* PARTE 1: FLASHCARDS FSRS & MÉTODO CLOZE REAL */}
        <div
          ref={flashRef}
          className={`reveal-up ${
            flashVisible ? 'is-visible' : ''
          } grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center`}
        >
          {/* Coluna Esquerda: Explicação Técnica */}
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold">
              <Brain className="w-3.5 h-3.5 shrink-0" />
              <span>Repetição Espaçada FSRS + Omissão Cloze</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-[42px] font-black tracking-[-0.035em] text-zinc-950 dark:text-white leading-[1.08]">
              Consolide condutas e pontos de corte sem esquecer na véspera da prova.
            </h2>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              O hipocampo humano retém o que é ativamente evocado. Nossos flashcards usam <strong>omissão cirúrgica (Cloze)</strong> sobre os conceitos de maior recorrência das bancas e recalibram seus intervalos pelo algoritmo matemático <strong>FSRS</strong>.
            </p>

            <div className="space-y-2.5 pt-2 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Omissão cirúrgica de doses, drogas de 1ª escolha e critérios diagnósticos</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Até 30% menos revisões desnecessárias comparado ao algoritmo legado SM-2</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Suporte completo a importação de decks próprios (.apkg / CSV)</span>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Card Interativo Cloze + Agendador FSRS */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {fsrsFeedback && (
              <div className="mb-3 px-4 py-2 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold shadow-lg flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{fsrsFeedback}</span>
              </div>
            )}

            <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 shadow-xl p-5 sm:p-7 space-y-5">
              {/* Topo do Card Cloze */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  {currentCard.tag}
                </span>
                <button
                  type="button"
                  onClick={handleNextSample}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Trocar exemplo ({cardIdx + 1}/{CLOZE_SAMPLES.length})</span>
                </button>
              </div>

              {/* Corpo da Frase com Lacunas Cloze Interativas */}
              <div className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed py-2">
                <span>{currentCard.promptBefore}</span>
                <button
                  type="button"
                  onClick={() => setIsRevealed(true)}
                  className={`mx-1 px-2.5 py-0.5 rounded-lg font-extrabold transition-all cursor-pointer inline-flex items-center ${
                    isRevealed
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                      : 'border border-dashed border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  {isRevealed ? currentCard.cloze1 : '[ ... omissão 1 ... ]'}
                </button>
                <span>{currentCard.promptMid}</span>
                <button
                  type="button"
                  onClick={() => setIsRevealed(true)}
                  className={`mx-1 px-2.5 py-0.5 rounded-lg font-extrabold transition-all cursor-pointer inline-flex items-center ${
                    isRevealed
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                      : 'border border-dashed border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  {isRevealed ? currentCard.cloze2 : '[ ... omissão 2 ... ]'}
                </button>
                <span>{currentCard.promptAfter}</span>
              </div>

              {/* Ação de Revelar ou Pérola Clínica + Botões FSRS */}
              {!isRevealed ? (
                <button
                  type="button"
                  onClick={() => setIsRevealed(true)}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-95 cursor-pointer shadow-xs"
                  style={{
                    backgroundColor: accentConfig.primaryHex,
                    color: accentConfig.primaryContrastHex
                  }}
                >
                  <Eye className="w-4 h-4" />
                  <span>Revelar Lacunas Cloze</span>
                </button>
              ) : (
                <div className="space-y-4 pt-2 border-t border-zinc-200/80 dark:border-zinc-800 animate-in fade-in duration-150">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <strong className="text-zinc-950 dark:text-white font-bold">Pérola de Prova: </strong>
                    {currentCard.pearl}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-2">
                      <span>Classifique sua evocação (FSRS):</span>
                      <button
                        type="button"
                        onClick={() => setIsRevealed(false)}
                        className="underline hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                      >
                        Ocultar resposta
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Errei', interval: '1 dia', cls: 'border-rose-300 dark:border-rose-900/70 bg-rose-50 dark:bg-rose-950/35 text-rose-700 dark:text-rose-300' },
                        { label: 'Difícil', interval: '4 dias', cls: 'border-amber-300 dark:border-amber-900/70 bg-amber-50 dark:bg-amber-950/35 text-amber-800 dark:text-amber-300' },
                        { label: 'Bom', interval: '9 dias', cls: 'border-sky-300 dark:border-sky-900/70 bg-sky-50 dark:bg-sky-950/35 text-sky-800 dark:text-sky-300' },
                        { label: 'Fácil', interval: '21 dias', cls: 'border-emerald-300 dark:border-emerald-900/70 bg-emerald-50 dark:bg-emerald-950/35 text-emerald-800 dark:text-emerald-300' }
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => handleRateCard(btn.interval)}
                          className={`py-2 px-1 rounded-xl border text-center transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${btn.cls}`}
                        >
                          <div className="text-xs font-extrabold leading-tight">{btn.label}</div>
                          <div className="text-[11px] font-semibold opacity-90 tabular-nums">{btn.interval}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PARTE 2: FAIXA INTERATIVA "NO SEU FOCO CROMÁTICO" (Inspiração SquadEasy With Your Colours) */}
        <div
          ref={themeRef}
          className={`reveal-up ${
            themeVisible ? 'is-visible' : ''
          } rounded-2xl p-6 sm:p-8 bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 shadow-xs`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                <Palette className="w-3.5 h-3.5 shrink-0" />
                <span>Ergonomia Visual para Longas Jornadas</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                O Hippocampus adapta-se ao seu foco cromático — teste ao vivo agora.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Modo escuro neutro verdadeiro (<code className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">#09090b</code> sem tom azulado para preservar fidelidade de RX/TC e reduzir fadiga ocular) combinado a 7 temas dinâmicos.
              </p>
            </div>

            {/* Controles Ao Vivo das 7 Cores + Modo Claro/Escuro */}
            <div className="flex flex-wrap items-center gap-2">
              {THEME_SWATCHES.map((item) => {
                const isSelected = accent === item.id;
                const swatchHex =
                  item.id === 'neutral' && mode === 'dark'
                    ? '#ffffff'
                    : ACCENT_CONFIGS[item.id].primaryHex;
                const checkColor =
                  item.id === 'neutral' && mode === 'dark' ? '#09090b' : '#ffffff';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAccent(item.id)}
                    aria-label={`Testar tema ${item.shortName}`}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-900 dark:border-zinc-200 text-zinc-950 dark:text-white shadow-2xs'
                        : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center border border-black/10 dark:border-white/20 shrink-0"
                      style={{ backgroundColor: swatchHex }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" style={{ color: checkColor }} />}
                    </span>
                    <span>{item.shortName}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={toggleMode}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {mode === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Modo Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Modo Escuro</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
