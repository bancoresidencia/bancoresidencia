/**
/**
 * TIPAGENS OFICIAIS DO CRONOGRAMA DE ESTUDOS DO ALUNO (POR FOCO)
 * Banco Residência Médica — Sistema Canônico de Preparação
 */

export type ScheduleItemType =
  | 'theory'
  | 'review_1'
  | 'review_2'
  | 'review_3'
  | 'questions'
  | 'custom';

export type RevisionIntervalPreset = 1 | 7 | 14 | 30 | 60;

export type ScheduleDistributionStrategy =
  | 'proportional_classic' // Proporcional Clássico (Intercalado por Especialidade)
  | 'spiral_cycle'         // Ciclos em Espiral / Escadinha por Temas (2 a 3 temas em bloco)
  | 'sequential_theme'     // Imersão Sequencial por Tema (fecha todo o tema antes do próximo)
  | 'custom';              // Personalizado / Seleção Manual do Aluno

export interface TargetInstitutionOption {
  key: string;
  sigla: string;
  nome: string;
  uf?: string;
  questionCount?: number;
  popular?: boolean;
}

export type ExamIncidenceLevel = 'extreme' | 'high' | 'medium' | 'low';

export interface ExamIncidenceInfo {
  level: ExamIncidenceLevel;
  fireCount: 1 | 2 | 3 | 4;
  label: 'Altíssima' | 'Alta' | 'Média' | 'Baixa';
  colorHex: string;
  badgeClass: string;
}

export interface StudyScheduleSettings {
  autoRevisionIntervals?: number[];
  rhythm?: 'intensivo' | 'moderado' | 'extensivo';
  preferredDays?: number[]; // [0..6] (0 = Domingo, 1 = Segunda, ...)
  dailyFocusTarget?: number;
  prioritizeHighIncidence?: boolean;
}

export interface UserStudySchedule {
  id: string;
  userId: string;
  title: string;
  targetExam?: string | null;
  targetExamDate?: string | null; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  weeklyStudyDays: number[]; // Ex: [1, 2, 3, 4, 5]
  dailyFocusTarget: number;
  isActive: boolean;
  autoRevisionIntervals: number[]; // Ex: [1, 7, 30]
  settings?: StudyScheduleSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserScheduleItem {
  id: string;
  scheduleId: string;
  userId: string;
  especialidade: string;
  tema: string;
  foco: string;
  scheduledDate: string; // YYYY-MM-DD
  itemType: ScheduleItemType;
  isCompleted: boolean;
  completedAt?: string | null;
  orderIndex: number;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFocusProgress {
  id: string;
  userId: string;
  focusKey: string; // "especialidade__tema__foco"
  especialidade: string;
  tema: string;
  foco: string;
  isStudied: boolean;
  firstStudiedAt?: string | null;
  reviewCount: number;
  lastReviewedAt?: string | null;
  nextReviewDate?: string | null; // YYYY-MM-DD
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type FocusProgressMap = Record<string, UserFocusProgress>;

/**
 * Item enriquecido exibido no Checklist e no Calendário,
 * combinando a taxonomia do Foco, o progresso do aluno, as questões resolvidas e a incidência na prova.
 */
export interface EnrichedFocusChecklistItem {
  focusKey: string;
  especialidade: string;
  tema: string;
  foco: string;
  specialtyColor: string;
  // Progresso de Estudo
  isStudied: boolean;
  firstStudiedAt?: string | null;
  reviewCount: number;
  lastReviewedAt?: string | null;
  nextReviewDate?: string | null;
  // Métricas Reais de Questões no Site
  questionsAnswered: number;
  questionsCorrect: number;
  accuracyRate: number; // 0..100 (%)
  // Incidência na Prova-Alvo
  incidence: ExamIncidenceInfo;
  // Itens agendados ativos para este Foco
  scheduledItems?: UserScheduleItem[];
  // Material de estudo correspondente
  hasStudyMaterial: boolean;
}

/**
 * Resumo analítico para as Barras de Acompanhamento no topo do Cronograma
 */
export interface ScheduleAnalyticsSummary {
  // 1. Focos Estudados
  totalFocosTarget: number;
  studiedFocosCount: number;
  studiedPercentage: number;
  bySpecialty: Record<
    string,
    {
      total: number;
      studied: number;
      percentage: number;
      color: string;
    }
  >;
  // 2. Ciclos de Revisão
  reviewCycleStats: {
    r1Completed: number;
    r2Completed: number;
    r3Completed: number;
    pendingRevisionsCount: number;
  };
  // 3. Questões e Acurácia no Escopo do Cronograma
  questionsStats: {
    totalAnswered: number;
    totalCorrect: number;
    overallAccuracy: number;
    bySpecialty: Record<
      string,
      {
        answered: number;
        correct: number;
        accuracy: number;
      }
    >;
  };
}

/**
 * Parâmetros para criação ou geração de um novo cronograma
 */
export interface CreateSchedulePayload {
  title: string;
  targetExam?: string;
  targetExamDate?: string;
  startDate?: string;
  weeklyStudyDays: number[];
  dailyFocusTarget: number;
  autoRevisionIntervals?: number[];
  selectedFocusKeys?: string[];
  strategy?: ScheduleDistributionStrategy;
  autoDistribute?: boolean;
}

export interface GenerateScheduleParams {
  scheduleId: string;
  userId: string;
  targetInstitution: string; // Ex: 'USP-SP', 'ENARE', 'UNICAMP', 'SUS-SP'
  startDate: string; // YYYY-MM-DD
  targetExamDate: string; // YYYY-MM-DD
  strategy: ScheduleDistributionStrategy;
  weeklyStudyDays: number[]; // [0..6] (ex: [1,2,3,4,5])
  dailyFocusTarget: number; // Ex: 1 ou 2 focos por dia
  includeRevisions?: boolean;
  revisionIntervals?: number[]; // [7, 30]
  selectedFocusKeys?: string[];
  maxFociLimit?: number;
}

/**
 * Estruturas para a Navegação Hierárquica do Checklist
 * Especialidade -> Tema -> Foco
 */
export interface TemaChecklistGroup {
  tema: string;
  especialidade: string;
  foci: Array<{
    focusKey: string;
    especialidade: string;
    tema: string;
    foco: string;
    specialtyColor: string;
    subfocoCount: number;
    incidence: ExamIncidenceInfo;
    score: number;
  }>;
  totalFoci: number;
  studiedFoci: number;
  withRevisionFoci: number;
  progressPercent: number;
  hasExtremeIncidence: boolean; // Contém foco 🔥🔥🔥🔥
  hasHighIncidence: boolean;    // Contém foco 🔥🔥🔥
}

export interface SpecialtyChecklistGroup {
  especialidade: string;
  specialtyColor: string;
  temas: TemaChecklistGroup[];
  totalFoci: number;
  studiedFoci: number;
  withRevisionFoci: number;
  progressPercent: number;
}

