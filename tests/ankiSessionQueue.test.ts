import assert from 'node:assert';
import {
  buildAnkiSessionQueue,
  pickNextCardFromQueue,
  advanceQueueAfterRating,
  skipCurrentCardInQueue,
  stepBackInQueue,
  forceAdvanceWaitingCard,
  getLiveQueueCounts,
  countTodayStudiedCards,
  filterCardsForCustomStudy,
  buildCustomNoRescheduleQueue,
  advanceCustomNoRescheduleQueue
} from '../src/utils/ankiSessionQueue';
import { resolveEffectiveSchedulerSettings, scheduleCard } from '../src/utils/ankiScheduler';
import { FlashcardItem } from '../src/types/flashcards';

console.log('--- TEST SUITE: Anki Temporal Session Queue ---');

function makeCard(id: string, overrides?: Partial<FlashcardItem>): FlashcardItem {
  return {
    id,
    front: `Pergunta ${id}`,
    back: `Resposta ${id}`,
    specialty: 'Clínica Médica',
    theme: 'Cardiologia',
    focus: 'SCA',
    ...overrides
  };
}

const t0 = new Date('2026-11-24T12:00:00.000Z');
const moreRepsSettings = resolveEffectiveSchedulerSettings({
  presetMode: 'more_reps',
  learnAheadMinutes: 20,
  newCardsPerDay: 20,
  maxReviewsPerDay: 200
});

// 1. Bug do "De novo": Em deck com 50 cartões, card com "De novo (1 min)" deve voltar
// assim que passar 1 minuto, e NÃO apenas na posição 50!
console.log('1. Testing "De novo (1 min)" returns after 1 min instead of end of 50-card list...');
const deck50 = Array.from({ length: 50 }, (_, i) => makeCard(`c-${i + 1}`));
let qState = buildAnkiSessionQueue(deck50, t0, moreRepsSettings, {
  filterDueOnly: false,
  shuffled: false
});

assert.strictEqual(qState.currentCard?.id, 'c-1');
assert.strictEqual(qState.currentBucket, 'new');

// Avalia c-1 como "again" -> entra na learningQueue para +1 min
const pAgain = scheduleCard(qState.currentCard?.progress, 'again', t0, moreRepsSettings, { applyFuzz: false });
qState = advanceQueueAfterRating(qState, pAgain, 'again', t0, moreRepsSettings);

// Imediatamente após avaliar c-1 como "again" (ainda < 1 min), deve servir c-2
assert.strictEqual(qState.currentCard?.id, 'c-2');

// Avalia c-2 como "easy" após 1 minuto e 5 segundos (c-1 já venceu!)
const t65s = new Date(t0.getTime() + 65 * 1000);
const pEasy = scheduleCard(qState.currentCard?.progress, 'easy', t65s, moreRepsSettings, { applyFuzz: false });
qState = advanceQueueAfterRating(qState, pEasy, 'easy', t65s, moreRepsSettings);

// Deve furar a fila dos outros 48 cartões e exibir c-1 imediatamente!
assert.strictEqual(qState.currentCard?.id, 'c-1', 'c-1 must return immediately after 1 min');
assert.strictEqual(qState.currentBucket, 'learning');
assert.strictEqual(qState.isCurrentLearnAhead, false);
assert.strictEqual(qState.currentCard?.progress?.lastRating, 'again', 'Card must have updated progress');

// 2. Cartão avaliado como "Difícil" (6 min) ou "Bom" (10 min no passo 0) também permanece em learningQueue
console.log('2. Testing Hard/Good intra-session steps stay in learningQueue...');
const pGoodStep0 = scheduleCard(qState.currentCard?.progress, 'good', t65s, moreRepsSettings, { applyFuzz: false });
assert.strictEqual(pGoodStep0.state, 'learning');
qState = advanceQueueAfterRating(qState, pGoodStep0, 'good', t65s, moreRepsSettings);
assert.strictEqual(qState.learningQueue.length, 1);
assert.strictEqual(qState.learningQueue[0].card.id, 'c-1');

// 3. Learn-Ahead Limit (20 min) vs Tela de Espera (> 20 min)
console.log('3. Testing Learn-Ahead Limit vs Waiting Screen...');
const singleDeck = [makeCard('solo')];
let qSolo = buildAnkiSessionQueue(singleDeck, t0, moreRepsSettings, { filterDueOnly: false });
const soloAgain = scheduleCard(undefined, 'again', t0, moreRepsSettings, { applyFuzz: false });
qSolo = advanceQueueAfterRating(qSolo, soloAgain, 'again', t0, moreRepsSettings);
// 1 min <= 20 min learn-ahead -> antecipado imediatamente!
assert.strictEqual(qSolo.currentCard?.id, 'solo');
assert.strictEqual(qSolo.isCurrentLearnAhead, true);
assert.strictEqual(qSolo.waitingForDueAtMs, null);

// Com learnAheadMinutes = 0, card futuro deve entrar em tela de espera cronometrada
const strictWaitSettings = resolveEffectiveSchedulerSettings({
  presetMode: 'custom_anki',
  learningStepsMinutes: [10],
  learnAheadMinutes: 0
});
let qWait = buildAnkiSessionQueue([makeCard('wait-1')], t0, strictWaitSettings, { filterDueOnly: false });
const waitAgain = scheduleCard(undefined, 'again', t0, strictWaitSettings, { applyFuzz: false });
qWait = advanceQueueAfterRating(qWait, waitAgain, 'again', t0, strictWaitSettings);
assert.strictEqual(qWait.currentCard, null);
assert.ok(qWait.waitingForDueAtMs !== null);
assert.strictEqual(qWait.isCompleted, false);

// Forçar avanço manual funciona e tira da espera
const forced = forceAdvanceWaitingCard(qWait);
assert.strictEqual(forced.currentCard?.id, 'wait-1');
assert.strictEqual(forced.waitingForDueAtMs, null);

// 4. Navegação Voltar (Anterior) sem duplicar card na fila & Pular
console.log('4. Testing skipCurrentCardInQueue and stepBackInQueue without duplication...');
let qNav = buildAnkiSessionQueue([makeCard('a'), makeCard('b'), makeCard('c')], t0, moreRepsSettings, {
  filterDueOnly: false
});
assert.strictEqual(qNav.currentCard?.id, 'a');
qNav = skipCurrentCardInQueue(qNav, t0, moreRepsSettings);
assert.strictEqual(qNav.currentCard?.id, 'b');
qNav = stepBackInQueue(qNav);
assert.strictEqual(qNav.currentCard?.id, 'a');
const countsAfterBack = getLiveQueueCounts(qNav);
assert.strictEqual(countsAfterBack.totalRemaining, 3, 'No duplicate cards after stepping back');

// 5. Filtro de devidos + Limites diários (não corta learning/relearning)
console.log('5. Testing filterDueOnly and daily limits...');
const futureReview = makeCard('future', {
  progress: {
    state: 'review',
    repetitions: 3,
    intervalDays: 10,
    easeFactor: 2.5,
    stability: 10,
    difficulty: 5,
    retrievability: 0.9,
    lastReviewDate: t0.toISOString(),
    nextReviewDate: new Date(t0.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    lapses: 0
  }
});
const dueReview = makeCard('due-rev', {
  progress: {
    state: 'review',
    repetitions: 2,
    intervalDays: 4,
    easeFactor: 2.5,
    stability: 4,
    difficulty: 5,
    retrievability: 0.9,
    lastReviewDate: new Date(t0.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewDate: t0.toISOString(),
    lapses: 0
  }
});
const dueLearn = makeCard('due-learn', {
  progress: {
    state: 'learning',
    repetitions: 1,
    intervalDays: 1 / 1440,
    easeFactor: 2.3,
    stability: 0.4,
    difficulty: 6,
    retrievability: 1,
    lastReviewDate: t0.toISOString(),
    nextReviewDate: t0.toISOString(),
    lapses: 0
  }
});

const cappedSettings = resolveEffectiveSchedulerSettings({
  presetMode: 'custom_anki',
  newCardsPerDay: 1,
  maxReviewsPerDay: 1
});
const qFiltered = buildAnkiSessionQueue(
  [futureReview, dueReview, dueLearn, makeCard('n1'), makeCard('n2')],
  t0,
  cappedSettings,
  { filterDueOnly: true, applyDailyLimits: true }
);
const liveCapped = getLiveQueueCounts(qFiltered);
assert.strictEqual(liveCapped.aprender, 1, 'Learning card always kept');
assert.strictEqual(liveCapped.revisar, 1, 'Only due review kept');
assert.strictEqual(liveCapped.novo, 1, 'New cards capped at 1');
assert.strictEqual(liveCapped.totalRemaining, 3, 'Future review excluded');

const todayUsage = countTodayStudiedCards([futureReview, dueReview, dueLearn], t0);
assert.strictEqual(todayUsage.newUsedToday, 1);

// 7. Fase 4: filterCardsForCustomStudy (all, due, forgotten_today, ahead, new_only, essential_only, errors_only)
const customBaseTime = new Date('2026-11-24T12:00:00.000Z');
const cardNewEssential = makeCard('c-new-ess', { priority: 'essential' });
const cardForgottenToday = makeCard('c-forgot', {
  progress: {
    flashcardId: 'c-forgot',
    repetitions: 1,
    intervalDays: 0,
    easeFactor: 2.3,
    stability: 1.2,
    difficulty: 6.5,
    lapses: 3,
    state: 'relearning',
    lastRating: 'again',
    lastReviewDate: '2026-11-24T10:30:00.000Z',
    nextReviewDate: '2026-11-24T12:10:00.000Z'
  }
});
const cardAhead2Days = makeCard('c-ahead-2d', {
  progress: {
    flashcardId: 'c-ahead-2d',
    repetitions: 3,
    intervalDays: 5,
    easeFactor: 2.5,
    stability: 6.0,
    difficulty: 5.0,
    lapses: 1,
    state: 'review',
    lastReviewDate: '2026-11-20T10:00:00.000Z',
    nextReviewDate: '2026-11-26T10:00:00.000Z'
  }
});
const cardFarFuture = makeCard('c-far-30d', {
  progress: {
    flashcardId: 'c-far-30d',
    repetitions: 4,
    intervalDays: 30,
    easeFactor: 2.5,
    stability: 30,
    difficulty: 4.0,
    lapses: 0,
    state: 'review',
    lastReviewDate: '2026-11-20T10:00:00.000Z',
    nextReviewDate: '2026-12-24T10:00:00.000Z'
  }
});

const pool = [cardNewEssential, cardForgottenToday, cardAhead2Days, cardFarFuture];
const errIds = new Set<string>(['c-ahead-2d']);

assert.strictEqual(
  filterCardsForCustomStudy(pool, { filterType: 'all', sortOrder: 'due_asc', reschedule: false }, customBaseTime).length,
  4
);
assert.deepStrictEqual(
  filterCardsForCustomStudy(pool, { filterType: 'forgotten_today', sortOrder: 'due_asc', reschedule: false }, customBaseTime).map((c) => c.id),
  ['c-forgot']
);
assert.deepStrictEqual(
  filterCardsForCustomStudy(pool, { filterType: 'ahead', aheadDays: 3, sortOrder: 'due_asc', reschedule: false }, customBaseTime).map((c) => c.id),
  ['c-forgot', 'c-ahead-2d']
);
assert.deepStrictEqual(
  filterCardsForCustomStudy(pool, { filterType: 'new_only', sortOrder: 'due_asc', reschedule: false }, customBaseTime).map((c) => c.id),
  ['c-new-ess']
);
assert.deepStrictEqual(
  filterCardsForCustomStudy(pool, { filterType: 'essential_only', sortOrder: 'due_asc', reschedule: false }, customBaseTime).map((c) => c.id),
  ['c-new-ess']
);
assert.deepStrictEqual(
  filterCardsForCustomStudy(pool, { filterType: 'errors_only', sortOrder: 'due_asc', reschedule: false }, customBaseTime, errIds).map((c) => c.id),
  ['c-ahead-2d']
);
assert.deepStrictEqual(
  filterCardsForCustomStudy(pool, { filterType: 'all', sortOrder: 'most_lapsed', limitCards: 2, reschedule: false }, customBaseTime).map((c) => c.id),
  ['c-forgot', 'c-ahead-2d']
);

// 8. Fase 4: Modo Cram (Sem Alterar FSRS) preserva progresso original intacto
const originalNextReview = cardFarFuture.progress?.nextReviewDate;
const originalLapses = cardFarFuture.progress?.lapses;
let cramQueue = buildCustomNoRescheduleQueue([cardFarFuture, cardAhead2Days], customBaseTime, moreRepsSettings, false);
assert.strictEqual(cramQueue.currentCard?.id, 'c-far-30d');

cramQueue = advanceCustomNoRescheduleQueue(cramQueue, 'again', customBaseTime, moreRepsSettings);
// Progresso FSRS do cartão não pode ter sofrido nenhuma mutação após 'again' no Cram!
assert.strictEqual(cardFarFuture.progress?.nextReviewDate, originalNextReview, 'Cram must not mutate FSRS nextReviewDate');
assert.strictEqual(cardFarFuture.progress?.lapses, originalLapses, 'Cram must not increment FSRS lapses');
// Deve estar na fila temporária de aprendizagem da sessão e voltar após cardAhead2Days
assert.strictEqual(cramQueue.learningQueue.length, 1);
assert.strictEqual(cramQueue.learningQueue[0].card.id, 'c-far-30d');
assert.strictEqual(cramQueue.currentCard?.id, 'c-ahead-2d');

cramQueue = advanceCustomNoRescheduleQueue(cramQueue, 'good', customBaseTime, moreRepsSettings);
// Agora c-far-30d volta via Learn-Ahead temporário para consolidação na sessão
assert.strictEqual(cramQueue.currentCard?.id, 'c-far-30d');
cramQueue = advanceCustomNoRescheduleQueue(cramQueue, 'easy', customBaseTime, moreRepsSettings);
assert.strictEqual(cramQueue.isCompleted, true);
assert.strictEqual(cardFarFuture.progress?.nextReviewDate, originalNextReview, 'Cram completion preserves FSRS date');

// 9. Wakeup automático do waiting screen quando o relógio entra no Learn-Ahead
const longStepSettings = resolveEffectiveSchedulerSettings({
  presetMode: 'custom_anki',
  learningStepsMinutes: [25],
  learnAheadMinutes: 5
});
const waitingCard = makeCard('w-wake');
let wakeQ = buildAnkiSessionQueue([waitingCard], t0, longStepSettings, {
  filterDueOnly: false,
  shuffled: false
});
const p25 = scheduleCard(undefined, 'again', t0, longStepSettings, { applyFuzz: false });
wakeQ = advanceQueueAfterRating(wakeQ, p25, 'again', t0, longStepSettings);
assert.strictEqual(wakeQ.currentCard, null, 'Must enter waiting state because 25m > 5m learn-ahead');
assert.ok(wakeQ.waitingForDueAtMs !== null);

const tAt21m = new Date(t0.getTime() + 21 * 60 * 1000);
wakeQ = pickNextCardFromQueue(wakeQ, tAt21m, longStepSettings);
assert.strictEqual(wakeQ.waitingForDueAtMs, null);
assert.strictEqual(wakeQ.currentCard?.id, 'w-wake', 'Must auto-wake when remaining wait <= 5m learn-ahead');
assert.strictEqual(wakeQ.isCurrentLearnAhead, true);

console.log('✅ ALL ANKI TEMPORAL SESSION QUEUE TESTS PASSED!');
