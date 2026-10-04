'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Building2,
  ChevronRight,
  ArrowLeft,
  Play,
  MapPin,
  X
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import {
  OfficialExamModalityKey,
  OfficialInstitution,
  OfficialExamItem,
  ExamResolutionMode
} from '@/types/officialExams';
import {
  getExamModalities,
  getInstitutions,
  getAvailableStates,
  getYearsForInstitution,
  getBookletsForInstitutionAndYear,
  getCatalogStats,
  getFeaturedInstitutions
} from '@/services/officialExamsService';

interface OfficialExamsProps {
  onStartExam: (
    institution: string,
    year: number,
    banca?: string,
    examDetails?: OfficialExamItem,
    mode?: ExamResolutionMode
  ) => void;
  onExploreInFilters?: (institution: string, year: number) => void;
}

// Componente de Logo com fallback para monograma declarado fora do componente pai
const InstitutionLogo: React.FC<{ inst: OfficialInstitution; size?: 'sm' | 'md' }> = ({
  inst,
  size = 'md'
}) => {
  const { accentConfig } = useTheme();
  const [imgError, setImgError] = useState(false);
  const dim = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';

  if (inst.logoSlug && !imgError) {
    return (
      <div
        className={`${dim} rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1.5 shrink-0 shadow-xs overflow-hidden`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://www.medevo.com.br/assets/pulso/institutions/${inst.logoSlug}-192.webp`}
          alt={inst.shortName}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`${dim} rounded-xl flex items-center justify-center font-heading font-black text-xs shrink-0 shadow-xs uppercase tracking-tighter`}
      style={{
        backgroundColor: accentConfig.bgRgba,
        color: accentConfig.primaryHex
      }}
    >
      {inst.shortName.slice(0, 3)}
    </div>
  );
};

export const OfficialExams: React.FC<OfficialExamsProps> = ({ onStartExam }) => {
  const { accentConfig } = useTheme();

  // Estados principais de navegação
  const [selectedModality, setSelectedModality] = useState<OfficialExamModalityKey>('acesso_direto');
  const [selectedInstitution, setSelectedInstitution] = useState<OfficialInstitution | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedExam, setSelectedExam] = useState<OfficialExamItem | null>(null);

  // Estados de busca e filtros
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('Todos');
  const [visibleCount, setVisibleCount] = useState<number>(36);

  // Dados do catálogo
  const catalogStats = useMemo(() => getCatalogStats(), []);
  const modalities = useMemo(() => getExamModalities(), []);
  const featuredInstitutions = useMemo(() => getFeaturedInstitutions(), []);

  // Lista de estados para o filtro
  const availableStates = useMemo(() => {
    return ['Todos', ...getAvailableStates(selectedModality)];
  }, [selectedModality]);

  // Instituições filtradas para a listagem (busca pesquisa apenas nas instituições)
  const filteredInstitutions = useMemo(() => {
    return getInstitutions({
      modality: selectedModality,
      search: searchQuery,
      state: selectedState
    });
  }, [selectedModality, searchQuery, selectedState]);

  // Anos disponíveis para a instituição selecionada
  const availableYears = useMemo(() => {
    if (!selectedInstitution) return [];
    return getYearsForInstitution(selectedInstitution.id, selectedModality);
  }, [selectedInstitution, selectedModality]);

  // Ano ativo derivado (sem setState síncrono em useEffect)
  const activeYear = useMemo(() => {
    if (selectedYear && availableYears.some((y) => y.year === selectedYear)) {
      return selectedYear;
    }
    return availableYears[0]?.year ?? null;
  }, [selectedYear, availableYears]);

  // Cadernos do ano ativo
  const activeBooklets = useMemo(() => {
    if (!selectedInstitution || !activeYear) return [];
    return getBookletsForInstitutionAndYear(
      selectedInstitution.id,
      activeYear,
      selectedModality
    );
  }, [selectedInstitution, activeYear, selectedModality]);

  // Resetar seleção para voltar à listagem de instituições
  const handleResetToInstitutions = () => {
    setSelectedInstitution(null);
    setSelectedYear(null);
    setSelectedExam(null);
  };

  const handleSelectInstitution = (inst: OfficialInstitution) => {
    setSelectedInstitution(inst);
    setSelectedYear(null);
    setSelectedExam(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. CABEÇALHO BENTO CARD UNIFICADO */}
      <div className="bento-card bg-white dark:bg-[#070d18] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
              style={{
                backgroundColor: accentConfig.bgRgba,
                color: accentConfig.primaryHex
              }}
            >
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Provas Oficiais na Íntegra
              </h1>
            </div>
          </div>

          {/* Badges de Métricas Globais com Alto Contraste no Modo Escuro */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80">
              {catalogStats.totalInstitutions} Instituições
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80">
              {catalogStats.totalExams.toLocaleString('pt-BR')} Cadernos
            </span>
          </div>
        </div>

        {/* 2. ABAS DE MODALIDADE ESTILO PILL */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800/60">
          {modalities.map((m) => {
            const isSelected = selectedModality === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedModality(m.id);
                  setSelectedInstitution(null);
                  setSelectedYear(null);
                  setSelectedExam(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                style={{
                  backgroundColor: isSelected ? accentConfig.primaryHex : undefined
                }}
              >
                <span>{m.title}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {m.examsCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. BARRA DE PESQUISA & ATALHOS RÁPIDOS */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length > 0 && selectedInstitution) {
                    setSelectedInstitution(null);
                    setSelectedYear(null);
                    setSelectedExam(null);
                  }
                }}
                placeholder="Busque por instituição ou sigla (Ex.: USP, UNICAMP, ENARE, SUS-SP, AMRIGS)..."
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>Estado:</span>
              </div>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
              >
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chips de Acesso Rápido para as Bancas mais procuradas */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Populares:
            </span>
            {featuredInstitutions.map((feat) => (
              <button
                key={feat.id}
                type="button"
                onClick={() => handleSelectInstitution(feat)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                  selectedInstitution?.id === feat.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/10'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {feat.shortName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CENÁRIO A: NAVEGAÇÃO DETALHADA DA INSTITUIÇÃO SELECIONADA */}
      {/* ========================================================================= */}
      {selectedInstitution ? (
        <div className="space-y-6">
          {/* Trilha / Breadcrumbs com Botão Voltar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#070d18] border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetToInstitutions}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Todas as Instituições</span>
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Modalidade:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">
                  {selectedModality === 'todas' ? 'Todas as Provas' : selectedModality.replace('_', ' ')}
                </span>
                <span className="text-slate-400">›</span>
                <span
                  className="font-black"
                  style={{ color: accentConfig.primaryHex }}
                >
                  {selectedInstitution.shortName}
                </span>
                {activeYear && (
                  <>
                    <span className="text-slate-400">›</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {activeYear}
                    </span>
                  </>
                )}
              </div>
            </div>

            {selectedExam && (
              <button
                type="button"
                onClick={() => setSelectedExam(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Trocar Caderno
              </button>
            )}
          </div>

          {/* Banner Resumo da Instituição */}
          <div className="bento-card bg-white dark:bg-[#070d18] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <InstitutionLogo inst={selectedInstitution} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                    {selectedInstitution.shortName}
                  </h2>
                  {selectedInstitution.state && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {selectedInstitution.state}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedInstitution.name}
                </p>
              </div>
            </div>

            {/* Badges estilizados com alto contraste no modo escuro */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80">
                {selectedInstitution.modalityYearsCount ?? selectedInstitution.years.length} Anos Disponíveis
              </span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80">
                {selectedInstitution.modalityExamCount ?? selectedInstitution.examCount} Cadernos
              </span>
            </div>
          </div>

          {/* Seletor de Anos Horizontal */}
          <div className="space-y-2">
            <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white px-1">
              Selecione o Ano da Prova
            </h3>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {availableYears.map((y) => {
                const isActive = activeYear === y.year;
                return (
                  <button
                    key={y.year}
                    type="button"
                    onClick={() => {
                      setSelectedYear(y.year);
                      setSelectedExam(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-mono font-bold text-xs transition-all cursor-pointer shrink-0 border ${
                      isActive
                        ? 'text-white shadow-xs border-transparent'
                        : 'bg-white dark:bg-[#070d18] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                    style={{
                      backgroundColor: isActive ? accentConfig.primaryHex : undefined
                    }}
                  >
                    <span className="text-sm font-black">{y.year}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      {y.examsCount} {y.examsCount === 1 ? 'caderno' : 'cadernos'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grade de Cadernos do Ano Selecionado */}
          {activeYear && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                  Cadernos Oficiais • {activeYear} ({activeBooklets.length})
                </h3>
                <span className="text-xs text-slate-400">
                  Selecione o caderno para iniciar
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBooklets.map((exam) => {
                  const isSelected = selectedExam?.id === exam.id;
                  const bookletLabel = exam.booklet
                    ? `Caderno ${exam.booklet}`
                    : exam.assessmentType || 'Caderno Geral Oficial';

                  return (
                    <div
                      key={exam.id}
                      className={`bento-card bg-white dark:bg-[#070d18] border rounded-3xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs ${
                        isSelected
                          ? 'ring-2 ring-blue-500 border-transparent shadow-md'
                          : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-heading font-black text-base text-slate-900 dark:text-white">
                            {selectedInstitution.shortName} • {bookletLabel}
                          </h4>
                        </div>

                        {/* Metadados limpos sem anuladas e sem alertas */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {exam.questionCount} questões
                          </span>
                          <span>•</span>
                          <span>Objetiva</span>
                        </div>
                      </div>

                      {/* Botões de Ação Imediata com Estilo Escuro e Alto Contraste */}
                      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <button
                          type="button"
                          onClick={() =>
                            onStartExam(
                              selectedInstitution.shortName,
                              exam.year,
                              selectedInstitution.name,
                              exam,
                              'exam'
                            )
                          }
                          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold text-white transition-all shadow-xs hover:opacity-95 cursor-pointer"
                          style={{ backgroundColor: accentConfig.primaryHex }}
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Modo Prova</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onStartExam(
                              selectedInstitution.shortName,
                              exam.year,
                              selectedInstitution.name,
                              exam,
                              'study'
                            )
                          }
                          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Estudo Comentado</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* CENÁRIO B: GRADE DE INSTITUIÇÕES (BUSCA FILTRA APENAS AQUI) */
        /* ========================================================================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white">
              Instituições Médicas ({filteredInstitutions.length})
            </h2>
            <span className="text-xs text-slate-400">
              Ordenadas por maior volume de provas
            </span>
          </div>

          {filteredInstitutions.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {filteredInstitutions.slice(0, visibleCount).map((inst) => (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => handleSelectInstitution(inst)}
                    className="bento-card bg-white dark:bg-[#070d18] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-4 sm:p-5 transition-all duration-200 text-left flex items-center justify-between gap-3 group cursor-pointer hover:shadow-md"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <InstitutionLogo inst={inst} />
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors truncate">
                            {inst.shortName}
                          </h3>
                          {inst.state && (
                            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {inst.state}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {inst.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pt-0.5">
                          {inst.modalityYearsCount ?? inst.years.length} anos • {inst.modalityExamCount ?? inst.examCount} cadernos
                        </p>
                      </div>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Botão para carregar mais se houver mais resultados */}
              {filteredInstitutions.length > visibleCount && (
                <div className="text-center pt-3">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 36)}
                    className="px-6 py-2.5 rounded-2xl bg-white dark:bg-[#070d18] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shadow-xs"
                  >
                    Ver mais instituições ({filteredInstitutions.length - visibleCount} restantes)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bento-card bg-white dark:bg-[#070d18] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-10 text-center space-y-2">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                Nenhuma instituição encontrada
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tente buscar por outro termo ou alterar o filtro de estado.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
