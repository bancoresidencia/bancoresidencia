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
  Key
} from 'lucide-react';
import {
  medevoHierarchy,
  medevoModalidades,
  medevoAnos,
  medicalInstitutionsDirectory,
  bancasExaminadorasOficiais,
  mockQuestions
} from '@/data/mockQuestions';
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

// Componente para destacar trechos de texto correspondentes à busca
const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>;
  const normQuery = normalizeText(query.trim());
  const normText = normalizeText(text);
  const matchIndex = normText.indexOf(normQuery);
  if (matchIndex === -1) return <>{text}</>;

  const before = text.slice(0, matchIndex);
  const matched = text.slice(matchIndex, matchIndex + query.trim().length);
  const after = text.slice(matchIndex + query.trim().length);

  return (
    <>
      {before}
      <mark className="bg-amber-300 dark:bg-amber-400/80 text-slate-950 font-black px-1 py-0.5 rounded shadow-xs">
        {matched}
      </mark>
      {after}
    </>
  );
};

const POPULAR_SIGLAS = [
  'ENARE / ENAMED',
  'ENARE',
  'SUS-SP',
  'USP-SP',
  'HCFMUSP',
  'HCFMRP-USP',
  'UNIFESP/EPM',
  'HC-UNICAMP',
  'AMRIGS',
  'PSU-MG',
  'SURCE',
  'SES-DF',
  'SES-RJ',
  'SES-PE',
  'SUS-BA',
  'Santa Casa SP',
  'Revalida / Inep',
  'Einstein',
  'HCPA',
  'UFCSPA',
  'FHEMIG'
];

export const AdvancedQuestionFilters: React.FC<AdvancedQuestionFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalAvailable,
  totalFiltered,
  onCreateListFromFilter,
  onSelectDirectQuestion
}) => {
  const { accentConfig } = useTheme();

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

  // Filtragem inteligente da hierarquia por texto
  const { filteredHierarchy, hierarchyMatchCount } = useMemo(() => {
    if (!hierarchySearch.trim()) {
      return { filteredHierarchy: medevoHierarchy, hierarchyMatchCount: 0 };
    }

    const q = normalizeText(hierarchySearch.trim());
    let matchCount = 0;

    const filtered = medevoHierarchy
      .map((esp) => {
        const espMatches = normalizeText(esp.especialidade).includes(q);
        if (espMatches) matchCount++;

        const matchingTemas = esp.temas
          .map((tem) => {
            const temaMatches = normalizeText(tem.tema).includes(q);
            if (temaMatches) matchCount++;

            const matchingFocos = tem.focos
              .map((foc) => {
                const focoMatches = normalizeText(foc.foco).includes(q);
                if (focoMatches) matchCount++;

                const matchingSubfocos = foc.subfocos.filter((sub) => {
                  const m = normalizeText(sub).includes(q);
                  if (m) matchCount++;
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
          return {
            ...esp,
            temas: espMatches ? esp.temas : matchingTemas
          };
        }
        return null;
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    return { filteredHierarchy: filtered, hierarchyMatchCount: matchCount };
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
      {/* Topo: Busca Textual + Contadores + Limpar + Criar Lista */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
            >
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Filtros de Residência Médica
                </h2>
                {activeCount > 0 && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    {activeCount} {activeCount === 1 ? 'ativo' : 'ativos'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Refinamento instantâneo por especialidades, temas, focos, status e bancas
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">Questões Encontradas:</span>
            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">
              {totalFiltered.toLocaleString('pt-BR')}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ {totalAvailable.toLocaleString('pt-BR')}</span>
            </span>
          </div>

          <button
            onClick={onCreateListFromFilter}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:scale-102 active:scale-98"
            style={{
              backgroundColor: accentConfig.primaryHex,
              boxShadow: `0 6px 15px -3px ${accentConfig.bgRgba}`
            }}
          >
            <BookOpenCheck className="w-4 h-4" />
            <span>Criar Caderno Deste Filtro</span>
          </button>

          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
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
                    const isSearching = hierarchySearch.trim().length > 0;
                    const isEspOpen = isSearching || !!expandedEspec[esp.especialidade];
                    const isEspSelected = filters.especialidades.includes(esp.especialidade);

                    return (
                      <div
                        key={esp.especialidade}
                        className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900/50 space-y-2 shadow-2xs"
                      >
                        {/* Linha Especialidade */}
                        <div className="flex items-center justify-between">
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
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {esp.temas.length} {esp.temas.length === 1 ? 'tema' : 'temas'}
                          </span>
                        </div>

                        {/* Temas da Especialidade */}
                        {isEspOpen && (
                          <div className="pl-6 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                            {esp.temas.map((tem) => {
                              const isTemaOpen = isSearching || !!expandedTema[tem.tema];
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
                                    <span className="text-[10px] text-slate-400">
                                      {tem.focos.length} {tem.focos.length === 1 ? 'foco' : 'focos'}
                                    </span>
                                  </div>

                                  {/* Focos do Tema */}
                                  {isTemaOpen && (
                                    <div className="pl-6 space-y-1.5 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                                      {tem.focos.map((foc) => {
                                        const isFocoOpen = isSearching || !!expandedFoco[foc.foco];
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
                                              <span className="text-[10px] text-slate-400">
                                                {foc.subfocos.length} subfocos
                                              </span>
                                            </div>

                                            {/* Subfocos do Foco */}
                                            {isFocoOpen && (
                                              <div className="pl-6 pt-1 flex flex-wrap gap-1.5">
                                                {foc.subfocos.map((sub) => {
                                                  const isSubSelected = filters.subfocos.includes(sub);
                                                  return (
                                                    <button
                                                      key={sub}
                                                      type="button"
                                                      onClick={() => toggleSubfoco(sub)}
                                                      className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer border ${
                                                        isSubSelected
                                                          ? 'bg-purple-100 dark:bg-purple-900/50 border-purple-500 text-purple-700 dark:text-purple-200 font-bold shadow-xs'
                                                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                                                      }`}
                                                    >
                                                      <HighlightMatch
                                                        text={sub}
                                                        query={hierarchySearch}
                                                      />
                                                    </button>
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

        {/* 2. ABA: STATUS DE RESOLUÇÃO DA QUESTÃO */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection('status')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span>Status de Resolução / Questão</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                {filters.status}
              </span>
            </div>
            {openSections.status ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.status && (
            <div className="p-4 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {statusOptions.map((st) => {
                  const isSelected = filters.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onChange({ ...filters, status: st })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-xs ${
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

        {/* 3. ABA: NÍVEL DE DIFICULDADE */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection('dificuldade')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-500" />
              <span>Nível de Dificuldade</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold">
                {filters.dificuldade}
              </span>
            </div>
            {openSections.dificuldade ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.dificuldade && (
            <div className="p-4 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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

        {/* 4. ABA: TIPO DE QUESTÃO */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection('tipoQuestao')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>Tipo da Questão</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold">
                {filters.tipoQuestao}
              </span>
            </div>
            {openSections.tipoQuestao ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.tipoQuestao && (
            <div className="p-4 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {typeOptions.map((tp) => {
                  const isSelected = filters.tipoQuestao === tp;
                  return (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => onChange({ ...filters, tipoQuestao: tp })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer border ${
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

        {/* 5. ABA: MODALIDADE DE ESTUDO */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection('modalidade')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Modalidade de Estudo</span>
              {filters.modalidades.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                  {filters.modalidades.length} selecionadas
                </span>
              )}
            </div>
            {openSections.modalidade ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.modalidade && (
            <div className="p-4 pt-1 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {medevoModalidades.map((mod) => {
                const isSelected = filters.modalidades.includes(mod);
                const countForMod = mockQuestions.filter((q) => matchesStudyModalidades(q, [mod])).length;
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => toggleModalidade(mod)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer border ${
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
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0 ml-1">
                      {countForMod}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. ABA: INSTITUIÇÕES E BANCAS OFICIAIS */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection('instituicoes')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-500" />
              <span>Instituições e Bancas Oficiais</span>
              <span className="text-[10px] text-slate-400 font-normal">
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

        {/* 7. ABA: ANOS DE APLICAÇÃO */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection('anos')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Anos de Aplicação da Prova</span>
              {filters.anos.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold">
                  {filters.anos.length} selecionados
                </span>
              )}
            </div>
            {openSections.anos ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.anos && (
            <div className="p-4 pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Selecione os anos das provas:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ ...filters, anos: [2025, 2024, 2023, 2022, 2021] })}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Últimos 5 Anos
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={() => onChange({ ...filters, anos: [] })}
                    className="text-[11px] font-semibold text-slate-500 hover:underline cursor-pointer"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {medevoAnos.map((ano) => {
                  const isSelected = filters.anos.includes(ano);
                  return (
                    <button
                      key={ano}
                      type="button"
                      onClick={() => toggleAno(ano)}
                      className={`p-2 rounded-xl text-xs font-mono font-bold text-center transition-colors cursor-pointer border ${
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

        {/* 8. ABA: OPÇÕES E FILTROS ESPECIAIS (Switches) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection('extras')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              <span>Opções e Filtros Especiais</span>
              {(filters.ocultarAnuladasErro || filters.ocultarRevisadas || filters.ultimos5Anos) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                  Ativados
                </span>
              )}
            </div>
            {openSections.extras ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.extras && (
            <div className="p-4 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Switch: Ocultar anuladas/erro */}
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, ocultarAnuladasErro: !filters.ocultarAnuladasErro })}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                    filters.ocultarAnuladasErro
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-200 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>Ocultar anuladas e desatualizadas</span>
                  {filters.ocultarAnuladasErro ? (
                    <ToggleRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {/* Switch: Ocultar revisadas */}
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, ocultarRevisadas: !filters.ocultarRevisadas })}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                    filters.ocultarRevisadas
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-200 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>Ocultar questões já revisadas</span>
                  {filters.ocultarRevisadas ? (
                    <ToggleRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {/* Switch: Últimos 5 anos */}
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, ultimos5Anos: !filters.ultimos5Anos })}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                    filters.ultimos5Anos
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-200 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>Apenas últimos 5 anos (2020-2025)</span>
                  {filters.ultimos5Anos ? (
                    <ToggleRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
        </div>
      )}
    </div>
  );
};
