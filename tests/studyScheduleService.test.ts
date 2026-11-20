import assert from 'node:assert';
import {
  buildFocusKey,
  getScheduleStorageKey,
  readLocalScheduleCache,
  writeLocalScheduleCache
} from '../src/utils/studyScheduleStorage';
import {
  toUserStudySchedule,
  toUserScheduleItem,
  toUserFocusProgress,
  DbScheduleRow,
  DbScheduleItemRow,
  DbFocusProgressRow
} from '../src/utils/studyScheduleMappers';
import {
  saveUserSchedule,
  loadUserSchedule,
  saveScheduleItemsBatch,
  moveScheduleItem,
  toggleScheduleItemCompletion,
  upsertFocusProgress,
  deleteScheduleItem
} from '../src/services/studyScheduleService';
import { UserStudySchedule, UserScheduleItem } from '../src/types/studySchedule';

// Mock determinístico de localStorage e window para testes sem navegador
const memoryStore = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => (memoryStore.has(key) ? memoryStore.get(key)! : null),
  setItem: (key: string, value: string) => {
    memoryStore.set(key, String(value));
  },
  removeItem: (key: string) => {
    memoryStore.delete(key);
  },
  clear: () => memoryStore.clear(),
  key: (index: number) => Array.from(memoryStore.keys())[index] ?? null,
  get length() {
    return memoryStore.size;
  }
};

Object.defineProperty(globalThis, 'window', {
  value: { localStorage: mockLocalStorage },
  configurable: true
});
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  configurable: true
});

async function runTests() {
  console.log('🧪 Iniciando Testes Unitários de Arquitetura: Cronograma de Estudos (Etapa 1)');

  // 1. Teste de buildFocusKey (Determinismo e Limpeza Canônica)
  const key1 = buildFocusKey('Clínica Médica', 'Cardiologia', 'Hipertensão Arterial Sistêmica');
  assert.strictEqual(key1, 'clinica_medica__cardiologia__hipertensao_arterial_sistemica');

  const key2 = buildFocusKey('Ginecologia e Obstetrícia', 'Pré-Natal', 'Pré-Eclâmpsia & Eclâmpsia');
  assert.strictEqual(key2, 'ginecologia_e_obstetricia__pre_natal__pre_eclampsia_eclampsia');
  console.log('  ✅ 1. buildFocusKey sanitiza acentos e caracteres especiais com precisão.');

  // 2. Teste de Isolamento de Storage por Usuário
  const keyUser1 = getScheduleStorageKey('user-111');
  const keyUser2 = getScheduleStorageKey('user-222');
  const keyGuest = getScheduleStorageKey(null);
  assert.notStrictEqual(keyUser1, keyUser2);
  assert.notStrictEqual(keyUser1, keyGuest);
  assert.strictEqual(keyGuest, 'bancoresidencia_study_schedule_guest');
  console.log('  ✅ 2. Chaves de storage isoladas por aluno com proteção multitenant.');

  // 3. Teste dos Mappers de Banco de Dados
  const dbSchedRow: DbScheduleRow = {
    id: 'sched-1',
    user_id: 'user-111',
    title: 'Rumo ao ENARE 2026',
    target_exam: 'ENARE',
    target_exam_date: '2026-10-20',
    start_date: '2026-03-01',
    weekly_study_days: [1, 2, 3, 4, 5],
    daily_focus_target: 2,
    is_active: true,
    auto_revision_intervals: [1, 7, 30],
    settings: { rhythm: 'intensivo' }
  };
  const modelSched = toUserStudySchedule(dbSchedRow);
  assert.strictEqual(modelSched.id, 'sched-1');
  assert.strictEqual(modelSched.targetExam, 'ENARE');
  assert.strictEqual(modelSched.dailyFocusTarget, 2);
  assert.strictEqual(modelSched.settings?.rhythm, 'intensivo');

  const dbItemRow: DbScheduleItemRow = {
    id: 'item-101',
    schedule_id: 'sched-1',
    user_id: 'user-111',
    especialidade: 'Cirurgia Geral',
    tema: 'Abdome Agudo',
    foco: 'Apendicite Aguda',
    scheduled_date: '2026-04-10',
    item_type: 'theory',
    is_completed: false,
    order_index: 0
  };
  const modelItem = toUserScheduleItem(dbItemRow);
  assert.strictEqual(modelItem.foco, 'Apendicite Aguda');
  assert.strictEqual(modelItem.itemType, 'theory');
  assert.strictEqual(modelItem.isCompleted, false);

  const dbProgRow: DbFocusProgressRow = {
    id: 'prog-1',
    user_id: 'user-111',
    focus_key: 'cirurgia_geral__abdome_agudo__apendicite_aguda',
    especialidade: 'Cirurgia Geral',
    tema: 'Abdome Agudo',
    foco: 'Apendicite Aguda',
    is_studied: true,
    review_count: 2,
    last_reviewed_at: '2026-04-17T10:00:00Z',
    next_review_date: '2026-05-10'
  };
  const modelProg = toUserFocusProgress(dbProgRow);
  assert.strictEqual(modelProg.isStudied, true);
  assert.strictEqual(modelProg.reviewCount, 2);
  console.log('  ✅ 3. Mappers DB <-> Model funcionam com tipagem estrita.');

  // 4. Teste de Operações do Serviço de Cronograma (Modo Local/Offline demo-student)
  const testUserId = 'demo-student';

  const newSchedule: UserStudySchedule = {
    id: 'sched-test-1',
    userId: testUserId,
    title: 'Cronograma ENARE Alta Performance',
    targetExam: 'ENARE',
    targetExamDate: '2026-10-25',
    startDate: '2026-03-01',
    weeklyStudyDays: [1, 2, 3, 4, 5],
    dailyFocusTarget: 2,
    isActive: true,
    autoRevisionIntervals: [1, 7, 30]
  };

  await saveUserSchedule(newSchedule, testUserId);
  const loadedInitial = await loadUserSchedule(testUserId);
  assert.strictEqual(loadedInitial.schedule?.title, 'Cronograma ENARE Alta Performance');

  // 5. Inserção de Itens no Cronograma
  const itemsToInsert: UserScheduleItem[] = [
    {
      id: 'item-1',
      scheduleId: 'sched-test-1',
      userId: testUserId,
      especialidade: 'Clínica Médica',
      tema: 'Cardiologia',
      foco: 'Insuficiência Cardíaca',
      scheduledDate: '2026-04-01',
      itemType: 'theory',
      isCompleted: false,
      orderIndex: 0
    },
    {
      id: 'item-2',
      scheduleId: 'sched-test-1',
      userId: testUserId,
      especialidade: 'Cirurgia Geral',
      tema: 'Trauma',
      foco: 'Trauma Abdominal Fechado',
      scheduledDate: '2026-04-01',
      itemType: 'theory',
      isCompleted: false,
      orderIndex: 1
    }
  ];
  await saveScheduleItemsBatch(itemsToInsert, testUserId);
  const loadedWithItems = await loadUserSchedule(testUserId);
  assert.strictEqual(loadedWithItems.items.length, 2);
  assert.strictEqual(loadedWithItems.items[0].foco, 'Insuficiência Cardíaca');
  console.log('  ✅ 4. Inserção e leitura em lote de itens no cronograma validadas.');

  // 6. Teste de Movimentação de Item (Drag-and-Drop)
  const moved = await moveScheduleItem('item-1', '2026-04-05', 2, testUserId);
  assert.strictEqual(moved, true);
  const loadedAfterMove = await loadUserSchedule(testUserId);
  const movedItem = loadedAfterMove.items.find((i) => i.id === 'item-1');
  assert.strictEqual(movedItem?.scheduledDate, '2026-04-05');
  assert.strictEqual(movedItem?.orderIndex, 2);
  console.log('  ✅ 5. Movimentação de item entre datas (Drag-and-Drop) concluída com sucesso.');

  // 7. Teste de Conclusão e Marcação
  const completed = await toggleScheduleItemCompletion('item-1', true, testUserId);
  assert.strictEqual(completed, true);
  const loadedAfterToggle = await loadUserSchedule(testUserId);
  const toggledItem = loadedAfterToggle.items.find((i) => i.id === 'item-1');
  assert.strictEqual(toggledItem?.isCompleted, true);
  assert.ok(toggledItem?.completedAt);
  console.log('  ✅ 6. Conclusão de item agendado e registro de completedAt validados.');

  // 8. Teste de Upsert de Progresso do Foco
  const updatedProg = await upsertFocusProgress(
    {
      especialidade: 'Clínica Médica',
      tema: 'Cardiologia',
      foco: 'Insuficiência Cardíaca',
      isStudied: true,
      reviewCount: 1,
      nextReviewDate: '2026-04-12'
    },
    testUserId
  );
  assert.strictEqual(updatedProg.isStudied, true);
  assert.strictEqual(updatedProg.reviewCount, 1);
  assert.strictEqual(updatedProg.nextReviewDate, '2026-04-12');

  const loadedAfterProg = await loadUserSchedule(testUserId);
  const progInState = loadedAfterProg.focusProgress[updatedProg.focusKey];
  assert.strictEqual(progInState.isStudied, true);
  assert.strictEqual(progInState.reviewCount, 1);
  console.log('  ✅ 7. Upsert de progresso do foco e rastreamento de revisões validados.');

  // 9. Teste de Deleção de Item
  const deleted = await deleteScheduleItem('item-2', testUserId);
  assert.strictEqual(deleted, true);
  const loadedAfterDel = await loadUserSchedule(testUserId);
  assert.strictEqual(loadedAfterDel.items.length, 1);
  assert.strictEqual(loadedAfterDel.items[0].id, 'item-1');
  console.log('  ✅ 8. Deleção atômica de item do cronograma validada.');

  console.log('\n🎉 TODOS OS TESTES DA ETAPA 1 PASSARAM COM 100% DE SUCESSO!\n');
}

runTests().catch((err) => {
  console.error('❌ Falha nos testes de studyScheduleService:', err);
  process.exit(1);
});
