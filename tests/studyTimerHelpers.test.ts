import assert from 'node:assert';
import {
  computeSafeElapsedOnRestore,
  shouldDiscardEmptyQuestionSession,
  buildSessionAndScheduleSlot,
  formatSecondsToHms,
  formatSecondsToShort
} from '../src/utils/studyTimerHelpers';

console.log('--- Testando Helpers do Cronômetro de Estudo ---');

// 1. Nunca soma horas fantasmas quando a página ficou fechada por horas
const baseNow = 1_700_000_000_000;
const runningSince = baseNow - 60_000; // começou há 60s antes do último heartbeat
const updatedAtMs = baseNow; // último heartbeat ativo
const fiveHoursLater = baseNow + 5 * 3600 * 1000;

const safeRestored = computeSafeElapsedOnRestore(
  {
    status: 'running',
    accumulatedSeconds: 120,
    runningSince,
    updatedAtMs
  },
  fiveHoursLater
);

assert.strictEqual(
  safeRestored,
  180,
  'Deve somar apenas até updatedAtMs (120s + 60s = 180s), ignorando as 5 horas com aba fechada'
);

// 2. Estado pausado retorna apenas accumulatedSeconds
const safePaused = computeSafeElapsedOnRestore(
  {
    status: 'paused',
    accumulatedSeconds: 455,
    runningSince: null,
    updatedAtMs
  },
  fiveHoursLater
);
assert.strictEqual(safePaused, 455, 'Estado pausado deve preservar exatamente accumulatedSeconds');

// 3. Regra de descarte de sessão de questões sem respostas
assert.strictEqual(shouldDiscardEmptyQuestionSession('questoes', 0), true);
assert.strictEqual(shouldDiscardEmptyQuestionSession('questoes', 3), false);
assert.strictEqual(shouldDiscardEmptyQuestionSession('manual', 0), false);
assert.strictEqual(shouldDiscardEmptyQuestionSession('simulado', 0), false);

// 4. Construção determinística de StudySession e DailyScheduleSlot para salvamento ao sair
const { session, scheduleSlot } = buildSessionAndScheduleSlot({
  id: 'sess_test_1',
  userId: 'user_123',
  startTime: '2026-11-25T15:00:00.000Z',
  endTime: '2026-11-25T15:10:00.000Z',
  durationSeconds: 600,
  taxonomy: { especialidade: 'Clínica Médica', tema: 'Cardiologia' },
  studyType: 'questoes',
  questionsCount: 10,
  correctCount: 8,
  sessionSource: 'questoes'
});

assert.strictEqual(session.id, 'sess_test_1');
assert.strictEqual(session.durationSeconds, 600);
assert.strictEqual(session.durationFormatted, '00:10:00');
assert.strictEqual(session.incorrectCount, 2);
assert.strictEqual(session.accuracy, 80);
assert.strictEqual(scheduleSlot.id, 'task_sess_test_1');
assert.ok(scheduleSlot.description?.includes('Tempo líquido: 00:10:00'));
assert.ok(scheduleSlot.description?.includes('10 questões (8 acertos, 2 erros • 80% de aproveitamento)'));

// 5. Formatação
assert.strictEqual(formatSecondsToHms(3661), '01:01:01');
assert.strictEqual(formatSecondsToShort(3661), '1h 1m 1s');

console.log('✓ Todos os testes dos helpers do cronômetro passaram!');
