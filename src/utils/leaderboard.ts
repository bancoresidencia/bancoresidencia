import {
  calculateAdjustedScore, calculateEmpiricalPercentile, calculateIRTAbility, calculateReliability,
  calculateStandardError, getEligibleQuestions, getRankingStatus,
} from './irtModel';
import type { ValidatedAttempt } from './irtModel';
import type {
  LeaderboardResponse, LeaderboardStudent, RankingModality, RankingStatus, RankingTab, StudentWeeklyDataPoint,
} from '../types/ranking';
import { calculateQuestionXP, calculateLevel } from './xpModel';

export interface RankingAnswer {
  user_id: string;
  question_id: string;
  is_correct: boolean;
  banca: string | null;
  answered_at: string | null;
}

export interface RankingQuestion {
  id: string;
  difficulty: string | null;
  is_anulada: boolean | null;
  correct_answer: string | null;
  modalidade: string | null;
}

export interface RankingProfile {
  id: string;
  name: string | null;
  college: string | null;
  specialty_target: string | null;
}

export interface RankingFilterOptions {
  modalidade?: RankingModality;
  banca?: string;
  institutions?: string[];
  tab?: RankingTab;
  currentUserId?: string;
  limit: number;
  offset: number;
  includePlatformScores?: boolean;
}

interface ScoredCandidate {
  userId: string;
  name: string;
  college: string;
  specialtyTarget: string;
  bancaFoco: string;
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  theta: number;
  standardError: number;
  adjustedScore: number;
  xp: number;
  level: number;
  rankingStatus: Exclude<RankingStatus, 'unranked'>;
  attempts: ValidatedAttempt[];
}

interface LeaderboardSnapshot {
  general: ScoredCandidate[];
  byModality: Map<RankingModality, ScoredCandidate[]>;
  progress: Map<string, number>;
  globalRanks: Map<string, number>;
  globalScores: number[];
  generatedAt: string;
}

export function getRankingModality(value: string | null): RankingModality | undefined {
  const label = value?.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();
  if (label === 'acesso direto' || label?.startsWith('residencia') || label?.startsWith('r+')) return 'Residência';
  if (label === 'revalida') return 'Revalida';
  if (label?.startsWith('titulo')) return 'Título de Especialista';
  if (label?.startsWith('graduacao') || label === 'internato' || label === 'ciclo basico') return 'Graduação / Internato';
}

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.` : name;
}

function scoreCandidate(
  userId: string,
  profile: RankingProfile | undefined,
  attempts: ValidatedAttempt[],
  bancaByQuestion: Map<string, { name: string; timestamp: number }>,
): ScoredCandidate | null {
  const totalAnswered = attempts.length;
  const statusInfo = getRankingStatus(totalAnswered);
  if (statusInfo.status === 'unranked') return null;

  let totalCorrect = 0;
  let xp = 0;
  const bancaCounts = new Map<string, number>();
  for (const attempt of attempts) {
    if (attempt.correct) totalCorrect++;
    xp += calculateQuestionXP(attempt.correct);
    const banca = bancaByQuestion.get(attempt.question_id)?.name;
    if (banca && banca !== 'Geral' && banca !== 'Todas') {
      bancaCounts.set(banca, (bancaCounts.get(banca) ?? 0) + 1);
    }
  }
  const topBanca = Array.from(bancaCounts).sort(([a, ca], [b, cb]) => cb - ca || a.localeCompare(b, 'pt-BR'))[0];
  const theta = calculateIRTAbility(attempts);
  const standardError = calculateStandardError(theta, attempts);
  const level = calculateLevel(xp);

  return {
    userId,
    name: profile?.name?.trim() || 'Estudante',
    college: profile?.college?.trim() ?? '',
    specialtyTarget: profile?.specialty_target?.trim() ?? '',
    bancaFoco: topBanca?.[0] ?? 'Todas',
    totalAnswered,
    totalCorrect,
    accuracy: (totalCorrect / totalAnswered) * 100,
    theta,
    standardError,
    adjustedScore: calculateAdjustedScore(theta, standardError, totalAnswered),
    xp,
    level,
    rankingStatus: statusInfo.status as Exclude<RankingStatus, 'unranked'>,
    attempts,
  };
}

export function buildStudentWeeklyHistory(
  attempts: ValidatedAttempt[],
  globalScores: number[],
): StudentWeeklyDataPoint[] {
  const points: StudentWeeklyDataPoint[] = [];
  const now = Date.now();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  // Gerar 8 marcos semanais retroativos terminando na semana atual
  for (let w = 7; w >= 0; w--) {
    const cutoff = now - w * ONE_WEEK_MS;
    const weekLabel = `Sem ${8 - w}`;
    const date = new Date(cutoff);
    const dateLabel = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    const pastAttempts = attempts.filter((a) => a.timestamp <= cutoff);
    const count = pastAttempts.length;

    if (count === 0) {
      points.push({
        week: weekLabel,
        dateLabel,
        percentile: 50.0,
        accuracy: 0.0,
        totalAnswered: 0,
        rank: globalScores.length,
        xp: 0.0,
      });
      continue;
    }

    const correctCount = pastAttempts.filter((a) => a.correct).length;
    const accuracy = Math.round((correctCount / count) * 1000) / 10;
    const theta = calculateIRTAbility(pastAttempts);
    const se = calculateStandardError(theta, pastAttempts);
    const score = calculateAdjustedScore(theta, se, count);
    const perc = calculateEmpiricalPercentile(score, globalScores);
    const xp = pastAttempts.reduce((acc, a) => acc + calculateQuestionXP(a.correct), 0);

    points.push({
      week: weekLabel,
      dateLabel,
      percentile: perc.continuousPercentile,
      accuracy,
      totalAnswered: count,
      rank: Math.max(1, Math.round(globalScores.length * (1 - perc.continuousPercentile / 100))),
      xp: Math.round(xp * 10) / 10,
    });
  }

  return points;
}

export function createLeaderboardSnapshot(
  answers: RankingAnswer[],
  questions: RankingQuestion[],
  profiles: RankingProfile[],
): LeaderboardSnapshot {
  const questionsById = new Map(questions.map((question) => [question.id, question]));
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const modalityById = new Map(questions.map((question) => [question.id, getRankingModality(question.modalidade)]));
  const answersByUser = new Map<string, RankingAnswer[]>();
  for (const answer of answers) {
    const userAnswers = answersByUser.get(answer.user_id) ?? [];
    userAnswers.push(answer);
    answersByUser.set(answer.user_id, userAnswers);
  }

  const progress = new Map<string, number>();
  const general: ScoredCandidate[] = [];
  const byModality = new Map<RankingModality, ScoredCandidate[]>();

  for (const [userId, userAnswers] of answersByUser) {
    const bancaByQuestion = new Map<string, { name: string; timestamp: number }>();
    const rawAttempts: Parameters<typeof getEligibleQuestions>[0] = [];
    for (const answer of userAnswers) {
      const identifier = answer.question_id?.trim();
      const question = questionsById.get(identifier);
      if (!question) continue;
      const timestamp = answer.answered_at ? Date.parse(answer.answered_at) || 0 : 0;
      const name = answer.banca?.trim() ?? '';
      if (timestamp >= (bancaByQuestion.get(question.id)?.timestamp ?? 0)) {
        bancaByQuestion.set(question.id, { name, timestamp });
      }
      rawAttempts.push({
        question_id: question.id,
        difficulty: question.difficulty,
        isAnulada: Boolean(question.is_anulada || question.correct_answer?.trim().toUpperCase() === 'ANULADA'),
        correct: answer.is_correct,
        user_id: userId,
        timestamp,
      });
    }
    const valid = getEligibleQuestions(rawAttempts);
    progress.set(userId, valid.length);
    const profile = profilesById.get(userId);
    const candidate = scoreCandidate(userId, profile, valid, bancaByQuestion);
    if (!candidate) continue;
    general.push(candidate);

    const attemptsByModality = new Map<RankingModality, ValidatedAttempt[]>();
    for (const attempt of valid) {
      const modality = modalityById.get(attempt.question_id);
      if (!modality) continue;
      const attempts = attemptsByModality.get(modality) ?? [];
      attempts.push(attempt);
      attemptsByModality.set(modality, attempts);
    }
    for (const [modality, attempts] of attemptsByModality) {
      const scopedCandidate = scoreCandidate(userId, profile, attempts, bancaByQuestion);
      if (!scopedCandidate) continue;
      const cohort = byModality.get(modality) ?? [];
      cohort.push(scopedCandidate);
      byModality.set(modality, cohort);
    }
  }

  const compareTRI = (a: ScoredCandidate, b: ScoredCandidate) =>
    b.adjustedScore - a.adjustedScore || b.totalCorrect - a.totalCorrect ||
    b.totalAnswered - a.totalAnswered || a.userId.localeCompare(b.userId);

  general.sort(compareTRI);
  for (const cohort of byModality.values()) cohort.sort(compareTRI);

  return {
    general,
    byModality,
    progress,
    globalRanks: new Map(general.map((candidate, index) => [candidate.userId, index + 1])),
    globalScores: general.map((candidate) => candidate.adjustedScore),
    generatedAt: new Date().toISOString(),
  };
}

export function buildLeaderboardResponse(
  snapshot: LeaderboardSnapshot,
  filters: RankingFilterOptions,
  anonymizeId: (id: string) => string,
): LeaderboardResponse {
  const { tab = 'official', offset, limit, currentUserId } = filters;
  const pool = filters.modalidade ? snapshot.byModality.get(filters.modalidade) ?? [] : snapshot.general;
  const institutions = filters.institutions?.map((institution) => institution.toLowerCase()) ?? [];
  const banca = filters.banca?.toLowerCase();
  const cohort = pool.filter((candidate) => {
    if (banca && banca !== 'todas' && candidate.bancaFoco.toLowerCase() !== banca) return false;
    return institutions.length === 0 || institutions.some((institution) => candidate.college.toLowerCase().includes(institution));
  });

  const officialCount = cohort.filter((candidate) => candidate.rankingStatus === 'official').length;
  const provisionalCount = cohort.filter((candidate) => candidate.rankingStatus === 'provisional').length;

  let scoped: ScoredCandidate[];
  if (tab === 'provisional') {
    scoped = cohort.filter((candidate) => candidate.rankingStatus === 'provisional');
  } else if (tab === 'xp') {
    scoped = [...cohort].sort((a, b) => b.xp - a.xp || b.totalAnswered - a.totalAnswered || a.userId.localeCompare(b.userId));
  } else {
    // Oficial por padrão
    scoped = cohort.filter((candidate) => candidate.rankingStatus === 'official');
  }

  const currentRank = currentUserId ? snapshot.globalRanks.get(currentUserId) : undefined;
  const scopeIndex = currentUserId ? scoped.findIndex((candidate) => candidate.userId === currentUserId) : -1;
  const totalAnswered = currentUserId ? snapshot.progress.get(currentUserId) ?? 0 : 0;
  const currentUserCandidate = currentUserId ? snapshot.general.find((candidate) => candidate.userId === currentUserId) : undefined;
  const statusInfo = getRankingStatus(totalAnswered);

  const toStudent = (candidate: ScoredCandidate, rank: number): LeaderboardStudent => {
    const isCurrentUser = candidate.userId === currentUserId;
    const index = (snapshot.globalRanks.get(candidate.userId) ?? 1) - 1;
    const percentile = calculateEmpiricalPercentile(snapshot.globalScores[index], snapshot.globalScores);
    return {
      ...candidate,
      rank,
      userId: isCurrentUser ? candidate.userId : anonymizeId(candidate.userId),
      name: isCurrentUser ? candidate.name : maskName(candidate.name),
      level: candidate.level,
      xp: Math.round(candidate.xp * 10) / 10,
      accuracy: Math.round(candidate.accuracy * 10) / 10,
      theta: Math.round(candidate.theta * 1000) / 1000,
      standardError: Math.round(candidate.standardError * 1000) / 1000,
      reliability: Math.round(calculateReliability(candidate.standardError) * 1000) / 1000,
      adjustedScore: Math.round(candidate.adjustedScore * 1000) / 1000,
      percentile: percentile.roundedPercentile,
      formattedPercentile: percentile.formattedPercentile,
      isOfficial: candidate.rankingStatus === 'official',
      isCurrentUser,
    };
  };

  const currentUserHistory = currentUserCandidate
    ? buildStudentWeeklyHistory(currentUserCandidate.attempts, snapshot.globalScores)
    : undefined;

  return {
    success: true,
    totalCandidates: cohort.length,
    globalTotalCandidates: snapshot.general.length,
    officialCount,
    provisionalCount,
    calibrandoCount: cohort.length - officialCount - provisionalCount,
    scopeTotal: scoped.length,
    currentUser: currentRank ? toStudent(snapshot.general[currentRank - 1], currentRank) : null,
    currentUserProgress: {
      totalAnswered,
      rankingStatus: statusInfo.status,
      missingForNextTier: statusInfo.missingForNextTier,
      nextTierName: statusInfo.nextTierName,
      totalXP: currentUserCandidate ? Math.round(currentUserCandidate.xp * 10) / 10 : 0,
      level: currentUserCandidate ? currentUserCandidate.level : 1,
    },
    currentScopeRank: scopeIndex < 0 ? null : scopeIndex + 1,
    leaders: scoped.slice(0, 3).map((candidate, index) => toStudent(candidate, index + 1)),
    candidates: scoped.slice(offset, offset + limit).map((candidate, index) => toStudent(candidate, offset + index + 1)),
    offset,
    limit,
    platformScores: filters.includePlatformScores === false ? undefined : snapshot.general.map((candidate) => candidate.accuracy),
    generatedAt: snapshot.generatedAt,
    tab,
    history: currentUserHistory,
  };
}
