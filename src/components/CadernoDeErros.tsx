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
  Check,
  ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { UserAnswerItem, ErrorReasonType } from '@/types';
import { StudyMaterialItem } from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui';
import { renderFormattedMedicalText } from '@/utils/textSanitizer';
import { flashcardsService } from '@/services/flashcardsService';
import { StudyMaterialReader } from './StudyMaterialReader';
import {
  GranularityLevel,
  SortOption,
  calculateCadernoDashboardMetrics,
  aggregateErrorsByGranularity,
  matchStudyMaterialsForGroup,
  generateDynamicStudyMaterial,
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
  { key: 'especialidade', label: 'Especialidade' }, // Especialidade antes de tema
  { key: 'tema', label: 'Tema' },
  { key: 'foco', label: 'Foco' },
  { key: 'subfoco', label: 'Subfoco' }
];

const SORT_OPTIONS: Array<{ key: SortOption; label: string }> = [
  { key: 'recentes', label: 'Erros mais recentes' },
  { key: 'mais_erros', label: 'Maior quantidade de erros' },
  { key: 'menos_erros', label: 'Menor quantidade de erros' },
  { key: 'taxa_erros', label: 'Menor taxa de acerto (Mais vulneráveis)' },
  { key: 'maior_acerto', label: 'Maior taxa de acerto' },
  { key: 'ordem', label: 'Ordem alfabética (A–Z)' }
];

function formatRelativeTime(timestamp?: number): string {
  if (!timestamp) return 'Sem registro';
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) return diffMins <= 1 ? 'Há instantes' : `Há ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Há ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `Há ${diffWeeks} sem.`;
  return new Date(timestamp).toLocaleDateString('pt-BR');
}

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

  // Granularidade: Especialidade vem antes de tema conforme especificado
  const [granularity, setGranularity] = useState<GranularityLevel>('especialidade');

  // Filtros contextuais por nível
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('all');
  const [selectedTemaFilter, setSelectedTemaFilter] = useState<string>('all');
  const [selectedFocoFilter, setSelectedFocoFilter] = useState<string>('all');

  // Ordenação
  const [sortOption, setSortOption] = useState<SortOption>('taxa_erros');

  // Busca textual
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dropdown Popover de Filtro de Ordenação
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

  // Modal Central de Remediação
  const [selectedModalGroup, setSelectedModalGroup] = useState<GranularErrorGroup | null>(null);

  // Materiais de apoio carregados para o Leitor Oficial
  const [allMaterials, setAllMaterials] = useState<StudyMaterialItem[]>([]);
  const [activeReaderMaterial, setActiveReaderMaterial] = useState<StudyMaterialItem | null>(null);

  // Carrega acervo de materiais de apoio
  useEffect(() => {
    try {
      const mats = flashcardsService.getStudyMaterials();
      setAllMaterials(mats);
    } catch {
      setAllMaterials([]);
    }
  }, []);

  // Flashcards carregados para enriquecer dinamicamente o modal
  const allFlashcards = useMemo(() => {
    try {
      return flashcardsService.getFlashcards();
    } catch {
      return [];
    }
  }, []);

  // 1. Dashboard de Métricas Consolidadas (Estrito: acertos não são contados como corrigidos!)
  const metrics = useMemo(() => {
    return calculateCadernoDashboardMetrics(userAnswers);
  }, [userAnswers]);

  // 2. Extrai especialidades, temas e focos únicos para os filtros contextuais
  const availableSpecialties = useMemo(() => {
    const specs = new Set<string>();
    Object.values(userAnswers).forEach((ans) => {
      if (!ans.isCorrect && ans.specialty) {
        specs.add(ans.specialty);
      }
    });
    return Array.from(specs).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [userAnswers]);

  const availableTemas = useMemo(() => {
    const temas = new Set<string>();
    Object.values(userAnswers).forEach((ans) => {
      if (!ans.isCorrect && ans.tema) {
        if (selectedSpecialtyFilter === 'all' || ans.specialty === selectedSpecialtyFilter) {
          temas.add(ans.tema);
        }
      }
    });
    return Array.from(temas).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [userAnswers, selectedSpecialtyFilter]);

  const availableFocos = useMemo(() => {
    const focos = new Set<string>();
    Object.values(userAnswers).forEach((ans) => {
      if (!ans.isCorrect && ans.foco) {
        const matchSpec = selectedSpecialtyFilter === 'all' || ans.specialty === selectedSpecialtyFilter;
        const matchTema = selectedTemaFilter === 'all' || ans.tema === selectedTemaFilter;
        if (matchSpec && matchTema) {
          focos.add(ans.foco);
        }
      }
    });
    return Array.from(focos).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [userAnswers, selectedSpecialtyFilter, selectedTemaFilter]);

  // 3. Agrupamento dinâmico na granularidade selecionada
  const rawGroupedItems = useMemo(() => {
    return aggregateErrorsByGranularity(
      userAnswers,
      {},
      granularity,
      sortOption,
      searchQuery
    );
  }, [userAnswers, granularity, sortOption, searchQuery]);

  // 4. Aplica os filtros contextuais por nível (especialidade, tema, foco)
  const groupedItems = useMemo(() => {
    let list = rawGroupedItems;
    if (granularity === 'tema' && selectedSpecialtyFilter !== 'all') {
      list = list.filter((g) => g.specialty === selectedSpecialtyFilter);
    } else if (granularity === 'foco') {
      if (selectedSpecialtyFilter !== 'all') {
        list = list.filter((g) => g.specialty === selectedSpecialtyFilter);
      }
      if (selectedTemaFilter !== 'all') {
        list = list.filter((g) => g.tema === selectedTemaFilter);
      }
    } else if (granularity === 'subfoco') {
      if (selectedSpecialtyFilter !== 'all') {
        list = list.filter((g) => g.specialty === selectedSpecialtyFilter);
      }
      if (selectedTemaFilter !== 'all') {
        list = list.filter((g) => g.tema === selectedTemaFilter);
      }
      if (selectedFocoFilter !== 'all') {
        list = list.filter((g) => g.foco === selectedFocoFilter);
      }
    }
    return list;
  }, [rawGroupedItems, granularity, selectedSpecialtyFilter, selectedTemaFilter, selectedFocoFilter]);

  // Quantidade de flashcards reais correspondentes ao grupo selecionado no modal
  const matchingFlashcardsCount = useMemo(() => {
    if (!selectedModalGroup) return 0;
    return allFlashcards.filter((card) => {
      if (selectedModalGroup.level === 'especialidade') {
        return card.specialty === selectedModalGroup.name;
      }
      if (selectedModalGroup.level === 'tema') {
        return card.theme === selectedModalGroup.name || (selectedModalGroup.specialty && card.specialty === selectedModalGroup.specialty);
      }
      return card.theme === selectedModalGroup.tema || card.specialty === selectedModalGroup.specialty;
    }).length;
  }, [selectedModalGroup, allFlashcards]);

  // Material de estudo correspondente ao grupo selecionado no modal (com recomendação inteligente de ponto cego)
  const recommendationInfo = useMemo(() => {
    if (!selectedModalGroup) return null;

    // 1. Verificar se há resumo específico direto para o tema ou foco deste grupo
    // (Importante: Especialidade é categoria ampla e NUNCA possui resumo direto único)
    const directMatches = selectedModalGroup.level === 'especialidade' ? [] : allMaterials.filter((m) => {
      if (selectedModalGroup.level === 'foco') {
        const foc = (selectedModalGroup.foco || selectedModalGroup.name).toLowerCase().trim();
        return (
          (m.focus && m.focus.toLowerCase().trim() === foc) ||
          (m.title && m.title.toLowerCase().includes(foc))
        );
      }
      if (selectedModalGroup.level === 'tema') {
        const tem = (selectedModalGroup.tema || selectedModalGroup.name).toLowerCase().trim();
        return (
          (m.theme && m.theme.toLowerCase().trim() === tem) ||
          (m.focus && m.focus.toLowerCase().trim() === tem) ||
          (m.title && m.title.toLowerCase().includes(tem))
        );
      }
      if (selectedModalGroup.level === 'subfoco') {
        const sub = (selectedModalGroup.subfoco || selectedModalGroup.name).toLowerCase().trim();
        return (
          (m.title && m.title.toLowerCase().includes(sub)) ||
          (m.focus && m.focus.toLowerCase().trim() === (selectedModalGroup.foco || '').toLowerCase().trim())
        );
      }
      return false;
    });

    if (directMatches.length > 0) {
      return {
        isDirect: true,
        material: directMatches[0],
        vulnerableTopic: directMatches[0].title,
        errorCount: selectedModalGroup.pendingErrorsCount
      };
    }

    // 2. Não há resumo específico direto (ex: especialidade geral) -> identificar onde está o MAIOR erro
    const topFoco =
      selectedModalGroup.topFocos && selectedModalGroup.topFocos.length > 0
        ? selectedModalGroup.topFocos[0]
        : null;

    let targetMaterial: StudyMaterialItem | null = null;
    let targetName = '';
    let errorCount = 0;

    if (topFoco) {
      targetName = topFoco.foco;
      errorCount = topFoco.count;
      targetMaterial =
        allMaterials.find(
          (m) =>
            (m.focus && m.focus.toLowerCase().includes(topFoco.foco.toLowerCase())) ||
            (m.theme && m.theme.toLowerCase().includes(topFoco.foco.toLowerCase())) ||
            (m.title && m.title.toLowerCase().includes(topFoco.foco.toLowerCase()))
        ) || null;
    }

    // Se ainda não encontrou e for especialidade, busca o tema/foco com mais erros
    if (!targetMaterial) {
      const countMap = new Map<string, number>();
      selectedModalGroup.pendingQuestionIds.forEach((qid) => {
        const ans = userAnswers[qid];
        const key = ans?.tema || ans?.foco;
        if (key) {
          countMap.set(key, (countMap.get(key) || 0) + 1);
        }
      });
      const sorted = Array.from(countMap.entries()).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        targetName = sorted[0][0];
        errorCount = sorted[0][1];
        targetMaterial =
          allMaterials.find(
            (m) =>
              (m.theme && m.theme.toLowerCase().includes(targetName.toLowerCase())) ||
              (m.focus && m.focus.toLowerCase().includes(targetName.toLowerCase())) ||
              (m.title && m.title.toLowerCase().includes(targetName.toLowerCase()))
          ) || null;
      }
    }

    // Fallback: qualquer material da especialidade
    if (!targetMaterial && selectedModalGroup.specialty) {
      targetMaterial = allMaterials.find((m) => m.specialty === selectedModalGroup.specialty) || null;
    }

    return {
      isDirect: false,
      material: targetMaterial,
      vulnerableTopic: targetName || selectedModalGroup.name,
      errorCount: errorCount || selectedModalGroup.pendingErrorsCount
    };
  }, [selectedModalGroup, allMaterials, userAnswers]);

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

  // Ação 3: Direcionamento Inteligente (Resumo Específico vs. Materiais Mais Amplos)
  const handleOpenRecommendedMaterials = (group: GranularErrorGroup) => {
    setSelectedModalGroup(null);

    // CASO 1: HÁ RESUMO ESPECÍFICO DIRETO (Tema ou Foco com resumo homologado)
    if (recommendationInfo?.isDirect && recommendationInfo.material) {
      // Abre diretamente o Resumo Clínico Oficial no leitor dedicado
      setActiveReaderMaterial(recommendationInfo.material);
      return;
    }

    // CASO 2: NÃO HÁ RESUMO ESPECÍFICO (Categoria Ampla como Especialidade ou Tema sem resumo único)
    // Direciona para a central de materiais mais amplos (/resumos), aplicando filtros da especialidade e do foco vulnerável
    const params = new URLSearchParams();
    if (group.specialty) {
      params.set('especialidade', group.specialty);
    }
    if (recommendationInfo?.vulnerableTopic && recommendationInfo.vulnerableTopic !== group.name) {
      params.set('q', recommendationInfo.vulnerableTopic);
    } else {
      if (group.tema) params.set('tema', group.tema);
      if (group.foco) params.set('foco', group.foco);
    }

    router.push(`/resumos?${params.toString()}`);
  };

  // Se o aluno abriu o material de apoio para leitura aprofundada
  if (activeReaderMaterial) {
    return (
      <div className="animate-in fade-in duration-150 font-inter space-y-3">
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={() => setActiveReaderMaterial(null)}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 inline-flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            ← Voltar ao Caderno de Erros
          </button>
          <span className="text-xs text-zinc-400 font-medium hidden sm:inline-block">
            Material de Remediação Ativa
          </span>
        </div>
        <StudyMaterialReader
          material={activeReaderMaterial}
          onBack={() => setActiveReaderMaterial(null)}
          onPracticeFlashcards={(mat) => {
            setActiveReaderMaterial(null);
            handleOpenFlashcards(mat.theme, mat.focus, mat.specialty);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="space-y-4 font-inter text-zinc-900 dark:text-zinc-100 antialiased animate-in fade-in duration-150"
      style={{ fontFamily: 'var(--font-inter), "Inter", -apple-system, sans-serif' }}
    >
      {/* ============================================================ */}
      {/* 1. COCKPIT ANALÍTICO COM DONUT COMPACTO & DESIGN DINÂMICO   */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
          {/* Lado Esquerdo: Donut Chart Compacto + Rótulos Centrais */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
            {/* Container do Donut Chart (Proporção equilibrada ~98px) */}
            <div className="relative w-[96px] h-[96px] sm:w-[102px] sm:h-[102px] shrink-0 flex items-center justify-center">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={46}
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
                <div className="w-[96px] h-[96px] sm:w-[102px] sm:h-[102px] rounded-full border-4 border-zinc-100 dark:border-zinc-800/60 animate-pulse" />
              )}

              {/* Centro do Donut: Taxa de Superação em Fonte Inter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                  {metrics.taxaSuperacao}%
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-0.5">
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
      {/* 2. CONTROLES: NAVEGAÇÃO DE GRANULARIDADE, BUSCA E FILTROS */}
      {/* ============================================================ */}
      <div className="space-y-2 py-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Lado Esquerdo: Pílulas de Granularidade (Especialidade, Tema, Foco, Subfoco) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {GRANULARITY_OPTIONS.map((opt) => {
              const isActive = granularity === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setGranularity(opt.key);
                    setSelectedSpecialtyFilter('all');
                    setSelectedTemaFilter('all');
                    setSelectedFocoFilter('all');
                  }}
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

          {/* Lado Direito: Botão Filtro com Popover Dropdown de Ordenação */}
          <div className="relative shrink-0" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-zinc-200/80 hover:bg-zinc-300/80 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300/60 dark:border-zinc-700/80 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
              <span>Ordenar</span>
              <ChevronDown className={`w-3 h-3 text-zinc-500 dark:text-zinc-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute left-0 md:left-auto md:right-0 top-full mt-2 w-64 max-w-[calc(100vw-32px)] py-1.5 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-30 font-inter animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Critério de Ordenação
                </div>
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

        {/* Subfiltros Contextuais (Tema -> Especialidade | Foco -> Especialidade + Tema | Subfoco -> Especialidade + Tema + Foco) */}
        {granularity !== 'especialidade' && (
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-0.5 animate-in fade-in duration-100 text-xs">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 flex items-center gap-1 shrink-0">
              <SlidersHorizontal className="w-3 h-3" />
              Filtrar por:
            </span>

            {/* Filtro de Especialidade (para tema, foco e subfoco) */}
            <div className="relative">
              <select
                value={selectedSpecialtyFilter}
                onChange={(e) => {
                  setSelectedSpecialtyFilter(e.target.value);
                  setSelectedTemaFilter('all');
                  setSelectedFocoFilter('all');
                }}
                className="px-3 py-1 text-xs rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 font-medium cursor-pointer transition-all pr-6 focus:outline-hidden"
              >
                <option value="all">Todas as Especialidades</option>
                {availableSpecialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Tema (para foco e subfoco) */}
            {(granularity === 'foco' || granularity === 'subfoco') && (
              <div className="relative">
                <select
                  value={selectedTemaFilter}
                  onChange={(e) => {
                    setSelectedTemaFilter(e.target.value);
                    setSelectedFocoFilter('all');
                  }}
                  className="px-3 py-1 text-xs rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 font-medium cursor-pointer transition-all pr-6 focus:outline-hidden max-w-[200px] truncate"
                >
                  <option value="all">Todos os Temas</option>
                  {availableTemas.map((tm) => (
                    <option key={tm} value={tm}>
                      {tm}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filtro de Foco (para subfoco) */}
            {granularity === 'subfoco' && (
              <div className="relative">
                <select
                  value={selectedFocoFilter}
                  onChange={(e) => setSelectedFocoFilter(e.target.value)}
                  className="px-3 py-1 text-xs rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 font-medium cursor-pointer transition-all pr-6 focus:outline-hidden max-w-[200px] truncate"
                >
                  <option value="all">Todos os Focos</option>
                  {availableFocos.map((fc) => (
                    <option key={fc} value={fc}>
                      {fc}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Botão de limpar filtros se algum estiver ativo */}
            {(selectedSpecialtyFilter !== 'all' || selectedTemaFilter !== 'all' || selectedFocoFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSpecialtyFilter('all');
                  setSelectedTemaFilter('all');
                  setSelectedFocoFilter('all');
                }}
                className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer ml-1"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. LISTA LIMPA, FLUIDA E INTEGRADA DE VULNERABILIDADES */}
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
            {searchQuery || selectedSpecialtyFilter !== 'all'
              ? 'Nenhum agrupamento correspondeu aos filtros aplicados.'
              : 'Excelente! Todas as questões desta categoria foram superadas ou ainda não possuem erros registrados.'}
          </p>
          {(searchQuery || selectedSpecialtyFilter !== 'all' || selectedTemaFilter !== 'all' || selectedFocoFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialtyFilter('all');
                setSelectedTemaFilter('all');
                setSelectedFocoFilter('all');
              }}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer pt-1"
            >
              Limpar filtros e busca
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {groupedItems.map((group) => {
            const parentHierarchy =
              group.level === 'tema'
                ? (group.specialty || '')
                : group.level === 'foco'
                ? [group.specialty, group.tema].filter(Boolean).join(' › ')
                : group.level === 'subfoco'
                ? [group.specialty, group.tema, group.foco].filter(Boolean).join(' › ')
                : '';

            const isLowAccuracy = group.accuracyPercent < 50;

            return (
              <div
                key={group.id}
                onClick={() => setSelectedModalGroup(group)}
                className="w-full bg-white dark:bg-[#131316] border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 flex flex-col md:grid md:grid-cols-[1fr_210px_160px] md:items-center gap-3 shadow-2xs hover:shadow-xs hover:bg-zinc-50/70 dark:hover:bg-[#17171b] hover:scale-[1.004] active:scale-[0.99] transition-all font-inter cursor-pointer group"
              >
                {/* Lado Esquerdo: Nome do Tópico + Hierarquia sempre visível em telas touch */}
                <div className="min-w-0 pr-3">
                  <h4
                    className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors"
                    title={parentHierarchy ? `${parentHierarchy} › ${group.name}` : group.name}
                  >
                    {group.name}
                  </h4>
                  {parentHierarchy && (
                    <div className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 truncate transition-all duration-150 opacity-100 h-3.5 mt-0.5 md:opacity-0 md:h-0 md:mt-0 md:group-hover:opacity-100 md:group-hover:h-3.5 md:group-hover:mt-0.5 pointer-events-none">
                      {parentHierarchy}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 w-full md:contents">
                  {/* Centro: Mini-Barra Visual de Aproveitamento (Alinhamento Estrito de Colunas) */}
                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 py-0.5 md:py-0">
                    <div className="w-20 sm:w-28 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden shrink-0">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLowAccuracy ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(group.accuracyPercent, 3)}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold shrink-0 ${
                        isLowAccuracy ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {group.accuracyPercent}% acerto
                    </span>
                  </div>

                  {/* Lado Direito: Badge Integrado de Erros/Superadas + Seta de Navegação */}
                  <div className="flex items-center gap-2 shrink-0 justify-end">
                    <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-[11px] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 sm:gap-2 shrink-0 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="text-rose-600 dark:text-rose-400 font-bold">
                        {group.pendingErrorsCount} {group.pendingErrorsCount === 1 ? 'erro' : 'erros'}
                      </span>
                      {group.recoveredErrorsCount > 0 && (
                        <>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {group.recoveredErrorsCount} <span className="hidden xs:inline">superadas</span>
                          </span>
                        </>
                      )}
                    </div>

                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-zinc-400 group-hover:text-zinc-100 group-hover:bg-zinc-800/80 transition-all shrink-0">
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MODAL / DRAWER CENTRAL DE REMEDIAÇÃO CLÍNICA COM DADOS REAIS */}
      {/* ============================================================ */}
      {selectedModalGroup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-inter"
          onClick={() => setSelectedModalGroup(null)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-3 shrink-0">
              <div className="space-y-1 min-w-0">
                {(() => {
                  const modalHierarchy =
                    selectedModalGroup.level === 'tema'
                      ? selectedModalGroup.specialty
                      : selectedModalGroup.level === 'foco'
                      ? [selectedModalGroup.specialty, selectedModalGroup.tema].filter(Boolean).join(' › ')
                      : selectedModalGroup.level === 'subfoco'
                      ? [selectedModalGroup.specialty, selectedModalGroup.tema, selectedModalGroup.foco].filter(Boolean).join(' › ')
                      : 'Especialidade';

                  return (
                    modalHierarchy ? (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                        {modalHierarchy}
                      </span>
                    ) : null
                  );
                })()}
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                  {selectedModalGroup.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedModalGroup(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo com Dados Reais do Aluno */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Card de Diagnóstico Real dos Erros */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18181b] border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-rose-500" />
                    Raio-X das Questões Erradas
                  </span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    {selectedModalGroup.pendingErrorsCount} {selectedModalGroup.pendingErrorsCount === 1 ? 'pendência ativa' : 'pendências ativas'}
                  </span>
                </div>

                {/* Grid de Métricas Concretas Separadas */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {/* Fáceis (Impacto TRI) */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-medium block">Fáceis (Alerta TRI)</span>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                      {selectedModalGroup.difficultyStats?.facil || 0}
                    </span>
                  </div>

                  {/* Médias */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-medium block">Médias</span>
                    <span className="text-sm font-bold text-amber-500 dark:text-amber-400">
                      {selectedModalGroup.difficultyStats?.medio || 0}
                    </span>
                  </div>

                  {/* Difíceis */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-medium block">Difíceis</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedModalGroup.difficultyStats?.dificil || 0}
                    </span>
                  </div>

                  {/* Recência do Erro */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-medium block">Último erro</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate block mt-0.5">
                      {formatRelativeTime(selectedModalGroup.lastErrorTimestamp)}
                    </span>
                  </div>

                  {/* Reincidentes */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200/60 dark:border-zinc-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-zinc-400 font-medium block">Reincidentes (&gt;1x)</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedModalGroup.reincidentCount || 0}
                    </span>
                  </div>
                </div>

                {/* Bancas Reais com Erros */}
                {selectedModalGroup.topBancas && selectedModalGroup.topBancas.length > 0 && (
                  <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-zinc-400 font-medium">Bancas com erros:</span>
                    {selectedModalGroup.topBancas.map((b) => (
                      <span
                        key={b.banca}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80"
                      >
                        {b.banca} ({b.count})
                      </span>
                    ))}
                  </div>
                )}

                {/* Focos Vulneráveis */}
                {selectedModalGroup.topFocos && selectedModalGroup.topFocos.length > 0 && (
                  <div className="pt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-zinc-400 font-medium">Focos vulneráveis:</span>
                    {selectedModalGroup.topFocos.map((f) => (
                      <span
                        key={f.foco}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                      >
                        {f.foco} ({f.count})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 3 Blocos de Ação Direta (Apenas Dados Reais + Ação) */}
              <div className="space-y-2.5 pt-1">
                {/* Opção 1: Resolver Questões */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      <Zap className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        Resolver Questões Pendentes
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        <span>{selectedModalGroup.pendingErrorsCount} questões</span>
                        <span>•</span>
                        <span>~{selectedModalGroup.pendingErrorsCount * 2} min estimados</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      const ids = selectedModalGroup.pendingQuestionIds;
                      setSelectedModalGroup(null);
                      handleResolveErrors(ids);
                    }}
                    style={{ backgroundColor: accentConfig.primaryHex }}
                    className="w-full sm:w-auto font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Resolver ({selectedModalGroup.pendingErrorsCount})
                  </Button>
                </div>

                {/* Opção 2: Flashcards Direcionados */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        Flashcards de Fixação
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        <span>{matchingFlashcardsCount} flashcards catalogados</span>
                        <span>•</span>
                        <span>Algoritmo FSRS</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const g = selectedModalGroup;
                      setSelectedModalGroup(null);
                      handleOpenFlashcards(g.tema, g.foco, g.specialty);
                    }}
                    className="w-full sm:w-auto font-bold text-xs text-purple-600 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/10 shrink-0 cursor-pointer"
                  >
                    Praticar Flashcards
                  </Button>
                </div>

                {/* Opção 3: Resumo Clínico Específico OU Materiais de Apoio Amplos */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                        recommendationInfo?.isDirect
                          ? 'bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-400'
                          : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {recommendationInfo?.isDirect ? (
                        <BookOpen className="w-5 h-5" />
                      ) : (
                        <Layers className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {recommendationInfo?.isDirect
                            ? 'Resumo Clínico Oficial'
                            : 'Materiais de Apoio da Especialidade'}
                        </h4>
                        {!recommendationInfo?.isDirect && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0">
                            Acervo Amplo
                          </span>
                        )}
                      </div>

                      {recommendationInfo?.isDirect ? (
                        recommendationInfo.material ? (
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span>{recommendationInfo.material.readTimeMinutes} min de leitura</span>
                            <span>•</span>
                            <span>{recommendationInfo.material.guidelineBadge || 'Diretriz Oficial'}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                            Revisão teórica aprofundada de {selectedModalGroup.name}
                          </span>
                        )
                      ) : (
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
                              <Target className="w-3 h-3 text-rose-500" />
                              {recommendationInfo?.errorCount} {recommendationInfo?.errorCount === 1 ? 'erro registrado' : 'erros registrados'}
                            </span>
                            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                              em <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{recommendationInfo?.vulnerableTopic}</strong>
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            Categoria ampla. Direcionando para o acervo de materiais teóricos, com foco no seu maior ponto cego.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const g = selectedModalGroup;
                      handleOpenRecommendedMaterials(g);
                    }}
                    className={`w-full sm:w-auto font-bold text-xs shrink-0 cursor-pointer ${
                      recommendationInfo?.isDirect
                        ? 'text-sky-600 dark:text-sky-300 border-sky-500/30 hover:bg-sky-500/10'
                        : 'text-indigo-600 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10'
                    }`}
                  >
                    {recommendationInfo?.isDirect ? (
                      'Abrir Resumo'
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <span>Ver Materiais de Apoio</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
