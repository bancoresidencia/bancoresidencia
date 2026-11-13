'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertOctagon,
  CheckCircle2,
  Search,
  Zap,
  Brain,
  BookOpen,
  X,
  TrendingDown,
  TrendingUp,
  Layers,
  ArrowUpDown,
  ExternalLink,
  Clock,
  Sparkles,
  Target,
  SlidersHorizontal,
  ChevronDown,
  Check
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { UserAnswerItem, ErrorReasonType } from '@/types';
import { StudyMaterialItem } from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui';
import { renderFormattedMedicalText } from '@/utils/textSanitizer';
import { flashcardsService } from '@/services/flashcardsService';
import {
  GranularityLevel,
  SortOption,
  calculateCadernoDashboardMetrics,
  aggregateErrorsByGranularity,
  matchStudyMaterialsForGroup,
  GranularErrorGroup
} from '@/services/cadernoErrosService';

interface CadernoDeErrosProps {
  userAnswers: Record<string, UserAnswerItem>;
  bookmarkedQuestionIds?: Record<string, boolean>;
  onUpdateAnswerMeta: (
    questionId: string,
    meta: {
      errorReason?: ErrorReasonType;
      studentNotes?: string;
      statusRetrial?: 'pendente' | 'recuperado';
    }
  ) => void;
  onAnswerQuestion: (
    questionId: string,
    selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E',
    isCorrect: boolean
  ) => void;
  onStartTreinoErros: (questionIds: string[]) => void;
  onNavigateToBanco?: (specialty?: string, tema?: string, subfoco?: string) => void;
}

const GRANULARITY_OPTIONS: Array<{ key: GranularityLevel; label: string }> = [
  { key: 'tema', label: 'Tema' }, // Padrão
  { key: 'especialidade', label: 'Especialidade' },
  { key: 'foco', label: 'Foco' },
  { key: 'subfoco', label: 'Subfoco' }
];

const SORT_OPTIONS: Array<{ key: SortOption; label: string }> = [
  { key: 'taxa_erros', label: 'Mais taxa de erros' }, // Padrão
  { key: 'mais_erros', label: 'Mais erros' },
  { key: 'ordem', label: 'Ordem' }
];

export const CadernoDeErros: React.FC<CadernoDeErrosProps> = ({
  userAnswers,
  onStartTreinoErros
}) => {
  const router = useRouter();
  const { accentConfig, mode } = useTheme();
  const isDark = mode === 'dark';
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Granularidade: Padrão é 'tema' conforme especificado
  const [granularity, setGranularity] = useState<GranularityLevel>('tema');

  // Ordenação: Padrão é 'taxa_erros' (menor taxa de acertos / maior taxa de erros)
  const [sortOption, setSortOption] = useState<SortOption>('taxa_erros');

  // Busca textual
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dropdown Popover de Filtro
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  // Materiais de apoio carregados para o Drawer
  const [allMaterials, setAllMaterials] = useState<StudyMaterialItem[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterialItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Carrega acervo de materiais de apoio
  useEffect(() => {
    try {
      const mats = flashcardsService.getStudyMaterials();
      setAllMaterials(mats);
    } catch {
      setAllMaterials([]);
    }
  }, []);

  // 1. Dashboard de Métricas Consolidadas (Estrito: acertos não são contados como corrigidos!)
  const metrics = useMemo(() => {
    return calculateCadernoDashboardMetrics(userAnswers);
  }, [userAnswers]);

  // 2. Agrupamento dinâmico na granularidade selecionada
  const groupedItems = useMemo(() => {
    return aggregateErrorsByGranularity(
      userAnswers,
      {},
      granularity,
      sortOption,
      searchQuery
    );
  }, [userAnswers, granularity, sortOption, searchQuery]);

  // 3. Dados Dinâmicos para o Donut Chart de Pendentes vs Corrigidos
  const donutData = useMemo(() => {
    const pendentes = metrics.pendentes;
    const corrigidos = metrics.resolvidos;

    if (pendentes === 0 && corrigidos === 0) {
      return [{ name: 'Sem Pendências', value: 1, color: isDark ? '#27272a' : '#e4e4e7' }];
    }

    const data = [];
    if (pendentes > 0) {
      data.push({ name: 'Pendentes', value: pendentes, color: '#f43f5e' });
    }
    if (corrigidos > 0) {
      data.push({ name: 'Corrigidos', value: corrigidos, color: '#10b981' });
    }
    return data;
  }, [metrics.pendentes, metrics.resolvidos, isDark]);

  // Ação 1: Resolver Erros daquele agrupamento
  const handleResolveErrors = (questionIds: string[]) => {
    if (!questionIds || questionIds.length === 0) return;
    onStartTreinoErros(questionIds);
  };

  // Ação 2: Flashcards Direcionados daquele agrupamento
  const handleOpenFlashcards = (tema?: string, foco?: string, specialty?: string) => {
    const params = new URLSearchParams();
    params.set('mode', 'erros');
    if (specialty) params.set('especialidade', specialty);
    if (tema) params.set('tema', tema);
    if (foco) params.set('foco', foco);
    router.push(`/flashcards?${params.toString()}`);
  };

  // Ação 3: Materiais Recomendados daquele agrupamento
  const handleOpenRecommendedMaterials = (group: GranularErrorGroup) => {
    const matched = matchStudyMaterialsForGroup(allMaterials, group);
    if (matched.length > 0) {
      setSelectedMaterial(matched[0]);
      setIsDrawerOpen(true);
    } else {
      const params = new URLSearchParams();
      if (group.specialty) params.set('especialidade', group.specialty);
      if (group.tema) params.set('tema', group.tema);
      if (group.foco) params.set('foco', group.foco);
      router.push(`/resumos?${params.toString()}`);
    }
  };

  return (
    <div
      className="space-y-4 font-inter text-zinc-900 dark:text-zinc-100 antialiased animate-in fade-in duration-150"
      style={{ fontFamily: 'var(--font-inter), "Inter", -apple-system, sans-serif' }}
    >
      {/* ============================================================ */}
      {/* 1. COCKPIT ANALÍTICO COM DONUT AMPLIADO & DESIGN DINÂMICO */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xs transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Lado Esquerdo: Donut Chart Rebalanceado + Rótulos Centrais */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Container do Donut Chart (Proporção calibrada ~124px) */}
            <div className="relative w-[115px] h-[115px] sm:w-[124px] sm:h-[124px] shrink-0 flex items-center justify-center">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={39}
                      outerRadius={56}
                      paddingAngle={donutData.length > 1 ? 3 : 0}
                      cornerRadius={4}
                      stroke="none"
                      isAnimationActive={true}
                      animationDuration={600}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="bg-zinc-900/95 backdrop-blur-xs text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg border border-zinc-700/60 font-inter">
                              <span className="font-semibold text-zinc-200">{data.name}:</span>{' '}
                              <strong className="text-emerald-400 font-bold">{data.value}</strong>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-[115px] h-[115px] sm:w-[124px] sm:h-[124px] rounded-full border-6 border-zinc-100 dark:border-zinc-800/60 animate-pulse" />
              )}

              {/* Centro do Donut: Taxa de Superação em Fonte Inter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                  {metrics.taxaSuperacao}%
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-0.5">
                  superados
                </span>
              </div>
            </div>

            {/* Cabeçalho Textual + Mini Cards Analíticos */}
            <div className="space-y-2.5 text-center sm:text-left">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                  </div>
                  <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    Caderno de Erros
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                    Remediação Ativa
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Mapeamento de vulnerabilidades clínicas ordenado automaticamente pela menor taxa de acerto.
                </p>
              </div>

              {/* Indicadores Dinâmicos de Status */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                {/* 1. Pendentes */}
                <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                    Pendentes: <strong className="font-bold text-rose-700 dark:text-rose-300">{metrics.pendentes}</strong>
                  </span>
                </div>

                {/* 2. Corrigidas */}
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    Corrigidas: <strong className="font-bold text-emerald-700 dark:text-emerald-300">{metrics.resolvidos}</strong>
                  </span>
                </div>

                {/* 3. Taxa Global de Acerto */}
                <div className="px-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    Acerto geral: <strong className="font-bold text-zinc-900 dark:text-zinc-100">{metrics.taxaAcertoGlobal}%</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: Botão CTA Principal de Resolução */}
          {metrics.pendentes > 0 && (
            <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-end justify-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800/80">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Zap className="w-4 h-4 fill-white" />}
                onClick={() => {
                  const allPending = groupedItems.flatMap((g) => g.pendingQuestionIds);
                  if (allPending.length > 0) handleResolveErrors(allPending);
                }}
                className="w-full sm:w-auto font-bold text-xs shadow-md hover:scale-102 active:scale-98 transition-all"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  boxShadow: `0 4px 14px -3px ${accentConfig.bgRgba}`
                }}
              >
                Resolver Todas as Pendências ({metrics.pendentes})
              </Button>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Sessão focada nos seus erros
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CONTROLES: NAVEGAÇÃO DE GRANULARIDADE, BUSCA E FILTRO */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-1">
        {/* Lado Esquerdo: Pílulas de Granularidade (Tema, Especialidade, Foco, Subfoco) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {GRANULARITY_OPTIONS.map((opt) => {
            const isActive = granularity === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setGranularity(opt.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'text-white shadow-xs font-bold'
                    : 'bg-zinc-200/80 hover:bg-zinc-300/80 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300/60 dark:border-zinc-700/80'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: accentConfig.primaryHex || '#0ea5e9'
                      }
                    : undefined
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Centro: Campo de Busca em Formato Pílula */}
        <div className="relative flex-1 max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar"
            className="w-full pl-9 pr-7 py-1.5 text-xs rounded-full bg-zinc-200/80 dark:bg-zinc-800/90 border border-zinc-300/60 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500/50 transition-all font-inter"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Lado Direito: Botão Filtro com Popover Dropdown */}
        <div className="relative shrink-0" ref={filterRef}>
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-zinc-200/80 hover:bg-zinc-300/80 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300/60 dark:border-zinc-700/80 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Filtro</span>
            <ChevronDown className={`w-3 h-3 text-zinc-500 dark:text-zinc-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 py-1.5 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-30 font-inter animate-in fade-in zoom-in-95 duration-100">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortOption === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setSortOption(opt.key);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors ${
                      isSelected
                        ? 'font-bold text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-500" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. LISTA DE PÍLULAS DINÂMICAS E SUAVES */}
      {/* ============================================================ */}
      {groupedItems.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl space-y-2 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 stroke-[2]" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Nenhum erro pendente nesta categoria
          </h3>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Nenhum agrupamento correspondeu aos termos da sua busca.'
              : 'Excelente! Todas as questões desta categoria foram superadas ou ainda não possuem erros registrados.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer pt-1"
            >
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-2.5">
          {groupedItems.map((group) => {
            const isHighErrorRate = group.accuracyPercent < 50;

            return (
              <div
                key={group.id}
                className="w-full bg-white dark:bg-[#151518] border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl lg:rounded-full px-4 sm:px-5 py-2.5 sm:py-2.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all font-inter"
              >
                {/* Lado Esquerdo: Nome + Badges de % acertos e erros */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="min-w-[130px] max-w-xs">
                    <span
                      className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate block"
                      title={group.name}
                    >
                      {group.name}
                    </span>
                    {group.specialty && group.level !== 'especialidade' && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate block">
                        {group.specialty}
                      </span>
                    )}
                  </div>

                  {/* % acertos */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 shrink-0 ${
                      isHighErrorRate
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                    }`}
                  >
                    {isHighErrorRate ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    <span>{group.accuracyPercent}% acertos</span>
                  </span>

                  {/* Quantidade de erros */}
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/25 shrink-0">
                    {group.pendingErrorsCount} {group.pendingErrorsCount === 1 ? 'erro' : 'erros'}
                  </span>

                  {/* Quantidade de questões corrigidas se houver */}
                  {group.recoveredErrorsCount > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hidden xl:inline-flex items-center gap-1 shrink-0">
                      ✓ {group.recoveredErrorsCount} corrigidas
                    </span>
                  )}
                </div>

                {/* Lado Direito: As 3 Ações Diretas */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto justify-end">
                  {/* Ação 1: Resolver erros */}
                  <button
                    type="button"
                    onClick={() => handleResolveErrors(group.pendingQuestionIds)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white shadow-2xs hover:opacity-95 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    style={{
                      backgroundColor: accentConfig.primaryHex || '#0ea5e9'
                    }}
                    title={`Resolver ${group.pendingErrorsCount} erros`}
                  >
                    <Zap className="w-3 h-3 fill-white" />
                    <span>Resolver erros</span>
                  </button>

                  {/* Ação 2: Flashcards Direcionados */}
                  <button
                    type="button"
                    onClick={() => handleOpenFlashcards(group.tema, group.foco, group.specialty)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/25 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    title={`Estudar flashcards direcionados de ${group.name}`}
                  >
                    <Brain className="w-3 h-3 text-purple-500" />
                    <span>Flashcards Direcionados</span>
                  </button>

                  {/* Ação 3: Materiais recomendados */}
                  <button
                    type="button"
                    onClick={() => handleOpenRecommendedMaterials(group)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    title={`Ver materiais recomendados de ${group.name}`}
                  >
                    <BookOpen className="w-3 h-3 text-zinc-400" />
                    <span>Materiais recomendados</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. DRAWER LATERAL DE MATERIAIS RECOMENDADOS */}
      {/* ============================================================ */}
      {isDrawerOpen && selectedMaterial && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#121215] h-full shadow-xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right duration-150 font-inter">
            {/* Header do Drawer */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Material Recomendado
                  </span>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {selectedMaterial.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Conteúdo com Rolagem */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs leading-relaxed text-zinc-800 dark:text-zinc-200">
              {/* Badges do Resumo */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md font-medium text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {selectedMaterial.specialty}
                </span>
                <span className="px-2 py-0.5 rounded-md font-medium text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {selectedMaterial.theme}
                </span>
                {selectedMaterial.guidelineBadge && (
                  <span className="px-2 py-0.5 rounded-md font-bold text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    {selectedMaterial.guidelineBadge}
                  </span>
                )}
                <span className="text-zinc-400 text-[10px] flex items-center gap-1 ml-auto">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedMaterial.readTimeMinutes} min de leitura
                </span>
              </div>

              {/* Pontos Chave */}
              {selectedMaterial.keyPoints && selectedMaterial.keyPoints.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <span className="font-bold text-amber-900 dark:text-amber-200 text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Pontos Decisivos de Prova:
                  </span>
                  <ul className="space-y-0.5 text-[11px] text-amber-950 dark:text-amber-100 list-disc list-inside">
                    {selectedMaterial.keyPoints.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Texto Markdown Formatado */}
              <div className="prose dark:prose-invert prose-xs max-w-none text-zinc-800 dark:text-zinc-200">
                {renderFormattedMedicalText(selectedMaterial.markdownContent)}
              </div>
            </div>

            {/* Footer do Drawer com Ações Rápidas */}
            <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] flex items-center justify-between gap-2 shrink-0">
              <Button
                size="xs"
                variant="secondary"
                leftIcon={<Brain className="w-3 h-3 text-purple-500" />}
                onClick={() => {
                  setIsDrawerOpen(false);
                  handleOpenFlashcards(selectedMaterial.theme, selectedMaterial.focus, selectedMaterial.specialty);
                }}
              >
                Estudar Flashcards
              </Button>

              <Button
                size="xs"
                variant="primary"
                rightIcon={<ExternalLink className="w-3 h-3" />}
                onClick={() => {
                  setIsDrawerOpen(false);
                  router.push(`/resumos?especialidade=${encodeURIComponent(selectedMaterial.specialty)}&tema=${encodeURIComponent(selectedMaterial.theme)}`);
                }}
              >
                Ver nos Resumos
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
