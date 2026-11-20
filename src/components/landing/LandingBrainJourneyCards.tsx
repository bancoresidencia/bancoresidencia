import { ArrowRight, Brain, GitBranch, Sparkles } from 'lucide-react';

const journeyCards = [
  {
    id: 'cortex-pfc',
    structure: 'Córtex pré-frontal',
    icon: Brain,
    frameStyle: 'rounded-2xl rounded-tr-md border-t-2 border-t-zinc-400 shadow-[0_20px_45px_rgba(15,23,42,0.10)] dark:border-t-zinc-500 dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)]',
    phases: [
      {
        title: 'Relacione o que você estuda.',
        highlight: 'estuda.',
        description: 'O córtex pré-frontal ajuda a manter informações na memória de trabalho enquanto você compara ideias, como ao ligar os sintomas de uma doença ao seu mecanismo.'
      },
      {
        title: 'Mas o que vale conectar?',
        highlight: 'conectar?',
        description: 'Se o resumo dá o mesmo peso a tudo, fica difícil perceber quais relações a banca espera que você faça.'
      },
      {
        title: 'Resumos direcionados à prova.',
        highlight: 'à prova.',
        description: 'Nossos resumos destacam os pontos-chave e ligam os mecanismos às manifestações clínicas. Assim, você sabe em quais relações concentrar a atenção durante a leitura.'
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
        title: 'A memória envolve uma rede.',
        highlight: 'uma rede.',
        description: 'Pelo fórnix, o hipocampo se conecta aos corpos mamilares. O circuito segue pelo tálamo anterior e pelo giro do cíngulo, em uma rede que participa da memória.'
      },
      {
        title: 'Mas o que você lembra dias depois?',
        highlight: 'dias depois?',
        description: 'Reler pode dar uma sensação de familiaridade. Você ainda consegue lembrar, sem consultar, o ponto que a banca costuma cobrar?'
      },
      {
        title: 'Flashcards sobre o que mais cai.',
        highlight: 'o que mais cai.',
        description: 'Nossos flashcards retomam os pontos-chave dos temas que você estuda, com foco no que mais cai. Tente lembrar antes de revelar a resposta. O FSRS ajusta a próxima revisão conforme sua avaliação.'
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
        title: 'Aqui começa a consolidação.',
        highlight: 'a consolidação.',
        description: 'O hipocampo tem papel central na consolidação inicial de novas memórias. Ele ajuda a ligar informações e contexto enquanto a memória começa a se estabilizar em interação com redes do córtex.'
      },
      {
        title: 'Mas e quando o caso muda?',
        highlight: 'o caso muda?',
        description: 'Na prova, você precisa recuperar o conceito em um enunciado novo, identificar a pista decisiva e distinguir alternativas que parecem plausíveis.'
      },
      {
        title: 'Mais de 200 mil questões no acervo',
        highlight: '200 mil questões no acervo',
        description: 'Aplique o conteúdo em casos variados, com questões de provas oficiais como ENARE, USP-SP e Unicamp. Após responder, veja um comentário objetivo sobre a pista decisiva, por que a correta se sustenta e onde cada distrator falha.'
      }
    ]
  }
];

// Keep the scene boundaries aligned with the existing 3D choreography.
// The last scene holds the anatomy in view before revealing the question bank.
const phaseStarts = [0.15, 0.26, 0.34, 0.42, 0.53, 0.60, 0.68, 0.81, 0.89];
const phasesPerScene = 3;

export function getBrainJourneyFrame(progress: number): number {
  return phaseStarts.findLastIndex((start) => progress >= start);
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
