'use client';

import React, { useState } from 'react';
import { Filter, Calendar, Building2, BookOpen, Layers, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { PerformanceFilterState, Modalidade, PeriodFilter } from '@/types';
import { mockInstitutionsList, mockBancas } from '@/data/mockQuestions';
import { useTheme } from '@/context/ThemeContext';

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
  const { accentConfig } = useTheme();
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
    <div className="bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
          >
            <Filter className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Filtros de Desempenho & Métricas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalize a amostra para cálculo do percentil e estatísticas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className="text-xs px-3 py-1 rounded-full font-bold border"
            style={{
              backgroundColor: accentConfig.bgRgba,
              borderColor: accentConfig.borderRgba,
              color: accentConfig.primaryHex
            }}
          >
            {filters.modalidade}
          </span>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Redefinir</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Modalidade */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            Modalidade
          </label>
          <select
            value={filters.modalidade}
            onChange={(e) => onChange({ ...filters, modalidade: e.target.value as Modalidade })}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            <option value="Residência">Residência Médica</option>
            <option value="Revalida">Revalida</option>
            <option value="Graduação / Internato">Graduação / Internato</option>
          </select>
        </div>

        {/* Período */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            Período de Análise
          </label>
          <select
            value={filters.period}
            onChange={(e) => onChange({ ...filters, period: e.target.value as PeriodFilter })}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="mes">Mês Atual</option>
            <option value="6m">Últimos 6 meses (Padrão)</option>
            <option value="2026.1">Semestre 2026.1 (Jan - Jun)</option>
            <option value="2026.2">Semestre 2026.2 (Jul - Dez)</option>
            <option value="all">Todo o Histórico</option>
          </select>
        </div>

        {/* Instituição */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-500" />
              Instituições ({filters.institutions.length === 0 ? 'Todas' : `${filters.institutions.length}`})
            </span>
            {filters.institutions.length > 0 && (
              <button
                type="button"
                onClick={clearInstitutions}
                className="text-[11px] font-bold text-blue-500 hover:underline cursor-pointer"
              >
                Limpar
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={() => setIsOpenInstitutions(!isOpenInstitutions)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-left text-slate-900 dark:text-white font-medium rounded-xl px-3 py-2.5 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
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
            <div className="absolute z-30 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 max-h-56 overflow-y-auto space-y-1">
              {mockInstitutionsList.map((inst) => {
                const isChecked = filters.institutions.includes(inst);
                return (
                  <label
                    key={inst}
                    onClick={() => toggleInstitution(inst)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
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
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            Banca Examinadora
          </label>
          <select
            value={filters.banca}
            onChange={(e) => onChange({ ...filters, banca: e.target.value })}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
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
