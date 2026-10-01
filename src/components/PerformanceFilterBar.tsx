'use client';

import React, { useState } from 'react';
import { Filter, Calendar, Building2, BookOpen, Layers, ChevronDown, Check } from 'lucide-react';
import { PerformanceFilterState, Modalidade, PeriodFilter } from '@/types';
import { mockInstitutionsList, mockBancas } from '@/data/mockQuestions';

interface PerformanceFilterBarProps {
  filters: PerformanceFilterState;
  onChange: (newFilters: PerformanceFilterState) => void;
  onReset: () => void;
}

export const PerformanceFilterBar: React.FC<PerformanceFilterBarProps> = ({
  filters,
  onChange,
  onReset
}) => {
  const [isOpenInstitutions, setIsOpenInstitutions] = useState(false);

  const toggleInstitution = (inst: string) => {
    let next: string[];
    if (filters.institutions.includes(inst)) {
      next = filters.institutions.filter((item) => item !== inst);
    } else {
      next = [...filters.institutions, inst];
    }
    onChange({ ...filters, institutions: next });
  };

  const clearInstitutions = () => {
    onChange({ ...filters, institutions: [] });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-500" />
          <h2 className="text-sm md:text-base font-semibold text-white">Filtros de Desempenho & Ranking</h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 font-medium">
            Modalidade: {filters.modalidade}
          </span>
          <button
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Redefinir Padrões
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Modalidade */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            Modalidade
          </label>
          <select
            value={filters.modalidade}
            onChange={(e) => onChange({ ...filters, modalidade: e.target.value as Modalidade })}
            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Residência">Residência Médica</option>
            <option value="Revalida">Revalida</option>
            <option value="Graduação / Internato">Graduação / Internato</option>
          </select>
        </div>

        {/* Período (Padrão: últimos 6 meses, com semestres 2026.1 e 2026.2) */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            Período de Análise
          </label>
          <select
            value={filters.period}
            onChange={(e) => onChange({ ...filters, period: e.target.value as PeriodFilter })}
            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="6m">Últimos 6 meses (Padrão)</option>
            <option value="2026.1">Semestre 2026.1 (Jan - Jun)</option>
            <option value="2026.2">Semestre 2026.2 (Jul - Dez)</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="all">Todo o Histórico</option>
          </select>
        </div>

        {/* Instituição - Caixa de Seleção Múltipla */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              Instituições ({filters.institutions.length === 0 ? 'Todas' : `${filters.institutions.length} sel.`})
            </span>
            {filters.institutions.length > 0 && (
              <button
                type="button"
                onClick={clearInstitutions}
                className="text-[11px] text-blue-400 hover:underline cursor-pointer"
              >
                Limpar
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={() => setIsOpenInstitutions(!isOpenInstitutions)}
            className="w-full bg-slate-950 border border-slate-800 text-sm text-left text-white rounded-lg px-3 py-2.5 flex items-center justify-between focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <span className="truncate text-xs">
              {filters.institutions.length === 0
                ? 'Todas as Instituições'
                : filters.institutions.join(', ')}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </button>

          {/* Dropdown com checkboxes */}
          {isOpenInstitutions && (
            <div className="absolute z-30 mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg shadow-xl p-2 max-h-56 overflow-y-auto space-y-1">
              {mockInstitutionsList.map((inst) => {
                const isChecked = filters.institutions.includes(inst);
                return (
                  <label
                    key={inst}
                    onClick={() => toggleInstitution(inst)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-slate-900 cursor-pointer text-xs text-slate-200"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{inst}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Banca */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            Banca Examinadora
          </label>
          <select
            value={filters.banca}
            onChange={(e) => onChange({ ...filters, banca: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {mockBancas.map((banca) => (
              <option key={banca} value={banca}>{banca}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
