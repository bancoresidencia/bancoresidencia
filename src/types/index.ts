export interface Question {
  id: string;
  code: string;
  institution: string;
  banca: string;
  year: number;
  specialty: 'Clínica Médica' | 'Cirurgia Geral' | 'Pediatria' | 'Ginecologia e Obstetrícia' | 'Medicina Preventiva e Social';
  subtheme: string;
  difficulty: 'Fácil' | 'Média' | 'Difícil';
  statement: string;
  options: {
    letter: 'A' | 'B' | 'C' | 'D' | 'E';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  commentary: string;
  references?: string[];
}

export type Modalidade = 'Residência' | 'Revalida' | 'Graduação / Internato';
export type PeriodFilter = '6m' | '2026.1' | '2026.2' | '30d' | 'all';
export type ActiveTab = 'home' | 'banco' | 'listas' | 'simulados' | 'stats' | 'ranking';

export interface PerformanceFilterState {
  institutions: string[]; // multi-seleção
  banca: string;          // banca específica ou 'Todas'
  period: PeriodFilter;   // '6m', '2026.1', '2026.2', etc.
  modalidade: Modalidade;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar?: string;
  modalidade: Modalidade;
  institution: string;
  banca: string;
  answered: number;
  correct: number;
  uniqueAnswered: number;
  reviews: number;
  repeated: number;
  semester: '2026.1' | '2026.2';
}

export interface PercentileResult {
  percentile: number | null;
  status: 'locked' | 'approximate' | 'official';
  missingForApprox: number;
  missingForOfficial: number;
  adjustedScore: number;
  eligibleTotalStudents: number;
  rankPosition?: number;
}

export interface UserStats {
  totalAnswered: number;
  uniqueAnswered: number;
  reviews: number;
  repeated: number;
  totalCorrect: number;
  totalIncorrect: number;
  accuracyRate: number;
  daysOnPlatform: number;
  streakDays: number;
  studyTimeMinutes: number;
  percentileInfo: PercentileResult;
  historyByDay: {
    date: string;
    answered: number;
    correct: number;
  }[];
  bySpecialty: {
    specialty: string;
    total: number;
    correct: number;
    accuracy: number;
  }[];
}

export interface FilterState {
  specialty: string;
  institution: string;
  year: string;
  difficulty: string;
  search: string;
}

// Estrutura de Listas, Pastas e Subpastas
export interface QuestionList {
  id: string;
  title: string;
  folderId?: string; // id da pasta pai se houver
  questionIds: string[];
  totalQuestions: number;
  completedQuestions: number;
  lastStudiedAt: string;
  inProgress: boolean;
  progressPercentage: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string | null; // null = pasta raiz, string = subpasta
  color?: string;
}
