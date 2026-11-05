'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Plus,
  Bookmark,
  CheckCircle2,
  Check,
  AlertCircle,
  HelpCircle,
  X,
  FileCheck2,
  Highlighter,
  Strikethrough,
  Type,
  Keyboard,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Flag,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Question,
  AdvancedFilterState,
  UserAnswerItem
} from '@/types';
import { AdvancedQuestionFilters } from '@/components/AdvancedQuestionFilters';
import { QuestionCard, HighlighterColor, HIGHLIGHTER_COLORS } from '@/components/QuestionCard';
import { SessionPerformanceView } from '@/components/SessionPerformanceView';
import { CreateCadernoModal } from '@/components/CreateCadernoModal';
import { ReportIssueDrawer } from '@/components/ReportIssueDrawer';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useStudentData } from '@/context/StudentDataContext';
import {
  fetchQuestionsFromSupabase,
  fetchTotalQuestionsCount,
  fetchQuestionIdsForListCriteria
} from '@/services/questionService';

export const QuestoesView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { accentConfig } = useTheme();
  const {
    canSolveQuestion,
    incrementDailyCount,
    openUpgradeModal
  } = useSubscription();

  const {
    userAnswers,
    sessionAnswers,
    recordAnswer,
    lists,
    activeListId,
    setActiveListId,
    folders,
    createFolder,
    createListWithFilters,
    addQuestionToFolder,
    fontSize,
    setFontSize,
    bookmarkedQuestionIds,
    toggleBookmark
  } = useStudentData();

  // Modo do Banco: 'filtros' | 'resolucao' | 'resultado'
  const initialMode = searchParams.get('mode') === 'resolucao' ? 'resolucao' : 'filtros';
  const [bancoMode, setBancoMode] = useState<'resolucao' | 'filtros' | 'resultado'>(initialMode);

  // Inicializa filtros a partir de query params (se houver)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>(() => {
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const espParam = searchParams.get('especialidade');
    const temaParam = searchParams.get('tema');
    const instParam = searchParams.get('instituicao');
    const anoParam = searchParams.get('ano');

    return {
      search,
      modalidades: ['Residência Médica'],
      especialidades: espParam ? [espParam] : [],
      temas: temaParam ? [temaParam] : [],
      focos: [],
      subfocos: [],
      instituicoes: instParam ? [instParam] : [],
      anos: anoParam ? [parseInt(anoParam, 10)] : [],
      tipoProva: [],
      status: 'Todas',
      dificuldade: 'Todas',
      tipoQuestao: 'Todas',
      ocultarAnuladasErro: false,
      ocultarRevisadas: false,
      ultimos5Anos: false,
      aleatorizar: false
    };
  });

  const [sessionQuestionIds, setSessionQuestionIds] = useState<string[] | null>(null);
  const [sessionQuestionLimit, setSessionQuestionLimit] = useState<number | null>(null);
  const [questionsPage, setQuestionsPage] = useState<number>(1);
  const [supabaseQuestions, setSupabaseQuestions] = useState<Question[]>([]);
  const [totalSupabaseCount, setTotalSupabaseCount] = useState<number>(0);
  const [totalGlobalQuestions, setTotalGlobalQuestions] = useState<number>(133280);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState<boolean>(true);

  // Lê lista ativa dos parâmetros se houver
  useEffect(() => {
    const listIdParam = searchParams.get('listId');
    if (listIdParam) {
      setActiveListId(listIdParam);
      setBancoMode('resolucao');
    }
  }, [searchParams, setActiveListId]);

  // Carrega total global
  useEffect(() => {
    fetchTotalQuestionsCount()
      .then((count) => {
        if (count > 0) setTotalGlobalQuestions(count);
      })
      .catch(() => {});
  }, []);

  // Índice da questão atual
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Temporizadores: Tempo na questão atual + Tempo total acumulado da sessão
  const [questionTimer, setQuestionTimer] = useState<number>(0);
  const [sessionTimer, setSessionTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [isTimerVisible, setIsTimerVisible] = useState<boolean>(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let lastTick = Date.now();

    const handleVisibility = () => {
      lastTick = Date.now();
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }

    if (bancoMode === 'resolucao' && isTimerRunning) {
      interval = setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) return;
        const now = Date.now();
        const delta = Math.round((now - lastTick) / 1000);
        lastTick = now;
        const inc = delta > 0 && delta <= 5 ? delta : 1;
        setQuestionTimer((prev) => prev + inc);
        setSessionTimer((prev) => prev + inc);
      }, 1000);
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
      if (interval) clearInterval(interval);
    };
  }, [bancoMode, isTimerRunning]);

  // Ferramentas de leitura e marca-texto (6 cores)
  const [activeHighlighterColor, setActiveHighlighterColor] = useState<HighlighterColor>('yellow');
  const [isTopHighlighterMenuOpen, setIsTopHighlighterMenuOpen] = useState<boolean>(false);
  const topHighlighterMenuRef = useRef<HTMLDivElement>(null);

  // Menu retrátil de tamanho de fonte na barra superior
  const [isTopFontSizeMenuOpen, setIsTopFontSizeMenuOpen] = useState<boolean>(false);
  const topFontSizeMenuRef = useRef<HTMLDivElement>(null);

  // Tachador / Riscar texto e Régua de questões
  const [isStrikethroughActive, setIsStrikethroughActive] = useState<boolean>(false);
  const [isQuestionSequenceOpen, setIsQuestionSequenceOpen] = useState<boolean>(false);

  // Referências para acompanhamento suave da régua de questões
  const questionScrollContainerRef = useRef<HTMLDivElement>(null);
  const questionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Fecha o dropdown de cores do marca-texto da barra superior ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (topHighlighterMenuRef.current && !topHighlighterMenuRef.current.contains(e.target as Node)) {
        setIsTopHighlighterMenuOpen(false);
      }
    };
    if (isTopHighlighterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTopHighlighterMenuOpen]);

  // Fecha o dropdown de tamanho de fonte da barra superior ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (topFontSizeMenuRef.current && !topFontSizeMenuRef.current.contains(e.target as Node)) {
        setIsTopFontSizeMenuOpen(false);
      }
    };
    if (isTopFontSizeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTopFontSizeMenuOpen]);

  // Efeito para a barra de questões acompanhar suavemente a questão atual selecionada
  useEffect(() => {
    if (bancoMode !== 'resolucao') return;
    const targetBtn = questionButtonRefs.current[currentQuestionIndex];
    if (targetBtn) {
      targetBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [bancoMode, currentQuestionIndex]);



  // Reporte de questões e modal de atalhos
  const [reportedQuestionIds, setReportedQuestionIds] = useState<Record<string, boolean>>({});
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);
  const [questionToReport, setQuestionToReport] = useState<Question | null>(null);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Modal de Criação de Caderno
  const [isCreateCadernoModalOpen, setIsCreateCadernoModalOpen] = useState(false);
  const [isCreatingListLoading, setIsCreatingListLoading] = useState(false);

  // Sincroniza respostas recentes em ref para evitar refetch cíclico a cada alternativa respondida
  const userAnswersRef = useRef(userAnswers);
  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  // Busca questões do Supabase com base nos filtros
  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setIsLoadingSupabase(true);
      try {
        let questionIds: string[] | undefined;
        let effectivePageSize = sessionQuestionLimit ? Math.min(200, sessionQuestionLimit) : 50;

        if (activeListId) {
          const currentList = lists.find((l) => l.id === activeListId);
          if (currentList && currentList.questionIds.length > 0) {
            questionIds = currentList.questionIds;
            effectivePageSize = Math.min(200, currentList.questionIds.length);
          }
        } else if (sessionQuestionIds && sessionQuestionIds.length > 0) {
          questionIds = sessionQuestionIds;
          effectivePageSize = Math.min(200, sessionQuestionIds.length);
        }

        const currentAnswers = userAnswersRef.current;
        const answeredIds = Object.keys(currentAnswers);
        const correctIds = Object.entries(currentAnswers)
          .filter(([, a]) => a.isCorrect)
          .map(([id]) => id);
        const wrongIds = Object.entries(currentAnswers)
          .filter(([, a]) => !a.isCorrect)
          .map(([id]) => id);

        const res = await fetchQuestionsFromSupabase(
          activeListId
            ? {}
            : {
                ...advancedFilters,
                userSolvedIds: answeredIds,
                userCorrectIds: correctIds,
                userWrongIds: wrongIds
              },
          activeListId ? 1 : questionsPage,
          effectivePageSize,
          questionIds
        );

        if (!isCancelled) {
          if (questionsPage === 1) {
            setSupabaseQuestions(res.questions);
          } else {
            setSupabaseQuestions((prev) => {
              const existing = new Set(prev.map((q) => q.id));
              const additions = res.questions.filter((q) => !existing.has(q.id));
              return [...prev, ...additions];
            });
          }
          setTotalSupabaseCount(res.total);
        }
      } catch (err) {
        console.error('Erro ao buscar questões:', err);
      } finally {
        if (!isCancelled) setIsLoadingSupabase(false);
      }
    };

    const timer = setTimeout(load, 350);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    advancedFilters,
    activeListId,
    lists,
    questionsPage,
    sessionQuestionLimit,
    sessionQuestionIds
  ]);

  const visibleQuestions = useMemo(() => {
    return supabaseQuestions;
  }, [supabaseQuestions]);

  const currentQuestion = visibleQuestions[Math.min(currentQuestionIndex, visibleQuestions.length - 1)];

  // Resposta da questão com verificação de limites
  const handleAnswer = (
    questionId: string,
    selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E',
    isCorrect: boolean,
    extraMetadata?: any
  ) => {
    if (!canSolveQuestion()) {
      openUpgradeModal(null, true);
      return;
    }
    incrementDailyCount();

    const q = supabaseQuestions.find((item) => item.id === questionId);
    const isAnulada = Boolean(q?.isAnulada || q?.correctAnswer === 'ANULADA');
    const finalIsCorrect = isAnulada ? true : isCorrect;

    recordAnswer(questionId, selectedLetter, finalIsCorrect, {
      difficulty: q?.difficulty || 'Médio',
      specialty: q?.especialidade,
      tema: q?.tema,
      foco: q?.foco,
      subfoco: q?.subfoco,
      banca: q?.banca,
      year: q?.year,
      code: q?.code,
      ...extraMetadata
    });
  };

  const handleResetFilters = () => {
    setAdvancedFilters({
      search: '',
      modalidades: ['Residência Médica'],
      especialidades: [],
      temas: [],
      focos: [],
      subfocos: [],
      instituicoes: [],
      anos: [],
      tipoProva: [],
      status: 'Todas',
      dificuldade: 'Todas',
      tipoQuestao: 'Todas',
      ocultarAnuladasErro: false,
      ocultarRevisadas: false,
      ultimos5Anos: false,
      aleatorizar: false
    });
    setSessionQuestionIds(null);
    setQuestionsPage(1);
    setCurrentQuestionIndex(0);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Contagem de filtros ativos para exibir badge no botão de Filtros
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.search.trim()) count++;
    if (
      advancedFilters.modalidades.length > 0 &&
      !(advancedFilters.modalidades.length === 1 && advancedFilters.modalidades[0] === 'Residência Médica')
    ) {
      count++;
    }
    if (advancedFilters.especialidades.length > 0) count += advancedFilters.especialidades.length;
    if (advancedFilters.temas.length > 0) count += advancedFilters.temas.length;
    if (advancedFilters.focos.length > 0) count += advancedFilters.focos.length;
    if (advancedFilters.subfocos.length > 0) count += advancedFilters.subfocos.length;
    if (advancedFilters.instituicoes.length > 0) count += advancedFilters.instituicoes.length;
    if (advancedFilters.anos.length > 0) count += advancedFilters.anos.length;
    if (advancedFilters.tipoProva.length > 0) count += advancedFilters.tipoProva.length;
    if (advancedFilters.status !== 'Todas') count++;
    if (advancedFilters.dificuldade !== 'Todas') count++;
    if (advancedFilters.tipoQuestao !== 'Todas') count++;
    if (advancedFilters.ocultarAnuladasErro) count++;
    if (advancedFilters.ocultarRevisadas) count++;
    if (advancedFilters.ultimos5Anos) count++;
    return count;
  }, [advancedFilters]);

  // Navegação e atalhos globais de questões pelo teclado
  useEffect(() => {
    if (bancoMode !== 'resolucao') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Atalho Esc ou Alt + ArrowLeft para retornar aos filtros
      if (e.key === 'Escape' || (e.altKey && e.key === 'ArrowLeft')) {
        if (!isShortcutsModalOpen && !isReportDrawerOpen && !isCreateCadernoModalOpen) {
          e.preventDefault();
          setBancoMode('filtros');
          return;
        }
      }

      // Atalho ? para abrir o modal de atalhos de teclado
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // Atalho Q ou P para alternar a exibição da régua de questões
      if (e.key === 'q' || e.key === 'Q' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsQuestionSequenceOpen((prev) => !prev);
        return;
      }

      // Atalho M para menu de marca-texto
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsTopHighlighterMenuOpen((prev) => !prev);
        return;
      }

      // Atalho S para alternar modo riscar texto (tachado)
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setIsStrikethroughActive((prev) => !prev);
        window.dispatchEvent(new CustomEvent('apply-strikethrough-selection'));
        return;
      }

      // Atalho B para favoritar a questão atual
      if (e.key === 'b' || e.key === 'B') {
        const currQ = visibleQuestions[Math.min(currentQuestionIndex, visibleQuestions.length - 1)];
        if (currQ) {
          e.preventDefault();
          toggleBookmark(currQ.id);
        }
        return;
      }

      // Atalho R para reportar erro na questão atual
      if (e.key === 'r' || e.key === 'R') {
        const currQ = visibleQuestions[Math.min(currentQuestionIndex, visibleQuestions.length - 1)];
        if (currQ) {
          e.preventDefault();
          setQuestionToReport(currQ);
          setIsReportDrawerOpen(true);
        }
        return;
      }

      // Atalho + ou = para aumentar fonte
      if (e.key === '+' || e.key === '=' || e.key === ']') {
        e.preventDefault();
        setFontSize(fontSize === 'xs' ? 'sm' : fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'xl');
        return;
      }
      // Atalho - ou _ para diminuir fonte
      if (e.key === '-' || e.key === '_' || e.key === '[') {
        e.preventDefault();
        setFontSize(fontSize === 'xl' ? 'lg' : fontSize === 'lg' ? 'base' : fontSize === 'base' ? 'sm' : 'xs');
        return;
      }

      // Navegação anterior: ArrowLeft ou K
      if (e.key === 'ArrowLeft' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
        setQuestionTimer(0);
        return;
      }

      // Navegação próxima: ArrowRight ou J
      if (e.key === 'ArrowRight' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setCurrentQuestionIndex((prev) => {
          if (prev + 1 < visibleQuestions.length) {
            setQuestionTimer(0);
            return prev + 1;
          } else if (visibleQuestions.length < totalSupabaseCount) {
            setQuestionsPage((p) => p + 1);
            setQuestionTimer(0);
            return prev + 1;
          }
          return prev;
        });
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    bancoMode,
    visibleQuestions,
    totalSupabaseCount,
    currentQuestionIndex,
    fontSize,
    setFontSize,
    isShortcutsModalOpen,
    isReportDrawerOpen,
    isCreateCadernoModalOpen
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Caderno Ativo (se houver) */}
      {activeListId && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/40 p-4 sm:p-5 rounded-3xl flex items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-300 shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-blue-700 dark:text-blue-400">Resolvendo Caderno:</span>
            <strong className="text-slate-900 dark:text-white font-heading text-sm">
              {lists.find((l) => l.id === activeListId)?.title || 'Caderno de Questões'}
            </strong>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveListId(null);
              setBancoMode('filtros');
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/40 font-bold transition-colors cursor-pointer"
          >
            Sair do Caderno
          </button>
        </div>
      )}

      {/* MODO 1: FILTROS SEPARADOS DAS QUESTÕES */}
      {bancoMode === 'filtros' ? (
        <div className="space-y-6">
          <AdvancedQuestionFilters
            filters={advancedFilters}
            onChange={(newFilters) => {
              setAdvancedFilters(newFilters);
              setSessionQuestionIds(null);
              setQuestionsPage(1);
              setCurrentQuestionIndex(0);
            }}
            onReset={handleResetFilters}
            totalAvailable={totalGlobalQuestions}
            totalFiltered={totalSupabaseCount}
            isLoading={isLoadingSupabase}
            onCreateListFromFilter={() => setIsCreateCadernoModalOpen(true)}
            onSelectDirectQuestion={(questionId) => {
              const idx = visibleQuestions.findIndex((q) => q.id === questionId);
              if (idx !== -1) {
                setCurrentQuestionIndex(idx);
              }
              setBancoMode('resolucao');
            }}
            onStartSequentialSolving={async (limit, quotas, explicitFilters) => {
              const finalLimit = limit ? Math.min(200, Math.max(1, limit)) : 200;
              const activeFilters = explicitFilters || advancedFilters;
              setAdvancedFilters(activeFilters);
              setActiveListId(null);
              setSessionQuestionLimit(finalLimit);
              setCurrentQuestionIndex(0);
              setQuestionTimer(0);

              try {
                setIsLoadingSupabase(true);
                const answeredIds = Object.keys(userAnswers);
                const balancedIds = await fetchQuestionIdsForListCriteria(
                  quotas || {},
                  activeFilters,
                  finalLimit,
                  answeredIds
                );
                if (balancedIds && balancedIds.length > 0) {
                  setSessionQuestionIds(balancedIds);
                  const fullRes = await fetchQuestionsFromSupabase(
                    activeFilters,
                    1,
                    finalLimit,
                    balancedIds
                  );
                  if (fullRes.questions?.length > 0) {
                    setSupabaseQuestions(fullRes.questions);
                  }
                }
              } catch (e) {
                console.error(e);
              } finally {
                setIsLoadingSupabase(false);
              }

              setBancoMode('resolucao');
            }}
          />
        </div>
      ) : bancoMode === 'resultado' ? (
        /* MODO 3: TELA DE RESULTADOS */
        <SessionPerformanceView
          questions={visibleQuestions}
          userAnswers={userAnswers}
          onReturnToFilters={() => setBancoMode('filtros')}
          onReviewAll={() => {
            setBancoMode('resolucao');
            setCurrentQuestionIndex(0);
            setQuestionTimer(0);
          }}
          onNavigateToQuestion={(questionId) => {
            const qIdx = visibleQuestions.findIndex((itemQ) => itemQ.id === questionId);
            if (qIdx !== -1) {
              setCurrentQuestionIndex(qIdx);
              setBancoMode('resolucao');
              setQuestionTimer(0);
            }
          }}
        />
      ) : (
        /* MODO 2: RESOLUÇÃO SEQUENCIAL QUESTÃO A QUESTÃO */
        <div className="space-y-5 animate-in fade-in duration-200">
          {visibleQuestions.length > 0 ? (
            <>
              {/* BARRA SUPERIOR SEQUENCIAL */}
              <div className="sticky top-[4.5rem] z-20 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/80 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm flex flex-col gap-2.5 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Esquerda: Botão Voltar para Filtros + Widget de Progresso Circular Retrátil */}
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
                    {/* Botão de Retorno à Página Anterior */}
                    <button
                      type="button"
                      onClick={() => setBancoMode('filtros')}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 border border-zinc-200/80 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer shadow-xs group shrink-0 active:scale-95"
                      title="Voltar aos Filtros (Esc)"
                      aria-label="Voltar"
                    >
                      <ArrowLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-300 group-hover:-translate-x-0.5 transition-transform" />
                    </button>

                    {(() => {
                      const answeredCount = visibleQuestions.filter((q) => !!sessionAnswers[q.id]).length;
                      const progressPercent = visibleQuestions.length > 0
                        ? Math.round((answeredCount / visibleQuestions.length) * 100)
                        : 0;

                      return (
                        <button
                          type="button"
                          onClick={() => setIsQuestionSequenceOpen((prev) => !prev)}
                          className="flex items-center gap-3 p-1 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all cursor-pointer group text-left"
                          title={
                            isQuestionSequenceOpen
                              ? 'Ocultar régua de questões (Q)'
                              : 'Ver régua de questões na íntegra (Q)'
                          }
                        >
                          {/* Círculo de Progresso com Porcentagem */}
                          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-slate-200 dark:text-slate-800"
                                strokeWidth="3.2"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                strokeDasharray={`${progressPercent}, 100`}
                                strokeWidth="3.2"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                style={{ color: accentConfig.primaryHex }}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <span className="absolute text-[11px] font-black font-sans text-slate-800 dark:text-slate-100 tracking-tighter">
                              {progressPercent}%
                            </span>
                          </div>

                          {/* Posição e Rótulo Progresso */}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm sm:text-base font-black font-sans text-[#0f274a] dark:text-white leading-tight tracking-tight">
                                {answeredCount}/{visibleQuestions.length}
                              </span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-transform duration-200 ${
                                  isQuestionSequenceOpen ? 'rotate-180 text-blue-500' : ''
                                }`}
                              />
                            </div>
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 capitalize">
                              Progresso
                            </span>
                          </div>
                        </button>
                      );
                    })()}
                  </div>

                  {/* Direita: Ferramentas de Estudo (Tempo Duplo, Marca-Texto 6 cores, Riscar, Fonte, Favoritar, Reportar, Atalhos, Filtros, Finalizar) */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100 dark:border-slate-800">
                    {/* Relógios de Performance: Tempo na Questão e Tempo Total */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                      {isTimerVisible ? (
                        <>
                          {/* Tempo na Questão Atual */}
                          <div
                            className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-zinc-200"
                            title="Tempo gasto na questão atual (reinicia a cada avanço/retrocesso)"
                          >
                            <Timer className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="font-mono tabular-nums">{formatTimer(questionTimer)}</span>
                            <span className="text-[9px] uppercase font-semibold text-slate-400 dark:text-zinc-500">Q</span>
                          </div>

                          <span className="text-slate-300 dark:text-zinc-700 font-light">|</span>

                          {/* Tempo Total Acumulado */}
                          <div
                            className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-zinc-200"
                            title="Tempo total acumulado nesta sessão de estudos"
                          >
                            <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="font-mono tabular-nums">{formatTimer(sessionTimer)}</span>
                            <span className="text-[9px] uppercase font-semibold text-slate-400 dark:text-zinc-500">Total</span>
                          </div>

                          {/* Botão Pausar / Retomar */}
                          <button
                            type="button"
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            title={isTimerRunning ? 'Pausar contagem' : 'Retomar contagem'}
                            className="p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            {isTimerRunning ? (
                              <Pause className="w-3 h-3 text-slate-600 dark:text-zinc-300" />
                            ) : (
                              <Play className="w-3 h-3 fill-current text-emerald-500" />
                            )}
                          </button>

                          {/* Botão Ocultar Relógio */}
                          <button
                            type="button"
                            onClick={() => setIsTimerVisible(false)}
                            title="Ocultar relógio (modo sem pressão de tempo)"
                            className="p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                          >
                            <EyeOff className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsTimerVisible(true)}
                          title="Exibir tempo por questão e tempo total"
                          className="flex items-center justify-center p-0.5 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                          <Timer className="w-3.5 h-3.5 text-blue-500" />
                        </button>
                      )}
                    </div>

                    {/* Marca-texto compacto com 6 cores retrátil */}
                    <div ref={topHighlighterMenuRef} className="relative inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => setIsTopHighlighterMenuOpen((prev) => !prev)}
                        title={`Marca-texto ativo: ${HIGHLIGHTER_COLORS[activeHighlighterColor].name}. Clique para alternar cor (M).`}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer shadow-xs group"
                      >
                        <Highlighter className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform" />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/15 dark:border-white/20 shadow-xs transition-transform"
                          style={{ backgroundColor: HIGHLIGHTER_COLORS[activeHighlighterColor].hex }}
                        />
                        <ChevronDown
                          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                            isTopHighlighterMenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Pílula Flutuante Horizontal Centralizada com as 6 Cores */}
                      {isTopHighlighterMenuOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-max min-w-max flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-full shadow-xl animate-in fade-in zoom-in-95 duration-150">
                          {(['yellow', 'green', 'pink', 'blue', 'orange', 'purple'] as HighlighterColor[]).map((colorKey) => {
                            const c = HIGHLIGHTER_COLORS[colorKey];
                            const isSelected = activeHighlighterColor === colorKey && !isStrikethroughActive;
                            return (
                              <button
                                key={colorKey}
                                type="button"
                                onClick={() => {
                                  setActiveHighlighterColor(colorKey);
                                  setIsStrikethroughActive(false);
                                  setIsTopHighlighterMenuOpen(false);
                                }}
                                title={`Marca-texto ${c.name}`}
                                style={{
                                  backgroundColor: c.hex,
                                  borderColor: isSelected ? c.borderHex : 'transparent'
                                }}
                                className={`w-6 h-6 rounded-full transition-all cursor-pointer flex items-center justify-center border shrink-0 ${
                                  isSelected
                                    ? 'ring-2 ring-blue-500/60 shadow-xs scale-105'
                                    : 'opacity-90 hover:opacity-100 hover:scale-110'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Botão de Riscar / Tachado de Texto Selecionado */}
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      onClick={() => {
                        setIsStrikethroughActive((prev) => !prev);
                        window.dispatchEvent(new CustomEvent('apply-strikethrough-selection'));
                      }}
                      title={
                        isStrikethroughActive
                          ? 'Modo Riscar Texto (Tachado) ATIVO [S]. Clique para desativar ou selecione texto para riscar.'
                          : 'Riscar texto selecionado (Tachado) [S]. Clique para ativar modo risco.'
                      }
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-xl transition-all cursor-pointer shadow-xs group ${
                        isStrikethroughActive
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/60 text-rose-600 dark:text-rose-400 font-bold ring-2 ring-rose-400/40'
                          : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Strikethrough className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold hidden sm:inline">
                        {isStrikethroughActive ? 'Riscando' : 'Riscar'}
                      </span>
                    </button>

                    {/* Seletor de Tamanho de Fonte Retrátil */}
                    <div ref={topFontSizeMenuRef} className="relative inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => setIsTopFontSizeMenuOpen((prev) => !prev)}
                        title={`Tamanho da fonte: ${
                          fontSize === 'xs'
                            ? 'Muito Compacta (A--)'
                            : fontSize === 'sm'
                            ? 'Compacta (A-)'
                            : fontSize === 'base'
                            ? 'Padrão (A)'
                            : fontSize === 'lg'
                            ? 'Grande (A+)'
                            : 'Muito Grande (A++)'
                        }. Clique para alternar.`}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer shadow-xs group"
                      >
                        <Type className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black text-blue-600 dark:text-blue-400">
                          {fontSize === 'xs' ? 'A--' : fontSize === 'sm' ? 'A-' : fontSize === 'base' ? 'A' : fontSize === 'lg' ? 'A+' : 'A++'}
                        </span>
                        <ChevronDown
                          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                            isTopFontSizeMenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Pílula Flutuante com os 5 Níveis de Fonte */}
                      {isTopFontSizeMenuOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-max min-w-max flex items-center gap-1 p-1 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-full shadow-xl animate-in fade-in zoom-in-95 duration-150">
                          {[
                            { id: 'xs' as const, label: 'A--', title: 'Muito Compacta (--)' },
                            { id: 'sm' as const, label: 'A-', title: 'Compacta (-)' },
                            { id: 'base' as const, label: 'A', title: 'Padrão' },
                            { id: 'lg' as const, label: 'A+', title: 'Grande (+)' },
                            { id: 'xl' as const, label: 'A++', title: 'Muito Grande (++)' },
                          ].map((f) => {
                            const isSelected = fontSize === f.id;
                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => {
                                  setFontSize(f.id);
                                  setIsTopFontSizeMenuOpen(false);
                                }}
                                title={f.title}
                                className={`px-2.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer shrink-0 ${
                                  isSelected
                                    ? 'bg-blue-600 text-white shadow-xs scale-105'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                {f.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Ações de Questão: Favoritar e Reportar */}
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      {/* Favoritar */}
                      {currentQuestion && (
                        <button
                          type="button"
                          onClick={() => {
                            toggleBookmark(currentQuestion.id);
                          }}
                          className={`p-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                            bookmarkedQuestionIds[currentQuestion.id]
                              ? 'text-amber-500'
                              : 'text-slate-400 hover:text-amber-500'
                          }`}
                          title={
                            bookmarkedQuestionIds[currentQuestion.id]
                              ? 'Remover dos favoritos (B)'
                              : 'Favoritar questão (B)'
                          }
                        >
                          <Bookmark
                            className={`w-4 h-4 transition-transform ${
                              bookmarkedQuestionIds[currentQuestion.id]
                                ? 'fill-amber-500 text-amber-500 scale-110'
                                : ''
                            }`}
                          />
                        </button>
                      )}

                      {/* Reportar */}
                      {currentQuestion && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuestionToReport(currentQuestion);
                            setIsReportDrawerOpen(true);
                          }}
                          className={`p-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                            reportedQuestionIds[currentQuestion.id]
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-400 hover:text-amber-500'
                          }`}
                          title="Reportar erro na questão (R)"
                        >
                          <Flag
                            className={`w-4 h-4 ${
                              reportedQuestionIds[currentQuestion.id]
                                ? 'fill-amber-500'
                                : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Botão de Atalhos do Teclado */}
                    <button
                      type="button"
                      onClick={() => setIsShortcutsModalOpen(true)}
                      className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs group"
                      title="Atalhos do Teclado (?)"
                    >
                      <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline text-xs font-bold">Atalhos</span>
                    </button>

                    {/* Botão de Filtros */}
                    <button
                      type="button"
                      onClick={() => setBancoMode('filtros')}
                      className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                      title="Filtros de questões"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-500" />
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      {activeFiltersCount > 0 && (
                        <span
                          className="px-1.5 py-0.2 rounded-full text-[10px] font-mono text-white font-extrabold"
                          style={{ backgroundColor: accentConfig.primaryHex }}
                        >
                          {activeFiltersCount}
                        </span>
                      )}
                    </button>

                    {/* Botão Finalizar Treino */}
                    <button
                      type="button"
                      onClick={() => setBancoMode('resultado')}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white shadow-xs transition-transform hover:scale-105 cursor-pointer"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                      title="Finalizar treino e ver resultado"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Finalizar</span>
                    </button>
                  </div>
                </div>

                {/* Régua Sequencial Retrátil de Questões na Íntegra */}
                {isQuestionSequenceOpen && (
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-hidden min-w-0 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Seta Anterior */}
                    <button
                      type="button"
                      disabled={Math.min(currentQuestionIndex, visibleQuestions.length - 1) === 0}
                      onClick={() => {
                        setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                        setQuestionTimer(0);
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 transition-colors cursor-pointer"
                      title="Questão anterior (← ou K)"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Pílulas de Questão (1, 2, 3...) com indicador de acerto/erro e acompanhamento suave */}
                    <div
                      ref={questionScrollContainerRef}
                      className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-0.5 scroll-smooth flex-1"
                    >
                      {visibleQuestions.map((q, idx) => {
                        const isCurrent = idx === Math.min(currentQuestionIndex, visibleQuestions.length - 1);
                        const sessionAns = sessionAnswers[q.id];
                        const isAnsweredInSession = Boolean(sessionAns);
                        const isCorrectInSession = sessionAns?.isCorrect;
                        const hasHistoricalAnswer = Boolean(userAnswers[q.id]);

                        return (
                          <button
                            key={q.id}
                            ref={(el) => {
                              questionButtonRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => {
                              setCurrentQuestionIndex(idx);
                              setQuestionTimer(0);
                            }}
                            className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full font-sans font-black text-sm sm:text-[15px] flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                              isCurrent
                                ? 'text-white shadow-md ring-2 ring-offset-1 ring-blue-500/40'
                                : isAnsweredInSession
                                ? isCorrectInSession
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/60'
                                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-700/60'
                                : hasHistoricalAnswer
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            style={isCurrent ? { backgroundColor: accentConfig.primaryHex } : undefined}
                            title={`Questão ${idx + 1}${
                              isAnsweredInSession
                                ? isCorrectInSession ? ' (Correta nesta sessão)' : ' (Incorreta nesta sessão)'
                                : hasHistoricalAnswer ? ' (Já resolvida anteriormente - clique para refazer)' : ''
                            }`}
                          >
                            <span>{idx + 1}</span>
                            {hasHistoricalAnswer && !isAnsweredInSession && !isCurrent && (
                              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white dark:ring-zinc-900" />
                            )}
                          </button>
                        );
                      })}

                      {/* Ícone para adicionar questão pelo filtro */}
                      <button
                        type="button"
                        onClick={() => setBancoMode('filtros')}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-400 hover:text-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs ml-0.5"
                        title="Adicionar questões pelo filtro"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Seta Próxima */}
                    <button
                      type="button"
                      disabled={currentQuestionIndex >= visibleQuestions.length - 1 && visibleQuestions.length >= totalSupabaseCount}
                      onClick={() => {
                        if (currentQuestionIndex + 1 < visibleQuestions.length) {
                          setCurrentQuestionIndex((prev) => prev + 1);
                          setQuestionTimer(0);
                        } else if (visibleQuestions.length < totalSupabaseCount) {
                          setQuestionsPage((prev) => prev + 1);
                          setCurrentQuestionIndex((prev) => prev + 1);
                          setQuestionTimer(0);
                        }
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 transition-colors cursor-pointer"
                      title="Próxima questão (→ ou J)"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* CARD DA QUESTÃO ATUAL */}
              {currentQuestion && (
                <QuestionCard
                  key={currentQuestion.id}
                  question={currentQuestion}
                  index={currentQuestionIndex}
                  total={visibleQuestions.length}
                  onAnswer={handleAnswer}
                  userAnswer={sessionAnswers[currentQuestion.id]?.letter}
                  historicalAnswer={
                    userAnswers[currentQuestion.id]
                      ? {
                          letter: userAnswers[currentQuestion.id].letter,
                          isCorrect: userAnswers[currentQuestion.id].isCorrect,
                          timestamp: userAnswers[currentQuestion.id].timestamp
                        }
                      : undefined
                  }
                  isBookmarked={Boolean(bookmarkedQuestionIds[currentQuestion.id])}
                  onToggleBookmark={() => toggleBookmark(currentQuestion.id)}
                  fontSize={fontSize}
                  onChangeFontSize={setFontSize}
                  folders={folders}
                  onCreateFolder={createFolder}
                  onSaveToFolder={async (qId, fId) => {
                    const f = folders.find((item) => item.id === fId);
                    if (f) await addQuestionToFolder(qId, fId, f.name);
                  }}
                  activeHighlighterColor={activeHighlighterColor}
                  onSelectHighlighterColor={setActiveHighlighterColor}
                  isStrikethroughActive={isStrikethroughActive}
                  onToggleStrikethrough={() => setIsStrikethroughActive((prev) => !prev)}
                />
              )}

              {/* BARRA INFERIOR DE NAVEGAÇÃO ENTRE QUESTÕES */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => {
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                    setQuestionTimer(0);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold text-center">
                  Questão <strong className="text-slate-900 dark:text-white font-black text-sm">{currentQuestionIndex + 1}</strong> de <strong className="text-slate-900 dark:text-white font-black text-sm">{visibleQuestions.length}</strong>
                </div>

                {currentQuestionIndex >= visibleQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setBancoMode('resultado')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white shadow-md hover:scale-102 transition-transform cursor-pointer"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    <span>Ver Resultado</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQuestionIndex((prev) => Math.min(visibleQuestions.length - 1, prev + 1));
                      setQuestionTimer(0);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white shadow-md hover:scale-102 transition-transform cursor-pointer"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    <span>Próxima</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-3">
              {isLoadingSupabase ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-xs font-bold text-slate-500">Carregando questões do banco...</p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-10 h-10 mx-auto text-amber-500" />
                  <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                    Nenhuma questão encontrada
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Não encontramos questões para a combinação de filtros selecionada. Tente ampliar as bancas ou especialidades.
                  </p>
                  <button
                    type="button"
                    onClick={() => setBancoMode('filtros')}
                    className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Ajustar Filtros
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação de Caderno */}
      <CreateCadernoModal
        isOpen={isCreateCadernoModalOpen}
        onClose={() => setIsCreateCadernoModalOpen(false)}
        filters={advancedFilters}
        folders={folders}
        onCreateFolder={createFolder}
        onConfirmCreate={async (config) => {
          setIsCreatingListLoading(true);
          try {
            const newList = await createListWithFilters(
              config.title,
              config.folderId,
              config.totalQuestions,
              advancedFilters
            );
            setIsCreateCadernoModalOpen(false);
            if (config.startSolvingImmediately && newList) {
              setActiveListId(newList.id);
              setBancoMode('resolucao');
            }
          } finally {
            setIsCreatingListLoading(false);
          }
        }}
        availableQuestionsCount={totalSupabaseCount}
        isGenerating={isCreatingListLoading}
      />

      {/* Modal de Atalhos do Teclado */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Drawer de Reporte de Problemas */}
      {questionToReport && (
        <ReportIssueDrawer
          isOpen={isReportDrawerOpen}
          onClose={() => {
            setIsReportDrawerOpen(false);
            setQuestionToReport(null);
          }}
          question={questionToReport}
          user={user}
          onReportSuccess={(qId) => {
            setReportedQuestionIds((prev) => ({
              ...prev,
              [qId]: true
            }));
          }}
        />
      )}
    </div>
  );
};

