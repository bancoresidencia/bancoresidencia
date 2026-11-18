export const RANKING_TABS = ['all', 'official', 'provisional'] as const;
export type RankingTab = (typeof RANKING_TABS)[number];

export const RANKING_MODALITIES = [
  'Residência', 'Revalida', 'Título de Especialista', 'Graduação / Internato',
] as const;
export type RankingModality = (typeof RANKING_MODALITIES)[number];

export type RankingStatus = 'unranked' | 'calibrando' | 'provisional' | 'official';

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
  rankingStatus: Exclude<RankingStatus, 'unranked'>;
  isOfficial: boolean;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  success: true;
  totalCandidates: number;
  globalTotalCandidates: number;
  officialCount: number;
  provisionalCount: number;
  calibrandoCount: number;
  scopeTotal: number;
  currentUser: LeaderboardStudent | null;
  currentUserProgress: { totalAnswered: number; rankingStatus: RankingStatus };
  currentScopeRank: number | null;
  leaders: LeaderboardStudent[];
  candidates: LeaderboardStudent[];
  offset: number;
  limit: number;
  platformScores?: number[];
  generatedAt: string;
}
