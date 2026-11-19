import { supabase } from '@/lib/supabase';
import type { ExtendedFilterState } from './questionService';
import type { StudyCatalogCounts } from './studyQuestionCatalog';

interface StudyRequest {
  filters?: ExtendedFilterState;
  action?: 'catalog' | 'facets' | 'ids';
  page?: number;
  pageSize?: number;
  questionIds?: string[];
  quota?: string;
  excludeIds?: string[];
}

export async function requestStudyQuestions<Result>(request: StudyRequest, signal?: AbortSignal): Promise<Result> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  // Student criteria are resolved using the JWT. Local answer maps never leave the browser.
  const filters = request.filters ? { ...request.filters } : undefined;
  if (filters) {
    delete filters.userSolvedIds;
    delete filters.userWrongIds;
    delete filters.userCorrectIds;
  }
  const response = await fetch('/api/questions', {
    method: 'POST', headers, signal, body: JSON.stringify({ ...request, filters })
  });
  if (!response.ok) throw new Error('Não foi possível carregar o catálogo de questões.');
  return await response.json() as Result;
}

export function fetchStudyCatalog(filters: ExtendedFilterState, signal?: AbortSignal) {
  return requestStudyQuestions<StudyCatalogCounts>({ filters: { modalidades: filters.modalidades }, action: 'catalog' }, signal);
}
