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

// Pastas padrão iniciais para quando o aluno cria conta ou não possui nenhuma pasta ainda
export const defaultStudentFolders: Folder[] = [
  { id: 'f-clinica', name: 'Clínica Médica', parentId: null, color: '#3b82f6' },
  { id: 'f-cardio', name: 'Cardiologia', parentId: 'f-clinica', color: '#60a5fa' },
  { id: 'f-cirurgia', name: 'Cirurgia Geral', parentId: null, color: '#10b981' },
  { id: 'f-pediatria', name: 'Pediatria', parentId: null, color: '#f59e0b' },
  { id: 'f-go', name: 'Ginecologia e Obstetrícia', parentId: null, color: '#ec4899' },
  { id: 'f-preventiva', name: 'Medicina Preventiva', parentId: null, color: '#8b5cf6' }
];

/**
 * Carrega as pastas do aluno a partir do cache local e sincroniza com o Supabase
 */
export async function loadUserFolders(userId?: string | null): Promise<Folder[]> {
  const key = getFolderStorageKey(userId);
  let localFolders: Folder[] = [];

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        localFolders = JSON.parse(saved);
      } else {
        // Fallback para usuário legado sem namespace ou cria default
        const legacy = localStorage.getItem('bancoresidencia_folders');
        if (legacy) {
          localFolders = JSON.parse(legacy);
          localStorage.setItem(key, legacy);
        } else {
          localFolders = defaultStudentFolders;
          localStorage.setItem(key, JSON.stringify(localFolders));
        }
      }
    } catch {
      localFolders = defaultStudentFolders;
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
        const remoteFolders: Folder[] = rows.map((row) => ({
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
        localLists = JSON.parse(saved);
      } else {
        // Fallback para chave legada
        const legacy = localStorage.getItem('bancoresidencia_lists');
        if (legacy) {
          localLists = JSON.parse(legacy);
          localStorage.setItem(key, legacy);
        } else {
          localLists = [];
        }
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
        const remoteLists: QuestionList[] = rows.map((row) => ({
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
