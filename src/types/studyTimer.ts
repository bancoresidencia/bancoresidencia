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
  incorrectCount?: number;
  accuracy?: number; // 0 - 100%
  sessionSource?: 'manual' | 'questoes' | 'simulado' | 'flashcards';
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
    incorrectCount?: number;
    accuracy?: number;
    sessionSource?: 'manual' | 'questoes' | 'simulado' | 'flashcards';
    notes?: string;
  }) => Promise<StudySession>;
  // Métodos e estados específicos para sessões do Banco de Questões (Zero-Touch)
  sessionQuestionsCount: number;
  sessionCorrectCount: number;
  sessionIncorrectCount: number;
  startQuestionSession: (taxonomy: SelectedTaxonomy, studyType?: StudyType) => void;
  recordQuestionAnswer: (isCorrect: boolean) => void;
  autoFinishQuestionSession: (customNotes?: string) => Promise<StudySession | null>;
  todaySessions: StudySession[];
  todayTotalSeconds: number;
  todayTotalFormatted: string;
  allSessions: StudySession[];
  deleteSession: (id: string) => void;
  addManualSession: (data: {
    taxonomy: SelectedTaxonomy;
    startTime: string; // "HH:mm" ou ISO
    endTime: string;   // "HH:mm" ou ISO
    date?: string;     // "YYYY-MM-DD"
    studyType?: StudyType;
    questionsCount?: number;
    correctCount?: number;
    notes?: string;
  }) => Promise<StudySession>;
}
