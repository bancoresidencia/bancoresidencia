export type StudyModalidade =
  | 'Residência Médica'
  | 'Revalida'
  | 'Ciclo Básico'
  | 'R+ Clínica Médica'
  | 'R+ Pediatria'
  | 'R+ Cirurgia'
  | 'R+ Ginecologia e Obstetrícia'
  | 'R+ Neuropediatria'
  | 'Título de Oftalmologia (CBO)'
  | 'Título Clínica Médica (TECM)';

export type QuestionStatus =
  | 'Todas'
  | 'Não vistas'
  | 'Resolvidas'
  | 'Acertadas'
  | 'Erradas'
  | 'Ainda não acertadas';

export type QuestionDifficulty = 'Todas' | 'Fácil' | 'Médio' | 'Difícil' | 'Desconhecido';

export type QuestionType = 'Todas' | 'Múltipla escolha' | 'Discursiva' | 'Verdadeiro ou falso';

export interface SpecialtyHierarchy {
  especialidade: string;
  temas: {
    tema: string;
    focos: {
      foco: string;
      subfocos: string[];
    }[];
  }[];
}

export interface AdvancedFilterState {
  search: string;
  modalidades: StudyModalidade[];
  especialidades: string[];
  temas: string[];
  focos: string[];
  subfocos: string[];
  instituicoes: string[];
  anos: number[];
  tipoProva: string[];
  status: QuestionStatus;
  dificuldade: QuestionDifficulty;
  tipoQuestao: QuestionType;
  ocultarAnuladasErro: boolean;
  ocultarRevisadas: boolean;
  ultimos5Anos: boolean;
}

export interface Question {
  id: string;
  code: string;
  institution: string;
  banca: string;
  year: number;
  tipoProva?: string;
  modalidade: StudyModalidade;
  especialidade: string;
  specialty?: string;
  tema: string;
  foco: string;
  subfoco: string;
  subtheme?: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Desconhecido';
  type: 'Múltipla escolha' | 'Discursiva' | 'Verdadeiro ou falso';
  isAnulada: boolean;
  statement: string;
  options: {
    letter: 'A' | 'B' | 'C' | 'D' | 'E';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  commentary: string;
  references?: string[];
  imageUrl?: string;
  images?: string[];
}

export type Modalidade = 'Residência' | 'Revalida' | 'Graduação / Internato';
export type PeriodFilter = '7d' | '30d' | 'mes' | '6m' | '2026.1' | '2026.2' | 'all';
export type ActiveTab = 'home' | 'banco' | 'listas' | 'simulados' | 'stats' | 'ranking' | 'configuracoes';

export interface PerformanceFilterState {
  institutions: string[];
  banca: string;
  period: PeriodFilter;
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

export type RankingStatus = 'locked' | 'approximate' | 'official' | 'unranked' | 'provisional';

export interface PercentileResult {
  percentile: number | null;
  status: RankingStatus;
  missingForApprox: number;
  missingForOfficial: number;
  missingForNextTier?: number;
  adjustedScore: number;
  eligibleTotalStudents: number;
  rankPosition?: number;
  // Métricas do modelo estatístico IRT
  theta?: number;
  standard_error?: number;
  reliability?: number;
  validQuestionsCount?: number;
  easyCount?: number;
  mediumCount?: number;
  hardCount?: number;
  formattedPercentile?: string;
  statusLabel?: string;
  isOfficial?: boolean;
}

export interface UserAttempt {
  question_id: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Desconhecido';
  correct: boolean;
  user_id: string;
  timestamp: number;
  selectedLetter?: 'A' | 'B' | 'C' | 'D' | 'E';
  specialty?: string;
  tema?: string;
  foco?: string;
  subfoco?: string;
}

export interface DetailedHierarchyStats {
  specialty: string;
  tema: string;
  foco: string;
  subfoco: string;
  total: number;
  correct: number;
  accuracy: number;
  difficultyDistribution?: {
    facil: number;
    medio: number;
    dificil: number;
  };
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
  historyByWeek?: {
    id: string;
    label: string;
    periodRange: string;
    answered: number;
    correct: number;
    accuracy: number;
  }[];
  historyByMonth?: {
    id: string;
    label: string;
    year: number;
    answered: number;
    correct: number;
    accuracy: number;
  }[];
  bySpecialty: {
    specialty: string;
    total: number;
    correct: number;
    accuracy: number;
  }[];
  byTheme?: {
    specialty: string;
    tema: string;
    total: number;
    correct: number;
    accuracy: number;
  }[];
  byFocus?: DetailedHierarchyStats[];
}

export interface FilterState {
  specialty: string;
  institution: string;
  year: string;
  difficulty: string;
  search: string;
}

export interface QuestionList {
  id: string;
  title: string;
  folderId?: string;
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
  parentId?: string | null;
  color?: string;
}
