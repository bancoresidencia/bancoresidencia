import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLeaderboardResponse, createLeaderboardSnapshot, getRankingModality } from '../src/utils/leaderboard';
import type { RankingAnswer, RankingFilterOptions, RankingProfile, RankingQuestion } from '../src/utils/leaderboard';

const catalog = Array.from({ length: 530 }, (_, index): RankingQuestion => ({
  id: `q-${index}`,
  difficulty: 'Médio',
  is_anulada: false,
  correct_answer: 'A',
  modalidade: index < 500 ? 'Acesso Direto' : 'Revalida',
}));

function responses(user: string, first: number, count: number, correct: number, banca = 'ENARE'): RankingAnswer[] {
  return catalog.slice(first, first + count).map((question, index) => ({
    user_id: user,
    question_id: question.id,
    is_correct: index < correct,
    banca,
    answered_at: '2026-01-01T00:00:00Z',
  }));
}

function view(snapshot: ReturnType<typeof createLeaderboardSnapshot>, filters: Partial<RankingFilterOptions> = {}) {
  return buildLeaderboardResponse(snapshot, { limit: 50, offset: 0, ...filters }, (id) => `anon-${id}`);
}

test('counts unique eligible answers and enforces the three cutoffs', () => {
  const questions = [
    ...catalog,
    { ...catalog[0], id: 'annulled', is_anulada: true },
    { ...catalog[0], id: 'annulled-key', correct_answer: ' ANULADA ' },
    { ...catalog[0], id: 'no-difficulty', difficulty: null },
  ];
  const answers = [29, 30, 149, 150, 499, 500].flatMap((n) => responses(`user-${n}`, 0, n, n));
  const oldAnswer = answers.find((answer) => answer.user_id === 'user-29')!;
  const repeat = responses('user-30', 0, 1, 0, 'Retentativa')[0];
  const snapshot = createLeaderboardSnapshot([
    { ...repeat, answered_at: '2026-01-02T00:00:00Z' },
    ...answers,
    ...['annulled', 'annulled-key', 'no-difficulty', 'unknown'].map((id) => ({ ...oldAnswer, question_id: id })),
    ...['user-149', 'user-499'].map((user) => ({ ...oldAnswer, user_id: user, question_id: 'no-difficulty' })),
  ], questions, []);

  assert.equal(view(snapshot, { currentUserId: 'user-29' }).currentUser, null);
  for (const [n, status] of [[29, 'unranked'], [30, 'calibrando'], [149, 'calibrando'], [150, 'provisional'], [499, 'provisional'], [500, 'official']] as const) {
    assert.deepEqual(view(snapshot, { currentUserId: `user-${n}` }).currentUserProgress, { totalAnswered: n, rankingStatus: status });
  }
  const repeatOwner = view(snapshot, { currentUserId: 'user-30' }).currentUser;
  assert.equal(repeatOwner?.totalCorrect, 29);
  assert.equal(repeatOwner?.bancaFoco, 'ENARE');
  assert.equal(view(snapshot, { currentUserId: 'absent' }).currentUserProgress.totalAnswered, 0);
  assert.deepEqual(view(snapshot, { tab: 'official' }).leaders.map((candidate) => candidate.totalAnswered), [500]);
});

test('applies tab and institution filters before paging and keeps the global self rank', () => {
  const identifiers = Array.from({ length: 51 }, (_, i) => `official-${String(i).padStart(2, '0')}`);
  const answered = identifiers.flatMap((id) => responses(id, 0, 500, 450));
  const profiles: RankingProfile[] = [
    { id: 'self', name: 'Aluna De Teste', college: 'USP', specialty_target: null },
    { id: 'other', name: 'Outro De Teste', college: 'UNICAMP', specialty_target: null },
  ];
  const snapshot = createLeaderboardSnapshot([
    ...answered.reverse(),
    ...responses('self', 0, 150, 80),
    ...responses('other', 0, 150, 75, 'USP'),
  ], catalog, profiles);

  const first = view(snapshot, { currentUserId: 'self' });
  assert.equal(first.candidates.length, 50);
  assert.equal(first.currentUser?.rank, 52);
  assert.equal(first.currentUser?.name, 'Aluna De Teste');
  assert.equal(first.currentScopeRank, 52);
  assert.deepEqual(first.leaders.map((candidate) => candidate.userId), identifiers.slice(0, 3).map((id) => `anon-${id}`));

  const provisional = view(snapshot, { tab: 'provisional', currentUserId: 'self', limit: 1, offset: 1 });
  assert.equal(provisional.scopeTotal, 2);
  assert.equal(provisional.globalTotalCandidates, 53);
  assert.equal(provisional.currentScopeRank, 1);
  assert.equal(provisional.currentUser?.rank, first.currentUser?.rank);
  assert.equal(provisional.candidates[0].rank, 2);
  assert.equal(provisional.candidates[0].name, 'Outro T.');
  assert.equal(provisional.leaders.length, 2);

  const filtered = view(snapshot, { institutions: ['usp', 'unicamp'], banca: 'USP', currentUserId: 'self' });
  assert.equal(filtered.totalCandidates, 1);
  assert.equal(filtered.currentScopeRank, null);
  assert.equal(filtered.candidates[0].rank, 1);
  assert.equal(filtered.currentUser?.rank, 52);
});

test('scores a modality with its own answers and retains the global percentile', () => {
  const snapshot = createLeaderboardSnapshot([
    ...responses('self', 0, 150, 100),
    ...responses('self', 500, 30, 10),
    ...responses('other', 500, 30, 15),
  ], catalog, []);
  const general = view(snapshot, { currentUserId: 'self' });
  const revalida = view(snapshot, { modalidade: 'Revalida', currentUserId: 'self' });
  assert.equal(getRankingModality('Residência Médica'), 'Residência');
  assert.equal(getRankingModality('R+ Clínica Médica'), 'Residência');
  assert.equal(revalida.provisionalCount, 0);
  assert.equal(revalida.currentScopeRank, 2);
  assert.equal(revalida.candidates.find((candidate) => candidate.isCurrentUser)?.totalAnswered, 30);
  assert.equal(revalida.currentUser?.rank, general.currentUser?.rank);
  assert.equal(revalida.currentUser?.percentile, general.currentUser?.percentile);
  assert.equal(view(snapshot, { modalidade: 'Título de Especialista' }).scopeTotal, 0);
});
