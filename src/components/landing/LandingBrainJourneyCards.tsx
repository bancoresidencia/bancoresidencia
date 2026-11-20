import { ArrowRight } from 'lucide-react';

const journeyCards = [
  {
    id: 'cortex-pfc',
    structure: 'Córtex pré-frontal',
    phases: [
      {
        title: 'Relacione o que você estuda.',
        description: 'O córtex pré-frontal ajuda a manter informações na memória de trabalho enquanto você compara ideias, como ao ligar os sintomas de uma doença ao seu mecanismo.'
      },
      {
        title: 'Mas o que vale conectar?',
        description: 'Se o resumo dá o mesmo peso a tudo, fica difícil perceber quais relações a banca espera que você faça.'
      },
      {
        title: 'Resumos direcionados à prova.',
        description: 'Nossos resumos destacam os pontos-chave e ligam os mecanismos às manifestações clínicas. Assim, você sabe em quais relações concentrar a atenção durante a leitura.'
      }
    ]
  },
  {
    id: 'papez',
    structure: 'Circuito de Papez',
    phases: [
      {
        title: 'A memória envolve uma rede.',
        description: 'Pelo fórnix, o hipocampo se conecta aos corpos mamilares. O circuito segue pelo tálamo anterior e pelo giro do cíngulo, em uma rede que participa da memória.'
      },
      {
        title: 'Mas o que você lembra dias depois?',
        description: 'Reler pode dar uma sensação de familiaridade. Você ainda consegue lembrar, sem consultar, o ponto que a banca costuma cobrar?'
      },
      {
        title: 'Flashcards sobre o que mais cai.',
        description: 'Nossos flashcards retomam os pontos-chave dos temas que você estuda, com foco no que mais cai. Tente lembrar antes de revelar a resposta. O FSRS ajusta a próxima revisão conforme sua avaliação.'
      }
    ]
  },
  {
    id: 'hippocampus',
    structure: 'Hipocampo',
    phases: [
      {
        title: 'Aqui começa a consolidação.',
        description: 'O hipocampo tem papel central na consolidação inicial de novas memórias. Ele ajuda a ligar informações e contexto enquanto a memória começa a se estabilizar em interação com redes do córtex.'
      },
      {
        title: 'Mas e quando o caso muda?',
        description: 'Na prova, você precisa recuperar o conceito em um enunciado novo, identificar a pista decisiva e distinguir alternativas que parecem plausíveis.'
      },
      {
        title: 'Mais de 200 mil questões no acervo',
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

  return journeyCards.map(({ id, structure, phases }, sceneIndex) => {
    const isActive = activeScene === sceneIndex;
    const isFinal = sceneIndex === journeyCards.length - 1;

    return (
      <article
        key={id}
        data-journey-scene={id}
        aria-hidden={!isActive}
        inert={!isActive}
        className={`col-start-1 row-start-1 min-w-0 text-left transition-opacity duration-300 motion-reduce:transition-none ${
          isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600 sm:mb-3 sm:text-sm dark:text-zinc-300">
          {structure}
        </h3>
        <div className="grid">
          {phases.map(({ title, description }, phaseIndex) => {
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
                <h4 className="text-balance text-[clamp(1.25rem,3.6vw,2.5rem)] font-semibold leading-tight tracking-tight text-zinc-950 dark:text-white">
                  {title}
                </h4>
                <p className="mt-2 max-w-prose text-sm leading-snug text-zinc-700 sm:mt-3 sm:text-base lg:leading-relaxed dark:text-zinc-300">
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
