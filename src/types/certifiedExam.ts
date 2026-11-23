export interface CertifiedExamSummary {
  id: string;
  slug: string;
  title: string;
  institution_slug: string;
  institution_name: string;
  banca: string;
  year: number;
  modality: string;
  modality_key: 'acesso_direto' | 'r_plus' | 'revalida' | 'titulo' | 'outras';
  booklet: string;
  total_questions: number;
  duration_minutes: number;
  is_certified: boolean;
  status: string;
}

export interface CertifiedExamDetail extends CertifiedExamSummary {
  question_ids: string[];
}

export interface CertifiedExamsFilter {
  institution?: string;
  year?: number;
  modality?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CertifiedExamsResponse {
  exams: CertifiedExamSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
