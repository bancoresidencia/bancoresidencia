'use client';

import React, { useState } from 'react';
import {
  Filter,
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
  CheckCircle2,
  XCircle,
  HelpCircle
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
  // Estados de acordeões abertos
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    modalidade: false,
    especialidades: true,
    instituicoes: false,
    anos: false,
    tipoProva: false
  });

  // Estados de expansão na árvore hierárquica (especialidade -> tema -> foco)
  const [expandedEspec, setExpandedEspec] = useState<Record<string, boolean>>({
    'Clínica Médica': true
  });
  const [expandedTema, setExpandedTema] = useState<Record<string, boolean>>({
    'Cardiologia': true
  });
  const [expandedFoco, setExpandedFoco] = useState<Record<string, boolean>>({
    'Hipertensão Arterial Sistêmica': true
  });

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
    (filters.ultimos5Anos ? 1 : 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Topo: Busca Textual + Contadores + Limpar + Criar Lista */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-bold text-white">Filtrar Questões de Residência</h2>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                {activeCount} {activeCount === 1 ? 'ativo' : 'ativos'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Filtre por modalidade, hierarquia clínica (tema, foco e subfoco), instituição, anos e opções de sessão
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Questões no filtro:</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">
              {totalFiltered.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-400">/ {totalAvailable.toLocaleString('pt-BR')}</span>
            </span>
          </div>

          <button
            onClick={onCreateListFromFilter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span>Criar Lista Deste Filtro</span>
          </button>

          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Campo de Busca Rápida por Enunciado e Termos */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Pesquisar por palavras-chave, diagnósticos, sintomas, medicamentos..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Acordeões de Filtros Principais */}
      <div className="space-y-3">
        {/* 1. MODALIDADE DE ESTUDO (Extraído de MedEvo) */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          <button
            type="button"
            onClick={() => toggleSection('modalidade')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-white hover:bg-slate-800/40 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Modalidade de Estudo</span>
              {filters.modalidades.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                  {filters.modalidades.length} selecionadas
                </span>
              )}
            </div>
            {openSections.modalidade ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.modalidade && (
            <div className="p-4 pt-1 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {medevoModalidades.map((mod) => {
                const isSelected = filters.modalidades.includes(mod);
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => toggleModalidade(mod)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                        isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 bg-slate-950'
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
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          <button
            type="button"
            onClick={() => toggleSection('especialidades')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-white hover:bg-slate-800/40 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-400" />
              <span>Especialidades, Temas, Focos e Subfocos</span>
              {(filters.especialidades.length > 0 || filters.temas.length > 0 || filters.focos.length > 0 || filters.subfocos.length > 0) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  {filters.especialidades.length + filters.temas.length + filters.focos.length + filters.subfocos.length} níveis ativos
                </span>
              )}
            </div>
            {openSections.especialidades ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.especialidades && (
            <div className="p-4 pt-2 border-t border-slate-800/80 space-y-3 max-h-96 overflow-y-auto">
              {medevoHierarchy.map((esp) => {
                const isEspOpen = expandedEspec[esp.especialidade];
                const isEspSelected = filters.especialidades.includes(esp.especialidade);

                return (
                  <div key={esp.especialidade} className="border border-slate-800/80 rounded-lg p-2.5 bg-slate-900/50 space-y-2">
                    {/* Linha Especialidade */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedEspec((prev) => ({ ...prev, [esp.especialidade]: !prev[esp.especialidade] }))}
                          className="text-slate-400 hover:text-white"
                        >
                          {isEspOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleEspecialidade(esp.especialidade)}
                          className={`text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            isEspSelected ? 'text-emerald-400' : 'text-slate-200 hover:text-white'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                              isEspSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-950'
                            }`}
                          >
                            {isEspSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span>{esp.especialidade}</span>
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500">{esp.temas.length} temas</span>
                    </div>

                    {/* Temas da Especialidade */}
                    {isEspOpen && (
                      <div className="pl-6 space-y-2 border-l border-slate-800 ml-2">
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
                                    className="text-slate-400 hover:text-white"
                                  >
                                    {isTemaOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleTema(tem.tema)}
                                    className={`text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                      isTemaSelected ? 'text-blue-400' : 'text-slate-300 hover:text-white'
                                    }`}
                                  >
                                    <div
                                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                        isTemaSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 bg-slate-950'
                                      }`}
                                    >
                                      {isTemaSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                    <span>{tem.tema}</span>
                                  </button>
                                </div>
                                <span className="text-[10px] text-slate-500">{tem.focos.length} focos</span>
                              </div>

                              {/* Focos e Subfocos */}
                              {isTemaOpen && (
                                <div className="pl-5 space-y-1.5 border-l border-slate-800/80 ml-2">
                                  {tem.focos.map((foc) => {
                                    const isFocoOpen = expandedFoco[foc.foco];
                                    const isFocoSelected = filters.focos.includes(foc.foco);

                                    return (
                                      <div key={foc.foco} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              type="button"
                                              onClick={() => setExpandedFoco((prev) => ({ ...prev, [foc.foco]: !prev[foc.foco] }))}
                                              className="text-slate-500 hover:text-white"
                                            >
                                              {isFocoOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => toggleFoco(foc.foco)}
                                              className={`text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                                                isFocoSelected ? 'text-purple-300' : 'text-slate-400 hover:text-slate-200'
                                              }`}
                                            >
                                              <div
                                                className={`w-3 h-3 rounded flex items-center justify-center border ${
                                                  isFocoSelected ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-700 bg-slate-950'
                                                }`}
                                              >
                                                {isFocoSelected && <Check className="w-2 h-2 stroke-[3]" />}
                                              </div>
                                              <span>{foc.foco}</span>
                                            </button>
                                          </div>
                                          <span className="text-[9px] text-slate-600">{foc.subfocos.length} subfocos</span>
                                        </div>

                                        {/* Subfocos */}
                                        {isFocoOpen && (
                                          <div className="pl-4 space-y-1 border-l border-slate-800/60 ml-1.5">
                                            {foc.subfocos.map((sub) => {
                                              const isSubSelected = filters.subfocos.includes(sub);
                                              return (
                                                <button
                                                  key={sub}
                                                  type="button"
                                                  onClick={() => toggleSubfoco(sub)}
                                                  className={`flex items-center gap-1.5 text-[11px] text-left transition-colors cursor-pointer py-0.5 ${
                                                    isSubSelected ? 'text-amber-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
                                                  }`}
                                                >
                                                  <div
                                                    className={`w-3 h-3 rounded flex items-center justify-center border shrink-0 ${
                                                      isSubSelected ? 'bg-amber-600 border-amber-500 text-white' : 'border-slate-800 bg-slate-950'
                                                    }`}
                                                  >
                                                    {isSubSelected && <Check className="w-2 h-2 stroke-[3]" />}
                                                  </div>
                                                  <span>{sub}</span>
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
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          <button
            type="button"
            onClick={() => toggleSection('instituicoes')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-white hover:bg-slate-800/40 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>Instituições e Bancas</span>
              {filters.instituicoes.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                  {filters.instituicoes.length} selecionadas
                </span>
              )}
            </div>
            {openSections.instituicoes ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {openSections.instituicoes && (
            <div className="p-4 pt-1 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {medevoInstituicoes.map((inst) => {
                const isSelected = filters.instituicoes.includes(inst);
                return (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => toggleInstituicao(inst)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                        isSelected ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-700 bg-slate-950'
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
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
            <button
              type="button"
              onClick={() => toggleSection('anos')}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-white hover:bg-slate-800/40 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Anos de Aplicação</span>
                {filters.anos.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    {filters.anos.length} anos
                  </span>
                )}
              </div>
              {openSections.anos ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.anos && (
              <div className="p-3 border-t border-slate-800/80 grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto">
                {medevoAnos.map((ano) => {
                  const isSelected = filters.anos.includes(ano);
                  return (
                    <button
                      key={ano}
                      type="button"
                      onClick={() => toggleAno(ano)}
                      className={`p-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-600/20 border-amber-500 text-amber-200 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
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
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
            <button
              type="button"
              onClick={() => toggleSection('tipoProva')}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-white hover:bg-slate-800/40 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Tipo de Prova</span>
                {filters.tipoProva.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                    {filters.tipoProva.length}
                  </span>
                )}
              </div>
              {openSections.tipoProva ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.tipoProva && (
              <div className="p-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                {medevoTiposProva.map((tp) => {
                  const isSelected = filters.tipoProva.includes(tp);
                  return (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => toggleTipoProva(tp)}
                      className={`p-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer border flex items-center gap-2 ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                          isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 bg-slate-950'
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

      {/* 5. OPÇÕES DA SESSÃO: STATUS DA QUESTÃO, DIFICULDADE, TIPO E SWITCHES */}
      <div className="pt-4 border-t border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Opções da Sessão de Estudo
        </h3>

        {/* Status da Questão (Todas, Não vistas, Resolvidas, Acertadas, Erradas, Ainda não acertadas) */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
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
                  className={`px-3 py-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nível de Dificuldade e Tipo de Questão */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
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
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-colors cursor-pointer border truncate ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
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
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-colors cursor-pointer border truncate ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-500'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {tp}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Três Switches Extras: Ocultar Anuladas/Erro, Ocultar Revisadas e Últimos 5 Anos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Switch: Ocultar anuladas/erro */}
          <button
            type="button"
            onClick={() => onChange({ ...filters, ocultarAnuladasErro: !filters.ocultarAnuladasErro })}
            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors cursor-pointer ${
              filters.ocultarAnuladasErro
                ? 'bg-blue-950/40 border-blue-500 text-blue-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <span>Ocultar anuladas/erro</span>
            {filters.ocultarAnuladasErro ? (
              <ToggleRight className="w-5 h-5 text-blue-400" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-slate-500" />
            )}
          </button>

          {/* Switch: Ocultar revisadas */}
          <button
            type="button"
            onClick={() => onChange({ ...filters, ocultarRevisadas: !filters.ocultarRevisadas })}
            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors cursor-pointer ${
              filters.ocultarRevisadas
                ? 'bg-blue-950/40 border-blue-500 text-blue-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <span>Ocultar revisadas</span>
            {filters.ocultarRevisadas ? (
              <ToggleRight className="w-5 h-5 text-blue-400" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-slate-500" />
            )}
          </button>

          {/* Switch: Últimos 5 anos */}
          <button
            type="button"
            onClick={() => onChange({ ...filters, ultimos5Anos: !filters.ultimos5Anos })}
            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors cursor-pointer ${
              filters.ultimos5Anos
                ? 'bg-blue-950/40 border-blue-500 text-blue-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <span>Últimos 5 anos (2020-2025)</span>
            {filters.ultimos5Anos ? (
              <ToggleRight className="w-5 h-5 text-blue-400" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
