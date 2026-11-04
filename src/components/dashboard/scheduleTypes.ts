export type ScheduleCategory = 'estudo' | 'hospital' | 'revisao' | 'pausa' | 'flashcard' | 'simulado';

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
  date?: string; // Formato 'YYYY-MM-DD'
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
export type TimelineFilter = 'todos' | 'estudos' | 'google';
