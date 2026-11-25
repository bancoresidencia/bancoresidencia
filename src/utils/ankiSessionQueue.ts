import {
  CustomStudyLaunchOptions,
  FlashcardItem,
  FlashcardProgress,
  FlashcardRating,
  FlashcardSchedulerSettings
} from '@/types/flashcards';
import { resolveEffectiveSchedulerSettings } from './ankiScheduler';

export type AnkiQueueBucket = 'new' | 'learning' | 'review';

export interface LearningQueueEntry {
  card: FlashcardItem;
  dueAtMs: number;
}

export interface QueueHistorySnapshot {
  card: FlashcardItem;
  bucket: AnkiQueueBucket;
}

export interface AnkiSessionQueueState {
  learningQueue: LearningQueueEntry[];
  reviewQueue: FlashcardItem[];
  newQueue: FlashcardItem[];
  currentCard: FlashcardItem | null;
  currentBucket: AnkiQueueBucket | null;
  isCurrentLearnAhead: boolean;
  waitingForDueAtMs: number | null;
  isCompleted: boolean;
  totalInitialDue: number;
  completedCount: number;
  mixCounter: number;
  backStack: QueueHistorySnapshot[];
}

export interface BuildQueueOptions {
  filterDueOnly?: boolean;
  applyDailyLimits?: boolean;
  shuffled?: boolean;
  dailyNewUsed?: number;
  dailyReviewUsed?: number;
}

function shuffleList<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function insertSortedLearning(
  queue: LearningQueueEntry[],
  entry: LearningQueueEntry
): LearningQueueEntry[] {
  const filtered = queue.filter((q) => q.card.id !== entry.card.id);
  const next = [...filtered, entry];
  next.sort((a, b) => a.dueAtMs - b.dueAtMs);
  return next;
}

function getEndOfOperationalDayMs(now: Date): number {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}

/**
 * Conta quantos cartões novos e de revisão já foram estudados hoje (para limites diários).
 */
export function countTodayStudiedCards(
  cards: FlashcardItem[],
  now: Date = new Date()
): { newUsedToday: number; reviewsUsedToday: number } {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startMs = startOfDay.getTime();

  let newUsedToday = 0;
  let reviewsUsedToday = 0;

  for (const card of cards) {
    const p = card.progress;
    if (!p || !p.lastReviewDate) continue;
    const reviewedMs = Date.parse(p.lastReviewDate);
    if (!Number.isFinite(reviewedMs) || reviewedMs < startMs) continue;

    if (p.repetitions <= 1 && (p.state === 'learning' || p.state === 'review')) {
      newUsedToday += 1;
    } else if (p.state === 'review' || p.state === 'relearning') {
      reviewsUsedToday += 1;
    }
  }

  return { newUsedToday, reviewsUsedToday };
}

/**
 * Seleciona o próximo cartão seguindo rigorosamente a prioridade temporal do Anki:
 * 1. Cartões em learning/relearning com dueAtMs <= now (menor timestamp primeiro)
 * 2. Review / New conforme queueOrder ('mix' | 'reviews_first' | 'new_first')
 * 3. Learn-Ahead Limit caso reviewQueue e newQueue estejam vazias
 * 4. Estado de espera cronometrada se houver learning futuro além do Learn-Ahead
 */
export function pickNextCardFromQueue(
  state: AnkiSessionQueueState,
  now: Date = new Date(),
  rawSettings?: Partial<FlashcardSchedulerSettings> | null
): AnkiSessionQueueState {
  const settings = resolveEffectiveSchedulerSettings(rawSettings);
  const nowMs = now.getTime();
  const learnAheadMs = Math.max(0, settings.learnAheadMinutes) * 60 * 1000;

  // 1. Aprendizado vencido tem prioridade absoluta
  if (state.learningQueue.length > 0 && state.learningQueue[0].dueAtMs <= nowMs) {
    const [nextEntry, ...restLearning] = state.learningQueue;
    return {
      ...state,
      learningQueue: restLearning,
      currentCard: nextEntry.card,
      currentBucket: 'learning',
      isCurrentLearnAhead: false,
      waitingForDueAtMs: null,
      isCompleted: false
    };
  }

  const hasReview = state.reviewQueue.length > 0;
  const hasNew = state.newQueue.length > 0;

  // 2. Seleciona entre Review e New conforme configuração
  if (hasReview || hasNew) {
    let pickReview = false;

    if (settings.queueOrder === 'reviews_first') {
      pickReview = hasReview;
    } else if (settings.queueOrder === 'new_first') {
      pickReview = !hasNew && hasReview;
    } else {
      // 'mix': intercala proporcionalmente estilo Anki
      if (hasReview && hasNew) {
        const total = state.reviewQueue.length + state.newQueue.length;
        const reviewRatio = state.reviewQueue.length / total;
        const stepPos = (state.mixCounter % 10) / 10;
        pickReview = stepPos < reviewRatio;
      } else {
        pickReview = hasReview;
      }
    }

    if (pickReview && hasReview) {
      const [nextReview, ...restReview] = state.reviewQueue;
      return {
        ...state,
        reviewQueue: restReview,
        currentCard: nextReview,
        currentBucket: 'review',
        isCurrentLearnAhead: false,
        waitingForDueAtMs: null,
        isCompleted: false,
        mixCounter: state.mixCounter + 1
      };
    }

    if (hasNew) {
      const [nextNew, ...restNew] = state.newQueue;
      return {
        ...state,
        newQueue: restNew,
        currentCard: nextNew,
        currentBucket: 'new',
        isCurrentLearnAhead: false,
        waitingForDueAtMs: null,
        isCompleted: false,
        mixCounter: state.mixCounter + 1
      };
    }
  }

  // 3. Apenas cartões em aprendizagem restantes: verifica Learn-Ahead Limit
  if (state.learningQueue.length > 0) {
    const nextLearning = state.learningQueue[0];
    const msUntilDue = nextLearning.dueAtMs - nowMs;

    if (msUntilDue <= learnAheadMs) {
      const [, ...restLearning] = state.learningQueue;
      return {
        ...state,
        learningQueue: restLearning,
        currentCard: nextLearning.card,
        currentBucket: 'learning',
        isCurrentLearnAhead: true,
        waitingForDueAtMs: null,
        isCompleted: false
      };
    }

    // Fora da janela de Learn-Ahead -> aguarda o próximo card vencer
    return {
      ...state,
      currentCard: null,
      currentBucket: null,
      isCurrentLearnAhead: false,
      waitingForDueAtMs: nextLearning.dueAtMs,
      isCompleted: false
    };
  }

  // 4. Todas as filas vazias -> sessão concluída
  return {
    ...state,
    currentCard: null,
    currentBucket: null,
    isCurrentLearnAhead: false,
    waitingForDueAtMs: null,
    isCompleted: true
  };
}

/**
 * Constrói a fila inicial da sessão a partir dos cartões recebidos e configurações do usuário.
 */
export function buildAnkiSessionQueue(
  cards: FlashcardItem[],
  now: Date = new Date(),
  rawSettings?: Partial<FlashcardSchedulerSettings> | null,
  options: BuildQueueOptions = {}
): AnkiSessionQueueState {
  const settings = resolveEffectiveSchedulerSettings(rawSettings);
  const filterDueOnly = options.filterDueOnly ?? true;
  const applyDailyLimits = options.applyDailyLimits ?? false;
  const shuffled = options.shuffled ?? false;
  const endOfTodayMs = getEndOfOperationalDayMs(now);

  const learningEntries: LearningQueueEntry[] = [];
  let reviewCards: FlashcardItem[] = [];
  let newCards: FlashcardItem[] = [];

  for (const card of cards) {
    const p = card.progress;
    if (!p || p.state === 'new') {
      newCards.push(card);
    } else if (p.state === 'learning' || p.state === 'relearning') {
      const dueMs = p.nextReviewDate ? Date.parse(p.nextReviewDate) : now.getTime();
      if (!filterDueOnly || dueMs <= endOfTodayMs) {
        learningEntries.push({
          card,
          dueAtMs: Number.isFinite(dueMs) ? dueMs : now.getTime()
        });
      }
    } else if (p.state === 'review') {
      const dueMs = p.nextReviewDate ? Date.parse(p.nextReviewDate) : now.getTime();
      if (!filterDueOnly || dueMs <= endOfTodayMs) {
        reviewCards.push(card);
      }
    }
  }

  learningEntries.sort((a, b) => a.dueAtMs - b.dueAtMs);

  if (shuffled) {
    reviewCards = shuffleList(reviewCards);
    newCards = shuffleList(newCards);
  } else {
    // Em ordem padrão, revisões mais atrasadas vêm primeiro
    reviewCards.sort((a, b) => {
      const aMs = a.progress?.nextReviewDate ? Date.parse(a.progress.nextReviewDate) : 0;
      const bMs = b.progress?.nextReviewDate ? Date.parse(b.progress.nextReviewDate) : 0;
      return aMs - bMs;
    });
  }

  if (applyDailyLimits) {
    const remainingNew = Math.max(0, settings.newCardsPerDay - (options.dailyNewUsed || 0));
    const remainingRev = Math.max(0, settings.maxReviewsPerDay - (options.dailyReviewUsed || 0));
    newCards = newCards.slice(0, remainingNew);
    reviewCards = reviewCards.slice(0, remainingRev);
  }

  const totalInitialDue = learningEntries.length + reviewCards.length + newCards.length;

  const baseState: AnkiSessionQueueState = {
    learningQueue: learningEntries,
    reviewQueue: reviewCards,
    newQueue: newCards,
    currentCard: null,
    currentBucket: null,
    isCurrentLearnAhead: false,
    waitingForDueAtMs: null,
    isCompleted: false,
    totalInitialDue,
    completedCount: 0,
    mixCounter: 0,
    backStack: []
  };

  return pickNextCardFromQueue(baseState, now, settings);
}

/**
 * Processa a avaliação do cartão atual na fila temporal:
 * - Se continuar em 'learning' ou 'relearning', agenda na learningQueue pelo nextReviewDate real.
 * - Se graduar para 'review', conclui o cartão na sessão e incrementa completedCount.
 */
export function advanceQueueAfterRating(
  state: AnkiSessionQueueState,
  updatedProgress: FlashcardProgress,
  rating: FlashcardRating,
  now: Date = new Date(),
  rawSettings?: Partial<FlashcardSchedulerSettings> | null
): AnkiSessionQueueState {
  if (!state.currentCard || !state.currentBucket) return state;

  const updatedCard: FlashcardItem = {
    ...state.currentCard,
    progress: updatedProgress
  };

  const nextBackStack: QueueHistorySnapshot[] = [
    ...state.backStack.slice(-29),
    { card: updatedCard, bucket: state.currentBucket }
  ];

  let nextLearning = state.learningQueue;
  let completedCount = state.completedCount;

  if (updatedProgress.state === 'learning' || updatedProgress.state === 'relearning') {
    const parsedDue = Date.parse(updatedProgress.nextReviewDate);
    const dueAtMs = Number.isFinite(parsedDue) ? parsedDue : now.getTime() + 60_000;
    nextLearning = insertSortedLearning(nextLearning, {
      card: updatedCard,
      dueAtMs
    });
  } else {
    completedCount += 1;
  }

  void rating;

  return pickNextCardFromQueue(
    {
      ...state,
      learningQueue: nextLearning,
      currentCard: null,
      currentBucket: null,
      completedCount,
      backStack: nextBackStack
    },
    now,
    rawSettings
  );
}

/**
 * Pula o cartão atual sem registrá-lo no FSRS, enviando-o para o fim da fila correspondente.
 */
export function skipCurrentCardInQueue(
  state: AnkiSessionQueueState,
  now: Date = new Date(),
  rawSettings?: Partial<FlashcardSchedulerSettings> | null
): AnkiSessionQueueState {
  if (!state.currentCard || !state.currentBucket) return state;

  const card = state.currentCard;
  const bucket = state.currentBucket;
  let learningQueue = state.learningQueue;
  let reviewQueue = state.reviewQueue;
  let newQueue = state.newQueue;

  if (bucket === 'learning') {
    // Coloca logo após os itens já vencidos para não entrar em loop imediato
    const lastDue =
      learningQueue.length > 0 ? learningQueue[learningQueue.length - 1].dueAtMs : now.getTime();
    learningQueue = [
      ...learningQueue,
      { card, dueAtMs: Math.max(now.getTime() + 1, lastDue + 1) }
    ];
  } else if (bucket === 'review') {
    reviewQueue = [...reviewQueue, card];
  } else {
    newQueue = [...newQueue, card];
  }

  return pickNextCardFromQueue(
    {
      ...state,
      learningQueue,
      reviewQueue,
      newQueue,
      currentCard: null,
      currentBucket: null,
      backStack: [...state.backStack.slice(-29), { card, bucket }]
    },
    now,
    rawSettings
  );
}

/**
 * Retorna ao cartão anterior do histórico recente (para conferência/edição).
 */
export function stepBackInQueue(state: AnkiSessionQueueState): AnkiSessionQueueState {
  if (state.backStack.length === 0) return state;

  const prevSnapshot = state.backStack[state.backStack.length - 1];
  const remainingStack = state.backStack.slice(0, -1);

  let learningQueue = state.learningQueue.filter((q) => q.card.id !== prevSnapshot.card.id);
  let reviewQueue = state.reviewQueue.filter((c) => c.id !== prevSnapshot.card.id);
  let newQueue = state.newQueue.filter((c) => c.id !== prevSnapshot.card.id);

  // Devolve o currentCard atual ao início de sua fila antes de exibir o anterior
  if (state.currentCard && state.currentBucket) {
    if (state.currentBucket === 'learning') {
      const dueMs = state.currentCard.progress?.nextReviewDate
        ? Date.parse(state.currentCard.progress.nextReviewDate)
        : Date.now();
      learningQueue = [
        { card: state.currentCard, dueAtMs: Number.isFinite(dueMs) ? dueMs : Date.now() },
        ...learningQueue
      ];
    } else if (state.currentBucket === 'review') {
      reviewQueue = [state.currentCard, ...reviewQueue];
    } else {
      newQueue = [state.currentCard, ...newQueue];
    }
  }

  return {
    ...state,
    learningQueue,
    reviewQueue,
    newQueue,
    currentCard: prevSnapshot.card,
    currentBucket: prevSnapshot.bucket,
    isCurrentLearnAhead: false,
    waitingForDueAtMs: null,
    isCompleted: false,
    backStack: remainingStack
  };
}

/**
 * Embaralha ou restaura a ordem das filas pendentes (newQueue e reviewQueue).
 */
export function reshufflePendingQueues(
  state: AnkiSessionQueueState,
  shouldShuffle: boolean
): AnkiSessionQueueState {
  const reviewQueue = shouldShuffle
    ? shuffleList(state.reviewQueue)
    : [...state.reviewQueue].sort((a, b) => {
        const aMs = a.progress?.nextReviewDate ? Date.parse(a.progress.nextReviewDate) : 0;
        const bMs = b.progress?.nextReviewDate ? Date.parse(b.progress.nextReviewDate) : 0;
        return aMs - bMs;
      });

  const newQueue = shouldShuffle ? shuffleList(state.newQueue) : [...state.newQueue];

  return {
    ...state,
    reviewQueue,
    newQueue
  };
}

/**
 * Antecipa manualmente o próximo card da learningQueue (usado quando o aluno clica em "Estudar agora" na tela de espera).
 */
export function forceAdvanceWaitingCard(state: AnkiSessionQueueState): AnkiSessionQueueState {
  if (state.learningQueue.length === 0) {
    return { ...state, waitingForDueAtMs: null, isCompleted: true };
  }
  const [nextEntry, ...restLearning] = state.learningQueue;
  return {
    ...state,
    learningQueue: restLearning,
    currentCard: nextEntry.card,
    currentBucket: 'learning',
    isCurrentLearnAhead: true,
    waitingForDueAtMs: null,
    isCompleted: false
  };
}

/**
 * Retorna as contagens ao vivo estilo Anki na barra superior da sessão (incluindo o card atual).
 */
export function getLiveQueueCounts(state: AnkiSessionQueueState): {
  novo: number;
  aprender: number;
  revisar: number;
  totalRemaining: number;
} {
  const novo = state.newQueue.length + (state.currentBucket === 'new' ? 1 : 0);
  const aprender = state.learningQueue.length + (state.currentBucket === 'learning' ? 1 : 0);
  const revisar = state.reviewQueue.length + (state.currentBucket === 'review' ? 1 : 0);
  return {
    novo,
    aprender,
    revisar,
    totalRemaining: novo + aprender + revisar
  };
}

/**
 * Filtra e ordena cartões para Estudo Personalizado (estilo Anki Custom Study / Filtered Deck).
 */
export function filterCardsForCustomStudy(
  cards: FlashcardItem[],
  options: CustomStudyLaunchOptions,
  now: Date = new Date(),
  errorCardIds?: Set<string>
): FlashcardItem[] {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayMs = startOfToday.getTime();

  const endOfTodayMs = getEndOfOperationalDayMs(now);
  const aheadDays = Math.max(1, Math.min(60, Math.round(options.aheadDays || 3)));
  const aheadCutoffMs = endOfTodayMs + aheadDays * 24 * 60 * 60 * 1000;

  let filtered = cards.filter((card) => {
    const p = card.progress;
    if (options.filterType === 'all') return true;
    if (options.filterType === 'due') {
      if (!p || p.state === 'new') return true;
      return !p.nextReviewDate || Date.parse(p.nextReviewDate) <= endOfTodayMs;
    }
    if (options.filterType === 'forgotten_today') {
      if (!p || !p.lastReviewDate) return false;
      const lastMs = Date.parse(p.lastReviewDate);
      return Number.isFinite(lastMs) && lastMs >= startOfTodayMs && p.lastRating === 'again';
    }
    if (options.filterType === 'ahead') {
      if (!p || p.state === 'new') return false;
      const dueMs = p.nextReviewDate ? Date.parse(p.nextReviewDate) : now.getTime();
      return Number.isFinite(dueMs) && dueMs <= aheadCutoffMs;
    }
    if (options.filterType === 'new_only') {
      return !p || p.state === 'new';
    }
    if (options.filterType === 'essential_only') {
      return card.priority === 'essential';
    }
    if (options.filterType === 'errors_only') {
      return Boolean(errorCardIds && errorCardIds.has(card.id));
    }
    return true;
  });

  if (options.sortOrder === 'random') {
    filtered = shuffleList(filtered);
  } else if (options.sortOrder === 'most_overdue') {
    filtered = [...filtered].sort((a, b) => {
      const aMs = a.progress?.nextReviewDate ? Date.parse(a.progress.nextReviewDate) : 0;
      const bMs = b.progress?.nextReviewDate ? Date.parse(b.progress.nextReviewDate) : 0;
      return aMs - bMs;
    });
  } else if (options.sortOrder === 'most_lapsed') {
    filtered = [...filtered].sort((a, b) => (b.progress?.lapses || 0) - (a.progress?.lapses || 0));
  } else {
    filtered = [...filtered];
  }

  if (options.limitCards && options.limitCards > 0) {
    filtered = filtered.slice(0, Math.round(options.limitCards));
  }

  return filtered;
}

/**
 * Constrói uma fila temporária isolada para Estudo Personalizado SEM alterar agendamento FSRS.
 * Todos os cartões selecionados entram como fila temporária de prática livre.
 */
export function buildCustomNoRescheduleQueue(
  cards: FlashcardItem[],
  now: Date = new Date(),
  rawSettings?: Partial<FlashcardSchedulerSettings> | null,
  shuffled: boolean = false
): AnkiSessionQueueState {
  const ordered = shuffled ? shuffleList(cards) : [...cards];
  const baseState: AnkiSessionQueueState = {
    learningQueue: [],
    reviewQueue: ordered,
    newQueue: [],
    currentCard: null,
    currentBucket: null,
    isCurrentLearnAhead: false,
    waitingForDueAtMs: null,
    isCompleted: false,
    totalInitialDue: ordered.length,
    completedCount: 0,
    mixCounter: 0,
    backStack: []
  };

  return pickNextCardFromQueue(baseState, now, rawSettings);
}

/**
 * Avança a fila temporária no modo Cram / Sem Reagendamento sem mutar o progresso FSRS original.
 * - 'again': retorna à fila temporária após passo curto de sessão (sem gravar lapso no FSRS)
 * - 'hard': retorna à fila temporária após passo intermediário de sessão
 * - 'good' | 'easy': conclui o cartão na sessão personalizada
 */
export function advanceCustomNoRescheduleQueue(
  state: AnkiSessionQueueState,
  rating: FlashcardRating,
  now: Date = new Date(),
  rawSettings?: Partial<FlashcardSchedulerSettings> | null
): AnkiSessionQueueState {
  if (!state.currentCard || !state.currentBucket) return state;

  const settings = resolveEffectiveSchedulerSettings(rawSettings);
  const card = state.currentCard;
  const nextBackStack: QueueHistorySnapshot[] = [
    ...state.backStack.slice(-29),
    { card, bucket: state.currentBucket }
  ];

  let nextLearning = state.learningQueue;
  let completedCount = state.completedCount;

  if (rating === 'again') {
    const againMins = Math.max(1, settings.learningStepsMinutes[0] || 1);
    nextLearning = insertSortedLearning(nextLearning, {
      card,
      dueAtMs: now.getTime() + againMins * 60 * 1000
    });
  } else if (rating === 'hard') {
    const step0 = settings.learningStepsMinutes[0] || 1;
    const hardMins = Math.max(5, Math.min(15, step0 * 5));
    nextLearning = insertSortedLearning(nextLearning, {
      card,
      dueAtMs: now.getTime() + hardMins * 60 * 1000
    });
  } else {
    completedCount += 1;
  }

  return pickNextCardFromQueue(
    {
      ...state,
      learningQueue: nextLearning,
      currentCard: null,
      currentBucket: null,
      completedCount,
      backStack: nextBackStack
    },
    now,
    settings
  );
}

