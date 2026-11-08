export type ScheduleCategory = 'estudo' | 'hospital' | 'revisao' | 'pausa' | 'flashcard' | 'simulado';

export interface AiDecisionBadge {
  type: 'weakness' | 'energy_peak' | 'fsrs_due' | 'error_retest' | 'exam_weight' | 'fatigue_relief' | 'quick_win';
  label: string;
}

export interface AiDecisionDetails {
  whyThisTopic?: string;
  whyThisTime?: string;
  pedagogicalObjective?: string;
  decisionBadges?: AiDecisionBadge[];
}

export interface DailyScheduleSlot {
  id: string;
  title: string;
  category: ScheduleCategory;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  source: 'google' | 'plataforma';
  description: string;
  location?: string;
  action?: 'treinar' | 'caderno_erros' | 'flashcards' | 'mnemonico' | 'simulado';
  isAiSuggested?: boolean;
  rationale?: string;
  aiDecision?: AiDecisionDetails;
  date?: string; // Formato 'YYYY-MM-DD'
  isCalendarTask?: boolean;
  isStudySession?: boolean;
  questionsCount?: number;
  correctCount?: number;
}

export interface FreeGapInfo {
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface AiScheduleAnalysis {
  summary: string;
  freeGaps: FreeGapInfo[];
  suggestions: DailyScheduleSlot[];
}

export type CalendarViewMode = 'dia' | 'semana' | 'mes' | 'ano';
export type TimelineFilter = 'todos' | 'tarefas' | 'estudos' | 'google';
