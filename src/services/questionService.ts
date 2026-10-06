import { supabase } from '@/lib/supabase';
import { Question, AdvancedFilterState } from '@/types';

interface QuestionDbRow {
  id: string;
  code?: string;
  institution?: string;
  banca?: string;
  year?: number;
  tipo_prova?: string;
  modalidade?: string;
  especialidade?: string;
  tema?: string;
  foco?: string;
  subfoco?: string;
  difficulty?: 'Fácil' | 'Médio' | 'Difícil' | 'Desconhecido';
  type?: 'Múltipla escolha' | 'Discursiva' | 'Verdadeiro ou falso';
  is_anulada?: boolean;
  statement: string;
  options?: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }[];
  correct_answer?: 'A' | 'B' | 'C' | 'D' | 'E';
  commentary?: string;
  images?: string[];
}

function mapRowToQuestion(row: QuestionDbRow): Question {
  return {
    id: row.id,
    code: row.code || '',
    institution: row.institution || '',
    banca: row.banca || '',
    year: row.year || 2024,
    tipoProva: row.tipo_prova || 'Prova 1',
    modalidade: (row.modalidade as Question['modalidade']) || 'Residência Médica',
    modalidades: row.modalidade ? [(row.modalidade as Question['modalidade'])] : ['Residência Médica'],
    especialidade: row.especialidade || '',
    specialty: row.especialidade || '',
    tema: row.tema || '',
    foco: row.foco || '',
    subfoco: row.subfoco || '',
    difficulty: row.difficulty || 'Médio',
    type: row.type || 'Múltipla escolha',
    isAnulada: Boolean(row.is_anulada),
    statement: row.statement || '',
    options: Array.isArray(row.options) ? row.options : [],
    correctAnswer: row.correct_answer || 'A',
    commentary: row.commentary || '',
    images: Array.isArray(row.images) ? row.images : []
  };
}

export interface FetchQuestionsResult {
  questions: Question[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function fetchQuestionsFromSupabase(
  filters: Partial<AdvancedFilterState> = {},
  page: number = 1,
  pageSize: number = 50,
  questionIds?: string[]
): Promise<FetchQuestionsResult> {
  let query = supabase.from('questions').select('*', { count: 'exact' });

  // Se IDs específicos foram solicitados (ex: caderno ou lista)
  if (questionIds && questionIds.length > 0) {
    query = query.in('id', questionIds);
  }

  // 1. Busca textual
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim();
    query = query.or(`statement.ilike.%${q}%,code.ilike.%${q}%,foco.ilike.%${q}%,subfoco.ilike.%${q}%,tema.ilike.%${q}%`);
  }

  // 2. Especialidades
  if (filters.especialidades && filters.especialidades.length > 0) {
    query = query.in('especialidade', filters.especialidades);
  }

  // 3. Temas
  if (filters.temas && filters.temas.length > 0) {
    query = query.in('tema', filters.temas);
  }

  // 4. Focos
  if (filters.focos && filters.focos.length > 0) {
    query = query.in('foco', filters.focos);
  }

  // 5. Subfocos
  if (filters.subfocos && filters.subfocos.length > 0) {
    query = query.in('subfoco', filters.subfocos);
  }

  // 6. Instituições / Bancas
  if (filters.instituicoes && filters.instituicoes.length > 0) {
    query = query.in('institution', filters.instituicoes);
  }

  // 7. Anos
  if (filters.anos && filters.anos.length > 0) {
    query = query.in('year', filters.anos);
  }

  // 8. Tipo de Prova
  if (filters.tipoProva && filters.tipoProva.length > 0) {
    query = query.in('tipo_prova', filters.tipoProva);
  }

  // 9. Dificuldade
  if (filters.dificuldade && filters.dificuldade !== 'Todas') {
    query = query.eq('difficulty', filters.dificuldade);
  }

  // 10. Tipo de Questão
  if (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') {
    query = query.eq('type', filters.tipoQuestao);
  }

  // 11. Ocultar Anuladas
  if (filters.ocultarAnuladasErro) {
    query = query.eq('is_anulada', false);
  }

  // 12. Últimos 5 anos
  if (filters.ultimos5Anos) {
    query = query.gte('year', 2020);
  }

  // Paginação
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.order('year', { ascending: false }).range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('Erro ao buscar questões do Supabase:', error);
    return {
      questions: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0
    };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);
  const questions = (data || []).map(mapRowToQuestion);

  return {
    questions,
    total,
    page,
    pageSize,
    totalPages
  };
}

export async function fetchQuestionById(id: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapRowToQuestion(data);
}

export async function fetchQuestionsByIds(ids: string[]): Promise<Question[]> {
  if (!ids || ids.length === 0) return [];

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .in('id', ids);

  if (error || !data) return [];
  return data.map(mapRowToQuestion);
}
