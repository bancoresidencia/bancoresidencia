import type { SupabaseClient } from '@supabase/supabase-js';

export const CANONICAL_QUESTION_TABLES = [
  'questions_direto',
  'questions_rplus',
  'questions_revalida',
  'questions_titulo'
] as const;

export type CanonicalQuestionTable = (typeof CANONICAL_QUESTION_TABLES)[number];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_ANSWER_TOKENS = new Set(['A', 'B', 'C', 'D', 'E', 'ANULADA']);

export function isUuidIdentifier(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}

export function resolveCanonicalViewsForModalidades(modalidades?: string[]): string[] {
  if (!modalidades || modalidades.length === 0) {
    return [
      'view_questions_acesso_direto',
      'view_questions_revalida',
      'view_questions_rplus',
      'view_questions_titulo'
    ];
  }

  const views = new Set<string>();
  for (const rawMod of modalidades) {
    const m = String(rawMod || '').trim();
    if (m === 'Acesso Direto' || m === 'Residência Médica') {
      views.add('view_questions_acesso_direto');
    } else if (m.toLowerCase().includes('revalida')) {
      views.add('view_questions_revalida');
    } else if (m === 'R+' || m.startsWith('R+')) {
      views.add('view_questions_rplus');
    } else if (m === 'Título de Especialista' || m.startsWith('Título') || m.startsWith('Titulo')) {
      views.add('view_questions_titulo');
    }
  }

  if (views.size === 0) {
    return ['view_questions_acesso_direto'];
  }
  return Array.from(views);
}

/**
 * Localiza uma questão prioritariamente nas 4 tabelas canônicas (por ID ou código),
 * mantendo fallback apenas residual para registros órfãos na tabela legada `questions`.
 */
export async function findCanonicalQuestionByIdOrCode<T extends Record<string, unknown>>(
  supabaseAdmin: SupabaseClient,
  identifier: string,
  columns: string
): Promise<{ row: T | null; sourceTable: string | null }> {
  const cleanId = identifier.trim();
  if (!cleanId) return { row: null, sourceTable: null };

  // 1. Busca primária paralela por PK `id` nas 4 tabelas canônicas
  const byIdResults = await Promise.all(
    CANONICAL_QUESTION_TABLES.map(async (table) => {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select(columns)
        .eq('id', cleanId)
        .maybeSingle();
      return { table, data: error ? null : (data as unknown as T | null) };
    })
  );

  const exactIdHit = byIdResults.find((r) => r.data !== null);
  if (exactIdHit && exactIdHit.data) {
    return { row: exactIdHit.data, sourceTable: exactIdHit.table };
  }

  // 2. Fallback por `code` nas 4 tabelas canônicas
  const byCodeResults = await Promise.all(
    CANONICAL_QUESTION_TABLES.map(async (table) => {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select(columns)
        .eq('code', cleanId)
        .limit(1);
      const first = !error && Array.isArray(data) && data.length > 0 ? (data[0] as unknown as T) : null;
      return { table, data: first };
    })
  );

  const codeHit = byCodeResults.find((r) => r.data !== null);
  if (codeHit && codeHit.data) {
    return { row: codeHit.data, sourceTable: codeHit.table };
  }

  // 3. Fallback residual na tabela legada `questions` (apenas para órfãos históricos)
  if (isUuidIdentifier(cleanId)) {
    const { data } = await supabaseAdmin
      .from('questions')
      .select(columns)
      .eq('id', cleanId)
      .maybeSingle();
    if (data) return { row: data as unknown as T, sourceTable: 'questions' };
  }

  const { data: legacyCodeData } = await supabaseAdmin
    .from('questions')
    .select(columns)
    .eq('code', cleanId)
    .limit(1);
  if (Array.isArray(legacyCodeData) && legacyCodeData.length > 0) {
    return { row: legacyCodeData[0] as unknown as T, sourceTable: 'questions' };
  }

  return { row: null, sourceTable: null };
}

/**
 * Busca um conjunto de questões em lote nas 4 tabelas canônicas (por `id` e fallback por `code`).
 */
export async function findCanonicalQuestionsByIdsOrCodes<
  T extends { id: string; code?: string | null }
>(
  supabaseAdmin: SupabaseClient,
  identifiers: string[],
  columns: string
): Promise<T[]> {
  const uniqueIds = Array.from(new Set(identifiers.map((s) => s.trim()).filter(Boolean)));
  if (uniqueIds.length === 0) return [];

  const collected = new Map<string, T>();
  const matchedInputs = new Set<string>();

  const registerRows = (rows: T[] | null | undefined) => {
    if (!Array.isArray(rows)) return;
    for (const row of rows) {
      if (row && row.id) {
        if (!collected.has(row.id)) {
          collected.set(row.id, row);
        }
        matchedInputs.add(row.id);
        if (row.code) matchedInputs.add(row.code);
      }
    }
  };

  // 1. Consulta indexada paralela por `id` nas 4 tabelas canônicas (`id` é TEXT nas 4)
  const idBatchResults = await Promise.all(
    CANONICAL_QUESTION_TABLES.map((table) =>
      supabaseAdmin.from(table).select(columns).in('id', uniqueIds)
    )
  );
  for (const res of idBatchResults) {
    if (!res.error && res.data) {
      registerRows(res.data as unknown as T[]);
    }
  }

  // 2. Qualquer identificador restante é consultado por `code` nas 4 canônicas + fallback legado
  const remaining = uniqueIds.filter((ident) => !matchedInputs.has(ident));
  if (remaining.length > 0) {
    const codeBatchResults = await Promise.all(
      CANONICAL_QUESTION_TABLES.map((table) =>
        supabaseAdmin.from(table).select(columns).in('code', remaining)
      )
    );
    for (const res of codeBatchResults) {
      if (!res.error && res.data) {
        registerRows(res.data as unknown as T[]);
      }
    }

    const stillRemainingUuids = remaining.filter(
      (ident) => !matchedInputs.has(ident) && isUuidIdentifier(ident)
    );
    if (stillRemainingUuids.length > 0) {
      const legacyRes = await supabaseAdmin
        .from('questions')
        .select(columns)
        .in('id', stillRemainingUuids);
      if (!legacyRes.error && legacyRes.data) {
        registerRows(legacyRes.data as unknown as T[]);
      }
    }
  }

  return Array.from(collected.values());
}

/**
 * Atualiza uma questão na(s) tabela(s) canônica(s) correspondente(s), sincronizando
 * automaticamente `has_gabarito`, `updated_at` e espelhando na tabela legada `questions` se aplicável.
 */
export async function updateCanonicalQuestion<T extends { id: string }>(
  supabaseAdmin: SupabaseClient,
  identifier: string,
  payload: Record<string, unknown>,
  selectColumns: string
): Promise<{ updatedRows: T[]; error: Error | null }> {
  const cleanId = identifier.trim();
  if (!cleanId) {
    return { updatedRows: [], error: new Error('Identificador de questão vazio.') };
  }

  const canonicalPayload: Record<string, unknown> = {
    ...payload,
    updated_at: new Date().toISOString()
  };

  if ('correct_answer' in payload || 'is_anulada' in payload) {
    const normAns =
      typeof payload.correct_answer === 'string' ? payload.correct_answer.trim().toUpperCase() : '';
    const isAnul = payload.is_anulada === true || normAns === 'ANULADA';
    canonicalPayload.has_gabarito = Boolean(isAnul || VALID_ANSWER_TOKENS.has(normAns));
  }

  const updatedRows: T[] = [];
  let lastError: Error | null = null;

  const tryUpdateByColumn = async (column: 'id' | 'code') => {
    const results = await Promise.all(
      CANONICAL_QUESTION_TABLES.map((table) =>
        supabaseAdmin
          .from(table)
          .update(canonicalPayload)
          .eq(column, cleanId)
          .select(selectColumns)
      )
    );

    for (const res of results) {
      if (res.error) {
        lastError = new Error(res.error.message);
      } else if (Array.isArray(res.data) && res.data.length > 0) {
        updatedRows.push(...(res.data as unknown as T[]));
      }
    }
  };

  await tryUpdateByColumn('id');
  if (updatedRows.length === 0) {
    await tryUpdateByColumn('code');
  }

  // Espelha atualização na tabela legada `questions` (sem `updated_at`) para evitar regressão de leitura legada
  const targetLegacyId = updatedRows[0]?.id || cleanId;
  if (isUuidIdentifier(targetLegacyId)) {
    const legacyPayload = { ...canonicalPayload };
    delete legacyPayload.updated_at;
    delete legacyPayload.sub_subfoco;
    const legacyRes = await supabaseAdmin
      .from('questions')
      .update(legacyPayload)
      .eq('id', targetLegacyId)
      .select(selectColumns);
    if (updatedRows.length === 0 && !legacyRes.error && Array.isArray(legacyRes.data) && legacyRes.data.length > 0) {
      updatedRows.push(...(legacyRes.data as unknown as T[]));
      lastError = null;
    }
  }

  return {
    updatedRows,
    error: updatedRows.length > 0 ? null : lastError
  };
}
