import { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { findCanonicalQuestionByIdOrCode } from '@/services/canonicalQuestionStore';
import { injectZeroWidthWatermark } from '@/utils/watermark';
import { sanitizeMedicalText, unpackStructuredCommentary } from '@/utils/textSanitizer';

export interface CachedQuestionData {
  id: string;
  code: string;
  correct_answer: string;
  type: string;
  is_anulada: boolean;
  commentary: string;
  options: unknown[];
  especialidade?: string | null;
  tema?: string | null;
  foco?: string | null;
  subfoco?: string | null;
  difficulty?: string | null;
  banca?: string | null;
  year?: number | null;
  cachedAt: number;
}

export const CANONICAL_SOLVE_COLUMNS =
  'id, code, correct_answer, type, is_anulada, commentary, options, especialidade, tema, foco, subfoco, difficulty, banca, year';

const MAX_MAP_ENTRIES = 5000;
const CACHE_TTL_MS = 30 * 60 * 1000;
const questionCache = new Map<string, CachedQuestionData>();

export function getCachedQuestion(identifier: string, now = Date.now()): CachedQuestionData | null {
  const cached = questionCache.get(identifier);
  if (!cached) return null;
  if (now - cached.cachedAt >= CACHE_TTL_MS) {
    questionCache.delete(identifier);
    return null;
  }
  return cached;
}

export function setCachedQuestion(
  row: {
    id: string;
    code?: string | null;
    correct_answer?: string | null;
    type?: string | null;
    is_anulada?: boolean | null;
    commentary?: string | null;
    options?: unknown[] | null;
    especialidade?: string | null;
    tema?: string | null;
    foco?: string | null;
    subfoco?: string | null;
    difficulty?: string | null;
    banca?: string | null;
    year?: number | null;
  },
  now = Date.now()
): CachedQuestionData {
  if (questionCache.size >= MAX_MAP_ENTRIES) {
    const oldestKey = questionCache.keys().next().value;
    if (oldestKey) questionCache.delete(oldestKey);
  }
  const cacheEntry: CachedQuestionData = {
    id: row.id,
    code: row.code || '',
    correct_answer: row.correct_answer || '',
    type: row.type || '',
    is_anulada: Boolean(row.is_anulada),
    commentary: row.commentary || '',
    options: Array.isArray(row.options) ? row.options : [],
    especialidade: row.especialidade || null,
    tema: row.tema || null,
    foco: row.foco || null,
    subfoco: row.subfoco || null,
    difficulty: row.difficulty || null,
    banca: row.banca || null,
    year: row.year ? Number(row.year) : null,
    cachedAt: now
  };
  questionCache.set(row.id, cacheEntry);
  if (cacheEntry.code) {
    questionCache.set(cacheEntry.code, cacheEntry);
  }
  return cacheEntry;
}

export async function getOrFetchCachedQuestion(
  supabaseAdmin: SupabaseClient,
  questionId: string,
  now = Date.now()
): Promise<CachedQuestionData | null> {
  const cached = getCachedQuestion(questionId, now);
  if (cached) return cached;

  const found = await findCanonicalQuestionByIdOrCode<{
    id: string;
    code?: string;
    correct_answer?: string;
    type?: string;
    is_anulada?: boolean;
    commentary?: string;
    options?: unknown[];
    especialidade?: string | null;
    tema?: string | null;
    foco?: string | null;
    subfoco?: string | null;
    difficulty?: string | null;
    banca?: string | null;
    year?: number | null;
  }>(supabaseAdmin, questionId, CANONICAL_SOLVE_COLUMNS);

  if (!found.row) return null;
  return setCachedQuestion(found.row, now);
}

/**
 * Resolves the authenticated user from an Authorization Bearer token first,
 * falling back to SSR cookies only when no Bearer token is provided.
 */
export async function resolveAuthenticatedUser(
  req: NextRequest,
  supabaseAdmin: SupabaseClient
): Promise<{ id: string } | null> {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token.length > 20) {
      const { data: { user: authUser } } = await supabaseAdmin.auth.getUser(token);
      if (authUser) {
        return { id: authUser.id };
      }
    }
  }

  try {
    const supabaseServer = await createSupabaseServerClient();
    const { data: { user: cookieUser } } = await supabaseServer.auth.getUser();
    if (cookieUser) {
      return { id: cookieUser.id };
    }
  } catch {
    // visitante não autenticado
  }

  return null;
}

/**
 * Unpacks legacy structured commentary, sanitizes medical text, and injects
 * forensic zero-width watermarks on commentary and per-option explanations.
 */
export function formatWatermarkedResolution(
  rawCommentary: string,
  rawOptions: unknown[],
  watermarkId: string,
  sanitizeOptionText = false
): { commentary: string; options: unknown[] } {
  const unpacked = unpackStructuredCommentary(rawCommentary || '', Array.isArray(rawOptions) ? rawOptions : []);
  const commentary = injectZeroWidthWatermark(sanitizeMedicalText(unpacked.commentary), watermarkId);

  const options = unpacked.options.map((opt: unknown) => {
    if (!opt || typeof opt !== 'object') return opt;
    const optObj = opt as {
      text?: string;
      explanation?: string;
      justification?: string;
      [key: string]: unknown;
    };
    const nextOpt: Record<string, unknown> = { ...optObj };
    if (sanitizeOptionText && typeof optObj.text === 'string') {
      nextOpt.text = sanitizeMedicalText(optObj.text);
    }

    const rawJust = optObj.justification || optObj.explanation || '';
    if (typeof rawJust === 'string' && rawJust.trim()) {
      const wmJust = injectZeroWidthWatermark(sanitizeMedicalText(rawJust), watermarkId);
      nextOpt.explanation = wmJust;
      nextOpt.justification = wmJust;
    } else if ('justification' in optObj || 'explanation' in optObj) {
      nextOpt.explanation = '';
      nextOpt.justification = '';
    }
    return nextOpt;
  });

  return { commentary, options };
}
