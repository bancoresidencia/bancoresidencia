'use client';

import React, { memo } from 'react';
import {
  ArrowRight,
  Brain,
  GitBranch,
  Sparkles,
  LucideIcon
} from 'lucide-react';

export interface LandingUnifiedBrainCardProps {
  frame: number;
  onOpenAuth?: (mode?: 'login' | 'register', planTitle?: string) => void;
  onScrollToSection?: (sectionId: string) => void;
}

interface JourneyPhase {
  title: string;
  highlight: string;
  description: string;
}

interface JourneyScene {
  id: string;
  structure: string;
  icon: LucideIcon;
  phases: [JourneyPhase, JourneyPhase, JourneyPhase];
}

export const ANATOMICAL_SCENES: JourneyScene[] = [
  {
    id: 'cortex-pfc',
    structure: 'Córtex pré-frontal',
    icon: Brain,
    phases: [
      {
        title: 'A memória executiva.',
        highlight: 'executiva.',
        description:
          'O córtex pré-frontal sustenta a memória de trabalho, cruzando hipóteses diagnósticas com seus manejos, condutas e manifestações clínicas.'
      },
      {
        title: 'Contudo, o que vale conectar?',
        highlight: 'conectar?',
        description:
          'Resumos prolixos sobrecarregam essa memória executiva: sem hierarquia clara, você dispersa energia e não enxerga a pista decisiva da questão.'
      },
      {
        title: 'Resumos direcionados à prova.',
        highlight: 'à prova.',
        description:
          'Por isso, nossos resumos organizam a carga cognitiva: destacam conceitos-chave de alta recorrência e ligam a patologia diretamente à conduta cobrada pelas bancas.'
      }
    ]
  },
  {
    id: 'papez',
    structure: 'Circuito de Papez',
    icon: GitBranch,
    phases: [
      {
        title: 'A rede de reverberação.',
        highlight: 'reverberação.',
        description:
          'Do hipocampo ao giro do cíngulo, o Circuito de Papez reconsolida memórias por meio de reativação sináptica periódica.'
      },
      {
        title: 'No entanto, o que você lembra depois?',
        highlight: 'lembra depois?',
        description:
          'Reler grifos passivos gera apenas falsa sensação de domínio: sem resgate ativo, o circuito não reverbera e a memória se dissipa antes da prova.'
      },
      {
        title: 'Flashcards guiados pelo FSRS.',
        highlight: 'pelo FSRS.',
        description:
          'Por conta disso, nossos flashcards focam no que mais cai em prova, forçando a recuperação ativa no momento crítico da curva de esquecimento com o FSRS (Free Spaced Repetition Scheduler).'
      }
    ]
  },
  {
    id: 'hippocampus',
    structure: 'Hipocampo',
    icon: Sparkles,
    phases: [
      {
        title: 'A estrela da consolidação.',
        highlight: 'da consolidação.',
        description:
          'O hipocampo indexa novos contextos e transfere o aprendizado para o neocórtex, permitindo reconhecer padrões em casos inéditos.'
      },
      {
        title: 'Todavia, e quando o caso muda?',
        highlight: 'o caso muda?',
        description:
          'Memorizar regras isoladas falha sob pressão: diante de um caso com muitos distratores, a lembrança não se transfere para a resposta certa.'
      },
      {
        title: '+200 mil questões com gabaritos comentados.',
        highlight: 'gabaritos comentados.',
        description:
          'Logo, resolver questões das mais diversas bancas permite dominar múltiplos padrões de prova. Nossos gabaritos comentados dissecam cada distrator e fundamentam a conduta correta.'
      }
    ]
  }
];

/**
 * Card Lateral Flutuante Inspirado no Estilo MedEvo:
 * - Aparece exclusivamente durante a Síntese (Momento 2).
 * - Não contém texto corrido: apresenta exclusivamente a ESTRUTURA abstrata / wireframe da ferramenta.
 * - Posicionado no canto inferior direito do card com leve rotação 3D e acabamento translúcido.
 */
function LateralWireframeCard({ sceneIndex, isVisible }: { sceneIndex: number; isVisible: boolean }) {
  return (
    <aside
      aria-hidden="true"
      className={`hidden md:block absolute -bottom-5 -right-4 sm:-bottom-7 sm:-right-6 w-[205px] xl:w-[225px] select-none pointer-events-none transition-all duration-500 ease-out z-30 ${
        isVisible
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
      }`}
    >
      {/* CENÁRIO 0: ESTRUTURA DE RESUMO OFICIAL (CÓRTEX) */}
      {sceneIndex === 0 && (
        <div
          style={{
            borderColor: 'color-mix(in srgb, var(--journey-accent) 35%, transparent)',
            boxShadow: '0 20px 45px -8px color-mix(in srgb, var(--journey-accent) 22%, transparent)'
          }}
          className="relative rounded-2xl p-3.5 bg-white/94 dark:bg-zinc-950/92 backdrop-blur-xl border rotate-[-3deg] transform-gpu"
        >
          {/* Header estrutural */}
          <div className="flex items-center gap-2 mb-2.5">
            <span
              style={{ backgroundColor: 'color-mix(in srgb, var(--journey-accent) 40%, transparent)' }}
              className="size-3.5 rounded-md shrink-0"
            />
            <div className="h-2 w-16 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <div
              style={{
                backgroundColor: 'color-mix(in srgb, var(--journey-accent) 18%, transparent)',
                borderColor: 'color-mix(in srgb, var(--journey-accent) 35%, transparent)'
              }}
              className="h-2.5 w-8 ml-auto rounded-full border"
            />
          </div>
          {/* Corpo skeleton de texto */}
          <div className="space-y-1.5 mb-2.5">
            <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-1.5 w-5/6 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-1.5 w-4/6 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
          {/* Box comparativo estrutural (Tabela Clínica) */}
          <div
            style={{
              borderColor: 'color-mix(in srgb, var(--journey-accent) 25%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--journey-accent) 6%, transparent)'
            }}
            className="rounded-lg border p-2 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div
                style={{ backgroundColor: 'color-mix(in srgb, var(--journey-accent) 45%, transparent)' }}
                className="h-1.5 w-10 rounded-full"
              />
              <div
                style={{ backgroundColor: 'color-mix(in srgb, var(--journey-accent) 30%, transparent)' }}
                className="h-1.5 w-8 rounded-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="h-3.5 rounded bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60" />
              <div className="h-3.5 rounded bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60" />
            </div>
          </div>
        </div>
      )}

      {/* CENÁRIO 1: DOIS CARDS SOBREPOSTOS DE FLASHCARD FSRS (PAPEZ) */}
      {sceneIndex === 1 && (
        <div className="relative transform-gpu">
          {/* Card de trás inclinado */}
          <div
            style={{
              backgroundColor: 'color-mix(in srgb, var(--journey-accent) 14%, transparent)',
              borderColor: 'color-mix(in srgb, var(--journey-accent) 30%, transparent)'
            }}
            className="absolute inset-0 rounded-2xl border rotate-[-8deg] -top-2 -left-2"
          />
          {/* Card frontal */}
          <div
            style={{
              borderColor: 'color-mix(in srgb, var(--journey-accent) 35%, transparent)',
              boxShadow: '0 20px 45px -8px color-mix(in srgb, var(--journey-accent) 22%, transparent)'
            }}
            className="relative rounded-2xl p-3.5 bg-white/94 dark:bg-zinc-950/92 backdrop-blur-xl border rotate-[-2deg]"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--journey-accent) 20%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--journey-accent) 35%, transparent)'
                }}
                className="h-2.5 w-12 rounded-full border"
              />
              <span
                style={{ backgroundColor: 'var(--journey-accent)' }}
                className="size-2 rounded-full animate-pulse"
              />
            </div>
            {/* Esqueleto da pergunta do flashcard */}
            <div className="space-y-1.5 my-3.5 text-center">
              <div className="h-2 w-4/5 mx-auto rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <div className="h-2 w-3/5 mx-auto rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
            {/* 4 Pílulas FSRS na base */}
            <div className="flex items-center gap-1 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div className="h-3 flex-1 rounded-md bg-rose-500/20 border border-rose-500/30" />
              <div className="h-3 flex-1 rounded-md bg-amber-500/20 border border-amber-500/30" />
              <div className="h-3 flex-1 rounded-md bg-sky-500/20 border border-sky-500/30" />
              <div className="h-3 flex-1 rounded-md bg-emerald-500/20 border border-emerald-500/30" />
            </div>
          </div>
        </div>
      )}

      {/* CENÁRIO 2: ESTRUTURA DE QUESTÃO OFICIAL COM TRI (HIPOCAMPO) */}
      {sceneIndex === 2 && (
        <div
          style={{
            borderColor: 'color-mix(in srgb, var(--journey-accent) 38%, transparent)',
            boxShadow: '0 20px 45px -8px color-mix(in srgb, var(--journey-accent) 24%, transparent)'
          }}
          className="relative rounded-2xl p-3.5 bg-white/94 dark:bg-zinc-950/92 backdrop-blur-xl border rotate-[-3deg] transform-gpu"
        >
          {/* Header com tag de exame e escore TRI */}
          <div className="flex items-center justify-between mb-2.5">
            <div
              style={{
                backgroundColor: 'color-mix(in srgb, var(--journey-accent) 20%, transparent)',
                borderColor: 'color-mix(in srgb, var(--journey-accent) 35%, transparent)'
              }}
              className="h-3 w-14 rounded-full border"
            />
            <div className="h-2.5 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
          {/* Enunciado da questão */}
          <div className="space-y-1.5 mb-2.5">
            <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-1.5 w-5/6 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
          {/* Alternativas com gabarito assinalado */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 p-1 rounded-md border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
              <span className="size-1.5 rounded-full border border-zinc-400 dark:border-zinc-600 shrink-0" />
              <div className="h-1.5 w-3/4 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>
            {/* Alternativa Correta com destaque do tema */}
            <div
              style={{
                borderColor: 'color-mix(in srgb, var(--journey-accent) 45%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--journey-accent) 12%, transparent)'
              }}
              className="flex items-center gap-1.5 p-1 rounded-md border"
            >
              <span
                style={{ backgroundColor: 'var(--journey-accent)' }}
                className="size-1.5 rounded-full shrink-0"
              />
              <div
                style={{ backgroundColor: 'color-mix(in srgb, var(--journey-accent) 75%, transparent)' }}
                className="h-1.5 w-4/5 rounded-full"
              />
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-md border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
              <span className="size-1.5 rounded-full border border-zinc-400 dark:border-zinc-600 shrink-0" />
              <div className="h-1.5 w-2/3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export const LandingUnifiedBrainCard = memo(function LandingUnifiedBrainCard({
  frame,
  onOpenAuth,
  onScrollToSection
}: LandingUnifiedBrainCardProps) {
  // Clamping seguro de 0 a 8
  const clampedFrame = Math.max(0, Math.min(8, frame));
  const activeSceneIdx = Math.floor(clampedFrame / 3);
  const activePhaseIdx = clampedFrame % 3;

  const currentScene = ANATOMICAL_SCENES[activeSceneIdx] ?? ANATOMICAL_SCENES[0];

  const isAntithesisVisible = activePhaseIdx >= 1;
  const isSynthesisVisible = activePhaseIdx >= 2;
  const isFinalScene = activeSceneIdx === 2;

  // Fases da cena ativa
  const [phase1, phase2, phase3] = currentScene.phases;

  return (
    <div className="relative w-full max-w-xl lg:w-[440px] xl:w-[475px]">
      {/* =========================================================================
          1. CARD LATERAL FLUTUANTE (MEDEVO STYLE: ESTRUTURA VISUAL SEM TEXTO)
             Aparece exclusivamente durante a Síntese (Momento 2)
      ========================================================================= */}
      <LateralWireframeCard sceneIndex={activeSceneIdx} isVisible={isSynthesisVisible} />

      {/* =========================================================================
          2. CARD PRINCIPAL DA JORNADA
             MOMENTO 1: Tese + Antítese (visíveis)
             MOMENTO 2: Tese e Antítese esvaecem suavemente e dão lugar à Síntese
      ========================================================================= */}
      <article
        key={currentScene.id}
        aria-label={`Estrutura Neuroanatômica: ${currentScene.structure}`}
        className="relative overflow-hidden w-full rounded-3xl border p-5 sm:p-6 lg:p-7 text-left select-none transition-all duration-300 transform-gpu will-change-[transform,opacity] contain-paint border-zinc-200/90 dark:border-zinc-800/90 bg-white/94 dark:bg-zinc-950/94 backdrop-blur-md shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)]"
      >
        {/* Friso luminoso sutil no topo (Laser Rim Highlight) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-0.5 rounded-full transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--journey-accent), transparent)',
            opacity: 0.65
          }}
        />

        {/* Cabeçalho com Abas Anatômicas (Opção A sem numeração) */}
        <div className="mb-4 flex items-stretch gap-1.5 border-b border-zinc-200/70 pb-3 dark:border-zinc-800/70">
          {ANATOMICAL_SCENES.map((scene, idx) => {
            const isActive = idx === activeSceneIdx;
            return (
              <div
                key={scene.id}
                className={`flex-1 py-1 px-1.5 sm:px-2 rounded-xl transition-all duration-300 flex flex-col justify-between ${
                  isActive
                    ? 'bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs'
                    : 'opacity-40 hover:opacity-65'
                }`}
              >
                <div className="flex items-center justify-center min-w-0">
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold tracking-tight truncate whitespace-nowrap ${
                      isActive
                        ? 'text-zinc-950 dark:text-zinc-100'
                        : 'text-zinc-500 dark:text-zinc-400 font-medium'
                    }`}
                  >
                    {scene.structure}
                  </span>
                </div>
                {/* Linha luminosa de acento no rodapé da aba ativa */}
                <div
                  className={`mt-1.5 h-0.5 w-full rounded-full transition-all duration-300 ${
                    isActive ? 'bg-[color:var(--journey-accent)] opacity-100' : 'bg-transparent opacity-0'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            TRANSIÇÃO DO CONTEÚDO:
            MOMENTO 1: Tese + Antítese abaixo
            MOMENTO 2: Síntese da ferramenta com botão contextual
        ========================================================================= */}
        <div className="relative min-h-[175px] sm:min-h-[195px]">
          {/* MOMENTO 1: TESE + ANTÍTESE */}
          {!isSynthesisVisible && (
            <div className="space-y-3.5 animate-in fade-in duration-300">
              {/* 1. Tese: base anatômica */}
              <div
                className={`transition-opacity duration-300 ${
                  isAntithesisVisible ? 'opacity-80 dark:opacity-85' : 'opacity-100'
                }`}
              >
                <h4 className="text-sm sm:text-[15px] font-bold text-zinc-950 dark:text-zinc-100 leading-snug">
                  {phase1.title.slice(0, -phase1.highlight.length)}
                  <span className="bg-[image:var(--journey-text-gradient)] bg-clip-text text-transparent font-black">
                    {phase1.highlight}
                  </span>
                </h4>
                <p className="mt-1 text-xs sm:text-[12.5px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {phase1.description}
                </p>
              </div>

              {/* 2. Antítese: surge logo abaixo da tese */}
              {isAntithesisVisible && (
                <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 animate-in fade-in slide-in-from-top-1 duration-300">
                  <h4 className="text-sm sm:text-[15px] font-bold text-zinc-950 dark:text-zinc-100 leading-snug">
                    {phase2.title.slice(0, -phase2.highlight.length)}
                    <span className="bg-[image:var(--journey-text-gradient)] bg-clip-text text-transparent font-black">
                      {phase2.highlight}
                    </span>
                  </h4>
                  <p className="mt-1 text-xs sm:text-[12.5px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {phase2.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* MOMENTO 2: SÍNTESE & FERRAMENTA DA PLATAFORMA */}
          {isSynthesisVisible && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h4 className="text-base sm:text-lg font-black text-zinc-950 dark:text-zinc-100 leading-snug">
                  {phase3.title.slice(0, -phase3.highlight.length)}
                  <span className="bg-[image:var(--journey-text-gradient)] bg-clip-text text-transparent">
                    {phase3.highlight}
                  </span>
                </h4>
                <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300 max-w-[85%]">
                  {phase3.description}
                </p>
              </div>

              {/* BOTÃO CONTEXTUAL DE AÇÃO NO CANTO INFERIOR ESQUERDO */}
              <div className="mt-4 pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex flex-wrap items-center gap-2">
                {activeSceneIdx === 0 && (
                  <a
                    href="#resumos"
                    onClick={(e) => {
                      e.preventDefault();
                      onScrollToSection?.('resumos');
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--journey-accent)] px-3.5 py-2 text-xs sm:text-[12.5px] font-bold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Ver Resumo Clínico
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </a>
                )}

                {activeSceneIdx === 1 && (
                  <a
                    href="#flashcards"
                    onClick={(e) => {
                      e.preventDefault();
                      onScrollToSection?.('flashcards');
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--journey-accent)] px-3.5 py-2 text-xs sm:text-[12.5px] font-bold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Praticar Flashcards FSRS
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </a>
                )}

                {activeSceneIdx === 2 && (
                  <a
                    href="#questoes"
                    onClick={(e) => {
                      e.preventDefault();
                      onScrollToSection?.('questoes');
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--journey-accent)] px-3.5 py-2 text-xs sm:text-[12.5px] font-bold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Testar uma questão oficial
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
});
