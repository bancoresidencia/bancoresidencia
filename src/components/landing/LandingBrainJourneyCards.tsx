import { ArrowRight, Brain, GitBranch, Sparkles } from 'lucide-react';

const journeyCards = [
  {
    id: 'cortex-pfc',
    structure: 'Córtex pré-frontal',
    icon: Brain,
    frameStyle: 'rounded-2xl rounded-tr-md border-t-2 border-t-zinc-400 shadow-[0_20px_45px_rgba(15,23,42,0.10)] dark:border-t-zinc-500 dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)]',
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
    frameStyle: 'rounded-[28px] shadow-[0_22px_55px_rgba(15,23,42,0.08)] sm:rounded-[36px] dark:shadow-[0_26px_55px_rgba(0,0,0,0.70)]',
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
    frameStyle: 'rounded-2xl border-2',
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

// Platôs de travamento deliberado (Opção 1):
// Cada momento (Tese, Antítese, Síntese) possui um platô amplo de leitura sustentada.
// Entre as cenas (Córtex -> Papez -> Hipocampo), aplicamos zonas de escape com histerese
// para que o estudante leia com conforto absoluto sem pular texto por aceleração acidental.
const phaseStarts = [0.06, 0.15, 0.23, 0.42, 0.51, 0.59, 0.76, 0.83, 0.90];
const phasesPerScene = 3;

export function getBrainJourneyFrame(progress: number, prevFrame = 0): number {
  const HYSTERESIS = 0.015;
  let calculated = 0;
  for (let i = phaseStarts.length - 1; i >= 0; i--) {
    const threshold = i > prevFrame ? phaseStarts[i] + HYSTERESIS : phaseStarts[i] - HYSTERESIS;
    if (progress >= threshold) {
      calculated = i;
      break;
    }
  }
  return calculated;
}

interface LandingBrainJourneyCardsProps {
  frame: number;
}

export function LandingBrainJourneyCards({ frame }: LandingBrainJourneyCardsProps) {
  const activeScene = Math.floor(frame / phasesPerScene);
  const activePhase = frame % phasesPerScene;

  return journeyCards.map(({ id, structure, icon: Icon, frameStyle, phases }, sceneIndex) => {
    const isActive = activeScene === sceneIndex;
    const isFinal = sceneIndex === journeyCards.length - 1;

    return (
      <article
        key={id}
        data-journey-scene={id}
        aria-hidden={!isActive}
        inert={!isActive}
        style={isFinal ? { borderColor: 'var(--journey-final-line)', boxShadow: 'var(--journey-final-shadow)' } : undefined}
        className={`relative col-start-1 row-start-1 min-w-0 border border-zinc-200/90 bg-white/88 p-4 text-left backdrop-blur-xl transition-[opacity,translate,scale] duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-none sm:p-6 lg:p-7 dark:border-zinc-800/90 dark:bg-zinc-900/84 ${frameStyle} ${
          isActive
            ? 'z-10 translate-y-0 scale-100 opacity-100'
            : `pointer-events-none scale-[0.98] opacity-0 ${sceneIndex < activeScene ? '-translate-y-6' : 'translate-y-6'}`
        }`}
      >
        {isFinal && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-0.5 rounded-full bg-linear-to-r from-transparent via-[color:var(--journey-accent)] to-transparent" />
        )}
        <div className="mb-3 flex items-center justify-between gap-3 sm:mb-3.5">
          <h3 className="flex min-w-0 items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-[color:var(--journey-accent)] uppercase sm:text-[11px]">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-100/80 dark:border-zinc-700/70 dark:bg-zinc-800/80">
              <Icon aria-hidden="true" className="size-3.5" />
            </span>
            {structure}
          </h3>
          <div aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
            {journeyCards.map((card, index) => (
              <span
                key={card.id}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-500 motion-reduce:transition-none ${
                  index === sceneIndex ? 'w-5 bg-[color:var(--journey-accent)]' : 'w-1.5 bg-zinc-300 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="grid">
          {phases.map(({ title, highlight, description }, phaseIndex) => {
            const isCurrent = isActive && activePhase === phaseIndex;
            const showsQuestion = isFinal && phaseIndex === phasesPerScene - 1;

            return (
              <div
                key={title}
                data-journey-phase={phaseIndex}
                aria-hidden={!isCurrent}
                inert={!isCurrent}
                className={`col-start-1 row-start-1 min-w-0 transition-[opacity,translate] duration-300 ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
                  isCurrent ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0'
                }`}
              >
                <h4 className="text-lg leading-snug font-black tracking-[-0.025em] sm:text-xl lg:text-[23px]">
                  <span className="font-bold text-zinc-900/80 dark:text-white/85">{title.slice(0, -highlight.length)}</span>
                  <span className={`bg-[image:var(--journey-text-gradient)] bg-clip-text text-transparent ${isCurrent ? 'animate-hippo-text-sweep' : ''}`}>
                    {highlight}
                  </span>
                </h4>
                <p className="mt-2.5 max-w-prose text-xs leading-relaxed text-zinc-600 sm:text-[13.5px] dark:text-zinc-300">
                  {description}
                </p>
                {showsQuestion && (
                  <a
                    href="#questoes"
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-100 focus-visible:outline-offset-4 sm:mt-5 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                  >
                    Testar uma questão oficial
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </article>
    );
  });
}
