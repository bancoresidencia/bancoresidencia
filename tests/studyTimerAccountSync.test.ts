import assert from 'node:assert';
import {
  getUserTimerStateStorageKey,
  getPlatformActiveStorageKey,
  readLocalTimerState,
  writeLocalTimerState,
  clearLocalTimerState,
  readLocalPlatformActiveSeconds,
  writeLocalPlatformActiveSeconds,
  PersistedTimerState
} from '../src/services/userTimerRuntimeService';
import { getUserStudySessionsStorageKey } from '../src/services/userStudySessionsService';
import { getUserScheduledTasksStorageKey } from '../src/services/userScheduledTasksService';

// Simula ambiente de navegador para validação determinística de isolamento por conta e F5
const store = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
  setItem: (key: string, value: string) => {
    store.set(key, String(value));
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
  clear: () => store.clear(),
  key: (index: number) => Array.from(store.keys())[index] ?? null,
  get length() {
    return store.size;
  }
};

Object.defineProperty(globalThis, 'window', { value: { localStorage: mockLocalStorage }, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, configurable: true });

console.log('--- Testando Isolamento por Conta, F5 e Sincronização de Estado do Relógio ---');

// 1. Isolamento estrito de chaves por userId
const uidA = '11111111-1111-4111-8111-111111111111';
const uidB = '22222222-2222-4222-8222-222222222222';

assert.notStrictEqual(
  getUserTimerStateStorageKey(uidA),
  getUserTimerStateStorageKey(uidB),
  'Chaves do estado do cronômetro devem ser isoladas por userId'
);
assert.notStrictEqual(
  getUserStudySessionsStorageKey(uidA),
  getUserStudySessionsStorageKey(uidB),
  'Chaves de sessões devem ser isoladas por userId'
);
assert.notStrictEqual(
  getUserScheduledTasksStorageKey(uidA),
  getUserScheduledTasksStorageKey(uidB),
  'Chaves de tarefas devem ser isoladas por userId'
);
console.log('✓ 1. Isolamento estrito de chaves por userId validado');

// 2. Persistência completa contra F5 durante bateria de questões (preservando questionsCount, correctCount, incorrectCount)
const activeQuestionTimer: PersistedTimerState = {
  userId: uidA,
  status: 'running',
  accumulatedSeconds: 185,
  runningSince: Date.now() - 5000,
  sessionStartTime: '2026-11-18T03:00:00.000Z',
  selectedTaxonomy: { especialidade: 'Clínica Médica', tema: 'Cardiologia', rawLabel: 'Cardiologia' },
  studyType: 'questoes',
  sessionSource: 'questoes',
  questionsCount: 9,
  correctCount: 7,
  incorrectCount: 2,
  updatedAtMs: Date.now()
};

writeLocalTimerState(activeQuestionTimer, uidA);

const restoredAfterF5 = readLocalTimerState(uidA);
assert.ok(restoredAfterF5 !== null, 'Timer ativo da Conta A deve ser restaurado após F5');
assert.strictEqual(restoredAfterF5?.questionsCount, 9, 'Contagem de questões deve sobreviver ao F5');
assert.strictEqual(restoredAfterF5?.correctCount, 7, 'Contagem de acertos deve sobreviver ao F5');
assert.strictEqual(restoredAfterF5?.incorrectCount, 2, 'Contagem de erros deve sobreviver ao F5');
assert.strictEqual(restoredAfterF5?.sessionSource, 'questoes', 'Origem questoes deve sobreviver ao F5');
console.log('✓ 2. Resiliência a F5 com preservação integral de questões respondidas validada');

// 3. Conta B no mesmo navegador NÃO herda cronômetro nem tempo ativo da Conta A
const restoredForB = readLocalTimerState(uidB);
assert.strictEqual(restoredForB, null, 'Conta B não pode herdar cronômetro ativo da Conta A');

writeLocalPlatformActiveSeconds(uidA, '2026-11-18', 2400);
assert.strictEqual(readLocalPlatformActiveSeconds(uidA, '2026-11-18'), 2400);
assert.strictEqual(readLocalPlatformActiveSeconds(uidB, '2026-11-18'), 0, 'Conta B não pode herdar tempo ativo diário da Conta A');
assert.notStrictEqual(
  getPlatformActiveStorageKey(uidA, '2026-11-18'),
  getPlatformActiveStorageKey(uidB, '2026-11-18')
);
console.log('✓ 3. Zero vazamento entre Conta A e Conta B no mesmo navegador validado');

// 4. Migração única e remoção imediata da chave legada global
clearLocalTimerState(uidA);
mockLocalStorage.setItem(
  'bancoresidencia_study_timer_state',
  JSON.stringify({
    status: 'paused',
    accumulatedSeconds: 600,
    runningSince: null,
    sessionStartTime: '2026-11-18T02:00:00.000Z',
    selectedTaxonomy: { especialidade: 'Pediatria' }
  })
);

const migratedOnce = readLocalTimerState(uidA);
assert.ok(migratedOnce !== null, 'Deve migrar estado legado na primeira leitura');
assert.strictEqual(migratedOnce?.accumulatedSeconds, 600);
assert.strictEqual(
  mockLocalStorage.getItem('bancoresidencia_study_timer_state'),
  null,
  'Chave legada global deve ser apagada imediatamente após migração'
);
assert.strictEqual(
  readLocalTimerState(uidB),
  null,
  'Segunda conta não pode receber chave legada já migrada'
);
console.log('✓ 4. Higienização definitiva de chave legada validada');

console.log('\n🎉 TODOS OS TESTES DE CONTA E SINCRONIZAÇÃO DO RELÓGIO PASSARAM COM 100% DE SUCESSO!\n');
