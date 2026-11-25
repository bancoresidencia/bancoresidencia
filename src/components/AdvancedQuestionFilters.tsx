'use client';

import React, { useState, useMemo, useDeferredValue, useEffect, useRef } from 'react';
import {
  AdvancedFilterState,
  QuestionStatus,
  QuestionDifficulty,
  QuestionType,
  UserAnswerItem,
  SubfocoItem,
  Folder
} from '@/types';

const getSubfocoName = (item: SubfocoItem): string =>
  typeof item === 'string' ? item : item.subfoco;

const getSubSubfocos = (item: SubfocoItem): string[] =>
  typeof item === 'string' ? [] : (item.sub_subfocos || []);

/**
 * Higieniza o rótulo de exibição visual EXCLUSIVAMENTE para nós de 4º nível (sub_subfocos).
 * Remove sufixos descritivos longos, critérios após dois-pontos e posologias extensas na interface,
 * preservando o valor e ID originais íntegros para buscas, queries e filtros do motor.
 */
export const formatSubSubfocoDisplay = (ss: string): string => {
  if (!ss) return '';
  let clean = ss;

  // 1. Se tem dois-pontos: o que vem depois costuma ser detalhamento de critérios ou regras clínicas
  if (clean.includes(':')) {
    const rawPrefix = clean.split(':')[0].trim();
    const simplifiedPrefix = rawPrefix
      .replace(/\s*\([^)]*(?:pelo menos|mais de|após|entre|não neoplásicas|não podendo afastar)[^)]*\)/gi, '')
      .replace(/\s*\([^)]+\)/g, (match) => match.length > 20 ? '' : match)
      .trim();
    if (simplifiedPrefix.length >= 4) {
      return simplifiedPrefix;
    }
  }

  // 2. Se tem ponto-e-vírgula com alternativas ou posologia secundária
  if (clean.includes(';')) {
    clean = clean.split(';')[0].trim();
  }

  // 3. Remove posologias farmacológicas detalhadas entre parênteses
  clean = clean.replace(/\s*\(\s*\d+\s*(?:mg|mcg|g|ui|UI|h|dias|noites|semanas|meses)[^)]*\)/gi, '');

  // 4. Remove parênteses explicativos longos (> 25 caracteres)
  clean = clean.replace(/\s*\([^)(]{25,}\)/g, '');

  // 5. Se ainda for muito extenso e tiver travessão
  if (clean.length > 70 && clean.includes(' - ')) {
    clean = clean.split(' - ')[0].trim();
  }

  return clean.trim();
};
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Check,
  RotateCcw,
  Layers,
  Building2,
  Calendar,
  Sparkles,
  Target,
  BookOpen,
  ListPlus,
  Play,
  Ban,
  SlidersHorizontal,
  MapPin,
  PieChart,
  Scale,
  Plus,
  Minus,
  Shuffle,
  Clock,
  Loader2,
  Folder as FolderIcon
} from 'lucide-react';
import {
  clinicalHierarchy,
  mockYears
} from '@/data/mockQuestions';
import { fetchStudyCatalog } from '@/services/studyQuestionClient';
import type { StudyCatalogCounts } from '@/services/studyQuestionCatalog';
import { clinicalFields, clinicalPathKey, hasSelectedClinicalPath, isClinicalPathPrefix } from '@/utils/studyQuestionFilters';
import { resolveBancaList } from '@/services/questionService';
import {
  fetchFacetedHierarchyCounts,
  type FacetedHierarchyCountsResult
} from '@/services/questionService';
import { useTheme } from '@/context/ThemeContext';
import { Button, Badge } from '@/components/ui';
import { SmartAIFilterModal } from './SmartAIFilterModal';
import { BancaRaioXModal } from './BancaRaioXModal';
import { FolderBranchSelectorPopover } from './FolderBranchSelectorPopover';

interface AdvancedQuestionFiltersProps {
  filters: AdvancedFilterState;
  userAnswers?: Record<string, UserAnswerItem>;
  onChange: (filters: AdvancedFilterState) => void;
  onReset: () => void;
  loadError?: boolean;
  onRetry?: () => void;
  totalFiltered: number | null;
  isLoading?: boolean;
  onCreateListFromFilter: () => void;
  folders?: Folder[];
  onCreateFolder?: (name: string, parentId: string | null) => Promise<void> | void;
  onCreateListAtLocation?: (params: {
    title: string;
    folderId: string | null;
    totalQuestions: number;
    quotas: Record<string, number>;
    filters: AdvancedFilterState;
  }) => Promise<void>;
  onSelectDirectQuestion?: (questionId: string) => void;
  onStartSequentialSolving?: (limit?: number, quotasByItem?: Record<string, number>, currentFilters?: AdvancedFilterState) => void;
  isSidebarCollapsed?: boolean;
  embedded?: boolean;
}

const FALLBACK_EXAM_YEARS = mockYears.filter((year) => year !== 'Todos').map(Number);
const QUICK_YEAR_COUNTS = [3, 5, 10];

// Bancas mais concorridas para acesso rápido em 1 clique (Residência Médica)
const POPULAR_BANCAS_1CLIQUE = [
  { label: 'ENARE', key: 'ENARE' },
  { label: 'USP-SP', key: 'USP-SP' },
  { label: 'SUS-SP', key: 'SUS-SP' },
  { label: 'UNICAMP', key: 'UNICAMP/HC' },
  { label: 'SURCE', key: 'SURCE' },
  { label: 'PSU-MG', key: 'PSU-MG' },
  { label: 'UNIFESP', key: 'UNIFESP/EPM' }
];

// Bancas oficiais para o Exame de Revalidação de Diplomas Médicos (Revalida)
const REVALIDA_BANCAS_1CLIQUE = [
  { label: 'INEP Revalida', key: 'INEP Revalida' },
  { label: 'Revalida USP (FMRP)', key: 'FMRP-USP' },
  { label: 'UFMT Revalida', key: 'UFMT Revalida' },
  { label: 'UEPA Revalida', key: 'UEPA Revalida' },
  { label: 'UNIRG Revalida', key: 'UNIRG Revalida' }
];

// Bancas / Sociedades para Especialidades e Título de Especialista (R+ / Título)
const RPLUS_BANCAS_1CLIQUE = [
  { label: 'TEGO (Ginecologia/Obstetrícia)', key: 'TEGO' },
  { label: 'TEP (Pediatria)', key: 'TEP' },
  { label: 'TECM (Clínica Médica)', key: 'TECM' },
  { label: 'CBC (Cirurgia)', key: 'CBC' },
  { label: 'SBC (Cardiologia)', key: 'SBC' },
  { label: 'SBOT (Ortopedia)', key: 'SBOT' }
];



// Abas de Estado para o Catálogo de Bancas por UF (Todos os 26 Estados + DF + Nacional)
const UF_LIST = [
  'Todas', 'Nacional', 'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE',
  'CE', 'DF', 'GO', 'ES', 'PA', 'AM', 'PB', 'RN', 'AL', 'SE',
  'PI', 'MA', 'MT', 'MS', 'TO', 'RO', 'AC', 'AP', 'RR'
];

export interface UfInstitutionItem {
  sigla: string;
  uf: string;
  nome: string;
  count: string;
  key: string;
}

// Catálogo específico e exclusivo para o Exame de Revalidação de Diplomas Médicos (Revalida)
const REVALIDA_INSTITUTIONS_CATALOG: UfInstitutionItem[] = [
  { sigla: 'INEP Revalida', uf: 'Nacional', nome: 'INEP - Exame Nacional de Revalidação de Diplomas Médicos', count: '2.040 questões', key: 'INEP Revalida' },
  { sigla: 'UFMT Revalida', uf: 'MT', nome: 'Universidade Federal de Mato Grosso - Revalidação', count: '523 questões', key: 'UFMT Revalida' },
  { sigla: 'UEPA Revalida', uf: 'PA', nome: 'Universidade do Estado do Pará - Revalidação', count: '105 questões', key: 'UEPA Revalida' },
  { sigla: 'UNIRG Revalida', uf: 'TO', nome: 'Universidade de Gurupi - Revalidação', count: '50 questões', key: 'UNIRG Revalida' },
  { sigla: 'FMRP-USP Revalida', uf: 'SP', nome: 'Faculdade de Medicina de Ribeirão Preto (USP) - Revalidação', count: '203 questões', key: 'FMRP-USP' },
];

// Catálogo carregado sob demanda para manter o bundle inicial de /questoes leve
let ufInstitutionsCache: UfInstitutionItem[] = [];

const CANONICAL_BANCA_KEY_MAP: Record<string, string> = {
  'usp-sp': 'USP-SP',
  'usp/hcfmusp': 'USP-SP',
  'fuvest - usp': 'USP-SP',
  'unicamp': 'UNICAMP/HC',
  'unicamp/hc': 'UNICAMP/HC',
  'unifesp': 'UNIFESP/EPM',
  'unifesp/epm': 'UNIFESP/EPM',
  'santa casa sp': 'Santa Casa de São Paulo',
  'santa casa de são paulo': 'Santa Casa de São Paulo',
  'hiae / einstein': 'Einstein',
  'einstein': 'Einstein',
  'hcpa / ufrgs': 'HCPA',
  'hcpa': 'HCPA',
  'puc-pr': 'Pontifícia Universidade Católica do Paraná',
  'pontifícia universidade católica do paraná': 'Pontifícia Universidade Católica do Paraná',
  'hub / unb': 'UnB',
  'unb': 'UnB'
};

export function getCanonicalBancaKey(raw: string): string {
  const norm = (raw || '').trim().toLowerCase();
  if (CANONICAL_BANCA_KEY_MAP[norm]) return CANONICAL_BANCA_KEY_MAP[norm];
  const item =
    ufInstitutionsCache.find(
      (c) => c.sigla.toLowerCase() === norm || c.key.toLowerCase() === norm || c.nome.toLowerCase() === norm
    ) ||
    REVALIDA_INSTITUTIONS_CATALOG.find(
      (c) => c.sigla.toLowerCase() === norm || c.key.toLowerCase() === norm || c.nome.toLowerCase() === norm
    );
  if (item) return item.key;
  return raw.trim();
}

export const AdvancedQuestionFilters: React.FC<AdvancedQuestionFiltersProps> = ({
  filters,
  userAnswers,
  onChange,
  onReset,
  loadError = false,
  onRetry,
  totalFiltered,
  isLoading = false,
  onCreateListFromFilter,
  folders = [],
  onCreateFolder,
  onCreateListAtLocation,
  onStartSequentialSolving,
  isSidebarCollapsed = true,
  embedded = false
}) => {
  const { accentConfig, mode } = useTheme();
  const isDark = mode === 'dark';

  // Estado local para quantidade a resolver
  const [resolveCount, setResolveCount] = useState<number>(50);
  const [showCustomQtd, setShowCustomQtd] = useState<boolean>(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const [isYearsOpen, setIsYearsOpen] = useState<boolean>(false);
  const [showSmartFilterModal, setShowSmartFilterModal] = useState<boolean>(false);
  const [showRaioXModal, setShowRaioXModal] = useState<boolean>(false);
  const [isFilterTransitioning, setIsFilterTransitioning] = useState<boolean>(false);
  const [isStartingQuestions, setIsStartingQuestions] = useState<boolean>(false);
  const [isCreateListMode, setIsCreateListMode] = useState<boolean>(false);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState<boolean>(false);
  const [selectedListFolderId, setSelectedListFolderId] = useState<string | null>(null);
  const [isCreatingListAtLocation, setIsCreatingListAtLocation] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'conteudo' | 'bancas'>('conteudo');
  const isFirstRender = useRef(true);

  const defaultListTitle = useMemo(() => {
    if (filters.subfocos && filters.subfocos.length > 0) return `Lista: ${filters.subfocos[0]}`;
    if (filters.focos && filters.focos.length > 0) return `Lista: ${filters.focos[0]}`;
    if (filters.temas && filters.temas.length > 0) return `Lista: ${filters.temas[0]}`;
    if (filters.especialidades && filters.especialidades.length > 0) return `Lista: ${filters.especialidades.join(', ')}`;
    if (filters.instituicoes && filters.instituicoes.length > 0) return `Lista: ${filters.instituicoes.join(', ')}`;
    return `Lista de Questões - ${new Date().toLocaleDateString('pt-BR')}`;
  }, [filters]);

  const selectedFolderName = useMemo(() => {
    if (!selectedListFolderId) return null;
    return folders.find((f) => f.id === selectedListFolderId)?.name || null;
  }, [folders, selectedListFolderId]);

  useEffect(() => {
    // Ignora na montagem inicial para evitar flash
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Micro-transição elegante ao interagir com qualquer filtro (220ms)
    setIsFilterTransitioning(true);
    const t = setTimeout(() => {
      setIsFilterTransitioning(false);
    }, 220);
    return () => clearTimeout(t);
  }, [
    filters.especialidades,
    filters.temas,
    filters.focos,
    filters.subfocos,
    filters.subSubfocos,
    filters.programaRplus,
    filters.bancaOrganizadora,
    filters.macrorregioes,
    filters.apenasComentadas,
    filters.instituicoes,
    filters.anos,
    filters.dificuldade,
    filters.modalidades,
    filters.tipoQuestao,
    filters.status,
    filters.search,
    filters.ocultarAnuladasErro,
    filters.ultimos5Anos
  ]);

  const isCountLoading = isLoading || isFilterTransitioning;

  const handleApplyAIFilters = (aiFilters: Partial<AdvancedFilterState>) => {
    onChange({
      ...filters,
      ...aiFilters,
      especialidades: aiFilters.especialidades !== undefined ? aiFilters.especialidades : filters.especialidades,
      temas: aiFilters.temas !== undefined ? aiFilters.temas : filters.temas,
      focos: aiFilters.focos !== undefined ? aiFilters.focos : filters.focos,
      subfocos: aiFilters.subfocos !== undefined ? aiFilters.subfocos : filters.subfocos,
      instituicoes: aiFilters.instituicoes !== undefined ? aiFilters.instituicoes : filters.instituicoes,
      anos: aiFilters.anos !== undefined ? aiFilters.anos : filters.anos,
      dificuldade: aiFilters.dificuldade !== undefined ? aiFilters.dificuldade : filters.dificuldade,
      search: aiFilters.search !== undefined ? aiFilters.search : filters.search
    });
  };

  // Resumo dinâmico de opções selecionadas no card de Dificuldade, Formato e Opções
  const activeOptionsSummary = useMemo(() => {
    const parts: string[] = [];
    if (filters.dificuldade && filters.dificuldade !== 'Todas') {
      parts.push(filters.dificuldade);
    }
    if (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') {
      const label = filters.tipoQuestao === 'Múltipla escolha'
        ? 'Múltipla'
        : (filters.tipoQuestao === 'Dissertativa' || filters.tipoQuestao === 'Discursiva')
          ? 'Discursiva'
          : (filters.tipoQuestao === 'Certo ou errado' || filters.tipoQuestao === 'Verdadeiro ou falso' || filters.tipoQuestao === 'Certo e Errado')
            ? 'Certo/Errado'
            : filters.tipoQuestao;
      parts.push(label);
    }
    if (filters.ocultarAnuladasErro) {
      parts.push('Sem anuladas');
    }
    if (filters.ocultarRevisadas) {
      parts.push('Sem revisadas');
    }
    if (filters.apenasComentadas) {
      parts.push('Comentadas');
    }
    return parts;
  }, [filters.dificuldade, filters.tipoQuestao, filters.ocultarAnuladasErro, filters.ocultarRevisadas, filters.apenasComentadas]);

  // Contadores de filtros ativos para as abas mobile
  const activeConteudoCount = useMemo(() => {
    return (
      (filters.especialidades?.length || 0) +
      (filters.temas?.length || 0) +
      (filters.focos?.length || 0) +
      (filters.subfocos?.length || 0) +
      (filters.subSubfocos?.length || 0)
    );
  }, [filters.especialidades, filters.temas, filters.focos, filters.subfocos, filters.subSubfocos]);

  const activeBancasCount = useMemo(() => {
    let count = (filters.instituicoes?.length || 0) + (filters.anos?.length || 0);
    if (filters.dificuldade && filters.dificuldade !== 'Todas') count++;
    if (filters.status && filters.status !== 'Todas') count++;
    if (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') count++;
    if (filters.ocultarAnuladasErro) count++;
    if (filters.ocultarRevisadas) count++;
    return count;
  }, [
    filters.instituicoes,
    filters.anos,
    filters.dificuldade,
    filters.status,
    filters.tipoQuestao,
    filters.ocultarAnuladasErro,
    filters.ocultarRevisadas
  ]);

  // Mini-seletor de Cotas e Distribuição Proporcional (Round-Robin)
  const [quotasByItem, setQuotasByItem] = useState<Record<string, number>>({});
  const [isCotasDrawerOpen, setIsCotasDrawerOpen] = useState<boolean>(false);

  const [catalog, setCatalog] = useState<StudyCatalogCounts | null>(null);
  const [facetedCounts, setFacetedCounts] = useState<FacetedHierarchyCountsResult | null>(null);
  const [ufInstitutionsCatalog, setUfInstitutionsCatalog] = useState<UfInstitutionItem[]>(() => ufInstitutionsCache);
  const [catalogError, setCatalogError] = useState(false);
  const [facetsError, setFacetsError] = useState(false);
  const [catalogRetry, setCatalogRetry] = useState(0);
  const [facetsRetry, setFacetsRetry] = useState(0);

  useEffect(() => {
    if (ufInstitutionsCache.length > 0) return;
    let active = true;
    import('@/data/canonicalBancasDirectory')
      .then((mod) => {
        const mapped: UfInstitutionItem[] = mod.CANONICAL_BANCAS_DIRECTORY.map((b) => ({
          sigla: b.sigla,
          uf: b.uf,
          nome: b.nome || b.sigla,
          count: `${b.count.toLocaleString('pt-BR')} questões`,
          key: b.key || b.sigla
        }));
        ufInstitutionsCache = mapped;
        if (active) setUfInstitutionsCatalog(mapped);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const modalityKey = JSON.stringify(filters.modalidades);
  const facetKey = JSON.stringify({
    modalidades: filters.modalidades, instituicoes: filters.instituicoes,
    tipoProva: filters.tipoProva, anos: filters.anos, dificuldade: filters.dificuldade,
    tipoQuestao: filters.tipoQuestao, status: filters.status, search: filters.search,
    ocultarAnuladasErro: filters.ocultarAnuladasErro, ocultarRevisadas: filters.ocultarRevisadas,
    ultimos5Anos: filters.ultimos5Anos, apenasComImagem: filters.apenasComImagem,
    apenasComentadas: filters.apenasComentadas,
    bancaOrganizadora: filters.bancaOrganizadora, macrorregioes: filters.macrorregioes,
    programaRplus: filters.programaRplus
  });
  const answerRevision = filters.status !== 'Todas' || filters.ocultarRevisadas ? userAnswers : undefined;

  useEffect(() => {
    const controller = new AbortController();
    setCatalogError(false);
    fetchStudyCatalog({ modalidades: JSON.parse(modalityKey) }, controller.signal)
      .then((result) => { if (!controller.signal.aborted) setCatalog(result); })
      .catch(() => { if (!controller.signal.aborted) setCatalogError(true); });
    return () => controller.abort();
  }, [modalityKey, catalogRetry]);

  useEffect(() => {
    const controller = new AbortController();
    setFacetsError(false);
    const timer = setTimeout(() => {
      fetchFacetedHierarchyCounts(JSON.parse(facetKey), controller.signal)
        .then((result) => { if (!controller.signal.aborted) setFacetedCounts(result); })
        .catch(() => { if (!controller.signal.aborted) setFacetsError(true); });
    }, 120);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [facetKey, answerRevision, facetsRetry]);

  const countForPath = (path: string[]): number | null => {
    if (!facetedCounts) return null;
    const count = (parts: string[]) => facetedCounts.paths[clinicalPathKey(parts)] ?? 0;
    return path[0] === 'Ginecologia e Obstetrícia'
      ? count(path) + count(['Ginecologia', ...path.slice(1)]) + count(['Obstetrícia', ...path.slice(1)])
      : count(path);
  };
  const formatCount = (count: number | null, failed = facetsError) => count === null
    ? (failed ? null : '…')
    : count.toLocaleString('pt-BR');

  // Identificação dinâmica de filtros selecionados para cotas (evitando duplicar pai e filho)
  const itemsToConfigure = useMemo(() => {
    const list: Array<{ id: string; name: string; category: string }> = [];
    const selectedSpecs = new Set(filters.especialidades || []);

    if (filters.especialidades && filters.especialidades.length > 0) {
      filters.especialidades.forEach((esp) => list.push({ id: esp, name: esp, category: 'Especialidade' }));
    }

    if (filters.temas && filters.temas.length > 0) {
      filters.temas.forEach((tem) => {
        const parentEsp = clinicalHierarchy.find((h) => h.temas.some((t) => t.tema === tem));
        if (!parentEsp || !selectedSpecs.has(parentEsp.especialidade)) {
          list.push({ id: tem, name: tem, category: 'Tema' });
        }
      });
    }

    if (filters.focos && filters.focos.length > 0) {
      const selectedTemas = new Set(filters.temas || []);
      filters.focos.forEach((foc) => {
        let parentEsp = '';
        let parentTem = '';
        clinicalHierarchy.forEach((h) => {
          h.temas.forEach((t) => {
            if (t.focos.some((f) => f.foco === foc)) {
              parentEsp = h.especialidade;
              parentTem = t.tema;
            }
          });
        });
        if (!selectedSpecs.has(parentEsp) && !selectedTemas.has(parentTem)) {
          list.push({ id: foc, name: foc, category: 'Foco' });
        }
      });
    }

    if (filters.subfocos && filters.subfocos.length > 0) {
      filters.subfocos.forEach((sub) => list.push({ id: sub, name: sub, category: 'Subfoco' }));
    }

    if (filters.subSubfocos && filters.subSubfocos.length > 0) {
      filters.subSubfocos.forEach((ss) => list.push({ id: ss, name: formatSubSubfocoDisplay(ss), category: '4º Nível' }));
    }

    return list;
  }, [filters.especialidades, filters.temas, filters.focos, filters.subfocos, filters.subSubfocos]);

  // Retorna cotas balanceadas automáticas ou personalizadas
  const getEffectiveQuotas = (): Record<string, number> => {
    if (itemsToConfigure.length === 0) return {};
    if (itemsToConfigure.length === 1) {
      return { [itemsToConfigure[0].name]: resolveCount };
    }
    const hasManual = itemsToConfigure.some((it) => typeof quotasByItem[it.name] === 'number' && quotasByItem[it.name] > 0);
    if (hasManual) {
      return quotasByItem;
    }
    const baseCount = Math.floor(resolveCount / itemsToConfigure.length);
    const remainder = resolveCount % itemsToConfigure.length;
    const balanced: Record<string, number> = {};
    itemsToConfigure.forEach((item, idx) => {
      balanced[item.name] = baseCount + (idx < remainder ? 1 : 0);
    });
    return balanced;
  };

  const handleEquilibrarCotas = () => {
    if (itemsToConfigure.length === 0) return;
    const baseCount = Math.floor(resolveCount / itemsToConfigure.length);
    const remainder = resolveCount % itemsToConfigure.length;
    const balanced: Record<string, number> = {};
    itemsToConfigure.forEach((item, idx) => {
      balanced[item.name] = baseCount + (idx < remainder ? 1 : 0);
    });
    setQuotasByItem(balanced);
  };

  const handleQuotaChange = (itemName: string, val: number) => {
    const clamped = Math.max(0, Math.min(resolveCount, val));
    setQuotasByItem((prev) => ({
      ...prev,
      [itemName]: clamped
    }));
  };

  // Busca na árvore clínica
  const [hierarchySearch, setHierarchySearch] = useState<string>('');
  const deferredHierarchySearch = useDeferredValue(hierarchySearch);

  // Estados de expansão na árvore hierárquica (inicia recolhida)
  const [expandedEspec, setExpandedEspec] = useState<Record<string, boolean>>({});
  const [expandedTema, setExpandedTema] = useState<Record<string, boolean>>({});
  const [expandedFoco, setExpandedFoco] = useState<Record<string, boolean>>({});
  const [expandedSubfoco, setExpandedSubfoco] = useState<Record<string, boolean>>({});

  // Busca e categoria de instituições
  const [instSearch, setInstSearch] = useState<string>('');
  const deferredInstSearch = useDeferredValue(instSearch);
  const [showAllUfModal, setShowAllUfModal] = useState<boolean>(false);
  const [selectedUfTab, setSelectedUfTab] = useState<string>('Todas');

  // Modalidades ativas e helpers de multi-seleção
  const isModalidadeActive = (mod: 'Acesso Direto' | 'Revalida' | 'R+' | 'Título de Especialista') => {
    if (mod === 'Acesso Direto') {
      return filters.modalidades.some(m => m === 'Acesso Direto' || m === 'Residência Médica');
    }
    if (mod === 'Revalida') {
      return filters.modalidades.some(m => m === 'Revalida');
    }
    if (mod === 'R+') {
      return filters.modalidades.some(m => m === 'R+' || (typeof m === 'string' && m.startsWith('R+')));
    }
    if (mod === 'Título de Especialista') {
      return filters.modalidades.some(m => m === 'Título de Especialista' || (typeof m === 'string' && m.startsWith('Título')));
    }
    return false;
  };

  const isOnlyRevalida = useMemo(() => {
    return isModalidadeActive('Revalida') && !isModalidadeActive('Acesso Direto') && !isModalidadeActive('R+') && !isModalidadeActive('Título de Especialista');
  }, [filters.modalidades]);
  const yearsList = catalog?.years?.length
    ? catalog.years
    : isOnlyRevalida ? FALLBACK_EXAM_YEARS.filter((year) => year <= 2026) : FALLBACK_EXAM_YEARS;
  const activeQuickYearCount = QUICK_YEAR_COUNTS.find((count) =>
    filters.anos.length === count && yearsList.slice(0, count).every((year) => filters.anos.includes(year))
  );

  const toggleModalidade = (mod: 'Acesso Direto' | 'Revalida' | 'R+' | 'Título de Especialista') => {
    const isActive = isModalidadeActive(mod);
    const currentSet = new Set<'Acesso Direto' | 'Revalida' | 'R+' | 'Título de Especialista'>();
    if (isModalidadeActive('Acesso Direto')) currentSet.add('Acesso Direto');
    if (isModalidadeActive('Revalida')) currentSet.add('Revalida');
    if (isModalidadeActive('R+')) currentSet.add('R+');
    if (isModalidadeActive('Título de Especialista')) currentSet.add('Título de Especialista');

    if (isActive) {
      if (currentSet.size <= 1) {
        return; // Mantém no mínimo 1 ativo
      }
      currentSet.delete(mod);
    } else {
      currentSet.add(mod);
    }

    const nextModalidades = Array.from(currentSet);
    onChange({
      ...filters,
      modalidades: nextModalidades
    });
  };

  // Conjunto dinâmico de bancas em destaque (1 clique) conforme a modalidade selecionada
  const activeQuickBancas = useMemo(() => {
    const isDireto = isModalidadeActive('Acesso Direto');
    const isRev = isModalidadeActive('Revalida');
    const isRPlus = isModalidadeActive('R+');
    const isTitulo = isModalidadeActive('Título de Especialista');

    if (isRev && !isDireto && !isRPlus && !isTitulo) {
      return REVALIDA_BANCAS_1CLIQUE;
    }
    if ((isRPlus || isTitulo) && !isDireto && !isRev) {
      return RPLUS_BANCAS_1CLIQUE;
    }
    return POPULAR_BANCAS_1CLIQUE;
  }, [filters.modalidades]);


  // --- LÓGICA DE MULTI-SELEÇÃO DE ESPECIALIDADES (SOMA / UNIÃO) ---
  const applyClinicalPaths = (paths: string[][], removed?: { depth: number; label: string }) => {
    const currentPaths = filters.clinicalPaths ?? [];
    const next = { ...filters, clinicalPaths: paths };

    for (const [depth, key] of clinicalFields.entries()) {
      const retainedLegacy = (filters[key] ?? []).filter((value) =>
        !currentPaths.some((entry) => entry.length === depth + 1 && entry[depth] === value)
        && !(removed?.depth === depth && value === removed.label));
      next[key] = [...new Set([...retainedLegacy, ...paths
        .filter((entry) => entry.length === depth + 1).map((entry) => entry[depth])])];
    }
    onChange(next);
  };

  const toggleClinicalPath = (path: string[]) => {
    const currentPaths = filters.clinicalPaths ?? [];
    if (hasSelectedClinicalPath(filters, path)) {
      applyClinicalPaths(currentPaths.filter((entry) => !isClinicalPathPrefix(path, entry)), {
        depth: path.length - 1, label: path[path.length - 1]
      });
    } else {
      applyClinicalPaths([...currentPaths, path]);
    }
  };

  const removeClinicalLabel = (depth: number, label: string) => {
    applyClinicalPaths((filters.clinicalPaths ?? []).filter((path) => path[depth] !== label), { depth, label });
  };

  // Expandir / Recolher tudo
  const handleExpandAll = () => {
    const espMap: Record<string, boolean> = {};
    const temaMap: Record<string, boolean> = {};
    const focoMap: Record<string, boolean> = {};
    const subMap: Record<string, boolean> = {};
    clinicalHierarchy.forEach((esp) => {
      espMap[esp.especialidade] = true;
      esp.temas.forEach((tem) => {
        temaMap[tem.tema] = true;
        tem.focos.forEach((foc) => {
          focoMap[foc.foco] = true;
          foc.subfocos.forEach((subItem) => {
            subMap[getSubfocoName(subItem)] = true;
          });
        });
      });
    });
    setExpandedEspec(espMap);
    setExpandedTema(temaMap);
    setExpandedFoco(focoMap);
    setExpandedSubfoco(subMap);
  };

  const handleCollapseAll = () => {
    setExpandedEspec({});
    setExpandedTema({});
    setExpandedFoco({});
    setExpandedSubfoco({});
  };

  const handleSelectAllSpecialties = () => {
    const all = clinicalHierarchy.map((h) => h.especialidade);
    onChange({
      ...filters,
      especialidades: all,
      clinicalPaths: all.map((specialty) => [specialty]),
      temas: [],
      focos: [],
      subfocos: [],
      subSubfocos: []
    });
  };

  // --- FILTROS DE INSTITUIÇÃO ---
  const toggleInstituicao = (rawBancaKey: string) => {
    const canonical = getCanonicalBancaKey(rawBancaKey);
    const exists = filters.instituicoes.some(
      (inst) => getCanonicalBancaKey(inst).toLowerCase() === canonical.toLowerCase()
    );
    const next = exists
      ? filters.instituicoes.filter((i) => getCanonicalBancaKey(i).toLowerCase() !== canonical.toLowerCase())
      : [...filters.instituicoes.filter((i) => getCanonicalBancaKey(i).toLowerCase() !== canonical.toLowerCase()), canonical];

    onChange({
      ...filters,
      instituicoes: next
    });
  };

  const availableInstitutions = useMemo(() => {
    if (!catalog) return ufInstitutionsCatalog;
    const representedAliases = new Set<string>();
    const institutions = new Map<string, UfInstitutionItem>();
    for (const item of ufInstitutionsCatalog) {
      const key = getCanonicalBancaKey(item.key);
      const aliases = resolveBancaList([key]);
      if (!aliases.some((alias) => catalog.bancas[alias] > 0)) continue;
      aliases.forEach((alias) => representedAliases.add(alias));
      if (!institutions.has(key)) institutions.set(key, { ...item, key });
    }
    for (const sigla of Object.keys(catalog.bancas)) {
      if (!representedAliases.has(sigla)) {
        institutions.set(sigla, { sigla, key: sigla, nome: sigla, uf: '', count: '' });
      }
    }
    return [...institutions.values()];
  }, [catalog, ufInstitutionsCatalog]);

  const filteredBancasSearch = useMemo(() => {
    const search = deferredInstSearch.toLowerCase().trim();
    return search ? availableInstitutions
      .filter((inst) => inst.sigla.toLowerCase().includes(search) || inst.nome.toLowerCase().includes(search)
        || resolveBancaList([inst.key]).some((alias) => alias.toLowerCase().includes(search)))
      .slice(0, 10) : [];
  }, [deferredInstSearch, availableInstitutions]);

  const catalogFilteredByUf = useMemo(() => selectedUfTab === 'Todas'
    ? availableInstitutions
    : availableInstitutions.filter((inst) => inst.uf === selectedUfTab),
  [selectedUfTab, availableInstitutions]);

  // --- ANOS ---
  const toggleYear = (y: number) => {
    const exists = filters.anos.includes(y);
    const next = exists ? filters.anos.filter((yr) => yr !== y) : [...filters.anos, y];
    onChange({
      ...filters,
      anos: next,
      ultimos5Anos: false
    });
  };

  const handleSelectUltimosAnos = (count: number) => {
    onChange({
      ...filters,
      anos: yearsList.slice(0, count),
      ultimos5Anos: false
    });
  };

  const handleClearYears = () => {
    onChange({
      ...filters,
      anos: [],
      ultimos5Anos: false
    });
  };

  const displayedQuestionCount = totalFiltered;

  // --- TRANSIÇÃO FLUIDA E ELEGANTE DO CONTADOR (INTERPOLAÇÃO DINÂMICA) ---
  const [animatedCount, setAnimatedCount] = useState<number | null>(displayedQuestionCount);
  const currentCountRef = useRef<number | null>(displayedQuestionCount);
  const [isCounting, setIsCounting] = useState<boolean>(false);

  useEffect(() => {
    const startVal = currentCountRef.current;
    const targetVal = displayedQuestionCount;

    if (targetVal === null) {
      setAnimatedCount(null);
      currentCountRef.current = null;
      setIsCounting(false);
      return;
    }

    if (startVal === null || startVal === targetVal) {
      setAnimatedCount(targetVal);
      currentCountRef.current = targetVal;
      setIsCounting(false);
      return;
    }

    setIsCounting(true);
    let animId: number;
    let startTime: number | null = null;
    const duration = 320; // 320ms de transição suave e dinâmica

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      const nextVal = Math.round(startVal + (targetVal - startVal) * eased);
      setAnimatedCount(nextVal);
      currentCountRef.current = nextVal;

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setAnimatedCount(targetVal);
        currentCountRef.current = targetVal;
        setIsCounting(false);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [displayedQuestionCount]);

  const isFilterActive = isCountLoading || isCounting || displayedQuestionCount === null;

  // Filtros ativos para renderizar tags
  const activeTags = useMemo(() => {
    const tags: { id: string; label: string; onRemove: () => void }[] = [];

    // Modalidade Revalida (tag de escopo)
    if (filters.modalidades && filters.modalidades.length === 1 && filters.modalidades[0] === 'Revalida') {
      tags.push({
        id: 'mod-revalida',
        label: 'Revalida',
        onRemove: () => onChange({ ...filters, modalidades: ['Acesso Direto'], instituicoes: [] })
      });
    }

    // Anos
    if (filters.anos.length > 0) {
      const sorted = [...filters.anos].sort((a, b) => a - b);
      const isRange = sorted.length > 1 && sorted[sorted.length - 1] - sorted[0] === sorted.length - 1;
      if (isRange) {
        tags.push({
          id: 'anos-range',
          label: `Anos: ${sorted[0]}–${sorted[sorted.length - 1]}`,
          onRemove: handleClearYears
        });
      } else if (filters.anos.length <= 3) {
        tags.push({
          id: 'anos-custom',
          label: `Anos: ${sorted.join(', ')}`,
          onRemove: handleClearYears
        });
      } else {
        tags.push({
          id: 'anos-custom',
          label: `Anos: ${sorted[0]}–${sorted[sorted.length - 1]} (${sorted.length})`,
          onRemove: handleClearYears
        });
      }
    }

    // Especialidades (Soma de várias)
    filters.especialidades.forEach((esp) => {
      const espNode = clinicalHierarchy.find((h) => h.especialidade === esp);
      let childCount = 0;
      if (espNode) {
        const espTemas = espNode.temas.map((t) => t.tema);
        childCount = filters.temas.filter((t) => espTemas.includes(t)).length;
      }
      const label = childCount > 0 ? `${esp} (${childCount})` : esp;
      tags.push({
        id: `esp-${esp}`,
        label,
        onRemove: () => removeClinicalLabel(0, esp)
      });
    });

    // Temas (apenas se a especialidade pai não estiver na tag para evitar redundância, ou todos)
    filters.temas.forEach((tem) => {
      tags.push({
        id: `tem-${tem}`,
        label: tem,
        onRemove: () => removeClinicalLabel(1, tem)
      });
    });

    // Focos
    filters.focos.forEach((foc) => {
      tags.push({
        id: `foc-${foc}`,
        label: `Foco: ${foc}`,
        onRemove: () => removeClinicalLabel(2, foc)
      });
    });

    // Subfocos
    filters.subfocos.forEach((sub) => {
      tags.push({
        id: `sub-${sub}`,
        label: `Subfoco: ${sub}`,
        onRemove: () => removeClinicalLabel(3, sub)
      });
    });

    // Subsubfocos (5º Nível)
    if (filters.subSubfocos) {
      filters.subSubfocos.forEach((ss) => {
        tags.push({
          id: `ss-${ss}`,
          label: `Subsubfoco: ${formatSubSubfocoDisplay(ss)}`,
          onRemove: () => removeClinicalLabel(4, ss)
        });
      });
    }

    if (filters.programaRplus) {
      filters.programaRplus.forEach((pr) => {
        tags.push({
          id: `pr-${pr}`,
          label: pr,
          onRemove: () =>
            onChange({
              ...filters,
              programaRplus: (filters.programaRplus || []).filter((x) => x !== pr)
            })
        });
      });
    }

    if (filters.bancaOrganizadora) {
      filters.bancaOrganizadora.forEach((bo) => {
        tags.push({
          id: `bo-${bo}`,
          label: `Banca: ${bo}`,
          onRemove: () =>
            onChange({
              ...filters,
              bancaOrganizadora: (filters.bancaOrganizadora || []).filter((x) => x !== bo)
            })
        });
      });
    }

    if (filters.macrorregioes) {
      filters.macrorregioes.forEach((mr) => {
        tags.push({
          id: `mr-${mr}`,
          label: `Região: ${mr}`,
          onRemove: () =>
            onChange({
              ...filters,
              macrorregioes: (filters.macrorregioes || []).filter((x) => x !== mr)
            })
        });
      });
    }

    // Instituições
    filters.instituicoes.forEach((inst) => {
      tags.push({
        id: `inst-${inst}`,
        label: inst,
        onRemove: () => toggleInstituicao(inst)
      });
    });

    // Dificuldade
    if (filters.dificuldade !== 'Todas') {
      tags.push({
        id: 'dif',
        label: `Dificuldade: ${filters.dificuldade}`,
        onRemove: () => onChange({ ...filters, dificuldade: 'Todas' })
      });
    }

    // Formato
    if (filters.tipoQuestao !== 'Todas') {
      const formatLabel = filters.tipoQuestao === 'Múltipla escolha'
        ? 'Múltipla'
        : (filters.tipoQuestao === 'Dissertativa' || filters.tipoQuestao === 'Discursiva')
          ? 'Discursiva'
          : (filters.tipoQuestao === 'Certo ou errado' || filters.tipoQuestao === 'Verdadeiro ou falso' || filters.tipoQuestao === 'Certo e Errado')
            ? 'Certo/Errado'
            : filters.tipoQuestao;
      tags.push({
        id: 'tipoQ',
        label: `Formato: ${formatLabel}`,
        onRemove: () => onChange({ ...filters, tipoQuestao: 'Todas' })
      });
    }

    // Status
    if (filters.status !== 'Todas') {
      tags.push({
        id: 'status',
        label: `Status: ${filters.status}`,
        onRemove: () => onChange({ ...filters, status: 'Todas' })
      });
    }

    // Ocultar anuladas
    if (filters.ocultarAnuladasErro) {
      tags.push({
        id: 'anuladas',
        label: 'Sem anuladas',
        onRemove: () => onChange({ ...filters, ocultarAnuladasErro: false })
      });
    }

    // Ocultar revisadas
    if (filters.ocultarRevisadas) {
      tags.push({
        id: 'revisadas',
        label: 'Sem revisadas',
        onRemove: () => onChange({ ...filters, ocultarRevisadas: false })
      });
    }

    // Últimos 5 anos
    if (filters.ultimos5Anos) {
      tags.push({
        id: 'ultimos5',
        label: 'Últimos 5 anos',
        onRemove: () => onChange({ ...filters, ultimos5Anos: false })
      });
    }

    // Busca textual
    if (filters.search?.trim()) {
      tags.push({
        id: 'search',
        label: `Busca: "${filters.search.trim()}"`,
        onRemove: () => onChange({ ...filters, search: '' })
      });
    }

    return tags;
  }, [filters]);

  return (
    <div className="text-slate-900 dark:text-slate-100 flex flex-col flex-1 min-h-0 space-y-3.5 sm:space-y-4 font-sans select-none">
      {/* =========================================================================
          1. HEADER SUPERIOR / CARD PRINCIPAL (ESTILO IMAGEM 1)
         ========================================================================= */}
      <div className="w-full bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-sm shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 transition-colors">
        {/* Lado Esquerdo: Modalidades no topo e Botões de Ação Rápida logo abaixo */}
        <div className="flex flex-col gap-2 items-start w-full md:w-auto">
          {/* Grupo de Modalidades */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => toggleModalidade('Acesso Direto')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-all cursor-pointer ${isModalidadeActive('Acesso Direto')
                ? 'text-white font-bold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                }`}
              style={{
                backgroundColor: isModalidadeActive('Acesso Direto') ? accentConfig.primaryHex : undefined
              }}
            >
              Acesso Direto
            </button>

            <button
              type="button"
              onClick={() => toggleModalidade('Revalida')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-all cursor-pointer ${isModalidadeActive('Revalida')
                ? 'text-white font-bold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                }`}
              style={{
                backgroundColor: isModalidadeActive('Revalida') ? accentConfig.primaryHex : undefined
              }}
            >
              Revalida
            </button>

            <button
              type="button"
              onClick={() => toggleModalidade('R+')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-all cursor-pointer ${isModalidadeActive('R+')
                ? 'text-white font-bold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                }`}
              style={{
                backgroundColor: isModalidadeActive('R+') ? accentConfig.primaryHex : undefined
              }}
            >
              R+
            </button>

            <button
              type="button"
              onClick={() => toggleModalidade('Título de Especialista')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-all cursor-pointer ${isModalidadeActive('Título de Especialista')
                ? 'text-white font-bold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                }`}
              style={{
                backgroundColor: isModalidadeActive('Título de Especialista') ? accentConfig.primaryHex : undefined
              }}
            >
              Título de Especialista
            </button>
          </div>

          {/* Botões de Ação Secundária: Filtro IA, Raio-X da Banca, Minhas Listas */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSmartFilterModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs hover:border-[var(--primary-color)]/40"
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
              <span>Filtro IA</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRaioXModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs hover:border-[var(--primary-color)]/40"
            >
              <Target className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
              <span>Raio-X da Banca</span>
            </button>

            <button
              type="button"
              onClick={onCreateListFromFilter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs hover:border-[var(--primary-color)]/40"
            >
              <BookOpen className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
              <span>Minhas Listas</span>
            </button>
          </div>
        </div>

        {/* Lado Direito: Quantidade Encontrada (Transição Dinâmica, Fluida e Sem 'questões') */}
        <div
          className="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto pt-1 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800/80"
          title="Total de questões disponíveis com os filtros selecionados"
        >
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 md:hidden">
            Total:
          </span>

          <div
            className="relative inline-flex items-center py-0.5 px-1 rounded-xl"
            title={loadError ? "Não foi possível carregar a contagem de questões." : isFilterActive ? "Calculando intersecção dinâmica..." : "Filtro sincronizado"}
          >
            {/* Número Dinâmico com Interpolação Suave */}
            <div className="relative flex flex-col items-end">
              <span
                className={`text-2xl sm:text-3xl font-black tracking-tight font-sans tabular-nums transition-all duration-300 ease-out select-none ${isFilterActive
                  ? 'text-zinc-700 dark:text-zinc-200 opacity-80'
                  : 'text-zinc-900 dark:text-white opacity-100'
                  }`}
              >
                {loadError ? '—' : animatedCount === null ? '…' : animatedCount.toLocaleString('pt-BR')}
              </span>

              {/* Shimmer ultra-fino dinâmico na base (zero layout shift) */}
              <div className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full overflow-hidden pointer-events-none">
                <div
                  className={`h-full w-full transition-opacity duration-300 ${isFilterActive ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  <div
                    className="h-full w-3/5 rounded-full animate-beam-slide"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, ${accentConfig.primaryHex} 50%, transparent 100%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SELETOR DE ABAS MOBILE (VISÍVEL APENAS EM TELAS < LG)
         ========================================================================= */}
      <div className="flex lg:hidden items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shrink-0 gap-1">
        <button
          type="button"
          onClick={() => setMobileTab('conteudo')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${mobileTab === 'conteudo'
            ? 'text-white shadow-sm'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          style={{
            backgroundColor: mobileTab === 'conteudo' ? accentConfig.primaryHex : undefined
          }}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span>Conteúdo Clínico</span>
          {activeConteudoCount > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${mobileTab === 'conteudo' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
              }`}>
              {activeConteudoCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('bancas')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${mobileTab === 'bancas'
            ? 'text-white shadow-sm'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          style={{
            backgroundColor: mobileTab === 'bancas' ? accentConfig.primaryHex : undefined
          }}
        >
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span>Bancas & Critérios</span>
          {activeBancasCount > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${mobileTab === 'bancas' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
              }`}>
              {activeBancasCount}
            </span>
          )}
        </button>
      </div>

      {/* =========================================================================
          2. CORPO PRINCIPAL (MOBILE: 1 COLUNA POR ABA | DESKTOP: 2 COLUNAS LADO A LADO)
         ========================================================================= */}
      <div
        className="w-full flex-1 min-h-0 items-stretch flex flex-col lg:grid lg:grid-cols-[57fr_43fr] gap-3.5 sm:gap-4 mb-6 lg:mb-0"
      >
        {/* -----------------------------------------------------------------------
            COLUNA DA ESQUERDA (57%): ESPECIALIDADES, TEMAS E SUBFOCOS
           ----------------------------------------------------------------------- */}
        <div
          className={`rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex-col shadow-sm bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] overflow-hidden h-[58dvh] min-h-[360px] lg:h-full lg:min-h-0 ${mobileTab === 'conteudo' ? 'flex' : 'hidden lg:flex'
            }`}
        >
          {/* Topo do Card de Conteúdo */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-100 dark:border-zinc-800/80 mb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" style={{ color: accentConfig.primaryHex }} />
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                Conteúdo
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleSelectAllSpecialties}
                className="px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer touch-manipulation"
              >
                <span className="sm:hidden">Todas</span>
                <span className="hidden sm:inline">Selecionar todas</span>
              </button>
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
              >
                Expandir
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
              >
                Recolher
              </button>
            </div>
          </div>

          {/* Campo de Busca Rápida na Árvore Clínica */}
          <div className="relative mb-2 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={hierarchySearch}
              onChange={(e) => setHierarchySearch(e.target.value)}
              placeholder="Filtrar conteúdo (ex: diabetes, sífilis, fórcipe, apendicite, ECG, ATLS...)"
              className="w-full rounded-xl pl-8.5 pr-8 py-2 sm:py-1.5 text-base sm:text-xs min-h-[44px] sm:min-h-0 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-zinc-50 dark:bg-[var(--bg-input)] border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition-all font-sans"
            />
            {hierarchySearch && (
              <button
                type="button"
                onClick={() => setHierarchySearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {facetsError && (
            <button type="button" className="self-start text-xs underline" onClick={() => setFacetsRetry((n) => n + 1)}>
              Recarregar contagens
            </button>
          )}
          {/* Árvore Clínica com Scroll Dedicado */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 space-y-1 custom-scrollbar text-xs">
            {clinicalHierarchy.map((esp) => {
              const espPath = [esp.especialidade];
              const isEspSelected = hasSelectedClinicalPath(filters, espPath);
              const isEspExpanded = Boolean(expandedEspec[esp.especialidade]);
              const espCount = countForPath(espPath);

              // Filtragem textual se houver busca
              const qTerm = deferredHierarchySearch.toLowerCase().trim();
              if (
                qTerm &&
                !esp.especialidade.toLowerCase().includes(qTerm) &&
                !esp.temas.some(
                  (t) =>
                    t.tema.toLowerCase().includes(qTerm) ||
                    t.focos.some(
                      (f) =>
                        f.foco.toLowerCase().includes(qTerm) ||
                        f.subfocos.some((s) => getSubfocoName(s).toLowerCase().includes(qTerm) || getSubSubfocos(s).some((ss) => ss.toLowerCase().includes(qTerm)))
                    )
                )
              ) {
                return null;
              }

              // Reordenação de temas para Clínica Médica conforme o modelo
              const orderedTemas = [...esp.temas];
              if (esp.especialidade === 'Clínica Médica' && !qTerm) {
                const getPriority = (name: string) => {
                  if (name === 'Cardiologia') return 1;
                  if (name.startsWith('Endocrino')) return 2;
                  if (name === 'Infectologia') return 3;
                  if (name === 'Nefrologia') return 4;
                  return 999;
                };
                orderedTemas.sort((a, b) => {
                  const pA = getPriority(a.tema);
                  const pB = getPriority(b.tema);
                  if (pA !== pB) return pA - pB;
                  return a.tema.localeCompare(b.tema);
                });
              }

              return (
                <div key={esp.especialidade} className="space-y-0.5">
                  {/* Linha 1: Nível Especialidade (Estilo Imagens 3 & 4) */}
                  <div
                    className={`flex items-center justify-between py-2.5 px-2 border-b border-zinc-100/40 dark:border-zinc-800/50 transition-colors cursor-pointer rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/40 ${isEspSelected
                      ? 'text-zinc-900 dark:text-zinc-50 bg-zinc-100/60 dark:bg-zinc-900/40'
                      : 'text-zinc-800 dark:text-zinc-200'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleClinicalPath(espPath);
                        }}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${isEspSelected
                          ? 'text-white shadow-xs'
                          : 'border-zinc-300 dark:border-zinc-700 bg-transparent hover:border-zinc-400 dark:hover:border-zinc-500'
                          }`}
                        style={{
                          backgroundColor: isEspSelected ? accentConfig.primaryHex : undefined,
                          borderColor: isEspSelected ? accentConfig.primaryHex : undefined
                        }}
                      >
                        {isEspSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      {/* Botão de Expandir/Recolher */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedEspec((prev) => ({
                            ...prev,
                            [esp.especialidade]: !prev[esp.especialidade]
                          }))
                        }
                        className="p-1 rounded text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
                      >
                        {isEspExpanded ? (
                          <ChevronDown className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                        )}
                      </button>

                      <span
                        onClick={() => toggleClinicalPath(espPath)}
                        className="font-bold text-sm sm:text-base tracking-tight truncate select-none text-zinc-900 dark:text-zinc-100"
                      >
                        {esp.especialidade}
                      </span>
                    </div>

                    {/* Badge de Questões - Fundo igual ao quadro geral, número por extenso */}
                    <span className="px-2.5 py-0.5 rounded-lg bg-transparent border border-zinc-200/60 dark:border-zinc-800/70 text-zinc-500 dark:text-zinc-400 font-mono text-xs shrink-0">
                      {formatCount(espCount)}
                    </span>
                  </div>

                  {/* Linha 2: Temas (Filhos Indentados) */}
                  {isEspExpanded && (
                    <div className="pl-5 space-y-1 border-l border-zinc-200/40 dark:border-zinc-800/50 ml-3.5">
                      {orderedTemas.map((tem) => {
                        const temaPath = [...espPath, tem.tema];
                        const isTemaSelected = hasSelectedClinicalPath(filters, temaPath);
                        const isTemaExpanded = Boolean(expandedTema[tem.tema]) || Boolean(qTerm);
                        const temaCount = countForPath(temaPath);

                        if (
                          qTerm &&
                          !tem.tema.toLowerCase().includes(qTerm) &&
                          !tem.focos.some(
                            (f) =>
                              f.foco.toLowerCase().includes(qTerm) ||
                              f.subfocos.some((s) => getSubfocoName(s).toLowerCase().includes(qTerm) || getSubSubfocos(s).some((ss) => ss.toLowerCase().includes(qTerm)))
                          )
                        ) {
                          return null;
                        }

                        return (
                          <div key={tem.tema} className="space-y-1">
                            {/* Linha do Tema */}
                            <div
                              className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${isTemaSelected
                                ? 'text-zinc-900 dark:text-white font-medium'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300'
                                }`}
                              style={{
                                backgroundColor: isTemaSelected ? accentConfig.bgRgba : undefined
                              }}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleClinicalPath(temaPath);
                                  }}
                                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${isTemaSelected
                                    ? 'text-white'
                                    : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500'
                                    }`}
                                  style={{
                                    backgroundColor: isTemaSelected ? accentConfig.primaryHex : undefined,
                                    borderColor: isTemaSelected ? accentConfig.primaryHex : undefined
                                  }}
                                >
                                  {isTemaSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </button>

                                {tem.focos.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedTema((prev) => ({
                                        ...prev,
                                        [tem.tema]: !prev[tem.tema]
                                      }))
                                    }
                                    className="p-0.5 rounded text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
                                  >
                                    {isTemaExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}

                                <span
                                  onClick={() => toggleClinicalPath(temaPath)}
                                  className="font-medium text-xs truncate text-zinc-800 dark:text-zinc-200"
                                >
                                  {tem.tema === 'Endocrinologia' || tem.tema.startsWith('Endocrino') ? 'Endocrinologia e Metabologia' : tem.tema}
                                </span>
                              </div>

                              <span className="px-2 py-0.5 rounded-md bg-transparent border border-zinc-200/50 dark:border-zinc-800/60 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
                                {formatCount(temaCount)}
                              </span>
                            </div>

                            {/* Linha 3: Focos (Filhos de Tema) */}
                            {isTemaExpanded && tem.focos.length > 0 && (
                              <div className="pl-4 space-y-0.5 border-l border-zinc-200/40 dark:border-zinc-800/50 ml-2.5">
                                {tem.focos.map((foc) => {
                                  const focoPath = [...temaPath, foc.foco];
                                  const isFocoSelected = hasSelectedClinicalPath(filters, focoPath);
                                  const isFocoExpanded = Boolean(expandedFoco[foc.foco]) || Boolean(qTerm);
                                  const focoCount = countForPath(focoPath);

                                  if (
                                    qTerm &&
                                    !foc.foco.toLowerCase().includes(qTerm) &&
                                    !foc.subfocos.some((s) => getSubfocoName(s).toLowerCase().includes(qTerm) || getSubSubfocos(s).some((ss) => ss.toLowerCase().includes(qTerm)))
                                  ) {
                                    return null;
                                  }

                                  return (
                                    <div key={foc.foco} className="space-y-0.5">
                                      {/* Linha do Foco */}
                                      <div
                                        className={`flex items-center justify-between p-1 rounded-md text-xs cursor-pointer transition-colors ${isFocoSelected
                                          ? 'text-zinc-900 dark:text-white font-medium'
                                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300'
                                          }`}
                                        style={{
                                          backgroundColor: isFocoSelected ? accentConfig.bgRgba : undefined
                                        }}
                                      >
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleClinicalPath(focoPath);
                                            }}
                                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${isFocoSelected
                                              ? 'text-white'
                                              : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500'
                                              }`}
                                            style={{
                                              backgroundColor: isFocoSelected ? accentConfig.primaryHex : undefined,
                                              borderColor: isFocoSelected ? accentConfig.primaryHex : undefined
                                            }}
                                          >
                                            {isFocoSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                          </button>

                                          {foc.subfocos.length > 0 && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setExpandedFoco((prev) => ({
                                                  ...prev,
                                                  [foc.foco]: !prev[foc.foco]
                                                }))
                                              }
                                              className="p-0.5 rounded text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
                                            >
                                              {isFocoExpanded ? (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronRight className="w-3.5 h-3.5" />
                                              )}
                                            </button>
                                          )}

                                          <span
                                            onClick={() => toggleClinicalPath(focoPath)}
                                            className="font-medium text-xs truncate text-zinc-800 dark:text-zinc-200"
                                          >
                                            {foc.foco}
                                          </span>
                                        </div>

                                        <span className="px-1.5 py-0.5 rounded-md bg-transparent border border-zinc-200/50 dark:border-zinc-800/60 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 ml-2 shrink-0">
                                          {formatCount(focoCount)}
                                        </span>
                                      </div>

                                      {/* Linha 4: Subfocos (Filhos de Foco) e 4º Nível (Sub-subfocos) */}
                                      {isFocoExpanded && foc.subfocos.length > 0 && (
                                        <div className="pl-4 space-y-0.5 border-l border-zinc-200/40 dark:border-zinc-800/50 ml-2">
                                          {foc.subfocos.map((subItem) => {
                                            const sub = getSubfocoName(subItem);
                                            const subSubList = getSubSubfocos(subItem);
                                            const subPath = [...focoPath, sub];
                                            const isSubSelected = hasSelectedClinicalPath(filters, subPath);
                                            const hasMatchingChild = qTerm ? subSubList.some((ss) => ss.toLowerCase().includes(qTerm)) : false;
                                            const isSubfocoExpanded = Boolean(expandedSubfoco[sub] || hasMatchingChild);
                                            const subCount = countForPath(subPath);

                                            if (
                                              qTerm &&
                                              !sub.toLowerCase().includes(qTerm) &&
                                              !foc.foco.toLowerCase().includes(qTerm) &&
                                              !hasMatchingChild
                                            ) {
                                              return null;
                                            }

                                            return (
                                              <div key={sub} className="space-y-0.5">
                                                <div
                                                  className={`flex items-center justify-between py-1 px-2 rounded-lg text-xs transition-colors ${isSubSelected
                                                    ? 'font-semibold text-zinc-900 dark:text-white'
                                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                                                    }`}
                                                >
                                                  <div className="flex items-center gap-1.5 truncate min-w-0 flex-1">
                                                    <button
                                                      type="button"
                                                      onClick={() => toggleClinicalPath(subPath)}
                                                      className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer ${isSubSelected
                                                        ? 'text-white'
                                                        : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                                                        }`}
                                                      style={{
                                                        backgroundColor: isSubSelected ? accentConfig.primaryHex : undefined,
                                                        borderColor: isSubSelected ? accentConfig.primaryHex : undefined
                                                      }}
                                                    >
                                                      {isSubSelected && (
                                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                      )}
                                                    </button>

                                                    {subSubList.length > 0 && (
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setExpandedSubfoco((prev) => ({
                                                            ...prev,
                                                            [sub]: !prev[sub]
                                                          }));
                                                        }}
                                                        className="p-0.5 rounded text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0 cursor-pointer"
                                                        title={isSubfocoExpanded ? 'Recolher 4º nível' : 'Expandir 4º nível'}
                                                      >
                                                        {isSubfocoExpanded ? (
                                                          <ChevronDown className="w-3.5 h-3.5" />
                                                        ) : (
                                                          <ChevronRight className="w-3.5 h-3.5" />
                                                        )}
                                                      </button>
                                                    )}

                                                    <span
                                                      onClick={() => toggleClinicalPath(subPath)}
                                                      className="truncate text-zinc-800 dark:text-zinc-300 cursor-pointer"
                                                      title={sub}
                                                    >
                                                      {sub}
                                                    </span>
                                                  </div>
                                                  <span className="px-1.5 py-0.5 rounded-md bg-transparent border border-zinc-200/50 dark:border-zinc-800/60 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 ml-2 shrink-0">
                                                    {formatCount(subCount)}
                                                  </span>
                                                </div>

                                                {/* Linha 5: 4º Nível (Sub-subfocos) */}
                                                {isSubfocoExpanded && subSubList.length > 0 && (
                                                  <div className="pl-5 space-y-0.5 border-l border-zinc-200/40 dark:border-zinc-800/50 ml-3 py-0.5">
                                                    {subSubList.map((ss) => {
                                                      const ssPath = [...subPath, ss];
                                                      const isSsSelected = hasSelectedClinicalPath(filters, ssPath);
                                                      const ssCount = countForPath(ssPath);

                                                      if (
                                                        qTerm &&
                                                        !ss.toLowerCase().includes(qTerm) &&
                                                        !sub.toLowerCase().includes(qTerm) &&
                                                        !foc.foco.toLowerCase().includes(qTerm)
                                                      ) {
                                                        return null;
                                                      }

                                                      return (
                                                        <div
                                                          key={ss}
                                                          onClick={() => toggleClinicalPath(ssPath)}
                                                          className={`flex items-center justify-between py-1 px-2 rounded-lg text-[11px] cursor-pointer transition-colors ${isSsSelected
                                                            ? 'font-medium text-zinc-900 dark:text-white bg-zinc-100/70 dark:bg-zinc-800/50'
                                                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                                                            }`}
                                                        >
                                                          <div className="flex items-center gap-1.5 min-w-0 flex-1" title={ss}>
                                                            <div
                                                              className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${isSsSelected
                                                                ? 'text-white'
                                                                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                                                                }`}
                                                              style={{
                                                                backgroundColor: isSsSelected ? accentConfig.primaryHex : undefined,
                                                                borderColor: isSsSelected ? accentConfig.primaryHex : undefined
                                                              }}
                                                            >
                                                              {isSsSelected && <Check className="w-2 h-2 stroke-[3]" />}
                                                            </div>
                                                            <span className="truncate leading-tight text-zinc-700 dark:text-zinc-300">{formatSubSubfocoDisplay(ss)}</span>
                                                          </div>
                                                          <span className="px-1.5 py-0.2 rounded bg-transparent border border-zinc-200/40 dark:border-zinc-800/50 text-[9px] font-mono text-zinc-400 dark:text-zinc-500 ml-2 shrink-0">
                                                            {formatCount(ssCount)}
                                                          </span>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            COLUNA DA DIREITA (43%): BANCO, STATUS, DIFICULDADE, ANOS (ESTILO IMAGEM 1 & 2)
           ----------------------------------------------------------------------- */}
        <div
          className={`rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex-col shadow-sm bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] overflow-hidden h-[58dvh] min-h-[360px] lg:h-full lg:min-h-0 ${mobileTab === 'bancas' ? 'flex' : 'hidden lg:flex'
            }`}
        >
          {/* Topo do Card da Direita */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80 mb-2 shrink-0">
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              <Building2 className="w-4 h-4" style={{ color: accentConfig.primaryHex }} />
              <span>Instituições e Bancas</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAllUfModal(true)}
              className="text-[11px] font-semibold cursor-pointer hover:underline transition-colors"
              style={{ color: accentConfig.primaryHex }}
            >
              Ver todas por UF &gt;
            </button>
          </div>

          {/* Campo de Busca e Acesso Rápido a Bancas (Fixo no Topo do Card) */}
          <div className="space-y-1.5 shrink-0 mb-1 pb-1.5 border-b border-zinc-100/70 dark:border-zinc-800/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                value={instSearch}
                onChange={(e) => setInstSearch(e.target.value)}
                placeholder={
                  isOnlyRevalida
                    ? 'Buscar banca do Revalida (ex: INEP, UFMT, UEPA, USP)...'
                    : (isModalidadeActive('R+') || isModalidadeActive('Título de Especialista')) && !isModalidadeActive('Acesso Direto')
                      ? 'Buscar sociedade ou título (ex: TEGO, TEP, TECM, SBC)...'
                      : 'Buscar banca por sigla, nome ou estado (ex: ENARE, USP, SURCE, SP...)'
                }
                className="w-full rounded-xl pl-9 pr-8 py-2 sm:py-1.5 text-base sm:text-xs min-h-[44px] sm:min-h-0 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-zinc-50 dark:bg-[var(--bg-input)] border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] font-sans"
              />
              {instSearch && (
                <button
                  type="button"
                  onClick={() => setInstSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sugestões de Busca se digitou */}
            {filteredBancasSearch.length > 0 && (
              <div
                className="p-2 rounded-xl space-y-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md max-h-40 overflow-y-auto"
              >
                {filteredBancasSearch.map((b) => (
                  <button
                    key={b.sigla}
                    type="button"
                    onClick={() => {
                      toggleInstituicao(getCanonicalBancaKey(b.sigla));
                      setInstSearch('');
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white flex items-center justify-between"
                  >
                    <span>{b.sigla} - {b.nome}</span>
                    <span className="text-[10px] font-semibold" style={{ color: accentConfig.primaryHex }}>+ Adicionar</span>
                  </button>
                ))}
              </div>
            )}

            {/* Chips das Mais Concorridas com Rolagem Horizontal Suave */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {activeQuickBancas.map((banca) => {
                const canonicalTarget = getCanonicalBancaKey(banca.key);
                const isSelected = filters.instituicoes.some(
                  (inst) => getCanonicalBancaKey(inst).toLowerCase() === canonicalTarget.toLowerCase()
                );
                return (
                  <button
                    key={banca.key}
                    type="button"
                    onClick={() => toggleInstituicao(banca.key)}
                    className={`px-2 py-0.5 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0 border ${isSelected
                      ? 'text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    style={{
                      backgroundColor: isSelected ? accentConfig.primaryHex : undefined,
                      borderColor: isSelected ? accentConfig.primaryHex : undefined,
                      color: isSelected ? '#ffffff' : undefined
                    }}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{banca.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ROLAGEM INTERNA DOS CRITÉRIOS DA DIREITA (Status, Dificuldade, Formato e Anos - IMAGEM 2) */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 custom-scrollbar space-y-2.5 pt-1">
            {/* Tags de Bancas Selecionadas com 'x' */}
            {filters.instituicoes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-0.5">
                {filters.instituicoes.map((inst) => (
                  <span
                    key={inst}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border shadow-xs"
                    style={{
                      backgroundColor: accentConfig.bgRgba,
                      borderColor: accentConfig.borderRgba,
                      color: accentConfig.primaryHex
                    }}
                  >
                    <span>{inst}</span>
                    <button
                      type="button"
                      onClick={() => toggleInstituicao(inst)}
                      className="hover:opacity-75 cursor-pointer text-[10px] ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 2. Status da Questão (Integrado ao Histórico do Aluno no Supabase) */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">Status da Questão</span>
              <div className="flex sm:grid sm:grid-cols-5 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
                {(['Todas', 'Não vistas', 'Erradas', 'Resolvidas', 'Acertadas'] as QuestionStatus[]).map(
                  (st) => {
                    const isActive = filters.status === st;

                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => onChange({ ...filters, status: st })}
                        className={`py-2 px-3 sm:py-1.5 sm:px-1 min-h-[40px] text-center rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap sm:truncate shrink-0 sm:shrink flex items-center justify-center font-medium ${isActive
                          ? 'text-white shadow-sm font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/50'
                          }`}
                        style={{
                          backgroundColor: isActive
                            ? (st === 'Erradas' ? '#dc2626' : accentConfig.primaryHex)
                            : undefined
                        }}
                        title={st}
                      >
                        <span className="truncate">{st}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 3. CARD COLAPSÁVEL: Dificuldade, Formato e Opções */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 overflow-hidden transition-all">
              {/* Header com Toggle Mostrar/Ocultar */}
              <div
                onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                className="flex items-center justify-between p-3 sm:p-3.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900/70 transition-colors select-none"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" style={{ color: accentConfig.primaryHex }} />
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Dificuldade, Formato e Opções
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Resumo ativo no Badge - Somente se houver seleção */}
                  {activeOptionsSummary.length > 0 && (
                    <span
                      className="px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide inline-flex items-center border"
                      style={{
                        backgroundColor: accentConfig.bgRgba,
                        borderColor: accentConfig.borderRgba,
                        color: accentConfig.primaryHex
                      }}
                    >
                      {activeOptionsSummary.join(' • ')}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOptionsOpen ? 'rotate-180' : ''
                      }`}
                  />
                </div>
              </div>

              {/* Conteúdo Expandido */}
              {isOptionsOpen && (
                <div className="p-3 sm:p-3.5 pt-0 space-y-3 border-t border-zinc-200/50 dark:border-zinc-800/60">
                  {/* Linha 1: Dificuldade & Formato */}
                  <div className="grid grid-cols-1 sm:grid-cols-[42fr_58fr] gap-2.5 pt-3">
                    {/* Dificuldade */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">Dificuldade</span>
                      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-[var(--bg-input)] border border-zinc-200/50 dark:border-zinc-800/80">
                        {(['Fácil', 'Médio', 'Difícil'] as QuestionDifficulty[]).map((dif) => {
                          const isActive = filters.dificuldade === dif;
                          return (
                            <button
                              key={dif}
                              type="button"
                              onClick={() =>
                                onChange({
                                  ...filters,
                                  dificuldade: isActive ? 'Todas' : dif
                                })
                              }
                              className={`py-1.5 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${isActive
                                ? 'text-white shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                              style={{
                                backgroundColor: isActive ? accentConfig.primaryHex : undefined
                              }}
                            >
                              {dif}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Formato */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">Formato</span>
                      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-[var(--bg-input)] border border-zinc-200/50 dark:border-zinc-800/80">
                        {[
                          { label: 'Múltipla', val: 'Múltipla escolha' },
                          { label: 'Discursiva', val: 'Discursiva' },
                          { label: 'Certo/Errado', val: 'Certo ou errado' }
                        ].map((fmt) => {
                          const isActive =
                            filters.tipoQuestao === fmt.val ||
                            (fmt.val === 'Discursiva' && filters.tipoQuestao === 'Dissertativa') ||
                            (fmt.val === 'Certo ou errado' && (filters.tipoQuestao === 'Verdadeiro ou falso' || filters.tipoQuestao === 'Certo e Errado'));
                          return (
                            <button
                              key={fmt.label}
                              type="button"
                              onClick={() =>
                                onChange({
                                  ...filters,
                                  tipoQuestao: isActive ? 'Todas' : (fmt.val as QuestionType)
                                })
                              }
                              className={`py-1.5 px-0.5 text-center rounded-lg text-[10px] sm:text-[11px] xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap tracking-tight ${isActive
                                ? 'text-white shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                              style={{
                                backgroundColor: isActive ? accentConfig.primaryHex : undefined
                              }}
                              title={fmt.label}
                            >
                              {fmt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Linha 2: Ocultar anuladas / Ocultar revisadas / Comentadas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 px-3 flex items-center justify-between shadow-xs">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Ocultar anuladas</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={filters.ocultarAnuladasErro}
                        onClick={() =>
                          onChange({
                            ...filters,
                            ocultarAnuladasErro: !filters.ocultarAnuladasErro
                          })
                        }
                        className={`w-10 h-5.5 rounded-full transition-colors relative inline-flex items-center cursor-pointer p-0.5 shrink-0 border ${filters.ocultarAnuladasErro
                          ? ''
                          : 'bg-zinc-300 dark:bg-zinc-700 border-zinc-400/60 dark:border-zinc-600'
                          }`}
                        style={{
                          backgroundColor: filters.ocultarAnuladasErro ? accentConfig.primaryHex : undefined,
                          borderColor: filters.ocultarAnuladasErro ? accentConfig.primaryHex : undefined
                        }}
                      >
                        <span
                          className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 inline-block ${filters.ocultarAnuladasErro ? 'translate-x-4.5' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>

                    <div className="bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 px-3 flex items-center justify-between shadow-xs">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Ocultar revisadas</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={filters.ocultarRevisadas}
                        onClick={() =>
                          onChange({
                            ...filters,
                            ocultarRevisadas: !filters.ocultarRevisadas
                          })
                        }
                        className={`w-10 h-5.5 rounded-full transition-colors relative inline-flex items-center cursor-pointer p-0.5 shrink-0 border ${filters.ocultarRevisadas
                          ? ''
                          : 'bg-zinc-300 dark:bg-zinc-700 border-zinc-400/60 dark:border-zinc-600'
                          }`}
                        style={{
                          backgroundColor: filters.ocultarRevisadas ? accentConfig.primaryHex : undefined,
                          borderColor: filters.ocultarRevisadas ? accentConfig.primaryHex : undefined
                        }}
                      >
                        <span
                          className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 inline-block ${filters.ocultarRevisadas ? 'translate-x-4.5' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>

                    <div
                      className="bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 px-3 flex items-center justify-between shadow-xs"
                      title="Seleciona apenas questões com comentário padrão ouro"
                    >
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Comentadas</span>
                      <button
                        type="button"
                        role="switch"
                        aria-label="Comentadas"
                        aria-checked={Boolean(filters.apenasComentadas)}
                        onClick={() =>
                          onChange({
                            ...filters,
                            apenasComentadas: !filters.apenasComentadas
                          })
                        }
                        className={`w-10 h-5.5 rounded-full transition-colors relative inline-flex items-center cursor-pointer p-0.5 shrink-0 border ${filters.apenasComentadas
                          ? ''
                          : 'bg-zinc-300 dark:bg-zinc-700 border-zinc-400/60 dark:border-zinc-600'
                          }`}
                        style={{
                          backgroundColor: filters.apenasComentadas ? accentConfig.primaryHex : undefined,
                          borderColor: filters.apenasComentadas ? accentConfig.primaryHex : undefined
                        }}
                      >
                        <span
                          className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 inline-block ${filters.apenasComentadas ? 'translate-x-4.5' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {(isModalidadeActive('R+') || isModalidadeActive('Título de Especialista')) && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">Programa R+ e Sociedade</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          'R+ Clínica Médica',
                          'R+ Cirurgia Geral',
                          'R+ Pediatria',
                          'R+ Ginecologia e Obstetrícia',
                          'R+ Mastologia',
                          'R+ Medicina Intensiva',
                          'R+ Geriatria',
                          'R+ Neonatologia',
                          'R+ Urologia',
                          'TEGO',
                          'TECM',
                          'SBOT'
                        ].map((pr) => {
                          const isPrActive = Boolean(filters.programaRplus?.includes(pr));
                          return (
                            <button
                              key={pr}
                              type="button"
                              onClick={() => {
                                const cur = filters.programaRplus || [];
                                const next = isPrActive ? cur.filter((x) => x !== pr) : [...cur, pr];
                                onChange({ ...filters, programaRplus: next });
                              }}
                              className={`px-2 py-1 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer ${isPrActive
                                ? 'text-white shadow-xs'
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                              style={{
                                backgroundColor: isPrActive ? accentConfig.primaryHex : undefined,
                                borderColor: isPrActive ? accentConfig.primaryHex : undefined
                              }}
                            >
                              {pr}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. CARD COLAPSÁVEL: Anos da Prova */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 overflow-hidden transition-all">
              {/* Header com Toggle Mostrar/Ocultar */}
              <button
                type="button"
                aria-expanded={isYearsOpen}
                onClick={() => setIsYearsOpen(!isYearsOpen)}
                className="flex w-full items-center justify-between p-3 sm:p-3.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900/70 transition-colors select-none"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: accentConfig.primaryHex }} />
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Anos da Prova
                  </span>
                </span>

                <span className="flex items-center gap-2">
                  {/* Resumo quando colapsado ou selecionado */}
                  {filters.anos.length > 0 && filters.anos.length < yearsList.length && (
                    <span
                      className="px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide inline-flex items-center border"
                      style={{
                        backgroundColor: accentConfig.bgRgba,
                        borderColor: accentConfig.borderRgba,
                        color: accentConfig.primaryHex
                      }}
                    >
                      {activeQuickYearCount
                        ? `Últimos ${activeQuickYearCount}`
                        : `${filters.anos.length} ${filters.anos.length === 1 ? 'ano' : 'anos'}`}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isYearsOpen ? 'rotate-180' : ''
                      }`}
                  />
                </span>
              </button>

              {/* Conteúdo Expandido */}
              {isYearsOpen && (
                <div className="p-3 sm:p-3.5 pt-0 space-y-2.5 border-t border-zinc-200/50 dark:border-zinc-800/60">
                  <div className="flex items-center justify-between pt-2.5">
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Seleção rápida:</span>
                    <div className="flex items-center gap-1">
                      {QUICK_YEAR_COUNTS.map((count) => {
                        const isQuickActive = activeQuickYearCount === count;
                        return (
                          <button
                            key={count}
                            type="button"
                            disabled={yearsList.length < count}
                            aria-pressed={isQuickActive}
                            onClick={() => handleSelectUltimosAnos(count)}
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${isQuickActive
                              ? 'text-white shadow-xs'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                              }`}
                            style={{
                              backgroundColor: isQuickActive ? accentConfig.primaryHex : undefined
                            }}
                          >
                            Últimos {count}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={handleClearYears}
                        className="text-[10px] px-2 py-0.5 rounded font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                      >
                        Todos
                      </button>
                    </div>
                  </div>

                  {/* Pílulas de Anos em Linha Única Horizontal com Rolagem Lateral */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 custom-scrollbar scroll-smooth">
                    {yearsList.map((y) => {
                      const isSelected = filters.anos.includes(y);
                      return (
                        <button
                          key={y}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleYear(y)}
                          className={`shrink-0 px-3 py-1.5 text-center rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${isSelected
                            ? 'text-white shadow-xs'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
                            }`}
                          style={{
                            backgroundColor: isSelected ? accentConfig.primaryHex : undefined
                          }}
                        >
                          {y}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. BARRA DE COMANDO FIXA INFERIOR (ESTILO IMAGEM 2) - OCULTA SE EMBEDDED
         ========================================================================= */}
      {!embedded && (
        <div
          className={`fixed bottom-[calc(3.0625rem+max(env(safe-area-inset-bottom,0px),0.45rem))] md:bottom-0 right-0 z-30 transition-all duration-300 ${isSidebarCollapsed ? 'left-0 md:left-20' : 'left-0 md:left-64'
            } bg-[var(--bg-card,#ffffff)]/96 dark:bg-[var(--card,#121215)]/96 backdrop-blur-md border-t border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] px-2.5 sm:px-6 py-2 sm:py-3 md:pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_25px_rgba(0,0,0,0.6)] select-none`}
        >
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 sm:gap-3 w-full">
            {/* Linha 1 no Mobile / Lado Esquerdo no Desktop: Filtros Ativos + Tags + Limpar */}
            <div className="flex items-center justify-between lg:justify-start gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" style={{ color: accentConfig.primaryHex }} />
                <span className="whitespace-nowrap">Filtros ({activeTags.length}):</span>
              </div>

              {/* Tags Ativas Removíveis (altura compacta no mobile para não empurrar a barra) */}
              <div className="flex flex-wrap items-center gap-1.5 max-h-14 sm:max-h-24 overflow-y-auto custom-scrollbar py-0.5 flex-1 min-w-0">
                {activeTags.map((t) => (
                  <Badge
                    key={t.id}
                    variant="theme"
                    size="sm"
                    className="inline-flex items-center gap-1"
                    style={{
                      backgroundColor: accentConfig.bgRgba,
                      borderColor: accentConfig.borderRgba,
                      color: accentConfig.primaryHex
                    }}
                  >
                    <span className="truncate max-w-[120px] sm:max-w-[140px]">{t.label}</span>
                    <button
                      type="button"
                      onClick={t.onRemove}
                      className="hover:opacity-75 cursor-pointer ml-0.5 text-xs font-bold leading-none touch-manipulation"
                      style={{ color: accentConfig.primaryHex }}
                      title={`Remover filtro ${t.label}`}
                    >
                      ✕
                    </button>
                  </Badge>
                ))}
              </div>

              {activeTags.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={onReset}
                  className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shrink-0"
                  title="Limpar todos os filtros"
                  leftIcon={<RotateCcw className="w-3 h-3" />}
                >
                  <span className="hidden sm:inline">Limpar</span>
                </Button>
              )}
            </div>

            {/* Linha 2 no Mobile / Lado Direito no Desktop (flex-wrap para zero overflow em 360px) */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-1.5 sm:gap-2.5 shrink-0 w-full lg:w-auto">
              {/* Cotas (se houver) */}
              {itemsToConfigure.length > 1 && (
                <Button
                  type="button"
                  variant={isCotasDrawerOpen ? 'primary' : 'secondary'}
                  size="xs"
                  onClick={() => setIsCotasDrawerOpen(!isCotasDrawerOpen)}
                  className="shrink-0"
                  title="Personalizar cotas por filtro"
                  leftIcon={<PieChart className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />}
                >
                  <span className="hidden sm:inline">Cotas</span>
                  <span>({itemsToConfigure.length})</span>
                </Button>
              )}

              {/* Seletor de Quantidade */}
              <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 shrink-0">
                <span className="font-semibold text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:inline mr-0.5">Qtd:</span>
                {[20, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setResolveCount(num);
                      setShowCustomQtd(false);
                    }}
                    className={`px-2 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${resolveCount === num && !showCustomQtd
                      ? 'text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 sm:bg-transparent'
                      }`}
                    style={{
                      backgroundColor: resolveCount === num && !showCustomQtd ? accentConfig.primaryHex : undefined
                    }}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setShowCustomQtd(!showCustomQtd)}
                  className={`px-1.5 py-1 rounded-md text-[11px] font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 transition-all cursor-pointer ${showCustomQtd || ![20, 50, 100].includes(resolveCount)
                    ? 'text-white font-bold'
                    : ''
                    }`}
                  style={{
                    backgroundColor: (showCustomQtd || ![20, 50, 100].includes(resolveCount)) ? accentConfig.primaryHex : undefined,
                    borderColor: (showCustomQtd || ![20, 50, 100].includes(resolveCount)) ? accentConfig.primaryHex : undefined
                  }}
                >
                  +
                </button>

                {showCustomQtd && (
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={resolveCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setResolveCount(Math.max(1, Math.min(200, val)));
                    }}
                    className="w-12 text-center font-bold text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md py-1 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                    placeholder="Qtd"
                  />
                )}
              </div>

              {/* Modo: Mais Recentes vs Aleatório */}
              <div className="inline-flex items-center rounded-xl p-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (filters.aleatorizar) {
                      onChange({ ...filters, aleatorizar: false });
                    }
                  }}
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${!filters.aleatorizar
                    ? 'text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  style={{
                    backgroundColor: !filters.aleatorizar ? accentConfig.primaryHex : undefined
                  }}
                  title="Modo Mais Recentes"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Recentes</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!filters.aleatorizar) {
                      onChange({ ...filters, aleatorizar: true });
                    }
                  }}
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${filters.aleatorizar
                    ? 'text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  style={{
                    backgroundColor: filters.aleatorizar ? accentConfig.primaryHex : undefined
                  }}
                  title="Modo Aleatório"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Aleatório</span>
                </button>
              </div>

              {/* Botão Criar Lista (toggle) + Selecionar local */}
              <Button
                type="button"
                variant={isCreateListMode ? 'primary' : 'secondary'}
                size="xs"
                onClick={() => {
                  setIsCreateListMode((prev) => {
                    const next = !prev;
                    if (!next) setIsLocationSelectorOpen(false);
                    return next;
                  });
                }}
                className="shrink-0"
                style={
                  isCreateListMode
                    ? { backgroundColor: accentConfig.primaryHex, borderColor: accentConfig.primaryHex }
                    : undefined
                }
                title="Ativar modo Criar Lista com os filtros atuais"
                leftIcon={<ListPlus className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Criar Lista</span>
              </Button>

              {isCreateListMode && (
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={() => setIsLocationSelectorOpen(true)}
                  className="shrink-0 border-[var(--primary-color)]/40"
                  title="Selecionar pasta de destino para a lista"
                  leftIcon={<FolderIcon className="w-4 h-4" style={{ color: accentConfig.primaryHex }} />}
                >
                  <span className="max-w-[130px] truncate">
                    {selectedFolderName || 'Selecionar local'}
                  </span>
                </Button>
              )}

              {/* Botão Primário Iniciar */}
              <Button
                type="button"
                disabled={isStartingQuestions || (!loadError && displayedQuestionCount === 0)}
                isLoading={isStartingQuestions}
                onClick={async () => {
                  if (loadError) {
                    onRetry?.();
                    return;
                  }
                  if (displayedQuestionCount === 0) return;
                  try {
                    setIsStartingQuestions(true);
                    const effectiveQuotas = getEffectiveQuotas();
                    await onStartSequentialSolving?.(resolveCount, effectiveQuotas, filters);
                  } finally {
                    setIsStartingQuestions(false);
                  }
                }}
                className={`flex-1 sm:flex-initial text-xs sm:text-sm font-bold shadow-md shrink-0 ${displayedQuestionCount === 0
                  ? 'opacity-50 cursor-not-allowed bg-zinc-400 dark:bg-zinc-700'
                  : ''
                  }`}
                style={{
                  backgroundColor: displayedQuestionCount === 0 ? undefined : accentConfig.primaryHex,
                  boxShadow: displayedQuestionCount === 0 ? undefined : `0 4px 14px ${accentConfig.bgRgba}`
                }}
                leftIcon={
                  displayedQuestionCount === 0 ? (
                    <Ban className="w-4 h-4 text-white/80 shrink-0" />
                  ) : !isStartingQuestions ? (
                    <Play className="w-4 h-4 fill-white shrink-0" />
                  ) : undefined
                }
              >
                {loadError ? (
                  <span className="truncate">Tentar novamente</span>
                ) : displayedQuestionCount === 0 ? (
                  <span className="truncate">Sem questões (0)</span>
                ) : (
                  <span className="truncate">
                    Iniciar ({displayedQuestionCount === null ? resolveCount : Math.min(resolveCount, displayedQuestionCount)})
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRAWER / MINI-SELETOR DE COTAS EXPANSÍVEL (BOTTOM-SHEET NO MOBILE SEM COLISÃO)
         ========================================================================= */}
      {isCotasDrawerOpen && itemsToConfigure.length > 1 && (
        <>
          <div
            className="fixed inset-0 z-45 bg-black/50 backdrop-blur-2xs md:hidden"
            onClick={() => setIsCotasDrawerOpen(false)}
          />
          <div
            className="fixed inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:inset-x-auto md:bottom-16 md:right-6 md:w-[480px] max-h-[72dvh] z-50 bg-white dark:bg-[#121215] backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 flex flex-col text-zinc-900 dark:text-zinc-100 animate-in slide-in-from-bottom-3 duration-200"
            style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.45)' }}
          >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">Distribuição por Filtro Selecionado</h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Escolha a quantidade de cada filtro ou equilibre igualmente</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleEquilibrarCotas}
                className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition-colors cursor-pointer"
                style={{
                  backgroundColor: accentConfig.bgRgba,
                  borderColor: accentConfig.borderRgba,
                  color: accentConfig.primaryHex
                }}
                title="Dividir igualmente o total entre todos os filtros selecionados"
              >
                <Scale className="w-3 h-3" style={{ color: accentConfig.primaryHex }} />
                <span>Equilibrar (Round-Robin)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCotasDrawerOpen(false)}
                className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Resumo de alocação */}
          <div className="text-[11px] text-zinc-400 py-2 flex items-center justify-between">
            <span>
              Total alocado:{' '}
              <strong className="text-amber-400 font-mono font-bold">
                {Object.values(getEffectiveQuotas()).reduce((a, b) => a + b, 0)}
              </strong>{' '}
              de <strong className="text-white font-mono">{resolveCount}</strong> questões
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/60 px-1.5 py-0.5 rounded">
              Intercalação Ativa
            </span>
          </div>

          {/* Lista de Filtros com Sliders e Steppers */}
          <div className="overflow-y-auto max-h-[46vh] space-y-2.5 py-1.5 pr-1 custom-scrollbar">
            {itemsToConfigure.map((it) => {
              const effective = getEffectiveQuotas();
              const currentCount = typeof effective[it.name] === 'number' ? effective[it.name] : 0;
              const pct = resolveCount > 0 ? Math.round((currentCount / resolveCount) * 100) : 0;

              return (
                <div key={it.id} className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                      <span className="text-[9.5px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 shrink-0">
                        {it.category}
                      </span>
                      <span className="font-semibold text-zinc-200 truncate">{it.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-400">{currentCount} q</span>
                      <span className="text-[10px] text-zinc-500 font-mono">({pct}%)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={resolveCount}
                      value={currentCount}
                      onChange={(e) => handleQuotaChange(it.name, parseInt(e.target.value) || 0)}
                      className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQuotaChange(it.name, Math.max(0, currentCount - 5))}
                        className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="-5 questões"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        max={resolveCount}
                        value={currentCount}
                        onChange={(e) => handleQuotaChange(it.name, parseInt(e.target.value) || 0)}
                        className="w-11 text-center text-xs font-bold bg-zinc-950 border border-zinc-700 rounded py-0.5 text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuotaChange(it.name, Math.min(resolveCount, currentCount + 5))}
                        className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="+5 questões"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer do Drawer com Iniciar Imediato */}
          <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsCotasDrawerOpen(false)}
              className="text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
            >
              Recolher
            </button>
            <button
              type="button"
              disabled={isStartingQuestions}
              onClick={async () => {
                setIsCotasDrawerOpen(false);
                try {
                  setIsStartingQuestions(true);
                  const effectiveQuotas = getEffectiveQuotas();
                  await onStartSequentialSolving?.(resolveCount, effectiveQuotas, filters);
                } finally {
                  setTimeout(() => setIsStartingQuestions(false), 2000);
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white font-bold text-xs transition-colors cursor-pointer shadow-md hover:opacity-95 ${isStartingQuestions ? 'opacity-80 cursor-wait' : ''
                }`}
              style={{
                backgroundColor: accentConfig.primaryHex
              }}
            >
              {isStartingQuestions ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Iniciando...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Iniciar com estas Cotas</span>
                </>
              )}
            </button>
          </div>
          </div>
        </>
      )}

      {/* =========================================================================
          MODAL: CATÁLOGO DE INSTITUIÇÕES E BANCAS POR ESTADO (UF) (ESTILO IMAGEM 1)
         ========================================================================= */}
      {showAllUfModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
          style={{ backgroundColor: isDark ? 'rgba(9, 9, 11, 0.85)' : 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl flex flex-col bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100"
            style={{
              maxHeight: '88vh'
            }}
          >
            {/* Header: Ícone + Título + Fechar */}
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5" style={{ color: accentConfig.primaryHex }} />
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Catálogo de Instituições e Bancas por Estado (UF)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAllUfModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abas Horizontais de UF (Todas as 27 UFs + Nacional + Todas) */}
            <div className="flex items-center gap-1 py-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar shrink-0">
              {UF_LIST.map((uf) => {
                const isUfActive = selectedUfTab.toLowerCase() === uf.toLowerCase();
                return (
                  <button
                    key={uf}
                    type="button"
                    onClick={() => setSelectedUfTab(uf)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${isUfActive
                      ? 'text-white shadow-md'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/40 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                      }`}
                    style={{
                      backgroundColor: isUfActive ? accentConfig.primaryHex : undefined,
                      borderColor: isUfActive ? accentConfig.primaryHex : undefined
                    }}
                  >
                    {uf}
                  </button>
                );
              })}
            </div>

            {/* Grade de 3 Colunas com os Cards de Instituições */}
            <div className="flex-1 overflow-y-auto py-3.5 pr-1.5 custom-scrollbar">
              {catalogError && (
                <button type="button" className="mb-2 text-xs underline" onClick={() => setCatalogRetry((n) => n + 1)}>
                  Recarregar contagens
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {catalogFilteredByUf.map((item) => {
                  const targetCanonical = getCanonicalBancaKey(item.key);
                  const isChecked = filters.instituicoes.some(
                    (inst) =>
                      getCanonicalBancaKey(inst).toLowerCase() === targetCanonical.toLowerCase()
                  );

                  return (
                    <div
                      key={item.sigla}
                      onClick={() => toggleInstituicao(item.key)}
                      className={`rounded-2xl p-3.5 flex flex-col justify-between transition-all cursor-pointer border ${isChecked
                        ? 'shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      style={{
                        backgroundColor: isChecked ? accentConfig.bgRgba : undefined,
                        borderColor: isChecked ? accentConfig.primaryHex : undefined
                      }}
                    >
                      {/* Topo do Card: Sigla + Badge UF + Checkbox Quadrado */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
                            {item.sigla}
                          </span>
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400"
                          >
                            {item.uf}
                          </span>
                        </div>

                        {/* Checkbox Quadrado no canto superior direito */}
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${isChecked
                            ? 'text-white'
                            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950'
                            }`}
                          style={{
                            backgroundColor: isChecked ? accentConfig.primaryHex : undefined,
                            borderColor: isChecked ? accentConfig.primaryHex : undefined
                          }}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
                        </div>
                      </div>

                      {/* Meio: Nome Completo da Instituição */}
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1 font-normal">
                        {item.nome}
                      </p>

                      {/* Base: Quantidade de Questões com a cor do tema */}
                      <span
                        className="text-xs font-semibold mt-2 font-mono"
                        style={{ color: accentConfig.primaryHex }}
                      >
                        {!catalogError && (
                          <>{formatCount(catalog ? resolveBancaList([getCanonicalBancaKey(item.key)])
                            .reduce((total, alias) => total + (catalog.bancas[alias] ?? 0), 0) : null, false)} questões</>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {filters.instituicoes.length}{' '}
                {filters.instituicoes.length === 1
                  ? 'instituição selecionada'
                  : 'instituições selecionadas'}
              </span>
              <button
                type="button"
                onClick={() => setShowAllUfModal(false)}
                className="px-5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer hover:opacity-90"
                style={{
                  backgroundColor: accentConfig.primaryHex
                }}
              >
                Concluir Seleção
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Filtro com Inteligência Artificial */}
      <SmartAIFilterModal
        isOpen={showSmartFilterModal}
        onClose={() => setShowSmartFilterModal(false)}
        initialCount={resolveCount}
        onApplyAndStart={async (aiFilters, quantity) => {
          setShowSmartFilterModal(false);
          const finalCount = quantity && quantity > 0 ? quantity : resolveCount;
          setResolveCount(finalCount);

          const mergedFilters: AdvancedFilterState = {
            ...filters,
            ...aiFilters,
            especialidades: aiFilters.especialidades !== undefined ? aiFilters.especialidades : filters.especialidades,
            temas: aiFilters.temas !== undefined ? aiFilters.temas : filters.temas,
            focos: aiFilters.focos !== undefined ? aiFilters.focos : filters.focos,
            subfocos: aiFilters.subfocos !== undefined ? aiFilters.subfocos : filters.subfocos,
            instituicoes: aiFilters.instituicoes !== undefined ? aiFilters.instituicoes : filters.instituicoes,
            anos: aiFilters.anos !== undefined ? aiFilters.anos : filters.anos,
            dificuldade: aiFilters.dificuldade !== undefined ? aiFilters.dificuldade : filters.dificuldade,
            search: aiFilters.search !== undefined ? aiFilters.search : filters.search
          };

          onChange(mergedFilters);
          await onStartSequentialSolving?.(finalCount, undefined, mergedFilters);
        }}
      />

      {/* Modal de Raio-X da Banca */}
      <BancaRaioXModal
        isOpen={showRaioXModal}
        onClose={() => setShowRaioXModal(false)}
        onApplyFilters={handleApplyAIFilters}
        initialBanca={filters.instituicoes[0] || 'ENARE'}
      />

      {/* Seletor de Ramificação de Pasta para Criar Lista */}
      <FolderBranchSelectorPopover
        isOpen={isLocationSelectorOpen}
        onClose={() => setIsLocationSelectorOpen(false)}
        folders={folders}
        selectedFolderId={selectedListFolderId}
        onSelectFolder={(folderId) => setSelectedListFolderId(folderId)}
        onCreateFolder={onCreateFolder}
        defaultListTitle={defaultListTitle}
        isSaving={isCreatingListAtLocation}
        disabled={displayedQuestionCount === 0}
        onConfirmCreateList={async (title, folderId) => {
          if (!onCreateListAtLocation) return;
          try {
            setIsCreatingListAtLocation(true);
            const effectiveQuotas = getEffectiveQuotas();
            await onCreateListAtLocation({
              title,
              folderId,
              totalQuestions: resolveCount,
              quotas: effectiveQuotas,
              filters
            });
            setIsLocationSelectorOpen(false);
            setIsCreateListMode(false);
          } finally {
            setIsCreatingListAtLocation(false);
          }
        }}
      />
    </div>
  );
};
