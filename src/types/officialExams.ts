export type OfficialExamModalityKey =
  | 'todas'
  | 'acesso_direto'
  | 'r_plus'
  | 'titulo'
  | 'revalida'
  | 'outras';

export interface OfficialExamModalityOption {
  id: OfficialExamModalityKey;
  title: string;
  description: string;
  institutionsCount: number;
  examsCount: number;
}

export interface OfficialInstitution {
  id: string;
  name: string;
  shortName: string;
  aliases: string[];
  state: string | null;
  kind: string;
  logoSlug: string | null;
  modalities: string[];
  years: number[];
  examCount: number;
  totalQuestions: number;
  modalityExamCount?: number;
  modalityYearsCount?: number;
}

export interface OfficialExamItem {
  id: string;
  locationId: string;
  year: number;
  booklet: string | null;
  domain: string;
  assessmentType: string | null;
  questionCount: number;
  annulledCount: number;
  alertCount: number;
  format: string;
  modality: OfficialExamModalityKey;
}

export type ExamResolutionMode = 'exam' | 'study';

export interface OfficialExamsDataPayload {
  version: string;
  updatedAt: string;
  stats: {
    totalInstitutions: number;
    totalExams: number;
    totalQuestions: number;
    yearsRange: [number, number];
  };
  institutions: OfficialInstitution[];
  exams: OfficialExamItem[];
}
