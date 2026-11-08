'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  Search,
  BookOpen,
  ChevronDown,
  Sparkles,
  Clock
} from 'lucide-react';
import { useStudyTimer } from '@/context/StudyTimerContext';
import {
  searchTaxonomy,
  TaxonomyItem,
  CORE_SPECIALTIES
} from '@/services/taxonomySearchService';
import { StudyTimerSaveModal } from '@/components/StudyTimerSaveModal';

export const HeaderStudyTimer: React.FC = () => {
  const {
    status,
    formattedTime,
    selectedTaxonomy,
    setSelectedTaxonomy,
    startTimer,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    openSaveModal
  } = useStudyTimer();

  // Estado do dropdown de busca de taxonomia
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TaxonomyItem[]>([]);
  const [isLoadingTaxonomy, setIsLoadingTaxonomy] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carrega sugestões de busca
  const loadSuggestions = useCallback(async (q: string) => {
    setIsLoadingTaxonomy(true);
    try {
      const results = await searchTaxonomy(q, 15);
      setSearchResults(results);
    } finally {
      setIsLoadingTaxonomy(false);
    }
  }, []);

  // Foco no input ao abrir dropdown
  useEffect(() => {
    if (isDropdownOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadSuggestions('');
    }
  }, [isDropdownOpen, loadSuggestions]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    loadSuggestions(val);
  };

  const handleSelectTaxonomyItem = (item: TaxonomyItem) => {
    setSelectedTaxonomy({
      especialidade: item.especialidade,
      tema: item.tema,
      foco: item.foco,
      subfoco: item.subfoco,
      rawLabel: item.breadcrumb
    });
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const currentTopicDisplay =
    selectedTaxonomy.subfoco ||
    selectedTaxonomy.foco ||
    selectedTaxonomy.tema ||
    selectedTaxonomy.especialidade ||
    '';

  return (
    <>
      <div ref={containerRef} className="relative flex items-center shrink-0">
        {/* ── ESTADO 1: INATIVO (SELEÇÃO + BOTÃO INICIAR) ── */}
        {status === 'idle' && (
          <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl p-1 shadow-2xs">
            {/* Seletor com Busca por Digitação */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 max-w-[130px] sm:max-w-[200px] truncate cursor-pointer"
              title={currentTopicDisplay ? `Matéria selecionada: ${selectedTaxonomy.rawLabel || currentTopicDisplay}` : 'Escolha o que vai estudar'}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">
                {currentTopicDisplay || 'O que vai estudar?'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {/* Display Estático "00:00:00" na Fonte Inter */}
            <span className="hidden sm:inline-block font-[var(--font-inter)] text-xs font-bold tabular-nums tracking-tight text-slate-400 dark:text-zinc-500 px-1">
              00:00:00
            </span>

            {/* Botão Iniciar (Verde Play) */}
            <button
              type="button"
              onClick={() => startTimer()}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Iniciar contagem de estudo"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Iniciar</span>
            </button>
          </div>
        )}

        {/* ── ESTADO 2: EM EXECUÇÃO (RODANDO AO VIVO) ── */}
        {status === 'running' && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-1 pr-1.5 shadow-2xs animate-in fade-in duration-150">
            {/* Ponto Pulsante & Display hh:mm:ss */}
            <div className="flex items-center gap-1.5 px-2 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-[var(--font-inter)] text-xs sm:text-sm font-black tabular-nums tracking-tight text-emerald-700 dark:text-emerald-300">
                {formattedTime}
              </span>
            </div>

            {/* Tema Ativo (Abreviado com Tooltip) */}
            <span
              className="hidden sm:inline-block max-w-[120px] lg:max-w-[160px] truncate text-[11px] font-bold text-slate-700 dark:text-zinc-200 bg-white/70 dark:bg-zinc-800/80 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-zinc-700/60"
              title={selectedTaxonomy.rawLabel || currentTopicDisplay || 'Estudo em andamento'}
            >
              {currentTopicDisplay || 'Estudo'}
            </span>

            {/* Botão Pausar (Azul Pause) */}
            <button
              type="button"
              onClick={pauseTimer}
              className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Pausar cronômetro"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Pausar</span>
            </button>
          </div>
        )}

        {/* ── ESTADO 3: PAUSADO (TRÍADE: CONTINUAR, SALVAR, CANCELAR) ── */}
        {status === 'paused' && (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-1 shadow-2xs animate-in fade-in duration-150">
            {/* Display Congelado com Ícone Pause */}
            <div className="flex items-center gap-1 px-2 py-1">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">❙❙</span>
              <span className="font-[var(--font-inter)] text-xs sm:text-sm font-black tabular-nums tracking-tight text-amber-700 dark:text-amber-300">
                {formattedTime}
              </span>
            </div>

            {/* Tríade de Botões: Continuar, Salvar, Cancelar */}
            <div className="flex items-center gap-1">
              {/* Continuar */}
              <button
                type="button"
                onClick={resumeTimer}
                className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Continuar estudo de onde parou"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>

              {/* Salvar (Abre modal de fechamento) */}
              <button
                type="button"
                onClick={openSaveModal}
                className="px-2 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                title="Salvar atividade na Agenda"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Salvar</span>
              </button>

              {/* Cancelar (Descarta e zera) */}
              <button
                type="button"
                onClick={cancelTimer}
                className="p-1.5 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-600 text-slate-600 dark:text-zinc-400 text-xs font-bold transition-all cursor-pointer"
                title="Descartar cronometragem e voltar a zero"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── DROPDOWN POPUP: CAIXA DE SELEÇÃO E BUSCA DE TAXONOMIA ── */}
        {isDropdownOpen && (
          <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Input de Busca com Digitação */}
            <div className="relative mb-2.5">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Digite a matéria, tema, foco ou subfoco..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-hidden focus:border-blue-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              />
            </div>

            {/* Especialidades Principais (Atalhos de 1 Clique) */}
            {!searchQuery && (
              <div className="mb-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block px-1">
                  Grandes Áreas
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CORE_SPECIALTIES.map((esp) => (
                    <button
                      key={esp.name}
                      type="button"
                      onClick={() =>
                        handleSelectTaxonomyItem({
                          id: esp.name,
                          especialidade: esp.name,
                          label: esp.name,
                          breadcrumb: esp.name,
                          level: 'especialidade'
                        })
                      }
                      className="px-2 py-1.5 rounded-lg text-left text-xs font-bold transition-colors bg-slate-50 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer border border-slate-100 dark:border-zinc-800/60 truncate"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: esp.color }}
                      />
                      <span className="truncate">{esp.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resultados Pesquisados */}
            <div className="space-y-1 max-h-56 overflow-y-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block px-1">
                {searchQuery ? 'Resultados Encontrados' : 'Sugestões de Temas'}
              </span>

              {isLoadingTaxonomy ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Pesquisando na taxonomia clínica...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Nenhum tema encontrado para &quot;{searchQuery}&quot;.
                </div>
              ) : (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTaxonomyItem(item)}
                    className="w-full text-left p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                      {item.breadcrumb}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Finalização / Fechamento da Sessão */}
      <StudyTimerSaveModal />
    </>
  );
};
