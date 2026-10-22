export interface RecentExamRecord {
  id: string;
  institution: string;
  institutionName: string;
  year: number;
  logoSlug?: string;
  modality: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  status: 'em_andamento' | 'concluida' | 'nao_iniciada';
  lastAccessedAt: string;
}

export interface RecentMockRecord {
  id: string;
  title: string;
  banca: string;
  duration: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  status: 'em_andamento' | 'concluida' | 'nao_iniciada';
  lastAccessedAt: string;
}

const STORAGE_OFFICIAL_EXAMS_KEY = 'bancoresidencia_recent_official_exams';
const STORAGE_MOCK_EXAMS_KEY = 'bancoresidencia_recent_mock_exams';

const DEFAULT_OFFICIAL_EXAMS: RecentExamRecord[] = [
  {
    id: 'ENARE-2025',
    institution: 'ENARE',
    institutionName: 'Exame Nacional de Residência (EBSERH)',
    year: 2025,
    logoSlug: 'enare',
    modality: 'Acesso direto',
    totalQuestions: 100,
    answeredCount: 0,
    correctCount: 0,
    status: 'nao_iniciada',
    lastAccessedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
  },
  {
    id: 'USP-SP-2025',
    institution: 'USP-SP',
    institutionName: 'Universidade de São Paulo (FUVEST)',
    year: 2025,
    logoSlug: 'usp',
    modality: 'Acesso direto',
    totalQuestions: 120,
    answeredCount: 0,
    correctCount: 0,
    status: 'nao_iniciada',
    lastAccessedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
  },
  {
    id: 'SUS-SP-2025',
    institution: 'SUS-SP',
    institutionName: 'Secretaria de Estado da Saúde de São Paulo',
    year: 2025,
    logoSlug: 'sus-sp',
    modality: 'Acesso direto',
    totalQuestions: 100,
    answeredCount: 0,
    correctCount: 0,
    status: 'nao_iniciada',
    lastAccessedAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString()
  }
];

const DEFAULT_MOCK_EXAMS: RecentMockRecord[] = [
  {
    id: 'sim-enare-2025',
    title: 'Simulado Nacional ENARE 2025',
    banca: 'FGV Concursos',
    duration: '4h 00min',
    totalQuestions: 100,
    answeredCount: 0,
    correctCount: 0,
    status: 'nao_iniciada',
    lastAccessedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString()
  },
  {
    id: 'sim-usp-2025',
    title: 'Simulado FUVEST USP-SP 2025',
    banca: 'FUVEST Residência',
    duration: '4h 30min',
    totalQuestions: 120,
    answeredCount: 0,
    correctCount: 0,
    status: 'nao_iniciada',
    lastAccessedAt: new Date(Date.now() - 3600 * 1000 * 30).toISOString()
  }
];

/**
 * Retorna as provas na íntegra recentes
 */
export function getRecentOfficialExams(): RecentExamRecord[] {
  if (typeof window === 'undefined') return DEFAULT_OFFICIAL_EXAMS;
  try {
    const raw = localStorage.getItem(STORAGE_OFFICIAL_EXAMS_KEY);
    if (!raw) return DEFAULT_OFFICIAL_EXAMS;
    const parsed = JSON.parse(raw) as RecentExamRecord[];
    return parsed.length > 0 ? parsed : DEFAULT_OFFICIAL_EXAMS;
  } catch {
    return DEFAULT_OFFICIAL_EXAMS;
  }
}

/**
 * Salva ou atualiza uma prova na íntegra no histórico
 */
export function saveRecentOfficialExam(
  exam: {
    id?: string;
    institution: string;
    year: number;
    institutionName?: string;
    institutionFullName?: string;
    logoSlug?: string;
    modality?: string;
    totalQuestions?: number;
    answeredCount?: number;
    answeredQuestions?: number;
    correctCount?: number;
    correctAnswers?: number;
    status?: 'em_andamento' | 'concluida' | 'nao_iniciada' | 'concluido';
  }
): RecentExamRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getRecentOfficialExams();
    const id = exam.id || `${exam.institution}-${exam.year}`;
    const existingIndex = current.findIndex((item) => item.id === id || (item.institution === exam.institution && item.year === exam.year));

    const normStatus = exam.status === 'concluido' ? 'concluida' : exam.status;
    const answered = exam.answeredCount ?? exam.answeredQuestions ?? current[existingIndex]?.answeredCount ?? 1;
    const correct = exam.correctCount ?? exam.correctAnswers ?? current[existingIndex]?.correctCount ?? 0;

    const updatedRecord: RecentExamRecord = {
      id,
      institution: exam.institution,
      institutionName: exam.institutionName || exam.institutionFullName || current[existingIndex]?.institutionName || exam.institution,
      year: exam.year,
      logoSlug: exam.logoSlug || current[existingIndex]?.logoSlug || exam.institution.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      modality: exam.modality || current[existingIndex]?.modality || 'Acesso direto',
      totalQuestions: exam.totalQuestions ?? current[existingIndex]?.totalQuestions ?? 100,
      answeredCount: answered,
      correctCount: correct,
      status: normStatus ?? (
        answered >= (exam.totalQuestions ?? 100) ? 'concluida' : 'em_andamento'
      ),
      lastAccessedAt: new Date().toISOString()
    };

    let nextList: RecentExamRecord[];
    if (existingIndex >= 0) {
      nextList = [
        updatedRecord,
        ...current.filter((_, idx) => idx !== existingIndex)
      ];
    } else {
      nextList = [updatedRecord, ...current].slice(0, 15);
    }

    localStorage.setItem(STORAGE_OFFICIAL_EXAMS_KEY, JSON.stringify(nextList));
    return nextList;
  } catch (err) {
    console.error('Erro ao salvar prova recente:', err);
    return [];
  }
}

/**
 * Retorna os simulados recentes
 */
export function getRecentMockExams(): RecentMockRecord[] {
  if (typeof window === 'undefined') return DEFAULT_MOCK_EXAMS;
  try {
    const raw = localStorage.getItem(STORAGE_MOCK_EXAMS_KEY);
    if (!raw) return DEFAULT_MOCK_EXAMS;
    const parsed = JSON.parse(raw) as RecentMockRecord[];
    return parsed.length > 0 ? parsed : DEFAULT_MOCK_EXAMS;
  } catch {
    return DEFAULT_MOCK_EXAMS;
  }
}

/**
 * Salva ou atualiza um simulado no histórico
 */
export function saveRecentMockExam(
  mock: {
    id: string;
    title: string;
    banca?: string;
    duration?: string;
    totalQuestions?: number;
    answeredCount?: number;
    correctCount?: number;
    status?: 'em_andamento' | 'concluida' | 'nao_iniciada';
  }
): RecentMockRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getRecentMockExams();
    const existingIndex = current.findIndex((item) => item.id === mock.id);

    const updatedRecord: RecentMockRecord = {
      id: mock.id,
      title: mock.title,
      banca: mock.banca || current[existingIndex]?.banca || 'Oficial',
      duration: mock.duration || current[existingIndex]?.duration || '4h 00min',
      totalQuestions: mock.totalQuestions ?? current[existingIndex]?.totalQuestions ?? 100,
      answeredCount: mock.answeredCount ?? current[existingIndex]?.answeredCount ?? 1,
      correctCount: mock.correctCount ?? current[existingIndex]?.correctCount ?? 0,
      status: mock.status ?? (
        (mock.answeredCount ?? 0) >= (mock.totalQuestions ?? 100) ? 'concluida' : 'em_andamento'
      ),
      lastAccessedAt: new Date().toISOString()
    };

    let nextList: RecentMockRecord[];
    if (existingIndex >= 0) {
      nextList = [
        updatedRecord,
        ...current.filter((_, idx) => idx !== existingIndex)
      ];
    } else {
      nextList = [updatedRecord, ...current].slice(0, 15);
    }

    localStorage.setItem(STORAGE_MOCK_EXAMS_KEY, JSON.stringify(nextList));
    return nextList;
  } catch (err) {
    console.error('Erro ao salvar simulado recente:', err);
    return [];
  }
}

/**
 * Obtém o item mais recente e, caso ele esteja concluído, identifica o exame não concluído mais recente
 */
export function getExamWithPendingFallback<T extends { status: string; lastAccessedAt: string }>(
  list: T[]
): {
  primary: T | null;
  pendingFallback: T | null;
} {
  if (!list || list.length === 0) {
    return { primary: null, pendingFallback: null };
  }

  // Ordena por data mais recente
  const sorted = [...list].sort(
    (a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
  );

  const primary = sorted[0];

  // Se o mais recente estiver concluído, buscar se há algum anterior com status "em_andamento"
  let pendingFallback: T | null = null;
  if (primary.status === 'concluida') {
    const foundPending = sorted.slice(1).find((item) => item.status === 'em_andamento');
    if (foundPending) {
      pendingFallback = foundPending;
    }
  }

  return { primary, pendingFallback };
}
