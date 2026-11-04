import { createClient } from '@/lib/supabase/client';

export function getBookmarksStorageKey(userId?: string | null): string {
  return userId ? `bancoresidencia_bookmarks_${userId}` : 'bancoresidencia_bookmarks_guest';
}

/**
 * Carrega as questões favoritadas do aluno a partir do cache local (0ms)
 * e realiza reconciliação em segundo plano com a tabela 'user_bookmarks' do Supabase.
 */
export async function loadUserBookmarks(userId?: string | null): Promise<Record<string, boolean>> {
  const key = getBookmarksStorageKey(userId);
  let localBookmarks: Record<string, boolean> = {};

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        localBookmarks = JSON.parse(saved) || {};
      } else {
        // Migração suave da chave legada 'br_bookmarked_questions'
        const legacy = localStorage.getItem('br_bookmarked_questions');
        if (legacy) {
          try {
            const parsed = JSON.parse(legacy);
            if (parsed && typeof parsed === 'object') {
              localBookmarks = parsed;
              localStorage.setItem(key, JSON.stringify(localBookmarks));
            }
          } catch {}
        }
      }
    } catch {
      localBookmarks = {};
    }
  }

  // Se o aluno está autenticado, busca e reconcilia com o Supabase
  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('question_id')
        .eq('user_id', userId);

      if (!error && data) {
        const remoteMap: Record<string, boolean> = {};
        for (const row of data as { question_id: string }[]) {
          if (row.question_id) remoteMap[row.question_id] = true;
        }

        // Merge: preserva favoritos remotos e locais
        const merged: Record<string, boolean> = { ...localBookmarks, ...remoteMap };

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(key, JSON.stringify(merged));
            localStorage.setItem('br_bookmarked_questions', JSON.stringify(merged));
          } catch {}
        }

        // Detecta favoritos locais que ainda não estão no banco remoto (ex: marcados offline)
        const missingOnRemote = Object.keys(localBookmarks).filter(
          (qid) => localBookmarks[qid] && !remoteMap[qid]
        );

        if (missingOnRemote.length > 0) {
          const payload = missingOnRemote.map((qid) => ({
            user_id: userId,
            question_id: qid
          }));

          supabase
            .from('user_bookmarks')
            .upsert(payload, { onConflict: 'user_id,question_id' })
            .then(({ error: upErr }) => {
              if (upErr) console.warn('[userBookmarksService] Erro ao sincronizar favoritos locais no Supabase:', upErr);
            }, () => {});
        }

        return merged;
      }
    } catch (e) {
      console.warn('[userBookmarksService] Falha na reconciliação remota de favoritos:', e);
    }
  }

  return localBookmarks;
}

/**
 * Alterna o estado de favorito de uma questão, salvando instantaneamente no localStorage
 * e sincronizando com a tabela 'user_bookmarks' do Supabase se autenticado.
 */
export async function toggleUserBookmark(
  questionId: string,
  isBookmarked: boolean,
  userId?: string | null
): Promise<Record<string, boolean>> {
  const key = getBookmarksStorageKey(userId);
  let current: Record<string, boolean> = {};

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) current = JSON.parse(saved) || {};
    } catch {}
  }

  const next = { ...current };
  if (isBookmarked) {
    next[questionId] = true;
  } else {
    delete next[questionId];
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(next));
      localStorage.setItem('br_bookmarked_questions', JSON.stringify(next));
    } catch {}
  }

  // Sincronização remota atômica com o Supabase
  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      if (isBookmarked) {
        await supabase
          .from('user_bookmarks')
          .upsert(
            {
              user_id: userId,
              question_id: questionId
            },
            { onConflict: 'user_id,question_id' }
          );
      } else {
        await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('question_id', questionId);
      }
    } catch (err) {
      console.warn('[userBookmarksService] Erro ao persistir favorito no Supabase:', err);
    }
  }

  return next;
}

