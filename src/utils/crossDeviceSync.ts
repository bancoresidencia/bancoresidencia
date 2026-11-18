export type SyncEntity = 'bookmarks' | 'lists' | 'folders';

export type CloudSyncState = 'synced' | 'syncing' | 'offline' | 'error';

export interface CloudSyncSnapshot {
  state: CloudSyncState;
  lastSyncedAt: number | null;
}

const SYNC_EVENT_NAME = 'bancoresidencia_sync_status_change';
const FORCE_SYNC_EVENT_NAME = 'bancoresidencia_force_cloud_sync';
const TOMBSTONE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface EntityMutationJournal {
  upserts: Record<string, number>;
  deletes: Record<string, number>;
}

let currentSnapshot: CloudSyncSnapshot = {
  state: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced',
  lastSyncedAt: null
};

function notifySyncListeners(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<CloudSyncSnapshot>(SYNC_EVENT_NAME, { detail: currentSnapshot }));
}

export function getCloudSyncSnapshot(): CloudSyncSnapshot {
  return currentSnapshot;
}

export function setCloudSyncState(state: CloudSyncState): void {
  const effectiveState: CloudSyncState =
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : state;
  const nextSyncedAt = effectiveState === 'synced' ? Date.now() : currentSnapshot.lastSyncedAt;

  if (currentSnapshot.state === effectiveState && currentSnapshot.lastSyncedAt === nextSyncedAt) {
    return;
  }

  currentSnapshot = {
    state: effectiveState,
    lastSyncedAt: nextSyncedAt
  };
  notifySyncListeners();
}

export function subscribeCloudSync(callback: (snapshot: CloudSyncSnapshot) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<CloudSyncSnapshot>;
    callback(custom.detail || currentSnapshot);
  };

  const handleOnline = () => setCloudSyncState('syncing');
  const handleOffline = () => setCloudSyncState('offline');

  window.addEventListener(SYNC_EVENT_NAME, handler);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener(SYNC_EVENT_NAME, handler);
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export function requestImmediateCloudSync(): void {
  if (typeof window === 'undefined') return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    setCloudSyncState('offline');
    return;
  }
  setCloudSyncState('syncing');
  window.dispatchEvent(new CustomEvent(FORCE_SYNC_EVENT_NAME));
}

export function onImmediateCloudSyncRequest(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener(FORCE_SYNC_EVENT_NAME, handler);
  return () => window.removeEventListener(FORCE_SYNC_EVENT_NAME, handler);
}

function getJournalKey(entity: SyncEntity, userId?: string | null): string {
  return `bancoresidencia_sync_journal_${entity}_${userId || 'guest'}`;
}

export function readMutationJournal(entity: SyncEntity, userId?: string | null): EntityMutationJournal {
  if (typeof window === 'undefined' || !userId) {
    return { upserts: {}, deletes: {} };
  }
  try {
    const raw = localStorage.getItem(getJournalKey(entity, userId));
    if (!raw) return { upserts: {}, deletes: {} };
    const parsed = JSON.parse(raw) as Partial<EntityMutationJournal>;
    const now = Date.now();
    const cleanUpserts: Record<string, number> = {};
    const cleanDeletes: Record<string, number> = {};

    if (parsed.upserts && typeof parsed.upserts === 'object') {
      for (const [id, ts] of Object.entries(parsed.upserts)) {
        if (typeof ts === 'number' && now - ts < TOMBSTONE_TTL_MS) {
          cleanUpserts[id] = ts;
        }
      }
    }
    if (parsed.deletes && typeof parsed.deletes === 'object') {
      for (const [id, ts] of Object.entries(parsed.deletes)) {
        if (typeof ts === 'number' && now - ts < TOMBSTONE_TTL_MS) {
          cleanDeletes[id] = ts;
        }
      }
    }
    return { upserts: cleanUpserts, deletes: cleanDeletes };
  } catch {
    return { upserts: {}, deletes: {} };
  }
}

function writeMutationJournal(
  entity: SyncEntity,
  userId: string | null | undefined,
  journal: EntityMutationJournal
): void {
  if (typeof window === 'undefined' || !userId) return;
  try {
    localStorage.setItem(getJournalKey(entity, userId), JSON.stringify(journal));
  } catch {
    // Storage full or unavailable
  }
}

export function markPendingUpsert(entity: SyncEntity, ids: string | string[], userId?: string | null): void {
  if (!userId || userId === 'demo-student') return;
  const journal = readMutationJournal(entity, userId);
  const now = Date.now();
  const list = Array.isArray(ids) ? ids : [ids];
  for (const id of list) {
    if (!id) continue;
    journal.upserts[id] = now;
    delete journal.deletes[id];
  }
  writeMutationJournal(entity, userId, journal);
}

export function markPendingDelete(entity: SyncEntity, ids: string | string[], userId?: string | null): void {
  if (!userId || userId === 'demo-student') return;
  const journal = readMutationJournal(entity, userId);
  const now = Date.now();
  const list = Array.isArray(ids) ? ids : [ids];
  for (const id of list) {
    if (!id) continue;
    journal.deletes[id] = now;
    delete journal.upserts[id];
  }
  writeMutationJournal(entity, userId, journal);
}

export function clearSyncedUpserts(entity: SyncEntity, ids: string | string[], userId?: string | null): void {
  if (!userId || userId === 'demo-student') return;
  const journal = readMutationJournal(entity, userId);
  const list = Array.isArray(ids) ? ids : [ids];
  for (const id of list) {
    delete journal.upserts[id];
  }
  writeMutationJournal(entity, userId, journal);
}

export function clearSyncedDeletes(entity: SyncEntity, ids: string | string[], userId?: string | null): void {
  if (!userId || userId === 'demo-student') return;
  const journal = readMutationJournal(entity, userId);
  const list = Array.isArray(ids) ? ids : [ids];
  for (const id of list) {
    delete journal.deletes[id];
  }
  writeMutationJournal(entity, userId, journal);
}

export function clearAllSyncJournalsForUser(userId: string): void {
  if (typeof window === 'undefined' || !userId) return;
  const entities: SyncEntity[] = ['bookmarks', 'lists', 'folders'];
  for (const entity of entities) {
    try {
      localStorage.removeItem(getJournalKey(entity, userId));
    } catch {
      // ignore
    }
  }
}
