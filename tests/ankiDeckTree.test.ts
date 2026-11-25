import assert from 'node:assert';
import {
  parseDeckPathSegments,
  buildOriginalDeckTree,
  flattenOriginalDeckTree,
  resolveOrCreateDeckHierarchy,
  matchesDynamicFilterCriteria,
  computeMovedDeckUpdates
} from '../src/utils/ankiDeckTree';
import { parseAnkiText } from '../src/lib/flashcards/ankiPackageParser';
import { parseFlashcardsCsv, buildFlashcardPreviews } from '../src/utils/flashcardDistributionEngine';
import { clinicalHierarchy } from '../src/data/mockQuestions';
import { flashcardsService, isUserCreatedFlashcardId } from '../src/services/flashcardsService';
import { CustomFlashcardDeck, FlashcardItem } from '../src/types/flashcards';

console.log('--- TEST SUITE: Anki Sub-Deck Tree (::), Import Hierarchy & Smart Decks ---');

const now = new Date('2026-11-24T12:00:00.000Z');

function makeUserCard(id: string, deckId: string, overrides?: Partial<FlashcardItem>): FlashcardItem {
  return {
    id,
    front: `Pergunta ${id}`,
    back: `Resposta ${id}`,
    specialty: 'Clínica Médica',
    theme: 'Cardiologia',
    focus: 'SCA',
    deckId,
    ...overrides
  };
}

// 1. parseDeckPathSegments
assert.deepStrictEqual(
  parseDeckPathSegments(' Internato :: Clínica Médica :: Cardiologia '),
  ['Internato', 'Clínica Médica', 'Cardiologia']
);

// 2. buildOriginalDeckTree & flattenOriginalDeckTree
const decks: CustomFlashcardDeck[] = [
  {
    id: 'deck-padrao',
    name: 'Baralho Padrão',
    specialties: [],
    createdAt: '2026-11-01T00:00:00.000Z'
  },
  {
    id: 'deck-cardio',
    name: 'Internato::Clínica::Cardiologia',
    specialties: [],
    createdAt: '2026-11-01T00:00:00.000Z'
  },
  {
    id: 'deck-trauma',
    name: 'Internato::Cirurgia::Trauma',
    specialties: [],
    createdAt: '2026-11-01T00:00:00.000Z'
  }
];

const cards: FlashcardItem[] = [
  makeUserCard('fc-user-1', 'deck-padrao'),
  makeUserCard('fc-user-2', 'deck-cardio'),
  makeUserCard('fc-user-3', 'deck-cardio', {
    progress: {
      flashcardId: 'fc-user-3',
      repetitions: 2,
      intervalDays: 3,
      easeFactor: 2.5,
      stability: 4,
      difficulty: 5,
      lapses: 0,
      state: 'review',
      lastReviewDate: '2026-11-20T10:00:00.000Z',
      nextReviewDate: '2026-11-24T10:00:00.000Z'
    }
  }),
  makeUserCard('fc-user-4', 'deck-trauma', {
    progress: {
      flashcardId: 'fc-user-4',
      repetitions: 0,
      intervalDays: 0,
      easeFactor: 2.5,
      stability: 0.4,
      difficulty: 6,
      lapses: 0,
      state: 'learning',
      lastReviewDate: '2026-11-24T11:55:00.000Z',
      nextReviewDate: '2026-11-24T12:05:00.000Z'
    }
  })
];

const tree = buildOriginalDeckTree(decks, cards, now);
assert.strictEqual(tree.length, 2, 'Root should have Baralho Padrão + Internato');
assert.strictEqual(tree[0].deck?.id, 'deck-padrao', 'Baralho Padrão pinned first');
assert.strictEqual(tree[1].label, 'Internato');
assert.strictEqual(tree[1].counts.total, 3, 'Virtual parent Internato aggregates 3 cards');
assert.strictEqual(tree[1].counts.novo, 1);
assert.strictEqual(tree[1].counts.aprender, 1);
assert.strictEqual(tree[1].counts.revisar, 1);

const expandedDefault = flattenOriginalDeckTree(tree, {});
assert.strictEqual(expandedDefault.length, 6, 'Default expanded shows all 6 nodes (Padrão + Internato + Cirurgia + Trauma + Clínica + Cardio)');

const collapsedInternato = flattenOriginalDeckTree(tree, { Internato: false });
assert.strictEqual(collapsedInternato.length, 2, 'Collapsing Internato hides descendants');

// 3. resolveOrCreateDeckHierarchy preserves :: and reuses matches
const resolved = resolveOrCreateDeckHierarchy(
  ['Internato::Clínica::Cardiologia', 'Internato::Pediatria::Neonatologia', 'Baralho Padrão'],
  decks,
  '2026-11-24T12:00:00.000Z'
);
assert.strictEqual(resolved.deckIdByPath.get('Internato::Clínica::Cardiologia'), 'deck-cardio');
assert.strictEqual(resolved.deckIdByPath.get('Baralho Padrão'), 'deck-padrao');
assert.strictEqual(resolved.createdDecks.length, 1);
assert.strictEqual(resolved.createdDecks[0].name, 'Internato::Pediatria::Neonatologia');

// 4. matchesDynamicFilterCriteria (Smart Deck rules)
const tagPriorityCard = makeUserCard('fc-user-5', 'deck-cardio', {
  priority: 'essential',
  tags: ['enare', 'ecg']
});
assert.strictEqual(
  matchesDynamicFilterCriteria(
    tagPriorityCard,
    [
      { id: '1', type: 'priority', label: 'Essenciais', value: 'Essenciais' },
      { id: '2', type: 'tag', label: '#enare', value: 'enare' },
      { id: '3', type: 'deck', label: 'Internato::Clínica::Cardiologia', value: 'Internato::Clínica::Cardiologia' }
    ],
    decks,
    now
  ),
  true
);
assert.strictEqual(
  matchesDynamicFilterCriteria(
    makeUserCard('fc-user-6', 'deck-trauma', { priority: 'standard' }),
    [{ id: '1', type: 'priority', label: 'Essenciais', value: 'Essenciais' }],
    decks,
    now
  ),
  false
);

// 5. Import parsing preserves sourceDeckName / detectedDeckName
const sampleAnkiTxt = `#separator:tab\n#html:false\n#deck:Internato::Ginecologia::Colo Uterino\nQual idade de início do preventivo pelo MS?\t25 anos`;
const parsedAnki = parseAnkiText(sampleAnkiTxt);
assert.strictEqual(parsedAnki.cards[0].sourceDeckName, 'Internato::Ginecologia::Colo Uterino');

const parsedCsvRows = parseFlashcardsCsv(sampleAnkiTxt);
assert.strictEqual(parsedCsvRows[0].sourceDeckName, 'Internato::Ginecologia::Colo Uterino');
const previews = buildFlashcardPreviews(parsedCsvRows, clinicalHierarchy, 'auto');
assert.strictEqual(previews[0].detectedDeckName, 'Internato::Ginecologia::Colo Uterino');

// 6. Isolamento estrito Cartões do BR vs Cartões Originais & Smart Deck resolution
assert.strictEqual(isUserCreatedFlashcardId('fc-user-123'), true);
assert.strictEqual(isUserCreatedFlashcardId('fc-123'), false);

const mixedCatalog: FlashcardItem[] = [
  makeUserCard('fc-user-cm-1', 'deck-cardio', { priority: 'essential', tags: ['enare'] }),
  makeUserCard('fc-user-cm-2', 'deck-trauma', { priority: 'standard' }),
  {
    id: 'fc-br-cm-1',
    front: 'BR Cardio Essencial',
    back: 'Resposta',
    specialty: 'Clínica Médica',
    theme: 'Cardiologia',
    focus: 'Insuficiência Cardíaca',
    priority: 'essential'
  }
];

const smartDeck: CustomFlashcardDeck = {
  id: 'deck-pers-smart-1',
  name: 'Smart ENARE',
  specialties: [],
  dynamicFilters: [{ id: 'f1', type: 'tag', label: '#enare', value: 'enare' }],
  deckType: 'smart',
  createdAt: '2026-11-24T12:00:00.000Z'
};

const resolvedSmart = flashcardsService.resolvePersonalizedDeckCards(smartDeck, mixedCatalog, decks);
assert.deepStrictEqual(resolvedSmart.map((c) => c.id), ['fc-user-cm-1']);

// Novo cartão criado depois passa a integrar o Smart Deck dinamicamente sem alterar cardIds
const updatedCatalog: FlashcardItem[] = [
  ...mixedCatalog,
  makeUserCard('fc-user-cm-99', 'deck-cardio', { priority: 'essential', tags: ['enare', 'novo'] })
];
const resolvedSmartAfterNewCard = flashcardsService.resolvePersonalizedDeckCards(smartDeck, updatedCatalog, decks);
assert.deepStrictEqual(
  resolvedSmartAfterNewCard.map((c) => c.id),
  ['fc-user-cm-1', 'fc-user-cm-99']
);

// 7. Sub-baralhos recolhidos por padrão quando defaultExpanded = false
const collapsedByDefault = flattenOriginalDeckTree(tree, {}, false);
assert.strictEqual(collapsedByDefault.length, 2, 'Collapsed by default shows only root nodes (Padrão + Internato)');

// 8. Drag & Drop: mover baralho para dentro de outro e depois para fora (raiz)
const movedIntoTrauma = computeMovedDeckUpdates(decks, 'Internato::Clínica::Cardiologia', 'Internato::Cirurgia::Trauma');
assert.strictEqual(movedIntoTrauma.length, 1);
assert.strictEqual(movedIntoTrauma[0].name, 'Internato::Cirurgia::Trauma::Cardiologia');

// Mover pasta pai move todos os descendentes
const movedParentToRoot = computeMovedDeckUpdates(decks, 'Internato::Clínica::Cardiologia', null);
assert.strictEqual(movedParentToRoot.length, 1);
assert.strictEqual(movedParentToRoot[0].name, 'Cardiologia');

// Bloqueia ciclo (mover pai para dentro de si mesmo ou filho) e impede mover Baralho Padrão
assert.deepStrictEqual(computeMovedDeckUpdates(decks, 'Internato', 'Internato::Cirurgia'), []);
assert.deepStrictEqual(computeMovedDeckUpdates(decks, 'deck-padrao', 'Internato'), []);

console.log('✅ ALL ANKI SUB-DECK TREE & SMART DECK TESTS PASSED!');

