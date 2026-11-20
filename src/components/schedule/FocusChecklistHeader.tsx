'use client';

import React from 'react';
import { Search, CheckCircle2, X } from 'lucide-react';
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
  onCloseDrawer
}) => {
  return (
    <div className="p-4 sm:p-5 border-b border-[var(--card-border,#e4e4e7)] dark:border-zinc-800 space-y-4 shrink-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Checklist de Focos & Incidência
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Acompanhe seu avanço e a taxa de acertos em cada conteúdo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Instituição da Prova */}
          <div className="relative">
            <select
              value={currentInstitution}
              onChange={(e) => onInstitutionChange(e.target.value)}
              className="py-1.5 pl-3 pr-8 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 cursor-pointer focus:outline-hidden"
              aria-label="Selecionar instituição de prova"
            >
              {availableInstitutions.slice(0, 30).map((inst) => (
                <option key={inst.key} value={inst.sigla}>
                  {inst.sigla} {inst.popular ? '★' : ''}
                </option>
              ))}
            </select>
          </div>

          {isDrawer && onCloseDrawer && (
            <button
              type="button"
              onClick={onCloseDrawer}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Fechar gaveta"
              aria-label="Fechar gaveta"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Barra de Progresso do Checklist */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-zinc-600 dark:text-zinc-400">
            Progresso do Acervo: <strong className="text-zinc-900 dark:text-zinc-100">{stats.studied}</strong> de {stats.total} Focos
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {stats.percent}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
      </div>

      {/* Campo de Busca e Filtros Rápidos */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por foco, tema ou especialidade..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
          />
        </div>

        {/* Filtros em Pílulas */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(['all', 'pending', 'studied', 'with_revision'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStatusFilterChange(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/80'
              }`}
            >
              {st === 'all' && 'Todos'}
              {st === 'pending' && 'Pendentes'}
              {st === 'studied' && 'Estudados'}
              {st === 'with_revision' && 'Com Revisão'}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onIncidenceFilterChange(incidenceFilter === 'extreme_only' ? 'all' : 'extreme_only')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-all ${
              incidenceFilter === 'extreme_only'
                ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 border-transparent'
            }`}
          >
            <span>🔥🔥🔥🔥</span>
            <span>Top Incidência</span>
          </button>
        </div>

        {/* Abas de Especialidades */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => onSpecialtyChange('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
              selectedSpecialty === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Todas as Áreas
          </button>
          {specialties.map((esp) => {
            const color = SPECIALTY_COLORS[esp] || '#8b5cf6';
            const isSelected = selectedSpecialty === esp;
            return (
              <button
                key={esp}
                type="button"
                onClick={() => onSpecialtyChange(esp)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border ${
                  isSelected
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
    </div>
  );
};
