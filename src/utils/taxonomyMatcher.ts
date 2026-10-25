import { hierarchyQuestionCounts } from '@/data/hierarchyCounts';
import { medicalInstitutionsDirectory, bancasExaminadorasOficiais } from '@/data/instituicoesData';
import { AdvancedFilterState } from '@/types';

/**
 * Normaliza strings para busca insensível a acentuação, caixa e caracteres especiais.
 */
export function normalizeText(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOPWORDS = new Set([
  'de', 'da', 'do', 'dos', 'das', 'e', 'em', 'no', 'na', 'nos', 'nas',
  'com', 'para', 'por', 'um', 'uma', 'uns', 'umas', 'sobre', 'ao', 'aos',
  'que', 'se', 'ou', 'como', 'mais', 'menos', 'pelo', 'pela', 'pelos', 'pelas'
]);

export function getTokens(str: string): string[] {
  return normalizeText(str)
    .split(' ')
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w));
}

/**
 * Coeficiente de Dice sobre bigramas para tolerância a pequenos erros de digitação.
 */
export function diceCoefficient(s1: string, s2: string): number {
  const norm1 = normalizeText(s1).replace(/\s/g, '');
  const norm2 = normalizeText(s2).replace(/\s/g, '');

  if (norm1 === norm2) return 1.0;
  if (norm1.length < 2 || norm2.length < 2) return 0;

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bg = str.slice(i, i + 2);
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }
    return bigrams;
  };

  const bg1 = getBigrams(norm1);
  const bg2 = getBigrams(norm2);

  let intersection = 0;
  for (const [bg, count1] of bg1.entries()) {
    const count2 = bg2.get(bg) || 0;
    intersection += Math.min(count1, count2);
  }

  const total = (norm1.length - 1) + (norm2.length - 1);
  return total > 0 ? (2 * intersection) / total : 0;
}

/**
 * Similaridade combinada: Substring + Tokens (Jaccard) + Dice (Bigramas).
 */
export function calculateSimilarity(query: string, candidate: string): number {
  const qNorm = normalizeText(query);
  const cNorm = normalizeText(candidate);

  if (!qNorm || !cNorm) return 0;
  if (qNorm === cNorm) return 1.0;

  // 1. Contenção exata de substring
  if (cNorm.includes(qNorm)) {
    const ratio = qNorm.length / cNorm.length;
    return 0.85 + ratio * 0.14; // ex: "pré-eclâmpsia" dentro de "pré-eclâmpsia e eclâmpsia" dá ~0.95
  }
  if (qNorm.includes(cNorm)) {
    const ratio = cNorm.length / qNorm.length;
    return 0.82 + ratio * 0.15;
  }

  // 2. Sobreposição de Tokens (palavras-chave médicas)
  const qTokens = getTokens(query);
  const cTokens = getTokens(candidate);

  if (qTokens.length > 0 && cTokens.length > 0) {
    const cTokenSet = new Set(cTokens);
    let matchingTokens = 0;
    for (const t of qTokens) {
      if (cTokenSet.has(t)) {
        matchingTokens++;
      } else {
        // Verifica se algum token do candidato tem alta semelhança (ex: "eclamsia" com "eclampsia")
        for (const ct of cTokens) {
          if (diceCoefficient(t, ct) >= 0.8) {
            matchingTokens += 0.9;
            break;
          }
        }
      }
    }

    const tokenRecall = matchingTokens / qTokens.length;
    const tokenPrecision = matchingTokens / cTokens.length;
    const tokenJaccard = (2 * tokenRecall * tokenPrecision) / (tokenRecall + tokenPrecision || 1);

    // Se todos os tokens da busca estão presentes no candidato, match fortíssimo
    if (tokenRecall >= 0.99) {
      return Math.max(0.88, tokenJaccard);
    }

    if (tokenJaccard > 0.4) {
      const dice = diceCoefficient(query, candidate);
      return tokenJaccard * 0.7 + dice * 0.3;
    }
  }

  // 3. Fallback puramente léxico
  return diceCoefficient(query, candidate);
}

export interface TaxonomyMatchResult {
  matchedName: string;
  type: 'especialidades' | 'temas' | 'focos' | 'subfocos';
  count: number;
  score: number;
}

/**
 * Mapeamento clínico de siglas, jargões e abreviações médicas comuns para a taxonomia padrão.
 */
const CLINICAL_ABBREVIATIONS: Record<string, { name: string; type: 'especialidades' | 'temas' | 'focos' | 'subfocos' }> = {
  'sus': { name: 'Sistema Único de Saúde', type: 'temas' },
  'dheg': { name: 'Doenças Hipertensivas na Gestação', type: 'temas' },
  'has': { name: 'Hipertensão Arterial Sistêmica', type: 'focos' },
  'iam': { name: 'Síndrome Coronariana Aguda', type: 'focos' },
  'sca': { name: 'Síndrome Coronariana Aguda', type: 'focos' },
  'atls': { name: 'Trauma e Emergência', type: 'temas' },
  'pals': { name: 'Urgências Pediátricas', type: 'temas' },
  'acls': { name: 'Trauma e Emergência', type: 'temas' },
  'dpp': { name: 'Descolamento Prematuro de Placenta', type: 'focos' },
  'itu': { name: 'Infecção do Trato Urinário', type: 'focos' },
  'dpoc': { name: 'Doença Pulmonar Obstrutiva Crônica', type: 'focos' },
  'ave': { name: 'Acidente Vascular Encefálico', type: 'focos' },
  'avc': { name: 'Acidente Vascular Cerebral', type: 'focos' },
  'pcr': { name: 'Parada Cardiorrespiratória', type: 'focos' },
  'tce': { name: 'Traumatismo Cranioencefálico', type: 'focos' },
  'cad': { name: 'Cetoacidose Diabética', type: 'focos' },
  'dm': { name: 'Diabetes Mellitus', type: 'focos' },
  'dm1': { name: 'Diabetes Mellitus', type: 'focos' },
  'dm2': { name: 'Diabetes Mellitus', type: 'focos' },
  'hiv': { name: 'HIV e AIDS', type: 'temas' },
  'aids': { name: 'HIV e AIDS', type: 'temas' },
  'ist': { name: 'Infecções Ginecológicas', type: 'temas' },
  'dst': { name: 'Infecções Ginecológicas', type: 'temas' },
  'puericultura': { name: 'Puericultura e Crescimento', type: 'temas' },
  'parto': { name: 'Trabalho de Parto e Parto', type: 'temas' },
  'aborto': { name: 'Abortamento', type: 'temas' },
  'pre eclampsia': { name: 'Pré-eclâmpsia e Eclâmpsia', type: 'focos' },
  'preeclampsia': { name: 'Pré-eclâmpsia e Eclâmpsia', type: 'focos' },
  'eclampsia': { name: 'Pré-eclâmpsia e Eclâmpsia', type: 'focos' },
  'choque hipovolemico': { name: 'Choque no Trauma', type: 'focos' },
  'choque septico': { name: 'Sepse e Choque Séptico: Bundles de 1 e 3 Horas, Fonte e Metas', type: 'focos' },
  'sepse': { name: 'Sepse e Choque Séptico: Bundles de 1 e 3 Horas, Fonte e Metas', type: 'focos' },
  'trauma': { name: 'Trauma e Emergência', type: 'temas' }
};

/**
 * Busca pelo semelhante no catálogo oficial do banco de dados.
 * Apenas retorna itens que realmente possuem questões (count > 0).
 */
export function findBestTaxonomyMatch(
  queryTerm: string,
  preferredType?: 'especialidades' | 'temas' | 'focos' | 'subfocos',
  minThreshold = 0.50
): TaxonomyMatchResult | null {
  const normQuery = normalizeText(queryTerm);
  if (!normQuery || normQuery.length < 2) return null;

  // 0. Siglas e abreviações clínicas mapeadas
  if (CLINICAL_ABBREVIATIONS[normQuery]) {
    const abbrev = CLINICAL_ABBREVIATIONS[normQuery];
    const count = (hierarchyQuestionCounts[abbrev.type] as Record<string, number>)?.[abbrev.name] || 0;
    if (count > 0 && (!preferredType || preferredType === abbrev.type)) {
      return { matchedName: abbrev.name, type: abbrev.type, count, score: 1.0 };
    }
  }

  const typesToSearch: ('especialidades' | 'temas' | 'focos' | 'subfocos')[] = preferredType
    ? [preferredType]
    : ['focos', 'temas', 'subfocos', 'especialidades'];

  let bestResult: TaxonomyMatchResult | null = null;

  for (const type of typesToSearch) {
    const map = (hierarchyQuestionCounts[type] || {}) as Record<string, number>;
    
    // 1. Verificação direta exata ou normalizada
    for (const [name, count] of Object.entries(map)) {
      if (count <= 0) continue;
      const normName = normalizeText(name);

      if (normName === normQuery) {
        return { matchedName: name, type, count, score: 1.0 };
      }
    }

    // 2. Busca fuzzy / similaridade
    for (const [name, count] of Object.entries(map)) {
      if (count <= 0) continue;

      const score = calculateSimilarity(queryTerm, name);
      if (score >= minThreshold) {
        if (!bestResult || score > bestResult.score || (score === bestResult.score && count > bestResult.count)) {
          bestResult = { matchedName: name, type, count, score };
        }
      }
    }

    // Se encontramos um match excelente (>= 0.85) no tipo preferencial, encerra busca
    if (bestResult && bestResult.score >= 0.85) {
      return bestResult;
    }
  }

  return bestResult;
}

/**
 * Mapeamento de sinônimos conhecidos de bancas e instituições médicas.
 */
const BANCA_SYNONYMS: Record<string, string> = {
  'usp': 'USP-SP',
  'usp sp': 'USP-SP',
  'fmusp': 'USP-SP',
  'usp ribeirao': 'USP-RP',
  'usp rp': 'USP-RP',
  'unicamp': 'UNICAMP',
  'unicamp hc': 'UNICAMP',
  'enare': 'ENARE',
  'ebserh': 'ENARE',
  'unifesp': 'UNIFESP',
  'paulista': 'UNIFESP',
  'epm': 'UNIFESP',
  'sus sp': 'SUS-SP',
  'sus': 'SUS-SP',
  'amrigs': 'AMRIGS',
  'psu mg': 'PSU-MG',
  'psu': 'PSU-MG',
  'surce': 'SURCE',
  'ses pe': 'SES-PE',
  'ses df': 'SES-DF',
  'ses rj': 'SES-RJ',
  'einstein': 'Einstein',
  'albert einstein': 'Einstein',
  'hiae': 'Einstein',
  'santa casa': 'Santa Casa de SP',
  'santa casa sp': 'Santa Casa de SP',
  'santacasa': 'Santa Casa de SP',
  'iamspe': 'IAMSPE',
  'uerj': 'UERJ',
  'ufrj': 'UFRJ',
  'fuvest': 'FUVEST',
  'fmabc': 'FMABC',
  'ufpr': 'UFPR',
  'ufmg': 'UFMG',
  'revalida': 'INEP Revalida',
  'inep': 'INEP Revalida',
  'inep revalida': 'INEP Revalida'
};

/**
 * Busca pelo semelhante de banca examinadora ou instituição.
 */
export function findBestBancaMatch(queryTerm: string): string | null {
  const norm = normalizeText(queryTerm);
  if (!norm) return null;

  // 1. Dicionário direto de sinônimos/apelidos
  if (BANCA_SYNONYMS[norm]) {
    return BANCA_SYNONYMS[norm];
  }

  for (const [syn, canonical] of Object.entries(BANCA_SYNONYMS)) {
    if (norm.includes(syn) || syn.includes(norm)) {
      return canonical;
    }
  }

  // 2. Busca nas siglas cadastradas
  let bestSigla: string | null = null;
  let bestScore = 0;

  const allSiglas = Array.from(
    new Set([
      ...medicalInstitutionsDirectory.map((m) => m.sigla),
      ...bancasExaminadorasOficiais.map((b) => b.split(' (')[0].trim())
    ])
  );

  for (const sigla of allSiglas) {
    const score = calculateSimilarity(queryTerm, sigla);
    if (score > bestScore && score >= 0.6) {
      bestScore = score;
      bestSigla = sigla;
    }
  }

  return bestSigla;
}

/**
 * Extrai a quantidade exata de questões pedida pelo estudante em linguagem natural.
 * Ex: "quero 10 questoes", "faça 15 questões", "25 questoes", "apenas 5 questoes" -> number
 */
export function extractQuantityFromPrompt(text: string): number | null {
  if (!text) return null;

  // 1. Padrões explícitos com número seguido de palavra relacionada a questão
  const patterns = [
    /(\d{1,3})\s*(?:quest[oõó]es|quest[aã]o|itens|item|perguntas|pergunta|exerc[ií]cios|exerc[ií]cio)\b/i,
    /(?:quero|fa[cç]a|resolv(?:er)?|gerar?|mont(?:ar)?|simulado(?:\s+de)?|com|de|apenas|somente)\s+(\d{1,3})\b/i,
    /\b(\d{1,3})\s*q\b/i
  ];

  for (const pat of patterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0) {
        return Math.min(200, Math.max(1, num));
      }
    }
  }

  // 2. Números isolados no início da frase (ex: "15 de pediatria")
  const startMatch = text.match(/^(\d{1,3})\s+/);
  if (startMatch && startMatch[1]) {
    const num = parseInt(startMatch[1], 10);
    if (!isNaN(num) && num > 0 && num <= 200) {
      return num;
    }
  }

  return null;
}

/**
 * Reconcilia os filtros retornados pela IA com a taxonomia real da plataforma,
 * aplicando busca por semelhança e a regra de não-diluição hierárquica.
 */
export function reconcileAIFilters(
  rawFilters: Partial<AdvancedFilterState> & {
    quantidade?: number;
    search?: string;
  },
  promptText: string
): {
  filters: Partial<AdvancedFilterState>;
  quantidade: number;
} {
  // 1. Extrai a quantidade exata (prioriza o extraído via regex do prompt, ou da IA)
  const promptQty = extractQuantityFromPrompt(promptText);
  const aiQty = rawFilters.quantidade && typeof rawFilters.quantidade === 'number' && rawFilters.quantidade > 0
    ? Math.min(200, Math.max(1, Math.round(rawFilters.quantidade)))
    : null;
  const finalQuantity = promptQty || aiQty || 20;

  // 2. Reconciliação de Bancas / Instituições
  const reconciledInstituicoes: string[] = [];
  if (rawFilters.instituicoes && Array.isArray(rawFilters.instituicoes)) {
    for (const inst of rawFilters.instituicoes) {
      const match = findBestBancaMatch(inst);
      if (match && !reconciledInstituicoes.includes(match)) {
        reconciledInstituicoes.push(match);
      }
    }
  }

  // 3. Reconciliação Taxonômica (Subfoco -> Foco -> Tema -> Especialidade)
  const reconciledSubfocos: string[] = [];
  const reconciledFocos: string[] = [];
  const reconciledTemas: string[] = [];
  const reconciledEspecialidades: string[] = [];

  // Subfocos
  if (rawFilters.subfocos && Array.isArray(rawFilters.subfocos)) {
    for (const sub of rawFilters.subfocos) {
      const match = findBestTaxonomyMatch(sub, 'subfocos', 0.55);
      if (match && !reconciledSubfocos.includes(match.matchedName)) {
        reconciledSubfocos.push(match.matchedName);
      }
    }
  }

  // Focos
  if (rawFilters.focos && Array.isArray(rawFilters.focos)) {
    for (const foc of rawFilters.focos) {
      const match = findBestTaxonomyMatch(foc, 'focos', 0.52);
      if (match) {
        if (!reconciledFocos.includes(match.matchedName)) {
          reconciledFocos.push(match.matchedName);
        }
      } else {
        // Se não achou em focos, tenta em temas ou subfocos
        const altMatch = findBestTaxonomyMatch(foc, undefined, 0.55);
        if (altMatch) {
          if (altMatch.type === 'focos' && !reconciledFocos.includes(altMatch.matchedName)) {
            reconciledFocos.push(altMatch.matchedName);
          } else if (altMatch.type === 'temas' && !reconciledTemas.includes(altMatch.matchedName)) {
            reconciledTemas.push(altMatch.matchedName);
          } else if (altMatch.type === 'subfocos' && !reconciledSubfocos.includes(altMatch.matchedName)) {
            reconciledSubfocos.push(altMatch.matchedName);
          }
        }
      }
    }
  }

  // Temas
  if (rawFilters.temas && Array.isArray(rawFilters.temas)) {
    for (const tem of rawFilters.temas) {
      const match = findBestTaxonomyMatch(tem, 'temas', 0.50);
      if (match) {
        if (!reconciledTemas.includes(match.matchedName)) {
          reconciledTemas.push(match.matchedName);
        }
      } else {
        const altMatch = findBestTaxonomyMatch(tem, undefined, 0.55);
        if (altMatch) {
          if (altMatch.type === 'temas' && !reconciledTemas.includes(altMatch.matchedName)) {
            reconciledTemas.push(altMatch.matchedName);
          } else if (altMatch.type === 'focos' && !reconciledFocos.includes(altMatch.matchedName)) {
            reconciledFocos.push(altMatch.matchedName);
          }
        }
      }
    }
  }

  // Especialidades
  if (rawFilters.especialidades && Array.isArray(rawFilters.especialidades)) {
    for (const esp of rawFilters.especialidades) {
      const match = findBestTaxonomyMatch(esp, 'especialidades', 0.45);
      if (match && !reconciledEspecialidades.includes(match.matchedName)) {
        reconciledEspecialidades.push(match.matchedName);
      }
    }
  }

  // REGRA DE NÃO-DILUIÇÃO HIERÁRQUICA:
  // Se focos ou subfocos foram especificados, NÃO enviamos especialidades ou temas genéricos,
  // pois a consulta ao PostgreSQL combina os ramos com OR (especialidade OR foco),
  // o que faria retornar quaisquer questões da especialidade em vez das solicitadas!
  const finalSubfocos = [...reconciledSubfocos];
  const finalFocos = [...reconciledFocos];
  const finalTemas = finalFocos.length > 0 || finalSubfocos.length > 0 ? [] : [...reconciledTemas];
  const finalEspecialidades = (finalFocos.length > 0 || finalSubfocos.length > 0 || finalTemas.length > 0)
    ? []
    : [...reconciledEspecialidades];

  // 4. Termo de Busca Textual (search)
  let finalSearch = (rawFilters.search || '').trim();
  // Se o usuário digitou algum detalhe clínico que não casou em foco/tema/subfoco, garante busca textual
  if (!finalSearch && finalFocos.length === 0 && finalSubfocos.length === 0 && finalTemas.length === 0) {
    const rawTokens = getTokens(promptText).filter(
      (t) => !['questoes', 'questao', 'simulado', 'quero', 'fazer', 'anos', 'ultimos', 'dificeis', 'faceis'].includes(t)
    );
    if (rawTokens.length > 0) {
      finalSearch = rawTokens.slice(0, 3).join(' ');
    }
  }

  return {
    quantidade: finalQuantity,
    filters: {
      especialidades: finalEspecialidades,
      temas: finalTemas,
      focos: finalFocos,
      subfocos: finalSubfocos,
      instituicoes: reconciledInstituicoes,
      modalidades: rawFilters.modalidades && rawFilters.modalidades.length > 0 ? rawFilters.modalidades : ['Residência Médica'],
      anos: rawFilters.anos || [],
      dificuldade: rawFilters.dificuldade || 'Todas',
      tipoQuestao: rawFilters.tipoQuestao || 'Todas',
      search: finalSearch
    }
  };
}
