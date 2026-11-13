'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  X,
  Play,
  RotateCw,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,

  Filter,
  CheckSquare,
  Square,
  Brain,
  BookOpen,
  Zap
} from 'lucide-react';
import { FlashcardItem, FlashcardStudyDepth } from '@/types/flashcards';
import { formatSubSubfocoDisplay } from '@/components/AdvancedQuestionFilters';
import { buildHierarchyCardsCache } from '@/utils/specialtyMatcher';
import { getFlashcardDepth } from '@/utils/flashcardDistributionEngine';
import { SpecialtyHierarchy } from '@/types';
import { useTheme } from '@/context/ThemeContext';


function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export interface DeckCounts {
  novo: number;
  aprender: number;
  revisar: number;
  total: number;
}

interface AnkiDeckTreeProps {
  allFlashcards: FlashcardItem[];
  hierarchy: SpecialtyHierarchy[];
  filterEssentialOnly: boolean;
  onStartStudy: (
    cards: FlashcardItem[],
    title: string,
    overridePriorityOnly?: boolean,
    allCardsMode?: boolean
  ) => void;
}

export const AnkiDeckTree: React.FC<AnkiDeckTreeProps> = ({
  allFlashcards,
  hierarchy,
  filterEssentialOnly,
  onStartStudy
}) => {
  const { accentConfig } = useTheme();

  // Estados de Busca e Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyWithPending, setOnlyWithPending] = useState(false);

  // Modo de Aprendizagem: Todos | Estudo (Detalhado) | Revisão (Rápido)
  const [studyDepth, setStudyDepth] = useState<FlashcardStudyDepth>('all');

  // Estados de Expansão (Chaves: "spec:Nome", "tema:Spec:::Tema", "foco:Spec:::Tema:::Foco")
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Conjuntos de Multi-seleção (Chaves com prefixo de nível)
  const [selectedNodeKeys, setSelectedNodeKeys] = useState<Set<string>>(new Set());

  const normalizedQuery = useMemo(() => normalizeText(searchQuery), [searchQuery]);



  // Contagens prévias para os botões do seletor de profundidade
  const baseCardsForDepth = useMemo(() => {
    return filterEssentialOnly

      ? allFlashcards.filter((c) => c.priority === 'essential')
      : allFlashcards;
  }, [allFlashcards, filterEssentialOnly]);

  const studyCardsCount = useMemo(() => {
    return baseCardsForDepth.filter((c) => getFlashcardDepth(c) === 'study').length;
  }, [baseCardsForDepth]);

  const reviewCardsCount = useMemo(() => {
    return baseCardsForDepth.filter((c) => getFlashcardDepth(c) === 'review').length;
  }, [baseCardsForDepth]);

  // Lista base de flashcards (respeitando o filtro de essenciais e modo estudo vs revisão)
  const effectiveCards = useMemo(() => {
    if (studyDepth === 'study') {
      return baseCardsForDepth.filter((c) => getFlashcardDepth(c) === 'study');
    }
    if (studyDepth === 'review') {
      return baseCardsForDepth.filter((c) => getFlashcardDepth(c) === 'review');
    }
    return baseCardsForDepth;
  }, [baseCardsForDepth, studyDepth]);

  // Helper para verificar se o card é de uma especialidade
  const cardMatchesSpec = useCallback((c: FlashcardItem, specName: string) => {
    const s = normalizeText(c.specialty);
    const target = normalizeText(specName);
    if (target.includes('clinica')) return s.includes('clinica');
    if (target.includes('cirurgia')) return s.includes('cirurgia');
    if (target.includes('pediatria')) return s.includes('pediatria');
    if (target.includes('preventiva')) return s.includes('preventiva');
    if (target.includes('ginecologia')) {
      if (s === 'ginecologia') return true;
      if (s.includes('ginecologia')) {
        const th = normalizeText(c.theme);
        const fo = normalizeText(c.focus);
        if (th.includes('obstetr') || fo.includes('parto') || fo.includes('eclampsia')) return false;
        return true;
      }
      return false;
    }
    if (target.includes('obstetr')) {
      if (s.includes('obstetr')) {
        const th = normalizeText(c.theme);
        const fo = normalizeText(c.focus);
        if (th.includes('gineco') || th.includes('mioma') || fo.includes('colo uterino')) return false;
        return true;
      }
      return false;
    }
    return s.includes(target) || target.includes(s);
  }, []);

  // Helper para verificar se o card é de um tema
  const cardMatchesTema = useCallback(
    (c: FlashcardItem, specName: string, temaName: string) => {
      if (!cardMatchesSpec(c, specName)) return false;
      const normTema = normalizeText(temaName);
      const normItemTh = normalizeText(c.theme);
      const normItemFo = normalizeText(c.focus);

      const matchesTh =
        normItemTh.includes(normTema) ||
        normTema.includes(normItemTh) ||
        normItemFo.includes(normTema);

      const isEndo = normTema.includes('endocrino') && normItemTh.includes('endocrino');
      const isCardio = normTema.includes('cardio') && normItemTh.includes('cardio');
      const isGinecoOnco = normTema.includes('oncologia') && normItemTh.includes('ginecologia');
      const isMioma = normTema.includes('mioma') && normItemTh.includes('mioma');
      const isObstetr = normTema.includes('obstetr') && normItemTh.includes('obstetr');
      const isPrev = normTema.includes('epidemiologia') && normItemTh.includes('epidemiologia');

      return matchesTh || isEndo || isCardio || isGinecoOnco || isMioma || isObstetr || isPrev;
    },
    [cardMatchesSpec]
  );

  // Helper para verificar se o card é de um foco
  const cardMatchesFoco = useCallback(
    (c: FlashcardItem, specName: string, temaName: string, focoName: string) => {
      if (!cardMatchesTema(c, specName, temaName)) return false;
      const normFoco = normalizeText(focoName);
      const normItemFo = normalizeText(c.focus);
      const normFront = c.front ? normalizeText(c.front) : '';
      const normBack = c.back ? normalizeText(c.back) : '';
      const normComment = c.comment ? normalizeText(c.comment) : '';

      const direct = normItemFo.includes(normFoco) || normFoco.includes(normItemFo);
      const content =
        normFront.includes(normFoco) ||
        normBack.includes(normFoco) ||
        normComment.includes(normFoco);

      const words = normFoco.split(/\s+/).filter((w) => w.length > 3);
      const wordsMatch =
        words.length > 0 &&
        words.some(
          (w) =>
            normItemFo.includes(w) ||
            normFront.includes(w) ||
            (c.tags && c.tags.some((t) => normalizeText(t).includes(w)))
        );

      return direct || content || wordsMatch;
    },
    [cardMatchesTema]
  );

  // Helper para verificar se o card é de um subfoco
  const cardMatchesSubfoco = useCallback(
    (c: FlashcardItem, specName: string, temaName: string, focoName: string, subfocoName: string) => {
      if (!cardMatchesFoco(c, specName, temaName, focoName)) return false;
      const normSub = normalizeText(subfocoName);
      if (c.subfocus) {
        const normCSub = normalizeText(c.subfocus);
        if (normCSub.includes(normSub) || normSub.includes(normCSub)) return true;
      }
      const normFront = c.front ? normalizeText(c.front) : '';
      const normBack = c.back ? normalizeText(c.back) : '';
      const words = normSub.split(/\s+/).filter((w) => w.length > 3);
      return (
        words.length > 0 &&
        words.some(
          (w) =>
            normFront.includes(w) ||
            normBack.includes(w) ||
            (c.tags && c.tags.some((t) => normalizeText(t).includes(w)))
        )
      );
    },
    [cardMatchesFoco]
  );

  // Calcula estatísticas Anki para uma lista de cards
  const calculateAnkiCounts = useCallback((cards: FlashcardItem[]): DeckCounts => {
    const now = new Date();
    let novo = 0;
    let aprender = 0;
    let revisar = 0;

    cards.forEach((c) => {
      const p = c.progress;
      if (!p || p.state === 'new' || p.repetitions === 0) {
        novo += 1;
      } else if (p.state === 'learning' || p.state === 'relearning') {
        aprender += 1;
      } else if (p.state === 'review') {
        if (!p.nextReviewDate || new Date(p.nextReviewDate) <= now) {
          revisar += 1;
        }
      }
    });

    return { novo, aprender, revisar, total: cards.length };
  }, []);

  // Mapas de cache para cards por nó para máxima performance (incluindo subfocos e sub-subfocos)
  const cardsCache = useMemo(() => {
    return buildHierarchyCardsCache(hierarchy, effectiveCards);
  }, [hierarchy, effectiveCards]);

  // Alterna expansão de um nó
  const toggleNodeExpand = (nodeKey: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey]
    }));
  };

  // Expandir tudo
  const handleExpandAll = () => {
    const next: Record<string, boolean> = {};
    hierarchy.forEach((spec) => {
      next[`spec:${spec.especialidade}`] = true;
      spec.temas.forEach((tem) => {
        next[`tema:${spec.especialidade}:::${tem.tema}`] = true;
        tem.focos.forEach((foc) => {
          next[`foco:${spec.especialidade}:::${tem.tema}:::${foc.foco}`] = true;
        });
      });
    });
    setExpandedNodes(next);
  };

  // Recolher tudo
  const handleCollapseAll = () => {
    setExpandedNodes({});
  };

  // Toggle seleção de nó
  const toggleNodeSelection = (nodeKey: string) => {
    setSelectedNodeKeys((prev) => {
      const next = new Set(prev);
      if (next.has(nodeKey)) {
        next.delete(nodeKey);
      } else {
        next.add(nodeKey);
      }
      return next;
    });
  };

  // Limpar todas as seleções
  const handleClearSelections = () => {
    setSelectedNodeKeys(new Set());
  };

  // Selecionar todos os cards das seleções ativas
  const selectedCardsList = useMemo(() => {
    const cardSet = new Map<string, FlashcardItem>();

    selectedNodeKeys.forEach((key) => {
      if (key.startsWith('spec:')) {
        const specName = key.replace('spec:', '');
        const cards = cardsCache.specMap.get(specName) || [];
        cards.forEach((c) => cardSet.set(c.id, c));
      } else if (key.startsWith('tema:')) {
        const temaKey = key.replace('tema:', '');
        const cards = cardsCache.temaMap.get(temaKey) || [];
        cards.forEach((c) => cardSet.set(c.id, c));
      } else if (key.startsWith('foco:')) {
        const focoKey = key.replace('foco:', '');
        const cards = cardsCache.focoMap.get(focoKey) || [];
        cards.forEach((c) => cardSet.set(c.id, c));
      } else if (key.startsWith('subfoco:')) {
        const subKey = key.replace('subfoco:', '');
        const cards = cardsCache.subfocoMap.get(subKey) || [];
        cards.forEach((c) => cardSet.set(c.id, c));
      } else if (key.startsWith('subsubfoco:') || key.startsWith('sub_subfoco:')) {
        const ssKey = key.replace(/^(subsubfoco|sub_subfoco):/, '');
        const cards = cardsCache.subSubfocoMap.get(ssKey) || [];
        cards.forEach((c) => cardSet.set(c.id, c));
      }
    });

    return Array.from(cardSet.values());
  }, [selectedNodeKeys, cardsCache]);

  const selectedAnkiCounts = useMemo(() => {
    return calculateAnkiCounts(selectedCardsList);
  }, [selectedCardsList, calculateAnkiCounts]);

  // Helper de renderização de números no estilo Anki (0 fica suave em cinza)
  const renderCountNumber = (val: number, type: 'novo' | 'aprender' | 'revisar') => {
    if (val === 0) {
      return (
        <span className="font-mono text-zinc-400 dark:text-zinc-600 font-normal">
          0
        </span>
      );
    }
    if (type === 'novo') {
      return (
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
          {val}
        </span>
      );
    }
    if (type === 'aprender') {
      return (
        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
          {val}
        </span>
      );
    }
    return (
      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
        {val}
      </span>
    );
  };

  // Iniciar estudo direto de um deck
  const handleStartNodeStudy = (
    cards: FlashcardItem[],
    title: string,
    allCardsMode: boolean = false
  ) => {
    if (!cards || cards.length === 0) return;
    const depthSuffix =
      studyDepth === 'study'
        ? ' • Estudo'
        : studyDepth === 'review'
          ? ' • Revisão'
          : '';
    onStartStudy(cards, `${title}${depthSuffix}`, filterEssentialOnly, allCardsMode);
  };

  return (
    <div className="space-y-3">
      {/* SELETOR DE MODO NO TOPO DA CATEGORIA CARTÕES DO BR: ESTUDO vs REVISÃO */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 p-3 sm:p-3.5 rounded-2xl shadow-xs transition-all">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Brain className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-tight">
                Modo de Aprendizagem
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
                {effectiveCards.length} cards
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {studyDepth === 'all'
                ? 'Exibindo todos os cartões disponíveis no acervo oficial'
                : studyDepth === 'study'
                  ? 'Cartões detalhados, conceituais e aprofundados para fixação teórica'
                  : 'Cartões diretos, objetivos e rápidos para revisão ágil pré-prova'}
            </p>
          </div>
        </div>

        {/* Pílulas de Seleção: Todos | Estudo | Revisão */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setStudyDepth('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${studyDepth === 'all'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todos</span>
            <span className="font-mono text-[10px] px-1 rounded bg-zinc-200/60 dark:bg-zinc-700/60">
              {baseCardsForDepth.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStudyDepth('study')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${studyDepth === 'study'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            title="Cartões detalhados com raciocínio clínico completo, fisiopatologia e critérios diagnósticos"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cartões para Estudo</span>
            <span
              className={`font-mono text-[10px] px-1 rounded ${studyDepth === 'study'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                }`}
            >
              {studyCardsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStudyDepth('review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${studyDepth === 'review'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            title="Cartões diretos, clozes objetivos, condutas imediatas e pérolas de prova"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Cartões para Revisão</span>
            <span
              className={`font-mono text-[10px] px-1 rounded ${studyDepth === 'review'
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                }`}
            >
              {reviewCardsCount}
            </span>
          </button>
        </div>
      </div>

      {/* 1. BARRA DE BUSCA COMPACTA & CONTROLES DA ÁRVORE */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 p-2 sm:p-2.5 rounded-2xl shadow-xs">
        {/* Campo de Busca Rápida */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por especialidade, tema, foco, subfoco ou termo médico..."
            className="w-full pl-9 pr-14 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs sm:text-[13px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Ações Rápidas de Navegação */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleExpandAll}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/70 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1"
            title="Expandir todas as especialidades e temas"
          >
            <ChevronDown className="w-3 h-3 stroke-[2.5]" />
            <span>Expandir Tudo</span>
          </button>

          <button
            type="button"
            onClick={handleCollapseAll}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/70 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1"
            title="Recolher toda a hierarquia"
          >
            <ChevronRight className="w-3 h-3 stroke-[2.5]" />
            <span>Recolher</span>
          </button>

          <button
            type="button"
            onClick={() => setOnlyWithPending((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border shadow-2xs inline-flex items-center gap-1 ${onlyWithPending
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            title="Mostrar apenas baralhos com revisões ou novos cards pendentes hoje"
          >
            <Filter className="w-3 h-3" />
            <span className="hidden md:inline">Só Pendências</span>
          </button>
        </div>
      </div>

      {/* 2. TABELA HIERÁRQUICA COMPACTA ESTILO ANKI (4 NÍVEIS) */}
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 rounded-2xl shadow-xs overflow-hidden transition-all">
        {/* Cabeçalho da Tabela Estilo Anki */}
        <div className="grid grid-cols-12 items-center px-4 py-2.5 bg-zinc-50/90 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 select-none">
          <div className="col-span-7 sm:col-span-8 flex items-center gap-2">
            <span>Baralho / Tópico Clínico</span>
          </div>
          <div className="col-span-1 text-right text-blue-600 dark:text-blue-400">
            Novo
          </div>
          <div className="col-span-2 sm:col-span-1 text-right text-rose-600 dark:text-rose-400">
            Aprender
          </div>
          <div className="col-span-2 sm:col-span-1 text-right text-emerald-600 dark:text-emerald-400">
            Revisar
          </div>
          <div className="hidden sm:block col-span-1 text-center text-zinc-400">
            Ações
          </div>
        </div>

        {/* Linhas Hierárquicas dos Baralhos */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-900/60 max-h-[68vh] overflow-y-auto custom-scrollbar">
          {hierarchy.map((spec) => {
            const specKey = `spec:${spec.especialidade}`;
            const isSpecExpanded = normalizedQuery
              ? true
              : Boolean(expandedNodes[specKey]);
            const isSpecSelected = selectedNodeKeys.has(specKey);

            const specCards = cardsCache.specMap.get(spec.especialidade) || [];
            const specCounts = calculateAnkiCounts(specCards);

            // Filtro de pendências
            if (onlyWithPending && specCounts.revisar === 0 && specCounts.novo === 0 && specCounts.aprender === 0) {
              return null;
            }

            // Filtro de busca na especialidade
            const matchesSpecQuery =
              !normalizedQuery ||
              normalizeText(spec.especialidade).includes(normalizedQuery);

            return (
              <React.Fragment key={spec.especialidade}>
                {/* LINHA NÍVEL 1: ESPECIALIDADE */}
                <div
                  className={`grid grid-cols-12 items-center px-4 py-2 transition-colors group select-none ${isSpecSelected
                      ? 'bg-blue-50/60 dark:bg-blue-950/20'
                      : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50'
                    }`}
                >
                  {/* Nome da Especialidade com Toggle e Checkbox */}
                  <div className="col-span-7 sm:col-span-8 flex items-center gap-2 min-w-0 pr-2">
                    {/* Checkbox de Multi-Seleção */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNodeSelection(specKey);
                      }}
                      className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer shrink-0"
                      title="Selecionar para Estudo Personalizado"
                    >
                      {isSpecSelected ? (
                        <CheckSquare
                          className="w-4 h-4 stroke-[2.5]"
                          style={{ color: accentConfig.primaryHex }}
                        />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-300 dark:text-zinc-700 hover:text-zinc-400" />
                      )}
                    </button>

                    {/* Botão Expansor (+) ou (-) */}
                    <button
                      type="button"
                      onClick={() => toggleNodeExpand(specKey)}
                      className="w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-xs text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                      title={isSpecExpanded ? 'Recolher temas' : 'Expandir temas'}
                    >
                      {isSpecExpanded ? '−' : '+'}
                    </button>

                    {/* Título Clicável que Abre/Expande a Seleção Completa */}
                    <span
                      onClick={() => toggleNodeExpand(specKey)}
                      className="font-heading font-black text-xs sm:text-[13px] uppercase tracking-wide text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:underline"
                      title="Clique para expandir/recolher a especialidade"
                    >
                      {spec.especialidade}
                    </span>
                  </div>

                  {/* Colunas Anki: Novo, Aprender, Revisar */}
                  <div className="col-span-1 text-right text-xs">
                    {renderCountNumber(specCounts.novo, 'novo')}
                  </div>
                  <div className="col-span-2 sm:col-span-1 text-right text-xs">
                    {renderCountNumber(specCounts.aprender, 'aprender')}
                  </div>
                  <div className="col-span-2 sm:col-span-1 text-right text-xs">
                    {renderCountNumber(specCounts.revisar, 'revisar')}
                  </div>

                  {/* Ações Rápidas da Linha */}
                  <div className="hidden sm:flex col-span-1 items-center justify-center gap-1.5">
                    {specCards.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleStartNodeStudy(
                              specCards,
                              `${spec.especialidade} (${specCards.length} cards)`
                            )
                          }
                          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-emerald-600 transition-colors cursor-pointer shadow-2xs"
                          title={`Estudar ${specCards.length} cards de ${spec.especialidade}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStartNodeStudy(
                              specCards,
                              `Revisão Total: ${spec.especialidade}`,
                              true
                            )
                          }
                          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer shadow-2xs"
                          title="Revisar Todos os cards (Estudo Personalizado)"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* LINHA NÍVEL 2: TEMAS */}
                {isSpecExpanded &&
                  spec.temas.map((tem) => {
                    const temaKey = `tema:${spec.especialidade}:::${tem.tema}`;
                    const rawTemaKey = `${spec.especialidade}:::${tem.tema}`;
                    const isTemaExpanded = normalizedQuery
                      ? true
                      : Boolean(expandedNodes[temaKey]);
                    const isTemaSelected = selectedNodeKeys.has(temaKey);

                    const temaCards = cardsCache.temaMap.get(rawTemaKey) || [];
                    const temaCounts = calculateAnkiCounts(temaCards);

                    if (
                      onlyWithPending &&
                      temaCounts.revisar === 0 &&
                      temaCounts.novo === 0 &&
                      temaCounts.aprender === 0
                    ) {
                      return null;
                    }

                    const matchesTemaQuery =
                      !normalizedQuery ||
                      matchesSpecQuery ||
                      normalizeText(tem.tema).includes(normalizedQuery);

                    return (
                      <React.Fragment key={tem.tema}>
                        <div
                          className={`grid grid-cols-12 items-center px-4 py-1.5 transition-colors group select-none pl-7 sm:pl-9 ${isTemaSelected
                              ? 'bg-blue-50/50 dark:bg-blue-950/15'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                            }`}
                        >
                          {/* Nome do Tema com Indentação */}
                          <div className="col-span-7 sm:col-span-8 flex items-center gap-2 min-w-0 pr-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleNodeSelection(temaKey);
                              }}
                              className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer shrink-0"
                              title="Selecionar Tema para Estudo Personalizado"
                            >
                              {isTemaSelected ? (
                                <CheckSquare
                                  className="w-3.5 h-3.5 stroke-[2.5]"
                                  style={{ color: accentConfig.primaryHex }}
                                />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 hover:text-zinc-400" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleNodeExpand(temaKey)}
                              className="w-4 h-4 rounded flex items-center justify-center font-mono font-bold text-[11px] text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                              title={isTemaExpanded ? 'Recolher focos' : 'Expandir focos'}
                            >
                              {tem.focos.length > 0 ? (isTemaExpanded ? '−' : '+') : '•'}
                            </button>

                            <span
                              onClick={() => toggleNodeExpand(temaKey)}
                              className="font-heading font-bold text-xs uppercase tracking-tight text-zinc-800 dark:text-zinc-200 truncate cursor-pointer hover:underline"
                              title="Clique para expandir focos deste tema"
                            >
                              {tem.tema}
                            </span>
                          </div>

                          <div className="col-span-1 text-right text-xs">
                            {renderCountNumber(temaCounts.novo, 'novo')}
                          </div>
                          <div className="col-span-2 sm:col-span-1 text-right text-xs">
                            {renderCountNumber(temaCounts.aprender, 'aprender')}
                          </div>
                          <div className="col-span-2 sm:col-span-1 text-right text-xs">
                            {renderCountNumber(temaCounts.revisar, 'revisar')}
                          </div>

                          <div className="hidden sm:flex col-span-1 items-center justify-center gap-1.5">
                            {temaCards.length > 0 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStartNodeStudy(
                                      temaCards,
                                      `${tem.tema} (${temaCards.length} cards)`
                                    )
                                  }
                                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                                  title={`Estudar ${temaCards.length} cards de ${tem.tema}`}
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStartNodeStudy(
                                      temaCards,
                                      `Revisão Total: ${tem.tema}`,
                                      true
                                    )
                                  }
                                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"
                                  title="Revisar Todos os cards (Estudo Personalizado)"
                                >
                                  <RotateCw className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* LINHA NÍVEL 3: FOCOS CLÍNICOS */}
                        {isTemaExpanded &&
                          tem.focos.map((foc) => {
                            const focoKey = `foco:${spec.especialidade}:::${tem.tema}:::${foc.foco}`;
                            const rawFocoKey = `${spec.especialidade}:::${tem.tema}:::${foc.foco}`;
                            const isFocoExpanded = normalizedQuery
                              ? true
                              : Boolean(expandedNodes[focoKey]);
                            const isFocoSelected = selectedNodeKeys.has(focoKey);

                            const focoCards = cardsCache.focoMap.get(rawFocoKey) || [];
                            const focoCounts = calculateAnkiCounts(focoCards);

                            if (
                              onlyWithPending &&
                              focoCounts.revisar === 0 &&
                              focoCounts.novo === 0 &&
                              focoCounts.aprender === 0
                            ) {
                              return null;
                            }

                            const matchesFocoQuery =
                              !normalizedQuery ||
                              matchesTemaQuery ||
                              normalizeText(foc.foco).includes(normalizedQuery);

                            const hasSubfocos = foc.subfocos && foc.subfocos.length > 0;

                            return (
                              <React.Fragment key={foc.foco}>
                                <div
                                  className={`grid grid-cols-12 items-center px-4 py-1.5 transition-colors group select-none pl-12 sm:pl-16 ${isFocoSelected
                                      ? 'bg-blue-50/40 dark:bg-blue-950/10'
                                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/30'
                                    }`}
                                >
                                  <div className="col-span-7 sm:col-span-8 flex items-center gap-2 min-w-0 pr-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleNodeSelection(focoKey);
                                      }}
                                      className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer shrink-0"
                                      title="Selecionar Foco Clínico"
                                    >
                                      {isFocoSelected ? (
                                        <CheckSquare
                                          className="w-3.5 h-3.5 stroke-[2.5]"
                                          style={{ color: accentConfig.primaryHex }}
                                        />
                                      ) : (
                                        <Square className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 hover:text-zinc-400" />
                                      )}
                                    </button>

                                    {hasSubfocos ? (
                                      <button
                                        type="button"
                                        onClick={() => toggleNodeExpand(focoKey)}
                                        className="w-4 h-4 rounded flex items-center justify-center font-mono font-bold text-[10px] text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                                        title={
                                          isFocoExpanded
                                            ? 'Recolher subfocos'
                                            : 'Expandir subfocos'
                                        }
                                      >
                                        {isFocoExpanded ? '−' : '+'}
                                      </button>
                                    ) : (
                                      <span className="w-4 text-center text-zinc-300 dark:text-zinc-700 font-mono text-[10px]">
                                        •
                                      </span>
                                    )}

                                    <span
                                      onClick={() => hasSubfocos && toggleNodeExpand(focoKey)}
                                      className="text-xs text-zinc-700 dark:text-zinc-300 truncate cursor-pointer hover:underline"
                                      title={foc.foco}
                                    >
                                      {foc.foco}
                                    </span>
                                  </div>

                                  <div className="col-span-1 text-right text-xs">
                                    {renderCountNumber(focoCounts.novo, 'novo')}
                                  </div>
                                  <div className="col-span-2 sm:col-span-1 text-right text-xs">
                                    {renderCountNumber(focoCounts.aprender, 'aprender')}
                                  </div>
                                  <div className="col-span-2 sm:col-span-1 text-right text-xs">
                                    {renderCountNumber(focoCounts.revisar, 'revisar')}
                                  </div>

                                  <div className="hidden sm:flex col-span-1 items-center justify-center gap-1.5">
                                    {focoCards.length > 0 && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleStartNodeStudy(
                                              focoCards,
                                              `${foc.foco} (${focoCards.length} cards)`
                                            )
                                          }
                                          className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                                          title={`Estudar ${focoCards.length} cards deste foco`}
                                        >
                                          <Play className="w-3 h-3 fill-current" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleStartNodeStudy(
                                              focoCards,
                                              `Revisão Total: ${foc.foco}`,
                                              true
                                            )
                                          }
                                          className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"
                                          title="Revisar Todos os cards (Estudo Personalizado)"
                                        >
                                          <RotateCw className="w-3 h-3" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* LINHA NÍVEL 4: SUBFOCOS & NÍVEL 5: SUB-SUBFOCOS */}
                                {isFocoExpanded &&
                                  hasSubfocos &&
                                  foc.subfocos?.map((sub) => {
                                    const subName = typeof sub === 'string' ? sub : sub.subfoco;
                                    const subKey = `subfoco:${spec.especialidade}:::${tem.tema}:::${foc.foco}:::${subName}`;
                                    const rawSubKey = `${spec.especialidade}:::${tem.tema}:::${foc.foco}:::${subName}`;
                                    const isSubSelected = selectedNodeKeys.has(subKey);

                                    const subCards =
                                      cardsCache.subfocoMap.get(rawSubKey) || [];
                                    const subCounts = calculateAnkiCounts(subCards);

                                    const subSubList = typeof sub === 'string' ? [] : (sub.sub_subfocos || []);
                                    const hasSubSubfocos = subSubList.length > 0;
                                    const isSubExpanded = normalizedQuery ? true : Boolean(expandedNodes[subKey]);

                                    if (
                                      onlyWithPending &&
                                      subCounts.revisar === 0 &&
                                      subCounts.novo === 0 &&
                                      subCounts.aprender === 0
                                    ) {
                                      return null;
                                    }

                                    return (
                                      <React.Fragment key={subName}>
                                        <div
                                          className={`grid grid-cols-12 items-center px-4 py-1 transition-colors group select-none pl-16 sm:pl-24 ${isSubSelected
                                              ? 'bg-blue-50/30 dark:bg-blue-950/10'
                                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/20'
                                            }`}
                                        >
                                          <div className="col-span-7 sm:col-span-8 flex items-center gap-2 min-w-0 pr-2">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleNodeSelection(subKey);
                                              }}
                                              className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer shrink-0"
                                              title="Selecionar Subfoco"
                                            >
                                              {isSubSelected ? (
                                                <CheckSquare
                                                  className="w-3 h-3 stroke-[2.5]"
                                                  style={{ color: accentConfig.primaryHex }}
                                                />
                                              ) : (
                                                <Square className="w-3 h-3 text-zinc-300 dark:text-zinc-700 hover:text-zinc-400" />
                                              )}
                                            </button>

                                            {hasSubSubfocos ? (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleNodeExpand(subKey);
                                                }}
                                                className="w-4 h-4 rounded flex items-center justify-center font-mono font-bold text-[10px] text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                                                title={isSubExpanded ? 'Recolher sub-subfocos' : 'Expandir sub-subfocos'}
                                              >
                                                {isSubExpanded ? '−' : '+'}
                                              </button>
                                            ) : (
                                              <span className="w-3 text-center text-zinc-300 dark:text-zinc-700 font-mono text-[9px]">
                                                ↳
                                              </span>
                                            )}

                                            <span
                                              onClick={() => hasSubSubfocos && toggleNodeExpand(subKey)}
                                              className={`text-[11px] text-zinc-600 dark:text-zinc-400 truncate italic ${hasSubSubfocos ? 'cursor-pointer hover:underline' : ''}`}
                                              title={subName}
                                            >
                                              {subName}
                                            </span>
                                          </div>

                                          <div className="col-span-1 text-right text-[11px]">
                                            {renderCountNumber(subCounts.novo, 'novo')}
                                          </div>
                                          <div className="col-span-2 sm:col-span-1 text-right text-[11px]">
                                            {renderCountNumber(subCounts.aprender, 'aprender')}
                                          </div>
                                          <div className="col-span-2 sm:col-span-1 text-right text-[11px]">
                                            {renderCountNumber(subCounts.revisar, 'revisar')}
                                          </div>

                                          <div className="hidden sm:flex col-span-1 items-center justify-center gap-1">
                                            {subCards.length > 0 && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleStartNodeStudy(
                                                    subCards,
                                                    `${subName} (${subCards.length} cards)`
                                                  )
                                                }
                                                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                                                title={`Estudar ${subCards.length} cards deste subfoco`}
                                              >
                                                <Play className="w-2.5 h-2.5 fill-current" />
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                        {/* LINHA NÍVEL 5: SUB-SUBFOCOS (4º NÍVEL ANALÍTICO) */}
                                        {isSubExpanded &&
                                          hasSubSubfocos &&
                                          subSubList.map((ss) => {
                                            const subSubKey = `subsubfoco:${spec.especialidade}:::${tem.tema}:::${foc.foco}:::${subName}:::${ss}`;
                                            const rawSSKey = `${spec.especialidade}:::${tem.tema}:::${foc.foco}:::${subName}:::${ss}`;
                                            const isSSSelected = selectedNodeKeys.has(subSubKey);
                                            const ssCards = cardsCache.subSubfocoMap.get(rawSSKey) || [];
                                            const ssCounts = calculateAnkiCounts(ssCards);

                                            if (
                                              onlyWithPending &&
                                              ssCounts.revisar === 0 &&
                                              ssCounts.novo === 0 &&
                                              ssCounts.aprender === 0
                                            ) {
                                              return null;
                                            }

                                            return (
                                              <div
                                                key={ss}
                                                className={`grid grid-cols-12 items-center px-4 py-1 transition-colors group select-none pl-20 sm:pl-32 ${isSSSelected
                                                    ? 'bg-blue-50/40 dark:bg-blue-950/20'
                                                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/20'
                                                  }`}
                                              >
                                                <div className="col-span-7 sm:col-span-8 flex items-center gap-2 min-w-0 pr-2">
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      toggleNodeSelection(subSubKey);
                                                    }}
                                                    className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer shrink-0"
                                                    title="Selecionar Sub-subfoco"
                                                  >
                                                    {isSSSelected ? (
                                                      <CheckSquare
                                                        className="w-3 h-3 stroke-[2.5]"
                                                        style={{ color: accentConfig.primaryHex }}
                                                      />
                                                    ) : (
                                                      <Square className="w-3 h-3 text-zinc-300 dark:text-zinc-700 hover:text-zinc-400" />
                                                    )}
                                                  </button>

                                                  <span
                                                    className="text-[11px] text-zinc-600 dark:text-zinc-300 truncate"
                                                    title={ss}
                                                  >
                                                    {formatSubSubfocoDisplay(ss)}
                                                  </span>
                                                </div>

                                                <div className="col-span-1 text-right text-[11px]">
                                                  {renderCountNumber(ssCounts.novo, 'novo')}
                                                </div>
                                                <div className="col-span-2 sm:col-span-1 text-right text-[11px]">
                                                  {renderCountNumber(ssCounts.aprender, 'aprender')}
                                                </div>
                                                <div className="col-span-2 sm:col-span-1 text-right text-[11px]">
                                                  {renderCountNumber(ssCounts.revisar, 'revisar')}
                                                </div>

                                                <div className="hidden sm:flex col-span-1 items-center justify-center gap-1">
                                                  {ssCards.length > 0 && (
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        handleStartNodeStudy(
                                                          ssCards,
                                                          `${formatSubSubfocoDisplay(ss)} (${ssCards.length} cards)`
                                                        )
                                                      }
                                                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                                                      title={`Estudar ${ssCards.length} cards deste sub-subfoco`}
                                                    >
                                                      <Play className="w-2.5 h-2.5 fill-current" />
                                                    </button>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                      </React.Fragment>
                                    );
                                  })}
                              </React.Fragment>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
              </React.Fragment>
            );
          })}
        </div>

        {/* 3. LINHA FIXA FINAL: SESSÃO DE ESTUDO PERSONALIZADO (COMO NO ANKI) */}
        <div className="border-t-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 px-4 py-3 select-none">
          <div className="grid grid-cols-12 items-center">
            {/* Lado Esquerdo: Identificação da Sessão Personalizada */}
            <div className="col-span-7 sm:col-span-8 flex items-center gap-2.5 min-w-0 pr-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </div>

              <div className="min-w-0">
                <span className="font-heading font-black text-xs sm:text-[13px] text-zinc-900 dark:text-zinc-100 block truncate">
                  Sessão de Estudo Personalizado
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">
                  {selectedNodeKeys.size > 0
                    ? `${selectedNodeKeys.size} ${selectedNodeKeys.size === 1 ? 'item selecionado' : 'itens selecionados'
                    } • ${selectedCardsList.length} flashcards prontos`
                    : 'Marque os checkboxes na tabela para compor um estudo personalizado'}
                </span>
              </div>
            </div>

            {/* Contadores da Seleção: Novo, Aprender, Revisar */}
            <div className="col-span-1 text-right text-xs">
              {renderCountNumber(selectedAnkiCounts.novo, 'novo')}
            </div>
            <div className="col-span-2 sm:col-span-1 text-right text-xs">
              {renderCountNumber(selectedAnkiCounts.aprender, 'aprender')}
            </div>
            <div className="col-span-2 sm:col-span-1 text-right text-xs">
              {renderCountNumber(selectedAnkiCounts.revisar, 'revisar')}
            </div>

            {/* Botão de Estudo Personalizado */}
            <div className="hidden sm:flex col-span-1 items-center justify-center gap-1.5">
              {selectedCardsList.length > 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    handleStartNodeStudy(
                      selectedCardsList,
                      `Estudo Personalizado (${selectedCardsList.length} cards)`
                    )
                  }
                  className="px-2 py-1 rounded-lg text-xs font-bold text-white shadow-xs hover:opacity-95 active:scale-98 transition-all inline-flex items-center gap-1 cursor-pointer shrink-0"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                  title="Estudar os cartões selecionados"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span className="hidden lg:inline">Estudar</span>
                </button>
              ) : (
                <span className="text-[10px] text-zinc-400 font-mono">0</span>
              )}
            </div>
          </div>

          {/* Ações Mobile para Sessão Personalizada */}
          {selectedCardsList.length > 0 && (
            <div className="sm:hidden pt-2.5 mt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleClearSelections}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
              >
                Limpar seleção
              </button>

              <button
                type="button"
                onClick={() =>
                  handleStartNodeStudy(
                    selectedCardsList,
                    `Estudo Personalizado (${selectedCardsList.length} cards)`
                  )
                }
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Estudar ({selectedCardsList.length})</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

