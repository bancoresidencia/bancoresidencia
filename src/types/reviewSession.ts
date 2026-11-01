export type ReviewSessionMode = 'erros' | 'completa';

export interface ReviewSessionAnswerRecord {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  isCorrect: boolean;
  timestamp: number;
  timeSpent?: number;
}

export interface ActiveReviewSessionState {
  sessionId: string;
  startedAt: number;
  lastUpdatedAt: number;
  questionIds: string[];
  currentIndex: number;
  shuffleAlternatives: boolean;
  sessionMode: ReviewSessionMode;
  sessionAnswers: Record<string, ReviewSessionAnswerRecord>;
  eliminatedOptions?: Record<string, Record<string, boolean>>;
  filterSummary?: {
    specialty?: string;
    reason?: string;
    totalAvailable: number;
  };
}
