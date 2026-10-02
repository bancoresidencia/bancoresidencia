'use client';

import React, { useState } from 'react';
import {
  Search,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Check,
  Layers,
  Building2,
  Calendar,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  SlidersHorizontal,
  FolderTree,
  BookOpenCheck,
  X
} from 'lucide-react';
import {
  AdvancedFilterState,
  StudyModalidade,
  QuestionStatus,
  QuestionDifficulty,
  QuestionType
} from '@/types';
import {
  medevoModalidades,
  medevoHierarchy,
  medevoInstituicoes,
  medevoAnos,
  medevoTiposProva
} from '@/data/mockQuestions';
import { useTheme } from '@/context/ThemeContext';

interface AdvancedQuestionFiltersProps {
  filters: AdvancedFilterState;
  onChange: (newFilters: AdvancedFilterState) => void;
  onReset: () => void;
  totalAvailable: number;
  totalFiltered: number;
  onCreateListFromFilter: () => void;
}

export const AdvancedQuestionFilters: React.FC<AdvancedQuestionFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalAvailable,
  totalFiltered,
  onCreateListFromFilter
}) => {
  const { accentConfig } = useTheme();

  // Estado de expansão suave dos filtros avançados (ui-ux-pro-max)
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const mainSpecialties = [
    'Clínica Médica',
    'Cirurgia Geral',
    'Obstetrícia',
    'Ginecologia e Obstetrícia',
    'Pediatria',
    'Medicina Preventiva e Social'
  ];

  // Estados de acordeões abertos
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    modalidade: false,
    especialidades: false,
    instituicoes: false,
    anos: false,
    tipoProva: false
  });

  // Estados de expansão na árvore hierárquica (especialidade -> tema -> foco)
  const [expandedEspec, setExpandedEspec] = useState<Record<string, boolean>>({});
  const [expandedTema, setExpandedTema] = useState<Record<string, boolean>>({});
  const [expandedFoco, setExpandedFoco] = useState<Record<string, boolean>>({});

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

  // Toggle Tipo Prova
  const toggleTipoProva = (tp: string) => {
    const next = filters.tipoProva.includes(tp)
      ? filters.tipoProva.filter((t) => t !== tp)
      : [...filters.tipoProva, tp];
    onChange({ ...filters, tipoProva: next });
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

  // Filtros secundários para o botão de expansão suave (ui-ux-pro-max)
  const extraFiltersCount =
    filters.modalidades.length +
    filters.temas.length +
    filters.focos.length +
    filters.subfocos.length +
    filters.instituicoes.length +
    filters.anos.length +
    filters.tipoProva.length +
    (filters.dificuldade !== 'Todas' ? 1 : 0) +
    (filters.tipoQuestao !== 'Todas' ? 1 : 0) +
    (filters.ocultarAnuladasErro ? 1 : 0) +
    (filters.ocultarRevisadas ? 1 : 0) +
    (filters.ultimos5Anos ? 1 : 0);

  return (
    <div className="bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
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
                Pesquisa instantânea e refinamento por grande área, temas, bancas e anos
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
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Campo de Busca Rápida */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Pesquisar por palavras-chave, diagnósticos, sintomas, condutas ou código da questão..."
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

      {/* Camada Essencial 1: As 5 Grandes Áreas da Residência Médica */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            Grandes Áreas Médicas
          </span>
          {filters.especialidades.length > 0 && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, especialidades: [] })}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Limpar Áreas ({filters.especialidades.length})
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {mainSpecialties.map((esp) => {
            const isSelected = filters.especialidades.includes(esp);
            return (
              <button
                key={esp}
                type="button"
                onClick={() => toggleEspecialidade(esp)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-xs ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 transition-colors ${
                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span>{esp}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Camada Essencial 2: Status de Resolução */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Status de Resolução
        </label>
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map((st) => {
            const isSelected = filters.status === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => onChange({ ...filters, status: st })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-xs ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Botão de Expansão Suave com Progressive Disclosure (ui-ux-pro-max) */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-700 transition-all cursor-pointer shadow-xs group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Filtros Avançados & Específicos
              </span>
              {extraFiltersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-xs">
                  {extraFiltersCount} {extraFiltersCount === 1 ? 'filtro extra' : 'filtros extras'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Subtemas clínicos, bancas, instituições, anos de prova, tipo de questão e opções especiais
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
          <span>{isExpanded ? 'Recolher Filtros' : 'Expandir Mais Filtros'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Acordeões e Seções Detalhadas que Abrem Suavemente */}
      {isExpanded && (
        <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 transition-all duration-300">
          <div className="space-y-3">
            {/* 1. MODALIDADE DE ESTUDO */}
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
            {openSections.modalidade ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.modalidade && (
            <div className="p-4 pt-1 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {medevoModalidades.map((mod) => {
                const isSelected = filters.modalidades.includes(mod);
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => toggleModalidade(mod)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-200 font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 transition-colors ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="truncate">{mod}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. ESPECIALIDADES, TEMAS, FOCOS E SUBFOCOS (Árvore Hierárquica Completa) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection('especialidades')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-500" />
              <span>Especialidades, Temas, Focos e Subfocos</span>
              {(filters.especialidades.length > 0 || filters.temas.length > 0 || filters.focos.length > 0 || filters.subfocos.length > 0) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold">
                  {filters.especialidades.length + filters.temas.length + filters.focos.length + filters.subfocos.length} níveis ativos
                </span>
              )}
            </div>
            {openSections.especialidades ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.especialidades && (
            <div className="p-4 pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-3 max-h-96 overflow-y-auto">
              {medevoHierarchy.map((esp) => {
                const isEspOpen = expandedEspec[esp.especialidade];
                const isEspSelected = filters.especialidades.includes(esp.especialidade);

                return (
                  <div key={esp.especialidade} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900/50 space-y-2">
                    {/* Linha Especialidade */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedEspec((prev) => ({ ...prev, [esp.especialidade]: !prev[esp.especialidade] }))}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        >
                          {isEspOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleEspecialidade(esp.especialidade)}
                          className={`text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                            isEspSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                              isEspSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                            }`}
                          >
                            {isEspSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span>{esp.especialidade}</span>
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">{esp.temas.length} temas</span>
                    </div>

                    {/* Temas da Especialidade */}
                    {isEspOpen && (
                      <div className="pl-6 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                        {esp.temas.map((tem) => {
                          const isTemaOpen = expandedTema[tem.tema];
                          const isTemaSelected = filters.temas.includes(tem.tema);

                          return (
                            <div key={tem.tema} className="space-y-1.5 pt-1">
                              {/* Linha Tema */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedTema((prev) => ({ ...prev, [tem.tema]: !prev[tem.tema] }))}
                                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                  >
                                    {isTemaOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleTema(tem.tema)}
                                    className={`text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                                      isTemaSelected ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 font-medium'
                                    }`}
                                  >
                                    <div
                                      className={`w-3 h-3 rounded flex items-center justify-center border ${
                                        isTemaSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                                      }`}
                                    >
                                      {isTemaSelected && <Check className="w-2 h-2 stroke-[3]" />}
                                    </div>
                                    <span>{tem.tema}</span>
                                  </button>
                                </div>
                                <span className="text-[10px] text-slate-400">{tem.focos.length} focos</span>
                              </div>

                              {/* Focos do Tema */}
                              {isTemaOpen && (
                                <div className="pl-6 space-y-1.5 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                                  {tem.focos.map((foc) => {
                                    const isFocoOpen = expandedFoco[foc.foco];
                                    const isFocoSelected = filters.focos.includes(foc.foco);

                                    return (
                                      <div key={foc.foco} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() => setExpandedFoco((prev) => ({ ...prev, [foc.foco]: !prev[foc.foco] }))}
                                              className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                            >
                                              {isFocoOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => toggleFoco(foc.foco)}
                                              className={`text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                                                isFocoSelected ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-600 dark:text-slate-400'
                                              }`}
                                            >
                                              <div
                                                className={`w-3 h-3 rounded flex items-center justify-center border ${
                                                  isFocoSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                                                }`}
                                              >
                                                {isFocoSelected && <Check className="w-2 h-2 stroke-[3]" />}
                                              </div>
                                              <span>{foc.foco}</span>
                                            </button>
                                          </div>
                                          <span className="text-[10px] text-slate-400">{foc.subfocos.length} subfocos</span>
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
                                                  className={`px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer border ${
                                                    isSubSelected
                                                      ? 'bg-purple-100 dark:bg-purple-900/50 border-purple-500 text-purple-700 dark:text-purple-200 font-bold'
                                                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                                                  }`}
                                                >
                                                  {sub}
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
              })}
            </div>
          )}
        </div>

        {/* 3. INSTITUIÇÕES / BANCAS */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection('instituicoes')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-500" />
              <span>Instituições e Bancas Oficiais</span>
              {filters.instituicoes.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold">
                  {filters.instituicoes.length} selecionadas
                </span>
              )}
            </div>
            {openSections.instituicoes ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.instituicoes && (
            <div className="p-4 pt-1 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {medevoInstituicoes.map((inst) => {
                const isSelected = filters.instituicoes.includes(inst);
                return (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => toggleInstituicao(inst)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-700 dark:text-purple-200 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                        isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="truncate">{inst}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. ANOS E TIPO DE PROVA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Anos */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs">
            <button
              type="button"
              onClick={() => toggleSection('anos')}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Anos de Aplicação</span>
                {filters.anos.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold">
                    {filters.anos.length} anos
                  </span>
                )}
              </div>
              {openSections.anos ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.anos && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto">
                {medevoAnos.map((ano) => {
                  const isSelected = filters.anos.includes(ano);
                  return (
                    <button
                      key={ano}
                      type="button"
                      onClick={() => toggleAno(ano)}
                      className={`p-2 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-100 dark:bg-amber-950/50 border-amber-500 text-amber-800 dark:text-amber-200 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {ano}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tipo de Prova */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/60 shadow-xs">
            <button
              type="button"
              onClick={() => toggleSection('tipoProva')}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Tipo de Prova</span>
                {filters.tipoProva.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                    {filters.tipoProva.length}
                  </span>
                )}
              </div>
              {openSections.tipoProva ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.tipoProva && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 gap-2">
                {medevoTiposProva.map((tp) => {
                  const isSelected = filters.tipoProva.includes(tp);
                  return (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => toggleTipoProva(tp)}
                      className={`p-2.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer border flex items-center gap-2 ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-200 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                          isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="truncate">{tp}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. OPÇÕES DA SESSÃO */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Opções da Sessão de Resolução
        </h3>

        {/* Status da Questão */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Status da Questão
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {statusOptions.map((opt) => {
              const isSelected = filters.status === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange({ ...filters, status: opt })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dificuldade e Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Nível de Dificuldade
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {difficultyOptions.map((diff) => {
                const isSelected = filters.dificuldade === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => onChange({ ...filters, dificuldade: diff })}
                    className={`px-2 py-2 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer border truncate ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Tipo de Questão
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {typeOptions.map((tp) => {
                const isSelected = filters.tipoQuestao === tp;
                return (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => onChange({ ...filters, tipoQuestao: tp })}
                    className={`px-2 py-2 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer border truncate ${
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
        </div>

        {/* Três Switches Extras */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
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
            <span>Ocultar anuladas/erro</span>
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
            <span>Ocultar revisadas</span>
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
            <span>Últimos 5 anos (2020-2025)</span>
            {filters.ultimos5Anos ? (
              <ToggleRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  )}
</div>
);
};
