import {
  FSRSState,
  FlashcardItem,
  FlashcardPresetMode,
  FlashcardProgress,
  FlashcardRating,
  FlashcardSchedulerSettings
} from '@/types/flashcards';

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Parâmetros canônicos FSRS-5 (w[0..18])
const FSRS5_WEIGHTS = [
  0.40255, 1.18385, 3.173, 15.69105,
  7.1949, 0.5345, 1.4604, 0.0046,
  1.54575, 0.1192, 1.01925, 1.9395,
  0.11, 0.29605, 2.2698, 0.2315,
  2.9898, 0.51655, 0.6621
] as const;

const FSRS_DECAY = -0.5;
const FSRS_FACTOR = 19 / 81; // Garante R(t = S) = 0.9

export type BasicPresetKey = Exclude<FlashcardPresetMode, 'custom_anki'>;

export interface PresetDefinition {
  id: BasicPresetKey;
  title: string;
  subtitle: string;
  badge?: string;
  summary: string;
  settings: Omit<FlashcardSchedulerSettings, 'presetMode' | 'updatedAt'>;
}

export const FLASHCARD_PRESETS: Record<BasicPresetKey, PresetDefinition> = {
  more_reps: {
    id: 'more_reps',
    title: 'Mais Repetições',
    subtitle: 'Passos 1m → 10m • Retenção 93%',
    summary: 'Ideal para temas difíceis ou reta final. Intervalos mais curtos e reforço intradia em 1 min e 10 min.',
    settings: {
      learningStepsMinutes: [1, 10],
      relearningStepsMinutes: [1, 10],
      graduatingIntervalDays: 1,
      easyIntervalDays: 3,
      desiredRetention: 0.93,
      maximumIntervalDays: 180,
      minimumLapseIntervalDays: 1,
      intervalModifier: 0.9,
      enableFuzz: true,
      newCardsPerDay: 30,
      maxReviewsPerDay: 250,
      learnAheadMinutes: 20,
      queueOrder: 'mix'
    }
  },
  moderate: {
    id: 'moderate',
    title: 'Repetições Moderadas',
    subtitle: 'Passo 10m • Retenção 90% (Padrão Anki)',
    badge: 'Recomendado',
    summary: 'Equilíbrio clássico entre fixação e volume diário. Baseado no padrão FSRS do Anki.',
    settings: {
      learningStepsMinutes: [10],
      relearningStepsMinutes: [10],
      graduatingIntervalDays: 1,
      easyIntervalDays: 4,
      desiredRetention: 0.9,
      maximumIntervalDays: 365,
      minimumLapseIntervalDays: 1,
      intervalModifier: 1.0,
      enableFuzz: true,
      newCardsPerDay: 20,
      maxReviewsPerDay: 200,
      learnAheadMinutes: 20,
      queueOrder: 'mix'
    }
  },
  fewer_reps: {
    id: 'fewer_reps',
    title: 'Poucas Repetições',
    subtitle: 'Passo 20m • Retenção 85% • Graduação 2d',
    summary: 'Para revisão sustentável com menos revisões diárias e saltos iniciais maiores (2d / 6d).',
    settings: {
      learningStepsMinutes: [20],
      relearningStepsMinutes: [15],
      graduatingIntervalDays: 2,
      easyIntervalDays: 6,
      desiredRetention: 0.85,
      maximumIntervalDays: 365,
      minimumLapseIntervalDays: 1,
      intervalModifier: 1.15,
      enableFuzz: true,
      newCardsPerDay: 15,
      maxReviewsPerDay: 150,
      learnAheadMinutes: 20,
      queueOrder: 'reviews_first'
    }
  }
};

export const DEFAULT_FLASHCARD_SETTINGS: FlashcardSchedulerSettings = {
  presetMode: 'moderate',
  ...FLASHCARD_PRESETS.moderate.settings
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function ratingToGrade(rating: FlashcardRating): 1 | 2 | 3 | 4 {
  if (rating === 'again') return 1;
  if (rating === 'hard') return 2;
  if (rating === 'good') return 3;
  return 4;
}

/**
 * Converte string de passos no formato Anki (ex.: "1m 10m 1h 1d") em array de minutos.
 */
export function parseStepsInput(input: string, fallback: number[] = [10]): number[] {
  if (!input || !input.trim()) return [];
  const tokens = input
    .trim()
    .split(/[\s,;]+/)
    .filter(Boolean);

  const parsed: number[] = [];
  for (const token of tokens) {
    const match = token.toLowerCase().match(/^(\d+(?:[.,]\d+)?)(m|min|h|d)?$/);
    if (!match) continue;
    const rawNum = parseFloat(match[1].replace(',', '.'));
    if (!Number.isFinite(rawNum) || rawNum <= 0) continue;
    const unit = match[2] || 'm';
    let minutes = rawNum;
    if (unit === 'h') minutes = rawNum * 60;
    else if (unit === 'd') minutes = rawNum * 1440;
    parsed.push(clamp(Math.round(minutes * 10) / 10, 0.5, 43200));
  }

  return parsed.length > 0 ? parsed : fallback;
}

/**
 * Formata array de passos em minutos para string editável estilo Anki (ex.: "1m 10m").
 */
export function formatStepsInput(steps: number[]): string {
  if (!steps || steps.length === 0) return '';
  return steps
    .map((m) => {
      if (m >= 1440 && m % 1440 === 0) return `${m / 1440}d`;
      if (m >= 60 && m % 60 === 0) return `${m / 60}h`;
      return `${m}m`;
    })
    .join(' ');
}

/**
 * Garante que todas as configurações estejam dentro de faixas seguras e coerentes com o preset.
 */
export function resolveEffectiveSchedulerSettings(
  raw?: Partial<FlashcardSchedulerSettings> | null
): FlashcardSchedulerSettings {
  const mode: FlashcardPresetMode =
    raw?.presetMode === 'more_reps' ||
    raw?.presetMode === 'moderate' ||
    raw?.presetMode === 'fewer_reps' ||
    raw?.presetMode === 'custom_anki'
      ? raw.presetMode
      : 'moderate';

  if (mode !== 'custom_anki') {
    return {
      presetMode: mode,
      ...FLASHCARD_PRESETS[mode].settings,
      updatedAt: raw?.updatedAt
    };
  }

  const base = DEFAULT_FLASHCARD_SETTINGS;
  const learningSteps = Array.isArray(raw?.learningStepsMinutes)
    ? raw.learningStepsMinutes.filter((n) => typeof n === 'number' && n > 0 && Number.isFinite(n))
    : base.learningStepsMinutes;
  const relearningSteps = Array.isArray(raw?.relearningStepsMinutes)
    ? raw.relearningStepsMinutes.filter((n) => typeof n === 'number' && n > 0 && Number.isFinite(n))
    : base.relearningStepsMinutes;

  return {
    presetMode: 'custom_anki',
    learningStepsMinutes: learningSteps.length > 0 ? learningSteps : [10],
    relearningStepsMinutes: relearningSteps.length > 0 ? relearningSteps : [10],
    graduatingIntervalDays: clamp(Math.round(Number(raw?.graduatingIntervalDays) || base.graduatingIntervalDays), 1, 30),
    easyIntervalDays: clamp(Math.round(Number(raw?.easyIntervalDays) || base.easyIntervalDays), 1, 60),
    desiredRetention: clamp(Number(raw?.desiredRetention) || base.desiredRetention, 0.75, 0.97),
    maximumIntervalDays: clamp(Math.round(Number(raw?.maximumIntervalDays) || base.maximumIntervalDays), 7, 36500),
    minimumLapseIntervalDays: clamp(Math.round(Number(raw?.minimumLapseIntervalDays) || base.minimumLapseIntervalDays), 1, 30),
    intervalModifier: clamp(Number(raw?.intervalModifier) || base.intervalModifier, 0.5, 2.0),
    enableFuzz: raw?.enableFuzz !== undefined ? Boolean(raw.enableFuzz) : base.enableFuzz,
    newCardsPerDay: clamp(Math.round(Number(raw?.newCardsPerDay) || base.newCardsPerDay), 0, 999),
    maxReviewsPerDay: clamp(Math.round(Number(raw?.maxReviewsPerDay) || base.maxReviewsPerDay), 0, 9999),
    learnAheadMinutes: clamp(Math.round(Number(raw?.learnAheadMinutes) ?? base.learnAheadMinutes), 0, 120),
    queueOrder:
      raw?.queueOrder === 'reviews_first' || raw?.queueOrder === 'new_first' || raw?.queueOrder === 'mix'
        ? raw.queueOrder
        : base.queueOrder,
    updatedAt: raw?.updatedAt
  };
}

// --- Equações FSRS-5 ---

function initialStability(grade: 1 | 2 | 3 | 4): number {
  return Math.max(0.1, FSRS5_WEIGHTS[grade - 1]);
}

function initialDifficulty(grade: 1 | 2 | 3 | 4): number {
  const d0 = FSRS5_WEIGHTS[4] - Math.exp(FSRS5_WEIGHTS[5] * (grade - 1)) + 1;
  return clamp(d0, 1, 10);
}

function forgettingCurve(elapsedDays: number, stability: number): number {
  const safeS = Math.max(0.1, stability);
  const safeElapsed = Math.max(0, elapsedDays);
  return Math.pow(1 + (FSRS_FACTOR * safeElapsed) / safeS, FSRS_DECAY);
}

function nextIntervalFromStability(stability: number, desiredRetention: number): number {
  const safeS = Math.max(0.1, stability);
  const safeR = clamp(desiredRetention, 0.7, 0.98);
  const interval = (safeS / FSRS_FACTOR) * (Math.pow(safeR, 1 / FSRS_DECAY) - 1);
  return Math.max(1, interval);
}

function nextDifficulty(currentD: number, grade: 1 | 2 | 3 | 4): number {
  const deltaD = -FSRS5_WEIGHTS[6] * (grade - 3);
  const linearDamping = currentD + (deltaD * (10 - currentD)) / 9;
  const meanTarget = initialDifficulty(4);
  const nextD = FSRS5_WEIGHTS[7] * meanTarget + (1 - FSRS5_WEIGHTS[7]) * linearDamping;
  return clamp(nextD, 1, 10);
}

function shortTermStability(currentS: number, grade: 1 | 2 | 3 | 4): number {
  const s = Math.max(0.1, currentS);
  const factor = Math.exp(FSRS5_WEIGHTS[17] * (grade - 3 + FSRS5_WEIGHTS[18]));
  return Math.max(0.1, s * factor);
}

function recallStability(currentD: number, currentS: number, retrievability: number, grade: 2 | 3 | 4): number {
  const s = Math.max(0.1, currentS);
  const hardPenalty = grade === 2 ? FSRS5_WEIGHTS[15] : 1;
  const easyBonus = grade === 4 ? FSRS5_WEIGHTS[16] : 1;
  const growth =
    Math.exp(FSRS5_WEIGHTS[8]) *
    (11 - currentD) *
    Math.pow(s, -FSRS5_WEIGHTS[9]) *
    (Math.exp(FSRS5_WEIGHTS[10] * (1 - retrievability)) - 1) *
    hardPenalty *
    easyBonus +
    1;
  return Math.max(s, s * growth);
}

function forgetStability(currentD: number, currentS: number, retrievability: number): number {
  const s = Math.max(0.1, currentS);
  const postLapse =
    FSRS5_WEIGHTS[11] *
    Math.pow(currentD, -FSRS5_WEIGHTS[12]) *
    (Math.pow(s + 1, FSRS5_WEIGHTS[13]) - 1) *
    Math.exp(FSRS5_WEIGHTS[14] * (1 - retrievability));
  return clamp(postLapse, 0.1, s);
}

function stabilityForTargetInterval(intervalDays: number, desiredRetention: number): number {
  const safeR = clamp(desiredRetention, 0.7, 0.98);
  const denom = Math.pow(safeR, 1 / FSRS_DECAY) - 1;
  if (denom <= 0) return Math.max(0.5, intervalDays);
  return Math.max(0.1, (intervalDays * FSRS_FACTOR) / denom);
}

function applyIntervalFuzz(days: number, enabled: boolean, randomSeed?: number): number {
  if (!enabled || days < 3) return Math.round(days);
  const delta = Math.max(1, Math.round(days * 0.05));
  const r = randomSeed !== undefined ? randomSeed : Math.random();
  const offset = Math.round((r * 2 - 1) * delta);
  return Math.max(2, Math.round(days) + offset);
}

function computeHardStepMinutes(steps: number[], stepIndex: number, graduatingDays: number): number {
  if (steps.length === 0) return graduatingDays * 1440;
  if (stepIndex === 0) {
    if (steps.length >= 2) {
      return Math.max(1, Math.round((steps[0] + steps[1]) / 2));
    }
    // Regra canônica Anki para passo único: média entre passo 0 e graduação
    return Math.max(steps[0] + 1, Math.round((steps[0] + graduatingDays * 1440) / 2));
  }
  const safeIdx = Math.min(stepIndex, steps.length - 1);
  return steps[safeIdx];
}

function createBaseProgress(now: Date): FlashcardProgress {
  return {
    state: 'new',
    repetitions: 0,
    intervalDays: 0,
    stepIndex: 0,
    scheduledDays: 0,
    easeFactor: 2.5,
    stability: 1.0,
    difficulty: 5.0,
    retrievability: 1.0,
    nextReviewDate: now.toISOString(),
    lapses: 0
  };
}

/**
 * Formata um intervalo em dias (incluindo frações intradia) no estilo Anki em pt-BR.
 */
export function formatIntervalLabel(intervalDays: number): string {
  if (!Number.isFinite(intervalDays) || intervalDays <= 0) return '< 1 min';
  const totalMinutes = intervalDays * 1440;
  if (totalMinutes < 1) return '< 1 min';
  if (totalMinutes < 60) {
    return `${Math.round(totalMinutes)} min`;
  }
  if (intervalDays < 1) {
    const hours = Math.round(totalMinutes / 60);
    return `${hours} h`;
  }
  const days = Math.max(1, Math.round(intervalDays));
  if (days === 1) return '1 dia';
  if (days < 30) return `${days} dias`;
  if (days < 365) {
    const months = Math.round((days / 30) * 10) / 10;
    return `${String(months).replace('.', ',')} m`;
  }
  const years = Math.round((days / 365) * 10) / 10;
  return `${String(years).replace('.', ',')} a`;
}

/**
 * Agenda a próxima revisão de um flashcard usando FSRS-5 + Passos estilo Anki.
 * Se applyFuzz=false (usado na prévia dos botões), retorna o intervalo determinístico exato.
 */
export function scheduleCard(
  currentProgress: FlashcardProgress | undefined,
  rating: FlashcardRating,
  now: Date = new Date(),
  rawSettings?: Partial<FlashcardSchedulerSettings> | null,
  options?: { applyFuzz?: boolean; fuzzSeed?: number }
): FlashcardProgress {
  const settings = resolveEffectiveSchedulerSettings(rawSettings);
  const current = currentProgress || createBaseProgress(now);
  const grade = ratingToGrade(rating);
  const applyFuzz = options?.applyFuzz ?? settings.enableFuzz;

  const currentState: FSRSState = current.state || 'new';
  const elapsedDays = current.lastReviewDate
    ? Math.max(0, (now.getTime() - new Date(current.lastReviewDate).getTime()) / MS_PER_DAY)
    : 0;

  let nextState: FSRSState = currentState;
  let nextStepIndex = current.stepIndex ?? 0;
  const repetitions = (current.repetitions || 0) + 1;
  let lapses = current.lapses || 0;
  let easeFactor = current.easeFactor || 2.5;
  let nextS = current.stability || 1.0;
  let nextD = current.difficulty || 5.0;
  let nextRetrievability = currentState === 'new' ? 1.0 : forgettingCurve(elapsedDays, nextS);
  let intervalDays = 0;
  let scheduledDays = current.scheduledDays ?? current.intervalDays ?? 0;
  let nextDate: Date;

  const toReviewInterval = (days: number): number => {
    const fuzzed = applyIntervalFuzz(days, applyFuzz, options?.fuzzSeed);
    return clamp(fuzzed, 1, settings.maximumIntervalDays);
  };

  if (currentState === 'new' || currentState === 'learning') {
    const steps = settings.learningStepsMinutes;
    const stepIdx = currentState === 'new' ? 0 : Math.min(current.stepIndex ?? 0, Math.max(0, steps.length - 1));

    if (currentState === 'new') {
      nextS = initialStability(grade);
      nextD = initialDifficulty(grade);
      nextRetrievability = 1.0;
    } else {
      nextS = shortTermStability(current.stability || initialStability(grade), grade);
      nextD = nextDifficulty(current.difficulty || 5.0, grade);
      nextRetrievability = forgettingCurve(elapsedDays, current.stability || 1.0);
    }

    if (rating === 'again') {
      nextState = steps.length > 0 ? 'learning' : 'review';
      nextStepIndex = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      if (steps.length > 0) {
        const mins = steps[0];
        intervalDays = mins / 1440;
        nextDate = new Date(now.getTime() + mins * MS_PER_MINUTE);
      } else {
        intervalDays = 1;
        scheduledDays = 1;
        nextDate = new Date(now.getTime() + 1 * MS_PER_DAY);
      }
    } else if (rating === 'hard') {
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      if (steps.length > 0) {
        nextState = 'learning';
        nextStepIndex = stepIdx;
        const mins = computeHardStepMinutes(steps, stepIdx, settings.graduatingIntervalDays);
        intervalDays = mins / 1440;
        nextDate = new Date(now.getTime() + mins * MS_PER_MINUTE);
      } else {
        nextState = 'review';
        intervalDays = 1;
        scheduledDays = 1;
        nextDate = new Date(now.getTime() + 1 * MS_PER_DAY);
      }
    } else if (rating === 'good') {
      const nextStep = stepIdx + 1;
      if (nextStep < steps.length) {
        nextState = 'learning';
        nextStepIndex = nextStep;
        const mins = steps[nextStep];
        intervalDays = mins / 1440;
        nextDate = new Date(now.getTime() + mins * MS_PER_MINUTE);
      } else {
        nextState = 'review';
        nextStepIndex = 0;
        const gradDays = toReviewInterval(settings.graduatingIntervalDays * settings.intervalModifier);
        intervalDays = gradDays;
        scheduledDays = gradDays;
        nextS = Math.max(nextS, stabilityForTargetInterval(gradDays, settings.desiredRetention));
        nextDate = new Date(now.getTime() + gradDays * MS_PER_DAY);
      }
    } else {
      // Easy: graduação imediata
      nextState = 'review';
      nextStepIndex = 0;
      easeFactor = Math.min(3.0, easeFactor + 0.15);
      const easyDays = toReviewInterval(
        Math.max(settings.graduatingIntervalDays + 1, settings.easyIntervalDays * settings.intervalModifier)
      );
      intervalDays = easyDays;
      scheduledDays = easyDays;
      nextS = Math.max(nextS, stabilityForTargetInterval(easyDays, settings.desiredRetention));
      nextDate = new Date(now.getTime() + easyDays * MS_PER_DAY);
    }
  } else if (currentState === 'relearning') {
    const steps = settings.relearningStepsMinutes;
    const stepIdx = Math.min(current.stepIndex ?? 0, Math.max(0, steps.length - 1));
    const targetResumeDays = Math.max(
      settings.minimumLapseIntervalDays,
      Math.round(current.scheduledDays || settings.minimumLapseIntervalDays)
    );

    nextS = shortTermStability(current.stability || 1.0, grade);
    nextD = nextDifficulty(current.difficulty || 5.0, grade);
    nextRetrievability = forgettingCurve(elapsedDays, current.stability || 1.0);

    if (rating === 'again') {
      nextState = steps.length > 0 ? 'relearning' : 'review';
      nextStepIndex = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      if (steps.length > 0) {
        const mins = steps[0];
        intervalDays = mins / 1440;
        scheduledDays = targetResumeDays;
        nextDate = new Date(now.getTime() + mins * MS_PER_MINUTE);
      } else {
        intervalDays = targetResumeDays;
        scheduledDays = targetResumeDays;
        nextDate = new Date(now.getTime() + targetResumeDays * MS_PER_DAY);
      }
    } else if (rating === 'hard') {
      if (steps.length > 0) {
        nextState = 'relearning';
        nextStepIndex = stepIdx;
        const mins = computeHardStepMinutes(steps, stepIdx, targetResumeDays);
        intervalDays = mins / 1440;
        scheduledDays = targetResumeDays;
        nextDate = new Date(now.getTime() + mins * MS_PER_MINUTE);
      } else {
        nextState = 'review';
        intervalDays = targetResumeDays;
        scheduledDays = targetResumeDays;
        nextDate = new Date(now.getTime() + targetResumeDays * MS_PER_DAY);
      }
    } else if (rating === 'good') {
      const nextStep = stepIdx + 1;
      if (nextStep < steps.length) {
        nextState = 'relearning';
        nextStepIndex = nextStep;
        const mins = steps[nextStep];
        intervalDays = mins / 1440;
        scheduledDays = targetResumeDays;
        nextDate = new Date(now.getTime() + mins * MS_PER_MINUTE);
      } else {
        nextState = 'review';
        nextStepIndex = 0;
        const resumeDays = toReviewInterval(targetResumeDays);
        intervalDays = resumeDays;
        scheduledDays = resumeDays;
        nextDate = new Date(now.getTime() + resumeDays * MS_PER_DAY);
      }
    } else {
      nextState = 'review';
      nextStepIndex = 0;
      easeFactor = Math.min(3.0, easeFactor + 0.1);
      const easyResumeDays = toReviewInterval(Math.max(targetResumeDays + 1, Math.round(targetResumeDays * 1.3)));
      intervalDays = easyResumeDays;
      scheduledDays = easyResumeDays;
      nextDate = new Date(now.getTime() + easyResumeDays * MS_PER_DAY);
    }
  } else {
    // Estado 'review' (ciclo FSRS-5 completo)
    const prevInterval = Math.max(1, current.intervalDays || 1);
    const currentS = Math.max(0.5, current.stability || stabilityForTargetInterval(prevInterval, settings.desiredRetention));
    const currentD = clamp(current.difficulty || 5.0, 1, 10);
    const effectiveElapsed = elapsedDays > 0 ? elapsedDays : prevInterval;
    nextRetrievability = forgettingCurve(effectiveElapsed, currentS);
    nextD = nextDifficulty(currentD, grade);

    if (rating === 'again') {
      lapses += 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      nextS = forgetStability(currentD, currentS, nextRetrievability);

      const rawLapseDays = nextIntervalFromStability(nextS, settings.desiredRetention) * settings.intervalModifier;
      const postLapseDays = clamp(
        Math.round(rawLapseDays),
        settings.minimumLapseIntervalDays,
        Math.max(settings.minimumLapseIntervalDays, Math.floor(prevInterval * 0.7))
      );
      scheduledDays = postLapseDays;

      const relearnSteps = settings.relearningStepsMinutes;
      if (relearnSteps.length > 0) {
        nextState = 'relearning';
        nextStepIndex = 0;
        const mins = relearnSteps[0];
        intervalDays = mins / 1440;
        nextDate = new Date(now.getTime() + mins * MS_PER_MINUTE);
      } else {
        nextState = 'review';
        nextStepIndex = 0;
        intervalDays = postLapseDays;
        nextDate = new Date(now.getTime() + postLapseDays * MS_PER_DAY);
      }
    } else {
      nextState = 'review';
      nextStepIndex = 0;
      if (rating === 'hard') easeFactor = Math.max(1.3, easeFactor - 0.15);
      if (rating === 'easy') easeFactor = Math.min(3.0, easeFactor + 0.15);

      nextS =
        effectiveElapsed < 1
          ? shortTermStability(currentS, grade)
          : recallStability(currentD, currentS, nextRetrievability, grade as 2 | 3 | 4);

      const rawDays = nextIntervalFromStability(nextS, settings.desiredRetention) * settings.intervalModifier;
      let candidateDays = toReviewInterval(rawDays);

      // Garante ordenação monotônica estilo Anki: Hard < Good < Easy quando aplicável
      if (rating === 'hard') {
        candidateDays = Math.min(candidateDays, Math.max(1, Math.round(prevInterval * 1.2)));
      } else if (rating === 'good') {
        const hardRef = Math.max(1, Math.round(prevInterval * 1.2));
        candidateDays = Math.max(candidateDays, Math.min(settings.maximumIntervalDays, Math.max(prevInterval + 1, hardRef)));
      } else if (rating === 'easy') {
        const goodRef = Math.max(
          prevInterval + 1,
          toReviewInterval(
            nextIntervalFromStability(
              effectiveElapsed < 1
                ? shortTermStability(currentS, 3)
                : recallStability(currentD, currentS, nextRetrievability, 3),
              settings.desiredRetention
            ) * settings.intervalModifier
          )
        );
        candidateDays = Math.max(candidateDays, Math.min(settings.maximumIntervalDays, goodRef + 1));
      }

      intervalDays = candidateDays;
      scheduledDays = candidateDays;
      nextDate = new Date(now.getTime() + candidateDays * MS_PER_DAY);
    }
  }

  return {
    state: nextState,
    repetitions,
    intervalDays: Math.round(intervalDays * 10000) / 10000,
    stepIndex: nextStepIndex,
    scheduledDays: Math.round(scheduledDays * 10000) / 10000,
    easeFactor: Math.round(easeFactor * 100) / 100,
    stability: Math.round(nextS * 100) / 100,
    difficulty: Math.round(nextD * 100) / 100,
    retrievability: Math.round(nextRetrievability * 1000) / 1000,
    lastReviewDate: now.toISOString(),
    nextReviewDate: nextDate.toISOString(),
    lapses,
    lastRating: rating,
    history: [...(current.history || []), rating]
  };
}

export interface RatingPreviewOption {
  label: string;
  nextState: FSRSState;
  intervalDays: number;
}

/**
 * Gera projeção determinística para os 4 botões usando exatamente a mesma lógica de scheduleCard.
 */
export function previewRatingOptions(
  currentProgress: FlashcardProgress | undefined,
  now: Date = new Date(),
  rawSettings?: Partial<FlashcardSchedulerSettings> | null
): Record<FlashcardRating, RatingPreviewOption> {
  const ratings: FlashcardRating[] = ['again', 'hard', 'good', 'easy'];
  const result = {} as Record<FlashcardRating, RatingPreviewOption>;

  for (const r of ratings) {
    const projected = scheduleCard(currentProgress, r, now, rawSettings, { applyFuzz: false });
    result[r] = {
      label: formatIntervalLabel(projected.intervalDays),
      nextState: projected.state,
      intervalDays: projected.intervalDays
    };
  }

  return result;
}

/**
 * Calcula contadores Anki (Novo / Aprender / Revisar) consistentes com o algoritmo.
 */
export function calculateAnkiDeckCounts(
  cards: FlashcardItem[],
  now: Date = new Date()
): { novo: number; aprender: number; revisar: number; total: number } {
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  let novo = 0;
  let aprender = 0;
  let revisar = 0;

  for (const c of cards) {
    const p = c.progress;
    if (!p || p.state === 'new') {
      novo += 1;
    } else if (p.state === 'learning' || p.state === 'relearning') {
      if (!p.nextReviewDate || new Date(p.nextReviewDate) <= endOfToday) {
        aprender += 1;
      }
    } else if (p.state === 'review') {
      if (!p.nextReviewDate || new Date(p.nextReviewDate) <= endOfToday) {
        revisar += 1;
      }
    }
  }

  return { novo, aprender, revisar, total: cards.length };
}
