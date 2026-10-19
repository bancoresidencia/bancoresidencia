import { supabase } from '../lib/supabase';
import { ExtendedFilterState, resolveBancaList } from './questionService';
import { hierarchyQuestionCounts } from '@/data/hierarchyCounts';

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
function shuffleArray<T>(arr: T[]): T[] {
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
  const hasAnos = Boolean(filters.anos && filters.anos.length > 0 && filters.anos.length < 15);
  const hasDiff = Boolean(filters.dificuldade && filters.dificuldade !== 'Todas');
  const hasType = Boolean(filters.tipoQuestao && filters.tipoQuestao !== 'Todas');
  const hasAnuladas = Boolean(filters.ocultarAnuladasErro);
  const has5Anos = Boolean(filters.ultimos5Anos);
  const hasModalidade = Boolean(
    filters.modalidades &&
    filters.modalidades.length > 0 &&
    !(filters.modalidades.length === 1 && filters.modalidades[0] === 'Residência Médica')
  );

  return hasBancas || hasAnos || hasDiff || hasType || hasAnuladas || has5Anos || hasModalidade;
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
    gabaritoStatus: filters.gabaritoStatus
  });

  const cached = facetedCountsCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < 60000) {
    return cached.data;
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
          qSpec = qSpec.gte('year', 2020);
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

      // Normalizações combinadas
      especialidades['Cirurgia Geral'] = (especialidades['Cirurgia'] || 0) + (especialidades['Cirurgia Geral'] || 0);
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

    // Caso haja filtro de Bancas específicas: consulta indexada rápida nas bancas selecionadas
    const resolved = resolveBancaList(filters.instituicoes || []);
    let q = supabase
      .from('questions')
      .select('id, especialidade, tema, foco, subfoco')
      .in('banca', resolved)
      .order('id', { ascending: true })
      .limit(3000);

    // Anos
    if (filters.anos && filters.anos.length > 0) {
      q = q.in('year', filters.anos);
    } else if (filters.ultimos5Anos) {
      q = q.gte('year', 2020);
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

    const { data, error } = await q;

    if (error || !data) {
      console.warn('Aviso ao buscar contagens facetadas:', error);
      return null;
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
        } else if (esp === 'Ginecologia' || esp === 'Obstetrícia' || esp === 'Ginecologia e Obstetrícia') {
          espKeys.push('Ginecologia e Obstetrícia');
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
  answeredQuestionIds?: string[]
): Promise<string[]> {
  const finalMax = Math.min(200, Math.max(1, targetLimit));
  const answeredSet = new Set(answeredQuestionIds || []);

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
    const resolvedBanca = resolveBancaList([key]);
    const isBanca = !isStandardSpec && (knownBancas.has(key) || resolvedBanca.length > 0);

    if (isBanca) {
      bancaQuotas[key] = qty;
    } else {
      contentQuotas[key] = qty;
    }
  }

  // Se nenhuma cota de conteúdo foi explicitada, deriva fielmente dos filtros ativos de conteúdo
  if (Object.keys(contentQuotas).length === 0) {
    const selectedContent: string[] = [];
    if (filters.subfocos && filters.subfocos.length > 0) {
      selectedContent.push(...filters.subfocos);
    } else if (filters.focos && filters.focos.length > 0) {
      selectedContent.push(...filters.focos);
    } else if (filters.temas && filters.temas.length > 0) {
      selectedContent.push(...filters.temas);
    } else if (filters.especialidades && filters.especialidades.length > 0) {
      selectedContent.push(...filters.especialidades);
    }

    if (selectedContent.length > 0) {
      const base = Math.floor(finalMax / selectedContent.length);
      const rem = finalMax % selectedContent.length;
      selectedContent.forEach((item, idx) => {
        contentQuotas[item] = base + (idx < rem ? 1 : 0);
      });
    } else {
      // Padrão: 5 grandes áreas balanceadas
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

  // Bancas contextuais (AND com conteúdo)
  const allBancaNames = [
    ...(filters.instituicoes || []),
    ...Object.keys(bancaQuotas)
  ];
  const resolvedBancas = resolveBancaList(allBancaNames);

  // 2. BUSCA DE ESTOQUE DISPONÍVEL PARA CADA COTA DE CONTEÚDO (AND ENTRE GRUPOS, OR DENTRO)
  const candidatePoolsByItem: Record<string, QuestionCandidate[]> = {};
  const stockAvailableByItem: Record<string, number> = {};

  for (const [item, requested] of Object.entries(contentQuotas)) {
    if (requested <= 0) continue;

    try {
      let q = supabase
        .from('questions')
        .select('id, especialidade, tema, foco, subfoco, banca, year, difficulty');

      // Regra de Gabarito: Todas as questões presentes por padrão
      if (filters.gabaritoStatus === 'sem_gabarito') {
        q = q.or('correct_answer.is.null,correct_answer.eq.').eq('is_anulada', false);
      } else if (filters.gabaritoStatus === 'com_gabarito') {
        q = q.or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true');
      }

      // Conteúdo: Especialidade / Tema / Foco / Subfoco
      if (item === 'Cirurgia Geral' || item === 'Cirurgia') {
        q = q.in('especialidade', ['Cirurgia', 'Cirurgia Geral']);
      } else if (item === 'Ginecologia e Obstetrícia') {
        q = q.in('especialidade', ['Ginecologia e Obstetrícia', 'Ginecologia', 'Obstetrícia']);
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
        q = q.gte('year', 2020);
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

      // Modalidade
      if (filters.modalidades && filters.modalidades.length > 0) {
        const hasRevalida = filters.modalidades.some((m) => m.toLowerCase().includes('revalida'));
        const otherModalidades = filters.modalidades.filter((m) => !m.toLowerCase().includes('revalida'));
        if (hasRevalida && otherModalidades.length === 0) {
          q = q.or('modalidade.eq.Revalida,banca.ilike.%Revalida%,institution.ilike.%Revalida%,code.ilike.INEPREVALIDA%');
        } else if (hasRevalida && otherModalidades.length > 0) {
          const otherIn = otherModalidades.join(',');
          q = q.or(`modalidade.in.(${otherIn}),banca.ilike.%Revalida%,institution.ilike.%Revalida%,code.ilike.INEPREVALIDA%`);
        } else {
          const isOnlyDefault =
            filters.modalidades.length === 1 &&
            filters.modalidades[0] === 'Residência Médica';
          if (!isOnlyDefault) {
            q = q.in('modalidade', filters.modalidades);
          }
        }
      }

      // Busca um conjunto amplo de candidatos (até 1.500) para permitir estratificação
      const { data, error } = await q.limit(1500);

      if (!error && data) {
        // Filtragem de já respondidas se solicitado por status
        let validCandidates = data as QuestionCandidate[];
        if (filters.status === 'Não vistas' && answeredSet.size > 0) {
          validCandidates = validCandidates.filter((c) => !answeredSet.has(c.id));
        } else if (filters.status === 'Resolvidas' && answeredSet.size > 0) {
          validCandidates = validCandidates.filter((c) => answeredSet.has(c.id));
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
  }

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

  // 4. AMOSTRAGEM ESTRATIFICADA E ALEATORIZAÇÃO REAL (FIM DO EFEITO BLOCO)
  // Emula: ROW_NUMBER() OVER (PARTITION BY banca, year ORDER BY RANDOM())
  const selectedPoolsByItem: Record<string, string[]> = {};
  const globalUsedIds = new Set<string>();

  for (const [item, quotaCount] of Object.entries(adjustedAllocations)) {
    if (quotaCount <= 0) {
      selectedPoolsByItem[item] = [];
      continue;
    }

    const candidates = (candidatePoolsByItem[item] || []).filter(
      (c) => !globalUsedIds.has(c.id)
    );

    // Particionamento por chave (banca + ano)
    const partitions: Record<string, QuestionCandidate[]> = {};
    for (const c of candidates) {
      const pKey = `${c.banca || 'unknown'}_${c.year || 0}`;
      if (!partitions[pKey]) partitions[pKey] = [];
      partitions[pKey].push(c);
    }

    // Embaralha internamente cada partição
    for (const k of Object.keys(partitions)) {
      partitions[k] = shuffleArray(partitions[k]);
    }

    // Coleta estratificada ciclando partições com rn = 0, 1, 2...
    const itemSelectedIds: string[] = [];
    let rn = 0;
    let foundInRound = true;

    while (itemSelectedIds.length < quotaCount && foundInRound) {
      foundInRound = false;
      const partKeys = shuffleArray(Object.keys(partitions));

      for (const k of partKeys) {
        if (itemSelectedIds.length >= quotaCount) break;
        const part = partitions[k];
        if (rn < part.length) {
          const cand = part[rn];
          if (!globalUsedIds.has(cand.id)) {
            globalUsedIds.add(cand.id);
            itemSelectedIds.push(cand.id);
            foundInRound = true;
          }
        }
      }
      rn++;
    }

    selectedPoolsByItem[item] = itemSelectedIds;
  }

  // 5. INTERCALAÇÃO (ROUND-ROBIN) NA LISTA FINAL
  const finalOrderedIds: string[] = [];
  const contentItems = Object.keys(selectedPoolsByItem);
  let maxPoolSize = 0;
  for (const it of contentItems) {
    if (selectedPoolsByItem[it].length > maxPoolSize) {
      maxPoolSize = selectedPoolsByItem[it].length;
    }
  }

  for (let idx = 0; idx < maxPoolSize; idx++) {
    for (const it of contentItems) {
      if (idx < selectedPoolsByItem[it].length && finalOrderedIds.length < finalMax) {
        finalOrderedIds.push(selectedPoolsByItem[it][idx]);
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
        .or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true')
        .not('especialidade', 'is', null)
        .neq('especialidade', '')
        .neq('especialidade', 'Não Classificada');

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
        const shuffledComp = shuffleArray(compData);
        for (const row of shuffledComp) {
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

  return finalOrderedIds;
}
