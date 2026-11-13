import { UserAnswerItem, Question } from '@/types';
import { FlashcardItem, StudyMaterialItem } from '@/types/flashcards';

export type GranularityLevel = 'tema' | 'especialidade' | 'foco' | 'subfoco';
export type SortOption = 'taxa_erros' | 'mais_erros' | 'ordem';

export interface GranularErrorGroup {
  id: string;
  name: string;
  level: GranularityLevel;
  specialty?: string;
  tema?: string;
  foco?: string;
  subfoco?: string;
  totalAnswered: number;
  totalCorrect: number;
  totalErrors: number;
  pendingErrorsCount: number;
  recoveredErrorsCount: number;
  accuracyPercent: number; // Porcentagem de acertos (ex: 34%)
  errorRatePercent: number; // Porcentagem de erros (ex: 66%)
  pendingQuestionIds: string[];
  allQuestionIds: string[];
}

export interface CadernoDashboardMetrics {
  totalErros: number;
  pendentes: number;
  resolvidos: number;
  taxaSuperacao: number;
  totalRespondidas: number;
  taxaAcertoGlobal: number;
}

/**
 * Normaliza nomes de especialidades para evitar fragmentação
 */
function normalizeSpecialty(spec?: string): string {
  if (!spec) return 'Outras Especialidades';
  if (spec === 'Cirurgia') return 'Cirurgia Geral';
  if (spec === 'Ginecologia e Obstetrícia') return 'Ginecologia';
  return spec;
}

/**
 * Determina com precisão se a resposta representa um erro corrigido (recuperado).
 * Regra estrita: O aluno DEVE estar com a questão correta atualmente E deve ter tido um erro prévio comprovado.
 * Acertos de primeira tentativa NUNCA são considerados corrigidos.
 */
export function isQuestionRecovered(ans?: UserAnswerItem): boolean {
  if (!ans || !ans.isCorrect) return false;
  const hadErrorInAttempts = Array.isArray(ans.attempts) && ans.attempts.some((a) => !a.isCorrect);
  const hadPreviousError = Boolean(
    ans.previousLetter ||
    ans.previousIsCorrect === false ||
    (ans.statusRetrial === 'recuperado' && Array.isArray(ans.attempts) && ans.attempts.length > 1)
  );
  return hadErrorInAttempts || hadPreviousError;
}

/**
 * Determina se a resposta representa um erro pendente ativo.
 */
export function isQuestionPendingError(ans?: UserAnswerItem): boolean {
  if (!ans) return false;
  return !ans.isCorrect;
}

/**
 * Calcula as métricas consolidadas do dashboard do Caderno de Erros
 */
export function calculateCadernoDashboardMetrics(
  userAnswers: Record<string, UserAnswerItem>
): CadernoDashboardMetrics {
  const entries = Object.values(userAnswers);
  const totalRespondidas = entries.length;
  const totalAcertos = entries.filter((a) => a.isCorrect).length;

  let pendentes = 0;
  let resolvidos = 0;

  entries.forEach((ans) => {
    if (isQuestionPendingError(ans)) {
      pendentes += 1;
    } else if (isQuestionRecovered(ans)) {
      resolvidos += 1;
    }
  });

  const totalErros = pendentes + resolvidos;
  const taxaSuperacao = totalErros > 0 ? Math.round((resolvidos / totalErros) * 100) : 0;
  const taxaAcertoGlobal = totalRespondidas > 0 ? Math.round((totalAcertos / totalRespondidas) * 100) : 0;

  return {
    totalErros,
    pendentes,
    resolvidos,
    taxaSuperacao,
    totalRespondidas,
    taxaAcertoGlobal
  };
}

/**
 * Agrupa o histórico do aluno na granularidade selecionada (Tema, Especialidade, Foco ou Subfoco)
 */
export function aggregateErrorsByGranularity(
  userAnswers: Record<string, UserAnswerItem>,
  questionsMap: Record<string, Question> = {},
  granularity: GranularityLevel = 'tema',
  sortOption: SortOption = 'taxa_erros',
  searchQuery: string = ''
): GranularErrorGroup[] {
  const groupsMap = new Map<string, {
    id: string;
    name: string;
    specialty?: string;
    tema?: string;
    foco?: string;
    subfoco?: string;
    totalAnswered: number;
    totalCorrect: number;
    pendingQuestionIds: string[];
    allQuestionIds: string[];
    recoveredCount: number;
  }>();

  // Processa todas as respostas do aluno para calcular taxa de acerto real daquele tema/foco
  Object.entries(userAnswers).forEach(([qid, ans]) => {
    const q = questionsMap[qid];
    const spec = normalizeSpecialty(ans.specialty || q?.especialidade);
    const tema = ans.tema || q?.tema || 'Geral';
    const foco = ans.foco || q?.foco || 'Conceitos Gerais';
    const subfoco = ans.subfoco || q?.subfoco || 'Geral';

    let key = '';
    let name = '';

    switch (granularity) {
      case 'especialidade':
        key = spec;
        name = spec;
        break;
      case 'tema':
        key = `${spec}:::${tema}`;
        name = tema;
        break;
      case 'foco':
        key = `${spec}:::${tema}:::${foco}`;
        name = foco;
        break;
      case 'subfoco':
        key = `${spec}:::${tema}:::${foco}:::${subfoco}`;
        name = subfoco;
        break;
    }

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        id: key,
        name,
        specialty: spec,
        tema,
        foco,
        subfoco,
        totalAnswered: 0,
        totalCorrect: 0,
        pendingQuestionIds: [],
        allQuestionIds: [],
        recoveredCount: 0
      });
    }

    const g = groupsMap.get(key)!;
    g.totalAnswered += 1;
    g.allQuestionIds.push(qid);

    if (ans.isCorrect) {
      g.totalCorrect += 1;
      if (isQuestionRecovered(ans)) {
        g.recoveredCount += 1;
      }
    } else {
      if (isQuestionPendingError(ans)) {
        g.pendingQuestionIds.push(qid);
      }
    }
  });

  // Converte para lista e filtra apenas grupos que possuem ao menos 1 erro pendente
  const result: GranularErrorGroup[] = [];

  groupsMap.forEach((g) => {
    // Só exibe no Caderno de Erros se houver erros registrados
    const totalErrors = g.pendingQuestionIds.length + g.recoveredCount;
    if (totalErrors === 0 && g.pendingQuestionIds.length === 0) return;

    const accuracyPercent = g.totalAnswered > 0 ? Math.round((g.totalCorrect / g.totalAnswered) * 100) : 0;
    const errorRatePercent = 100 - accuracyPercent;

    result.push({
      id: g.id,
      name: g.name,
      level: granularity,
      specialty: g.specialty,
      tema: g.tema,
      foco: g.foco,
      subfoco: g.subfoco,
      totalAnswered: g.totalAnswered,
      totalCorrect: g.totalCorrect,
      totalErrors,
      pendingErrorsCount: g.pendingQuestionIds.length,
      recoveredErrorsCount: g.recoveredCount,
      accuracyPercent,
      errorRatePercent,
      pendingQuestionIds: g.pendingQuestionIds,
      allQuestionIds: g.allQuestionIds
    });
  });

  // Filtro de busca textual
  let filtered = result;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = result.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      (item.specialty && item.specialty.toLowerCase().includes(q)) ||
      (item.tema && item.tema.toLowerCase().includes(q)) ||
      (item.foco && item.foco.toLowerCase().includes(q)) ||
      (item.subfoco && item.subfoco.toLowerCase().includes(q))
    );
  }

  // Ordenação
  filtered.sort((a, b) => {
    if (sortOption === 'taxa_erros') {
      // Padrão: Menor taxa de acertos primeiro (maior taxa de erros)
      if (a.accuracyPercent !== b.accuracyPercent) {
        return a.accuracyPercent - b.accuracyPercent;
      }
      return b.pendingErrorsCount - a.pendingErrorsCount;
    }
    if (sortOption === 'mais_erros') {
      // Volume de erros brutos
      if (a.pendingErrorsCount !== b.pendingErrorsCount) {
        return b.pendingErrorsCount - a.pendingErrorsCount;
      }
      return a.accuracyPercent - b.accuracyPercent;
    }
    if (sortOption === 'ordem') {
      // Ordem alfabética pelo nome
      return a.name.localeCompare(b.name, 'pt-BR');
    }
    return 0;
  });

  return filtered;
}

/**
 * Encontra flashcards vinculados aos erros de um grupo específico (Tema, Foco, etc.)
 */
export function matchFlashcardsForGroup(
  allCards: FlashcardItem[],
  group: GranularErrorGroup
): FlashcardItem[] {
  const qIdsSet = new Set(group.pendingQuestionIds);

  return allCards.filter((card) => {
    // 1. Vínculo direto por sourceQuestionId
    if (card.sourceQuestionId && qIdsSet.has(card.sourceQuestionId)) {
      return true;
    }

    // 2. Vínculo por hierarquia exata
    switch (group.level) {
      case 'subfoco':
        if (group.subfoco && card.subfocus) {
          return card.subfocus.toLowerCase().trim() === group.subfoco.toLowerCase().trim();
        }
        break;
      case 'foco':
        if (group.foco && card.focus) {
          return card.focus.toLowerCase().trim() === group.foco.toLowerCase().trim();
        }
        break;
      case 'tema':
        if (group.tema && card.theme) {
          return card.theme.toLowerCase().trim() === group.tema.toLowerCase().trim();
        }
        break;
      case 'especialidade':
        if (group.specialty && card.specialty) {
          return normalizeSpecialty(card.specialty) === group.specialty;
        }
        break;
    }

    return false;
  });
}

/**
 * Encontra materiais recomendados para o grupo de estudo
 */
export function matchStudyMaterialsForGroup(
  allMaterials: StudyMaterialItem[],
  group: GranularErrorGroup
): StudyMaterialItem[] {
  return allMaterials.filter((m) => {
    if (group.foco && m.focus) {
      if (m.focus.toLowerCase().trim() === group.foco.toLowerCase().trim()) return true;
    }
    if (group.tema && m.theme) {
      if (m.theme.toLowerCase().trim() === group.tema.toLowerCase().trim()) return true;
    }
    if (group.specialty && m.specialty) {
      if (normalizeSpecialty(m.specialty) === group.specialty) return true;
    }
    return false;
  });
}
