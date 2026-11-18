import { createClient } from '@/lib/supabase/client';
import { Folder, QuestionList } from '@/types';
import {
  readMutationJournal,
  markPendingUpsert,
  markPendingDelete,
  clearSyncedUpserts,
  clearSyncedDeletes
} from '@/utils/crossDeviceSync';

interface DbFolderRow {
  id: string;
  user_id?: string;
  name: string;
  parent_id?: string | null;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

interface DbListRow {
  id: string;
  user_id?: string;
  folder_id?: string | null;
  title: string;
  question_ids?: string[];
  total_questions?: number;
  completed_questions?: number;
  last_studied_at?: string;
  in_progress?: boolean;
  progress_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export function getFolderStorageKey(userId?: string | null): string {
  return userId ? `bancoresidencia_folders_${userId}` : 'bancoresidencia_folders_guest';
}

export function getListStorageKey(userId?: string | null): string {
  return userId ? `bancoresidencia_lists_${userId}` : 'bancoresidencia_lists_guest';
}

const MOCK_FOLDER_IDS = new Set([
  'f-clinica',
  'f-cardio',
  'f-coronariana',
  'f-cirurgia',
  'f-abdome',
  'f-apendicite',
  'f-pediatria',
  'f-go',
  'f-preventiva'
]);

export const MOCK_LIST_IDS = new Set([
  'list-1',
  'list-2',
  'list-3',
  'list-4',
  'list-5'
]);

export const defaultStudentFolders: Folder[] = [];

function normalizeFolderObject(raw: Folder | DbFolderRow): Folder {
  const r = raw as Folder & DbFolderRow;
  return {
    id: r.id,
    userId: r.userId || r.user_id,
    name: r.name || 'Pasta',
    parentId: r.parentId !== undefined ? r.parentId : (r.parent_id || null),
    color: r.color || '#3b82f6',
    createdAt: r.createdAt || r.created_at,
    updatedAt: r.updatedAt || r.updated_at
  };
}

function normalizeListObject(raw: QuestionList | DbListRow): QuestionList | null {
  const r = raw as QuestionList & DbListRow & { name?: string };
  if (!r || !r.id) return null;
  const resolvedTitle = r.title || r.name || '';
  if (!resolvedTitle) return null;
  const qIds = Array.isArray(r.questionIds)
    ? r.questionIds
    : Array.isArray(r.question_ids)
    ? r.question_ids
    : [];
  return {
    id: r.id,
    userId: r.userId || r.user_id,
    folderId: r.folderId !== undefined ? r.folderId : (r.folder_id || undefined),
    title: resolvedTitle,
    questionIds: qIds,
    totalQuestions: r.totalQuestions ?? r.total_questions ?? qIds.length,
    completedQuestions: r.completedQuestions ?? r.completed_questions ?? 0,
    lastStudiedAt: r.lastStudiedAt || r.last_studied_at || 'Nunca estudada',
    inProgress: r.inProgress ?? r.in_progress ?? false,
    progressPercentage: r.progressPercentage ?? r.progress_percentage ?? 0,
    createdAt: r.createdAt || r.created_at,
    updatedAt: r.updatedAt || r.updated_at
  };
}

export function readLocalFolders(userId?: string | null): Folder[] {
  if (typeof window === 'undefined') return [];
  const key = getFolderStorageKey(userId);
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as Array<Folder | DbFolderRow>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((f) => f && f.id && !MOCK_FOLDER_IDS.has(f.id))
      .map(normalizeFolderObject);
  } catch {
    return [];
  }
}

export function readLocalLists(userId?: string | null): QuestionList[] {
  if (typeof window === 'undefined') return [];
  const key = getListStorageKey(userId);
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as Array<QuestionList | DbListRow>;
    if (!Array.isArray(parsed)) return [];
    const valid: QuestionList[] = [];
    for (const item of parsed) {
      if (!item || !item.id || MOCK_LIST_IDS.has(item.id)) continue;
      const norm = normalizeListObject(item);
      if (norm) valid.push(norm);
    }
    return valid;
  } catch {
    return [];
  }
}

/**
 * Reconcilia pastas remotas (via bootstrap ou query direta) com o journal local,
 * preservando pastas criadas offline e respeitando exclusões feitas em outros dispositivos.
 */
export async function reconcileUserFoldersWithRemote(
  userId: string,
  rawRemoteFolders: Array<Folder | DbFolderRow>
): Promise<Folder[]> {
  const key = getFolderStorageKey(userId);
  const localFolders = readLocalFolders(userId);
  const journal = readMutationJournal('folders', userId);
  const initKey = `bancoresidencia_folders_journal_init_${userId}`;
  const isFirstJournalSync = typeof window !== 'undefined' && !localStorage.getItem(initKey);
  if (typeof window !== 'undefined' && isFirstJournalSync) {
    try { localStorage.setItem(initKey, '1'); } catch { /* ignore */ }
  }

  const remoteFolders = rawRemoteFolders
    .filter((r) => r && r.id && !MOCK_FOLDER_IDS.has(r.id) && !journal.deletes[r.id])
    .map(normalizeFolderObject);

  const localMap = new Map(localFolders.map((f) => [f.id, f]));
  const mergedMap = new Map<string, Folder>();
  const toUpload: Folder[] = [];

  for (const rf of remoteFolders) {
    const lf = localMap.get(rf.id);
    if (lf && journal.upserts[rf.id]) {
      const localTs = lf.updatedAt ? new Date(lf.updatedAt).getTime() : 0;
      const remoteTs = rf.updatedAt ? new Date(rf.updatedAt).getTime() : 0;
      if (localTs >= remoteTs) {
        mergedMap.set(lf.id, lf);
        toUpload.push(lf);
        continue;
      }
    }
    mergedMap.set(rf.id, rf);
  }

  for (const lf of localFolders) {
    if (journal.deletes[lf.id]) continue;
    if (!mergedMap.has(lf.id) && (journal.upserts[lf.id] || isFirstJournalSync)) {
      mergedMap.set(lf.id, lf);
      toUpload.push(lf);
    }
  }

  const merged = Array.from(mergedMap.values());
  if (typeof window !== 'undefined') {
    try { localStorage.setItem(key, JSON.stringify(merged)); } catch { /* ignore */ }
  }

  const supabase = createClient();
  const pendingDeleteIds = Object.keys(journal.deletes);
  if (pendingDeleteIds.length > 0) {
    const { error: delErr } = await supabase
      .from('user_folders')
      .delete()
      .eq('user_id', userId)
      .in('id', pendingDeleteIds);
    if (!delErr) {
      clearSyncedDeletes('folders', pendingDeleteIds, userId);
    }
  }

  if (toUpload.length > 0) {
    const payload = toUpload.map((f) => ({
      id: f.id,
      user_id: userId,
      name: f.name,
      parent_id: f.parentId || null,
      color: f.color || '#3b82f6',
      updated_at: f.updatedAt || new Date().toISOString()
    }));
    const { error: upErr } = await supabase.from('user_folders').upsert(payload, { onConflict: 'id' });
    if (!upErr) {
      clearSyncedUpserts('folders', Object.keys(journal.upserts), userId);
    }
  } else if (Object.keys(journal.upserts).length > 0) {
    clearSyncedUpserts('folders', Object.keys(journal.upserts), userId);
  }

  return merged;
}

/**
 * Reconcilia listas/cadernos remotos com o journal local (offline-first + multi-dispositivo).
 */
export async function reconcileUserListsWithRemote(
  userId: string,
  rawRemoteLists: Array<QuestionList | DbListRow>
): Promise<QuestionList[]> {
  const key = getListStorageKey(userId);
  const localLists = readLocalLists(userId);
  const journal = readMutationJournal('lists', userId);
  const initKey = `bancoresidencia_lists_journal_init_${userId}`;
  const isFirstJournalSync = typeof window !== 'undefined' && !localStorage.getItem(initKey);
  if (typeof window !== 'undefined' && isFirstJournalSync) {
    try { localStorage.setItem(initKey, '1'); } catch { /* ignore */ }
  }

  const remoteLists: QuestionList[] = [];
  for (const r of rawRemoteLists) {
    if (!r || !r.id || MOCK_LIST_IDS.has(r.id) || journal.deletes[r.id]) continue;
    const norm = normalizeListObject(r);
    if (norm) remoteLists.push(norm);
  }

  const localMap = new Map(localLists.map((l) => [l.id, l]));
  const mergedMap = new Map<string, QuestionList>();
  const toUpload: QuestionList[] = [];

  for (const rl of remoteLists) {
    const ll = localMap.get(rl.id);
    if (ll && journal.upserts[rl.id]) {
      const localTs = ll.updatedAt ? new Date(ll.updatedAt).getTime() : 0;
      const remoteTs = rl.updatedAt ? new Date(rl.updatedAt).getTime() : 0;
      if (localTs >= remoteTs || ll.completedQuestions > rl.completedQuestions) {
        mergedMap.set(ll.id, ll);
        toUpload.push(ll);
        continue;
      }
    }
    mergedMap.set(rl.id, rl);
  }

  for (const ll of localLists) {
    if (journal.deletes[ll.id]) continue;
    if (!mergedMap.has(ll.id) && (journal.upserts[ll.id] || isFirstJournalSync)) {
      mergedMap.set(ll.id, ll);
      toUpload.push(ll);
    }
  }

  const merged = Array.from(mergedMap.values());
  if (typeof window !== 'undefined') {
    try { localStorage.setItem(key, JSON.stringify(merged)); } catch { /* ignore */ }
  }

  const supabase = createClient();
  const pendingDeleteIds = Object.keys(journal.deletes);
  if (pendingDeleteIds.length > 0) {
    const { error: delErr } = await supabase
      .from('user_lists')
      .delete()
      .eq('user_id', userId)
      .in('id', pendingDeleteIds);
    if (!delErr) {
      clearSyncedDeletes('lists', pendingDeleteIds, userId);
    }
  }

  if (toUpload.length > 0) {
    const payload = toUpload.map((l) => ({
      id: l.id,
      user_id: userId,
      folder_id: l.folderId || null,
      title: l.title,
      question_ids: l.questionIds,
      total_questions: l.totalQuestions,
      completed_questions: l.completedQuestions,
      last_studied_at: l.lastStudiedAt,
      in_progress: Boolean(l.inProgress),
      progress_percentage: l.progressPercentage,
      updated_at: l.updatedAt || new Date().toISOString()
    }));
    const { error: upErr } = await supabase.from('user_lists').upsert(payload, { onConflict: 'id' });
    if (!upErr) {
      clearSyncedUpserts('lists', Object.keys(journal.upserts), userId);
    }
  } else if (Object.keys(journal.upserts).length > 0) {
    clearSyncedUpserts('lists', Object.keys(journal.upserts), userId);
  }

  return merged;
}

export async function loadUserFolders(userId?: string | null): Promise<Folder[]> {
  const localFolders = readLocalFolders(userId);

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_folders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return await reconcileUserFoldersWithRemote(userId, data as unknown as DbFolderRow[]);
      }
    } catch {
      // Preserva cache local caso esteja offline
    }
  }

  return localFolders;
}

export async function saveUserFolders(folders: Folder[], userId?: string | null): Promise<void> {
  const key = getFolderStorageKey(userId);
  const stamped = folders.map((f) => ({
    ...f,
    updatedAt: f.updatedAt || new Date().toISOString()
  }));

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(stamped));
    } catch (e) {
      console.error('Erro ao gravar pastas localmente:', e);
    }
  }

  const folderIds = stamped.map((f) => f.id);
  markPendingUpsert('folders', folderIds, userId);

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const payload = stamped.map((f) => ({
        id: f.id,
        user_id: userId,
        name: f.name,
        parent_id: f.parentId || null,
        color: f.color || '#3b82f6',
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('user_folders').upsert(payload, { onConflict: 'id' });
      if (!error) {
        clearSyncedUpserts('folders', folderIds, userId);
      }
    } catch {
      // Mantém na fila offline para reenvio automático
    }
  }
}

export async function loadUserLists(userId?: string | null): Promise<QuestionList[]> {
  const localLists = readLocalLists(userId);

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return await reconcileUserListsWithRemote(userId, data as unknown as DbListRow[]);
      }
    } catch {
      // Preserva cache local caso esteja offline
    }
  }

  return localLists;
}

export async function saveUserLists(lists: QuestionList[], userId?: string | null): Promise<void> {
  const key = getListStorageKey(userId);
  const nowIso = new Date().toISOString();
  const stamped = lists.map((l) => ({
    ...l,
    updatedAt: l.updatedAt || nowIso
  }));

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(stamped));
    } catch (e) {
      console.error('Erro ao gravar listas localmente:', e);
    }
  }

  const listIds = stamped.map((l) => l.id);
  markPendingUpsert('lists', listIds, userId);

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const payload = stamped.map((l) => ({
        id: l.id,
        user_id: userId,
        folder_id: l.folderId || null,
        title: l.title,
        question_ids: l.questionIds,
        total_questions: l.totalQuestions,
        completed_questions: l.completedQuestions,
        last_studied_at: l.lastStudiedAt,
        in_progress: Boolean(l.inProgress),
        progress_percentage: l.progressPercentage,
        updated_at: nowIso
      }));

      const { error } = await supabase.from('user_lists').upsert(payload, { onConflict: 'id' });
      if (!error) {
        clearSyncedUpserts('lists', listIds, userId);
      }
    } catch {
      // Mantém na fila offline para reenvio automático
    }
  }
}

export async function deleteUserListFromDb(listId: string, userId?: string | null): Promise<void> {
  markPendingDelete('lists', listId, userId);
  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('user_lists').delete().eq('id', listId).eq('user_id', userId);
      if (!error) {
        clearSyncedDeletes('lists', listId, userId);
      }
    } catch {
      // Mantém tombstone para sincronizar quando voltar a ficar online
    }
  }
}

export async function deleteUserFolderFromDb(folderId: string, userId?: string | null): Promise<void> {
  markPendingDelete('folders', folderId, userId);
  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('user_folders').delete().eq('id', folderId).eq('user_id', userId);
      if (!error) {
        clearSyncedDeletes('folders', folderId, userId);
      }
    } catch {
      // Mantém tombstone para sincronizar quando voltar a ficar online
    }
  }
}
