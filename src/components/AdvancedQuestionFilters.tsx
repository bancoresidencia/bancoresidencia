'use client';

import React, { useState, useMemo } from 'react';
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
  BookOpenCheck,
  SlidersHorizontal,
  Layers,
  FolderTree,
  Building2,
  Calendar,
  ToggleLeft,
  ToggleRight,
  FileText,
  CheckCircle2,
  Gauge,
  Sliders,
  ArrowRight,
  Target,
  Key,
  Play
} from 'lucide-react';
import {
  medevoHierarchy,
  medevoModalidades,
  medevoAnos,
  medicalInstitutionsDirectory,
  bancasExaminadorasOficiais,
  mockQuestions
} from '@/data/mockQuestions';
import { getQuestionCount } from '@/data/hierarchyCounts';
import { matchesStudyModalidades } from '@/utils/modalidades';
import { useTheme } from '@/context/ThemeContext';

interface AdvancedQuestionFiltersProps {
  filters: AdvancedFilterState;
  onChange: (filters: AdvancedFilterState) => void;
  onReset: () => void;
  totalAvailable: number;
  totalFiltered: number;
  onCreateListFromFilter: () => void;
  onSelectDirectQuestion?: (questionId: string) => void;
  onStartSequentialSolving?: () => void;
}

// Normalização para busca sem acentos e minúsculas
const normalizeText = (str: string): string =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// Renderização de texto sem highlight conforme solicitado
const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text }) => {
  return <>{text}</>;
};

const POPULAR_SIGLAS = [
  'INEP Revalida',
  'UNICAMP/HC',
  'CERMAM',
  'SUS-SP',
  'USP/HCFMUSP',
  'USP/HCRP',
  'UNIFESP/EPM',
  'AMRIGS',
  'PSU-MG',
  'SURCE',
  'SES-DF',
  'SES-GO',
  'SES-PE',
  'SUS-BA',
  'Santa Casa de São Paulo',
  'UFRGS/HCPA',
  'UFRJ/HUCFF',
  'UEL',
  'Centro Universitário FMABC',
  'UFMT Revalida',
  'HIAE/Einstein'
];

const MODALIDADE_COUNTS: Record<string, number> = {
  'Residência Médica': 132965,
  'Revalida': 2718,
  'Ciclo Básico': 0,
  'R+ Clínica Médica': 0,
  'R+ Pediatria': 0,
  'R+ Cirurgia': 0,
  'R+ Ginecologia e Obstetrícia': 0,
  'R+ Neuropediatria': 0,
  'Título de Oftalmologia (CBO)': 0,
  'Título Clínica Médica (TECM)': 0
};

export const AdvancedQuestionFilters: React.FC<AdvancedQuestionFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalAvailable,
  totalFiltered,
  onCreateListFromFilter,
  onSelectDirectQuestion,
  onStartSequentialSolving
}) => {
  const { accentConfig } = useTheme();

  // Opção para criar caderno ao iniciar (padrão: false / não criar)
  const [shouldCreateCaderno, setShouldCreateCaderno] = useState<boolean>(false);

  // Sub-abas no topo dos filtros (Filtrar questões | Encontrar questão)
  const [filterSubTab, setFilterSubTab] = useState<'filtrar' | 'encontrar'>('filtrar');
  const [directSearchText, setDirectSearchText] = useState<string>('');
  const [directSearchMode, setDirectSearchMode] = useState<'questao' | 'palavras'>('questao');
  const [directSearchResults, setDirectSearchResults] = useState<typeof mockQuestions>([]);
  const [hasSearchedDirect, setHasSearchedDirect] = useState<boolean>(false);

  // Executa busca direta de questão por texto ou termos
  const handleSearchDirect = () => {
    setHasSearchedDirect(true);
    const query = directSearchText.trim();
    if (!query) {
      setDirectSearchResults([]);
      return;
    }

    const normQuery = normalizeText(query);
    const queryWords = normQuery
      .split(/[\s,.;:!?\n\r\(\)]+/)
      .filter(
        (w) =>
          w.length >= 3 &&
          !['com', 'para', 'uma', 'por', 'sobre', 'que', 'dos', 'das', 'nas', 'nos', 'tem', 'foi', 'qual', 'como', 'mais'].includes(w)
      );

    const matched = mockQuestions.filter((q) => {
      const normStatement = normalizeText(q.statement);
      const normCode = normalizeText(q.code);
      const normInst = normalizeText(q.institution || '');
      const normBanca = normalizeText(q.banca || '');

      // Substring direta em enunciado ou código
      if (normStatement.includes(normQuery) || normCode.includes(normQuery)) {
        return true;
      }

      // Substring em opções
      const matchesOption = q.options.some((opt) => normalizeText(opt.text).includes(normQuery));
      if (matchesOption) return true;

      // Palavras-chave clínicas relevantes
      if (queryWords.length > 0) {
        const matchingWordCount = queryWords.filter(
          (w) => normStatement.includes(w) || normInst.includes(w) || normBanca.includes(w)
        ).length;
        if (matchingWordCount >= Math.min(2, queryWords.length)) {
          return true;
        }
      }

      return false;
    });

    setDirectSearchResults(matched);
  };

  // Estados de acordeões abertos
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    especialidades: true, // Aberto por padrão para acesso imediato
    status: false,
    dificuldade: false,
    tipoQuestao: false,
    modalidade: false,
    instituicoes: false,
    anos: false,
    extras: false
  });

  // Estados de expansão na árvore hierárquica (especialidade -> tema -> foco)
  const [expandedEspec, setExpandedEspec] = useState<Record<string, boolean>>({});
  const [expandedTema, setExpandedTema] = useState<Record<string, boolean>>({});
  const [expandedFoco, setExpandedFoco] = useState<Record<string, boolean>>({});

  // Busca textual dedicada dentro da hierarquia clínica (Especialidades, Temas, Focos, Subfocos)
  const [hierarchySearch, setHierarchySearch] = useState<string>('');

  // Estados e lógica para o filtro de Instituições e Bancas Oficiais
  const [instSearch, setInstSearch] = useState<string>('');
  const [instCategory, setInstCategory] = useState<'todas' | 'populares' | 'bancas'>('todas');

  const filteredInstituicoes = useMemo(() => {
    let list: { sigla: string; nome: string; isBanca?: boolean }[] = [];

    if (instCategory === 'bancas') {
      list = bancasExaminadorasOficiais.map((banca) => ({
        sigla: banca.split(' (')[0],
        nome: banca,
        isBanca: true
      }));
    } else if (instCategory === 'populares') {
      list = medicalInstitutionsDirectory.filter((inst) =>
        POPULAR_SIGLAS.includes(inst.sigla)
      );
    } else {
      list = medicalInstitutionsDirectory;
    }

    if (instSearch.trim()) {
      const q = instSearch.toLowerCase().trim();
      return list.filter(
        (item) =>
          item.sigla.toLowerCase().includes(q) ||
          item.nome.toLowerCase().includes(q)
      );
    }

    return list;
  }, [instCategory, instSearch]);

  // Filtragem inteligente da hierarquia por texto e identificação de especialidades
  const { filteredHierarchy, hierarchyMatchCount, matchesByEsp } = useMemo(() => {
    if (!hierarchySearch.trim()) {
      return {
        filteredHierarchy: medevoHierarchy,
        hierarchyMatchCount: 0,
        matchesByEsp: {} as Record<string, number>
      };
    }

    const q = normalizeText(hierarchySearch.trim());
    let matchCount = 0;
    const matchesMap: Record<string, number> = {};

    const filtered = medevoHierarchy
      .map((esp) => {
        let espTotalMatches = 0;
        const espMatches = normalizeText(esp.especialidade).includes(q);
        if (espMatches) {
          matchCount++;
          espTotalMatches++;
        }

        const matchingTemas = esp.temas
          .map((tem) => {
            const temaMatches = normalizeText(tem.tema).includes(q);
            if (temaMatches) {
              matchCount++;
              espTotalMatches++;
            }

            const matchingFocos = tem.focos
              .map((foc) => {
                const focoMatches = normalizeText(foc.foco).includes(q);
                if (focoMatches) {
                  matchCount++;
                  espTotalMatches++;
                }

                const matchingSubfocos = foc.subfocos.filter((sub) => {
                  const m = normalizeText(sub).includes(q);
                  if (m) {
                    matchCount++;
                    espTotalMatches++;
                  }
                  return m;
                });

                if (focoMatches || matchingSubfocos.length > 0 || temaMatches || espMatches) {
                  return {
                    ...foc,
                    subfocos:
                      focoMatches || temaMatches || espMatches
                        ? foc.subfocos
                        : matchingSubfocos
                  };
                }
                return null;
              })
              .filter((f): f is NonNullable<typeof f> => f !== null);

            if (temaMatches || matchingFocos.length > 0 || espMatches) {
              return {
                ...tem,
                focos: temaMatches || espMatches ? tem.focos : matchingFocos
              };
            }
            return null;
          })
          .filter((t): t is NonNullable<typeof t> => t !== null);

        if (espMatches || matchingTemas.length > 0) {
          matchesMap[esp.especialidade] = espTotalMatches;
          return {
            ...esp,
            temas: espMatches ? esp.temas : matchingTemas
          };
        }
        return null;
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    return { filteredHierarchy: filtered, hierarchyMatchCount: matchCount, matchesByEsp: matchesMap };
  }, [hierarchySearch]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Toggle Modalidades
  const toggleModalidade = (mod: StudyModalidade) => {
    const next = filters.modalidades.includes(mod)
      ? filters.modalidades.filter((m) => m !== mod)
      : [...filters.modalidades, mod];
    onChange({ ...filters, modalidades: next });
  };

  // Toggle Especialidade
  const toggleEspecialidade = (esp: string) => {
    const next = filters.especialidades.includes(esp)
      ? filters.especialidades.filter((e) => e !== esp)
      : [...filters.especialidades, esp];
    onChange({ ...filters, especialidades: next });
  };

  // Toggle Tema
  const toggleTema = (tema: string) => {
    const next = filters.temas.includes(tema)
      ? filters.temas.filter((t) => t !== tema)
      : [...filters.temas, tema];
    onChange({ ...filters, temas: next });
  };

  // Toggle Foco
  const toggleFoco = (foco: string) => {
    const next = filters.focos.includes(foco)
      ? filters.focos.filter((f) => f !== foco)
      : [...filters.focos, foco];
    onChange({ ...filters, focos: next });
  };

  // Toggle Subfoco
  const toggleSubfoco = (sub: string) => {
    const next = filters.subfocos.includes(sub)
      ? filters.subfocos.filter((s) => s !== sub)
      : [...filters.subfocos, sub];
    onChange({ ...filters, subfocos: next });
  };

  // Toggle Instituições
  const toggleInstituicao = (inst: string) => {
    const next = filters.instituicoes.includes(inst)
      ? filters.instituicoes.filter((i) => i !== inst)
      : [...filters.instituicoes, inst];
    onChange({ ...filters, instituicoes: next });
  };

  // Toggle Anos
  const toggleAno = (ano: number) => {
    const next = filters.anos.includes(ano)
      ? filters.anos.filter((a) => a !== ano)
      : [...filters.anos, ano];
    onChange({ ...filters, anos: next });
  };

  // Expandir / Recolher Todos da Hierarquia
  const handleExpandAllHierarchy = () => {
    const allEspecs: Record<string, boolean> = {};
    const allTemas: Record<string, boolean> = {};
    const allFocos: Record<string, boolean> = {};

    medevoHierarchy.forEach((esp) => {
      allEspecs[esp.especialidade] = true;
      esp.temas.forEach((tem) => {
        allTemas[tem.tema] = true;
        tem.focos.forEach((foc) => {
          allFocos[foc.foco] = true;
        });
      });
    });

    setExpandedEspec(allEspecs);
    setExpandedTema(allTemas);
    setExpandedFoco(allFocos);
  };

  const handleCollapseAllHierarchy = () => {
    setExpandedEspec({});
    setExpandedTema({});
    setExpandedFoco({});
  };

  const statusOptions: QuestionStatus[] = [
    'Todas',
    'Não vistas',
    'Resolvidas',
    'Acertadas',
    'Erradas',
    'Ainda não acertadas'
  ];

  const difficultyOptions: QuestionDifficulty[] = ['Todas', 'Fácil', 'Médio', 'Difícil', 'Desconhecido'];
  const typeOptions: QuestionType[] = ['Todas', 'Múltipla escolha', 'Discursiva', 'Verdadeiro ou falso'];

  // Total de filtros ativos
  const activeCount =
    filters.modalidades.length +
    filters.especialidades.length +
    filters.temas.length +
    filters.focos.length +
    filters.subfocos.length +
    filters.instituicoes.length +
    filters.anos.length +
    filters.tipoProva.length +
    (filters.status !== 'Todas' ? 1 : 0) +
    (filters.dificuldade !== 'Todas' ? 1 : 0) +
    (filters.tipoQuestao !== 'Todas' ? 1 : 0) +
    (filters.ocultarAnuladasErro ? 1 : 0) +
    (filters.ocultarRevisadas ? 1 : 0) +
    (filters.ultimos5Anos ? 1 : 0) +
    (filters.search.trim().length > 0 ? 1 : 0);

  const hierarchyActiveCount =
    filters.especialidades.length +
    filters.temas.length +
    filters.focos.length +
    filters.subfocos.length;

  return (
    <div className="bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
      {/* 1. Header estilo Plataforma (Imagem 3) com 3 Sub-abas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs shrink-0"
            style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
          >
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Banco de Questões e Pesquisa
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Treine por especialidade e tema ou encontre uma questão específica pelo enunciado.
            </p>
          </div>
        </div>

        {/* 2 Sub-abas: Filtrar questões | Encontrar questão */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-xs">
          <button
            type="button"
            onClick={() => setFilterSubTab('filtrar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterSubTab === 'filtrar'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-black'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtrar questões</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterSubTab('encontrar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterSubTab === 'encontrar'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-black'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Encontrar questão</span>
          </button>
        </div>
      </div>

      {/* SUB-ABA 2: ENCONTRAR QUESTÃO DIRETAMENTE (ESTRUTURA DA IMAGEM 3) */}
      {filterSubTab === 'encontrar' && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Search className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Encontrar questão
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cole o enunciado ou pesquise por termos clínicos para localizar a questão exata.
              </p>
            </div>
          </div>

          {/* Banner de Escopo Completo */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 block">ESCOPO</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Banco completo</span>
                <span className="text-slate-500 dark:text-slate-400"> — Pesquise em todo o acervo ou filtre por termos clínicos.</span>
              </div>
            </div>
          </div>

          {/* Modos: Tenho a questão vs Palavras-chave */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDirectSearchMode('questao')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                directSearchMode === 'questao'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tenho a questão</span>
            </button>

            <button
              type="button"
              onClick={() => setDirectSearchMode('palavras')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                directSearchMode === 'palavras'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Palavras-chave</span>
            </button>
          </div>

          {/* Caixa de Entrada: Questão 1 (Textarea com enunciado como na Imagem 3) */}
          <div className="space-y-2 p-4 rounded-2xl bg-white dark:bg-[#070d18] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="direct-search-input" className="font-extrabold text-slate-800 dark:text-slate-200">
                {directSearchMode === 'questao' ? 'Questão 1: Cole o enunciado e as alternativas' : 'Termos Clínicos e Palavras-chave'}
              </label>
              <span className="text-[11px] text-slate-400">
                {directSearchMode === 'questao' ? 'Cole trecho do enunciado ou alternativas' : 'Ex: apendicite, laparoscopia, refluxo'}
              </span>
            </div>

            <textarea
              id="direct-search-input"
              rows={5}
              value={directSearchText}
              onChange={(e) => setDirectSearchText(e.target.value)}
              placeholder={
                directSearchMode === 'questao'
                  ? 'Ex.: Mulher de 58 anos, com dor abdominal aguda em fossa ilíaca direita...\nA) Apendicite aguda\nB) Diverticulite de Meckel...'
                  : 'Digite termos clínicos, nomes de exames, medicamentos, síndromes ou doenças...'
              }
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              {directSearchText ? (
                <button
                  type="button"
                  onClick={() => {
                    setDirectSearchText('');
                    setDirectSearchResults([]);
                    setHasSearchedDirect(false);
                  }}
                  className="text-xs text-rose-500 hover:underline cursor-pointer"
                >
                  Limpar texto
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={handleSearchDirect}
                disabled={!directSearchText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md transition-all cursor-pointer hover:scale-102 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar questões</span>
              </button>
            </div>
          </div>

          {/* Lista de Resultados Encontrados */}
          {hasSearchedDirect && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {directSearchResults.length === 1
                    ? '1 questão encontrada:'
                    : `${directSearchResults.length} questões encontradas:`}
                </span>
              </div>

              {directSearchResults.length > 0 ? (
                <div className="space-y-3">
                  {directSearchResults.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-white dark:bg-[#070d18] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all shadow-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border text-slate-700 dark:text-slate-300 text-[11px]">
                            {q.code}
                          </span>
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            {q.institution} • {q.year}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                            {q.especialidade}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectDirectQuestion?.(q.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white shadow-xs transition-transform hover:scale-105 cursor-pointer ml-auto"
                          style={{ backgroundColor: accentConfig.primaryHex }}
                        >
                          <span>Resolver esta questão</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed">
                        {q.statement}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 p-4">
                  Nenhuma questão encontrada com o texto inserido. Experimente buscar por termos clínicos específicos.
                </div>
              )}
            </div>
          )}
        </div>
      )}


      {/* SUB-ABA 1: FILTRAR QUESTÕES (FILTROS COMPLETOS EXISTENTES) */}
      {filterSubTab === 'filtrar' && (
        <div className="space-y-4">
      {/* Topo Enxuto: Contadores + Ações Principais */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Questões encontradas:</span>
          <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-sans tracking-tight">
            {totalFiltered.toLocaleString('pt-BR')}{' '}
            <span className="text-xs sm:text-sm font-normal text-slate-400 dark:text-slate-500">
              / {totalAvailable.toLocaleString('pt-BR')}
            </span>
          </span>
          {activeCount > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-sans font-bold text-white shadow-xs shrink-0 ml-1"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {activeCount} {activeCount === 1 ? 'filtro ativo' : 'filtros ativos'}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Opção para Criar Caderno */}
          <button
            type="button"
            onClick={() => setShouldCreateCaderno(!shouldCreateCaderno)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
              shouldCreateCaderno
                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                shouldCreateCaderno
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950'
              }`}
            >
              {shouldCreateCaderno && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
            <span>Criar Caderno</span>
          </button>

          {shouldCreateCaderno ? (
            <button
              onClick={() => onCreateListFromFilter()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:scale-102 active:scale-98"
              style={{
                backgroundColor: accentConfig.primaryHex,
                boxShadow: `0 4px 12px -2px ${accentConfig.bgRgba}`
              }}
              title="Salva as questões filtradas em um novo caderno e inicia"
            >
              <BookOpenCheck className="w-3.5 h-3.5" />
              <span>Criar Caderno ({totalFiltered.toLocaleString('pt-BR')})</span>
            </button>
          ) : (
            <button
              onClick={() => onStartSequentialSolving?.()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:scale-102 active:scale-98"
              style={{
                backgroundColor: accentConfig.primaryHex,
                boxShadow: `0 4px 12px -2px ${accentConfig.bgRgba}`
              }}
              title="Resolver questões diretamente sem criar caderno"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Resolver ({totalFiltered.toLocaleString('pt-BR')})</span>
            </button>
          )}

          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Campo de Busca Rápida no Acervo Geral */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Pesquisar por palavras-chave, enunciados, diagnósticos, sintomas, condutas ou código da questão..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-xs"
        />
        {filters.search && (
          <button
            onClick={() => onChange({ ...filters, search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ACORDEÕES / ABAS DE FILTRAGEM (Mais Funcional, Organizado e Intuitivo) */}
      <div className="space-y-3 pt-2">
        {/* 1. ESPECIALIDADES, TEMAS, FOCOS E SUBFOCOS (Com Busca Textual Integrada) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection('especialidades')}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-500" />
              <span className="font-heading text-sm font-bold">Especialidades, Temas, Focos e Subfocos</span>
              {hierarchyActiveCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                  {hierarchyActiveCount} {hierarchyActiveCount === 1 ? 'nível ativo' : 'níveis ativos'}
                </span>
              )}
            </div>
            {openSections.especialidades ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.especialidades && (
            <div className="p-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-3.5">
              {/* Barra de Busca Exclusiva para Especialidades, Temas, Focos e Subfocos */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filtrar árvore clínica (ex: diabetes, sífilis, fórcipe, apendicite, ECG, infecção)..."
                    value={hierarchySearch}
                    onChange={(e) => setHierarchySearch(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white pl-10 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium placeholder-slate-400"
                  />
                  {hierarchySearch && (
                    <button
                      type="button"
                      onClick={() => setHierarchySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Controles Rápidos: Expandir/Recolher & Limpar Seleção */}
                <div className="flex items-center gap-2 shrink-0">
                  {hierarchySearch.trim() && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {hierarchyMatchCount} {hierarchyMatchCount === 1 ? 'resultado' : 'resultados'}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleExpandAllHierarchy}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Expandir Todos
                  </button>

                  <button
                    type="button"
                    onClick={handleCollapseAllHierarchy}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Recolher
                  </button>

                  {hierarchyActiveCount > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...filters,
                          especialidades: [],
                          temas: [],
                          focos: [],
                          subfocos: []
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      Limpar Níveis ({hierarchyActiveCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Lista Hierárquica com Scroll */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredHierarchy.length > 0 ? (
                  filteredHierarchy.map((esp) => {
                    const isEspOpen = !!expandedEspec[esp.especialidade];
                    const isEspSelected = filters.especialidades.includes(esp.especialidade);
                    const matchCountForEsp = matchesByEsp[esp.especialidade] || 0;

                    return (
                      <div
                        key={esp.especialidade}
                        className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900/50 space-y-2 shadow-2xs"
                      >
                        {/* Linha Especialidade */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedEspec((prev) => ({
                                  ...prev,
                                  [esp.especialidade]: !prev[esp.especialidade]
                                }))
                              }
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 cursor-pointer"
                              title={isEspOpen ? 'Recolher temas' : 'Expandir temas'}
                            >
                              {isEspOpen ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleEspecialidade(esp.especialidade)}
                              className={`text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                                isEspSelected
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                  isEspSelected
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                                }`}
                              >
                                {isEspSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span>
                                <HighlightMatch text={esp.especialidade} query={hierarchySearch} />
                              </span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2 ml-auto">
                            {matchCountForEsp > 0 && (
                              <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Presente nesta especialidade ({matchCountForEsp} {matchCountForEsp === 1 ? 'item' : 'itens'})</span>
                              </span>
                            )}
                            <span className="text-xs sm:text-[13px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-sans font-bold border border-emerald-200 dark:border-emerald-800/60">
                              {getQuestionCount('especialidades', esp.especialidade).toLocaleString('pt-BR')} questões
                            </span>
                          </div>
                        </div>

                        {/* Temas da Especialidade */}
                        {isEspOpen && (
                          <div className="pl-6 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                            {esp.temas.map((tem) => {
                              const isTemaOpen = !!expandedTema[tem.tema];
                              const isTemaSelected = filters.temas.includes(tem.tema);

                              return (
                                <div key={tem.tema} className="space-y-1.5 pt-1">
                                  {/* Linha Tema */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedTema((prev) => ({
                                            ...prev,
                                            [tem.tema]: !prev[tem.tema]
                                          }))
                                        }
                                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 cursor-pointer"
                                        title={isTemaOpen ? 'Recolher focos' : 'Expandir focos'}
                                      >
                                        {isTemaOpen ? (
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        ) : (
                                          <ChevronRight className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => toggleTema(tem.tema)}
                                        className={`text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                                          isTemaSelected
                                            ? 'text-blue-600 dark:text-blue-400 font-bold'
                                            : 'text-slate-700 dark:text-slate-300 font-medium'
                                        }`}
                                      >
                                        <div
                                          className={`w-3 h-3 rounded flex items-center justify-center border ${
                                            isTemaSelected
                                              ? 'bg-blue-600 border-blue-600 text-white'
                                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                                          }`}
                                        >
                                          {isTemaSelected && <Check className="w-2 h-2 stroke-[3]" />}
                                        </div>
                                        <span>
                                          <HighlightMatch text={tem.tema} query={hierarchySearch} />
                                        </span>
                                      </button>
                                    </div>
                                    <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-sans font-bold border border-blue-200 dark:border-blue-800/60">
                                      {getQuestionCount('temas', tem.tema).toLocaleString('pt-BR')} questões
                                    </span>
                                  </div>

                                  {/* Focos do Tema */}
                                  {isTemaOpen && (
                                    <div className="pl-6 space-y-1.5 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                                      {tem.focos.map((foc) => {
                                        const isFocoOpen = !!expandedFoco[foc.foco];
                                        const isFocoSelected = filters.focos.includes(foc.foco);

                                        return (
                                          <div key={foc.foco} className="space-y-1">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setExpandedFoco((prev) => ({
                                                      ...prev,
                                                      [foc.foco]: !prev[foc.foco]
                                                    }))
                                                  }
                                                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 cursor-pointer"
                                                  title={isFocoOpen ? 'Recolher subfocos' : 'Expandir subfocos'}
                                                >
                                                  {isFocoOpen ? (
                                                    <ChevronDown className="w-3 h-3" />
                                                  ) : (
                                                    <ChevronRight className="w-3 h-3" />
                                                  )}
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => toggleFoco(foc.foco)}
                                                  className={`text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                                                    isFocoSelected
                                                      ? 'text-purple-600 dark:text-purple-400 font-bold'
                                                      : 'text-slate-600 dark:text-slate-400'
                                                  }`}
                                                >
                                                  <div
                                                    className={`w-3 h-3 rounded flex items-center justify-center border ${
                                                      isFocoSelected
                                                        ? 'bg-purple-600 border-purple-600 text-white'
                                                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                                                    }`}
                                                  >
                                                    {isFocoSelected && (
                                                      <Check className="w-2 h-2 stroke-[3]" />
                                                    )}
                                                  </div>
                                                  <span>
                                                    <HighlightMatch
                                                      text={foc.foco}
                                                      query={hierarchySearch}
                                                    />
                                                  </span>
                                                </button>
                                              </div>
                                              <span className="text-xs px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-sans font-bold border border-purple-200 dark:border-purple-800/60">
                                                {getQuestionCount('focos', foc.foco).toLocaleString('pt-BR')} questões
                                              </span>
                                            </div>

                                            {/* Subfocos do Foco: Um abaixo do outro em lista vertical */}
                                            {isFocoOpen && (
                                              <div className="pl-6 pt-1.5 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                                                {foc.subfocos.map((sub) => {
                                                  const isSubSelected = filters.subfocos.includes(sub);
                                                  const subCount = getQuestionCount('subfocos', sub);
                                                  return (
                                                    <div
                                                      key={sub}
                                                      className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
                                                    >
                                                      <button
                                                        type="button"
                                                        onClick={() => toggleSubfoco(sub)}
                                                        className={`text-xs transition-colors cursor-pointer flex items-center gap-2 text-left ${
                                                          isSubSelected
                                                            ? 'text-purple-600 dark:text-purple-400 font-bold'
                                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                        }`}
                                                      >
                                                        <div
                                                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                                                            isSubSelected
                                                              ? 'bg-purple-600 border-purple-600 text-white'
                                                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                                                          }`}
                                                        >
                                                          {isSubSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                        </div>
                                                        <span>{sub}</span>
                                                      </button>
                                                      <span className="text-xs font-sans font-bold text-slate-400 dark:text-slate-500 shrink-0 ml-2">
                                                        {subCount.toLocaleString('pt-BR')} questões
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
                  })
                ) : (
                  <div className="p-8 text-center bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nenhum tema, foco ou subfoco encontrado para &ldquo;{hierarchySearch}&rdquo;.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Tente termos clínicos mais amplos como &ldquo;hipertensão&rdquo;, &ldquo;trauma&rdquo;, &ldquo;parto&rdquo; ou limpe a busca.
                    </p>
                    <button
                      type="button"
                      onClick={() => setHierarchySearch('')}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 underline cursor-pointer pt-1"
                    >
                      Limpar busca textual
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. INSTITUIÇÕES E BANCAS OFICIAIS (Linha Toda, Logo Abaixo de Especialidades) */}
        <div className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection('instituicoes')}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-500" />
              <span className="font-heading text-sm font-bold">Instituições e Bancas Oficiais</span>
              <span className="text-[11px] text-slate-400 font-normal">
                ({medicalInstitutionsDirectory.length} instituições + bancas examinadoras)
              </span>
              {filters.instituicoes.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold">
                  {filters.instituicoes.length} selecionadas
                </span>
              )}
            </div>
            {openSections.instituicoes ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.instituicoes && (
            <div className="p-4 pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
              {/* Barra de controle: Busca, Categorias e Ações Rápidas */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filtrar instituição por sigla ou nome (ex: ENARE, USP, UNICAMP, FGV)..."
                    value={instSearch}
                    onChange={(e) => setInstSearch(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white pl-9 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400"
                  />
                  {instSearch && (
                    <button
                      type="button"
                      onClick={() => setInstSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setInstCategory('todas')}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                      instCategory === 'todas'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Todas ({medicalInstitutionsDirectory.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstCategory('populares')}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                      instCategory === 'populares'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Mais Concorridas ({POPULAR_SIGLAS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstCategory('bancas')}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                      instCategory === 'bancas'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Bancas Oficiais
                  </button>
                  {filters.instituicoes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onChange({ ...filters, instituicoes: [] })}
                      className="text-[11px] font-bold text-rose-600 hover:underline px-1 cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Grid com Altura Fixa e Scroll Fluido */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
                {filteredInstituicoes.map((inst) => {
                  const isSelected = filters.instituicoes.includes(inst.sigla);
                  return (
                    <button
                      key={inst.sigla}
                      type="button"
                      onClick={() => toggleInstituicao(inst.sigla)}
                      title={inst.nome}
                      className={`p-2 rounded-xl text-left transition-all cursor-pointer border flex items-center justify-between gap-1.5 group ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 shadow-xs text-purple-700 dark:text-purple-300'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                            isSelected
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-bold truncate">{inst.sigla}</span>
                      </div>
                      {inst.isBanca && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 shrink-0 font-medium">
                          Banca
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* DEMAIS FILTROS DIVIDIDOS EM 3 CARDS POR LINHA (Expandem ao selecionar) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* CARD 1: NÍVEL DE DIFICULDADE */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs flex flex-col justify-start">
            <button
              type="button"
              onClick={() => toggleSection('dificuldade')}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Gauge className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-heading text-xs font-bold truncate">Nível de Dificuldade</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                  {filters.dificuldade}
                </span>
              </div>
              {openSections.dificuldade ? (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              )}
            </button>

            {openSections.dificuldade && (
              <div className="p-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <div className="grid grid-cols-2 gap-2">
                  {difficultyOptions.map((diff) => {
                    const isSelected = filters.dificuldade === diff;
                    return (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => onChange({ ...filters, dificuldade: diff })}
                        className={`px-3 py-2 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* CARD 2: STATUS DE RESOLUÇÃO */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs flex flex-col justify-start">
            <button
              type="button"
              onClick={() => toggleSection('status')}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-heading text-xs font-bold truncate">Status da Questão</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold shrink-0">
                  {filters.status}
                </span>
              </div>
              {openSections.status ? (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              )}
            </button>

            {openSections.status && (
              <div className="p-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <div className="grid grid-cols-2 gap-1.5">
                  {statusOptions.map((st) => {
                    const isSelected = filters.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => onChange({ ...filters, status: st })}
                        className={`px-2 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border shadow-xs text-center truncate ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* CARD 3: TIPO DE QUESTÃO */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs flex flex-col justify-start">
            <button
              type="button"
              onClick={() => toggleSection('tipoQuestao')}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="font-heading text-xs font-bold truncate">Tipo da Questão</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold shrink-0">
                  {filters.tipoQuestao}
                </span>
              </div>
              {openSections.tipoQuestao ? (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              )}
            </button>

            {openSections.tipoQuestao && (
              <div className="p-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <div className="grid grid-cols-2 gap-2">
                  {typeOptions.map((tp) => {
                    const isSelected = filters.tipoQuestao === tp;
                    return (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => onChange({ ...filters, tipoQuestao: tp })}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer border truncate ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {tp}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* CARD 4: ANOS DE APLICAÇÃO */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs flex flex-col justify-start">
            <button
              type="button"
              onClick={() => toggleSection('anos')}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-heading text-xs font-bold truncate">Anos da Prova</span>
                {filters.anos.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                    {filters.anos.length} anos
                  </span>
                )}
              </div>
              {openSections.anos ? (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              )}
            </button>

            {openSections.anos && (
              <div className="p-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => onChange({ ...filters, anos: [2025, 2024, 2023, 2022, 2021] })}
                    className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Últimos 5 Anos
                  </button>
                  {filters.anos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onChange({ ...filters, anos: [] })}
                      className="font-semibold text-slate-500 hover:underline cursor-pointer"
                    >
                      Limpar ({filters.anos.length})
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto pr-0.5">
                  {medevoAnos.map((ano) => {
                    const isSelected = filters.anos.includes(ano);
                    return (
                      <button
                        key={ano}
                        type="button"
                        onClick={() => toggleAno(ano)}
                        className={`p-1.5 rounded-lg text-xs font-sans font-bold text-center transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {ano}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* CARD 5: MODALIDADE DE ESTUDO */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs flex flex-col justify-start">
            <button
              type="button"
              onClick={() => toggleSection('modalidade')}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-heading text-xs font-bold truncate">Modalidade</span>
                {filters.modalidades.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold shrink-0">
                    {filters.modalidades.length} ativas
                  </span>
                )}
              </div>
              {openSections.modalidade ? (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              )}
            </button>

            {openSections.modalidade && (
              <div className="p-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                {medevoModalidades.map((mod) => {
                  const isSelected = filters.modalidades.includes(mod);
                  const countForMod = MODALIDADE_COUNTS[mod] ?? 0;
                  return (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => toggleModalidade(mod)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-200 font-bold shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{mod}</span>
                      </div>
                      <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 shrink-0 ml-1">
                        {countForMod > 0 ? countForMod.toLocaleString('pt-BR') : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* CARD 6: OPÇÕES E FILTROS ESPECIAIS */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs flex flex-col justify-start">
            <button
              type="button"
              onClick={() => toggleSection('extras')}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Sliders className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-heading text-xs font-bold truncate">Opções Especiais</span>
                {(filters.ocultarAnuladasErro || filters.ocultarRevisadas || filters.ultimos5Anos) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold shrink-0">
                    Ativos
                  </span>
                )}
              </div>
              {openSections.extras ? (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              )}
            </button>

            {openSections.extras && (
              <div className="p-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, ocultarAnuladasErro: !filters.ocultarAnuladasErro })}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                    filters.ocultarAnuladasErro
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-200 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[11px]">Ocultar anuladas</span>
                  {filters.ocultarAnuladasErro ? (
                    <ToggleRight className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  ) : (
                    <ToggleLeft className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onChange({ ...filters, ocultarRevisadas: !filters.ocultarRevisadas })}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                    filters.ocultarRevisadas
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-200 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[11px]">Ocultar já revisadas</span>
                  {filters.ocultarRevisadas ? (
                    <ToggleRight className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  ) : (
                    <ToggleLeft className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onChange({ ...filters, ultimos5Anos: !filters.ultimos5Anos })}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                    filters.ultimos5Anos
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-200 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[11px]">Últimos 5 anos</span>
                  {filters.ultimos5Anos ? (
                    <ToggleRight className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  ) : (
                    <ToggleLeft className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};
