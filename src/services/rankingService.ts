import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import {
  calculateIRTAbility,
  calculateStandardError,
  calculateReliability,
  calculateAdjustedScore,
  calculateEmpiricalPercentile,
  ValidatedAttempt,
  OFFICIAL_THRESHOLD,
  PROVISIONAL_THRESHOLD
} from '@/utils/irtModel';

export interface LeaderboardStudent {
  rank: number;
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
  reliability: number;
  adjustedScore: number;
  percentile: number;
  formattedPercentile: string;
  rankingStatus: 'official' | 'provisional' | 'calibrando';
  isOfficial: boolean;
  isCurrentUser?: boolean;
}

export interface LeaderboardResponse {
  success: boolean;
  totalCandidates: number;
  officialCount: number;
  provisionalCount: number;
  calibrandoCount: number;
  currentUser?: LeaderboardStudent | null;
  candidates: LeaderboardStudent[];
  platformScores?: number[];
  generatedAt: string;
}

export interface RankingFilterOptions {
  modalidade?: string;
  banca?: string;
  institution?: string;
  currentUserId?: string | null;
  limit?: number;
  offset?: number;
}

interface CachedCandidateEntry {
  rank: number;
  rawUserId: string;
  anonId: string;
  fullName: string;
  maskedName: string;
  college: string;
  specialtyTarget: string;
  bancaFoco: string;
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  theta: number;
  standardError: number;
  reliability: number;
  adjustedScore: number;
  percentile: number;
  formattedPercentile: string;
  rankingStatus: 'official' | 'provisional' | 'calibrando';
  isOfficial: boolean;
}

interface CachedLeaderboardSnapshot {
  totalCandidates: number;
  officialCount: number;
  provisionalCount: number;
  calibrandoCount: number;
  entries: CachedCandidateEntry[];
  platformScores: number[];
  generatedAt: string;
}

/**
 * Minimização LGPD para exibição pública no ranking:
 * Exibe primeiro nome + inicial do último sobrenome (ex.: "Mariana Ribeiro" -> "Mariana R.").
 */
export function maskLeaderboardName(rawName: string): string {
  const trimmed = (rawName || '').trim().replace(/\s+/g, ' ');
  if (!trimmed) return 'Estudante';
  const parts = trimmed.split(' ').filter(Boolean);
  if (parts.length <= 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

function buildAnonCandidateId(userId: string): string {
  return `anon_${crypto.createHash('sha256').update(userId).digest('hex').slice(0, 10)}`;
}

// Cache em memória neutro de sessão (30 segundos) — evita vazamento de userId entre usuários distintos
let cachedSnapshot: CachedLeaderboardSnapshot | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 30 * 1000;

function buildResponseFromSnapshot(
  snapshot: CachedLeaderboardSnapshot,
  filters: RankingFilterOptions
): LeaderboardResponse {
  const toStudentView = (entry: CachedCandidateEntry): LeaderboardStudent => {
    const isSelf = Boolean(filters.currentUserId && entry.rawUserId === filters.currentUserId);
    return {
      rank: entry.rank,
      userId: isSelf ? entry.rawUserId : entry.anonId,
      name: isSelf ? entry.fullName : entry.maskedName,
      college: entry.college,
      specialtyTarget: entry.specialtyTarget,
      bancaFoco: entry.bancaFoco,
      totalAnswered: entry.totalAnswered,
      totalCorrect: entry.totalCorrect,
      accuracy: entry.accuracy,
      theta: entry.theta,
      standardError: entry.standardError,
      reliability: entry.reliability,
      adjustedScore: entry.adjustedScore,
      percentile: entry.percentile,
      formattedPercentile: entry.formattedPercentile,
      rankingStatus: entry.rankingStatus,
      isOfficial: entry.isOfficial,
      isCurrentUser: isSelf
    };
  };

  const currentUserEntry = filters.currentUserId
    ? snapshot.entries.find((e) => e.rawUserId === filters.currentUserId)
    : undefined;

  let filteredEntries = snapshot.entries;
  if (filters.banca && filters.banca !== 'Todas') {
    filteredEntries = filteredEntries.filter((c) => c.bancaFoco === filters.banca);
  }
  if (filters.institution) {
    const instLower = filters.institution.toLowerCase();
    filteredEntries = filteredEntries.filter((c) => c.college.toLowerCase().includes(instLower));
  }

  const safeOffset = Math.max(0, filters.offset || 0);
  const safeLimit = Math.min(100, Math.max(1, filters.limit || 50));
  const paginatedCandidates = filteredEntries
    .slice(safeOffset, safeOffset + safeLimit)
    .map(toStudentView);

  return {
    success: true,
    totalCandidates: snapshot.totalCandidates,
    officialCount: snapshot.officialCount,
    provisionalCount: snapshot.provisionalCount,
    calibrandoCount: snapshot.calibrandoCount,
    currentUser: currentUserEntry ? toStudentView(currentUserEntry) : null,
    candidates: paginatedCandidates,
    platformScores: snapshot.platformScores,
    generatedAt: snapshot.generatedAt
  };
}

export async function computePlatformLeaderboard(
  filters: RankingFilterOptions = {},
  forceRefresh = false
): Promise<LeaderboardResponse> {
  const now = Date.now();

  if (!forceRefresh && cachedSnapshot && now - lastCacheTime < CACHE_TTL_MS) {
    return buildResponseFromSnapshot(cachedSnapshot, filters);
  }

  const supabaseAdmin = getSupabaseAdmin();
  const PAGE_SIZE = 1000;
  const MAX_RANKING_ROWS = 500_000;

  // 1. Buscar todos os perfis de alunos em lotes paginados (evita truncamento em 1.000 linhas do PostgREST)
  const profiles: Array<{ id: string; name?: string | null; college?: string | null; specialty_target?: string | null }> = [];
  for (let offset = 0; offset < MAX_RANKING_ROWS; offset += PAGE_SIZE) {
    const { data: profPage, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('id, name, college, specialty_target')
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (profErr) {
      console.error('[RankingService] Erro ao buscar profiles:', profErr);
      break;
    }
    if (!profPage || profPage.length === 0) break;
    profiles.push(...profPage);
    if (profPage.length < PAGE_SIZE) break;
  }

  const profilesMap = new Map<string, { name: string; college: string; specialtyTarget: string }>();
  for (const p of profiles) {
    // Sanitização de nome para exibição pública
    const displayName = p.name ? p.name.trim() : 'Estudante';
    profilesMap.set(p.id, {
      name: displayName,
      college: p.college ? p.college.trim() : 'Faculdade de Medicina',
      specialtyTarget: p.specialty_target ? p.specialty_target.trim() : 'Clínica Médica'
    });
  }

  // 2. Buscar todas as respostas válidas do banco (paginado em blocos de 1.000 para superar o teto padrão do PostgREST)
  interface RankingAnswerRow {
    user_id: string;
    question_id: string;
    is_correct: boolean;
    difficulty: string | null;
    specialty: string | null;
    banca: string | null;
    year: number | null;
    answered_at: string | null;
  }

  const answers: RankingAnswerRow[] = [];
  let fromOffset = 0;

  while (true) {
    const { data: chunk, error: ansErr } = await supabaseAdmin
      .from('user_answers')
      .select('user_id, question_id, is_correct, difficulty, specialty, banca, year, answered_at')
      .order('answered_at', { ascending: true })
      .range(fromOffset, fromOffset + PAGE_SIZE - 1);

    if (ansErr) {
      console.error('[RankingService] Erro ao buscar user_answers:', ansErr);
      throw new Error('Falha ao consultar banco de dados para cálculo de ranking.');
    }

    if (!chunk || chunk.length === 0) break;
    answers.push(...(chunk as RankingAnswerRow[]));
    if (chunk.length < PAGE_SIZE) break;
    fromOffset += PAGE_SIZE;
  }

  // 3. Agrupar tentativas por usuário
  const userAnswersMap = new Map<string, ValidatedAttempt[]>();
  const userBancaCount = new Map<string, Map<string, number>>();

  for (const a of answers || []) {
    if (!a.user_id) continue;

    if (!userAnswersMap.has(a.user_id)) {
      userAnswersMap.set(a.user_id, []);
      userBancaCount.set(a.user_id, new Map());
    }

    const normDiff = (a.difficulty === 'Fácil' || a.difficulty === 'Médio' || a.difficulty === 'Difícil')
      ? a.difficulty
      : 'Médio';

    userAnswersMap.get(a.user_id)!.push({
      question_id: a.question_id,
      difficulty: normDiff,
      correct: Boolean(a.is_correct),
      user_id: a.user_id,
      timestamp: a.answered_at ? new Date(a.answered_at).getTime() : Date.now()
    });

    if (a.banca) {
      const bMap = userBancaCount.get(a.user_id)!;
      bMap.set(a.banca, (bMap.get(a.banca) || 0) + 1);
    }
  }

  // 4. Calcular estatísticas psicométricas TRI por usuário
  interface RawScoredCandidate {
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
    reliability: number;
    adjustedScore: number;
    rankingStatus: 'official' | 'provisional' | 'calibrando';
    isOfficial: boolean;
  }

  const candidateList: RawScoredCandidate[] = [];

  for (const [userId, attempts] of userAnswersMap.entries()) {
    if (attempts.length === 0) continue;

    const profile = profilesMap.get(userId) || {
      name: 'Estudante',
      college: 'Faculdade de Medicina',
      specialtyTarget: 'Clínica Médica'
    };

    // Identificar banca mais frequente do aluno
    const bMap = userBancaCount.get(userId);
    let topBanca = 'Todas';
    let topCount = 0;
    if (bMap) {
      for (const [b, count] of bMap.entries()) {
        if (count > topCount && b !== 'Geral') {
          topCount = count;
          topBanca = b;
        }
      }
    }

    const totalAnswered = attempts.length;
    const totalCorrect = attempts.filter(att => att.correct).length;
    const accuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

    // Cálculo Bayesiano IRT 2PL
    const theta = calculateIRTAbility(attempts);
    const standardError = calculateStandardError(theta, attempts);
    const reliability = calculateReliability(standardError);
    const adjustedScore = calculateAdjustedScore(theta, standardError, totalAnswered);

    let rankingStatus: 'official' | 'provisional' | 'calibrando' = 'calibrando';
    if (totalAnswered >= OFFICIAL_THRESHOLD) {
      rankingStatus = 'official';
    } else if (totalAnswered >= PROVISIONAL_THRESHOLD) {
      rankingStatus = 'provisional';
    }

    candidateList.push({
      userId,
      name: profile.name,
      college: profile.college,
      specialtyTarget: profile.specialtyTarget,
      bancaFoco: topBanca,
      totalAnswered,
      totalCorrect,
      accuracy,
      theta,
      standardError,
      reliability,
      adjustedScore,
      rankingStatus,
      isOfficial: rankingStatus === 'official'
    });
  }

  // 5. Ordenação determinística decrescente por Adjusted Score
  candidateList.sort((a, b) => {
    if (Math.abs(b.adjustedScore - a.adjustedScore) > 1e-5) {
      return b.adjustedScore - a.adjustedScore;
    }
    // Desempate estável por total de acertos e de questões
    if (b.totalCorrect !== a.totalCorrect) return b.totalCorrect - a.totalCorrect;
    return b.totalAnswered - a.totalAnswered;
  });

  // 6. Atribuição de percentil empírico e posições
  const populationScores = candidateList.map(c => c.adjustedScore);

  let officialCount = 0;
  let provisionalCount = 0;
  let calibrandoCount = 0;

  const snapshotEntries: CachedCandidateEntry[] = candidateList.map((c, index) => {
    const perc = calculateEmpiricalPercentile(c.adjustedScore, populationScores);

    if (c.rankingStatus === 'official') officialCount++;
    else if (c.rankingStatus === 'provisional') provisionalCount++;
    else calibrandoCount++;

    return {
      rank: index + 1,
      rawUserId: c.userId,
      anonId: buildAnonCandidateId(c.userId),
      fullName: c.name,
      maskedName: maskLeaderboardName(c.name),
      college: c.college,
      specialtyTarget: c.specialtyTarget,
      bancaFoco: c.bancaFoco,
      totalAnswered: c.totalAnswered,
      totalCorrect: c.totalCorrect,
      accuracy: Math.round(c.accuracy * 10) / 10,
      theta: Math.round(c.theta * 1000) / 1000,
      standardError: Math.round(c.standardError * 1000) / 1000,
      reliability: Math.round(c.reliability * 1000) / 1000,
      adjustedScore: Math.round(c.adjustedScore * 1000) / 1000,
      percentile: perc.roundedPercentile,
      formattedPercentile: perc.formattedPercentile,
      rankingStatus: c.rankingStatus,
      isOfficial: c.isOfficial
    };
  });

  const snapshot: CachedLeaderboardSnapshot = {
    totalCandidates: snapshotEntries.length,
    officialCount,
    provisionalCount,
    calibrandoCount,
    entries: snapshotEntries,
    platformScores: candidateList.map((c) => c.accuracy),
    generatedAt: new Date().toISOString()
  };

  cachedSnapshot = snapshot;
  lastCacheTime = now;

  return buildResponseFromSnapshot(snapshot, filters);
}
