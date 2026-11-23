import summaryData from '@/data/certifiedExamsSummary.json';
import part0 from '@/data/certifiedExamsQuestions/part0.json';
import part1 from '@/data/certifiedExamsQuestions/part1.json';
import part2 from '@/data/certifiedExamsQuestions/part2.json';
import part3 from '@/data/certifiedExamsQuestions/part3.json';
import part4 from '@/data/certifiedExamsQuestions/part4.json';
import part5 from '@/data/certifiedExamsQuestions/part5.json';
import {
  CertifiedExamDetail,
  CertifiedExamSummary,
  CertifiedExamsFilter,
  CertifiedExamsResponse
} from '@/types/certifiedExam';
import { resolveInstitution } from '@/utils/institutionResolver';

interface RawExamCatalog {
  version: string;
  generated_at: string;
  description: string;
  stats: {
    total_exams: number;
    total_questions: number;
    by_modality: Record<string, number>;
  };
  exams: Omit<CertifiedExamDetail, 'question_ids'>[];
}

const catalog = summaryData as unknown as RawExamCatalog;
const examsList = catalog.exams;

// Índices rápidos em memória para metadados leves
const examsById = new Map<string, Omit<CertifiedExamDetail, 'question_ids'>>();
const examsBySlug = new Map<string, Omit<CertifiedExamDetail, 'question_ids'>>();

examsList.forEach((e) => {
  examsById.set(e.id, e);
  examsBySlug.set(e.slug, e);
});

// Partições de IDs de questões particionadas (< 800 KB cada) para proteger o bundle limit de 1.5MB
const questionParts: Record<string, string[]>[] = [
  part0 as Record<string, string[]>,
  part1 as Record<string, string[]>,
  part2 as Record<string, string[]>,
  part3 as Record<string, string[]>,
  part4 as Record<string, string[]>,
  part5 as Record<string, string[]>
];

function getQuestionIdsForExam(examId: string): string[] {
  let hash = 0;
  for (let i = 0; i < examId.length; i++) hash = (hash * 31 + examId.charCodeAt(i)) >>> 0;
  const p = hash % questionParts.length;
  return questionParts[p][examId] || [];
}

/**
 * Retorna as estatísticas consolidadas dos cadernos certificados
 */
export function getCertifiedExamsStats() {
  return catalog.stats;
}

/**
 * Retorna os detalhes completos de um caderno de prova pelo ID ou Slug (incluindo question_ids ordenados)
 */
export function getCertifiedExamById(idOrSlug: string): CertifiedExamDetail | undefined {
  if (!idOrSlug || typeof idOrSlug !== 'string') return undefined;
  const clean = idOrSlug.trim();
  const summary = examsById.get(clean) || examsBySlug.get(clean);
  if (!summary) return undefined;

  return {
    ...summary,
    question_ids: getQuestionIdsForExam(summary.id)
  };
}

/**
 * Consulta e filtra os cadernos certificados, retornando summaries leves
 */
export function getCertifiedExams(filters: CertifiedExamsFilter = {}): CertifiedExamsResponse {
  let filtered = examsList;

  // Filtro por instituição (usando resolver canônico para aceitar qualquer sigla ou slug)
  if (filters.institution) {
    const resolved = resolveInstitution(filters.institution);
    const targetSlug = resolved?.slug || filters.institution.toLowerCase().trim();
    filtered = filtered.filter(
      (e) =>
        e.institution_slug === targetSlug ||
        e.banca.toLowerCase() === filters.institution!.toLowerCase().trim() ||
        (resolved && e.institution_name === resolved.supabase_institution)
    );
  }

  // Filtro por ano
  if (filters.year && !isNaN(Number(filters.year))) {
    const yr = Number(filters.year);
    filtered = filtered.filter((e) => e.year === yr);
  }

  // Filtro por modalidade
  if (filters.modality && filters.modality !== 'todas') {
    const mod = filters.modality.toLowerCase().trim();
    filtered = filtered.filter(
      (e) => e.modality_key === mod || e.modality.toLowerCase() === mod
    );
  }

  // Filtro de busca textual
  if (filters.search) {
    const s = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(s) ||
        e.banca.toLowerCase().includes(s) ||
        e.booklet.toLowerCase().includes(s) ||
        String(e.year).includes(s)
    );
  }

  const total = filtered.length;
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  // Mapear para summary (omitindo question_ids para payload leve)
  const paginatedSummaries: CertifiedExamSummary[] = filtered
    .slice(offset, offset + limit)
    .map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      institution_slug: e.institution_slug,
      institution_name: e.institution_name,
      banca: e.banca,
      year: e.year,
      modality: e.modality,
      modality_key: e.modality_key,
      booklet: e.booklet,
      total_questions: e.total_questions,
      duration_minutes: e.duration_minutes,
      is_certified: e.is_certified,
      status: e.status
    }));

  return {
    exams: paginatedSummaries,
    total,
    page,
    limit,
    totalPages
  };
}

/**
 * Retorna todos os cadernos de uma instituição específica
 */
export function getCertifiedExamsByInstitution(institutionQuery: string): CertifiedExamSummary[] {
  const res = getCertifiedExams({ institution: institutionQuery, limit: 100 });
  return res.exams;
}
