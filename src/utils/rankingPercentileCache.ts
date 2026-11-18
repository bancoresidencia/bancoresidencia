export const RANKING_PERCENTILE_EVENT = 'bancoresidencia_ranking_updated';

export function rankingPercentileStorageKey(userId: string): string {
  return `bancoresidencia_official_ranking_percentile_${userId}`;
}
