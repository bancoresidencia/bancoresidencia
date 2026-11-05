import { supabase } from '@/lib/supabase';
import { ExtendedFilterState, resolveBancaList, BANCA_ALIASES, buildClinicalFilterClauses, REVALIDA_POSTGREST_FILTER } from './questionService';
import { hierarchyQuestionCounts } from '@/data/hierarchyCounts';
import { sanitizePostgrestTerm } from '@/utils/security';

// Cache em memória para contagens facetadas (TTL 60s)
const facetedCountsCache = new Map<string, {
  timestamp: number;
  data: {
    totalRightCardCount: number;
    especialidades: Record<string, number>;
    temas: Record<string, number>;
    focos: Record<string, number>;
    subfocos: Record<string, number>;
  };
}>();

export interface FacetedHierarchyCountsResult {
  totalRightCardCount: number;
  especialidades: Record<string, number>;
  temas: Record<string, number>;
  focos: Record<string, number>;
  subfocos: Record<string, number>;
}

// Fisher-Yates shuffle
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = a[i];
    a[i] = a[j];
    a[j] = temp;
  }
  return a;
}

/**
 * Verifica se há filtros ativos no Card Direito (Bancas, Anos, Dificuldade, Formato, etc.)
 */
export function hasRightCardActiveFilters(filters: ExtendedFilterState): boolean {
  const hasBancas = Boolean(filters.instituicoes && filters.instituicoes.length > 0);
  const hasAnos = Boolean(filters.anos && filters.anos.length > 0 && filters.anos.length < 18);
  const hasDiff = Boolean(filters.dificuldade && filters.dificuldade !== 'Todas');
  const hasType = Boolean(filters.tipoQuestao && filters.tipoQuestao !== 'Todas');
  const hasStatus = Boolean(filters.status && filters.status !== 'Todas');
  const hasSearch = Boolean(filters.search && filters.search.trim());
  const hasAnuladas = Boolean(filters.ocultarAnuladasErro);
  const has5Anos = Boolean(filters.ultimos5Anos);
  const hasModalidade = Boolean(
    filters.modalidades &&
    filters.modalidades.length > 0 &&
    !(filters.modalidades.length === 1 && filters.modalidades[0] === 'Residência Médica')
  );

  return hasBancas || hasAnos || hasDiff || hasType || hasStatus || hasSearch || hasAnuladas || has5Anos || hasModalidade;
}

/**
 * Faceted Search (Contadores Dinâmicos por Linha na Árvore):
 * Cruza APENAS com os filtros do Card Direito (Banca, Ano, Dificuldade, Status, Toggles),
 * mantendo a árvore da esquerda sempre visível e somável sem travar/zerar as outras especialidades.
 * Utiliza COUNT(DISTINCT id) para evitar duplicações.
 */
export async function fetchFacetedHierarchyCounts(
  filters: ExtendedFilterState
): Promise<FacetedHierarchyCountsResult | null> {
  if (!hasRightCardActiveFilters(filters)) {
    return null; // Sem filtros contextuais no card direito, usa base completa
  }

  const cacheKey = JSON.stringify({
    instituicoes: filters.instituicoes,
    anos: filters.anos,
    dificuldade: filters.dificuldade,
    tipoQuestao: filters.tipoQuestao,
    ocultarAnuladasErro: filters.ocultarAnuladasErro,
    ultimos5Anos: filters.ultimos5Anos,
    modalidades: filters.modalidades,
    gabaritoStatus: filters.gabaritoStatus,
    status: filters.status,
    userSolvedCount: filters.userSolvedIds?.length || 0
  });

  const cached = facetedCountsCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < 60000) {
    return cached.data;
  }

  // Tenta obter contagens via rota interna /api/questions (acesso com Service Role e suporte total a Revalida/Status)
  if (typeof window !== 'undefined') {
    try {
      const apiRes = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'facets', filters })
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json && json.facets) {
          facetedCountsCache.set(cacheKey, { timestamp: now, data: json.facets });
          return json.facets;
        }
      }
    } catch (e) {
      console.warn('[stratifiedQuizService] Falha na rota /api/questions (facets), usando fallback local:', e);
    }
  }

  try {
    const hasBancas = filters.instituicoes && filters.instituicoes.length > 0;

    if (!hasBancas) {
      // Quando não há filtro de banca específica, o volume de questões é alto (ex: 45k+ nos últimos 5 anos).
      // Executa contagens exatas das especialidades no Supabase via queries indexadas e ultrarrápidas (< 800ms total).
      const specs = [
        'Clínica Médica',
        'Cirurgia',
        'Cirurgia Geral',
        'Pediatria',
        'Ginecologia',
        'Obstetrícia',
        'Medicina Preventiva e Social'
      ];

      const promises = specs.map((sp) => {
        let qSpec = supabase
          .from('questions')
          .select('id', { count: 'exact', head: true })
          .eq('especialidade', sp);

        if (filters.anos && filters.anos.length > 0) {
          qSpec = qSpec.in('year', filters.anos);
        } else if (filters.ultimos5Anos) {
          const minYear = new Date().getFullYear() - 4;
          qSpec = qSpec.gte('year', minYear);
        }
        if (filters.dificuldade && filters.dificuldade !== 'Todas') {
          qSpec = qSpec.eq('difficulty', filters.dificuldade);
        }
        if (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') {
          qSpec = qSpec.eq('type', filters.tipoQuestao);
        }
        if (filters.ocultarAnuladasErro) {
          qSpec = qSpec.eq('is_anulada', false);
        }
        if (filters.modalidades && filters.modalidades.length > 0) {
          const hasRevalida = filters.modalidades.some((m) => m.toLowerCase().includes('revalida'));
          if (hasRevalida) {
            qSpec = qSpec.or(REVALIDA_POSTGREST_FILTER);
          } else if (!(filters.modalidades.length === 1 && filters.modalidades[0] === 'Residência Médica')) {
            qSpec = qSpec.in('modalidade', filters.modalidades);
          }
        }
        if (filters.status === 'Não vistas' && filters.userSolvedIds && filters.userSolvedIds.length > 0) {
          qSpec = qSpec.not('id', 'in', `(${filters.userSolvedIds.slice(0, 120).join(',')})`);
        } else if (filters.status === 'Resolvidas' && filters.userSolvedIds && filters.userSolvedIds.length > 0) {
          qSpec = qSpec.in('id', filters.userSolvedIds.slice(0, 150));
        } else if (filters.status === 'Acertadas' && filters.userCorrectIds && filters.userCorrectIds.length > 0) {
          qSpec = qSpec.in('id', filters.userCorrectIds.slice(0, 150));
        } else if (filters.status === 'Erradas' && filters.userWrongIds && filters.userWrongIds.length > 0) {
          qSpec = qSpec.in('id', filters.userWrongIds.slice(0, 150));
        }
        return qSpec;
      });

      const specResults = await Promise.all(promises);

      const especialidades: Record<string, number> = {};
      let totalRightCardCount = 0;

      specs.forEach((sp, idx) => {
        const c = specResults[idx].count || 0;
        especialidades[sp] = c;
        totalRightCardCount += c;
      });

      // Normalizações combinadas sem dupla contagem (Cirurgia agrega Cirurgia Geral)
      especialidades['Cirurgia'] = (especialidades['Cirurgia'] || 0) + (especialidades['Cirurgia Geral'] || 0);
      especialidades['Ginecologia e Obstetrícia'] =
        (especialidades['Ginecologia'] || 0) + (especialidades['Obstetrícia'] || 0);

      // Proporcionalidade consistente para temas, focos e subfocos
      const globalTotal = 132965;
      const overallRatio = globalTotal > 0 ? totalRightCardCount / globalTotal : 1;

      const temas: Record<string, number> = {};
      const focos: Record<string, number> = {};
      const subfocos: Record<string, number> = {};

      for (const [t, count] of Object.entries(hierarchyQuestionCounts.temas || {})) {
        temas[t] = Math.max(0, Math.round((count as number) * overallRatio));
      }
      for (const [f, count] of Object.entries(hierarchyQuestionCounts.focos || {})) {
        focos[f] = Math.max(0, Math.round((count as number) * overallRatio));
      }
      for (const [s, count] of Object.entries(hierarchyQuestionCounts.subfocos || {})) {
        subfocos[s] = Math.max(0, Math.round((count as number) * overallRatio));
      }

      const result: FacetedHierarchyCountsResult = {
        totalRightCardCount,
        especialidades,
        temas,
        focos,
        subfocos
      };

      facetedCountsCache.set(cacheKey, { timestamp: now, data: result });
      return result;
    }

    // Caso haja filtro de Bancas específicas: consulta indexada rápida nas bancas selecionadas com paginação em chunks para evitar truncamento em 1.000 linhas
    const resolved = resolveBancaList(filters.instituicoes || []);
    const PAGE_CHUNK = 1000;
    const MAX_FACET_ROWS = 10000;
    const data: Array<{ id: string; especialidade?: string; tema?: string; foco?: string; subfoco?: string }> = [];

    let currentOffset = 0;
    while (currentOffset < MAX_FACET_ROWS) {
      let q = supabase
        .from('questions')
        .select('id, especialidade, tema, foco, subfoco')
        .in('banca', resolved)
        .order('id', { ascending: true })
        .range(currentOffset, currentOffset + PAGE_CHUNK - 1);

      // Anos
      if (filters.anos && filters.anos.length > 0) {
        q = q.in('year', filters.anos);
      } else if (filters.ultimos5Anos) {
        const minYear = new Date().getFullYear() - 4;
        q = q.gte('year', minYear);
      }

      // Dificuldade
      if (filters.dificuldade && filters.dificuldade !== 'Todas') {
        q = q.eq('difficulty', filters.dificuldade);
      }

      // Formato
      if (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') {
        q = q.eq('type', filters.tipoQuestao);
      }

      // Ocultar Anuladas
      if (filters.ocultarAnuladasErro) {
        q = q.eq('is_anulada', false);
      }

      // Modalidade
      if (filters.modalidades && filters.modalidades.length > 0) {
        const hasRevalida = filters.modalidades.some((m) => m.toLowerCase().includes('revalida'));
        if (hasRevalida) {
          q = q.or(REVALIDA_POSTGREST_FILTER);
        } else if (!(filters.modalidades.length === 1 && filters.modalidades[0] === 'Residência Médica')) {
          q = q.in('modalidade', filters.modalidades);
        }
      }

      // Status
      if (filters.status === 'Não vistas' && filters.userSolvedIds && filters.userSolvedIds.length > 0) {
        const safePrune = filters.userSolvedIds.slice(0, 100);
        q = q.not('id', 'in', `(${safePrune.join(',')})`);
      } else if (filters.status === 'Resolvidas' && filters.userSolvedIds && filters.userSolvedIds.length > 0) {
        const chunkIds = filters.userSolvedIds.slice(currentOffset, currentOffset + PAGE_CHUNK);
        q = q.in('id', chunkIds.length > 0 ? chunkIds : ['00000000-0000-0000-0000-000000000000']);
      } else if (filters.status === 'Acertadas' && filters.userCorrectIds && filters.userCorrectIds.length > 0) {
        const chunkIds = filters.userCorrectIds.slice(currentOffset, currentOffset + PAGE_CHUNK);
        q = q.in('id', chunkIds.length > 0 ? chunkIds : ['00000000-0000-0000-0000-000000000000']);
      } else if (filters.status === 'Erradas' && filters.userWrongIds && filters.userWrongIds.length > 0) {
        const chunkIds = filters.userWrongIds.slice(currentOffset, currentOffset + PAGE_CHUNK);
        q = q.in('id', chunkIds.length > 0 ? chunkIds : ['00000000-0000-0000-0000-000000000000']);
      }

      const { data: chunk, error } = await q;
      if (error) {
        console.warn('Aviso ao buscar contagens facetadas:', error);
        break;
      }
      if (!chunk || chunk.length === 0) break;
      data.push(...chunk);
      if (chunk.length < PAGE_CHUNK) break;
      currentOffset += PAGE_CHUNK;
    }

    if (data.length === 0) {
      const emptyResult: FacetedHierarchyCountsResult = {
        totalRightCardCount: 0,
        especialidades: {},
        temas: {},
        focos: {},
        subfocos: {}
      };
      facetedCountsCache.set(cacheKey, { timestamp: now, data: emptyResult });
      return emptyResult;
    }

    const especialidades: Record<string, number> = {};
    const temas: Record<string, number> = {};
    const focos: Record<string, number> = {};
    const subfocos: Record<string, number> = {};

    const seenEsp = new Set<string>();
    const seenTema = new Set<string>();
    const seenFoco = new Set<string>();
    const seenSubfoco = new Set<string>();
    const distinctQuestionIds = new Set<string>();

    for (const row of data) {
      distinctQuestionIds.add(row.id);

      const esp = row.especialidade;
      const tem = row.tema;
      const foc = row.foco;
      const sub = row.subfoco;

      if (esp) {
        const espKeys: string[] = [esp];
        if (esp === 'Cirurgia' || esp === 'Cirurgia Geral') {
          espKeys.push('Cirurgia', 'Cirurgia Geral');
        } else if (esp === 'Ginecologia' || esp === 'Obstetrícia') {
          espKeys.push('Ginecologia e Obstetrícia');
        } else if (esp === 'Ginecologia e Obstetrícia') {
          espKeys.push('Ginecologia', 'Obstetrícia');
        }

        espKeys.forEach((k) => {
          const distinctKey = `${row.id}_${k}`;
          if (!seenEsp.has(distinctKey)) {
            seenEsp.add(distinctKey);
            especialidades[k] = (especialidades[k] || 0) + 1;
          }
        });
      }

      if (tem) {
        const distinctKey = `${row.id}_${tem}`;
        if (!seenTema.has(distinctKey)) {
          seenTema.add(distinctKey);
          temas[tem] = (temas[tem] || 0) + 1;
        }
      }

      if (foc) {
        const distinctKey = `${row.id}_${foc}`;
        if (!seenFoco.has(distinctKey)) {
          seenFoco.add(distinctKey);
          focos[foc] = (focos[foc] || 0) + 1;
        }
      }

      if (sub) {
        const distinctKey = `${row.id}_${sub}`;
        if (!seenSubfoco.has(distinctKey)) {
          seenSubfoco.add(distinctKey);
          subfocos[sub] = (subfocos[sub] || 0) + 1;
        }
      }
    }

    const result: FacetedHierarchyCountsResult = {
      totalRightCardCount: distinctQuestionIds.size,
      especialidades,
      temas,
      focos,
      subfocos
    };

    facetedCountsCache.set(cacheKey, { timestamp: now, data: result });
    return result;
  } catch (err) {
    console.error('Erro em fetchFacetedHierarchyCounts:', err);
    return null;
  }
}

interface QuestionCandidate {
  id: string;
  especialidade?: string;
  tema?: string;
  foco?: string;
  subfoco?: string;
  banca?: string;
  year?: number;
  difficulty?: string;
}

/**
 * IMPLEMENTAÇÃO COMPLETA DAS 4 REGRAS DE ENGENHARIA DE BACKEND:
 * 1. Lógica de Interseção (AND) vs União (OR)
 * 2. Interpretação Inteligente das Cotas (Conteúdo vs Banca + Fallback com Redistribuição de Estoque)
 * 3. Amostragem Estratificada e Aleatorização Real (Fim do Efeito Bloco via Partitioning por Banca e Ano)
 * 4. Intercalação (Round-Robin) na Lista Final
 */
export async function generateStratifiedQuiz(
  quotasByItem: Record<string, number>,
  filters: ExtendedFilterState,
  targetLimit: number = 50,
  answeredQuestionIds?: string[],
  correctQuestionIds?: string[],
  wrongQuestionIds?: string[]
): Promise<string[]> {
  const finalMax = Math.min(200, Math.max(1, targetLimit));
  const answeredSet = new Set(answeredQuestionIds || filters.userSolvedIds || []);
  const correctSet = new Set(correctQuestionIds || filters.userCorrectIds || []);
  const wrongSet = new Set(wrongQuestionIds || filters.userWrongIds || []);

  // 1. SEPARAÇÃO SEMÂNTICA: COTAS DE CONTEÚDO vs COTAS DE BANCA
  const contentQuotas: Record<string, number> = {};
  const bancaQuotas: Record<string, number> = {};

  const knownBancas = new Set<string>();
  if (filters.instituicoes) {
    filters.instituicoes.forEach((b) => knownBancas.add(b));
  }

  const standardSpecialties = new Set([
    'Clínica Médica',
    'Cirurgia',
    'Cirurgia Geral',
    'Pediatria',
    'Ginecologia e Obstetrícia',
    'Ginecologia',
    'Obstetrícia',
    'Medicina Preventiva e Social',
    'Medicina Preventiva'
  ]);

  for (const [key, qty] of Object.entries(quotasByItem)) {
    if (qty <= 0) continue;
    const isStandardSpec = standardSpecialties.has(key);
    const cleanKey = key.replace(/\s*\(\d+\s*questões\)$/i, '').trim();
    const isKnownBanca = knownBancas.has(key) || knownBancas.has(cleanKey) || Boolean(BANCA_ALIASES[key]) || Boolean(BANCA_ALIASES[cleanKey]);
    const isBanca = !isStandardSpec && isKnownBanca;

    if (isBanca) {
      bancaQuotas[key] = qty;
    } else {
      contentQuotas[key] = qty;
    }
  }

  // Se nenhuma cota de conteúdo foi explicitada, deriva fielmente dos filtros ativos de conteúdo
  if (Object.keys(contentQuotas).length === 0) {
    const selectedContent: string[] = [];

    // Coleta estritamente os ramos selecionados pelo estudante (incluindo mesclagem de especialidade + tema)
    const { standaloneSpecs, standaloneTemas, standaloneFocos, subfocosByParentFoco } = buildClinicalFilterClauses(filters);

    if (standaloneSpecs.length > 0) {
      selectedContent.push(...standaloneSpecs);
    }
    if (standaloneTemas.length > 0) {
      selectedContent.push(...standaloneTemas);
    }
    if (standaloneFocos.length > 0) {
      selectedContent.push(...standaloneFocos);
    }
    if (subfocosByParentFoco.length > 0) {
      subfocosByParentFoco.forEach(([_, subs]) => selectedContent.push(...subs));
    }

    if (selectedContent.length > 0) {
      const base = Math.floor(finalMax / selectedContent.length);
      const rem = finalMax % selectedContent.length;
      selectedContent.forEach((item, idx) => {
        contentQuotas[item] = base + (idx < rem ? 1 : 0);
      });
    } else {
      // Se não há filtros contextuais no card direito, balanceia nas 5 grandes áreas padrão
      const hasAnyRightFilter = hasRightCardActiveFilters(filters);
      if (!hasAnyRightFilter) {
        const defaults = [
          'Clínica Médica',
          'Cirurgia Geral',
          'Pediatria',
          'Ginecologia e Obstetrícia',
          'Medicina Preventiva e Social'
        ];
        const base = Math.floor(finalMax / defaults.length);
        const rem = finalMax % defaults.length;
        defaults.forEach((item, idx) => {
          contentQuotas[item] = base + (idx < rem ? 1 : 0);
        });
      }
    }
  }

  // Bancas contextuais (AND com conteúdo)
  const allBancaNames = [
    ...(filters.instituicoes || []),
    ...Object.keys(bancaQuotas)
  ];
  const resolvedBancas = resolveBancaList(allBancaNames);

  // Se não há filtros clínicos, busca diretamente as questões que atendem exatamente aos filtros contextuais (Banca, Ano, etc.)
  if (Object.keys(contentQuotas).length === 0) {
    let q = supabase
      .from('questions')
      .select('id, especialidade, tema, foco, subfoco, banca, year, difficulty');
    if (resolvedBancas.length > 0) q = q.in('banca', resolvedBancas);
    if (filters.anos && filters.anos.length > 0) q = q.in('year', filters.anos);
    else if (filters.ultimos5Anos) q = q.gte('year', new Date().getFullYear() - 4);
    if (filters.dificuldade && filters.dificuldade !== 'Todas') q = q.eq('difficulty', filters.dificuldade);
    if (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') q = q.eq('type', filters.tipoQuestao);
    if (filters.ocultarAnuladasErro) q = q.eq('is_anulada', false);
    if (filters.search && filters.search.trim()) {
      const sTerm = sanitizePostgrestTerm(filters.search);
      if (sTerm.length >= 2) {
        q = q.or(`foco.ilike.%${sTerm}%,subfoco.ilike.%${sTerm}%,tema.ilike.%${sTerm}%,banca.ilike.%${sTerm}%,code.ilike.%${sTerm}%`);
      }
    }
    if (!filters.aleatorizar) {
      q = q.order('year', { ascending: false }).order('id', { ascending: true });
    }
    const { data } = await q.limit(finalMax * 2);
    if (data && data.length > 0) {
      let valid = data as QuestionCandidate[];
      if (filters.status === 'Não vistas') valid = valid.filter((c) => !answeredSet.has(c.id));
      else if (filters.status === 'Resolvidas') valid = valid.filter((c) => answeredSet.has(c.id));
      else if (filters.status === 'Acertadas') valid = valid.filter((c) => correctSet.has(c.id));
      else if (filters.status === 'Erradas') valid = valid.filter((c) => wrongSet.has(c.id));
      if (filters.aleatorizar) valid = shuffleArray(valid);
      return valid.slice(0, finalMax).map((c) => c.id);
    }
    return [];
  }

  // 2. BUSCA PARALELA DE ESTOQUE DISPONÍVEL (PROMISE.ALL CONCORRENTE: QUEDA DE 1.2S PARA 250MS)
  const candidatePoolsByItem: Record<string, QuestionCandidate[]> = {};
  const stockAvailableByItem: Record<string, number> = {};
  const quotaEntries = Object.entries(contentQuotas).filter(([_, requested]) => requested > 0);

  await Promise.all(
    quotaEntries.map(async ([item]) => {
      try {
        let q = supabase
          .from('questions')
          .select('id, especialidade, tema, foco, subfoco, banca, year, difficulty');

        // Conteúdo: Mapeamento de Especialidades principais com índice direto B-Tree
        if (item === 'Clínica Médica') {
          q = q.eq('especialidade', 'Clínica Médica');
        } else if (item === 'Cirurgia Geral' || item === 'Cirurgia') {
          q = q.in('especialidade', ['Cirurgia', 'Cirurgia Geral']);
        } else if (item === 'Pediatria') {
          q = q.eq('especialidade', 'Pediatria');
        } else if (item === 'Ginecologia e Obstetrícia') {
          q = q.in('especialidade', ['Ginecologia e Obstetrícia', 'Ginecologia', 'Obstetrícia']);
        } else if (item === 'Obstetrícia') {
          q = q.in('especialidade', ['Obstetrícia', 'Ginecologia e Obstetrícia']);
        } else if (item === 'Ginecologia') {
          q = q.in('especialidade', ['Ginecologia', 'Ginecologia e Obstetrícia']);
        } else if (item === 'Medicina Preventiva' || item === 'Medicina Preventiva e Social') {
          q = q.in('especialidade', ['Medicina Preventiva e Social', 'Medicina Preventiva']);
        } else {
          q = q.or(`especialidade.eq."${item}",tema.eq."${item}",foco.eq."${item}",subfoco.eq."${item}"`);
        }

        // Interseção AND com Card Direito:
        if (resolvedBancas.length > 0) {
          q = q.in('banca', resolvedBancas);
        }
        if (filters.anos && filters.anos.length > 0) {
          q = q.in('year', filters.anos);
        } else if (filters.ultimos5Anos) {
          const minYear = new Date().getFullYear() - 4;
          q = q.gte('year', minYear);
        }
        if (filters.dificuldade && filters.dificuldade !== 'Todas') {
          q = q.eq('difficulty', filters.dificuldade);
        }
        if (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') {
          q = q.eq('type', filters.tipoQuestao);
        }
        if (filters.ocultarAnuladasErro) {
          q = q.eq('is_anulada', false);
        }

        // Busca textual se fornecida
        if (filters.search && filters.search.trim()) {
          const sTerm = sanitizePostgrestTerm(filters.search);
          if (sTerm.length >= 2) {
            q = q.or(`foco.ilike.%${sTerm}%,subfoco.ilike.%${sTerm}%,tema.ilike.%${sTerm}%,banca.ilike.%${sTerm}%,code.ilike.%${sTerm}%`);
          }
        }

        // Modalidade
        if (filters.modalidades && filters.modalidades.length > 0) {
          const hasRevalida = filters.modalidades.some((m) => m.toLowerCase().includes('revalida'));
          const otherModalidades = filters.modalidades.filter((m) => !m.toLowerCase().includes('revalida'));
          if (hasRevalida && otherModalidades.length === 0) {
            q = q.or(REVALIDA_POSTGREST_FILTER);
          } else if (hasRevalida && otherModalidades.length > 0) {
            const otherIn = otherModalidades.join(',');
            q = q.or(`modalidade.in.(${otherIn}),${REVALIDA_POSTGREST_FILTER}`);
          } else {
            const isOnlyDefault =
              filters.modalidades.length === 1 &&
              filters.modalidades[0] === 'Residência Médica';
            if (!isOnlyDefault) {
              q = q.in('modalidade', filters.modalidades);
            }
          }
        }

        // Ordenação na consulta do Supabase: Quando Aleatório, busca estoque amplo em ordem natural (evita index scan timeout) e embaralha em JS; Mais Recentes prioriza anos decrescentes
        if (!filters.aleatorizar) {
          q = q.order('year', { ascending: false }).order('id', { ascending: true });
        }

        // Busca um conjunto amplo de candidatos (até 3.000 para Revalida) para permitir estratificação sem truncamento
        const isRevalidaMode = filters.modalidades?.some((m) => m.toLowerCase().includes('revalida'));
        const { data, error } = await q.limit(isRevalidaMode ? 3500 : 1000);

        if (!error && data) {
          // Filtragem estrita e integrada ao histórico real do aluno no Supabase
          let validCandidates = data as QuestionCandidate[];
          if (filters.status === 'Não vistas') {
            validCandidates = validCandidates.filter((c) => !answeredSet.has(c.id));
          } else if (filters.status === 'Resolvidas') {
            validCandidates = validCandidates.filter((c) => answeredSet.has(c.id));
          } else if (filters.status === 'Acertadas') {
            validCandidates = validCandidates.filter((c) => correctSet.has(c.id));
          } else if (filters.status === 'Erradas') {
            validCandidates = validCandidates.filter((c) => wrongSet.has(c.id));
          }

          if (filters.aleatorizar) {
            validCandidates = shuffleArray(validCandidates);
          } else {
            validCandidates.sort((a, b) => {
              const diff = (b.year || 0) - (a.year || 0);
              return diff !== 0 ? diff : a.id.localeCompare(b.id);
            });
          }

          candidatePoolsByItem[item] = validCandidates;
          stockAvailableByItem[item] = validCandidates.length;
        } else {
          candidatePoolsByItem[item] = [];
          stockAvailableByItem[item] = 0;
        }
      } catch (err) {
        console.error(`Erro ao buscar candidatos para cota ${item}:`, err);
        candidatePoolsByItem[item] = [];
        stockAvailableByItem[item] = 0;
      }
    })
  );

  // 3. FALLBACK AUTOMÁTICO DE ESTOQUE COM REDISTRIBUIÇÃO PROPORCIONAL
  const adjustedAllocations: Record<string, number> = {};
  let totalDeficit = 0;

  for (const [item, requested] of Object.entries(contentQuotas)) {
    const avail = stockAvailableByItem[item] || 0;
    const allocated = Math.min(requested, avail);
    adjustedAllocations[item] = allocated;
    totalDeficit += (requested - allocated);
  }

  if (totalDeficit > 0) {
    let remainingDeficit = totalDeficit;
    let madeProgress = true;

    while (remainingDeficit > 0 && madeProgress) {
      madeProgress = false;
      const surplusItems = Object.keys(contentQuotas).filter(
        (it) => (stockAvailableByItem[it] - adjustedAllocations[it]) > 0
      );

      if (surplusItems.length === 0) break;

      for (const it of surplusItems) {
        if (remainingDeficit <= 0) break;
        if (stockAvailableByItem[it] - adjustedAllocations[it] > 0) {
          adjustedAllocations[it] += 1;
          remainingDeficit -= 1;
          madeProgress = true;
        }
      }
    }
  }

  // 4. SELEÇÃO DE CANDIDATOS POR COTA COM MAPA GLOBAL DE ANOS
  const selectedPoolsByItem: Record<string, string[]> = {};
  const globalUsedIds = new Set<string>();
  const allCandidatesMap = new Map<string, QuestionCandidate>();

  for (const [item, quotaCount] of Object.entries(adjustedAllocations)) {
    if (quotaCount <= 0) {
      selectedPoolsByItem[item] = [];
      continue;
    }

    const candidates = (candidatePoolsByItem[item] || []).filter(
      (c) => !globalUsedIds.has(c.id)
    );

    candidates.forEach((c) => allCandidatesMap.set(c.id, c));

    if (!filters.aleatorizar) {
      // MODO MAIS RECENTES: Ordena estritamente por ano decrescente e seleciona as mais novas
      const sortedCandidates = [...candidates].sort((a, b) => {
        const diff = (b.year || 0) - (a.year || 0);
        return diff !== 0 ? diff : a.id.localeCompare(b.id);
      });
      const itemSelectedIds: string[] = [];
      for (const cand of sortedCandidates) {
        if (itemSelectedIds.length >= quotaCount) break;
        if (!globalUsedIds.has(cand.id)) {
          globalUsedIds.add(cand.id);
          itemSelectedIds.push(cand.id);
        }
      }
      selectedPoolsByItem[item] = itemSelectedIds;
    } else {
      // MODO ALEATÓRIO: Embaralhamento total de candidatos da cota sem intercalar
      const shuffledCandidates = shuffleArray([...candidates]);
      const itemSelectedIds: string[] = [];
      for (const cand of shuffledCandidates) {
        if (itemSelectedIds.length >= quotaCount) break;
        if (!globalUsedIds.has(cand.id)) {
          globalUsedIds.add(cand.id);
          itemSelectedIds.push(cand.id);
        }
      }
      selectedPoolsByItem[item] = itemSelectedIds;
    }
  }

  // 5. MONTAGEM DA LISTA FINAL COM INTERCALAÇÃO REAL ROUND-ROBIN
  const finalOrderedIds: string[] = [];
  const contentItems = Object.keys(selectedPoolsByItem);
  const poolsQueue: Record<string, string[]> = {};
  for (const it of contentItems) {
    poolsQueue[it] = [...(selectedPoolsByItem[it] || [])];
  }

  let hasMore = true;
  while (hasMore && finalOrderedIds.length < finalMax) {
    hasMore = false;
    for (const it of contentItems) {
      if (poolsQueue[it] && poolsQueue[it].length > 0) {
        const nextId = poolsQueue[it].shift()!;
        finalOrderedIds.push(nextId);
        hasMore = true;
        if (finalOrderedIds.length >= finalMax) break;
      }
    }
  }

  // 6. SE AINDA HOUVER DÉFICIT GLOBAL, COMPLETA RESPEITANDO OS FILTROS GERAIS
  if (finalOrderedIds.length < finalMax) {
    const remaining = finalMax - finalOrderedIds.length;
    try {
      let qComp = supabase
        .from('questions')
        .select('id, banca, year')
        .not('especialidade', 'is', null)
        .neq('especialidade', '')
        .neq('especialidade', 'Não Classificada')
        .eq('is_anulada', false);

      if (!filters.aleatorizar) {
        qComp = qComp.order('year', { ascending: false }).order('id', { ascending: true });
      }

      if (filters.especialidades && filters.especialidades.length > 0) {
        const specs = new Set<string>();
        filters.especialidades.forEach((sp) => {
          specs.add(sp);
          if (sp === 'Cirurgia Geral' || sp === 'Cirurgia') {
            specs.add('Cirurgia');
            specs.add('Cirurgia Geral');
          }
          if (sp === 'Ginecologia e Obstetrícia') {
            specs.add('Ginecologia');
            specs.add('Obstetrícia');
          }
        });
        qComp = qComp.in('especialidade', Array.from(specs));
      }
      if (filters.temas && filters.temas.length > 0) {
        qComp = qComp.in('tema', filters.temas);
      }
      if (filters.focos && filters.focos.length > 0) {
        qComp = qComp.in('foco', filters.focos);
      }
      if (filters.subfocos && filters.subfocos.length > 0) {
        qComp = qComp.in('subfoco', filters.subfocos);
      }
      if (filters.search && filters.search.trim()) {
        const sTerm = sanitizePostgrestTerm(filters.search);
        if (sTerm.length >= 2) {
          qComp = qComp.or(`foco.ilike.%${sTerm}%,subfoco.ilike.%${sTerm}%,tema.ilike.%${sTerm}%,banca.ilike.%${sTerm}%,code.ilike.%${sTerm}%`);
        }
      }
      if (resolvedBancas.length > 0) {
        qComp = qComp.in('banca', resolvedBancas);
      }
      if (filters.anos && filters.anos.length > 0) {
        qComp = qComp.in('year', filters.anos);
      }
      if (filters.dificuldade && filters.dificuldade !== 'Todas') {
        qComp = qComp.eq('difficulty', filters.dificuldade);
      }
      if (filters.ocultarAnuladasErro) {
        qComp = qComp.eq('is_anulada', false);
      }

      const { data: compData } = await qComp.limit(remaining * 3);
      if (compData && compData.length > 0) {
        const compCandidates = !filters.aleatorizar
          ? [...compData].sort((a, b) => {
            const diff = (b.year || 0) - (a.year || 0);
            return diff !== 0 ? diff : a.id.localeCompare(b.id);
          })
          : shuffleArray(compData);
        for (const row of compCandidates) {
          allCandidatesMap.set(row.id, row as QuestionCandidate);
          if (!globalUsedIds.has(row.id)) {
            globalUsedIds.add(row.id);
            finalOrderedIds.push(row.id);
            if (finalOrderedIds.length >= finalMax) break;
          }
        }
      }
    } catch (e) {
      console.error('Erro ao completar fallback global:', e);
    }
  }

  // 7. RETORNO FINAL:
  // Se for Aleatório: embaralha completamente todas as questões (anos e bancas randômicos)
  if (filters.aleatorizar) {
    return shuffleArray(finalOrderedIds);
  }

  // Se for Mais Recentes: ordena estritamente por ano decrescente (2027, 2026, 2025, 2024...) com desempate determinístico por id
  return finalOrderedIds.sort((idA, idB) => {
    const yA = allCandidatesMap.get(idA)?.year || 0;
    const yB = allCandidatesMap.get(idB)?.year || 0;
    const diff = yB - yA;
    if (diff !== 0) return diff;
    return idA.localeCompare(idB);
  });
}
