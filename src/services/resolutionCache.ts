import { useState, useEffect } from 'react';

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
 * Dispara o pré-carregamento em lote de gabaritos, justificativas e comentários.
 * Elimina duplicatas, pula questões já cacheadas e roda de forma não bloqueante em background.
 */
export async function prefetchQuestionResolutions(
  questionIds: string[],
  sessionTicket?: string
): Promise<Record<string, QuestionResolution>> {
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return {};
  }

  // Filtra apenas as que ainda não estão em cache
  const missingIds = questionIds.filter((id) => Boolean(id && !resolutionCache.has(id)));
  if (missingIds.length === 0) {
    const cached: Record<string, QuestionResolution> = {};
    questionIds.forEach((id) => {
      const res = resolutionCache.get(id);
      if (res) cached[id] = res;
    });
    return cached;
  }

  // Cria chave determinística para o lote
  const batchKey = [...missingIds].sort().join(',');
  const existingBatch = inFlightBatches.get(batchKey);
  if (existingBatch) {
    return existingBatch;
  }

  // Particiona em blocos de até 50 IDs
  const CHUNK_SIZE = 50;
  const chunks: string[][] = [];
  for (let i = 0; i < missingIds.length; i += CHUNK_SIZE) {
    chunks.push(missingIds.slice(i, i + CHUNK_SIZE));
  }

  const batchPromise = (async () => {
    const combinedResults: Record<string, QuestionResolution> = {};
    const updatedIds: string[] = [];

    await Promise.all(
      chunks.map(async (chunk) => {
        try {
          const res = await fetch('/api/questions/solve-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionIds: chunk, sessionTicket })
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

  // Busca se há algum lote em voo que contenha este ID
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

    // Atualiza imediatamente se já estiver em cache
    const current = getQuestionResolution(questionId);
    if (current) {
      setResolution(current);
    }

    // Se inscreve para atualizações (caso o lote termine depois do mount)
    const unsubscribe = subscribeToResolutions((updatedIds) => {
      if (updatedIds.includes(questionId)) {
        setResolution(getQuestionResolution(questionId));
      }
    });

    return unsubscribe;
  }, [questionId]);

  return resolution;
}

