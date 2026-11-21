'use client';

import React from 'react';
import { Search, Flame, CheckCircle2 } from 'lucide-react';
import {
  EnrichedFocusWithIncidence,
  SPECIALTY_COLORS
} from '@/services/examIncidenceService';

export interface DayContentFocoListProps {
  filteredFoci: EnrichedFocusWithIncidence[];
  selectedFoco: EnrichedFocusWithIncidence | null;
  onSelectFoco: (foco: EnrichedFocusWithIncidence) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  specialties: string[];
  selectedSpecialty: string;
  onSelectSpecialty: (esp: string) => void;
}

export const DayContentFocoList: React.FC<DayContentFocoListProps> = ({
  filteredFoci,
  selectedFoco,
  onSelectFoco,
  searchQuery,
  onSearchChange,
  specialties,
  selectedSpecialty,
  onSelectSpecialty
}) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
        1. Selecione o Conteúdo (Foco) a Estudar:
      </label>

      {/* Busca rápida */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar entre os 786 focos (ex: asma, HAS, apendicite)..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      {/* Filtros rápidos por Especialidade */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 text-xs">
        <button
          type="button"
          onClick={() => onSelectSpecialty('all')}
          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all ${
            selectedSpecialty === 'all'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
          }`}
        >
          Todas Áreas
        </button>
        {specialties.map((esp) => (
          <button
            key={esp}
            type="button"
            onClick={() => onSelectSpecialty(esp)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all border ${
              selectedSpecialty === esp
                ? 'border-transparent text-white font-bold'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            style={{
              backgroundColor: selectedSpecialty === esp ? SPECIALTY_COLORS[esp] || '#8b5cf6' : undefined
            }}
          >
            {esp}
          </button>
        ))}
      </div>

      {/* Lista Rolável de Focos */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden max-h-[190px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900">
        {filteredFoci.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
            Nenhum foco encontrado com os termos digitados.
          </div>
        ) : (
          filteredFoci.slice(0, 45).map((foco) => {
            const isSelected = selectedFoco?.focusKey === foco.focusKey;
            return (
              <div
                key={foco.focusKey}
                role="button"
                tabIndex={0}
                onClick={() => onSelectFoco(foco)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectFoco(foco);
                  }
                }}
                className={`p-2.5 px-3 flex items-center justify-between gap-2.5 cursor-pointer text-left transition-colors select-none ${
                  isSelected
                    ? 'bg-blue-50/90 dark:bg-blue-950/40 border-l-4 border-l-blue-600'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: foco.specialtyColor }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {foco.foco}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                      {foco.especialidade} › {foco.tema}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {foco.incidence?.fireCount >= 3 && (
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      title={`Incidência ${foco.incidence.label}`}
                    >
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{foco.incidence.label}</span>
                    </span>
                  )}
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
