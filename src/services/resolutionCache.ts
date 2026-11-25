import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface QuestionResolution {
  questionId: string;
  code?: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E' | 'ANULADA' | '';
  isAnulada: boolean;
  commentary: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any[];
}

// Cache em memória de resoluções de questões (gabaritos, comentários e justificativas)
const resolutionCache = new Map<string, QuestionResolution>();

// Ticket de sessão assinado por ID de questão (para suportar paginação e listas > 50 questões)
const ticketByQuestionId = new Map<string, string>();

// Mapa de promessas ativas para evitar requisições redundantes de lote simultâneas
const inFlightBatches = new Map<string, Promise<Record<string, QuestionResolution>>>();

// Ouvintes para reatividade imediata nos componentes
type ResolutionListener = (updatedIds: string[]) => void;
const listeners = new Set<ResolutionListener>();

function notifyListeners(updatedIds: string[]) {
  if (updatedIds.length === 0) return;
  listeners.forEach((listener) => {
    try {
      listener(updatedIds);
    } catch (e) {
      console.warn('[resolutionCache] Erro em ouvinte:', e);
    }
  });
}

export function subscribeToResolutions(listener: ResolutionListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getQuestionResolution(questionId: string): QuestionResolution | undefined {
  if (!questionId) return undefined;
  return resolutionCache.get(questionId);
}

export function hasQuestionResolution(questionId: string): boolean {
  if (!questionId) return false;
  return resolutionCache.has(questionId);
}

export function setQuestionResolution(questionId: string, resolution: QuestionResolution) {
  if (!questionId || !resolution) return;
  resolutionCache.set(questionId, resolution);
  notifyListeners([questionId]);
}

/**
 * Registra os sessionTickets recebidos de /api/questions por questão, preservando
 * a autorização correta ao combinar múltiplas páginas ou lotes > 50 questões.
 */
export function registerSessionTicketsFromResult(result: {
  questions?: { id: string }[];
  sessionTicket?: string;
  sessionTicketsByQuestionId?: Record<string, string>;
}): void {
  if (result.sessionTicketsByQuestionId) {
    Object.entries(result.sessionTicketsByQuestionId).forEach(([qId, ticket]) => {
      if (qId && ticket) ticketByQuestionId.set(qId, ticket);
    });
  }
  if (result.sessionTicket && Array.isArray(result.questions)) {
    for (const q of result.questions) {
      if (q?.id && !result.sessionTicketsByQuestionId?.[q.id]) {
        ticketByQuestionId.set(q.id, result.sessionTicket);
      }
    }
  }
}

/**
 * Obtém headers com Authorization Bearer da sessão local (leitura em memória/storage,
 * sem round-trip de rede) para acelerar a autenticação nos endpoints /solve e /solve-batch.
 */
export async function getClientAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch {
    // fallback silencioso para autenticação por cookie SSR
  }
  return headers;
}

/**
 * Dispara o pré-carregamento em lote de gabaritos, justificativas e comentários.
 * Agrupa IDs pelo sessionTicket correspondente, elimina duplicatas e roda em background.
 */
export async function prefetchQuestionResolutions(
  questionIds: string[],
  fallbackSessionTicket?: string
): Promise<Record<string, QuestionResolution>> {
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return {};
  }

  // Filtra apenas as que ainda não estão em cache
  const missingIds = Array.from(new Set(questionIds.filter((id) => Boolean(id && !resolutionCache.has(id)))));
  if (missingIds.length === 0) {
    const cached: Record<string, QuestionResolution> = {};
    questionIds.forEach((id) => {
      const res = resolutionCache.get(id);
      if (res) cached[id] = res;
    });
    return cached;
  }

  // Agrupa IDs pelo ticket que os autoriza para evitar 403 em listas paginadas ou > 50 itens
  const idsByTicket = new Map<string, string[]>();
  for (const id of missingIds) {
    const ticket = ticketByQuestionId.get(id) || fallbackSessionTicket || '';
    if (!ticket) continue;
    const list = idsByTicket.get(ticket);
    if (list) list.push(id);
    else idsByTicket.set(ticket, [id]);
  }

  if (idsByTicket.size === 0) {
    return {};
  }

  const batchKey = [...missingIds].sort().join(',');
  const existingBatch = inFlightBatches.get(batchKey);
  if (existingBatch) {
    return existingBatch;
  }

  const CHUNK_SIZE = 50;
  const requests: Array<{ ticket: string; chunk: string[] }> = [];
  idsByTicket.forEach((ids, ticket) => {
    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
      requests.push({ ticket, chunk: ids.slice(i, i + CHUNK_SIZE) });
    }
  });

  const batchPromise = (async () => {
    const combinedResults: Record<string, QuestionResolution> = {};
    const updatedIds: string[] = [];
    const headers = await getClientAuthHeaders();

    await Promise.all(
      requests.map(async ({ ticket, chunk }) => {
        try {
          const res = await fetch('/api/questions/solve-batch', {
            method: 'POST',
            headers,
            credentials: 'same-origin',
            body: JSON.stringify({ questionIds: chunk, sessionTicket: ticket })
          });

          if (!res.ok) {
            console.warn(`[/api/questions/solve-batch] HTTP ${res.status}`);
            return;
          }

          const json = await res.json();
          if (json && json.success && json.resolutions) {
            const resolutionsObj = json.resolutions as Record<string, QuestionResolution>;
            Object.entries(resolutionsObj).forEach(([id, data]) => {
              resolutionCache.set(id, data);
              combinedResults[id] = data;
              updatedIds.push(id);
            });
          }
        } catch (err) {
          console.warn('[/api/questions/solve-batch] Falha na comunicação de lote:', err);
        }
      })
    );

    if (updatedIds.length > 0) {
      notifyListeners(updatedIds);
    }

    return combinedResults;
  })().finally(() => {
    inFlightBatches.delete(batchKey);
  });

  inFlightBatches.set(batchKey, batchPromise);
  return batchPromise;
}

/**
 * Aguarda a resolução de uma questão específica caso o lote ainda esteja trafegando na rede.
 */
export async function waitForQuestionResolution(
  questionId: string,
  timeoutMs = 1500
): Promise<QuestionResolution | null> {
  const immediate = resolutionCache.get(questionId);
  if (immediate) return immediate;

  const pendingPromises = Array.from(inFlightBatches.values());
  if (pendingPromises.length === 0) return null;

  try {
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
    await Promise.race([Promise.all(pendingPromises), timeoutPromise]);
    return resolutionCache.get(questionId) || null;
  } catch {
    return null;
  }
}

/**
 * Hook React para obter a resolução de uma questão de forma reativa e sem re-renderizações desnecessárias.
 */
export function useQuestionResolution(questionId: string | undefined): QuestionResolution | undefined {
  const [resolution, setResolution] = useState<QuestionResolution | undefined>(() =>
    questionId ? getQuestionResolution(questionId) : undefined
  );

  useEffect(() => {
    if (!questionId) {
      setResolution(undefined);
      return;
    }

    const current = getQuestionResolution(questionId);
    if (current) {
      setResolution(current);
    }

    const unsubscribe = subscribeToResolutions((updatedIds) => {
      if (updatedIds.includes(questionId)) {
        setResolution(getQuestionResolution(questionId));
      }
    });

    return unsubscribe;
  }, [questionId]);

  return resolution;
}
