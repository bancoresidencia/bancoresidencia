'use client';

import React, { useState, useMemo, useDeferredValue, useEffect } from 'react';
import {
  StudyModalidade,
  AdvancedFilterState,
  QuestionStatus,
  QuestionDifficulty,
  QuestionType
} from '@/types';
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  ChevronUp,
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
  SlidersHorizontal,
  Stethoscope,
  MapPin,
  PieChart,
  Scale,
  Plus,
  Minus,
  Shuffle,
  Clock,
  Loader2
} from 'lucide-react';
import {
  clinicalHierarchy,
  medicalInstitutionsDirectory
} from '@/data/mockQuestions';
import { getQuestionCount } from '@/data/hierarchyCounts';
import { getInstitutionSupabaseCount } from '@/data/institutionCounts';
import {
  fetchFacetedHierarchyCounts,
  type FacetedHierarchyCountsResult
} from '@/services/questionService';
import { useTheme } from '@/context/ThemeContext';
import { SmartAIFilterModal } from './SmartAIFilterModal';
import { BancaRaioXModal } from './BancaRaioXModal';

interface AdvancedQuestionFiltersProps {
  filters: AdvancedFilterState;
  onChange: (filters: AdvancedFilterState) => void;
  onReset: () => void;
  totalAvailable: number;
  totalFiltered: number;
  isLoading?: boolean;
  onCreateListFromFilter: () => void;
  onSelectDirectQuestion?: (questionId: string) => void;
  onStartSequentialSolving?: (limit?: number, quotasByItem?: Record<string, number>, currentFilters?: AdvancedFilterState) => void;
  isSidebarCollapsed?: boolean;
  embedded?: boolean;
}

// Bancas mais concorridas para acesso rápido em 1 clique (conforme imagem)
const POPULAR_BANCAS_1CLIQUE = [
  { label: 'ENARE', key: 'ENARE' },
  { label: 'USP-SP', key: 'USP/HCFMUSP' },
  { label: 'SUS-SP', key: 'SUS-SP' },
  { label: 'UNICAMP', key: 'UNICAMP/HC' },
  { label: 'SURCE', key: 'SURCE' },
  { label: 'PSU-MG', key: 'PSU-MG' },
  { label: 'UNIFESP', key: 'UNIFESP/EPM' }
];


const YEARS_LIST = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];

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

// Catálogo formatado com contagens de questões com gabarito consolidado
const UF_INSTITUTIONS_CATALOG: UfInstitutionItem[] = [
  // Nacional
  { sigla: 'ENARE', uf: 'Nacional', nome: 'Exame Nacional de Residência (EBSERH)', count: '2.150 questões', key: 'ENARE' },
  { sigla: 'INEP Revalida', uf: 'Nacional', nome: 'Instituto Nacional de Estudos e Pesquisas Educacionais', count: '1.980 questões', key: 'INEP Revalida' },
  // SP
  { sigla: 'USP-SP', uf: 'SP', nome: 'Universidade de São Paulo (FUVEST)', count: '2.850 questões', key: 'USP/HCFMUSP' },
  { sigla: 'SUS-SP', uf: 'SP', nome: 'Secretaria de Estado da Saúde de São Paulo', count: '3.120 questões', key: 'SUS-SP' },
  { sigla: 'UNICAMP', uf: 'SP', nome: 'Universidade Estadual de Campinas', count: '2.410 questões', key: 'UNICAMP/HC' },
  { sigla: 'UNIFESP', uf: 'SP', nome: 'Universidade Federal de São Paulo (EPM)', count: '2.350 questões', key: 'UNIFESP/EPM' },
  { sigla: 'USP-RP', uf: 'SP', nome: 'Faculdade de Medicina de Ribeirão Preto (USP)', count: '2.010 questões', key: 'USP-RP' },
  { sigla: 'UNESP', uf: 'SP', nome: 'Universidade Estadual Paulista', count: '1.890 questões', key: 'UNESP' },
  { sigla: 'IAMSPE', uf: 'SP', nome: 'Hospital do Servidor Público Estadual de SP', count: '1.840 questões', key: 'IAMSPE' },
  { sigla: 'Santa Casa SP', uf: 'SP', nome: 'Irmandade da Santa Casa de Misericórdia de SP', count: '2.110 questões', key: 'Santa Casa de São Paulo' },
  { sigla: 'HIAE / Einstein', uf: 'SP', nome: 'Hospital Israelita Albert Einstein', count: '1.420 questões', key: 'Einstein' },
  { sigla: 'Sírio-Libanês', uf: 'SP', nome: 'Hospital Sírio-Libanês', count: '1.340 questões', key: 'Sírio-Libanês' },
  { sigla: 'FAMERP', uf: 'SP', nome: 'Faculdade de Medicina de São José do Rio Preto', count: '1.200 questões', key: 'FAMERP' },
  // RJ
  { sigla: 'UFRJ', uf: 'RJ', nome: 'Universidade Federal do Rio de Janeiro', count: '1.770 questões', key: 'UFRJ/HUCFF' },
  { sigla: 'UERJ', uf: 'RJ', nome: 'Universidade do Estado do Rio de Janeiro', count: '1.540 questões', key: 'UERJ/HUPE' },
  { sigla: 'UFF', uf: 'RJ', nome: 'Universidade Federal Fluminense', count: '1.180 questões', key: 'UFF' },
  { sigla: 'UNIRIO', uf: 'RJ', nome: 'Universidade Federal do Estado do Rio de Janeiro', count: '960 questões', key: 'UNIRIO' },
  { sigla: 'SMS-RJ', uf: 'RJ', nome: 'Secretaria Municipal de Saúde do Rio de Janeiro', count: '1.410 questões', key: 'SMS-RJ' },
  // MG
  { sigla: 'PSU-MG', uf: 'MG', nome: 'Processo Seletivo Unificado de Minas Gerais (AREMG)', count: '2.510 questões', key: 'PSU-MG' },
  { sigla: 'UFMG', uf: 'MG', nome: 'Universidade Federal de Minas Gerais', count: '1.910 questões', key: 'UFMG' },
  { sigla: 'Santa Casa BH', uf: 'MG', nome: 'Santa Casa de Belo Horizonte', count: '1.310 questões', key: 'Santa Casa de Belo Horizonte' },
  { sigla: 'HC-UFU', uf: 'MG', nome: 'Hospital das Clínicas de Uberlândia', count: '930 questões', key: 'UFU' },
  // RS
  { sigla: 'AMRIGS', uf: 'RS', nome: 'Associação Médica do Rio Grande do Sul', count: '2.430 questões', key: 'AMRIGS' },
  { sigla: 'HCPA / UFRGS', uf: 'RS', nome: 'Hospital de Clínicas de Porto Alegre', count: '1.670 questões', key: 'HCPA' },
  { sigla: 'UFCSPA', uf: 'RS', nome: 'Universidade Federal de Ciências da Saúde de Porto Alegre', count: '1.130 questões', key: 'UFCSPA' },
  { sigla: 'PUCRS', uf: 'RS', nome: 'Pontifícia Universidade Católica do Rio Grande do Sul', count: '1.070 questões', key: 'PUCRS' },
  // PR
  { sigla: 'UFPR', uf: 'PR', nome: 'Universidade Federal do Paraná', count: '1.570 questões', key: 'UFPR' },
  { sigla: 'PUC-PR', uf: 'PR', nome: 'Pontifícia Universidade Católica do Paraná', count: '1.390 questões', key: 'Pontifícia Universidade Católica do Paraná' },
  { sigla: 'UEL', uf: 'PR', nome: 'Hospital Universitário de Londrina (PR)', count: '1.030 questões', key: 'UEL' },
  { sigla: 'UEM', uf: 'PR', nome: 'Universidade Estadual de Maringá', count: '860 questões', key: 'UEM' },
  // SC
  { sigla: 'ACM', uf: 'SC', nome: 'Associação Catarinense de Medicina (Residência Unificada)', count: '1.670 questões', key: 'ACM' },
  { sigla: 'UFSC', uf: 'SC', nome: 'Universidade Federal de Santa Catarina (HU)', count: '1.100 questões', key: 'UFSC' },
  { sigla: 'UDESC', uf: 'SC', nome: 'Universidade do Estado de Santa Catarina', count: '810 questões', key: 'UDESC' },
  // BA
  { sigla: 'SUS-BA', uf: 'BA', nome: 'Secretaria da Saúde do Estado da Bahia', count: '1.910 questões', key: 'SUS-BA' },
  { sigla: 'UFBA', uf: 'BA', nome: 'Universidade Federal da Bahia (HUPES)', count: '1.440 questões', key: 'UFBA' },
  { sigla: 'EBMSP', uf: 'BA', nome: 'Escola Bahiana de Medicina e Saúde Pública', count: '1.030 questões', key: 'EBMSP' },
  // PE
  { sigla: 'SES-PE', uf: 'PE', nome: 'Secretaria Estadual de Saúde de Pernambuco', count: '1.530 questões', key: 'SES-PE' },
  { sigla: 'UPE', uf: 'PE', nome: 'Universidade de Pernambuco (HUOC)', count: '1.100 questões', key: 'UPE' },
  { sigla: 'UFPE', uf: 'PE', nome: 'Universidade Federal de Pernambuco (HC)', count: '1.070 questões', key: 'UFPE' },
  // CE
  { sigla: 'SURCE', uf: 'CE', nome: 'Seleção Unificada para Residência Médica do Ceará', count: '3.920 questões', key: 'SURCE' },
  { sigla: 'UFC', uf: 'CE', nome: 'Universidade Federal do Ceará (HUWC)', count: '2.780 questões', key: 'UFC' },
  // DF
  { sigla: 'SES-DF', uf: 'DF', nome: 'Secretaria de Estado de Saúde do Distrito Federal', count: '3.380 questões', key: 'SES-DF' },
  { sigla: 'HUB / UnB', uf: 'DF', nome: 'Hospital Universitário de Brasília (UnB)', count: '2.050 questões', key: 'UnB' },
  // GO
  { sigla: 'SES-GO', uf: 'GO', nome: 'Secretaria de Estado de Saúde de Goiás', count: '2.940 questões', key: 'SES-GO' },
  { sigla: 'UFG', uf: 'GO', nome: 'Universidade Federal de Goiás (HC)', count: '1.980 questões', key: 'UFG' },
  // ES
  { sigla: 'UFES', uf: 'ES', nome: 'Universidade Federal do Espírito Santo (HUCAM)', count: '2.350 questões', key: 'UFES' },
  { sigla: 'EMESCAM', uf: 'ES', nome: 'Escola Superior de Ciências da Santa Casa de Vitória', count: '1.820 questões', key: 'EMESCAM' },
  // PA
  { sigla: 'UFPA', uf: 'PA', nome: 'Universidade Federal do Pará (Hospital Bettina Ferro)', count: '2.410 questões', key: 'UFPA' },
  { sigla: 'UEPA', uf: 'PA', nome: 'Universidade do Estado do Pará', count: '1.790 questões', key: 'UEPA' },
  // AM
  { sigla: 'UFAM', uf: 'AM', nome: 'Universidade Federal do Amazonas (HUGV)', count: '2.200 questões', key: 'UFAM' },
  { sigla: 'UEA', uf: 'AM', nome: 'Universidade do Estado do Amazonas', count: '1.650 questões', key: 'UEA' },
  // PB
  { sigla: 'UFPB', uf: 'PB', nome: 'Universidade Federal da Paraíba (HULW)', count: '2.050 questões', key: 'UFPB' },
  { sigla: 'UFCG', uf: 'PB', nome: 'Universidade Federal de Campina Grande', count: '1.580 questões', key: 'UFCG' },
  // RN
  { sigla: 'UFRN', uf: 'RN', nome: 'Universidade Federal do Rio Grande do Norte (HUOL)', count: '2.450 questões', key: 'UFRN' },
  // AL
  { sigla: 'UNCISAL', uf: 'AL', nome: 'Universidade Estadual de Ciências da Saúde de Alagoas', count: '1.920 questões', key: 'UNCISAL' },
  { sigla: 'UFAL', uf: 'AL', nome: 'Universidade Federal de Alagoas (HUPAA)', count: '1.740 questões', key: 'UFAL' },
  // SE
  { sigla: 'UFS', uf: 'SE', nome: 'Universidade Federal de Sergipe (HU-UFS)', count: '1.890 questões', key: 'UFS' },
  // PI
  { sigla: 'UFPI', uf: 'PI', nome: 'Universidade Federal do Piauí (HU-UFPI)', count: '1.850 questões', key: 'UFPI' },
  // MA
  { sigla: 'UFMA', uf: 'MA', nome: 'Universidade Federal do Maranhão (HUUFMA)', count: '2.100 questões', key: 'UFMA' },
  // MT
  { sigla: 'UFMT', uf: 'MT', nome: 'Universidade Federal de Mato Grosso (HUJM)', count: '1.940 questões', key: 'UFMT' },
  // MS
  { sigla: 'UFMS', uf: 'MS', nome: 'Universidade Federal de Mato Grosso do Sul (HUMAP)', count: '2.150 questões', key: 'UFMS' },
  // TO
  { sigla: 'UFT', uf: 'TO', nome: 'Universidade Federal do Tocantins (HGP)', count: '1.680 questões', key: 'UFT' },
  // RO
  { sigla: 'UNIR', uf: 'RO', nome: 'Universidade Federal de Rondônia (Hospital de Base)', count: '1.520 questões', key: 'UNIR' },
  // AC
  { sigla: 'UFAC', uf: 'AC', nome: 'Universidade Federal do Acre (FUNDHACRE)', count: '1.430 questões', key: 'UFAC' },
  // AP
  { sigla: 'UNIFAP', uf: 'AP', nome: 'Universidade Federal do Amapá (HCAL)', count: '1.380 questões', key: 'UNIFAP' },
  // RR
  { sigla: 'UFRR', uf: 'RR', nome: 'Universidade Federal de Roraima (HGR)', count: '1.310 questões', key: 'UFRR' }
];

export const AdvancedQuestionFilters: React.FC<AdvancedQuestionFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalAvailable,
  totalFiltered,
  isLoading = false,
  onCreateListFromFilter,
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
  const [mobileTab, setMobileTab] = useState<'conteudo' | 'bancas'>('conteudo');

  useEffect(() => {
    setIsFilterTransitioning(true);
    const t = setTimeout(() => {
      setIsFilterTransitioning(false);
    }, 280);
    return () => clearTimeout(t);
  }, [
    filters.especialidades,
    filters.temas,
    filters.focos,
    filters.subfocos,
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
      parts.push(filters.tipoQuestao === 'Múltipla escolha' ? 'Múltipla' : filters.tipoQuestao);
    }
    if (filters.ocultarAnuladasErro) {
      parts.push('Sem anuladas');
    }
    if (filters.ocultarRevisadas) {
      parts.push('Sem revisadas');
    }
    return parts;
  }, [filters.dificuldade, filters.tipoQuestao, filters.ocultarAnuladasErro, filters.ocultarRevisadas]);

  // Contadores de filtros ativos para as abas mobile
  const activeConteudoCount = useMemo(() => {
    return (
      (filters.especialidades?.length || 0) +
      (filters.temas?.length || 0) +
      (filters.focos?.length || 0) +
      (filters.subfocos?.length || 0)
    );
  }, [filters.especialidades, filters.temas, filters.focos, filters.subfocos]);

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

  // Faceted Search: Contagens dinâmicas por linha sincronizadas com o banco (apenas filtros do card direito)
  const [facetedCounts, setFacetedCounts] = useState<FacetedHierarchyCountsResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetchFacetedHierarchyCounts(filters);
        if (isMounted) {
          setFacetedCounts(res);
        }
      } catch {
        if (isMounted) setFacetedCounts(null);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    filters.instituicoes,
    filters.anos,
    filters.dificuldade,
    filters.tipoQuestao,
    filters.ocultarAnuladasErro,
    filters.ultimos5Anos,
    filters.modalidades
  ]);

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

    return list;
  }, [filters.especialidades, filters.temas, filters.focos, filters.subfocos]);

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

  // Busca e categoria de instituições
  const [instSearch, setInstSearch] = useState<string>('');
  const deferredInstSearch = useDeferredValue(instSearch);
  const [showAllUfModal, setShowAllUfModal] = useState<boolean>(false);
  const [selectedUfTab, setSelectedUfTab] = useState<string>('Todas');

  // Modalidade ativa
  const currentModalidade = filters.modalidades[0] || 'Residência Médica';


  // --- LÓGICA DE MULTI-SELEÇÃO DE ESPECIALIDADES (SOMA / UNIÃO) ---
  const toggleEspecialidade = (espName: string) => {
    const isSelected = filters.especialidades.includes(espName);
    let nextSpecs: string[];
    let nextTemas = [...filters.temas];
    let nextFocos = [...filters.focos];
    let nextSubfocos = [...filters.subfocos];

    if (isSelected) {
      nextSpecs = filters.especialidades.filter((e) => e !== espName);
      // Remove temas, focos e subfocos filhos dessa especialidade
      const espNode = clinicalHierarchy.find((h) => h.especialidade === espName);
      if (espNode) {
        const childTemas = espNode.temas.map((t) => t.tema);
        nextTemas = nextTemas.filter((t) => !childTemas.includes(t));
        const childFocos = espNode.temas.flatMap((t) => t.focos.map((f) => f.foco));
        nextFocos = nextFocos.filter((f) => !childFocos.includes(f));
        const childSubfocos = espNode.temas.flatMap((t) => t.focos.flatMap((f) => f.subfocos));
        nextSubfocos = nextSubfocos.filter((s) => !childSubfocos.includes(s));
      }
    } else {
      nextSpecs = [...filters.especialidades, espName];
    }

    onChange({
      ...filters,
      especialidades: nextSpecs,
      temas: nextTemas,
      focos: nextFocos,
      subfocos: nextSubfocos
    });
  };

  const toggleTema = (temaName: string) => {
    const isSelected = filters.temas.includes(temaName);
    let nextTemas: string[];
    let nextFocos = [...filters.focos];
    let nextSubfocos = [...filters.subfocos];

    if (isSelected) {
      nextTemas = filters.temas.filter((t) => t !== temaName);
      // Remove focos e subfocos filhos desse tema
      clinicalHierarchy.forEach((esp) => {
        const temaNode = esp.temas.find((t) => t.tema === temaName);
        if (temaNode) {
          const childFocos = temaNode.focos.map((f) => f.foco);
          nextFocos = nextFocos.filter((f) => !childFocos.includes(f));
          const childSubfocos = temaNode.focos.flatMap((f) => f.subfocos);
          nextSubfocos = nextSubfocos.filter((s) => !childSubfocos.includes(s));
        }
      });
    } else {
      nextTemas = [...filters.temas, temaName];
    }

    onChange({
      ...filters,
      temas: nextTemas,
      focos: nextFocos,
      subfocos: nextSubfocos
    });
  };

  const toggleFoco = (focoName: string) => {
    const isSelected = filters.focos.includes(focoName);
    let nextFocos: string[];
    let nextSubfocos = [...filters.subfocos];

    if (isSelected) {
      nextFocos = filters.focos.filter((f) => f !== focoName);
      // Remove subfocos desse foco
      clinicalHierarchy.forEach((esp) => {
        esp.temas.forEach((tem) => {
          const focoNode = tem.focos.find((f) => f.foco === focoName);
          if (focoNode) {
            nextSubfocos = nextSubfocos.filter((s) => !focoNode.subfocos.includes(s));
          }
        });
      });
    } else {
      nextFocos = [...filters.focos, focoName];
    }

    onChange({
      ...filters,
      focos: nextFocos,
      subfocos: nextSubfocos
    });
  };

  const toggleSubfoco = (subfocoName: string) => {
    const isSelected = filters.subfocos.includes(subfocoName);
    const next = isSelected
      ? filters.subfocos.filter((s) => s !== subfocoName)
      : [...filters.subfocos, subfocoName];

    onChange({
      ...filters,
      subfocos: next
    });
  };

  // Expandir / Recolher tudo
  const handleExpandAll = () => {
    const espMap: Record<string, boolean> = {};
    const temaMap: Record<string, boolean> = {};
    const focoMap: Record<string, boolean> = {};
    clinicalHierarchy.forEach((esp) => {
      espMap[esp.especialidade] = true;
      esp.temas.forEach((tem) => {
        temaMap[tem.tema] = true;
        tem.focos.forEach((foc) => {
          focoMap[foc.foco] = true;
        });
      });
    });
    setExpandedEspec(espMap);
    setExpandedTema(temaMap);
    setExpandedFoco(focoMap);
  };

  const handleCollapseAll = () => {
    setExpandedEspec({});
    setExpandedTema({});
    setExpandedFoco({});
  };

  const handleSelectAllSpecialties = () => {
    const all = clinicalHierarchy.map((h) => h.especialidade);
    onChange({
      ...filters,
      especialidades: all,
      temas: [],
      focos: [],
      subfocos: []
    });
  };

  // --- FILTROS DE INSTITUIÇÃO ---
  const toggleInstituicao = (bancaKey: string) => {
    const exists = filters.instituicoes.some(
      (inst) => inst.toLowerCase() === bancaKey.toLowerCase()
    );
    const next = exists
      ? filters.instituicoes.filter((i) => i.toLowerCase() !== bancaKey.toLowerCase())
      : [...filters.instituicoes, bancaKey];

    onChange({
      ...filters,
      instituicoes: next
    });
  };

  const filteredBancasSearch = useMemo(() => {
    if (!deferredInstSearch.trim()) return [];
    const q = deferredInstSearch.toLowerCase().trim();
    return medicalInstitutionsDirectory
      .filter((inst) => inst.sigla.toLowerCase().includes(q) || inst.nome.toLowerCase().includes(q))
      .slice(0, 8);
  }, [deferredInstSearch]);

  const catalogFilteredByUf = useMemo(() => {
    if (selectedUfTab === 'Todas') return UF_INSTITUTIONS_CATALOG;
    return UF_INSTITUTIONS_CATALOG.filter(
      (inst) => inst.uf.toLowerCase() === selectedUfTab.toLowerCase()
    );
  }, [selectedUfTab]);

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
    const selected = YEARS_LIST.slice(0, count);
    onChange({
      ...filters,
      anos: selected,
      ultimos5Anos: count === 5
    });
  };

  const handleClearYears = () => {
    onChange({
      ...filters,
      anos: [],
      ultimos5Anos: false
    });
  };

  // --- CÁLCULO DINÂMICO DE QUESTÕES ENCONTRADAS (INTERSECÇÃO REAL DO BANCO DE DADOS) ---
  const displayedQuestionCount = useMemo(() => {
    const hasActiveFilters = Boolean(
      (filters.search && filters.search.trim()) ||
      (filters.especialidades && filters.especialidades.length > 0) ||
      (filters.temas && filters.temas.length > 0) ||
      (filters.focos && filters.focos.length > 0) ||
      (filters.subfocos && filters.subfocos.length > 0) ||
      (filters.instituicoes && filters.instituicoes.length > 0) ||
      (filters.anos && filters.anos.length > 0 && filters.anos.length < YEARS_LIST.length) ||
      (filters.dificuldade && filters.dificuldade !== 'Todas') ||
      (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') ||
      (filters.status && filters.status !== 'Todas') ||
      filters.ocultarAnuladasErro ||
      filters.ultimos5Anos
    );

    if (hasActiveFilters) {
      if (typeof totalFiltered === 'number' && totalFiltered > 0) {
        return totalFiltered;
      }
      // Fallback resiliente instantâneo se totalFiltered for 0 (evita bloquear botão e mostrar 0 durante carregamento ou timeout)
      let localSum = 0;
      if (filters.subfocos && filters.subfocos.length > 0) {
        localSum = filters.subfocos.reduce((acc, s) => acc + (getQuestionCount('subfocos', s) || 0), 0);
      } else if (filters.focos && filters.focos.length > 0) {
        localSum = filters.focos.reduce((acc, f) => acc + (getQuestionCount('focos', f) || 0), 0);
      } else if (filters.temas && filters.temas.length > 0) {
        localSum = filters.temas.reduce((acc, t) => acc + (getQuestionCount('temas', t) || 0), 0);
      } else if (filters.especialidades && filters.especialidades.length > 0) {
        localSum = filters.especialidades.reduce((acc, e) => acc + (getQuestionCount('especialidades', e) || 0), 0);
      } else if (filters.instituicoes && filters.instituicoes.length > 0) {
        localSum = filters.instituicoes.reduce((acc, inst) => acc + (getInstitutionSupabaseCount(inst) || 0), 0);
      }
      if (localSum > 0) {
        return localSum;
      }
      return typeof totalFiltered === 'number' ? totalFiltered : 0;
    }
    return totalAvailable || 132965;
  }, [
    totalAvailable,
    totalFiltered,
    filters.search,
    filters.especialidades,
    filters.temas,
    filters.focos,
    filters.subfocos,
    filters.anos,
    filters.instituicoes,
    filters.dificuldade,
    filters.tipoQuestao,
    filters.status,
    filters.ocultarAnuladasErro,
    filters.ultimos5Anos
  ]);

  // Filtros ativos para renderizar tags
  const activeTags = useMemo(() => {
    const tags: { id: string; label: string; onRemove: () => void }[] = [];

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
        onRemove: () => toggleEspecialidade(esp)
      });
    });

    // Temas (apenas se a especialidade pai não estiver na tag para evitar redundância, ou todos)
    filters.temas.forEach((tem) => {
      tags.push({
        id: `tem-${tem}`,
        label: tem,
        onRemove: () => toggleTema(tem)
      });
    });

    // Focos
    filters.focos.forEach((foc) => {
      tags.push({
        id: `foc-${foc}`,
        label: `Foco: ${foc}`,
        onRemove: () => toggleFoco(foc)
      });
    });

    // Subfocos
    filters.subfocos.forEach((sub) => {
      tags.push({
        id: `sub-${sub}`,
        label: `Subfoco: ${sub}`,
        onRemove: () => toggleSubfoco(sub)
      });
    });

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
      tags.push({
        id: 'tipoQ',
        label: `Formato: ${filters.tipoQuestao === 'Múltipla escolha' ? 'Múltipla' : filters.tipoQuestao}`,
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

    return tags;
  }, [filters]);

  return (
    <div className="text-slate-900 dark:text-slate-100 h-full flex flex-col justify-between min-h-0 space-y-2.5 font-sans select-none pb-36 sm:pb-32 lg:pb-16">
      {/* =========================================================================
          1. HEADER SUPERIOR / CARD PRINCIPAL (ESTILO IMAGEM 1)
         ========================================================================= */}
      <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800/80 px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-sm shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
        {/* Lado Esquerdo: Modalidades no topo e Botões de Ação Rápida logo abaixo */}
        <div className="flex flex-col gap-2 items-start w-full md:w-auto">
          {/* Grupo de Modalidades */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => onChange({ ...filters, modalidades: ['Residência Médica'] })}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                currentModalidade === 'Residência Médica'
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
              style={{
                backgroundColor: currentModalidade === 'Residência Médica' ? accentConfig.primaryHex : undefined
              }}
            >
              Residência Médica
            </button>

            <button
              type="button"
              onClick={() => onChange({ ...filters, modalidades: ['Revalida'] })}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                currentModalidade === 'Revalida'
                  ? 'text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
              style={{
                backgroundColor: currentModalidade === 'Revalida' ? accentConfig.primaryHex : undefined
              }}
            >
              Revalida
            </button>

            <button
              type="button"
              onClick={() => onChange({ ...filters, modalidades: ['R+ Clínica Médica'] })}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                currentModalidade.startsWith('R+') || currentModalidade.startsWith('Título')
                  ? 'text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
              style={{
                backgroundColor: (currentModalidade.startsWith('R+') || currentModalidade.startsWith('Título')) ? accentConfig.primaryHex : undefined
              }}
            >
              <span>R+ / Título</span>
              <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                BREVE
              </span>
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

        {/* Lado Direito: Quantidade de Questões Encontradas */}
        <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto pt-1 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800/80">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 md:hidden">
            Total Disponível:
          </span>
          <div className="flex items-baseline gap-1.5 transition-all duration-200">
            {isCountLoading && (
              <Loader2
                className="w-4 h-4 sm:w-5 sm:h-5 animate-spin self-center shrink-0 transition-opacity duration-200"
                style={{ color: accentConfig.primaryHex }}
              />
            )}
            <span
              className={`text-xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight font-sans transition-all duration-200 ${
                isCountLoading ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'
              }`}
            >
              {displayedQuestionCount.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
              questões
            </span>
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
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mobileTab === 'conteudo'
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
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              mobileTab === 'conteudo' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
            }`}>
              {activeConteudoCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('bancas')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mobileTab === 'bancas'
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
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              mobileTab === 'bancas' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
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
        className="w-full flex-1 min-h-0 items-stretch flex flex-col lg:grid lg:grid-cols-[57fr_43fr] gap-3.5"
      >
        {/* -----------------------------------------------------------------------
            COLUNA DA ESQUERDA (57%): ESPECIALIDADES, TEMAS E SUBFOCOS
           ----------------------------------------------------------------------- */}
        <div 
          className={`rounded-3xl p-3.5 sm:p-4 flex-col shadow-sm bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800/80 overflow-hidden h-full min-h-0 ${
            mobileTab === 'conteudo' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Topo do Card de Conteúdo */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-100 dark:border-zinc-800/80 mb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" style={{ color: accentConfig.primaryHex }} />
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                Conteúdo
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSelectAllSpecialties}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
              >
                Selecionar todas
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
              className="w-full rounded-xl pl-8.5 pr-8 py-1.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-zinc-50 dark:bg-[var(--bg-input)] border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition-all font-sans"
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

          {/* Árvore Clínica com Scroll Dedicado */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 space-y-1 custom-scrollbar text-xs">
            {clinicalHierarchy.map((esp) => {
              const isEspSelected = filters.especialidades.includes(esp.especialidade);
              const isEspExpanded = Boolean(expandedEspec[esp.especialidade]);
              const espCount =
                facetedCounts
                  ? (typeof facetedCounts.especialidades[esp.especialidade] === 'number'
                      ? facetedCounts.especialidades[esp.especialidade]
                      : 0)
                  : (getQuestionCount('especialidades', esp.especialidade) || 0);

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
                        f.subfocos.some((s) => s.toLowerCase().includes(qTerm))
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
                    className={`flex items-center justify-between py-2.5 px-2 border-b border-zinc-100/40 dark:border-zinc-800/50 transition-colors cursor-pointer rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/40 ${
                      isEspSelected
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
                          toggleEspecialidade(esp.especialidade);
                        }}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          isEspSelected
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
                        onClick={() => toggleEspecialidade(esp.especialidade)}
                        className="font-bold text-sm sm:text-base tracking-tight truncate select-none text-zinc-900 dark:text-zinc-100"
                      >
                        {esp.especialidade}
                      </span>
                    </div>

                    {/* Badge de Questões - Fundo igual ao quadro geral, número por extenso */}
                    <span className="px-2.5 py-0.5 rounded-lg bg-transparent border border-zinc-200/60 dark:border-zinc-800/70 text-zinc-500 dark:text-zinc-400 font-mono text-xs shrink-0">
                      {espCount.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  {/* Linha 2: Temas (Filhos Indentados) */}
                  {isEspExpanded && (
                    <div className="pl-5 space-y-1 border-l border-zinc-200/40 dark:border-zinc-800/50 ml-3.5">
                      {orderedTemas.map((tem) => {
                        const isTemaSelected =
                          filters.temas.includes(tem.tema) || isEspSelected;
                        const isTemaExpanded = Boolean(expandedTema[tem.tema]) || Boolean(qTerm);
                        const temaCount =
                          facetedCounts
                            ? (typeof facetedCounts.temas[tem.tema] === 'number'
                                ? facetedCounts.temas[tem.tema]
                                : 0)
                            : (getQuestionCount('temas', tem.tema) || 0);

                        if (
                          qTerm &&
                          !tem.tema.toLowerCase().includes(qTerm) &&
                          !tem.focos.some(
                            (f) =>
                              f.foco.toLowerCase().includes(qTerm) ||
                              f.subfocos.some((s) => s.toLowerCase().includes(qTerm))
                          )
                        ) {
                          return null;
                        }

                        return (
                          <div key={tem.tema} className="space-y-1">
                            {/* Linha do Tema */}
                            <div
                              className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isTemaSelected
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
                                    toggleTema(tem.tema);
                                  }}
                                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                    isTemaSelected
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
                                  onClick={() => toggleTema(tem.tema)}
                                  className="font-medium text-xs truncate text-zinc-800 dark:text-zinc-200"
                                >
                                  {tem.tema === 'Endocrinologia' || tem.tema.startsWith('Endocrino') ? 'Endocrinologia e Metabologia' : tem.tema}
                                </span>
                              </div>

                              <span className="px-2 py-0.5 rounded-md bg-transparent border border-zinc-200/50 dark:border-zinc-800/60 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
                                {temaCount.toLocaleString('pt-BR')}
                              </span>
                            </div>

                            {/* Linha 3: Focos (Filhos de Tema) */}
                            {isTemaExpanded && tem.focos.length > 0 && (
                              <div className="pl-4 space-y-0.5 border-l border-zinc-200/40 dark:border-zinc-800/50 ml-2.5">
                                {tem.focos.map((foc) => {
                                  const isFocoSelected =
                                    filters.focos.includes(foc.foco) || isTemaSelected;
                                  const isFocoExpanded = Boolean(expandedFoco[foc.foco]) || Boolean(qTerm);
                                  const focoCount =
                                    facetedCounts
                                      ? (typeof facetedCounts.focos[foc.foco] === 'number'
                                          ? facetedCounts.focos[foc.foco]
                                          : 0)
                                      : (getQuestionCount('focos', foc.foco) ||
                                         Math.round(temaCount / Math.max(1, tem.focos.length)));

                                  if (
                                    qTerm &&
                                    !foc.foco.toLowerCase().includes(qTerm) &&
                                    !foc.subfocos.some((s) => s.toLowerCase().includes(qTerm))
                                  ) {
                                    return null;
                                  }

                                  return (
                                    <div key={foc.foco} className="space-y-0.5">
                                      {/* Linha do Foco */}
                                      <div
                                        className={`flex items-center justify-between p-1 rounded-md text-xs cursor-pointer transition-colors ${
                                          isFocoSelected
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
                                              toggleFoco(foc.foco);
                                            }}
                                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                              isFocoSelected
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
                                            onClick={() => toggleFoco(foc.foco)}
                                            className="font-medium text-xs truncate text-zinc-800 dark:text-zinc-200"
                                          >
                                            {foc.foco}
                                          </span>
                                        </div>

                                        <span className="px-1.5 py-0.5 rounded-md bg-transparent border border-zinc-200/50 dark:border-zinc-800/60 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 ml-2 shrink-0">
                                          {focoCount.toLocaleString('pt-BR')}
                                        </span>
                                      </div>

                                      {/* Linha 4: Subfocos (Filhos de Foco) */}
                                      {isFocoExpanded && foc.subfocos.length > 0 && (
                                        <div className="pl-4 space-y-0.5 border-l border-zinc-200/40 dark:border-zinc-800/50 ml-2">
                                          {foc.subfocos.map((sub) => {
                                            const isSubSelected =
                                              filters.subfocos.includes(sub) || isFocoSelected;
                                            const subCount =
                                              facetedCounts
                                                ? (typeof facetedCounts.subfocos[sub] === 'number'
                                                    ? facetedCounts.subfocos[sub]
                                                    : 0)
                                                : (getQuestionCount('subfocos', sub) ||
                                                   Math.round(focoCount / Math.max(1, foc.subfocos.length)));

                                            if (
                                              qTerm &&
                                              !sub.toLowerCase().includes(qTerm) &&
                                              !foc.foco.toLowerCase().includes(qTerm)
                                            ) {
                                              return null;
                                            }

                                            return (
                                              <div
                                                key={sub}
                                                onClick={() => toggleSubfoco(sub)}
                                                className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                                  isSubSelected
                                                    ? 'font-semibold text-zinc-900 dark:text-white'
                                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                                                }`}
                                              >
                                                <div className="flex items-center gap-2 truncate min-w-0" title={sub}>
                                                  <div
                                                    className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 ${
                                                      isSubSelected
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
                                                  </div>
                                                  <span className="truncate text-zinc-800 dark:text-zinc-300">{sub}</span>
                                                </div>
                                                <span className="px-1.5 py-0.5 rounded-md bg-transparent border border-zinc-200/50 dark:border-zinc-800/60 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 ml-2 shrink-0">
                                                  {subCount.toLocaleString('pt-BR')}
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
        </div>

        {/* -----------------------------------------------------------------------
            COLUNA DA DIREITA (43%): BANCO, STATUS, DIFICULDADE, ANOS (ESTILO IMAGEM 1)
           ----------------------------------------------------------------------- */}
        <div 
          className={`rounded-3xl p-3.5 sm:p-4 flex-col shadow-sm bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800/80 overflow-hidden h-full min-h-0 space-y-3 ${
            mobileTab === 'bancas' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* 1. Instituições e Bancas */}
          <div className="space-y-1.5 shrink-0">
            <div className="flex items-center justify-between">
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

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                value={instSearch}
                onChange={(e) => setInstSearch(e.target.value)}
                placeholder="Buscar banca por sigla, nome ou estado (ex: ENARE, USP, SURCE, SP...)"
                className="w-full rounded-xl pl-9 pr-8 py-1.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-zinc-50 dark:bg-[var(--bg-input)] border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] font-sans"
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
                className="p-2 rounded-xl space-y-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md"
              >
                {filteredBancasSearch.map((b) => (
                  <button
                    key={b.sigla}
                    type="button"
                    onClick={() => {
                      toggleInstituicao(b.sigla);
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

            {/* Tags de Bancas Selecionadas com 'x' */}
            {filters.instituicoes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
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

            {/* Chips das Mais Concorridas */}
            <div className="flex flex-wrap gap-1.5 pt-1">
                {POPULAR_BANCAS_1CLIQUE.map((banca) => {
                  const isSelected = filters.instituicoes.some(
                    (inst) => inst.toLowerCase() === banca.key.toLowerCase()
                  );
                  return (
                    <button
                      key={banca.key}
                      type="button"
                      onClick={() => toggleInstituicao(banca.key)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 border ${
                        isSelected
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

          {/* 2. Status da Questão */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Status da Questão</span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Todo o banco</span>
            </div>
            <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              {(['Todas', 'Não vistas', 'Erradas', 'Resolvidas', 'Acertadas'] as QuestionStatus[]).map(
                (st) => {
                  const isActive = filters.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onChange({ ...filters, status: st })}
                      className={`py-1.5 text-center rounded-lg text-xs transition-all cursor-pointer truncate px-1 ${
                        isActive
                          ? 'text-white shadow-sm font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/50'
                      }`}
                      style={{
                        backgroundColor: isActive ? accentConfig.primaryHex : undefined
                      }}
                    >
                      {st}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* =========================================================================
              ROLAGEM CONJUNTA: Dificuldade/Formato/Opções + Anos da Prova (IMAGEM 3)
             ========================================================================= */}
          <div className="min-h-0 flex-1 overflow-y-auto pr-1.5 custom-scrollbar space-y-2.5">
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
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                      isOptionsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Conteúdo Expandido */}
              {isOptionsOpen && (
                <div className="p-3 sm:p-3.5 pt-0 space-y-3 border-t border-zinc-200/50 dark:border-zinc-800/60">
                  {/* Linha 1: Dificuldade & Formato */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
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
                              className={`py-1.5 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isActive
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
                          { label: 'Todas', val: 'Todas' },
                          { label: 'Múltipla', val: 'Múltipla escolha' },
                          { label: 'Discursiva', val: 'Discursiva' }
                        ].map((fmt) => {
                          const isActive = filters.tipoQuestao === fmt.val;
                          return (
                            <button
                              key={fmt.label}
                              type="button"
                              onClick={() =>
                                onChange({
                                  ...filters,
                                  tipoQuestao: fmt.val as QuestionType
                                })
                              }
                              className={`py-1.5 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? 'text-white shadow-sm'
                                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                              }`}
                              style={{
                                backgroundColor: isActive ? accentConfig.primaryHex : undefined
                              }}
                            >
                              {fmt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Linha 2: Ocultar anuladas / Ocultar revisadas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 px-3.5 flex items-center justify-between shadow-xs">
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
                        className={`w-11 h-6 rounded-full transition-colors relative inline-flex items-center cursor-pointer p-0.5 shrink-0 border ${
                          filters.ocultarAnuladasErro
                            ? ''
                            : 'bg-zinc-300 dark:bg-zinc-700 border-zinc-400/60 dark:border-zinc-600'
                        }`}
                        style={{
                          backgroundColor: filters.ocultarAnuladasErro ? accentConfig.primaryHex : undefined,
                          borderColor: filters.ocultarAnuladasErro ? accentConfig.primaryHex : undefined
                        }}
                      >
                        <span
                          className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 inline-block ${
                            filters.ocultarAnuladasErro ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 px-3.5 flex items-center justify-between shadow-xs">
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
                        className={`w-11 h-6 rounded-full transition-colors relative inline-flex items-center cursor-pointer p-0.5 shrink-0 border ${
                          filters.ocultarRevisadas
                            ? ''
                            : 'bg-zinc-300 dark:bg-zinc-700 border-zinc-400/60 dark:border-zinc-600'
                        }`}
                        style={{
                          backgroundColor: filters.ocultarRevisadas ? accentConfig.primaryHex : undefined,
                          borderColor: filters.ocultarRevisadas ? accentConfig.primaryHex : undefined
                        }}
                      >
                        <span
                          className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 inline-block ${
                            filters.ocultarRevisadas ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. CARD COLAPSÁVEL: Anos da Prova */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 overflow-hidden transition-all">
              {/* Header com Toggle Mostrar/Ocultar */}
              <div
                onClick={() => setIsYearsOpen(!isYearsOpen)}
                className="flex items-center justify-between p-3 sm:p-3.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900/70 transition-colors select-none"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: accentConfig.primaryHex }} />
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Anos da Prova
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Resumo quando colapsado ou selecionado */}
                  {filters.anos.length > 0 && filters.anos.length < YEARS_LIST.length && (
                    <span
                      className="px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide inline-flex items-center border"
                      style={{
                        backgroundColor: accentConfig.bgRgba,
                        borderColor: accentConfig.borderRgba,
                        color: accentConfig.primaryHex
                      }}
                    >
                      {filters.anos.length === 3 && filters.anos.includes(2026)
                        ? 'Últimos 3'
                        : filters.anos.length === 5 && filters.anos.includes(2026)
                        ? 'Últimos 5'
                        : filters.anos.length === 10 && filters.anos.includes(2026)
                        ? 'Últimos 10'
                        : `${filters.anos.length} ${filters.anos.length === 1 ? 'ano' : 'anos'}`}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                      isYearsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Conteúdo Expandido */}
              {isYearsOpen && (
                <div className="p-3 sm:p-3.5 pt-0 space-y-2.5 border-t border-zinc-200/50 dark:border-zinc-800/60">
                  <div className="flex items-center justify-between pt-2.5">
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Seleção rápida:</span>
                    <div className="flex items-center gap-1">
                      {[3, 5, 10].map((count) => {
                        const isQuickActive = filters.anos.length === count && filters.anos.includes(2026);
                        return (
                          <button
                            key={count}
                            type="button"
                            onClick={() => handleSelectUltimosAnos(count)}
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                              isQuickActive
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
                    {YEARS_LIST.map((y) => {
                      const isSelected = filters.anos.includes(y);
                      return (
                        <button
                          key={y}
                          type="button"
                          onClick={() => toggleYear(y)}
                          className={`shrink-0 px-3 py-1.5 text-center rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                            isSelected
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
          className={`fixed bottom-0 right-0 z-30 transition-all duration-300 ${
            isSidebarCollapsed ? 'left-0 md:left-20' : 'left-0 md:left-64'
          } bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-3 sm:px-6 py-2 sm:py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_25px_rgba(0,0,0,0.6)] select-none`}
        >
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 sm:gap-3 w-full">
            {/* Linha 1 no Mobile / Lado Esquerdo no Desktop: Filtros Ativos + Tags + Limpar */}
            <div className="flex items-center justify-between lg:justify-start gap-2 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" style={{ color: accentConfig.primaryHex }} />
                <span>Filtros ({activeTags.length}):</span>
              </div>

              {/* Tags Ativas Removíveis com rolagem horizontal compacta */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0">
                {activeTags.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0"
                    style={{
                      backgroundColor: accentConfig.bgRgba,
                      borderColor: accentConfig.borderRgba,
                      color: accentConfig.primaryHex
                    }}
                  >
                    <span className="truncate max-w-[130px]">{t.label}</span>
                    <button
                      type="button"
                      onClick={t.onRemove}
                      className="hover:opacity-75 cursor-pointer ml-0.5 text-xs"
                      style={{ color: accentConfig.primaryHex }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              {activeTags.length > 0 && (
                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium shrink-0 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Limpar</span>
                </button>
              )}
            </div>

            {/* Linha 2 no Mobile / Lado Direito no Desktop: Cotas + Qtd + Recentes/Aleatório + Salvar + Iniciar */}
            <div className="flex items-center justify-between lg:justify-end gap-1.5 sm:gap-2.5 shrink-0 w-full lg:w-auto">
              {/* Cotas (se houver) */}
              {itemsToConfigure.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsCotasDrawerOpen(!isCotasDrawerOpen)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
                    isCotasDrawerOpen
                      ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 shadow-sm'
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                  title="Personalizar cotas por filtro"
                >
                  <PieChart className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span className="hidden sm:inline">Cotas</span>
                  <span>({itemsToConfigure.length})</span>
                </button>
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
                    className={`px-2 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      resolveCount === num && !showCustomQtd
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
                  className={`px-1.5 py-1 rounded-md text-[11px] font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 transition-all cursor-pointer ${
                    showCustomQtd || ![20, 50, 100].includes(resolveCount)
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
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    !filters.aleatorizar
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
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    filters.aleatorizar
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

              {/* Botão Salvar Lista */}
              <button
                type="button"
                onClick={onCreateListFromFilter}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 dark:border-zinc-700 transition-colors cursor-pointer shadow-xs shrink-0 flex items-center gap-1"
                title="Salvar como Caderno / Lista"
              >
                <ListPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Salvar</span>
              </button>

              {/* Botão Primário Iniciar */}
              <button
                type="button"
                disabled={isStartingQuestions || displayedQuestionCount === 0}
                onClick={async () => {
                  try {
                    setIsStartingQuestions(true);
                    const effectiveQuotas = getEffectiveQuotas();
                    await onStartSequentialSolving?.(resolveCount, effectiveQuotas, filters);
                  } finally {
                    setTimeout(() => setIsStartingQuestions(false), 2000);
                  }
                }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-98 hover:opacity-95 shrink-0 ${
                  isStartingQuestions ? 'opacity-80 cursor-wait' : ''
                }`}
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  boxShadow: `0 4px 14px ${accentConfig.bgRgba}`
                }}
              >
                {isStartingQuestions ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span className="truncate">Iniciando...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white shrink-0" />
                    <span className="truncate">Iniciar ({resolveCount})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRAWER / MINI-SELETOR DE COTAS EXPANSÍVEL (QUANDO MULTI-FILTRO ATIVO)
         ========================================================================= */}
      {isCotasDrawerOpen && itemsToConfigure.length > 1 && (
        <div 
          className="fixed bottom-16 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[480px] max-h-[75vh] z-50 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 flex flex-col text-zinc-900 dark:text-zinc-100 animate-in slide-in-from-bottom-3 duration-200"
          style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white font-bold text-xs transition-colors cursor-pointer shadow-md hover:opacity-95 ${
                isStartingQuestions ? 'opacity-80 cursor-wait' : ''
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
            <div className="flex flex-wrap items-center gap-1 py-2 border-b border-zinc-200 dark:border-zinc-800">
              {UF_LIST.map((uf) => {
                const isUfActive = selectedUfTab.toLowerCase() === uf.toLowerCase();
                return (
                  <button
                    key={uf}
                    type="button"
                    onClick={() => setSelectedUfTab(uf)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isUfActive
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {catalogFilteredByUf.map((item) => {
                  const isChecked = filters.instituicoes.some(
                    (inst) =>
                      inst.toLowerCase() === item.key.toLowerCase() ||
                      inst.toLowerCase() === item.sigla.toLowerCase()
                  );

                  return (
                    <div
                      key={item.sigla}
                      onClick={() => toggleInstituicao(item.key)}
                      className={`rounded-2xl p-3.5 flex flex-col justify-between transition-all cursor-pointer border ${
                        isChecked
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
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                            isChecked
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
                        {getInstitutionSupabaseCount(item.sigla, item.key).toLocaleString('pt-BR')} questões
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
    </div>
  );
};
