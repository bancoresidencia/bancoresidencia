export type TimerStatus = 'idle' | 'running' | 'paused' | 'modal_saving';

export type StudyType =
  | 'questoes'
  | 'teoria'
  | 'flashcards'
  | 'resumo'
  | 'revisao'
  | 'simulado'
  | 'outro';

export interface SelectedTaxonomy {
  especialidade?: string;
  tema?: string;
  foco?: string;
  subfoco?: string;
  rawLabel?: string;
}

export interface StudySession {
  id: string;
  userId?: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  durationSeconds: number;
  durationFormatted: string; // "hh:mm:ss"
  taxonomy: SelectedTaxonomy;
  studyType: StudyType;
  questionsCount?: number;
  correctCount?: number;
  notes?: string;
  createdAt: string;
}

export interface StudyTimerContextType {
  status: TimerStatus;
  elapsedSeconds: number;
  formattedTime: string; // "hh:mm:ss"
  selectedTaxonomy: SelectedTaxonomy;
  setSelectedTaxonomy: (tax: SelectedTaxonomy) => void;
  startTimer: (taxonomyOverride?: SelectedTaxonomy) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  cancelTimer: () => void;
  openSaveModal: () => void;
  closeSaveModal: () => void;
  saveSession: (data: {
    studyType?: StudyType;
    questionsCount?: number;
    correctCount?: number;
    notes?: string;
  }) => Promise<StudySession>;
  todaySessions: StudySession[];
  todayTotalSeconds: number;
  todayTotalFormatted: string;
  allSessions: StudySession[];
  deleteSession: (id: string) => void;
}
