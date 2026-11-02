export type FSRSState = 'new' | 'learning' | 'review' | 'relearning';

export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy';

export interface FlashcardProgress {
  state: FSRSState;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  stability: number;
  difficulty: number;
  retrievability: number;
  lastReviewDate?: string;
  nextReviewDate: string;
  lapses: number;
  lastRating?: FlashcardRating;
  history?: FlashcardRating[];
}

export interface CardCommunityStats {
  totalStudents: number;
  communityRetentionRate: number; // ex: 78 (%)
  againPercent: number; // ex: 10 (%)
  hardPercent: number; // ex: 15 (%)
  goodPercent: number; // ex: 45 (%)
  easyPercent: number; // ex: 30 (%)
  averageSeconds: number; // ex: 12
  difficultyLabel: 'Baixa' | 'Média' | 'Alta' | 'Muito Alta';
  comparisonPercentile: number; // ex: 82 (Top 18%)
  userTotalReviews: number;
  userRetentionRate: number; // ex: 100
  userLastRating?: FlashcardRating;
  userIntervalDays: number;
}

export interface FlashcardItem {
  id: string;
  front: string; // Suporta cloze deletion ex: "A ingestão de {{c1::bateria de disco}}..."
  back: string;  // Resposta ou termo do cloze
  comment?: string; // Justificativa clínica concisa + armadilha
  imageUrl?: string | null;
  imageFrontUrl?: string | null; // Suporte para oclusão visual / esquema na frente
  specialty: string;
  theme: string;
  focus: string;
  subfocus?: string | null;
  sourceQuestionId?: string | null;
  priority?: 'essential' | 'standard';
  tags?: string[];
  progress?: FlashcardProgress;
}

export interface StudyMaterialSection {
  title: string;
  content: string;
}

export interface StudyMaterialItem {
  id: string;
  focusId?: string;
  title: string;
  specialty: string;
  theme: string;
  focus: string;
  readTimeMinutes: number;
  lastUpdatedYear: number;
  guidelineBadge?: string; // Ex: "SBC 2024–2026", "MS / CONITEC 2025"
  summarySnippet: string;
  markdownContent: string;
  keyPoints: string[];
  flashcardCount?: number;
}

export interface FlashcardFilterState {
  specialty: string;
  theme?: string;
  search: string;
  priorityOnly: boolean;
  state: 'all' | 'due' | 'new' | 'learning' | 'review';
}

export interface FlashcardSessionStats {
  total: number;
  completed: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  durationSeconds: number;
}

export interface CustomFlashcardDeck {
  id: string;
  name: string;
  description?: string;
  specialties: string[];
  priorityOnly?: boolean;
  limitCards?: number;
  cardIds?: string[];
  createdAt: string;
  lastStudiedAt?: string;
}

export interface LastFlashcardSessionInfo {
  deckTitle: string;
  specialty?: string;
  theme?: string;
  focus?: string;
  cardIds: string[];
  cardCount: number;
  lastStudiedAt: string;
}

export interface LastReadSummaryInfo {
  materialId: string;
  title: string;
  specialty: string;
  theme: string;
  focus: string;
  readTimeMinutes: number;
  guidelineBadge?: string;
  lastReadAt: string;
}
