import hierarquiaData from '@/data/hierarquiaCompletaFiltros.json';
import { SelectedTaxonomy } from '@/types/studyTimer';

interface HierarchyNodePath {
  especialidade: string;
  tema: string;
  foco: string;
  subfoco?: string;
}

// Caches em memória indexados para consultas O(1) de alta performance
let isIndexBuilt = false;
const subfocoMap = new Map<string, HierarchyNodePath[]>();
const focoMap = new Map<string, HierarchyNodePath[]>();
const temaMap = new Map<string, HierarchyNodePath[]>();
const especialidadeSet = new Set<string>();

function normalizeTaxonomyTerm(str: string): string {
  return (str || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function buildHierarchyIndex() {
  if (isIndexBuilt) return;

  const hierarquia = hierarquiaData.hierarquia_padrao || [];

  for (const esp of hierarquia) {
    const espName = esp.especialidade;
    especialidadeSet.add(espName);

    for (const t of esp.temas || []) {
      const temaName = t.tema;
      const temaKey = normalizeTaxonomyTerm(temaName);

      for (const f of t.focos || []) {
        const focoName = f.foco;
        const focoKey = normalizeTaxonomyTerm(focoName);

        const nodePath: HierarchyNodePath = {
          especialidade: espName,
          tema: temaName,
          foco: focoName
        };

        // Indexa foco
        const existingFoco = focoMap.get(focoKey) || [];
        existingFoco.push(nodePath);
        focoMap.set(focoKey, existingFoco);

        // Indexa tema
        const existingTema = temaMap.get(temaKey) || [];
        existingTema.push(nodePath);
        temaMap.set(temaKey, existingTema);

        // Indexa subfocos
        for (const sf of f.subfocos || []) {
          const sfKey = normalizeTaxonomyTerm(sf);
          const sfPath: HierarchyNodePath = {
            ...nodePath,
            subfoco: sf
          };
          const existingSf = subfocoMap.get(sfKey) || [];
          existingSf.push(sfPath);
          subfocoMap.set(sfKey, existingSf);
        }
      }
    }
  }

  isIndexBuilt = true;
}

export interface FilterTaxonomyInputs {
  especialidades?: string[];
  temas?: string[];
  focos?: string[];
  subfocos?: string[];
}

/**
 * Dedução de Taxonomia Hierárquica para Sessões de Estudo (Algoritmo LCA - Lowest Common Ancestor)
 * 
 * Regras:
 * 1. Um único foco OU múltiplos subfocos do mesmo foco -> Inicia sessão no nível FOCO.
 * 2. Múltiplos focos OU subfocos de focos diferentes do mesmo tema -> Inicia sessão no nível TEMA.
 * 3. Múltiplos temas OU itens de temas diferentes da mesma especialidade -> Inicia sessão no nível ESPECIALIDADE.
 * 4. Múltiplas especialidades OU nenhum filtro de área -> Inicia sessão como "Treino Geral".
 */
export function deduceStudyTaxonomy(filters: FilterTaxonomyInputs): SelectedTaxonomy {
  buildHierarchyIndex();

  const activeSubfocos = filters.subfocos || [];
  const activeFocos = filters.focos || [];
  const activeTemas = filters.temas || [];
  const activeEspecialidades = filters.especialidades || [];

  // Se o aluno explicitamente selecionou mais de 1 especialidade no filtro
  if (activeEspecialidades.length > 1) {
    return {
      rawLabel: 'Treino Geral'
    };
  }

  const matchedPaths: HierarchyNodePath[] = [];

  // 1. Mapeia subfocos selecionados
  for (const sf of activeSubfocos) {
    const key = normalizeTaxonomyTerm(sf);
    let paths = subfocoMap.get(key);
    if (!paths || paths.length === 0) {
      for (const [subKey, subPaths] of subfocoMap.entries()) {
        if (subKey.includes(key) || key.includes(subKey)) {
          paths = subPaths;
          break;
        }
      }
    }
    if (paths && paths.length > 0) {
      matchedPaths.push(...paths);
    } else {
      matchedPaths.push({
        especialidade: activeEspecialidades[0] || 'Treino Geral',
        tema: activeTemas[0] || 'Geral',
        foco: sf,
        subfoco: sf
      });
    }
  }

  // 2. Mapeia focos selecionados
  for (const f of activeFocos) {
    const key = normalizeTaxonomyTerm(f);
    let paths = focoMap.get(key);
    if (!paths || paths.length === 0) {
      for (const [fKey, fPaths] of focoMap.entries()) {
        if (fKey.includes(key) || key.includes(fKey)) {
          paths = fPaths;
          break;
        }
      }
    }
    if (paths && paths.length > 0) {
      matchedPaths.push(...paths);
    } else {
      matchedPaths.push({
        especialidade: activeEspecialidades[0] || 'Treino Geral',
        tema: activeTemas[0] || 'Geral',
        foco: f
      });
    }
  }

  // 3. Mapeia temas selecionados diretamente
  for (const t of activeTemas) {
    const key = normalizeTaxonomyTerm(t);
    let paths = temaMap.get(key);
    if (!paths || paths.length === 0) {
      for (const [tKey, tPaths] of temaMap.entries()) {
        if (tKey.includes(key) || key.includes(tKey)) {
          paths = tPaths;
          break;
        }
      }
    }
    if (paths && paths.length > 0) {
      matchedPaths.push(...paths);
    } else {
      matchedPaths.push({
        especialidade: activeEspecialidades[0] || 'Treino Geral',
        tema: t,
        foco: t
      });
    }
  }

  // 4. Mapeia especialidades selecionadas diretamente (se não houver subitens)
  if (matchedPaths.length === 0 && activeEspecialidades.length > 0) {
    for (const esp of activeEspecialidades) {
      matchedPaths.push({
        especialidade: esp,
        tema: '',
        foco: ''
      });
    }
  }

  // Se nenhum critério taxonômico foi selecionado -> Treino Geral
  if (matchedPaths.length === 0) {
    return {
      rawLabel: 'Treino Geral'
    };
  }

  // Avalia diversidade de Especialidades (ignora 'Treino Geral' temporário na checagem de união)
  const resolvedEspecialidades = matchedPaths
    .map((p) => p.especialidade)
    .filter((esp) => esp && esp !== 'Treino Geral');

  const uniqueEspecialidades = Array.from(
    new Set([...activeEspecialidades, ...resolvedEspecialidades])
  );

  // Caso 4: Especialidades distintas -> Treino Geral
  if (uniqueEspecialidades.length > 1) {
    return {
      rawLabel: 'Treino Geral'
    };
  }

  const singleEspecialidade = uniqueEspecialidades[0] || 'Treino Geral';

  // Se só selecionou a especialidade (sem temas/focos)
  const uniqueTemas = Array.from(
    new Set(matchedPaths.map((p) => p.tema).filter(Boolean))
  );

  // Caso 3: Especialidade única, mas temas múltiplos ou diversos
  if (uniqueTemas.length > 1 || (uniqueTemas.length === 0 && activeEspecialidades.length === 1)) {
    return {
      especialidade: singleEspecialidade,
      rawLabel: singleEspecialidade
    };
  }

  const singleTema = uniqueTemas[0] || '';

  // Avalia diversidade de Focos
  const uniqueFocos = Array.from(
    new Set(matchedPaths.map((p) => p.foco).filter(Boolean))
  );

  // Caso 2: Múltiplos focos do mesmo tema -> Inicia no nível Tema
  if (uniqueFocos.length > 1 || (uniqueFocos.length === 0 && activeTemas.length === 1)) {
    return {
      especialidade: singleEspecialidade,
      tema: singleTema,
      rawLabel: singleTema || singleEspecialidade
    };
  }

  const singleFoco = uniqueFocos[0] || '';

  // Caso 1: Um único foco (ou vários subfocos do mesmo foco) -> Inicia no nível Foco
  return {
    especialidade: singleEspecialidade,
    tema: singleTema,
    foco: singleFoco,
    rawLabel: singleFoco || singleTema || singleEspecialidade
  };
}
