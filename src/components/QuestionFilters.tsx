'use client';

import React from 'react';
import { Filter, Search, RotateCcw } from 'lucide-react';
import { FilterState } from '@/types';
import {
  mockInstitutions,
  mockSpecialties,
  mockYears,
  mockDifficulties
} from '@/data/mockQuestions';

interface QuestionFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalFiltered: number;
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalFiltered
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-semibold text-white">Filtro de Questões</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-medium">
            {totalFiltered} {totalFiltered === 1 ? 'questão encontrada' : 'questões encontradas'}
          </span>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>
        </div>
      </div>

      {/* Busca por palavra-chave */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Pesquisar por tema, diagnóstico, enunciado ou termos clínicos..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Filtros em Grid Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Especialidade */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Especialidade (Grande Área)</label>
          <select
            value={filters.specialty}
            onChange={(e) => onFilterChange({ ...filters, specialty: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {mockSpecialties.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        {/* Instituição / Banca */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Instituição / Banca</label>
          <select
            value={filters.institution}
            onChange={(e) => onFilterChange({ ...filters, institution: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {mockInstitutions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        {/* Ano */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Ano da Prova</label>
          <select
            value={filters.year}
            onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {mockYears.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        {/* Dificuldade */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Dificuldade</label>
          <select
            value={filters.difficulty}
            onChange={(e) => onFilterChange({ ...filters, difficulty: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {mockDifficulties.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
