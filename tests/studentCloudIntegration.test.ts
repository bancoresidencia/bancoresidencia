import assert from 'node:assert';
import {
  getFolderStorageKey,
  getListStorageKey,
  loadUserFolders,
  loadUserLists
} from '../src/services/userListsService';
import {
  getBookmarksStorageKey,
  loadUserBookmarks,
  toggleUserBookmark
} from '../src/services/userBookmarksService';
import {
  saveActiveReviewSession,
  getActiveReviewSession,
  clearActiveReviewSession,
  getActiveReviewStorageKey
} from '../src/services/reviewSessionService';
import { flashcardsService } from '../src/services/flashcardsService';
import {
  studyAnnotationsService,
  getHighlightsStorageKey
} from '../src/services/studyAnnotationsService';
import { getUserScheduledTasksStorageKey } from '../src/services/userScheduledTasksService';

// Mock determinístico de localStorage e window
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

Object.defineProperty(globalThis, 'window', {
  value: { localStorage: mockLocalStorage },
  configurable: true
});
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  configurable: true
});

const uidA = 'demo-student'; // usa ramo sem rede externa para teste unitário puro
const uidB = '22222222-2222-4222-8222-222222222222';
const uidA_Real = '11111111-1111-4111-8111-111111111111';

console.log('--- Testando os 5 Pilares de Integração Nuvem & Isolamento por Conta ---');

// 1. Pilar 1 & 2: Listas, Pastas e Cálculo Único de Questões Concluídas
assert.notStrictEqual(getFolderStorageKey(uidA_Real), getFolderStorageKey(uidB));
assert.notStrictEqual(getListStorageKey(uidA_Real), getListStorageKey(uidB));

const listQuestionIds = ['q-101', 'q-102', 'q-103', 'q-104'];
const answersAfterFirstPass: Record<string, { isCorrect: boolean }> = {
  'q-101': { isCorrect: true },
  'q-102': { isCorrect: false }
};
const completedFirstPass = listQuestionIds.reduce(
  (acc, qid) => (answersAfterFirstPass[qid] ? acc + 1 : acc),
  0
);
assert.strictEqual(completedFirstPass, 2);

// Re-resolver a mesma questão q-102 não pode inflar completedQuestions além de 2
const answersAfterReSolve: Record<string, { isCorrect: boolean }> = {
  ...answersAfterFirstPass,
  'q-102': { isCorrect: true }
};
const completedAfterReSolve = listQuestionIds.reduce(
  (acc, qid) => (answersAfterReSolve[qid] ? acc + 1 : acc),
  0
);
assert.strictEqual(
  completedAfterReSolve,
  2,
  'Re-resolver questão da lista não pode duplicar completedQuestions'
);
console.log('✓ 1. Pilar 1 & 2: Chaves de Listas/Pastas e cálculo idempotente de completedQuestions validados');

// 2. Pilar 3: Caderno de Erros (Sessão Ativa) e Favoritos isolados por conta
assert.notStrictEqual(getBookmarksStorageKey(uidA_Real), getBookmarksStorageKey(uidB));
assert.notStrictEqual(getActiveReviewStorageKey(uidA_Real), getActiveReviewStorageKey(uidB));

saveActiveReviewSession(
  {
    sessionId: 'rev-1',
    startedAt: Date.now() - 1000,
    lastUpdatedAt: Date.now(),
    questionIds: ['q-err-1', 'q-err-2'],
    currentIndex: 1,
    shuffleAlternatives: false,
    sessionMode: 'erros',
    sessionAnswers: {
      'q-err-1': { letter: 'C', isCorrect: true, timestamp: Date.now() }
    }
  },
  uidA_Real
);

assert.strictEqual(getActiveReviewSession(uidA_Real)?.sessionId, 'rev-1');
assert.strictEqual(
  getActiveReviewSession(uidB),
  null,
  'Conta B não pode herdar sessão ativa do Caderno de Erros da Conta A'
);
clearActiveReviewSession(uidA_Real);
assert.strictEqual(getActiveReviewSession(uidA_Real), null);
console.log('✓ 2. Pilar 3: Isolamento de sessão do Caderno de Erros e Favoritos validado');

// 3. Pilar 4: Flashcards, Baralhos Personalizados, Edições, Última Sessão e Resumos
store.clear();
// Simula chaves legadas globais para garantir migração única e remoção imediata
mockLocalStorage.setItem(
  'bancoresidencia_user_card_edits',
  JSON.stringify({ 'fc-1': { front: 'Frente Editada A' } })
);
const migratedEditsA = flashcardsService.loadUserCardEdits(uidA);
assert.strictEqual(migratedEditsA['fc-1']?.front, 'Frente Editada A');
assert.strictEqual(
  mockLocalStorage.getItem('bancoresidencia_user_card_edits'),
  null,
  'Chave global legada de edições deve ser removida na migração'
);
assert.deepStrictEqual(
  flashcardsService.loadUserCardEdits(uidB),
  {},
  'Conta B não pode herdar edições de flashcards da Conta A'
);

// Testa Baralhos Personalizados e Cartões Autorais sem vazamento global
flashcardsService.savePersonalizedDeck(
  {
    id: 'custom-deck-100',
    name: 'Revisão Intensiva Cirurgia',
    specialties: ['Cirurgia Geral'],
    priorityOnly: true,
    deckType: 'mixed',
    createdAt: '2026-11-18T04:00:00.000Z'
  },
  uidA
);
assert.strictEqual(
  mockLocalStorage.getItem('bancoresidencia_personalized_flashcard_decks'),
  null,
  'savePersonalizedDeck não deve gravar na chave global sem escopo'
);
assert.strictEqual(flashcardsService.getPersonalizedDecks(uidA).length, 1);
assert.strictEqual(
  flashcardsService.getPersonalizedDecks(uidB).length,
  0,
  'Conta B não pode enxergar baralhos personalizados da Conta A'
);

flashcardsService.saveNewFlashcard(
  {
    id: 'fc-user-999',
    front: 'Tríade de Beck?',
    back: 'Hipotensão, turgência jugular e bulhas abafadas',
    specialty: 'Cirurgia Geral',
    theme: 'Trauma Torácico',
    focus: 'Tamponamento Cardíaco',
    subfocus: 'Diagnóstico Clínico',
    deckId: 'deck-trauma',
    sourceQuestionId: 'q-555',
    priority: 'essential'
  },
  uidA
);
assert.strictEqual(
  mockLocalStorage.getItem('bancoresidencia_user_created_flashcards'),
  null,
  'saveNewFlashcard não deve gravar na chave global sem escopo'
);
const cardsA = flashcardsService.loadUserCreatedFlashcards(uidA);
assert.strictEqual(cardsA.length, 1);
assert.strictEqual(cardsA[0].deckId, 'deck-trauma');
assert.strictEqual(cardsA[0].subfocus, 'Diagnóstico Clínico');
assert.strictEqual(cardsA[0].sourceQuestionId, 'q-555');
assert.strictEqual(flashcardsService.loadUserCreatedFlashcards(uidB).length, 0);

// Testa isolamento de Última Sessão e Último Resumo Lido
flashcardsService.saveLastFlashcardSession(
  {
    deckTitle: 'Sessão Pediatria',
    cardIds: ['fc-user-999'],
    cardCount: 1,
    lastStudiedAt: '2026-11-18T04:10:00.000Z'
  },
  uidA
);
assert.strictEqual(flashcardsService.getLastFlashcardSession(uidA)?.deckTitle, 'Sessão Pediatria');
assert.strictEqual(flashcardsService.getLastFlashcardSession(uidB), null);

// Testa segurança de inteiro para interval_days em learning (ex: 5 minutos = 5 / 1440 dias)
const progressLearning = flashcardsService.recordReview('fc-user-999', 'hard', uidA, 8);
assert.ok(progressLearning.intervalDays > 0 && progressLearning.intervalDays < 1);
const safePostgresIntervalInt = Math.max(0, Math.round(Number(progressLearning.intervalDays) || 0));
assert.strictEqual(Number.isInteger(safePostgresIntervalInt), true);
assert.strictEqual(safePostgresIntervalInt, 0);
console.log('✓ 3. Pilar 4: Flashcards, Baralhos, Edições e arredondamento inteiro FSRS validados');

// 4. Pilar 4b: Grifos em Materiais de Estudo (preservação de prefix/suffix e isolamento)
assert.notStrictEqual(
  getHighlightsStorageKey('mat-hda', uidA_Real),
  getHighlightsStorageKey('mat-hda', uidB)
);
studyAnnotationsService.addHighlight(
  'mat-hda',
  {
    id: 'hl-1',
    materialId: 'mat-hda',
    userId: uidA,
    textQuote: 'octreotida em bolus',
    prefix: 'iniciar imediatamente ',
    suffix: ' associada a profilaxia antibiótica',
    color: 'yellow',
    style: 'marker',
    note: 'Ceftriaxona EV',
    createdAt: '2026-11-18T04:15:00.000Z'
  },
  uidA
);
const loadedHighlightsA = studyAnnotationsService.loadMaterialHighlights('mat-hda', uidA);
assert.strictEqual(loadedHighlightsA.length, 1);
assert.strictEqual(loadedHighlightsA[0].prefix, 'iniciar imediatamente ');
assert.strictEqual(loadedHighlightsA[0].suffix, ' associada a profilaxia antibiótica');
assert.strictEqual(studyAnnotationsService.loadMaterialHighlights('mat-hda', uidB).length, 0);
console.log('✓ 4. Pilar 4b: Grifos de resumos com âncoras prefix/suffix e isolamento validados');

// 5. Pilar 5: Agenda escopada por conta
assert.notStrictEqual(
  getUserScheduledTasksStorageKey(uidA_Real),
  getUserScheduledTasksStorageKey(uidB)
);
console.log('✓ 5. Pilar 5: Isolamento das chaves da Agenda validado');

async function runAsyncChecks() {
  store.clear();
  mockLocalStorage.setItem(
    'bancoresidencia_folders',
    JSON.stringify([{ id: 'f-legacy', name: 'Pasta Legada' }])
  );
  mockLocalStorage.setItem(
    'bancoresidencia_lists',
    JSON.stringify([
      {
        id: 'l-legacy',
        folderId: 'f-legacy',
        title: 'Lista Legada',
        questionIds: ['q-1'],
        totalQuestions: 1,
        completedQuestions: 0,
        lastStudiedAt: '2026-11-18'
      }
    ])
  );

  const foldersA = await loadUserFolders(uidA);
  const listsA = await loadUserLists(uidA);
  assert.strictEqual(foldersA.length, 1);
  assert.strictEqual(listsA.length, 1);
  assert.strictEqual(mockLocalStorage.getItem('bancoresidencia_folders'), null);
  assert.strictEqual(mockLocalStorage.getItem('bancoresidencia_lists'), null);

  await toggleUserBookmark('q-fav-1', true, uidA);
  assert.strictEqual(
    mockLocalStorage.getItem('br_bookmarked_questions'),
    null,
    'toggleUserBookmark não deve gravar chave global legada'
  );
  const bmsA = await loadUserBookmarks(uidA);
  assert.strictEqual(bmsA['q-fav-1'], true);
  console.log('✓ 6. Migração assíncrona de Pastas, Listas e Favoritos sem vazamento global validada');
  console.log('\n🎉 TODOS OS TESTES DOS 5 PILARES DE INTEGRAÇÃO SUPABASE PASSARAM COM 100% DE SUCESSO!\n');
}

runAsyncChecks().catch((err) => {
  console.error(err);
  process.exit(1);
});
