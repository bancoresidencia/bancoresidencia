import crypto from 'node:crypto';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/adminClient';
import { CANONICAL_QUESTION_TABLES, isUuidIdentifier } from '@/services/canonicalQuestionStore';
import { buildLeaderboardResponse, createLeaderboardSnapshot } from '@/utils/leaderboard';
import type { RankingAnswer, RankingFilterOptions, RankingProfile, RankingQuestion } from '@/utils/leaderboard';

const CACHE_TTL_MS = 30_000;
const ANSWER_PAGE_SIZE = 1000;
const LOOKUP_BATCH_SIZE = 100;
const LOOKUP_CONCURRENCY = 4;
const QUESTION_COLUMNS = 'id, difficulty, is_anulada, correct_answer, modalidade';

type Snapshot = ReturnType<typeof createLeaderboardSnapshot>;
type Database = ReturnType<typeof getSupabaseAdmin>;

let cached: { snapshot: Snapshot; expiresAt: number } | undefined;
let pendingSnapshot: Promise<Snapshot> | undefined;

async function loadAnswers(database: Database): Promise<RankingAnswer[]> {
  const answers: RankingAnswer[] = [];
  let afterId: string | undefined;
  while (true) {
    let query = database.from('user_answers')
      .select('id, user_id, question_id, is_correct, banca, answered_at')
      .is('written_answer', null)
      .order('id')
      .limit(ANSWER_PAGE_SIZE);
    if (afterId) query = query.gt('id', afterId);
    const { data, error } = await query;
    if (error || !data) throw new Error('Falha ao consultar as respostas do ranking.');

    if (data.length === 0) return answers;
    answers.push(...data);
    afterId = data[data.length - 1].id;
  }
}

async function loadInBatches<T>(keys: string[], load: (batch: string[]) => Promise<T[]>): Promise<T[]> {
  const result: T[] = [];
  const windowSize = LOOKUP_BATCH_SIZE * LOOKUP_CONCURRENCY;
  for (let start = 0; start < keys.length; start += windowSize) {
    const requests: Promise<T[]>[] = [];
    for (let offset = start; offset < Math.min(keys.length, start + windowSize); offset += LOOKUP_BATCH_SIZE) {
      requests.push(load(keys.slice(offset, offset + LOOKUP_BATCH_SIZE)));
    }
    for (const page of await Promise.all(requests)) result.push(...page);
  }
  return result;
}

// Answer rows store question IDs. Use the same primary-key precedence as the answer trigger.
async function loadQuestions(database: Database, ids: string[]): Promise<RankingQuestion[]> {
  const found = new Map<string, RankingQuestion>();
  const query = async (table: string, ids: string[]): Promise<RankingQuestion[]> => {
    const { data, error } = await database.from(table).select(QUESTION_COLUMNS).in('id', ids);
    if (error || !data) throw new Error(`Falha ao consultar o acervo do ranking: ${table}.`);
    return data;
  };

  const canonical = await Promise.all(CANONICAL_QUESTION_TABLES.map((table) => query(table, ids)));
  for (const questions of canonical) {
    for (const question of questions) {
      if (!found.has(question.id)) found.set(question.id, question);
    }
  }

  const legacyIds = ids.filter((id) => !found.has(id) && isUuidIdentifier(id));
  if (legacyIds.length > 0) {
    for (const question of await query('questions', legacyIds)) found.set(question.id, question);
  }
  return Array.from(found.values());
}

async function loadSnapshot(): Promise<Snapshot> {
  if (!isSupabaseAdminConfigured()) throw new Error('Consulta consolidada ao ranking indisponível.');
  const database = getSupabaseAdmin();
  const answers = await loadAnswers(database);
  const questionIds = [...new Set(answers.map((answer) => answer.question_id?.trim()).filter(Boolean))];
  const userIds = [...new Set(answers.map((answer) => answer.user_id))];
  const [questions, profiles] = await Promise.all([
    loadInBatches(questionIds, (ids) => loadQuestions(database, ids)),
    loadInBatches<RankingProfile>(userIds, async (ids) => {
      const { data, error } = await database.from('profiles').select('id, name, college, specialty_target').in('id', ids);
      if (error || !data) throw new Error('Falha ao consultar os perfis do ranking.');
      return data;
    }),
  ]);
  return createLeaderboardSnapshot(answers, questions, profiles);
}

async function getSnapshot(forceRefresh: boolean): Promise<Snapshot> {
  if (!forceRefresh && cached && Date.now() < cached.expiresAt) return cached.snapshot;
  pendingSnapshot ??= loadSnapshot().then((snapshot) => {
    cached = { snapshot, expiresAt: Date.now() + CACHE_TTL_MS };
    return snapshot;
  }).finally(() => { pendingSnapshot = undefined; });
  return pendingSnapshot;
}

export async function computePlatformLeaderboard(filters: RankingFilterOptions, forceRefresh = false) {
  const snapshot = await getSnapshot(forceRefresh);
  return buildLeaderboardResponse(snapshot, filters, (id) => (
    `anon_${crypto.createHash('sha256').update(id).digest('hex').slice(0, 10)}`
  ));
}
