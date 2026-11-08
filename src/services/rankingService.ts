import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import {
  calculateIRTAbility,
  calculateStandardError,
  calculateReliability,
  calculateAdjustedScore,
  calculateEmpiricalPercentile,
  ValidatedAttempt,
  OFFICIAL_THRESHOLD,
  PROVISIONAL_THRESHOLD,
  CALIBRATING_THRESHOLD
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

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createSupabaseAdminClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

// Cache em memória de curta duração (30 segundos) para performance de alta velocidade
let cachedLeaderboard: LeaderboardResponse | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 30 * 1000;

export async function computePlatformLeaderboard(
  filters: RankingFilterOptions = {},
  forceRefresh = false
): Promise<LeaderboardResponse> {
  const now = Date.now();

  // Retorna cache se válido e sem filtros específicos de paginação/banca
  if (!forceRefresh && cachedLeaderboard && now - lastCacheTime < CACHE_TTL_MS && !filters.banca && !filters.institution) {
    if (filters.currentUserId) {
      const userInCache = cachedLeaderboard.candidates.find(c => c.userId === filters.currentUserId);
      return {
        ...cachedLeaderboard,
        currentUser: userInCache ? { ...userInCache, isCurrentUser: true } : null,
        candidates: cachedLeaderboard.candidates.map(c => ({
          ...c,
          isCurrentUser: c.userId === filters.currentUserId
        }))
      };
    }
    return cachedLeaderboard;
  }

  const supabaseAdmin = getSupabaseAdmin();

  // 1. Buscar todos os perfis de alunos
  const { data: profiles, error: profErr } = await supabaseAdmin
    .from('profiles')
    .select('id, name, college, specialty_target, role');

  if (profErr) {
    console.error('[RankingService] Erro ao buscar profiles:', profErr);
  }

  const profilesMap = new Map<string, { name: string; college: string; specialtyTarget: string }>();
  for (const p of profiles || []) {
    // Sanitização de nome para exibição pública
    const displayName = p.name ? p.name.trim() : 'Estudante';
    profilesMap.set(p.id, {
      name: displayName,
      college: p.college ? p.college.trim() : 'Faculdade de Medicina',
      specialtyTarget: p.specialty_target ? p.specialty_target.trim() : 'Clínica Médica'
    });
  }

  // 2. Buscar todas as respostas válidas do banco
  const { data: answers, error: ansErr } = await supabaseAdmin
    .from('user_answers')
    .select('user_id, question_id, is_correct, difficulty, specialty, banca, year, answered_at');

  if (ansErr) {
    console.error('[RankingService] Erro ao buscar user_answers:', ansErr);
    throw new Error('Falha ao consultar banco de dados para cálculo de ranking.');
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

  const rankedStudents: LeaderboardStudent[] = candidateList.map((c, index) => {
    const perc = calculateEmpiricalPercentile(c.adjustedScore, populationScores);

    if (c.rankingStatus === 'official') officialCount++;
    else if (c.rankingStatus === 'provisional') provisionalCount++;
    else calibrandoCount++;

    return {
      rank: index + 1,
      userId: c.userId,
      name: c.name,
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
      isOfficial: c.isOfficial,
      isCurrentUser: filters.currentUserId ? c.userId === filters.currentUserId : false
    };
  });

  const currentUser = filters.currentUserId
    ? rankedStudents.find(s => s.userId === filters.currentUserId) || null
    : null;

  // 7. Aplicar filtros adicionais se solicitados
  let filteredCandidates = rankedStudents;
  if (filters.banca && filters.banca !== 'Todas') {
    filteredCandidates = filteredCandidates.filter(c => c.bancaFoco === filters.banca);
  }
  if (filters.institution) {
    filteredCandidates = filteredCandidates.filter(c => 
      c.college.toLowerCase().includes(filters.institution!.toLowerCase())
    );
  }

  const offset = filters.offset || 0;
  const limit = filters.limit || 50;
  const paginatedCandidates = filteredCandidates.slice(offset, offset + limit);

  const response: LeaderboardResponse = {
    success: true,
    totalCandidates: rankedStudents.length,
    officialCount,
    provisionalCount,
    calibrandoCount,
    currentUser,
    candidates: paginatedCandidates,
    generatedAt: new Date().toISOString()
  };

  // Salvar no cache em memória
  if (!filters.banca && !filters.institution) {
    cachedLeaderboard = response;
    lastCacheTime = now;
  }

  return response;
}
