import { supabase } from '@/lib/supabase';
import type { ExtendedFilterState } from './questionService';
import type { StudyCatalogCounts } from './studyQuestionCatalog';

interface StudyRequest {
  filters?: ExtendedFilterState;
  action?: 'catalog' | 'facets' | 'ids' | 'count';
  page?: number;
  pageSize?: number;
  questionIds?: string[];
  quota?: string;
  excludeIds?: string[];
}

export async function requestStudyQuestions<Result>(request: StudyRequest, signal?: AbortSignal): Promise<Result> {
  const isPersonalized = Boolean(request.filters?.ocultarRevisadas
    || (request.filters?.status && request.filters.status !== 'Todas'));
  const isPublicCount = request.action === 'catalog'
    || ((request.action === 'facets' || request.action === 'count') && !isPersonalized);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!isPublicCount) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  }
  // Student criteria are resolved using the JWT. Local answer maps never leave the browser.
  const filters = request.filters ? { ...request.filters } : undefined;
  if (filters) {
    delete filters.userSolvedIds;
    delete filters.userWrongIds;
    delete filters.userCorrectIds;
  }
  const body = JSON.stringify({ ...request, filters });
  const load = () => fetch('/api/questions', {
    method: 'POST', headers, signal, body,
    credentials: isPublicCount ? 'omit' : 'same-origin'
  });
  const response = await load().catch((error: unknown) => {
    if (signal?.aborted) throw error;
    return null;
  });
  const result = (!response || response.status >= 500) && !signal?.aborted
    ? await load()
    : response;
  if (!result?.ok) throw new Error('Não foi possível carregar o catálogo de questões.');
  return await result.json() as Result;
}

export function fetchStudyCatalog(filters: ExtendedFilterState, signal?: AbortSignal) {
  return requestStudyQuestions<StudyCatalogCounts>({ filters: { modalidades: filters.modalidades }, action: 'catalog' }, signal);
}

export async function fetchStudyQuestionsCount(filters: ExtendedFilterState, signal?: AbortSignal): Promise<number> {
  const res = await requestStudyQuestions<{ total: number }>({ filters, action: 'count' }, signal);
  return Number(res.total ?? 0);
}
