'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Filter,
  Plus,
  X,
  Play,
  FolderPlus,
  ChevronDown,
  Tag,
  Layers,
  Sparkles,
  Zap,
  BookOpen,
  Calendar,
  Star
} from 'lucide-react';
import {
  DynamicFilterCriterion,
  DynamicFilterCriterionType,
  CustomFlashcardDeck
} from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { clinicalHierarchy } from '@/data/mockQuestions';

interface OriginalCardsFilterBarProps {
  activeFilters: DynamicFilterCriterion[];
  onAddFilter: (criterion: DynamicFilterCriterion) => void;
  onRemoveFilter: (id: string) => void;
  onClearFilters: () => void;
  totalCards: number;
  filteredCount: number;
  onStudyFilteredCards: () => void;
  onSaveAsDeck?: () => void;
  availableDecks: CustomFlashcardDeck[];
  availableTags: string[];
}

export const OriginalCardsFilterBar: React.FC<OriginalCardsFilterBarProps> = ({
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
  totalCards,
  filteredCount,
  onStudyFilteredCards,
  onSaveAsDeck,
  availableDecks,
  availableTags
}) => {
  const { accentConfig } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    'specialty' | 'theme' | 'deck' | 'status' | 'depth' | 'tag' | 'priority' | null
  >(null);

  const [selectedSpecForTheme, setSelectedSpecForTheme] = useState('Ginecologia');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setActiveCategory(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themesForSelectedSpec = useMemo(() => {
    const specNode = clinicalHierarchy.find(
      (s) => s.especialidade.toLowerCase() === selectedSpecForTheme.toLowerCase()
    );
    return specNode?.temas || [];
  }, [selectedSpecForTheme]);

  const handleSelectFilter = (
    type: DynamicFilterCriterionType,
    labelPrefix: string,
    value: string
  ) => {
    // Evita duplicatas do mesmo valor
    if (activeFilters.some((f) => f.type === type && f.value === value)) {
      setIsDropdownOpen(false);
      setActiveCategory(null);
      return;
    }

    const sanitizedVal = value.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    onAddFilter({
      id: `${type}-${sanitizedVal}-${activeFilters.length + 1}`,
      type,
      label: `${labelPrefix}: ${value}`,
      value
    });

    setIsDropdownOpen(false);
    setActiveCategory(null);
  };

  return (
    <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 p-3 sm:p-4 rounded-2xl shadow-xs space-y-3 transition-all">
      {/* Linha Superior: Indicador, Botão de Adicionar Filtro e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <span>Filtros do Baralho</span>
          </div>

          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {filteredCount} de {totalCards} cards
          </span>

          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-[11px] font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors cursor-pointer underline ml-1"
            >
              Limpar todos
            </button>
          )}
        </div>

        {/* Botão de Estudar Cards Filtrados e Salvar */}
        <div className="flex items-center gap-2">
          {filteredCount > 0 && (
            <button
              type="button"
              onClick={onStudyFilteredCards}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 hover:opacity-95 active:scale-98"
              style={{ backgroundColor: accentConfig.primaryHex }}
              title="Iniciar sessão de estudo dos cards filtrados"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Estudar Seleção ({filteredCount})</span>
            </button>
          )}

          {onSaveAsDeck && activeFilters.length > 0 && (
            <button
              type="button"
              onClick={onSaveAsDeck}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
              title="Salvar esses critérios como um novo Baralho Personalizado"
            >
              <FolderPlus className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Salvar como Baralho</span>
            </button>
          )}
        </div>
      </div>

      {/* Linha dos Chips Ativos + Dropdown para Adicionar */}
      <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
        {/* Dropdown de Adicionar Filtro */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsDropdownOpen((prev) => !prev);
              setActiveCategory(null);
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer inline-flex items-center gap-1.5 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            <span>Adicionar Filtro</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {/* Menu Dropdown de Categorias */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-white dark:bg-[#16161a] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-30 p-1.5 space-y-1 animate-in fade-in duration-150">
              {!activeCategory ? (
                <>
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
                    Escolha o critério:
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('specialty')}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                      Especialidade
                    </span>
                    <ChevronDown className="w-3 h-3 -rotate-90 text-zinc-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('theme')}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      Tema Clínico
                    </span>
                    <ChevronDown className="w-3 h-3 -rotate-90 text-zinc-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('deck')}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                      Baralho Autoral
                    </span>
                    <ChevronDown className="w-3 h-3 -rotate-90 text-zinc-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('status')}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      Status de Revisão (Anki)
                    </span>
                    <ChevronDown className="w-3 h-3 -rotate-90 text-zinc-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('depth')}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-purple-500" />
                      Modo: Estudo vs. Revisão
                    </span>
                    <ChevronDown className="w-3 h-3 -rotate-90 text-zinc-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('priority')}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      Prioridade
                    </span>
                    <ChevronDown className="w-3 h-3 -rotate-90 text-zinc-400" />
                  </button>

                  {availableTags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveCategory('tag')}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-zinc-400" />
                        Tag Personalizada
                      </span>
                      <ChevronDown className="w-3 h-3 -rotate-90 text-zinc-400" />
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className="text-[11px] font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-2 py-1 mb-1 block"
                  >
                    &larr; Voltar
                  </button>

                  {/* Submenus específicos */}
                  {activeCategory === 'specialty' &&
                    clinicalHierarchy.map((s) => (
                      <button
                        key={s.especialidade}
                        type="button"
                        onClick={() =>
                          handleSelectFilter('specialty', 'Especialidade', s.especialidade)
                        }
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                      >
                        {s.especialidade}
                      </button>
                    ))}

                  {activeCategory === 'theme' && (
                    <div className="space-y-1.5">
                      <select
                        value={selectedSpecForTheme}
                        onChange={(e) => setSelectedSpecForTheme(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 mb-1"
                      >
                        {clinicalHierarchy.map((s) => (
                          <option key={s.especialidade} value={s.especialidade}>
                            {s.especialidade}
                          </option>
                        ))}
                      </select>
                      {themesForSelectedSpec.map((t) => (
                        <button
                          key={t.tema}
                          type="button"
                          onClick={() => handleSelectFilter('theme', 'Tema', t.tema)}
                          className="w-full text-left px-2 py-1 rounded-lg text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 truncate"
                        >
                          {t.tema}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeCategory === 'deck' &&
                    availableDecks.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleSelectFilter('deck', 'Baralho', d.name)}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 truncate"
                      >
                        {d.name}
                      </button>
                    ))}

                  {activeCategory === 'status' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSelectFilter('status', 'Status', 'Para Revisar')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium"
                      >
                        Para Revisar Hoje
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectFilter('status', 'Status', 'Novos')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium"
                      >
                        Novos (Sem revisão)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectFilter('status', 'Status', 'Em Aprendizado')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium"
                      >
                        Em Aprendizado
                      </button>
                    </>
                  )}

                  {activeCategory === 'depth' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSelectFilter('depth', 'Modo', 'Estudo Detalhado')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium"
                      >
                        Estudo Detalhado (Conceitos &amp; Fisiopatologia)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectFilter('depth', 'Modo', 'Revisão Rápida')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-medium"
                      >
                        Revisão Rápida (Clozes &amp; Condutas Diretas)
                      </button>
                    </>
                  )}

                  {activeCategory === 'priority' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSelectFilter('priority', 'Prioridade', 'Essenciais')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-medium"
                      >
                        Apenas Essenciais (Alta recorrência)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectFilter('priority', 'Prioridade', 'Padrão')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
                      >
                        Padrão
                      </button>
                    </>
                  )}

                  {activeCategory === 'tag' &&
                    availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleSelectFilter('tag', 'Tag', `#${tag}`)}
                        className="w-full text-left px-2 py-1 rounded-lg text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 truncate"
                      >
                        #{tag}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chips de Filtros Ativos (com botão X de exclusão) */}
        {activeFilters.map((filter) => (
          <div
            key={filter.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs animate-in fade-in duration-150"
          >
            <span>{filter.label}</span>
            <button
              type="button"
              onClick={() => onRemoveFilter(filter.id)}
              className="p-0.5 rounded-md hover:bg-blue-200/60 dark:hover:bg-blue-800/60 transition-colors cursor-pointer text-blue-500 hover:text-blue-800 dark:hover:text-blue-200"
              title="Excluir este filtro"
            >
              <X className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        ))}

        {activeFilters.length === 0 && (
          <span className="text-xs text-zinc-400 italic">
            Nenhum filtro ativo. Adicione filtros acima para segmentar seus cartões autorais.
          </span>
        )}
      </div>
    </div>
  );
};

