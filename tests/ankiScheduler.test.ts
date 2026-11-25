import assert from 'node:assert';
import {
  FLASHCARD_PRESETS,
  parseStepsInput,
  formatStepsInput,
  formatIntervalLabel,
  resolveEffectiveSchedulerSettings,
  scheduleCard,
  previewRatingOptions,
  calculateAnkiDeckCounts
} from '../src/utils/ankiScheduler';
import { FlashcardItem, FlashcardProgress, FlashcardRating } from '../src/types/flashcards';

console.log('--- TEST SUITE: Anki FSRS-5 Scheduler & Presets ---');

// 1. Parser de passos estilo Anki
console.log('1. Testing parseStepsInput and formatStepsInput...');
assert.deepStrictEqual(parseStepsInput('1m 10m'), [1, 10]);
assert.deepStrictEqual(parseStepsInput('1m 1h 1d'), [1, 60, 1440]);
assert.deepStrictEqual(parseStepsInput('', [10]), []);
assert.deepStrictEqual(parseStepsInput('invalid', [10]), [10]);
assert.strictEqual(formatStepsInput([1, 10, 60, 1440]), '1m 10m 1h 1d');

// 2. Consistência exata entre previewRatingOptions e scheduleCard (sem off-by-one)
console.log('2. Testing previewRatingOptions === scheduleCard...');
const now = new Date('2026-11-24T12:00:00.000Z');
const ratings: FlashcardRating[] = ['again', 'hard', 'good', 'easy'];

for (const presetKey of ['more_reps', 'moderate', 'fewer_reps'] as const) {
  const settings = resolveEffectiveSchedulerSettings({
    presetMode: presetKey,
    ...FLASHCARD_PRESETS[presetKey].settings
  });

  // Estado New
  const previewsNew = previewRatingOptions(undefined, now, settings);
  for (const r of ratings) {
    const scheduled = scheduleCard(undefined, r, now, settings, { applyFuzz: false });
    assert.strictEqual(
      scheduled.intervalDays,
      previewsNew[r].intervalDays,
      `Preview mismatch (new, ${presetKey}, ${r})`
    );
    assert.strictEqual(scheduled.state, previewsNew[r].nextState);
  }

  // Estado Learning step 0 e step 1
  const learningStep0 = scheduleCard(undefined, 'again', now, settings, { applyFuzz: false });
  const previewsStep0 = previewRatingOptions(learningStep0, now, settings);
  for (const r of ratings) {
    const scheduled = scheduleCard(learningStep0, r, now, settings, { applyFuzz: false });
    assert.strictEqual(
      scheduled.intervalDays,
      previewsStep0[r].intervalDays,
      `Preview mismatch (learning0, ${presetKey}, ${r})`
    );
  }
}

// 3. Fluxo Mais Repetições (1m -> 10m -> 1d) vs Moderada (10m -> 1d)
console.log('3. Testing preset step flows...');
const moreRepsSettings = resolveEffectiveSchedulerSettings({ presetMode: 'more_reps' });
const step0 = scheduleCard(undefined, 'good', now, moreRepsSettings, { applyFuzz: false });
assert.strictEqual(step0.state, 'learning');
assert.strictEqual(step0.stepIndex, 1);
assert.strictEqual(formatIntervalLabel(step0.intervalDays), '10 min');

const graduated = scheduleCard(
  step0,
  'good',
  new Date(now.getTime() + 10 * 60 * 1000),
  moreRepsSettings,
  { applyFuzz: false }
);
assert.strictEqual(graduated.state, 'review');
assert.strictEqual(graduated.intervalDays, 1);

const moderateSettings = resolveEffectiveSchedulerSettings({ presetMode: 'moderate' });
const modAgain = scheduleCard(undefined, 'again', now, moderateSettings, { applyFuzz: false });
assert.strictEqual(modAgain.state, 'learning');
assert.strictEqual(formatIntervalLabel(modAgain.intervalDays), '10 min');
const modGood = scheduleCard(undefined, 'good', now, moderateSettings, { applyFuzz: false });
assert.strictEqual(modGood.state, 'review');
assert.strictEqual(modGood.intervalDays, 1);

// 4. FSRS-5 Monotonicidade & Lapso -> Relearning -> Review sem zerar estabilidade
console.log('4. Testing FSRS-5 review monotonicity and relearning lapses...');
const matureReview: FlashcardProgress = {
  state: 'review',
  repetitions: 4,
  intervalDays: 14,
  stepIndex: 0,
  scheduledDays: 14,
  easeFactor: 2.5,
  stability: 14,
  difficulty: 5.0,
  retrievability: 0.9,
  lastReviewDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  nextReviewDate: now.toISOString(),
  lapses: 0
};

const revPreviews = previewRatingOptions(matureReview, now, moderateSettings);
assert.ok(revPreviews.again.intervalDays < revPreviews.hard.intervalDays);
assert.ok(revPreviews.hard.intervalDays <= revPreviews.good.intervalDays);
assert.ok(revPreviews.good.intervalDays < revPreviews.easy.intervalDays);

// Comparação de retenção: 93% (Mais repetições) deve gerar intervalo menor que 85% (Poucas repetições)
const fewerRepsSettings = resolveEffectiveSchedulerSettings({ presetMode: 'fewer_reps' });
const revMoreReps = scheduleCard(matureReview, 'good', now, moreRepsSettings, { applyFuzz: false });
const revFewerReps = scheduleCard(matureReview, 'good', now, fewerRepsSettings, { applyFuzz: false });
assert.ok(
  revMoreReps.intervalDays < revFewerReps.intervalDays,
  `Expected more_reps (${revMoreReps.intervalDays}d) < fewer_reps (${revFewerReps.intervalDays}d)`
);

// Lapso deve entrar em relearning e preservar scheduledDays > 0
const lapsed = scheduleCard(matureReview, 'again', now, moderateSettings, { applyFuzz: false });
assert.strictEqual(lapsed.state, 'relearning');
assert.strictEqual(lapsed.lapses, 1);
assert.ok((lapsed.scheduledDays || 0) >= 1, 'Lapse must preserve scheduledDays >= 1');
assert.ok(lapsed.stability < matureReview.stability && lapsed.stability >= 0.1);

const recovered = scheduleCard(
  lapsed,
  'good',
  new Date(now.getTime() + 10 * 60 * 1000),
  moderateSettings,
  { applyFuzz: false }
);
assert.strictEqual(recovered.state, 'review');
assert.strictEqual(recovered.intervalDays, lapsed.scheduledDays);

// 5. Contagem Anki consistente (inclusive learning com repetitions === 0)
console.log('5. Testing calculateAnkiDeckCounts...');
const sampleCards: FlashcardItem[] = [
  { id: '1', front: 'Q1', back: 'A1', specialty: 'CM', theme: 'T', focus: 'F' },
  {
    id: '2',
    front: 'Q2',
    back: 'A2',
    specialty: 'CM',
    theme: 'T',
    focus: 'F',
    progress: { ...modAgain, repetitions: 0 }
  },
  {
    id: '3',
    front: 'Q3',
    back: 'A3',
    specialty: 'CM',
    theme: 'T',
    focus: 'F',
    progress: lapsed
  },
  {
    id: '4',
    front: 'Q4',
    back: 'A4',
    specialty: 'CM',
    theme: 'T',
    focus: 'F',
    progress: { ...matureReview, nextReviewDate: now.toISOString() }
  },
  {
    id: '5',
    front: 'Q5',
    back: 'A5',
    specialty: 'CM',
    theme: 'T',
    focus: 'F',
    progress: {
      ...matureReview,
      nextReviewDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
];

const counts = calculateAnkiDeckCounts(sampleCards, now);
assert.strictEqual(counts.novo, 1);
assert.strictEqual(counts.aprender, 2);
assert.strictEqual(counts.revisar, 1);
assert.strictEqual(counts.total, 5);

// 6. Ciclo completo (new -> learning -> review -> relearning -> review) + preset 'custom'
console.log('6. Testing custom preset and full preview/schedule parity on relearning & review...');
const customSettings = resolveEffectiveSchedulerSettings({
  presetMode: 'custom_anki',
  learningStepsMinutes: [2, 15, 60],
  relearningStepsMinutes: [5, 20],
  graduatingIntervalDays: 2,
  easyIntervalDays: 5,
  desiredRetention: 0.88,
  learnAheadMinutes: 15,
  newCardsPerDay: 30,
  maxReviewsPerDay: 150
});

let cycle = scheduleCard(undefined, 'again', now, customSettings, { applyFuzz: false });
assert.strictEqual(cycle.state, 'learning');
assert.strictEqual(formatIntervalLabel(cycle.intervalDays), '2 min');

cycle = scheduleCard(cycle, 'good', new Date(now.getTime() + 2 * 60_000), customSettings, { applyFuzz: false });
assert.strictEqual(cycle.stepIndex, 1);
assert.strictEqual(formatIntervalLabel(cycle.intervalDays), '15 min');

cycle = scheduleCard(cycle, 'good', new Date(now.getTime() + 17 * 60_000), customSettings, { applyFuzz: false });
assert.strictEqual(cycle.stepIndex, 2);
assert.strictEqual(formatIntervalLabel(cycle.intervalDays), '1 h');

cycle = scheduleCard(cycle, 'good', new Date(now.getTime() + 77 * 60_000), customSettings, { applyFuzz: false });
assert.strictEqual(cycle.state, 'review');
assert.strictEqual(cycle.intervalDays, 2);

const revAtDay2 = new Date(now.getTime() + 2 * 24 * 3600_000);
const revPreviewsCustom = previewRatingOptions(cycle, revAtDay2, customSettings);
for (const r of ratings) {
  const scheduled = scheduleCard(cycle, r, revAtDay2, customSettings, { applyFuzz: false });
  assert.strictEqual(scheduled.intervalDays, revPreviewsCustom[r].intervalDays);
  assert.strictEqual(scheduled.state, revPreviewsCustom[r].nextState);
}

const lapsedCustom = scheduleCard(cycle, 'again', revAtDay2, customSettings, { applyFuzz: false });
assert.strictEqual(lapsedCustom.state, 'relearning');
const relearnPreviews = previewRatingOptions(lapsedCustom, revAtDay2, customSettings);
for (const r of ratings) {
  const scheduled = scheduleCard(lapsedCustom, r, revAtDay2, customSettings, { applyFuzz: false });
  assert.strictEqual(scheduled.intervalDays, relearnPreviews[r].intervalDays);
  assert.strictEqual(scheduled.state, relearnPreviews[r].nextState);
}

console.log('✅ ALL ANKI FSRS-5 SCHEDULER TESTS PASSED!');
