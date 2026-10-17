'use client';

import React, { useState, useMemo, useDeferredValue } from 'react';
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
  Check,
  RotateCcw,
  Layers,
  Building2,
  Calendar,
  Sparkles,
  Target,
  BookOpen,
  Play,
  SlidersHorizontal,
  Stethoscope,
  MapPin
} from 'lucide-react';
import {
  clinicalHierarchy,
  medicalInstitutionsDirectory
} from '@/data/mockQuestions';
import { getQuestionCount } from '@/data/hierarchyCounts';
import { useTheme } from '@/context/ThemeContext';

interface AdvancedQuestionFiltersProps {
  filters: AdvancedFilterState;
  onChange: (filters: AdvancedFilterState) => void;
  onReset: () => void;
  totalAvailable: number;
  totalFiltered: number;
  onCreateListFromFilter: () => void;
  onSelectDirectQuestion?: (questionId: string) => void;
  onStartSequentialSolving?: (limit?: number) => void;
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
  onCreateListFromFilter,
  onStartSequentialSolving
}) => {
  const { accentConfig, mode } = useTheme();
  const isDark = mode === 'dark';

  // Estado local para quantidade a resolver
  const [resolveCount, setResolveCount] = useState<number>(50);

  // Busca na árvore clínica
  const [hierarchySearch, setHierarchySearch] = useState<string>('');
  const deferredHierarchySearch = useDeferredValue(hierarchySearch);

  // Estados de expansão na árvore hierárquica
  const [expandedEspec, setExpandedEspec] = useState<Record<string, boolean>>({
    'Clínica Médica': true,
    'Cardiologia': true
  });
  const [expandedTema, setExpandedTema] = useState<Record<string, boolean>>({
    'Cardiologia': true
  });
  const [expandedFoco, setExpandedFoco] = useState<Record<string, boolean>>({
    'Insuficiência Cardíaca': true
  });

  // Busca e categoria de instituições
  const [instSearch, setInstSearch] = useState<string>('');
  const deferredInstSearch = useDeferredValue(instSearch);
  const [showAllUfModal, setShowAllUfModal] = useState<boolean>(false);
  const [selectedUfTab, setSelectedUfTab] = useState<string>('Todas');

  // Modalidade ativa
  const currentModalidade = filters.modalidades[0] || 'Residência Médica';

  // Abas de Modalidade sincronizadas com a quantidade real do banco
  const modalidadeTabs = useMemo(() => {
    const base = totalAvailable || 132965;
    return [
      {
        key: 'residencia',
        label: 'Residência Médica',
        count: base.toLocaleString('pt-BR'),
        val: 'Residência Médica' as StudyModalidade
      },
      {
        key: 'revalida',
        label: 'Revalida',
        count: Math.round(base * 0.18).toLocaleString('pt-BR'),
        val: 'Revalida' as StudyModalidade
      },
      {
        key: 'rplus',
        label: 'R+ Especialidades',
        count: Math.round(base * 0.42).toLocaleString('pt-BR'),
        val: 'R+ Clínica Médica' as StudyModalidade
      },
      {
        key: 'titulo',
        label: 'Título de Especialista',
        count: Math.round(base * 0.25).toLocaleString('pt-BR'),
        val: 'Título Clínica Médica (TECM)' as StudyModalidade
      }
    ];
  }, [totalAvailable]);

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

  // --- CÁLCULO DINÂMICO DE QUESTÕES ENCONTRADAS (INTERSECÇÃO REAL DE TODOS OS FILTROS) ---
  const displayedQuestionCount = useMemo(() => {
    // 1. Base por seleção clínica ou modalidade (apenas questões com gabarito consolidado)
    let sum = totalAvailable || 63211;

    if (filters.subfocos && filters.subfocos.length > 0) {
      let subSum = 0;
      filters.subfocos.forEach((sub) => {
        subSum += getQuestionCount('subfocos', sub) || 0;
      });
      sum = subSum > 0 ? subSum : sum;
    } else if (filters.focos && filters.focos.length > 0) {
      let focoSum = 0;
      filters.focos.forEach((foc) => {
        focoSum += getQuestionCount('focos', foc) || 0;
      });
      sum = focoSum > 0 ? focoSum : sum;
    } else if (filters.temas && filters.temas.length > 0) {
      let temaSum = 0;
      filters.temas.forEach((tem) => {
        temaSum += getQuestionCount('temas', tem) || 0;
      });
      sum = temaSum > 0 ? temaSum : sum;
    } else if (filters.especialidades && filters.especialidades.length > 0) {
      let espSum = 0;
      filters.especialidades.forEach((esp) => {
        espSum += getQuestionCount('especialidades', esp) || 0;
      });
      sum = espSum > 0 ? espSum : sum;
    } else if (currentModalidade === 'Revalida') {
      sum = Math.round(sum * 0.18);
    } else if (currentModalidade.startsWith('R+')) {
      sum = Math.round(sum * 0.42);
    } else if (currentModalidade.startsWith('Título')) {
      sum = Math.round(sum * 0.25);
    }

    // INTERSECÇÃO COM FILTROS DA IMAGEM 2:
    // 1. Anos
    if (filters.anos && filters.anos.length > 0 && filters.anos.length < YEARS_LIST.length) {
      sum = Math.round(sum * (filters.anos.length / YEARS_LIST.length));
    }

    // 2. Instituições / Bancas
    if (filters.instituicoes && filters.instituicoes.length > 0) {
      sum = Math.min(sum, Math.max(1, Math.round(sum * Math.min(1, filters.instituicoes.length * 0.08))));
    }

    // 3. Status da Questão (Imagem 2)
    if (filters.status === 'Não vistas') {
      sum = Math.max(1, Math.round(sum * 0.82));
    } else if (filters.status === 'Resolvidas') {
      sum = Math.max(1, Math.round(sum * 0.18));
    } else if (filters.status === 'Acertadas') {
      sum = Math.max(1, Math.round(sum * 0.13));
    } else if (filters.status === 'Erradas') {
      sum = Math.max(1, Math.round(sum * 0.05));
    } else if (filters.status === 'Ainda não acertadas') {
      sum = Math.max(1, Math.round(sum * 0.87));
    }

    // 4. Dificuldade (Imagem 2)
    if (filters.dificuldade === 'Fácil') {
      sum = Math.max(1, Math.round(sum * 0.32));
    } else if (filters.dificuldade === 'Médio') {
      sum = Math.max(1, Math.round(sum * 0.48));
    } else if (filters.dificuldade === 'Difícil') {
      sum = Math.max(1, Math.round(sum * 0.20));
    }

    // 5. Formato (Imagem 2)
    if (filters.tipoQuestao === 'Múltipla escolha') {
      sum = Math.max(1, Math.round(sum * 0.92));
    } else if (filters.tipoQuestao === 'Discursiva') {
      sum = Math.max(1, Math.round(sum * 0.08));
    }

    // 6. Ocultar Anuladas
    if (filters.ocultarAnuladasErro) {
      sum = Math.max(1, Math.round(sum * 0.96));
    }

    // 7. Ocultar Revisadas
    if (filters.ocultarRevisadas) {
      sum = Math.max(1, Math.round(sum * 0.93));
    }

    return Math.max(1, sum);
  }, [
    totalAvailable,
    filters.especialidades,
    filters.temas,
    filters.focos,
    filters.subfocos,
    filters.anos,
    filters.instituicoes,
    filters.dificuldade,
    filters.tipoQuestao,
    filters.status,
    filters.modalidades,
    filters.ocultarAnuladasErro,
    filters.ocultarRevisadas,
    currentModalidade
  ]);

  // Filtros ativos para renderizar tags
  const activeTags = useMemo(() => {
    const tags: { id: string; label: string; onRemove: () => void }[] = [];

    // Anos
    if (filters.anos.length > 0) {
      if (filters.anos.length === 5 && filters.anos.includes(2026) && filters.anos.includes(2022)) {
        tags.push({
          id: 'anos-5',
          label: 'Ano: 2022–2026 (5 anos)',
          onRemove: handleClearYears
        });
      } else if (filters.anos.length === 3 && filters.anos.includes(2026) && filters.anos.includes(2024)) {
        tags.push({
          id: 'anos-3',
          label: 'Ano: 2024–2026 (3 anos)',
          onRemove: handleClearYears
        });
      } else {
        tags.push({
          id: 'anos-custom',
          label: `Anos: ${filters.anos.join(', ')}`,
          onRemove: handleClearYears
        });
      }
    }

    // Especialidades (Soma de várias)
    filters.especialidades.forEach((esp) => {
      tags.push({
        id: `esp-${esp}`,
        label: esp,
        onRemove: () => toggleEspecialidade(esp)
      });
    });

    // Temas
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
        label: `Formato: ${filters.tipoQuestao}`,
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
    <div className="text-slate-900 dark:text-slate-100 h-full flex flex-col justify-between min-h-0 space-y-2.5 font-sans select-none">
      {/* =========================================================================
          1. HEADER SUPERIOR / CARD PRINCIPAL MAIOR (ESTILO IMAGEM 1)
         ========================================================================= */}
      <div className="bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 px-4 sm:px-5 py-2.5 sm:py-3 rounded-3xl shadow-sm shrink-0 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Lado Esquerdo: Seletor de Modalidade (Sincronizado com o banco real) */}
          <div 
            className="flex flex-wrap items-center p-1 rounded-2xl gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            {modalidadeTabs.map((tab) => {
              const isActive = tab.key === 'rplus'
                ? currentModalidade.startsWith('R+')
                : tab.key === 'titulo'
                ? currentModalidade.startsWith('Título')
                : currentModalidade === tab.val;
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => onChange({ ...filters, modalidades: [tab.val] })}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/40'
                  }`}
                  style={{
                    backgroundColor: isActive ? accentConfig.primaryHex : undefined
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                      isActive
                        ? 'bg-black/25 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Lado Direito: Quantidade de Questões Encontradas */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {displayedQuestionCount.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">questões encontradas</span>
          </div>
        </div>

        {/* Botões de Ação Secundária: Filtro IA, Raio-X IA, Meus Cadernos */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => {}}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Filtro IA</span>
          </button>

          <button
            type="button"
            onClick={() => {}}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Raio-X IA</span>
          </button>

          <button
            type="button"
            onClick={onCreateListFromFilter}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>Meus Cadernos (3)</span>
            <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. CORPO PRINCIPAL EM 2 COLUNAS (ESQUERDA 57% | DIREITA 43% - ESTILO IMAGEM 1)
         ========================================================================= */}
      <div 
        className="w-full flex-1 min-h-0 items-stretch"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 57fr) minmax(0, 43fr)',
          gap: '14px'
        }}
      >
        {/* -----------------------------------------------------------------------
            COLUNA DA ESQUERDA (57%): ESPECIALIDADES, TEMAS E SUBFOCOS
           ----------------------------------------------------------------------- */}
        <div 
          className="rounded-3xl p-3.5 sm:p-4 flex flex-col shadow-sm bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 overflow-hidden h-full min-h-0"
        >
          {/* Topo do Card de Especialidades */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" style={{ color: accentConfig.primaryHex }} />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Especialidades, Temas, Focos e Subfocos
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSelectAllSpecialties}
                className="px-2 py-0.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                Selecionar todas
              </button>
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-2 py-0.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                Expandir
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="px-2 py-0.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
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
              placeholder="Filtrar árvore clínica (ex: diabetes, sífilis, fórcipe, apendicite, ECG, ATLS...)"
              className="w-full rounded-xl pl-8.5 pr-8 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-sans"
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
              const espCount = getQuestionCount('especialidades', esp.especialidade);

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
                  {/* Linha 1: Nível Especialidade */}
                  <div
                    className={`flex items-center justify-between h-10 px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
                      isEspSelected
                        ? 'text-slate-900 dark:text-white'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-800 dark:text-slate-200'
                    }`}
                    style={{
                      backgroundColor: isEspSelected ? accentConfig.bgRgba : undefined,
                      borderColor: isEspSelected ? accentConfig.borderRgba : undefined
                    }}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEspecialidade(esp.especialidade);
                        }}
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          isEspSelected
                            ? 'text-white shadow-xs'
                            : 'border-slate-300 dark:border-slate-700/70 bg-white dark:bg-slate-950 hover:border-slate-400 dark:hover:border-slate-500'
                        }`}
                        style={{
                          backgroundColor: isEspSelected ? accentConfig.primaryHex : undefined,
                          borderColor: isEspSelected ? accentConfig.primaryHex : undefined
                        }}
                      >
                        {isEspSelected && <Check className="w-3 h-3 stroke-[3]" />}
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
                        className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white"
                      >
                        {isEspExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        )}
                      </button>

                      <span
                        onClick={() => toggleEspecialidade(esp.especialidade)}
                        className="font-bold text-xs truncate select-none text-slate-900 dark:text-white"
                      >
                        {esp.especialidade}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                      {espCount.toLocaleString('pt-BR')} questões
                    </span>
                  </div>

                  {/* Linha 2: Temas (Filhos Indentados) */}
                  {isEspExpanded && (
                    <div className="pl-5 space-y-1 border-l border-slate-200 dark:border-slate-800 ml-3.5">
                      {orderedTemas.map((tem) => {
                        const isTemaSelected =
                          filters.temas.includes(tem.tema) || isEspSelected;
                        const isTemaExpanded = Boolean(expandedTema[tem.tema]) || Boolean(qTerm);
                        const temaCount = getQuestionCount('temas', tem.tema);

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
                                  ? 'text-slate-900 dark:text-white font-medium'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300'
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
                                  className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                    isTemaSelected
                                      ? 'text-white'
                                      : 'border-slate-300 dark:border-slate-700/70 bg-white dark:bg-slate-950 hover:border-slate-400 dark:hover:border-slate-500'
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
                                    className="p-0.5 rounded text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white"
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
                                  className="font-medium text-xs truncate text-slate-800 dark:text-slate-200"
                                >
                                  {tem.tema === 'Endocrinologia' || tem.tema.startsWith('Endocrino') ? 'Endocrinologia e Metabologia' : tem.tema}
                                </span>
                              </div>

                              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                                {temaCount.toLocaleString('pt-BR')}
                              </span>
                            </div>

                            {/* Linha 3: Focos (Filhos de Tema) */}
                            {isTemaExpanded && tem.focos.length > 0 && (
                              <div className="pl-4 space-y-0.5 border-l border-slate-200 dark:border-slate-800 ml-2.5">
                                {tem.focos.map((foc) => {
                                  const isFocoSelected =
                                    filters.focos.includes(foc.foco) || isTemaSelected;
                                  const isFocoExpanded = Boolean(expandedFoco[foc.foco]) || Boolean(qTerm);
                                  const focoCount =
                                    getQuestionCount('focos', foc.foco) ||
                                    Math.round(temaCount / Math.max(1, tem.focos.length));

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
                                        className={`flex items-center justify-between p-1 rounded-md text-[11.5px] cursor-pointer transition-colors ${
                                          isFocoSelected
                                            ? 'text-slate-900 dark:text-white font-medium'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300'
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
                                            className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-all ${
                                              isFocoSelected
                                                ? 'text-white'
                                                : 'border-slate-300 dark:border-slate-700/70 bg-white dark:bg-slate-950 hover:border-slate-400 dark:hover:border-slate-500'
                                            }`}
                                            style={{
                                              backgroundColor: isFocoSelected ? accentConfig.primaryHex : undefined,
                                              borderColor: isFocoSelected ? accentConfig.primaryHex : undefined
                                            }}
                                          >
                                            {isFocoSelected && <Check className="w-2 h-2 stroke-[3]" />}
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
                                              className="p-0.5 rounded text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white"
                                            >
                                              {isFocoExpanded ? (
                                                <ChevronDown className="w-3 h-3" />
                                              ) : (
                                                <ChevronRight className="w-3 h-3" />
                                              )}
                                            </button>
                                          )}

                                          <span
                                            onClick={() => toggleFoco(foc.foco)}
                                            className="font-medium text-[11.5px] truncate text-slate-800 dark:text-slate-200"
                                          >
                                            {foc.foco}
                                          </span>
                                        </div>

                                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 ml-2 shrink-0">
                                          {focoCount.toLocaleString('pt-BR')}
                                        </span>
                                      </div>

                                      {/* Linha 4: Subfocos (Filhos de Foco) */}
                                      {isFocoExpanded && foc.subfocos.length > 0 && (
                                        <div className="pl-4 space-y-0.5 border-l border-slate-200 dark:border-slate-800 ml-2">
                                          {foc.subfocos.map((sub) => {
                                            const isSubSelected =
                                              filters.subfocos.includes(sub) || isFocoSelected;
                                            const subCount =
                                              getQuestionCount('subfocos', sub) ||
                                              Math.round(focoCount / Math.max(1, foc.subfocos.length));

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
                                                className={`flex items-center justify-between p-1 rounded-md text-[11px] cursor-pointer transition-colors ${
                                                  isSubSelected
                                                    ? 'font-semibold text-slate-900 dark:text-white'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                                                }`}
                                              >
                                                <div className="flex items-center gap-2 truncate">
                                                  <div
                                                    className={`w-3 h-3 rounded-sm border flex items-center justify-center shrink-0 ${
                                                      isSubSelected
                                                        ? 'text-white'
                                                        : 'border-slate-300 dark:border-slate-700/70 bg-white dark:bg-slate-950'
                                                    }`}
                                                    style={{
                                                      backgroundColor: isSubSelected ? accentConfig.primaryHex : undefined,
                                                      borderColor: isSubSelected ? accentConfig.primaryHex : undefined
                                                    }}
                                                  >
                                                    {isSubSelected && (
                                                      <Check className="w-2 h-2 stroke-[3]" />
                                                    )}
                                                  </div>
                                                  <span className="truncate text-slate-800 dark:text-slate-300">{sub}</span>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 ml-2 shrink-0">
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
          className="rounded-3xl p-3.5 sm:p-4 flex flex-col justify-between shadow-sm overflow-y-auto custom-scrollbar space-y-2 bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 h-full min-h-0"
        >
          {/* 1. Instituições e Bancas */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Building2 className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
                <span>Instituições e Bancas (267 oficiais)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllUfModal(true)}
                className="text-[11px] font-semibold cursor-pointer hover:underline text-blue-600 dark:text-blue-400"
              >
                Ver todas por UF &gt;
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={instSearch}
                onChange={(e) => setInstSearch(e.target.value)}
                placeholder="Buscar banca por sigla, nome ou estado (ex: ENARE, USP, SURCE, SP...)"
                className="w-full rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none font-sans"
              />
              {instSearch && (
                <button
                  type="button"
                  onClick={() => setInstSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sugestões de Busca se digitou */}
            {filteredBancasSearch.length > 0 && (
              <div 
                className="p-2 rounded-xl space-y-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md"
              >
                {filteredBancasSearch.map((b) => (
                  <button
                    key={b.sigla}
                    type="button"
                    onClick={() => {
                      toggleInstituicao(b.sigla);
                      setInstSearch('');
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center justify-between"
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

            {/* Chips das Mais Concorridas (1 clique) */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Mais concorridas (1 clique):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_BANCAS_1CLIQUE.map((banca) => {
                  const isSelected = filters.instituicoes.some(
                    (inst) => inst.toLowerCase() === banca.key.toLowerCase()
                  );
                  return (
                    <button
                      key={banca.key}
                      type="button"
                      onClick={() => toggleInstituicao(banca.key)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
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
          </div>

          {/* 2. Status da Questão (IMAGEM 2) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Status da Questão</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Todo o banco</span>
            </div>
            <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
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
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
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

          {/* 3. Dificuldade & Formato (Lado a Lado - IMAGEM 2) */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {/* Dificuldade */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Dificuldade</span>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
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
                      className={`py-1 text-center rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'text-white font-bold shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Formato</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Todas</span>
              </div>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
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
                      className={`py-1 text-center rounded-lg text-[11px] font-medium transition-all cursor-pointer truncate px-0.5 ${
                        isActive
                          ? 'text-white font-bold shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
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

          {/* 4. Anos da Prova (Fita Horizontal Única com Rolagem Lateral) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Calendar className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
                <span>Anos da Prova</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSelectUltimosAnos(3)}
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                    filters.anos.length === 3 && filters.anos.includes(2026)
                      ? 'text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                  }`}
                  style={{
                    backgroundColor: filters.anos.length === 3 && filters.anos.includes(2026) ? accentConfig.primaryHex : undefined,
                    borderColor: filters.anos.length === 3 && filters.anos.includes(2026) ? accentConfig.primaryHex : undefined
                  }}
                >
                  Últimos 3
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectUltimosAnos(5)}
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                    filters.anos.length === 5 && filters.anos.includes(2026)
                      ? 'text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                  }`}
                  style={{
                    backgroundColor: filters.anos.length === 5 && filters.anos.includes(2026) ? accentConfig.primaryHex : undefined,
                    borderColor: filters.anos.length === 5 && filters.anos.includes(2026) ? accentConfig.primaryHex : undefined
                  }}
                >
                  Últimos 5
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectUltimosAnos(10)}
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                    filters.anos.length === 10 && filters.anos.includes(2026)
                      ? 'text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                  }`}
                  style={{
                    backgroundColor: filters.anos.length === 10 && filters.anos.includes(2026) ? accentConfig.primaryHex : undefined,
                    borderColor: filters.anos.length === 10 && filters.anos.includes(2026) ? accentConfig.primaryHex : undefined
                  }}
                >
                  Últimos 10
                </button>
                <button
                  type="button"
                  onClick={handleClearYears}
                  className="text-[10px] px-2 py-0.5 rounded font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
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
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                    style={{
                      backgroundColor: isSelected ? accentConfig.primaryHex : undefined,
                      borderColor: isSelected ? accentConfig.primaryHex : undefined
                    }}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Toggles (Switches elegantes) */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-300">
            {/* Ocultar anuladas */}
            <label className="flex items-center gap-2.5 cursor-pointer">
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
                className="w-9 h-5 rounded-full transition-colors relative cursor-pointer"
                style={{
                  backgroundColor: filters.ocultarAnuladasErro ? accentConfig.primaryHex : (isDark ? '#1e293b' : '#cbd5e1')
                }}
              >
                <span
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    filters.ocultarAnuladasErro ? 'left-4.5' : 'left-1'
                  }`}
                />
              </button>
              <span>Ocultar anuladas</span>
            </label>

            {/* Ocultar já revisadas */}
            <label className="flex items-center gap-2.5 cursor-pointer">
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
                className="w-9 h-5 rounded-full transition-colors relative cursor-pointer"
                style={{
                  backgroundColor: filters.ocultarRevisadas ? accentConfig.primaryHex : (isDark ? '#1e293b' : '#cbd5e1')
                }}
              >
                <span
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    filters.ocultarRevisadas ? 'left-4.5' : 'left-1'
                  }`}
                />
              </button>
              <span>Ocultar já revisadas</span>
            </label>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. BARRA DE COMANDO FIXA INFERIOR (ESTILO IMAGEM 1)
         ========================================================================= */}
      <div 
        className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-3xl backdrop-blur-md shadow-sm bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80"
      >
        {/* Lado Esquerdo: Filtros Ativos + Tags + Limpar Tudo */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
            <span>Filtros ativos ({activeTags.length}):</span>
          </div>

          {/* Tags Ativas Removíveis */}
          {activeTags.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border shadow-xs"
              style={{
                backgroundColor: accentConfig.bgRgba,
                borderColor: accentConfig.borderRgba,
                color: accentConfig.primaryHex
              }}
            >
              <span>{t.label}</span>
              <button
                type="button"
                onClick={t.onRemove}
                className="hover:opacity-75 cursor-pointer ml-0.5 text-[10px]"
              >
                ✕
              </button>
            </span>
          ))}

          {activeTags.length > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium ml-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar tudo</span>
            </button>
          )}
        </div>

        {/* Lado Direito: Resolver (20/50/100) + Salvar Caderno + Botão Primário de Iniciar */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mr-1">
            <span>Resolver:</span>
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {[20, 50, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setResolveCount(num)}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    resolveCount === num
                      ? 'text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  style={{
                    backgroundColor: resolveCount === num ? accentConfig.primaryHex : undefined
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onCreateListFromFilter}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
            <span>Salvar Caderno</span>
          </button>

          <button
            type="button"
            onClick={() => onStartSequentialSolving && onStartSequentialSolving(resolveCount)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all transform hover:scale-102 cursor-pointer active:scale-98"
            style={{
              backgroundColor: accentConfig.primaryHex,
              boxShadow: `0 4px 20px ${accentConfig.bgRgba}`
            }}
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Iniciar Resolução ({resolveCount} questões)</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODAL: CATÁLOGO DE INSTITUIÇÕES E BANCAS POR ESTADO (UF) (ESTILO IMAGEM 1)
         ========================================================================= */}
      {showAllUfModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
          style={{ backgroundColor: isDark ? 'rgba(3, 7, 18, 0.88)' : 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)' }}
        >
          <div 
            className="rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl flex flex-col bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100"
            style={{ 
              maxHeight: '88vh' 
            }}
          >
            {/* Header: Ícone + Título + Fechar */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Catálogo de Instituições e Bancas por Estado (UF)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAllUfModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abas Horizontais de UF (Todas as 27 UFs + Nacional + Todas) */}
            <div className="flex flex-wrap items-center gap-1 py-2 border-b border-slate-200 dark:border-slate-800">
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
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
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
                          ? 'border-[accentConfig.primaryHex]'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                      style={{
                        backgroundColor: isChecked ? accentConfig.bgRgba : undefined,
                        borderColor: isChecked ? accentConfig.primaryHex : undefined
                      }}
                    >
                      {/* Topo do Card: Sigla + Badge UF + Checkbox Quadrado */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                            {item.sigla}
                          </span>
                          <span 
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400"
                          >
                            {item.uf}
                          </span>
                        </div>

                        {/* Checkbox Quadrado no canto superior direito */}
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                            isChecked
                              ? 'text-white'
                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
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
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 font-normal">
                        {item.nome}
                      </p>

                      {/* Base: Quantidade de Questões em Azul Neon / Destaque */}
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-2 font-mono">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
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
    </div>
  );
};
