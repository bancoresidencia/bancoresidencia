'use client';

import React from 'react';
import { Search, CheckCircle2, X, ChevronsDown, ChevronsUp } from 'lucide-react';
import { TargetInstitutionOption } from '@/types/studySchedule';
import { SPECIALTY_COLORS } from '@/services/examIncidenceService';

interface FocusChecklistHeaderProps {
  currentInstitution: string;
  onInstitutionChange: (inst: string) => void;
  availableInstitutions: TargetInstitutionOption[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedSpecialty: string;
  onSpecialtyChange: (esp: string) => void;
  specialties: string[];
  statusFilter: 'all' | 'pending' | 'studied' | 'with_revision';
  onStatusFilterChange: (st: 'all' | 'pending' | 'studied' | 'with_revision') => void;
  incidenceFilter: 'all' | 'extreme_only' | 'high_plus';
  onIncidenceFilterChange: (inc: 'all' | 'extreme_only' | 'high_plus') => void;
  stats: { total: number; studied: number; percent: number };
  isDrawer?: boolean;
  onCloseDrawer?: () => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  areAllExpanded?: boolean;
}

export const FocusChecklistHeader: React.FC<FocusChecklistHeaderProps> = ({
  currentInstitution,
  onInstitutionChange,
  availableInstitutions,
  searchQuery,
  onSearchChange,
  selectedSpecialty,
  onSpecialtyChange,
  specialties,
  statusFilter,
  onStatusFilterChange,
  incidenceFilter,
  onIncidenceFilterChange,
  stats,
  isDrawer,
  onCloseDrawer,
  onExpandAll,
  onCollapseAll,
  areAllExpanded
}) => {
  return (
    <div className="p-3 sm:p-3.5 border-b border-[var(--card-border,#e4e4e7)] dark:border-zinc-800 space-y-2.5 shrink-0 bg-white dark:bg-zinc-900">
      {/* 1. Título + Contador Compacto + Seletor de Prova */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
            Checklist de Conteúdos
          </h2>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold shrink-0">
            {stats.studied}/{stats.total} • {stats.percent}%
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Botão de Expandir / Recolher Todos os Ramos */}
          {(onExpandAll || onCollapseAll) && (
            <button
              type="button"
              onClick={areAllExpanded ? onCollapseAll : onExpandAll}
              className="p-1 px-1.5 text-[10px] font-semibold flex items-center gap-1 text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
              title={areAllExpanded ? 'Recolher todos os temas' : 'Expandir todos os temas'}
              aria-label={areAllExpanded ? 'Recolher todos' : 'Expandir todos'}
            >
              {areAllExpanded ? (
                <>
                  <ChevronsUp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Recolher</span>
                </>
              ) : (
                <>
                  <ChevronsDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Expandir</span>
                </>
              )}
            </button>
          )}

          {/* Seletor de Instituição da Prova */}
          <select
            value={currentInstitution}
            onChange={(e) => onInstitutionChange(e.target.value)}
            className="py-1 pl-2 pr-6 text-[11px] font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 cursor-pointer focus:outline-hidden"
            aria-label="Selecionar instituição de prova"
          >
            {availableInstitutions.slice(0, 30).map((inst) => (
              <option key={inst.key} value={inst.sigla}>
                {inst.sigla} {inst.popular ? '★' : ''}
              </option>
            ))}
          </select>

          {isDrawer && onCloseDrawer && (
            <button
              type="button"
              onClick={onCloseDrawer}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Fechar gaveta"
              aria-label="Fechar gaveta"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Barra de Progresso Hairline (Super Compacta) */}
      <div className="w-full h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
          style={{ width: `${stats.percent}%` }}
        />
      </div>

      {/* 3. Campo de Busca Compacto */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar foco, tema ou especialidade..."
          className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
        />
      </div>

      {/* 4. Filtros em Linha Horizontal Rolável (Status + Incidência + Especialidades) */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-xs">
        {/* Status */}
        {(['all', 'pending', 'studied', 'with_revision'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => onStatusFilterChange(st)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all ${statusFilter === st
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
              : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/80'
              }`}
          >
            {st === 'all' && 'Todos'}
            {st === 'pending' && 'Pendentes'}
            {st === 'studied' && 'Estudados'}
            {st === 'with_revision' && 'Com Revisão'}
          </button>
        ))}

        {/* Top Incidência */}
        <button
          type="button"
          onClick={() => onIncidenceFilterChange(incidenceFilter === 'extreme_only' ? 'all' : 'extreme_only')}
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap flex items-center gap-1 border transition-all ${incidenceFilter === 'extreme_only'
            ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 border-transparent hover:bg-zinc-200/80'
            }`}
        >
          <span>🔥🔥🔥🔥 Top</span>
        </button>

        <span className="w-px h-3 bg-zinc-200 dark:bg-zinc-700 mx-0.5 shrink-0" />

        {/* Especialidades */}
        <button
          type="button"
          onClick={() => onSpecialtyChange('all')}
          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all ${selectedSpecialty === 'all'
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
        >
          Todas Áreas
        </button>
        {specialties.map((esp) => {
          const color = SPECIALTY_COLORS[esp] || '#8b5cf6';
          const isSelected = selectedSpecialty === esp;
          return (
            <button
              key={esp}
              type="button"
              onClick={() => onSpecialtyChange(esp)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all border ${isSelected
                ? 'border-transparent text-white font-bold'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              style={{
                backgroundColor: isSelected ? color : undefined
              }}
            >
              {esp}
            </button>
          );
        })}
      </div>
    </div>
  );
};
