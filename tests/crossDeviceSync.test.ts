import assert from 'node:assert';
import {
  readMutationJournal,
  markPendingUpsert,
  markPendingDelete,
  clearSyncedUpserts,
  clearSyncedDeletes,
  clearAllSyncJournalsForUser,
  getCloudSyncSnapshot,
  setCloudSyncState,
  requestImmediateCloudSync,
  onImmediateCloudSyncRequest
} from '../src/utils/crossDeviceSync.ts';

// Minimal browser storage + event polyfill for Node unit tests
const memoryStore = new Map<string, string>();
const listeners = new Map<string, Set<(e: Event) => void>>();

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => (memoryStore.has(key) ? memoryStore.get(key)! : null),
    setItem: (key: string, val: string) => {
      memoryStore.set(key, String(val));
    },
    removeItem: (key: string) => {
      memoryStore.delete(key);
    },
    clear: () => memoryStore.clear()
  },
  configurable: true
});

Object.defineProperty(globalThis, 'window', {
  value: {
    addEventListener: (type: string, fn: (e: Event) => void) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(fn);
    },
    removeEventListener: (type: string, fn: (e: Event) => void) => {
      listeners.get(type)?.delete(fn);
    },
    dispatchEvent: (event: Event) => {
      const set = listeners.get(event.type);
      if (set) {
        for (const fn of set) fn(event);
      }
      return true;
    }
  },
  configurable: true
});

Object.defineProperty(globalThis, 'navigator', {
  value: { onLine: true },
  configurable: true
});

console.log('=== INICIANDO TESTES DE SINCRONIZAÇÃO MULTI-DISPOSITIVO ===\n');

// 1. Offline upsert -> tombstone transition & anti-resurrection invariants
console.log('[1] Testando transição Upsert -> Tombstone (Delete) no diário offline...');
markPendingUpsert('bookmarks', ['q-101', 'q-102'], 'user-alpha');
let journalAlpha = readMutationJournal('bookmarks', 'user-alpha');
assert.ok(journalAlpha.upserts['q-101'], 'q-101 deve estar marcado para upsert');
assert.ok(journalAlpha.upserts['q-102'], 'q-102 deve estar marcado para upsert');

// Usuário remove q-101 ainda offline: deve migrar de upserts para deletes (tombstone)
markPendingDelete('bookmarks', 'q-101', 'user-alpha');
journalAlpha = readMutationJournal('bookmarks', 'user-alpha');
assert.strictEqual(journalAlpha.upserts['q-101'], undefined, 'q-101 não pode permanecer em upserts após exclusão');
assert.ok(journalAlpha.deletes['q-101'], 'q-101 deve possuir tombstone em deletes');
assert.ok(journalAlpha.upserts['q-102'], 'q-102 permanece intacto em upserts');
console.log('    ✓ Upsert convertido para Tombstone sem conflito.');

// 2. Isolamento estrito entre contas em dispositivos compartilhados
console.log('[2] Testando isolamento estrito entre contas (user-alpha vs user-beta)...');
markPendingUpsert('lists', 'list-beta-1', 'user-beta');
const alphaLists = readMutationJournal('lists', 'user-alpha');
const betaLists = readMutationJournal('lists', 'user-beta');
assert.strictEqual(Object.keys(alphaLists.upserts).length, 0, 'user-alpha não deve enxergar listas de user-beta');
assert.ok(betaLists.upserts['list-beta-1'], 'user-beta mantém sua fila isolada');
console.log('    ✓ Filas offline isoladas por usuário.');

// 3. Limpeza seletiva pós-sync e limpeza total no logout
console.log('[3] Testando confirmação de sync e purge no logout...');
clearSyncedDeletes('bookmarks', 'q-101', 'user-alpha');
clearSyncedUpserts('bookmarks', 'q-102', 'user-alpha');
journalAlpha = readMutationJournal('bookmarks', 'user-alpha');
assert.strictEqual(Object.keys(journalAlpha.deletes).length, 0, 'Tombstone sincronizado deve ser limpo');
assert.strictEqual(Object.keys(journalAlpha.upserts).length, 0, 'Upsert sincronizado deve ser limpo');

markPendingUpsert('folders', 'folder-1', 'user-alpha');
clearAllSyncJournalsForUser('user-alpha');
assert.strictEqual(
  Object.keys(readMutationJournal('folders', 'user-alpha').upserts).length,
  0,
  'Logout deve limpar todos os diários do usuário que saiu'
);
assert.ok(
  readMutationJournal('lists', 'user-beta').upserts['list-beta-1'],
  'Logout de user-alpha não pode afetar cache isolado de outro usuário'
);
console.log('    ✓ Confirmação pós-sync e limpeza de logout validadas.');

// 4. Estado observável de Cloud Sync e disparo imediato
console.log('[4] Testando barramento de status Cloud Sync e gatilho manual...');
let forceSyncTriggered = 0;
const unsubscribeForce = onImmediateCloudSyncRequest(() => {
  forceSyncTriggered += 1;
});

setCloudSyncState('synced');
assert.strictEqual(getCloudSyncSnapshot().state, 'synced');
assert.ok(typeof getCloudSyncSnapshot().lastSyncedAt === 'number');

requestImmediateCloudSync();
assert.strictEqual(forceSyncTriggered, 1, 'Gatilho manual deve notificar ouvintes de sincronização');
assert.strictEqual(getCloudSyncSnapshot().state, 'syncing');

unsubscribeForce();
console.log('    ✓ Estado reativo de nuvem e botão manual validados.\n');
console.log('=== TODOS OS TESTES MULTI-DISPOSITIVO PASSARAM COM SUCESSO ===');
