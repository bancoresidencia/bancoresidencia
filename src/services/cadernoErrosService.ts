import { UserAnswerItem, Question } from '@/types';
import { FlashcardItem, StudyMaterialItem } from '@/types/flashcards';
import { CLINICAL_TIPS_DATABASE } from '@/data/clinicalTipsData';

export type GranularityLevel = 'tema' | 'especialidade' | 'foco' | 'subfoco';
export type SortOption =
  | 'taxa_erros' // Menor taxa de acertos (Mais vulneráveis)
  | 'maior_acerto' // Maior taxa de acertos
  | 'mais_erros' // Maior quantidade de erros
  | 'menos_erros' // Menor quantidade de erros
  | 'recentes' // Erros mais recentes
  | 'ordem'; // Ordem alfabética (A-Z)

export interface ErrorDifficultyStats {
  facil: number;
  medio: number;
  dificil: number;
  desconhecido: number;
}

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
  lastErrorTimestamp?: number;
  difficultyStats?: ErrorDifficultyStats;
  topBancas?: Array<{ banca: string; count: number }>;
  reincidentCount?: number;
  topFocos?: Array<{ foco: string; count: number }>;
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
  granularity: GranularityLevel = 'especialidade',
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

    // Métricas analíticas dinâmicas reais das questões erradas
    let maxTimestamp = 0;
    const diffStats: ErrorDifficultyStats = { facil: 0, medio: 0, dificil: 0, desconhecido: 0 };
    const bancasMap = new Map<string, number>();
    const focosMap = new Map<string, number>();
    let reincidentCount = 0;

    g.pendingQuestionIds.forEach((qid) => {
      const ans = userAnswers[qid];
      const q = questionsMap[qid];
      if (!ans) return;

      if (ans.timestamp && ans.timestamp > maxTimestamp) {
        maxTimestamp = ans.timestamp;
      }

      const diff = ans.difficulty || q?.difficulty;
      if (diff === 'Fácil') diffStats.facil += 1;
      else if (diff === 'Médio') diffStats.medio += 1;
      else if (diff === 'Difícil') diffStats.dificil += 1;
      else diffStats.desconhecido += 1;

      const banca = ans.banca || q?.banca;
      if (banca) {
        bancasMap.set(banca, (bancasMap.get(banca) || 0) + 1);
      }

      const focoItem = ans.foco || q?.foco;
      if (focoItem && focoItem !== 'Conceitos Gerais' && focoItem !== g.name) {
        focosMap.set(focoItem, (focosMap.get(focoItem) || 0) + 1);
      }

      if (
        (Array.isArray(ans.attempts) && ans.attempts.length > 1) ||
        ans.previousIsCorrect === false ||
        ans.previousLetter
      ) {
        reincidentCount += 1;
      }
    });

    const topBancas = Array.from(bancasMap.entries())
      .map(([banca, count]) => ({ banca, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const topFocos = Array.from(focosMap.entries())
      .map(([foco, count]) => ({ foco, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

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
      allQuestionIds: g.allQuestionIds,
      lastErrorTimestamp: maxTimestamp > 0 ? maxTimestamp : undefined,
      difficultyStats: diffStats,
      topBancas,
      reincidentCount,
      topFocos
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
    if (sortOption === 'recentes') {
      // Erros mais recentes primeiro
      const timeA = a.lastErrorTimestamp || 0;
      const timeB = b.lastErrorTimestamp || 0;
      if (timeA !== timeB) return timeB - timeA;
      return b.pendingErrorsCount - a.pendingErrorsCount;
    }
    if (sortOption === 'taxa_erros') {
      // Padrão: Menor taxa de acertos primeiro (maior taxa de erros / maior vulnerabilidade)
      if (a.accuracyPercent !== b.accuracyPercent) {
        return a.accuracyPercent - b.accuracyPercent;
      }
      return b.pendingErrorsCount - a.pendingErrorsCount;
    }
    if (sortOption === 'maior_acerto') {
      // Maior taxa de acertos primeiro
      if (a.accuracyPercent !== b.accuracyPercent) {
        return b.accuracyPercent - a.accuracyPercent;
      }
      return b.pendingErrorsCount - a.pendingErrorsCount;
    }
    if (sortOption === 'mais_erros') {
      // Volume de erros brutos decrescente
      if (a.pendingErrorsCount !== b.pendingErrorsCount) {
        return b.pendingErrorsCount - a.pendingErrorsCount;
      }
      return a.accuracyPercent - b.accuracyPercent;
    }
    if (sortOption === 'menos_erros') {
      // Volume de erros brutos crescente
      if (a.pendingErrorsCount !== b.pendingErrorsCount) {
        return a.pendingErrorsCount - b.pendingErrorsCount;
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

/**
 * Gera um material de apoio clínico de alto rendimento dinâmico
 * para tópicos que ainda não possuam um arquivo estático completo.
 * Segue estritamente as 5 seções canônicas de med-study-design-system.
 */
export function generateDynamicStudyMaterial(
  topicName: string,
  specialty?: string,
  tema?: string,
  foco?: string
): StudyMaterialItem {
  const spec = specialty ? normalizeSpecialty(specialty) : 'Clínica Médica';
  const effectiveTheme = tema || topicName;
  const effectiveFocus = foco || topicName;

  let guidelineBadge = 'Diretriz Oficial e Consenso de Prova';
  if (spec.includes('Cirurgia')) {
    guidelineBadge = 'Colégio Brasileiro de Cirurgiões / ATLS 11ª Edição';
  } else if (spec.includes('Clínica') || spec.includes('Cardio') || spec.includes('Pneumo')) {
    guidelineBadge = 'SBC / SBPT / AMIB / Ministério da Saúde';
  } else if (spec.includes('Ginecologia')) {
    guidelineBadge = 'FEBRASGO / ACOG / FIGO';
  } else if (spec.includes('Obstetrícia')) {
    guidelineBadge = 'FEBRASGO / Ministério da Saúde';
  } else if (spec.includes('Pediatria')) {
    guidelineBadge = 'Sociedade Brasileira de Pediatria (SBP) / PNI';
  } else if (spec.includes('Preventiva')) {
    guidelineBadge = 'Ministério da Saúde / Leis 8.080 e 8.142';
  }

  // Busca dicas, mnemônicos e regras em CLINICAL_TIPS_DATABASE
  const lowerName = topicName.toLowerCase();
  const lowerFocus = (foco || '').toLowerCase();
  const lowerTheme = (tema || '').toLowerCase();

  const matchingTips = CLINICAL_TIPS_DATABASE.filter((tip) => {
    const tipTitle = tip.title.toLowerCase();
    const tipTema = tip.tema.toLowerCase();
    const tipFull = (tip.fullTitle || '').toLowerCase();
    return (
      tipTitle.includes(lowerName) ||
      lowerName.includes(tipTitle) ||
      (lowerFocus && (tipTitle.includes(lowerFocus) || tipFull.includes(lowerFocus))) ||
      (lowerTheme && tipTema.includes(lowerTheme))
    );
  });

  const keyPoints: string[] = [];
  if (matchingTips.length > 0) {
    matchingTips.slice(0, 3).forEach((tip) => {
      if (tip.rule) keyPoints.push(tip.rule);
      if (tip.bancaTrap) keyPoints.push(`Armadilha de prova: ${tip.bancaTrap}`);
    });
  }

  if (keyPoints.length < 4) {
    keyPoints.push(`Reconhecimento imediato do quadro clínico clássico e estratificação de gravidade no atendimento de urgência.`);
    keyPoints.push(`Conduta de primeira linha escalonada e timing de intervenção preconizados pelas diretrizes nacionais.`);
    keyPoints.push(`Atenção cirúrgica às pegadinhas recorrentes das bancas examinadoras sobre contraindicações formais.`);
    keyPoints.push(`Critérios diagnósticos e condutas padrão-ouro mais cobradas no ENARE, USP, UNICAMP e bancas estaduais.`);
  }

  let criteriaTable = '';
  if (matchingTips.length > 0 && matchingTips[0].chips && matchingTips[0].chips.length > 0) {
    const primaryTip = matchingTips[0];
    criteriaTable = `\n### Critérios Cardinais: ${primaryTip.title}\n\n| Parâmetro Clínico | Critério de Prova |\n| :--- | :--- |\n` +
      primaryTip.chips.map((c) => `| **${c.label}** | ${c.value} |`).join('\n') +
      `\n\n> [!NOTE] Regra de Ouro:\n> ${primaryTip.rule}\n`;
  } else {
    criteriaTable = `\n### Critérios Cardinais e Avaliação Inicial\n\n| Domínio Clínico | Padrão-Ouro de Avaliação | Repercussão em Prova |\n| :--- | :--- | :--- |\n| **Apresentação Clínica** | Sinais e sintomas típicos | Reconhecimento de casos clínicos descritivos |\n| **Exame Complementar** | Exame de escolha inicial | Triagem rápida sem atraso de conduta |\n| **Estratificação de Risco** | Critérios de gravidade | Decisão entre enfermaria, ambulatório e UTI |\n`;
  }

  let trapCallout = '';
  if (matchingTips.length > 0 && matchingTips[0].bancaTrap) {
    trapCallout = `> [!WARNING] Armadilha Clássica da Banca:\n> ${matchingTips[0].bancaTrap}\n`;
  } else {
    trapCallout = `> [!WARNING] Armadilha Clássica de Prova:\n> Cuidado com alternativas que propõem exames invasivos ou condutas agressivas antes da estabilização clínica primária e confirmação dos critérios diagnósticos fundamentais.\n`;
  }

  const markdownContent = `# ${topicName}: Resumo Clínico de Alto Rendimento

> **Diretrizes e Consensos de Referência:** ${guidelineBadge} e Provas de Residência Médica (ENARE, USP, UNICAMP, PSU-MG, AMRIGS).

---

## 1. O Que Mais Cai nas Provas de Residência Médica

O tema **${topicName}** (${spec}) apresenta recorrência estratégica nas principais provas de residência médica e do Revalida. As bancas avaliam prioritariamente o raciocínio clínico aplicado: reconhecimento do quadro típico, correta indicação de propedêutica armada e algoritmo terapêutico de primeira linha.

---

## 2. Diagnóstico, Critérios Cardinais & Estratificação
${criteriaTable}
---

## 3. Algoritmo de Conduta Terapêutica & Fluxograma Decisório

Diante do paciente com suspeita ou confirmação diagnóstica, adote a seguinte sequência decisória:

* **Passo 1 (Abordagem Imediata):** Estabilização clínica, monitorização multiparamétrica de sinais vitais e suporte de vias aéreas e oxigenação conforme a gravidade.
* **Passo 2 (Tratamento Específico de 1ª Linha):** Iniciar terapia farmacológica ou cirúrgica de primeira escolha recomendada pelos consensos oficiais. Atentar rigorosamente para doses e contraindicações absolutas.
* **Passo 3 (Manejo de Refratariedade & Complicações):** Diante de resposta insatisfatória ou sinais de instabilidade refratária, acionar retaguarda de suporte intensivo (UTI) ou intervenção especializada imediata.

---

## 4. Armadilhas Clássicas das Bancas (Pegadinhas de Prova)

${trapCallout}
> [!IMPORTANT] Atualização de Diretriz Oficial:
> As condutas e pontos de corte apresentados seguem as atualizações mais recentes do ${guidelineBadge}, prioritariamente cobradas nas provas vigentes.

---

## 5. Diretrizes Oficiais & Consensos de Referência

1. **${guidelineBadge}** — Recomendações e Diretrizes Nacionais Vigentes.
2. **Ministério da Saúde do Brasil** — Protocolos Clínicos e Diretrizes Terapêuticas (PCDT).
3. **Bancas Oficiais de Residência Médica** — Matriz de Competências e Questões Homologadas (ENARE, USP, UNICAMP).
`;

  return {
    id: `mat-dyn-${topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title: `${topicName}: Resumo Clínico de Alto Rendimento`,
    specialty: spec,
    theme: effectiveTheme,
    focus: effectiveFocus,
    readTimeMinutes: 5,
    lastUpdatedYear: 2026,
    guidelineBadge,
    summarySnippet: `Síntese clínica e condutas padrão-ouro para ${topicName} nas principais bancas de residência médica.`,
    keyPoints,
    markdownContent
  };
}
