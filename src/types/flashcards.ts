import { FocusExamAnalytics } from './analytics';

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

export type FlashcardStudyDepth = 'all' | 'study' | 'review';

export type DynamicFilterCriterionType =
  | 'specialty'
  | 'theme'
  | 'focus'
  | 'subfocus'
  | 'subSubfocus'
  | 'deck'
  | 'status'
  | 'depth'
  | 'cardType'
  | 'tag'
  | 'priority';

export interface DynamicFilterCriterion {
  id: string;
  type: DynamicFilterCriterionType;
  label: string;
  value: string;
}

export interface CsvFlashcardPreview {
  id: string;
  front: string;
  back: string;
  comment?: string;
  specialty: string;
  theme: string;
  focus: string;
  subfocus?: string;
  sub_subfocus?: string;
  subSubfocus?: string;
  deckId: string;
  priority: 'essential' | 'standard';
  studyDepth?: 'study' | 'review';
  tags: string[];
  isValid: boolean;
  validationError?: string;
  confidence: number;
  distributionMode: 'auto' | 'manual';
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
  sub_subfocus?: string | null;
  subSubfocus?: string | null;
  deckId?: string | null;
  type?: string;
  sourceQuestionId?: string | null;
  priority?: 'essential' | 'standard';
  studyDepth?: 'study' | 'review' | 'both';
  tags?: string[];
  createdAt?: string;
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
  recurrenceStats?: FocusExamAnalytics;
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
  themes?: string[];
  selectedNodeKeys?: string[];
  priorityOnly?: boolean;
  limitCards?: number;
  cardIds?: string[];
  includeUserDeckIds?: string[];
  includeAllUserCards?: boolean;
  deckType?: 'original' | 'mixed' | 'smart';
  isDefault?: boolean;
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

export interface DailyReviewLog {
  date: string; // YYYY-MM-DD
  feitos: number; // Cards novos estudados pela 1ª vez
  revisao: number; // Cards revisados no ciclo FSRS
  total: number;
  durationSeconds: number;
}
