import {
  TemaChecklistGroup,
  SpecialtyChecklistGroup,
  UserFocusProgress
} from '@/types/studySchedule';
import {
  EnrichedFocusWithIncidence,
  getSpecialtyColor
} from '@/services/examIncidenceService';

// Ordem canônica de exibição das 6 grandes áreas médicas
export const CANONICAL_SPECIALTY_ORDER: string[] = [
  'Clínica Médica',
  'Cirurgia Geral',
  'Cirurgia',
  'Pediatria',
  'Ginecologia e Obstetrícia',
  'Ginecologia',
  'Obstetrícia',
  'Medicina Preventiva e Social',
  'Medicina Preventiva'
];

/**
 * Constrói a árvore hierárquica completa (Especialidade -> Tema -> Foco)
 * com cálculo determinístico de progresso e cobertura de estudo.
 */
export function buildChecklistHierarchy(
  foci: EnrichedFocusWithIncidence[],
  focusProgressMap: Record<string, UserFocusProgress> = {}
): SpecialtyChecklistGroup[] {
  // 1. Mapeamento por Especialidade -> Tema -> Focos
  const specialtyMap = new Map<string, Map<string, EnrichedFocusWithIncidence[]>>();

  for (const focus of foci) {
    const esp = focus.especialidade;
    const tema = focus.tema;

    let temaMap = specialtyMap.get(esp);
    if (!temaMap) {
      temaMap = new Map<string, EnrichedFocusWithIncidence[]>();
      specialtyMap.set(esp, temaMap);
    }

    let focusList = temaMap.get(tema);
    if (!focusList) {
      focusList = [];
      temaMap.set(tema, focusList);
    }
    focusList.push(focus);
  }

  // 2. Ordenação das Especialidades (conforme a ordem canônica)
  const orderedSpecialties = Array.from(specialtyMap.keys()).sort((a, b) => {
    const indexA = CANONICAL_SPECIALTY_ORDER.findIndex(
      (name) => name.toLowerCase() === a.toLowerCase()
    );
    const indexB = CANONICAL_SPECIALTY_ORDER.findIndex(
      (name) => name.toLowerCase() === b.toLowerCase()
    );

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b, 'pt-BR');
  });

  // 3. Montagem dos grupos estruturados com agregação de métricas
  const result: SpecialtyChecklistGroup[] = [];

  for (const esp of orderedSpecialties) {
    const temaMap = specialtyMap.get(esp)!;
    const temas: TemaChecklistGroup[] = [];

    let espTotalFoci = 0;
    let espStudiedFoci = 0;
    let espWithRevisionFoci = 0;

    // Ordenação dos temas (alfabética por padrão)
    const sortedTemas = Array.from(temaMap.keys()).sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );

    for (const tema of sortedTemas) {
      const temaFoci = temaMap.get(tema) || [];
      const totalFoci = temaFoci.length;

      let studiedFoci = 0;
      let withRevisionFoci = 0;
      let hasExtremeIncidence = false;
      let hasHighIncidence = false;

      for (const f of temaFoci) {
        const prog = focusProgressMap[f.focusKey];
        if (prog?.isStudied) studiedFoci++;
        if (prog?.reviewCount && prog.reviewCount > 0) withRevisionFoci++;

        if (f.incidence?.fireCount === 4) hasExtremeIncidence = true;
        if (f.incidence?.fireCount === 3) hasHighIncidence = true;
      }

      const progressPercent =
        totalFoci > 0 ? Math.round((studiedFoci / totalFoci) * 100) : 0;

      temas.push({
        tema,
        especialidade: esp,
        foci: temaFoci,
        totalFoci,
        studiedFoci,
        withRevisionFoci,
        progressPercent,
        hasExtremeIncidence,
        hasHighIncidence
      });

      espTotalFoci += totalFoci;
      espStudiedFoci += studiedFoci;
      espWithRevisionFoci += withRevisionFoci;
    }

    const espProgressPercent =
      espTotalFoci > 0 ? Math.round((espStudiedFoci / espTotalFoci) * 100) : 0;

    result.push({
      especialidade: esp,
      specialtyColor: getSpecialtyColor(esp),
      temas,
      totalFoci: espTotalFoci,
      studiedFoci: espStudiedFoci,
      withRevisionFoci: espWithRevisionFoci,
      progressPercent: espProgressPercent
    });
  }

  return result;
}

export interface HierarchyFilterParams {
  searchQuery?: string;
  selectedSpecialty?: string;
  statusFilter?: 'all' | 'pending' | 'studied' | 'with_revision';
  incidenceFilter?: 'all' | 'extreme_only' | 'high_plus';
}

export interface FilteredHierarchyResult {
  tree: SpecialtyChecklistGroup[];
  totalFilteredFoci: number;
  autoExpandedKeys: {
    specialties: Set<string>;
    temas: Set<string>;
  };
}

/**
 * Filtra a árvore hierárquica e calcula quais Especialidades e Temas devem
 * ser auto-expandidos com base nos filtros ativos (ex: busca por texto).
 */
export function filterChecklistHierarchy(
  hierarchy: SpecialtyChecklistGroup[],
  params: HierarchyFilterParams,
  focusProgressMap: Record<string, UserFocusProgress> = {}
): FilteredHierarchyResult {
  const q = (params.searchQuery || '').trim().toLowerCase();
  const selectedEsp = params.selectedSpecialty || 'all';
  const status = params.statusFilter || 'all';
  const incidence = params.incidenceFilter || 'all';

  const autoExpandedSpecialties = new Set<string>();
  const autoExpandedTemas = new Set<string>();

  const isFilteringActive =
    q.length > 0 ||
    selectedEsp !== 'all' ||
    status !== 'all' ||
    incidence !== 'all';

  let totalFilteredFoci = 0;
  const filteredTree: SpecialtyChecklistGroup[] = [];

  for (const espGroup of hierarchy) {
    if (selectedEsp !== 'all' && espGroup.especialidade !== selectedEsp) {
      continue;
    }

    const filteredTemas: TemaChecklistGroup[] = [];
    let espTotalFiltered = 0;
    let espStudiedFiltered = 0;
    let espWithRevFiltered = 0;

    for (const temaGroup of espGroup.temas) {
      const matchingFoci = temaGroup.foci.filter((f) => {
        const prog = focusProgressMap[f.focusKey];
        const isStudied = Boolean(prog?.isStudied);
        const hasRev = Boolean(prog?.reviewCount && prog.reviewCount > 0);

        if (status === 'pending' && isStudied) return false;
        if (status === 'studied' && !isStudied) return false;
        if (status === 'with_revision' && !hasRev) return false;

        if (incidence === 'extreme_only' && f.incidence?.fireCount !== 4) return false;
        if (incidence === 'high_plus' && (f.incidence?.fireCount || 0) < 3) return false;

        if (q) {
          const inFoco = f.foco.toLowerCase().includes(q);
          const inTema = f.tema.toLowerCase().includes(q);
          const inEsp = f.especialidade.toLowerCase().includes(q);
          if (!inFoco && !inTema && !inEsp) return false;
        }

        return true;
      });

      if (matchingFoci.length > 0) {
        let temaStudied = 0;
        let temaWithRev = 0;
        let hasExtreme = false;
        let hasHigh = false;

        for (const f of matchingFoci) {
          const prog = focusProgressMap[f.focusKey];
          if (prog?.isStudied) temaStudied++;
          if (prog?.reviewCount && prog.reviewCount > 0) temaWithRev++;
          if (f.incidence?.fireCount === 4) hasExtreme = true;
          if (f.incidence?.fireCount === 3) hasHigh = true;
        }

        const temaProgress =
          matchingFoci.length > 0
            ? Math.round((temaStudied / matchingFoci.length) * 100)
            : 0;

        filteredTemas.push({
          tema: temaGroup.tema,
          especialidade: espGroup.especialidade,
          foci: matchingFoci,
          totalFoci: matchingFoci.length,
          studiedFoci: temaStudied,
          withRevisionFoci: temaWithRev,
          progressPercent: temaProgress,
          hasExtremeIncidence: hasExtreme,
          hasHighIncidence: hasHigh
        });

        espTotalFiltered += matchingFoci.length;
        espStudiedFiltered += temaStudied;
        espWithRevFiltered += temaWithRev;
        totalFilteredFoci += matchingFoci.length;

        // Se houver busca ou filtros restritivos, auto-expande o tema
        if (isFilteringActive) {
          const temaKey = `${espGroup.especialidade}::${temaGroup.tema}`;
          autoExpandedTemas.add(temaKey);
          autoExpandedSpecialties.add(espGroup.especialidade);
        }
      }
    }

    if (filteredTemas.length > 0) {
      const espProgress =
        espTotalFiltered > 0
          ? Math.round((espStudiedFiltered / espTotalFiltered) * 100)
          : 0;

      filteredTree.push({
        especialidade: espGroup.especialidade,
        specialtyColor: espGroup.specialtyColor,
        temas: filteredTemas,
        totalFoci: espTotalFiltered,
        studiedFoci: espStudiedFiltered,
        withRevisionFoci: espWithRevFiltered,
        progressPercent: espProgress
      });
    }
  }

  return {
    tree: filteredTree,
    totalFilteredFoci,
    autoExpandedKeys: {
      specialties: autoExpandedSpecialties,
      temas: autoExpandedTemas
    }
  };
}
