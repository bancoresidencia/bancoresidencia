import { createClient } from '@/lib/supabase/client';
import { Folder, QuestionList } from '@/types';

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

// Chaves locais com namespace por usuário
export function getFolderStorageKey(userId?: string | null): string {
  return userId ? `bancoresidencia_folders_${userId}` : 'bancoresidencia_folders_guest';
}

export function getListStorageKey(userId?: string | null): string {
  return userId ? `bancoresidencia_lists_${userId}` : 'bancoresidencia_lists_guest';
}

// IDs de pastas e listas de demonstração/mock legadas que devem ser expurgadas de todas as contas
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

// Todo aluno novo começa com 0 pastas e 0 listas pré-criadas
export const defaultStudentFolders: Folder[] = [];

/**
 * Carrega as pastas do aluno a partir do cache local e sincroniza com o Supabase.
 * Expulsa pastas de mock legadas e garante que novas contas comecem limpas.
 */
export async function loadUserFolders(userId?: string | null): Promise<Folder[]> {
  const key = getFolderStorageKey(userId);
  let localFolders: Folder[] = [];

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as Folder[];
        localFolders = Array.isArray(parsed) ? parsed.filter((f) => !MOCK_FOLDER_IDS.has(f.id)) : [];
        if (localFolders.length !== parsed.length) {
          localStorage.setItem(key, JSON.stringify(localFolders));
        }
      } else {
        localFolders = [];
        localStorage.setItem(key, JSON.stringify([]));
      }

      // Limpeza de chave legada se contiver mocks
      const legacy = localStorage.getItem('bancoresidencia_folders');
      if (legacy) {
        try {
          const parsedLegacy = JSON.parse(legacy) as Folder[];
          const cleanedLegacy = Array.isArray(parsedLegacy) ? parsedLegacy.filter((f) => !MOCK_FOLDER_IDS.has(f.id)) : [];
          localStorage.setItem('bancoresidencia_folders', JSON.stringify(cleanedLegacy));
        } catch {}
      }
    } catch {
      localFolders = [];
    }
  }

  // Se o aluno está autenticado, tenta buscar do Supabase
  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_folders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const rows = data as unknown as DbFolderRow[];
        const remoteFolders: Folder[] = rows
          .filter((row) => !MOCK_FOLDER_IDS.has(row.id))
          .map((row) => ({
            id: row.id,
            userId: row.user_id,
            name: row.name,
            parentId: row.parent_id || null,
            color: row.color || '#3b82f6',
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(remoteFolders));
        }
        return remoteFolders;
      }
    } catch {
      // Ignora erro de rede / 404 e preserva o cache local
    }
  }

  return localFolders;
}

/**
 * Salva as pastas do aluno no cache e no Supabase
 */
export async function saveUserFolders(folders: Folder[], userId?: string | null): Promise<void> {
  const key = getFolderStorageKey(userId);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(folders));
    } catch (e) {
      console.error('Erro ao gravar pastas localmente:', e);
    }
  }

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const payload = folders.map((f) => ({
        id: f.id,
        user_id: userId,
        name: f.name,
        parent_id: f.parentId || null,
        color: f.color || '#3b82f6',
        updated_at: new Date().toISOString()
      }));

      await supabase.from('user_folders').upsert(payload, { onConflict: 'id' });
    } catch {
      // Falha silenciosa remota sem travar a interface
    }
  }
}

/**
 * Carrega as listas de questões do aluno a partir do cache local e sincroniza com o Supabase
 */
export async function loadUserLists(userId?: string | null): Promise<QuestionList[]> {
  const key = getListStorageKey(userId);
  let localLists: QuestionList[] = [];

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as QuestionList[];
        localLists = Array.isArray(parsed) ? parsed.filter((l) => !MOCK_LIST_IDS.has(l.id)) : [];
        if (localLists.length !== parsed.length) {
          localStorage.setItem(key, JSON.stringify(localLists));
        }
      } else {
        localLists = [];
        localStorage.setItem(key, JSON.stringify([]));
      }

      // Limpeza de chave legada se contiver mocks
      const legacy = localStorage.getItem('bancoresidencia_lists');
      if (legacy) {
        try {
          const parsedLegacy = JSON.parse(legacy) as QuestionList[];
          const cleanedLegacy = Array.isArray(parsedLegacy) ? parsedLegacy.filter((l) => !MOCK_LIST_IDS.has(l.id)) : [];
          localStorage.setItem('bancoresidencia_lists', JSON.stringify(cleanedLegacy));
        } catch {}
      }
    } catch (e) {
      console.error('Erro ao ler listas locais:', e);
      localLists = [];
    }
  }

  // Se o aluno está autenticado, tenta buscar do Supabase
  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const rows = data as unknown as DbListRow[];
        const remoteLists: QuestionList[] = rows
          .filter((row) => !MOCK_LIST_IDS.has(row.id))
          .map((row) => ({
            id: row.id,
            userId: row.user_id,
            folderId: row.folder_id || undefined,
            title: row.title,
            questionIds: row.question_ids || [],
            totalQuestions: row.total_questions || (row.question_ids ? row.question_ids.length : 0),
            completedQuestions: row.completed_questions || 0,
            lastStudiedAt: row.last_studied_at || 'Nunca estudada',
            inProgress: row.in_progress ?? false,
            progressPercentage: row.progress_percentage || 0,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(remoteLists));
        }
        return remoteLists;
      }
    } catch {
      // Ignora erro de rede / 404 e preserva o cache local
    }
  }

  return localLists;
}

/**
 * Salva as listas de questões do aluno no cache e no Supabase
 */
export async function saveUserLists(lists: QuestionList[], userId?: string | null): Promise<void> {
  const key = getListStorageKey(userId);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(lists));
    } catch (e) {
      console.error('Erro ao gravar listas localmente:', e);
    }
  }

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const payload = lists.map((l) => ({
        id: l.id,
        user_id: userId,
        folder_id: l.folderId || null,
        title: l.title,
        question_ids: l.questionIds,
        total_questions: l.totalQuestions,
        completed_questions: l.completedQuestions,
        last_studied_at: l.lastStudiedAt,
        in_progress: l.inProgress,
        progress_percentage: l.progressPercentage,
        updated_at: new Date().toISOString()
      }));

      await supabase.from('user_lists').upsert(payload, { onConflict: 'id' });
    } catch {
      // Falha silenciosa remota sem travar a interface
    }
  }
}

/**
 * Deleta uma lista no Supabase e no cache local
 */
export async function deleteUserListFromDb(listId: string, userId?: string | null): Promise<void> {
  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      await supabase.from('user_lists').delete().eq('id', listId).eq('user_id', userId);
    } catch {
      // ignore
    }
  }
}

/**
 * Deleta uma pasta no Supabase e no cache local
 */
export async function deleteUserFolderFromDb(folderId: string, userId?: string | null): Promise<void> {
  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      await supabase.from('user_folders').delete().eq('id', folderId).eq('user_id', userId);
    } catch {
      // ignore
    }
  }
}
