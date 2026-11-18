import { createClient } from '@/lib/supabase/client';
import {
  readMutationJournal,
  markPendingUpsert,
  markPendingDelete,
  clearSyncedUpserts,
  clearSyncedDeletes
} from '@/utils/crossDeviceSync';

const LEGACY_BOOKMARKS_KEY = 'br_bookmarked_questions';

export function getBookmarksStorageKey(userId?: string | null): string {
  return userId ? `bancoresidencia_bookmarks_${userId}` : 'bancoresidencia_bookmarks_guest';
}

function getBookmarksJournalInitKey(userId: string): string {
  return `bancoresidencia_bookmarks_journal_init_${userId}`;
}

export function readLocalBookmarks(userId?: string | null): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  const key = getBookmarksStorageKey(userId);
  try {
    const saved = localStorage.getItem(key);
    let localBookmarks: Record<string, boolean> = saved
      ? (JSON.parse(saved) as Record<string, boolean>) || {}
      : {};

    const legacy = localStorage.getItem(LEGACY_BOOKMARKS_KEY);
    if (legacy) {
      localStorage.removeItem(LEGACY_BOOKMARKS_KEY);
      try {
        const parsed = JSON.parse(legacy) as Record<string, boolean>;
        if (parsed && typeof parsed === 'object') {
          localBookmarks = { ...parsed, ...localBookmarks };
          localStorage.setItem(key, JSON.stringify(localBookmarks));
        }
      } catch {
        // ignore
      }
    }

    return localBookmarks;
  } catch {
    return {};
  }
}

/**
 * Reconcilia favoritos remotos com o diário local de mutações offline,
 * impedindo ressurreição de favoritos excluídos em outro dispositivo.
 */
export async function reconcileUserBookmarksWithRemote(
  userId: string,
  remoteIds: string[]
): Promise<Record<string, boolean>> {
  const key = getBookmarksStorageKey(userId);
  const localBookmarks = readLocalBookmarks(userId);
  const journal = readMutationJournal('bookmarks', userId);
  const remoteSet = new Set(remoteIds.filter(Boolean));

  const initKey = getBookmarksJournalInitKey(userId);
  const isFirstJournalSync = typeof window !== 'undefined' && !localStorage.getItem(initKey);
  if (typeof window !== 'undefined' && isFirstJournalSync) {
    try {
      localStorage.setItem(initKey, '1');
    } catch {
      // ignore
    }
  }

  const pendingDeleteIds = Object.keys(journal.deletes);
  const pendingUpsertIds = Object.keys(journal.upserts);

  const merged: Record<string, boolean> = {};

  for (const id of remoteSet) {
    if (!journal.deletes[id]) {
      merged[id] = true;
    }
  }

  const toUpload: string[] = [];
  for (const id of Object.keys(localBookmarks)) {
    if (!localBookmarks[id] || journal.deletes[id]) continue;
    if (journal.upserts[id] || isFirstJournalSync) {
      merged[id] = true;
      if (!remoteSet.has(id)) {
        toUpload.push(id);
      }
    }
  }

  for (const id of pendingUpsertIds) {
    if (!journal.deletes[id]) {
      merged[id] = true;
      if (!remoteSet.has(id) && !toUpload.includes(id)) {
        toUpload.push(id);
      }
    }
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(merged));
      localStorage.removeItem(LEGACY_BOOKMARKS_KEY);
    } catch {
      // ignore
    }
  }

  const supabase = createClient();

  if (pendingDeleteIds.length > 0) {
    const stillOnRemote = pendingDeleteIds.filter((id) => remoteSet.has(id));
    if (stillOnRemote.length > 0) {
      const { error: delErr } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', userId)
        .in('question_id', stillOnRemote);
      if (!delErr) {
        clearSyncedDeletes('bookmarks', pendingDeleteIds, userId);
      }
    } else {
      clearSyncedDeletes('bookmarks', pendingDeleteIds, userId);
    }
  }

  if (toUpload.length > 0) {
    const payload = toUpload.map((qid) => ({
      user_id: userId,
      question_id: qid
    }));
    const { error: upErr } = await supabase
      .from('user_bookmarks')
      .upsert(payload, { onConflict: 'user_id,question_id' });
    if (!upErr) {
      clearSyncedUpserts('bookmarks', [...toUpload, ...pendingUpsertIds], userId);
    }
  } else if (pendingUpsertIds.length > 0) {
    clearSyncedUpserts('bookmarks', pendingUpsertIds, userId);
  }

  return merged;
}

/**
 * Carrega as questões favoritadas do aluno a partir do cache local (0ms)
 * e realiza reconciliação com a tabela 'user_bookmarks' do Supabase.
 */
export async function loadUserBookmarks(userId?: string | null): Promise<Record<string, boolean>> {
  const localBookmarks = readLocalBookmarks(userId);

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session?.user || session.user.id !== userId) {
        return localBookmarks;
      }

      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('question_id')
        .eq('user_id', userId)
        .range(0, 4999);

      if (!error && data) {
        const remoteIds = (data as Array<{ question_id: string }>)
          .map((row) => row.question_id)
          .filter(Boolean);
        return await reconcileUserBookmarksWithRemote(userId, remoteIds);
      }
    } catch (e) {
      console.warn('[userBookmarksService] Falha na reconciliação remota de favoritos:', e);
    }
  }

  return localBookmarks;
}

/**
 * Alterna o estado de favorito de uma questão, salvando instantaneamente no localStorage,
 * registrando no journal offline e sincronizando com 'user_bookmarks' no Supabase.
 */
export async function toggleUserBookmark(
  questionId: string,
  isBookmarked: boolean,
  userId?: string | null
): Promise<Record<string, boolean>> {
  const key = getBookmarksStorageKey(userId);
  const current = readLocalBookmarks(userId);

  const next = { ...current };
  if (isBookmarked) {
    next[questionId] = true;
    markPendingUpsert('bookmarks', questionId, userId);
  } else {
    delete next[questionId];
    markPendingDelete('bookmarks', questionId, userId);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(next));
      localStorage.removeItem(LEGACY_BOOKMARKS_KEY);
    } catch {
      // ignore
    }
  }

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      if (isBookmarked) {
        const { error } = await supabase
          .from('user_bookmarks')
          .upsert(
            {
              user_id: userId,
              question_id: questionId
            },
            { onConflict: 'user_id,question_id' }
          );
        if (!error) {
          clearSyncedUpserts('bookmarks', questionId, userId);
        }
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('question_id', questionId);
        if (!error) {
          clearSyncedDeletes('bookmarks', questionId, userId);
        }
      }
    } catch (err) {
      console.warn('[userBookmarksService] Erro ao persistir favorito no Supabase (mantido na fila offline):', err);
    }
  }

  return next;
}
