'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initialFolders, initialLists } from '@/data/mockLists';
import { AdvancedQuestionFilters } from '@/components/AdvancedQuestionFilters';
import { QuestionCard, HighlighterColor, HIGHLIGHTER_COLORS } from '@/components/QuestionCard';
import { CreateCadernoModal } from '@/components/CreateCadernoModal';
import { StudentHomeDashboard } from '@/components/StudentHomeDashboard';
import { ListManager } from '@/components/ListManager';
import { OfficialRanking } from '@/components/OfficialRanking';
import { Sidebar } from '@/components/Sidebar';
import { GlobalSearchBar } from '@/components/GlobalSearchBar';
import { ThemeSelector } from '@/components/ThemeSelector';
import { AuthScreen } from '@/components/AuthScreen';
import { LandingPage } from '@/components/LandingPage';
import { StudentProfileSettings } from '@/components/StudentProfileSettings';
import { useTheme } from '@/context/ThemeContext';
import { useAuth, DEFAULT_DEMO_USER } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

const OfficialExams = dynamic(
  () => import('@/components/OfficialExams').then((mod) => mod.OfficialExams),
  {
    loading: () => (
      <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span>Carregando provas oficiais...</span>
      </div>
    ),
    ssr: false
  }
);

const AdminCuradoriaGabaritos = dynamic(
  () => import('@/components/AdminCuradoriaGabaritos').then((mod) => mod.AdminCuradoriaGabaritos),
  {
    loading: () => (
      <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span>Carregando curadoria...</span>
      </div>
    ),
    ssr: false
  }
);

const AdminReportedQuestions = dynamic(
  () => import('@/components/AdminReportedQuestions').then((mod) => mod.AdminReportedQuestions),
  {
    loading: () => (
      <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span>Carregando auditoria de reports...</span>
      </div>
    ),
    ssr: false
  }
);

import { ReportIssueDrawer } from '@/components/ReportIssueDrawer';

const StatsDashboard = dynamic(
  () => import('@/components/StatsDashboard').then((mod) => mod.StatsDashboard),
  { ssr: false }
);

const MockExams = dynamic(
  () => import('@/components/MockExams').then((mod) => mod.MockExams),
  { ssr: false }
);

const CadernoDeErros = dynamic(
  () => import('@/components/CadernoDeErros').then((mod) => mod.CadernoDeErros),
  { ssr: false }
);

import {
  UserStats,
  PerformanceFilterState,
  AdvancedFilterState,
  ActiveTab,
  Folder,
  QuestionList,
  UserAttempt,
  Question,
  UserAnswerItem,
  ErrorReasonType
} from '@/types';
import {
  fetchQuestionsFromSupabase,
  fetchTotalQuestionsCount,
  fetchQuestionIdsForListCriteria,
  shuffleArray
} from '@/services/questionService';
import {
  loadUserFolders,
  saveUserFolders,
  loadUserLists,
  saveUserLists,
  deleteUserListFromDb,
  deleteUserFolderFromDb
} from '@/services/userListsService';
import { calculatePercentile, getOfficialRanking } from '@/utils/percentile';
import { saveRecentOfficialExam } from '@/services/recentExamsService';
import { matchesStudyModalidades } from '@/utils/modalidades';
import { OfficialExamItem } from '@/types/officialExams';
import { useToast } from '@/components/Toast';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { useSubscription } from '@/hooks/useSubscription';
import {
  Stethoscope,
  Menu,
  X,
  ArrowLeft,
  HelpCircle,
  Flame,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Flag,
  Heart,
  Bookmark,
  Highlighter,
  ChevronDown,
  Play,
  CheckCircle2,
  XCircle,
  Type,
  LogOut,
  Trophy,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Plus,
  BookOpenCheck,
  Check,
  FolderPlus,
  Clock,
  Shuffle,
  ShieldCheck,
  Keyboard
} from 'lucide-react';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';

export default function Home() {
  const { accentConfig } = useTheme();
  const { user, isAuthenticated, isAdmin, isLoading, loginAsDemo, logout } = useAuth();
  const { success, warning, info } = useToast();
  const {
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    plan,
    questionsRemainingToday,
    canSolveQuestion,
    incrementDailyCount
  } = useSubscription();

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register';
    planTitle?: string;
  }>({
    isOpen: false,
    mode: 'login'
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('bancoresidencia_sidebar_collapsed', String(next));
      }
      return next;
    });
  };
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perfil do Aluno e Metas dinâmicas
  const studentName = user?.name || 'Dr. Lucas Rocha';
  const [customDailyGoal, setCustomDailyGoal] = useState<number | null>(null);
  const dailyGoal = customDailyGoal ?? user?.dailyGoal ?? 30;

  // Pastas e Listas de Questões vinculadas à conta do aluno
  const [folders, setFolders] = useState<Folder[]>([]);
  const [lists, setLists] = useState<QuestionList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [sessionQuestionLimit, setSessionQuestionLimit] = useState<number | null>(null);
  const [sessionQuestionIds, setSessionQuestionIds] = useState<string[] | null>(null);
  const [isCreatingListLoading, setIsCreatingListLoading] = useState<boolean>(false);

  // Carrega e sincroniza pastas e listas da conta do aluno
  useEffect(() => {
    let isCancelled = false;
    const initUserData = async () => {
      try {
        const [userFolds, userLst] = await Promise.all([
          loadUserFolders(user?.id),
          loadUserLists(user?.id)
        ]);
        if (!isCancelled) {
          setFolders(userFolds);
          setLists(userLst);
        }
      } catch (err) {
        console.error('Erro ao sincronizar listas e pastas do aluno:', err);
      }
    };
    initUserData();
    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  // Tamanho de Fonte das Questões (Menor 'sm' por padrão para maior densidade médica)
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('sm');

  // Sincroniza preferências do localStorage após a montagem para prevenir hydration mismatch
  useEffect(() => {
    try {
      const savedSidebar = localStorage.getItem('bancoresidencia_sidebar_collapsed');
      if (savedSidebar !== null) {
        setSidebarCollapsed(savedSidebar === 'true');
      }
      const savedGoal = localStorage.getItem('bancoresidencia_custom_daily_goal');
      if (savedGoal) {
        setCustomDailyGoal(Number(savedGoal));
      }
      const savedFontSize = localStorage.getItem('bancoresidencia_question_font_size');
      if (savedFontSize === 'sm' || savedFontSize === 'base' || savedFontSize === 'lg') {
        setFontSize(savedFontSize);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleFontSizeChange = (size: 'sm' | 'base' | 'lg') => {
    setFontSize(size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bancoresidencia_question_font_size', size);
    }
  };

  // Chave de armazenamento de respostas com namespace do aluno
  const getUserAnswersStorageKey = (userId?: string | null) => {
    return userId ? `bancoresidencia_user_answers_${userId}` : 'bancoresidencia_user_answers_guest';
  };

  // Respostas do Usuário com metadados do item e persistência real específica da conta
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswerItem>>({});
  const userAnswersRef = useRef(userAnswers);
  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  // Contagem dinâmica de erros pendentes na conta para badges e navegação
  const pendingErrorsCount = useMemo(() => {
    return Object.values(userAnswers).filter(
      (a) => !a.isCorrect && a.statusRetrial !== 'recuperado'
    ).length;
  }, [userAnswers]);

  // Simulação de questões extras
  const [simulatedExtraAnswers, setSimulatedExtraAnswers] = useState<{ total: number; correct: number; unique: number; reviews: number; repeated: number }>({
    total: 0,
    correct: 0,
    unique: 0,
    reviews: 0,
    repeated: 0
  });

  // Filtros Avançados
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>({
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

  // Deep linking via URL Search Params (?tab=... e ?q=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ActiveTab | null;
      if (tabParam && ['home', 'banco', 'provas', 'desempenho', 'ranking', 'cadernos', 'curadoria', 'reportes'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
      const qParam = params.get('q');
      if (qParam) {
        setAdvancedFilters((prev) => ({ ...prev, search: qParam }));
        setActiveTab('banco');
      }
    } catch {
      // ignore
    }
  }, []);

  // Filtros de Desempenho e Ranking (Padrão: 6 meses e Residência)
  const [performanceFilters, setPerformanceFilters] = useState<PerformanceFilterState>({
    modalidade: 'Residência',
    period: '6m',
    institutions: [],
    banca: 'Todas'
  });

  const handleResetAdvancedFilters = () => {
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
      ultimos5Anos: false
    });
  };

  const handleResetPerformanceFilters = () => {
    setPerformanceFilters({
      modalidade: 'Residência',
      period: '6m',
      institutions: [],
      banca: 'Todas'
    });
  };

  // Modo do Banco de Questões: 'resolucao' (sequencial questão a questão), 'filtros' (painel de filtros separado) ou 'resultado' (diagnóstico e pontos fracos)
  const [bancoMode, setBancoMode] = useState<'resolucao' | 'filtros' | 'resultado'>('filtros');
  // Snapshot de questões excluídas por já terem sido respondidas antes do início da sessão de resolução
  // Garante que uma questão respondida NÃO suma instantaneamente da tela enquanto o aluno está na sessão ativa
  const [sessionExclusionSnapshot, setSessionExclusionSnapshot] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const snapshot: Record<string, boolean> = {};
    Object.keys(userAnswersRef.current).forEach((id) => {
      snapshot[id] = true;
    });
    setSessionExclusionSnapshot(snapshot);
  }, [bancoMode, advancedFilters]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questionTimer, setQuestionTimer] = useState<number>(0);
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<Record<string, boolean>>({});
  const [reportedQuestionIds, setReportedQuestionIds] = useState<Record<string, boolean>>({});
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState<boolean>(false);
  const [questionToReport, setQuestionToReport] = useState<Question | null>(null);
  // Estados de ferramentas de leitura na barra superior
  const [activeHighlighterColor, setActiveHighlighterColor] = useState<HighlighterColor>('yellow');
  const [isTopHighlighterMenuOpen, setIsTopHighlighterMenuOpen] = useState<boolean>(false);
  const topHighlighterMenuRef = useRef<HTMLDivElement>(null);

  // Controle de visibilidade da régua sequencial retrátil de questões (Imagem 1)
  const [isQuestionSequenceOpen, setIsQuestionSequenceOpen] = useState<boolean>(false);
  // Modal de orientação de atalhos de teclado (Imagem 3)
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);

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

  // Modal avançado de criação de caderno personalizado (distribuição por especialidade/tema/foco/subfoco e pastas de 3 níveis)
  const [isCreateCadernoModalOpen, setIsCreateCadernoModalOpen] = useState<boolean>(false);
  // Mapeamento de questões salvas em pastas pelo aluno
  const [savedQuestionsFolderMap, setSavedQuestionsFolderMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('bancoresidencia_saved_questions_folder_map');
        if (raw) {
          setSavedQuestionsFolderMap(JSON.parse(raw));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Cronômetro para resolução de questão sequencial
  useEffect(() => {
    if (activeTab !== 'banco' || bancoMode !== 'resolucao') return;
    const interval = setInterval(() => {
      setQuestionTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab, bancoMode, currentQuestionIndex]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const [supabaseQuestions, setSupabaseQuestions] = useState<Question[]>([]);

  // Carrega e sincroniza respostas específicas do aluno quando a conta for carregada ou alterada
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storageKey = getUserAnswersStorageKey(user?.id);
    let loaded: Record<string, UserAnswerItem> = {};
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        loaded = JSON.parse(saved);
      }

      // Se for um aluno autenticado em conta real e houver respostas registradas anteriormente como visitante,
      // migra essas respostas automaticamente para a conta dele para garantir continuidade sem perda de dados
      if (user?.id && user.id !== DEFAULT_DEMO_USER.id) {
        const guestSaved = localStorage.getItem('bancoresidencia_user_answers_guest');
        if (guestSaved) {
          try {
            const guestAnswers: Record<string, UserAnswerItem> = JSON.parse(guestSaved);
            let hasNewFromGuest = false;
            Object.entries(guestAnswers).forEach(([qId, ans]) => {
              if (!loaded[qId]) {
                loaded[qId] = ans;
                hasNewFromGuest = true;
              }
            });
            if (hasNewFromGuest) {
              localStorage.setItem(storageKey, JSON.stringify(loaded));
              localStorage.removeItem('bancoresidencia_user_answers_guest');
            }
          } catch {
            // ignore
          }
        }
      }
    } catch (e) {
      console.error('Erro ao ler respostas locais da conta:', e);
    }

    setUserAnswers(loaded);

    // Se estiver logado em conta real no Supabase, sincroniza com o banco de dados remoto
    if (user?.id && user.id !== DEFAULT_DEMO_USER.id) {
      const supabase = createClient();
      supabase
        .from('user_answers')
        .select('question_id, selected_option, is_correct, answered_at')
        .eq('user_id', user.id)
        .then(({ data, error }) => {
          if (!error && data) {
            setUserAnswers((prev) => {
              const merged = { ...prev };
              let changed = false;
              const remoteQuestionIds = new Set(data.map((r) => r.question_id));

              // 1. Incorpora respostas remotas para a máquina local
              data.forEach((row) => {
                if (!merged[row.question_id]) {
                  changed = true;
                  const q = supabaseQuestions.find((item) => item.id === row.question_id);
                  merged[row.question_id] = {
                    letter: row.selected_option as 'A' | 'B' | 'C' | 'D' | 'E',
                    isCorrect: row.is_correct,
                    timestamp: new Date(row.answered_at).getTime(),
                    difficulty: q?.difficulty || 'Médio',
                    isAnulada: q?.isAnulada || false,
                    specialty: q?.especialidade,
                    tema: q?.tema,
                    foco: q?.foco,
                    subfoco: q?.subfoco
                  };
                }
              });

              // 2. Se houver respostas locais que ainda não estão no Supabase, faz o upload em segundo plano
              const missingInRemote = Object.entries(prev).filter(([qId]) => !remoteQuestionIds.has(qId));
              if (missingInRemote.length > 0) {
                const upsertPayload = missingInRemote.map(([qId, ans]) => ({
                  user_id: user.id,
                  question_id: qId,
                  selected_option: ans.letter,
                  is_correct: ans.isCorrect,
                  answered_at: new Date(ans.timestamp || Date.now()).toISOString()
                }));
                supabase
                  .from('user_answers')
                  .upsert(upsertPayload, { onConflict: 'user_id,question_id' })
                  .then(({ error: upsertErr }) => {
                    if (upsertErr) {
                      console.error('Erro ao sincronizar respostas pendentes com Supabase:', upsertErr);
                    }
                  });
              }

              if (changed) {
                try {
                  localStorage.setItem(storageKey, JSON.stringify(merged));
                } catch (e) {
                  console.error(e);
                }
                return merged;
              }
              return prev;
            });
          }
        });
    }
  }, [user?.id, supabaseQuestions]);
  const [totalSupabaseCount, setTotalSupabaseCount] = useState<number>(132965);
  const [totalGlobalQuestions, setTotalGlobalQuestions] = useState<number>(132965);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState<boolean>(false);
  const [hasLoadedSupabaseOnce, setHasLoadedSupabaseOnce] = useState<boolean>(false);
  const [questionsPage, setQuestionsPage] = useState<number>(1);

  // Carrega dinamicamente a contagem global total do Supabase
  useEffect(() => {
    let isCancelled = false;
    fetchTotalQuestionsCount().then((count) => {
      if (!isCancelled && count > 0) {
        setTotalGlobalQuestions(count);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  // Referências para acompanhamento suave da barra de navegação de questões
  const questionScrollContainerRef = useRef<HTMLDivElement>(null);
  const questionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Efeito para a barra de questões acompanhar suavemente a questão atual selecionada
  useEffect(() => {
    if (activeTab !== 'banco' || bancoMode !== 'resolucao') return;
    const targetBtn = questionButtonRefs.current[currentQuestionIndex];
    if (targetBtn) {
      targetBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentQuestionIndex, activeTab, bancoMode]);

  // Carregamento de questões do Supabase com paginação e filtros
  useEffect(() => {
    let isCancelled = false;
    const loadQuestions = async () => {
      setIsLoadingSupabase(true);
      try {
        let questionIds: string[] | undefined;
        let effectivePageSize = sessionQuestionLimit
          ? Math.min(200, Math.max(1, sessionQuestionLimit))
          : 50;

        if (activeListId) {
          const currentList = lists.find((l) => l.id === activeListId);
          if (currentList && currentList.questionIds.length > 0) {
            questionIds = currentList.questionIds;
            effectivePageSize = Math.min(200, Math.max(1, currentList.questionIds.length));
          }
        } else if (bancoMode === 'resolucao' && sessionQuestionIds && sessionQuestionIds.length > 0) {
          questionIds = sessionQuestionIds;
          effectivePageSize = Math.min(200, Math.max(1, sessionQuestionIds.length));
        }

        const currentUserAnswers = userAnswersRef.current;
        const answeredIds = Object.keys(currentUserAnswers);
        const correctIds = Object.entries(currentUserAnswers).filter(([_, a]) => a.isCorrect).map(([id]) => id);
        const wrongIds = Object.entries(currentUserAnswers).filter(([_, a]) => !a.isCorrect).map(([id]) => id);

        const res = await fetchQuestionsFromSupabase(
          activeListId ? {} : {
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
            const snapshot: Record<string, boolean> = {};
            answeredIds.forEach((id) => {
              snapshot[id] = true;
            });
            setSessionExclusionSnapshot(snapshot);
          } else {
            setSupabaseQuestions((prev) => {
              const existingIds = new Set(prev.map((q) => q.id));
              const newItems = res.questions.filter((q) => !existingIds.has(q.id));
              return [...prev, ...newItems];
            });
          }
          setTotalSupabaseCount(res.total);
          setHasLoadedSupabaseOnce(true);
        }
      } catch (err) {
        console.error('Erro ao buscar questões do Supabase:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingSupabase(false);
        }
      }
    };

    const timer = setTimeout(() => {
      loadQuestions();
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [advancedFilters, activeListId, lists, questionsPage, sessionQuestionLimit, sessionQuestionIds, bancoMode]);

  // Escuta atualizações de gabarito/comentário feitas na Auditoria e reflete na hora no Banco de Questões
  useEffect(() => {
    const handleQuestionUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{
        questionId: string;
        correctAnswer: Question['correctAnswer'];
        commentary?: string;
        options?: Question['options'];
        isAnulada?: boolean;
      }>;
      if (!customEvent.detail) return;
      const { questionId, correctAnswer, commentary, options, isAnulada } = customEvent.detail;
      setSupabaseQuestions((prev) =>
        prev.map((q) => {
          if (q.id === questionId || q.code === questionId) {
            return {
              ...q,
              correctAnswer: correctAnswer || q.correctAnswer,
              commentary: commentary !== undefined ? commentary : q.commentary,
              options: options || q.options,
              isAnulada: isAnulada !== undefined ? isAnulada : (correctAnswer === 'ANULADA')
            };
          }
          return q;
        })
      );
    };

    window.addEventListener('bancoresidencia_question_updated', handleQuestionUpdated);
    return () => window.removeEventListener('bancoresidencia_question_updated', handleQuestionUpdated);
  }, []);


  // Filtragem local complementar para status (resolvidas/não vistas) e fallback
  // Filtragem local complementar para status (resolvidas/não vistas), dificuldade, formato, anuladas e revisadas
  const filteredQuestions = useMemo(() => {
    const list = hasLoadedSupabaseOnce
      ? supabaseQuestions
      : supabaseQuestions.length > 0
      ? supabaseQuestions
      : [];

    if (activeListId) {
      return list;
    }

    const filtered = list.filter((q) => {
      // 1. Status da questão (userAnswers)
      const answer = userAnswers[q.id];
      const isResolved = !!answer;
      const isCorrect = answer?.isCorrect === true;
      const isWrong = isResolved && !isCorrect;

      // Se a questão foi respondida antes da carga desta lista/sessão, ela é considerada "já vista".
      // Se ela foi respondida durante a navegação/sessão atual (não estava no snapshot quando carregou),
      // mantemos ela visível para que o aluno possa conferir o gabarito, justificativas e refazer.
      const isResolvedBeforeSession = sessionExclusionSnapshot[q.id] === true;

      if (advancedFilters.status === 'Não vistas') {
        if (isResolvedBeforeSession) return false;
      }
      if (advancedFilters.status === 'Resolvidas' && !isResolved && !isResolvedBeforeSession) return false;
      if (advancedFilters.status === 'Acertadas' && !isCorrect) return false;
      if (advancedFilters.status === 'Erradas' && !isWrong) return false;
      if (advancedFilters.status === 'Ainda não acertadas' && isCorrect) return false;

      // 2. Dificuldade (Fácil, Médio, Difícil)
      if (advancedFilters.dificuldade !== 'Todas') {
        const qDiff = q.difficulty || 'Médio';
        if (qDiff !== advancedFilters.dificuldade) return false;
      }

      // 3. Formato / Tipo de questão (Múltipla escolha, Discursiva)
      if (advancedFilters.tipoQuestao !== 'Todas') {
        const qType = q.type || 'Múltipla escolha';
        if (qType !== advancedFilters.tipoQuestao) return false;
      }

      // 4. Ocultar anuladas
      if (advancedFilters.ocultarAnuladasErro && q.isAnulada) {
        return false;
      }

      // 5. Ocultar já revisadas
      if (advancedFilters.ocultarRevisadas) {
        if (isResolvedBeforeSession) return false;
      }

      return true;
    });

    if (!advancedFilters.aleatorizar) {
      return [...filtered].sort((a, b) => {
        const diff = (b.year || 0) - (a.year || 0);
        return diff !== 0 ? diff : a.id.localeCompare(b.id);
      });
    }

    return filtered;
  }, [
    supabaseQuestions,
    hasLoadedSupabaseOnce,
    advancedFilters.status,
    advancedFilters.dificuldade,
    advancedFilters.tipoQuestao,
    advancedFilters.ocultarAnuladasErro,
    advancedFilters.ocultarRevisadas,
    advancedFilters.aleatorizar,
    userAnswers,
    sessionExclusionSnapshot,
    bancoMode,
    activeListId
  ]);

  // Resolução sequencial: exibe questões da lista ativa ou respeita o limite avulso do aluno (máx 200)
  const visibleQuestions = useMemo(() => {
    // 1. Se estiver resolvendo uma lista específica do aluno
    if (activeListId) {
      const currentList = lists.find((l) => l.id === activeListId);
      if (currentList && currentList.questionIds.length > 0) {
        const idSet = new Set(currentList.questionIds);
        const listItems = filteredQuestions.filter((q) => idSet.has(q.id));
        return listItems.slice(0, 200);
      }
    }

    // 2. Se estiver em resolução avulsa com IDs balanceados por cotas
    if (sessionQuestionIds && sessionQuestionIds.length > 0) {
      const questionMap = new Map(filteredQuestions.map((q) => [q.id, q]));
      const ordered = sessionQuestionIds
        .map((id) => questionMap.get(id))
        .filter((q): q is Question => Boolean(q));
      if (ordered.length > 0) {
        if (!advancedFilters.aleatorizar) {
          ordered.sort((a, b) => {
            const diff = (b.year || 0) - (a.year || 0);
            return diff !== 0 ? diff : a.id.localeCompare(b.id);
          });
        }
        return ordered.slice(0, 200);
      }
    }

    // 3. Se estiver em resolução avulsa com limite configurado pelo aluno (ex: 20, 50, 100 ou até 200)
    if (sessionQuestionLimit) {
      const targetCount = Math.min(filteredQuestions.length, Math.min(200, sessionQuestionLimit));
      const slice = filteredQuestions.slice(0, targetCount);
      if (!advancedFilters.aleatorizar) {
        slice.sort((a, b) => {
          const diff = (b.year || 0) - (a.year || 0);
          return diff !== 0 ? diff : a.id.localeCompare(b.id);
        });
      }
      return slice;
    }

    // 4. Padrão: Janela deslizante de 50 questões base + 1 a cada acerto/erro (teto 200)
    const solvedInSession = filteredQuestions.filter((q) => !!userAnswers[q.id]).length;
    const targetCount = Math.min(
      200,
      Math.min(
        filteredQuestions.length,
        Math.max(50 + solvedInSession, currentQuestionIndex + 1)
      )
    );
    const slice = filteredQuestions.slice(0, targetCount);
    if (!advancedFilters.aleatorizar) {
      slice.sort((a, b) => {
        const diff = (b.year || 0) - (a.year || 0);
        return diff !== 0 ? diff : a.id.localeCompare(b.id);
      });
    }
    return slice;
  }, [
    filteredQuestions,
    userAnswers,
    currentQuestionIndex,
    activeListId,
    lists,
    sessionQuestionLimit,
    sessionQuestionIds,
    advancedFilters.aleatorizar
  ]);

  // Navegação e atalhos globais de questões pelo teclado
  useEffect(() => {
    if (activeTab !== 'banco' || bancoMode !== 'resolucao') return;

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

      // Atalho B para favoritar a questão atual
      if (e.key === 'b' || e.key === 'B') {
        const currQ = filteredQuestions[Math.min(currentQuestionIndex, filteredQuestions.length - 1)];
        if (currQ) {
          e.preventDefault();
          setBookmarkedQuestionIds((prev) => ({
            ...prev,
            [currQ.id]: !prev[currQ.id]
          }));
        }
        return;
      }

      // Atalho R para reportar erro na questão atual
      if (e.key === 'r' || e.key === 'R') {
        const currQ = filteredQuestions[Math.min(currentQuestionIndex, filteredQuestions.length - 1)];
        if (currQ) {
          e.preventDefault();
          setQuestionToReport(currQ);
          setIsReportDrawerOpen(true);
        }
        return;
      }

      // Atalho + ou - para tamanho da fonte
      if (e.key === '+' || e.key === '=' || e.key === ']') {
        e.preventDefault();
        handleFontSizeChange(fontSize === 'sm' ? 'base' : 'lg');
        return;
      }
      if (e.key === '-' || e.key === '_' || e.key === '[') {
        e.preventDefault();
        handleFontSizeChange(fontSize === 'lg' ? 'base' : 'sm');
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
        setQuestionTimer(0);
      } else if (e.key === 'ArrowRight' || e.key === 'j' || e.key === 'J') {
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, bancoMode, visibleQuestions.length, totalSupabaseCount, filteredQuestions, currentQuestionIndex, fontSize]);

  const handleAnswer = (questionId: string, selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E', isCorrect: boolean) => {
    const q = supabaseQuestions.find((item) => item.id === questionId);
    const answerTimestamp = Date.now();
    const isAnuladaQuestion = Boolean(q?.isAnulada || q?.correctAnswer === 'ANULADA');
    const finalIsCorrect = isAnuladaQuestion ? true : isCorrect;

    const prevAnswer = userAnswers[questionId];
    const isRetrialRecovery = prevAnswer && !prevAnswer.isCorrect && finalIsCorrect;

    const answerObj: UserAnswerItem = {
      ...prevAnswer,
      letter: selectedLetter,
      isCorrect: finalIsCorrect,
      timestamp: answerTimestamp,
      difficulty: q?.difficulty || prevAnswer?.difficulty || 'Médio',
      isAnulada: isAnuladaQuestion,
      specialty: q?.especialidade || prevAnswer?.specialty,
      tema: q?.tema || prevAnswer?.tema,
      foco: q?.foco || prevAnswer?.foco,
      subfoco: q?.subfoco || prevAnswer?.subfoco,
      banca: q?.banca || prevAnswer?.banca,
      year: q?.year || prevAnswer?.year,
      code: q?.code || prevAnswer?.code,
      statusRetrial: isRetrialRecovery
        ? 'recuperado'
        : finalIsCorrect
        ? prevAnswer?.statusRetrial || undefined
        : 'pendente',
      lastRetriedAt: isRetrialRecovery ? answerTimestamp : prevAnswer?.lastRetriedAt
    };

    setUserAnswers((prev) => {
      const nextAnswers = {
        ...prev,
        [questionId]: answerObj
      };
      if (typeof window !== 'undefined') {
        try {
          const storageKey = getUserAnswersStorageKey(user?.id);
          localStorage.setItem(storageKey, JSON.stringify(nextAnswers));
        } catch (e) {
          console.error(e);
        }
      }
      return nextAnswers;
    });

    // Sincroniza em segundo plano com a tabela user_answers do Supabase para a conta do aluno
    if (user?.id && user.id !== DEFAULT_DEMO_USER.id) {
      const supabase = createClient();
      supabase
        .from('user_answers')
        .upsert(
          {
            user_id: user.id,
            question_id: questionId,
            selected_option: selectedLetter,
            is_correct: finalIsCorrect,
            answered_at: new Date(answerTimestamp).toISOString()
          },
          { onConflict: 'user_id,question_id' }
        )
        .then(({ error }) => {
          if (error) {
            console.error('Erro ao sincronizar resposta da conta no Supabase:', error);
          }
        });
    }
    if (activeListId) {
      setLists((prev) => {
        const nextLists = prev.map((l) => {
          if (l.id === activeListId) {
            const nextCompleted = Math.min(l.totalQuestions, l.completedQuestions + 1);
            return {
              ...l,
              completedQuestions: nextCompleted,
              progressPercentage: Math.round((nextCompleted / l.totalQuestions) * 100),
              lastStudiedAt: 'Agora mesmo'
            };
          }
          return l;
        });
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('bancoresidencia_lists', JSON.stringify(nextLists));
          } catch (e) {
            console.error(e);
          }
        }
        return nextLists;
      });
    }
  };

  // Atualização de metadados do erro no Caderno de Erros (motivo do erro e anotação pessoal)
  const handleUpdateAnswerMeta = (
    questionId: string,
    meta: {
      errorReason?: ErrorReasonType;
      studentNotes?: string;
      statusRetrial?: 'pendente' | 'recuperado';
    }
  ) => {
    setUserAnswers((prev) => {
      const current = prev[questionId];
      if (!current) return prev;
      const updated: UserAnswerItem = {
        ...current,
        ...meta
      };
      const nextAnswers = {
        ...prev,
        [questionId]: updated
      };
      if (typeof window !== 'undefined') {
        try {
          const storageKey = getUserAnswersStorageKey(user?.id);
          localStorage.setItem(storageKey, JSON.stringify(nextAnswers));
        } catch (e) {
          console.error(e);
        }
      }
      return nextAnswers;
    });
  };

  // Iniciar sessão de treino focada exclusivamente nos erros selecionados
  const handleStartTreinoErros = (questionIds: string[]) => {
    if (!questionIds || questionIds.length === 0) return;
    setSessionQuestionIds(questionIds);
    setSessionQuestionLimit(questionIds.length);
    setCurrentQuestionIndex(0);
    setQuestionsPage(1);
    setBancoMode('resolucao');
    setActiveTab('banco');
  };

  const handleSimulateDemoQuestions = (amount: number) => {
    setSimulatedExtraAnswers((prev) => {
      const nextTotal = prev.total + amount;
      const addedCorrect = Math.round(amount * 0.78);
      const nextCorrect = prev.correct + addedCorrect;
      const nextUnique = prev.unique + Math.round(amount * 0.75);
      const nextReviews = prev.reviews + Math.round(amount * 0.15);
      const nextRepeated = prev.repeated + (amount - Math.round(amount * 0.75) - Math.round(amount * 0.15));

      return {
        total: nextTotal,
        correct: nextCorrect,
        unique: nextUnique,
        reviews: nextReviews,
        repeated: nextRepeated
      };
    });
  };

  // Criar nova lista diretamente a partir do filtro configurado: abre o modal de distribuição por especialidade/tema/foco/subfoco e seleção de pasta
  const handleCreateListFromFilter = () => {
    setIsCreateCadernoModalOpen(true);
  };

  // Confirmação da criação da lista customizada com cotas reais do Supabase e vinculação à pasta
  const handleConfirmCreateCaderno = async (config: {
    title: string;
    folderId: string | null;
    questionCountsByItem: Record<string, number>;
    totalQuestions: number;
    startSolvingImmediately: boolean;
  }) => {
    setIsCreatingListLoading(true);
    try {
      const maxToFetch = Math.min(200, Math.max(1, config.totalQuestions));
      let selectedIds = await fetchQuestionIdsForListCriteria(
        config.questionCountsByItem,
        advancedFilters,
        maxToFetch
      );

      // Se ainda não tiver IDs (fallback de segurança local)
      if (selectedIds.length === 0) {
        const pool = supabaseQuestions.length > 0 ? supabaseQuestions : filteredQuestions;
        selectedIds = pool.slice(0, maxToFetch).map((q) => q.id);
      }

      const newList: QuestionList = {
        id: `list-${Date.now()}`,
        userId: user?.id,
        title: config.title,
        folderId: config.folderId || undefined,
        questionIds: selectedIds,
        totalQuestions: selectedIds.length,
        completedQuestions: 0,
        lastStudiedAt: 'Criada agora',
        inProgress: false,
        progressPercentage: 0,
        createdAt: new Date().toISOString()
      };

      const updatedLists = [newList, ...lists];
      setLists(updatedLists);
      await saveUserLists(updatedLists, user?.id);
      setIsCreateCadernoModalOpen(false);

      if (config.startSolvingImmediately) {
        setActiveListId(newList.id);
        setSessionQuestionLimit(null);
        setActiveTab('banco');
        setBancoMode('resolucao');
        setCurrentQuestionIndex(0);
        setQuestionTimer(0);
      }
    } catch (err) {
      console.error('Erro ao gerar lista de questões:', err);
    } finally {
      setIsCreatingListLoading(false);
    }
  };

  // Salvar uma questão individual visualizada em uma pasta específica
  const handleSaveQuestionToFolder = async (questionId: string, folderId: string, folderName: string) => {
    // 1. Atualiza mapa em memória e localStorage
    setSavedQuestionsFolderMap((prev) => {
      const current = prev[questionId] || [];
      if (current.includes(folderId)) return prev;
      const nextMap = { ...prev, [questionId]: [...current, folderId] };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bancoresidencia_saved_questions_folder_map', JSON.stringify(nextMap));
        } catch {
          // ignore
        }
      }
      return nextMap;
    });

    // 2. Adiciona à lista correspondente daquela pasta ou cria nova
    const existingListIndex = lists.findIndex((l) => l.folderId === folderId);
    let nextLists: QuestionList[];
    if (existingListIndex !== -1) {
      const targetList = lists[existingListIndex];
      if (targetList.questionIds.includes(questionId)) {
        return;
      }
      const updatedList: QuestionList = {
        ...targetList,
        questionIds: [questionId, ...targetList.questionIds],
        totalQuestions: targetList.questionIds.length + 1,
        lastStudiedAt: 'Atualizado recentemente',
        updatedAt: new Date().toISOString()
      };
      nextLists = [...lists];
      nextLists[existingListIndex] = updatedList;
    } else {
      const newList: QuestionList = {
        id: `list-folder-${folderId}-${Date.now()}`,
        userId: user?.id,
        title: `Questões Salvas - ${folderName}`,
        folderId,
        questionIds: [questionId],
        totalQuestions: 1,
        completedQuestions: 0,
        lastStudiedAt: 'Criada recentemente',
        inProgress: false,
        progressPercentage: 0,
        createdAt: new Date().toISOString()
      };
      nextLists = [newList, ...lists];
    }
    setLists(nextLists);
    await saveUserLists(nextLists, user?.id);
  };

  const handleCreateFolder = async (name: string, parentId: string | null) => {
    const newFolder: Folder = {
      id: `f-${Date.now()}`,
      userId: user?.id,
      name,
      parentId,
      color: parentId ? '#10b981' : '#3b82f6',
      createdAt: new Date().toISOString()
    };
    const nextFolders = [...folders, newFolder];
    setFolders(nextFolders);
    await saveUserFolders(nextFolders, user?.id);
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    const nextFolders = folders.map((f) => (f.id === folderId ? { ...f, name: newName } : f));
    setFolders(nextFolders);
    await saveUserFolders(nextFolders, user?.id);
  };

  // Exclusão recursiva de pastas em até 3 níveis
  const handleDeleteFolder = async (folderId: string) => {
    const toDelete = new Set<string>([folderId]);
    let addedMore = true;
    while (addedMore) {
      addedMore = false;
      for (const f of folders) {
        if (f.parentId && toDelete.has(f.parentId) && !toDelete.has(f.id)) {
          toDelete.add(f.id);
          addedMore = true;
        }
      }
    }
    const nextFolders = folders.filter((f) => !toDelete.has(f.id));
    setFolders(nextFolders);
    await saveUserFolders(nextFolders, user?.id);
    for (const id of toDelete) {
      await deleteUserFolderFromDb(id);
    }

    const nextLists = lists.map((l) => (l.folderId && toDelete.has(l.folderId) ? { ...l, folderId: undefined } : l));
    setLists(nextLists);
    await saveUserLists(nextLists, user?.id);
  };

  const handleEditList = async (listId: string, newTitle: string, newFolderId?: string | null) => {
    const nextLists = lists.map((l) =>
      l.id === listId
        ? {
            ...l,
            title: newTitle,
            folderId: newFolderId !== undefined ? (newFolderId || undefined) : l.folderId,
            updatedAt: new Date().toISOString()
          }
        : l
    );
    setLists(nextLists);
    await saveUserLists(nextLists, user?.id);
  };

  const handleDeleteList = async (listId: string) => {
    const nextLists = lists.filter((l) => l.id !== listId);
    setLists(nextLists);
    await saveUserLists(nextLists, user?.id);
    await deleteUserListFromDb(listId);
    if (activeListId === listId) {
      setActiveListId(null);
    }
  };

  const handleCreateListWithFilters = async (
    title: string,
    folderId: string | null,
    totalQuestions: number,
    appliedFilters: AdvancedFilterState
  ) => {
    setIsCreatingListLoading(true);
    try {
      const maxToFetch = Math.min(200, Math.max(1, totalQuestions));
      const res = await fetchQuestionsFromSupabase(
        appliedFilters,
        1,
        maxToFetch
      );
      let chosenIds = res.questions.map((q) => q.id);

      if (chosenIds.length === 0) {
        const pool = supabaseQuestions.length > 0 ? supabaseQuestions : filteredQuestions;
        chosenIds = pool.slice(0, maxToFetch).map((q) => q.id);
      }

      const newList: QuestionList = {
        id: `list-${Date.now()}`,
        userId: user?.id,
        title,
        folderId: folderId || undefined,
        questionIds: chosenIds,
        totalQuestions: chosenIds.length,
        completedQuestions: 0,
        lastStudiedAt: 'Criada agora',
        inProgress: false,
        progressPercentage: 0,
        createdAt: new Date().toISOString()
      };
      const nextLists = [newList, ...lists];
      setLists(nextLists);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bancoresidencia_last_active_list_id', newList.id);
        } catch {}
      }
      await saveUserLists(nextLists, user?.id);
    } catch (err) {
      console.error('Erro ao criar lista com filtros:', err);
    } finally {
      setIsCreatingListLoading(false);
    }
  };

  const handleContinueList = (list: QuestionList) => {
    setActiveListId(list.id);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bancoresidencia_last_active_list_id', list.id);
      } catch {}
    }
    setActiveTab('banco');
    setBancoMode('resolucao');
    setCurrentQuestionIndex(0);
    setQuestionTimer(0);
  };

  const handleStartOfficialExam = (
    institution: string,
    year: number,
    banca?: string,
    examDetails?: OfficialExamItem
  ) => {
    saveRecentOfficialExam({
      id: `${institution}-${year}`,
      institution,
      institutionFullName: banca || institution,
      year,
      modality: 'acesso_direto',
      totalQuestions: examDetails?.questionCount || 100,
      answeredQuestions: 0,
      correctAnswers: 0,
      status: 'em_andamento'
    });
    setAdvancedFilters((prev) => ({
      ...prev,
      instituicoes: [institution],
      anos: [year]
    }));
    setActiveListId(null);
    setActiveTab('banco');
    setBancoMode('resolucao');
    setCurrentQuestionIndex(0);
    setQuestionTimer(0);
  };

  const handleNavigateToBancoWithSubfoco = (specialty: string, tema: string, subfoco: string) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      especialidades: [specialty],
      temas: [tema],
      subfocos: [subfoco]
    }));
    setActiveTab('banco');
    setBancoMode('filtros');
  };

  const handleNavigateToBancoFromCaderno = (specialty?: string, tema?: string, subfoco?: string) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      especialidades: specialty && specialty !== 'Todas' ? [specialty] : [],
      temas: tema ? [tema] : [],
      subfocos: subfoco ? [subfoco] : []
    }));
    setActiveTab('banco');
    setBancoMode('filtros');
  };

  // Simulação / Teste de Percentil (padrão null para exibir estatísticas 100% reais do aluno)
  const [simulatedTestPercentile, setSimulatedTestPercentile] = useState<number | null>(null);

  // Cálculo das estatísticas reais e funcionais em tempo real
  const stats: UserStats = useMemo(() => {
    const rawAnswered = Object.keys(userAnswers).length;
    const rawCorrect = Object.values(userAnswers).filter((a) => a.isCorrect).length;
    const rawIncorrect = rawAnswered - rawCorrect;

    const totalAnswered = rawAnswered + simulatedExtraAnswers.total;
    const totalCorrect = rawCorrect + simulatedExtraAnswers.correct;
    const totalIncorrect = rawIncorrect + (simulatedExtraAnswers.total - simulatedExtraAnswers.correct);

    const accuracyRate = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;
    const uniqueAnswered = totalAnswered;
    const reviews = simulatedExtraAnswers.reviews;
    const repeated = simulatedExtraAnswers.repeated;

    const userAttemptsList: UserAttempt[] = Object.entries(userAnswers).map(([qid, a]) => ({
      question_id: qid,
      difficulty: a.difficulty,
      correct: a.isCorrect,
      user_id: 'current-user',
      timestamp: a.timestamp,
      selectedLetter: a.letter,
      specialty: a.specialty,
      tema: a.tema,
      foco: a.foco,
      subfoco: a.subfoco
    }));

    let percentileInfo = calculatePercentile({
      totalAnswered,
      totalCorrect,
      filters: performanceFilters,
      attempts: userAttemptsList.length > 0 ? userAttemptsList : undefined
    });

    if (simulatedTestPercentile !== null) {
      percentileInfo = {
        ...percentileInfo,
        percentile: simulatedTestPercentile,
        status: simulatedTestPercentile >= 70 ? 'official' : 'provisional',
        missingForApprox: 0,
        missingForOfficial: 0,
        adjustedScore: (simulatedTestPercentile / 100) * 1.85,
        eligibleTotalStudents: 850,
        rankPosition: Math.max(1, Math.round((1 - simulatedTestPercentile / 100) * 850))
      };
    }

    // Mapa das 6 especialidades médicas oficiais dos filtros
    const specialtyMap: Record<string, { total: number; correct: number }> = {
      'Clínica Médica': { total: 0, correct: 0 },
      'Cirurgia Geral': { total: 0, correct: 0 },
      'Pediatria': { total: 0, correct: 0 },
      'Ginecologia': { total: 0, correct: 0 },
      'Obstetrícia': { total: 0, correct: 0 },
      'Medicina Preventiva e Social': { total: 0, correct: 0 }
    };

    const themeMap: Record<string, { specialty: string; tema: string; total: number; correct: number }> = {};

    // Mapeamento dinâmico baseado nas questões resolvidas pelo usuário
    Object.entries(userAnswers).forEach(([qid, ans]) => {
      let spec = ans.specialty;
      let tema = ans.tema;
      if (!spec || !tema) {
        const q = supabaseQuestions.find((item) => item.id === qid);
        if (!spec) spec = q?.especialidade;
        if (!tema) tema = q?.tema;
      }
      if (spec) {
        // Normaliza "Ginecologia e Obstetrícia" para uma das 6 se aplicável
        if (spec === 'Ginecologia e Obstetrícia') {
          if (tema && (tema.toLowerCase().includes('obstet') || tema.toLowerCase().includes('parto') || tema.toLowerCase().includes('gesta') || tema.toLowerCase().includes('fetal'))) {
            spec = 'Obstetrícia';
          } else {
            spec = 'Ginecologia';
          }
        } else if (spec === 'Cirurgia') {
          spec = 'Cirurgia Geral';
        }

        if (!specialtyMap[spec]) {
          specialtyMap[spec] = { total: 0, correct: 0 };
        }
        specialtyMap[spec].total += 1;
        if (ans.isCorrect) {
          specialtyMap[spec].correct += 1;
        }

        if (tema) {
          const themeKey = `${spec}:::${tema}`;
          if (!themeMap[themeKey]) {
            themeMap[themeKey] = { specialty: spec, tema, total: 0, correct: 0 };
          }
          themeMap[themeKey].total += 1;
          if (ans.isCorrect) {
            themeMap[themeKey].correct += 1;
          }
        }
      }
    });

    if (simulatedExtraAnswers.total > 0) {
      const specs = [
        'Clínica Médica',
        'Cirurgia Geral',
        'Pediatria',
        'Ginecologia',
        'Obstetrícia',
        'Medicina Preventiva e Social'
      ];
      const perSpec = Math.floor(simulatedExtraAnswers.total / specs.length);
      const studentRatio = totalAnswered > 0 ? (totalCorrect / totalAnswered) : 0.70;
      specs.forEach((sp) => {
        if (!specialtyMap[sp]) {
          specialtyMap[sp] = { total: 0, correct: 0 };
        }
        specialtyMap[sp].total += perSpec;
        specialtyMap[sp].correct += Math.round(perSpec * studentRatio);
      });
    }

    const bySpecialty = Object.entries(specialtyMap).map(([specialty, val]) => ({
      specialty,
      total: val.total,
      correct: val.correct,
      accuracy: val.total > 0 ? (val.correct / val.total) * 100 : 0
    }));

    const byTheme = Object.values(themeMap).map((item) => ({
      specialty: item.specialty,
      tema: item.tema,
      total: item.total,
      correct: item.correct,
      accuracy: item.total > 0 ? (item.correct / item.total) * 100 : 0
    }));

    // Histórico diário real dos últimos 7 dias baseado em timestamps
    const now = new Date();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const historyByDay: { date: string; answered: number; correct: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

      const answersOnDay = Object.values(userAnswers).filter(
        (a) => a.timestamp >= startOfDay && a.timestamp < endOfDay
      );

      const isToday = i === 0;
      const label = isToday ? 'Hoje' : dayNames[d.getDay()];

      historyByDay.push({
        date: label,
        answered: answersOnDay.length,
        correct: answersOnDay.filter((a) => a.isCorrect).length
      });
    }

    // Cálculo real de streak de dias consecutivos
    const answeredTimestamps = Object.values(userAnswers)
      .map((a) => a.timestamp)
      .filter((t): t is number => typeof t === 'number' && !isNaN(t));

    const answeredDates = new Set(
      answeredTimestamps.map((t) => {
        const d = new Date(t);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    );

    let streakDays = 0;
    if (answeredDates.size > 0) {
      const today = new Date();
      const formatDate = (date: Date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      const todayStr = formatDate(today);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDate(yesterday);

      let cursor: Date | null = null;
      if (answeredDates.has(todayStr)) {
        cursor = new Date(today);
      } else if (answeredDates.has(yesterdayStr)) {
        cursor = new Date(yesterday);
      }

      if (cursor) {
        while (answeredDates.has(formatDate(cursor))) {
          streakDays++;
          cursor.setDate(cursor.getDate() - 1);
        }
      }
    }

    // Dias reais na plataforma a partir do histórico de respostas ativas
    const daysOnPlatform = answeredDates.size > 0 ? answeredDates.size : 1;
    const studyTimeMinutes = Math.round(totalAnswered * 1.5);

    return {
      totalAnswered,
      uniqueAnswered,
      reviews,
      repeated,
      totalCorrect,
      totalIncorrect,
      accuracyRate,
      daysOnPlatform,
      streakDays,
      studyTimeMinutes,
      percentileInfo,
      historyByDay,
      bySpecialty,
      byTheme
    };
  }, [userAnswers, simulatedExtraAnswers, performanceFilters, simulatedTestPercentile, supabaseQuestions]);

  // Procura a última lista que o aluno estava resolvendo (por ID persistido, em andamento, ou mais recente)
  const recentList = useMemo(() => {
    if (!lists || lists.length === 0) return undefined;
    let savedLastId: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        savedLastId = localStorage.getItem('bancoresidencia_last_active_list_id');
      } catch {}
    }
    if (savedLastId) {
      const match = lists.find((l) => l.id === savedLastId);
      if (match) return match;
    }
    if (activeListId) {
      const match = lists.find((l) => l.id === activeListId);
      if (match) return match;
    }
    const inProgress = lists.find((l) => l.inProgress && l.completedQuestions < l.totalQuestions);
    return inProgress || lists[0];
  }, [lists, activeListId]);

  const officialRanking = getOfficialRanking(performanceFilters, {
    answered: stats.totalAnswered,
    correct: stats.totalCorrect,
    name: studentName
  });

  const displayedRanking = officialRanking.map((item) => {
    if (item.name.includes('(Você)') && simulatedTestPercentile !== null) {
      return {
        ...item,
        percentile: simulatedTestPercentile
      };
    }
    return item;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--foreground)]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Stethoscope className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Carregando Banco Residência...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] text-[var(--foreground)] flex flex-col">
        <LandingPage
          onOpenAuth={(mode = 'login', planTitle) => {
            setAuthModal({ isOpen: true, mode, planTitle });
          }}
          onLoginDemo={() => {
            loginAsDemo();
          }}
        />

        {authModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
            <div className="w-full max-w-xl my-8">
              <AuthScreen
                initialMode={authModal.mode}
                selectedPlanTitle={authModal.planTitle}
                onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
                onSuccess={() => setAuthModal({ isOpen: false, mode: 'login' })}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--foreground)] flex font-sans transition-colors duration-200">
      {/* 1. Barra Lateral de Navegação Retrátil (Sidebar) */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          if (tab === 'banco') setBancoMode('filtros');
          setMobileMenuOpen(false);
        }}
        modalidade={performanceFilters.modalidade}
        streakDays={stats.streakDays}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        pendingErrorsCount={pendingErrorsCount}
      />

      {/* Conteúdo Principal à Direita da Sidebar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior Mobile e Header Geral com Glassmorphism */}
        <header className="sticky top-0 z-30 bg-[var(--bg-card)]/85 dark:bg-[var(--bg-card)]/85 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 transition-colors duration-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
            {/* Botão Mobile para abrir navegação quando em telas pequenas */}
            <div className="md:hidden flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
                aria-label="Abrir menu de navegação"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Barra de Pesquisa Geral no Topo */}
            <GlobalSearchBar
              onNavigate={(tab) => {
                setActiveTab(tab);
                if (tab === 'banco') setBancoMode('filtros');
                setMobileMenuOpen(false);
              }}
              onSearchQuestions={(searchTerm) => {
                setAdvancedFilters((prev) => ({
                  ...prev,
                  search: searchTerm
                }));
              }}
              onSelectSpecialty={(specialty, tema) => {
                setAdvancedFilters((prev) => ({
                  ...prev,
                  especialidades: [specialty],
                  temas: tema ? [tema] : [],
                  search: ''
                }));
              }}
              onSelectInstitution={(inst) => {
                setAdvancedFilters((prev) => ({
                  ...prev,
                  instituicoes: [inst],
                  search: ''
                }));
              }}
              onSelectList={(listId) => {
                setActiveListId(listId);
              }}
              onSelectQuestion={(questionId) => {
                setActiveTab('banco');
                setBancoMode('resolucao');
                const q = supabaseQuestions.find((item) => item.id === questionId);
                if (q) {
                  setAdvancedFilters((prev) => ({
                    ...prev,
                    search: q.code
                  }));
                } else {
                  setAdvancedFilters((prev) => ({
                    ...prev,
                    search: questionId
                  }));
                }
              }}
              lists={lists}
            />

            {/* Controles da Borda Superior: Tema + Perfil do Aluno com Dropdown (Modelo Imagem 3) */}
            <div className="flex items-center gap-2.5 shrink-0">
              <ThemeSelector compact={true} />

              {/* Botões para Visitante Não Logado */}
              {!user && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white shadow-sm transition-transform hover:scale-105 cursor-pointer"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    Criar Conta
                  </button>
                </div>
              )}

              {/* Perfil do Aluno na Borda Superior (Imagem 3) */}
              {user && (
                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center justify-center p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/90 dark:border-slate-800 transition-all cursor-pointer group"
                    title={`${user.name} • ${stats.streakDays} dias seguidos`}
                  >
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8.5 h-8.5 rounded-xl object-cover border-2 shadow-xs transition-transform group-hover:scale-105 shrink-0"
                        style={{ borderColor: accentConfig.primaryHex }}
                      />
                    ) : (
                      <div
                        className="w-8.5 h-8.5 rounded-xl flex items-center justify-center font-bold text-[11px] text-white shadow-xs shrink-0"
                        style={{ backgroundColor: accentConfig.primaryHex }}
                      >
                        {(user.name || 'LR').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu com Ajustar Perfil e Sair (como na Imagem 2 e 3) */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center gap-3 p-2 border-b border-zinc-100 dark:border-zinc-800/80">
                        {user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-10 h-10 rounded-xl object-cover border-2 shrink-0"
                            style={{ borderColor: accentConfig.primaryHex }}
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0"
                            style={{ backgroundColor: accentConfig.primaryHex }}
                          >
                            {(user.name || 'LR').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {user.name}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{stats.streakDays} dias seguidos</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 space-y-1">
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('curadoria');
                                setProfileDropdownOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Curadoria de Gabaritos</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('reportes');
                                setProfileDropdownOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Flag className="w-3.5 h-3.5" />
                                <span>Questões Reportadas</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('configuracoes');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                        >
                          <span>Ajustar Perfil</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                        >
                          <span>Sair da Conta</span>
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Menu Mobile Expandido */}
          {mobileMenuOpen && (
            <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-[var(--bg-card)] dark:bg-[var(--bg-card)] px-4 py-3 space-y-1.5 shadow-lg">
              {[
                { id: 'home', label: 'Início' },
                { id: 'banco', label: 'Banco de Questões' },
                { id: 'caderno_erros', label: 'Caderno de Erros' },
                { id: 'listas', label: 'Cadernos & Pastas' },
                { id: 'provas', label: 'Provas na Íntegra' },
                { id: 'simulados', label: 'Simulados' },
                { id: 'stats', label: 'Meu Desempenho' },
                { id: 'ranking', label: 'Ranking Oficial' },
                { id: 'configuracoes', label: 'Meu Perfil & Ajustes' },
                ...(isAdmin
                  ? [
                      { id: 'curadoria', label: 'Curadoria de Gabaritos' },
                      { id: 'reportes', label: 'Questões Reportadas' }
                    ]
                  : [])
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    const nextTab = item.id as ActiveTab;
                    setActiveTab(nextTab);
                    if (nextTab === 'banco') setBancoMode('filtros');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === item.id
                      ? 'text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                  style={{
                    backgroundColor: activeTab === item.id ? accentConfig.primaryHex : undefined
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Corpo Principal da Aplicação */}
        <main
          className={`w-full mx-auto flex-1 transition-all ${
            activeTab === 'home' && !user
              ? 'p-0 max-w-none overflow-x-hidden'
              : activeTab === 'banco' && bancoMode === 'filtros'
              ? 'px-4 sm:px-6 max-w-6xl h-[calc(100vh-4.75rem)] max-h-[calc(100vh-4.75rem)] flex flex-col justify-between py-2 sm:py-2.5 overflow-hidden'
              : 'px-4 sm:px-6 max-w-6xl py-9 sm:py-10 space-y-9 sm:space-y-11'
          }`}
        >
          {/* ABA 1: INÍCIO (LANDING PAGE PARA VISITANTES OU DASHBOARD DO ALUNO AUTENTICADO) */}
          {activeTab === 'home' && (
            !user ? (
              <LandingPage
                onOpenAuth={(mode = 'login', planTitle) => setAuthModal({ isOpen: true, mode, planTitle })}
                onLoginDemo={loginAsDemo}
              />
            ) : (
              <StudentHomeDashboard
                studentName={studentName}
                stats={stats}
                dailyGoal={dailyGoal}
                onUpdateDailyGoal={(goal) => {
                  setCustomDailyGoal(goal);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('bancoresidencia_custom_daily_goal', String(goal));
                  }
                }}
                recentList={recentList}
                allLists={lists}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  if (tab === 'banco') setBancoMode('filtros');
                }}
                onContinueList={handleContinueList}
                modalidade={performanceFilters.modalidade}
                onSimulatePercentile={(p) => setSimulatedTestPercentile(p)}
                onStartOfficialExam={handleStartOfficialExam}
              />
            )
          )}

          {/* ABA 2: BANCO DE QUESTÕES (RESOLUÇÃO SEQUENCIAL INSPIRADA NA IMAGEM 2 OU FILTROS SEPARADOS) */}
          {activeTab === 'banco' && (
            <div className={bancoMode === 'filtros' ? 'h-full flex flex-col justify-between min-h-0' : 'space-y-6'}>
              {/* Caderno Ativo (se houver) */}
              {activeListId && (
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/40 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-300 shadow-sm shrink-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-blue-700 dark:text-blue-400">Resolvendo Caderno:</span>
                    <strong className="text-slate-900 dark:text-white font-heading text-sm">
                      {lists.find((l) => l.id === activeListId)?.title}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveListId(null)}
                    className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar para Questões Avulsas</span>
                  </button>
                </div>
              )}

              {/* MODO 1: FILTROS SEPARADOS DAS QUESTÕES */}
              {bancoMode === 'filtros' ? (
                <div className="h-full flex flex-col justify-between min-h-0 animate-in fade-in duration-200">
                  {/* Componente Completo de Filtros Avançados */}
                  <AdvancedQuestionFilters
                    isSidebarCollapsed={sidebarCollapsed}
                    filters={advancedFilters}
                    onChange={(newFilters) => {
                      setAdvancedFilters(newFilters);
                      setSessionQuestionIds(null);
                      setQuestionsPage(1);
                      setCurrentQuestionIndex(0);
                    }}
                    onReset={() => {
                      handleResetAdvancedFilters();
                      setSessionQuestionIds(null);
                      setQuestionsPage(1);
                      setCurrentQuestionIndex(0);
                    }}
                    totalAvailable={totalGlobalQuestions}
                    totalFiltered={totalSupabaseCount}
                    isLoading={isLoadingSupabase}
                    onCreateListFromFilter={handleCreateListFromFilter}
                    onSelectDirectQuestion={(questionId) => {
                      const idx = filteredQuestions.findIndex((q) => q.id === questionId);
                      if (idx !== -1) {
                        setCurrentQuestionIndex(idx);
                      } else {
                        const targetQ = supabaseQuestions.find((q) => q.id === questionId);
                        if (targetQ) {
                          setAdvancedFilters((prev) => ({
                            ...prev,
                            search: targetQ.code
                          }));
                        } else {
                          setAdvancedFilters((prev) => ({
                            ...prev,
                            search: questionId
                          }));
                        }
                        setCurrentQuestionIndex(0);
                      }
                      setActiveListId(null);
                      setSessionQuestionIds(null);
                      setQuestionTimer(0);
                      setBancoMode('resolucao');
                    }}
                    onStartSequentialSolving={async (
                      limit?: number,
                      quotas?: Record<string, number>,
                      explicitFilters?: AdvancedFilterState
                    ) => {
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
                          // Imediatamente busca e armazena os dados completos das questões para zero lag e renderização instantânea
                          const fullRes = await fetchQuestionsFromSupabase(
                            activeFilters,
                            1,
                            finalLimit,
                            balancedIds
                          );
                          if (fullRes.questions && fullRes.questions.length > 0) {
                            setSupabaseQuestions(fullRes.questions);
                          }
                        } else {
                          setSessionQuestionIds(null);
                        }
                      } catch (e) {
                        console.error('Erro ao gerar questões balanceadas:', e);
                        setSessionQuestionIds(null);
                      } finally {
                        setIsLoadingSupabase(false);
                      }

                      setBancoMode('resolucao');
                    }}
                  />
                </div>
              ) : bancoMode === 'resultado' ? (
                /* MODO 3: TELA DE RESULTADOS E PRINCIPAIS PONTOS A SEREM MELHOR ESTUDADOS */
                <div className="space-y-6 animate-in fade-in duration-200">
                  {(() => {
                    const sessionQuestions = filteredQuestions;
                    const sessionAnswered = sessionQuestions.filter((q) => userAnswers[q.id]);
                    const sessionCorrect = sessionAnswered.filter((q) => userAnswers[q.id]?.isCorrect);
                    const sessionIncorrect = sessionAnswered.filter(
                      (q) => !userAnswers[q.id]?.isCorrect && !q.isAnulada && q.correctAnswer !== 'ANULADA'
                    );
                    const answeredCount = sessionAnswered.length;
                    const correctCount = sessionCorrect.length;
                    const incorrectCount = sessionIncorrect.length;
                    const accuracyRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

                    // Diagnóstico clínico inteligente por tema
                    const weakPointsMap = new Map<
                      string,
                      {
                        specialty: string;
                        tema: string;
                        count: number;
                        focos: string[];
                        questions: Question[];
                      }
                    >();

                    sessionIncorrect.forEach((q) => {
                      const key = `${q.especialidade} - ${q.tema}`;
                      if (!weakPointsMap.has(key)) {
                        weakPointsMap.set(key, {
                          specialty: q.especialidade,
                          tema: q.tema,
                          count: 0,
                          focos: [],
                          questions: []
                        });
                      }
                      const entry = weakPointsMap.get(key)!;
                      entry.count++;
                      entry.questions.push(q);
                      if (q.foco && !entry.focos.includes(q.foco)) {
                        entry.focos.push(q.foco);
                      }
                      if (q.subfoco && !entry.focos.includes(q.subfoco)) {
                        entry.focos.push(q.subfoco);
                      }
                    });

                    const weakPoints = Array.from(weakPointsMap.values()).sort((a, b) => b.count - a.count);

                    return (
                      <>
                        {/* Header com Resumo Geral */}
                        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                            <div className="flex items-center gap-3.5">
                              <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0"
                                style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
                              >
                                <Trophy className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                                    Resolução Sequencial Finalizada
                                  </span>
                                </div>
                                <h2 className="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                                  Desempenho da Sessão
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  Confira suas métricas de precisão e os principais focos clínicos recomendados para estudo.
                                </p>
                              </div>
                            </div>

                            {/* Botão de Retorno Rápido aos Filtros */}
                            <button
                              type="button"
                              onClick={() => setBancoMode('filtros')}
                              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md transition-all hover:scale-102 cursor-pointer shrink-0"
                              style={{ backgroundColor: accentConfig.primaryHex }}
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>Retornar aos Filtros</span>
                            </button>
                          </div>

                          {/* Grid de 4 Métricas */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Total de Questões</span>
                              <span className="text-2xl sm:text-3xl font-black font-sans text-slate-900 dark:text-white">
                                {sessionQuestions.length}
                              </span>
                              <span className="text-[10px] text-slate-400 block">no lote selecionado</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Respondidas</span>
                              <span className="text-2xl sm:text-3xl font-black font-sans text-slate-900 dark:text-white">
                                {answeredCount}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {answeredCount === sessionQuestions.length ? '100% resolvidas' : `${sessionQuestions.length - answeredCount} pendentes`}
                              </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-1">
                              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Acertos
                              </span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-black font-sans text-emerald-600 dark:text-emerald-400">
                                  {correctCount}
                                </span>
                                <span className="text-xs font-bold text-emerald-600/80 dark:text-emerald-400/80 font-sans">
                                  ({accuracyRate}%)
                                </span>
                              </div>
                              <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 block">aproveitamento</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 space-y-1">
                              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 block flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Erros
                              </span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-black font-sans text-rose-600 dark:text-rose-400">
                                  {incorrectCount}
                                </span>
                                <span className="text-xs font-bold text-rose-600/80 dark:text-rose-400/80 font-sans">
                                  ({answeredCount > 0 ? 100 - accuracyRate : 0}%)
                                </span>
                              </div>
                              <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 block">necessitam revisão</span>
                            </div>
                          </div>
                        </div>

                        {/* SEÇÃO PRINCIPAIS PONTOS A SEREM MELHOR ESTUDADOS */}
                        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs space-y-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-heading text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                Principais Pontos a Serem Melhor Estudados
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Diagnóstico baseado nos erros e dúvidas identificados durante esta sessão sequencial.
                              </p>
                            </div>
                          </div>

                          {weakPoints.length > 0 ? (
                            <div className="space-y-4 pt-2">
                              {weakPoints.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 transition-all hover:border-amber-400/50"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                        {item.specialty}
                                      </span>
                                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                        {item.tema}
                                      </h4>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                        {item.count} {item.count === 1 ? 'erro' : 'erros'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Subtópicos e focos específicos do erro */}
                                  {item.focos.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                      <span className="text-[11px] font-semibold text-slate-400">Focos prioritários:</span>
                                      {item.focos.map((fc, fIdx) => (
                                        <span
                                          key={fIdx}
                                          className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-[11px] font-medium"
                                        >
                                          {fc}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Recomendação de Estudo direcionada */}
                                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                                    <span className="font-bold text-amber-600 dark:text-amber-400 block">
                                      💡 Recomendação de Fixação:
                                    </span>
                                    <p className="leading-relaxed">
                                      {item.specialty.includes('Ginecologia')
                                        ? 'Revisar diretrizes do Ministério da Saúde para rastreio de câncer de colo de útero (condutas em LIEBG, LIEAG e ASC-US) e vacinação contra HPV.'
                                        : item.specialty.includes('Obstetrícia')
                                        ? 'Focar no diagnóstico e manejo agudo das síndromes hipertensivas (sulfatação de pré-eclâmpsia com sinais de gravidade) e vitalidade fetal.'
                                        : item.specialty.includes('Cirurgia')
                                        ? 'Rever escores clínicos diagnósticos (Alvarado para apendicite), anatomia de hérnias inguinais e critérios de indicação cirúrgica de urgência.'
                                        : item.specialty.includes('Clínica')
                                        ? 'Revisar critérios de indicação dialítica de urgência, controle de hipercalemia grave e condução de cetoacidose diabética e sepse.'
                                        : item.specialty.includes('Pediatria')
                                        ? 'Priorizar marcos de desenvolvimento infantil (PNI), manejo de desidratação (Planos A, B e C) e pneumonias comunitárias.'
                                        : `Aprofundar nos critérios diagnósticos e terapêuticos de ${item.tema} e resolver questões com foco nos erros cometidos.`}
                                    </p>
                                  </div>

                                  {/* Atalhos para ver as questões que o aluno errou */}
                                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                                    <span className="text-[11px] text-slate-400">Ir para a questão com erro:</span>
                                    {item.questions.map((q) => {
                                      const qIdx = filteredQuestions.findIndex((itemQ) => itemQ.id === q.id);
                                      return (
                                        <button
                                          key={q.id}
                                          type="button"
                                          onClick={() => {
                                            if (qIdx !== -1) {
                                              setCurrentQuestionIndex(qIdx);
                                              setBancoMode('resolucao');
                                              setQuestionTimer(0);
                                            }
                                          }}
                                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                        >
                                          {q.code} →
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                              <Sparkles className="w-8 h-8 text-emerald-500 mx-auto" />
                              <h4 className="text-base font-extrabold text-emerald-800 dark:text-emerald-300">
                                Excelente! Nenhum erro registrado nesta sessão.
                              </h4>
                              <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-lg mx-auto">
                                Você acertou 100% das questões respondidas. Para continuar evoluindo, teste filtros com nível de dificuldade &quot;Difícil&quot; ou explore novos temas clínicos.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Barra de Ações Inferior: Retornar à tela de filtros */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setBancoMode('resolucao');
                              setCurrentQuestionIndex(0);
                              setQuestionTimer(0);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Revisar Questões Desta Sessão</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setBancoMode('filtros')}
                            className="flex items-center gap-2 px-7 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-white shadow-lg transition-all hover:scale-102 cursor-pointer"
                            style={{ backgroundColor: accentConfig.primaryHex }}
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Concluir e Voltar aos Filtros →</span>
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                /* MODO 2: RESOLUÇÃO SEQUENCIAL QUESTÃO A QUESTÃO (ESTRUTURA DA IMAGEM 2) */
                <div className="space-y-5 animate-in fade-in duration-200">
                  {visibleQuestions.length > 0 ? (
                    <>
                      {/* BARRA SUPERIOR SEQUENCIAL (MODELO DA IMAGEM 2 COM RÉGUA RETRÁTIL DA IMAGEM 1) */}
                      <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-xs flex flex-col gap-2.5">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          {/* Esquerda: Widget de Progresso Circular Retrátil (Modelo da Imagem 2) */}
                          <div className="flex items-center gap-3">
                            {(() => {
                              const answeredCount = visibleQuestions.filter((q) => !!userAnswers[q.id]).length;
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
                                  {/* Círculo de Progresso com Porcentagem (Estilo Imagem 2) */}
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

                                  {/* Posição e Rótulo Progresso (Estilo Imagem 2) */}
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

                          {/* Direita: Ferramentas de Estudo (Marca-Texto 6 cores, Fonte A-/A/A+, Favoritar, Reportar, Atalhos do Teclado, Filtros, Finalizar) */}
                          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100 dark:border-slate-800">
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

                              {/* Pílula Flutuante Horizontal Centralizada com as 6 Cores de Marca-texto em Linha */}
                              {isTopHighlighterMenuOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-max min-w-max flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800 rounded-full shadow-xl animate-in fade-in zoom-in-95 duration-150">
                                  {(['yellow', 'green', 'pink', 'blue', 'orange', 'purple'] as HighlighterColor[]).map((colorKey) => {
                                    const c = HIGHLIGHTER_COLORS[colorKey];
                                    const isSelected = activeHighlighterColor === colorKey;
                                    return (
                                      <button
                                        key={colorKey}
                                        type="button"
                                        onClick={() => {
                                          setActiveHighlighterColor(colorKey);
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

                            {/* Seletor de Tamanho de Fonte (A- / A / A+) */}
                            <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold shadow-xs">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 px-1 font-semibold">Fonte:</span>
                              <button
                                type="button"
                                onClick={() => handleFontSizeChange('sm')}
                                title="Fonte Compacta (-)"
                                className={`px-1.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                                  fontSize === 'sm'
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                }`}
                              >
                                A-
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFontSizeChange('base')}
                                title="Fonte Padrão"
                                className={`px-1.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                                  fontSize === 'base'
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                }`}
                              >
                                A
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFontSizeChange('lg')}
                                title="Fonte Grande (+)"
                                className={`px-1.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                                  fontSize === 'lg'
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                }`}
                              >
                                A+
                              </button>
                            </div>

                            {/* Ações de Questão: Favoritar (Apenas Símbolo Bookmark) e Reportar */}
                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                              {/* Favoritar: Somente o Símbolo Bookmark */}
                              {filteredQuestions[Math.min(currentQuestionIndex, filteredQuestions.length - 1)] && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const qId = filteredQuestions[Math.min(currentQuestionIndex, filteredQuestions.length - 1)].id;
                                    setBookmarkedQuestionIds((prev) => ({
                                      ...prev,
                                      [qId]: !prev[qId]
                                    }));
                                  }}
                                  className={`p-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                                    bookmarkedQuestionIds[filteredQuestions[Math.min(currentQuestionIndex, filteredQuestions.length - 1)].id]
                                      ? 'text-amber-500'
                                      : 'text-slate-400 hover:text-amber-500'
                                  }`}
                                  title={
                                    bookmarkedQuestionIds[filteredQuestions[Math.min(currentQuestionIndex, filteredQuestions.length - 1)].id]
                                      ? 'Remover dos favoritos (B)'
                                      : 'Favoritar questão (B)'
                                  }
                                >
                                  <Bookmark
                                    className={`w-4 h-4 transition-transform ${
                                      bookmarkedQuestionIds[filteredQuestions[Math.min(currentQuestionIndex, filteredQuestions.length - 1)].id]
                                        ? 'fill-amber-500 text-amber-500 scale-110'
                                        : ''
                                    }`}
                                  />
                                </button>
                              )}

                              {/* Reportar */}
                              {filteredQuestions[Math.min(currentQuestionIndex, filteredQuestions.length - 1)] && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentQ = filteredQuestions[Math.min(currentQuestionIndex, filteredQuestions.length - 1)];
                                    if (!currentQ) return;
                                    setQuestionToReport(currentQ);
                                    setIsReportDrawerOpen(true);
                                  }}
                                  className={`p-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                                    reportedQuestionIds[filteredQuestions[Math.min(currentQuestionIndex, filteredQuestions.length - 1)].id]
                                      ? 'text-amber-500 fill-amber-500'
                                      : 'text-slate-400 hover:text-amber-500'
                                  }`}
                                  title="Reportar erro na questão (R)"
                                >
                                  <Flag
                                    className={`w-4 h-4 ${
                                      reportedQuestionIds[filteredQuestions[Math.min(currentQuestionIndex, filteredQuestions.length - 1)].id]
                                        ? 'fill-amber-500'
                                        : ''
                                    }`}
                                  />
                                </button>
                              )}
                            </div>

                            {/* Botão de Atalhos do Teclado (Imagem 3) */}
                            <button
                              type="button"
                              onClick={() => setIsShortcutsModalOpen(true)}
                              className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs group"
                              title="Atalhos do Teclado (?)"
                            >
                              <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                              <span className="hidden sm:inline text-xs font-bold">Atalhos</span>
                            </button>

                            {/* Seletor Rápido: Mais Recentes vs Aleatório */}
                            <div className="hidden sm:inline-flex items-center rounded-xl p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <button
                                type="button"
                                onClick={() => {
                                  if (advancedFilters.aleatorizar) {
                                    setAdvancedFilters((prev) => ({ ...prev, aleatorizar: false }));
                                    setSessionQuestionIds(null);
                                    setQuestionsPage(1);
                                    setCurrentQuestionIndex(0);
                                    setSupabaseQuestions((prev) =>
                                      [...prev].sort((a, b) => {
                                        const diff = (b.year || 0) - (a.year || 0);
                                        return diff !== 0 ? diff : a.id.localeCompare(b.id);
                                      })
                                    );
                                  }
                                }}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  !advancedFilters.aleatorizar
                                    ? 'text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                style={{
                                  backgroundColor: !advancedFilters.aleatorizar ? accentConfig.primaryHex : undefined
                                }}
                                title="Modo Mais Recentes: prioriza e ordena pelas questões dos anos mais novos"
                              >
                                <Clock className="w-3 h-3" />
                                <span>Recentes</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!advancedFilters.aleatorizar) {
                                    setAdvancedFilters((prev) => ({ ...prev, aleatorizar: true }));
                                    setSessionQuestionIds(null);
                                    setQuestionsPage(1);
                                    setCurrentQuestionIndex(0);
                                    setSupabaseQuestions((prev) => shuffleArray([...prev]));
                                  }
                                }}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  advancedFilters.aleatorizar
                                    ? 'text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                style={{
                                  backgroundColor: advancedFilters.aleatorizar ? accentConfig.primaryHex : undefined
                                }}
                                title="Modo Aleatório: distribui de forma uniforme por múltiplos anos e bancas"
                              >
                                <Shuffle className="w-3 h-3" />
                                <span>Aleatório</span>
                              </button>
                            </div>

                            {/* Botão de Filtros (Apenas Ícones) */}
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

                            {/* Botão Finalizar Resolução Sequencial */}
                            <button
                              type="button"
                              onClick={() => setBancoMode('resultado')}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white shadow-xs transition-transform hover:scale-105 cursor-pointer"
                              style={{ backgroundColor: accentConfig.primaryHex }}
                              title="Finalizar resolução e visualizar resultados e pontos fracos"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Finalizar</span>
                            </button>

                            {/* Botão Finalizar se for caderno */}
                            {activeListId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveListId(null);
                                  setActiveTab('listas');
                                }}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white shadow-sm transition-transform hover:scale-105 cursor-pointer"
                                style={{ backgroundColor: '#0284c7' }}
                              >
                                Sair do Caderno
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Sequência Retrátil de Questões na Íntegra (Modelo da Imagem 1) */}
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
                                const ans = userAnswers[q.id];
                                const isAnswered = !!ans;
                                const isCorrect = ans?.isCorrect;

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
                                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full font-sans font-black text-sm sm:text-[15px] flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                      isCurrent
                                        ? 'text-white shadow-md ring-2 ring-offset-1 ring-blue-500/40'
                                        : isAnswered
                                        ? isCorrect
                                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/60'
                                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-700/60'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                    style={isCurrent ? { backgroundColor: accentConfig.primaryHex } : undefined}
                                    title={`Questão ${idx + 1}${isAnswered ? (isCorrect ? ' (Correta)' : ' (Incorreta)') : ''}`}
                                  >
                                    {idx + 1}
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
                              disabled={
                                currentQuestionIndex >= visibleQuestions.length - 1 &&
                                visibleQuestions.length >= totalSupabaseCount
                              }
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

                      {/* QUESTÃO ATUAL EM SEQUÊNCIA (CARD FOCADO) */}
                      {visibleQuestions[Math.min(currentQuestionIndex, visibleQuestions.length - 1)] && (
                        <QuestionCard
                          key={visibleQuestions[Math.min(currentQuestionIndex, visibleQuestions.length - 1)].id}
                          question={visibleQuestions[Math.min(currentQuestionIndex, visibleQuestions.length - 1)]}
                          index={Math.min(currentQuestionIndex, visibleQuestions.length - 1)}
                          total={visibleQuestions.length}
                          onAnswer={handleAnswer}
                          userAnswer={userAnswers[visibleQuestions[Math.min(currentQuestionIndex, visibleQuestions.length - 1)].id]?.letter}
                          fontSize={fontSize}
                          onChangeFontSize={handleFontSizeChange}
                          folders={folders}
                          onCreateFolder={handleCreateFolder}
                          onSaveToFolder={handleSaveQuestionToFolder}
                          savedFolderIds={savedQuestionsFolderMap[visibleQuestions[Math.min(currentQuestionIndex, visibleQuestions.length - 1)].id] || []}
                          activeHighlighterColor={activeHighlighterColor}
                          onSelectHighlighterColor={setActiveHighlighterColor}
                        />
                      )}

                      {/* NAVEGAÇÃO SEQUENCIAL INFERIOR */}
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          disabled={Math.min(currentQuestionIndex, visibleQuestions.length - 1) === 0}
                          onClick={() => {
                            setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                            setQuestionTimer(0);
                          }}
                          className="flex items-center gap-1.5 sm:gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Questão Anterior</span>
                          <span className="sm:hidden">Anterior</span>
                        </button>

                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold text-center">
                          Questão <strong className="text-slate-900 dark:text-white font-sans font-black text-sm sm:text-base">{Math.min(currentQuestionIndex, visibleQuestions.length - 1) + 1}</strong> de <strong className="text-slate-900 dark:text-white font-sans font-black text-sm sm:text-base">{visibleQuestions.length}</strong>
                        </div>

                        {Math.min(currentQuestionIndex, visibleQuestions.length - 1) >= visibleQuestions.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => setBancoMode('resultado')}
                            className="flex items-center gap-1.5 sm:gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white shadow-md hover:scale-102 transition-transform cursor-pointer"
                            style={{ backgroundColor: accentConfig.primaryHex }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Finalizar e Ver Resultados</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentQuestionIndex((prev) => Math.min(visibleQuestions.length - 1, prev + 1));
                              setQuestionTimer(0);
                            }}
                            className="flex items-center gap-1.5 sm:gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                          >
                            <span className="hidden sm:inline">Próxima Questão</span>
                            <span className="sm:hidden">Próxima</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-20 bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 space-y-4 shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <p className="text-slate-900 dark:text-white text-base font-bold">Nenhuma questão encontrada com os filtros selecionados.</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                        Experimente abrir o painel de filtros e desmarcar alguns critérios para visualizar mais questões do acervo.
                      </p>
                      <button
                        type="button"
                        onClick={() => setBancoMode('filtros')}
                        className="mt-2 text-xs font-bold px-5 py-2.5 rounded-xl text-white transition-all cursor-pointer shadow-sm hover:scale-102"
                        style={{ backgroundColor: accentConfig.primaryHex }}
                      >
                        Abrir Painel de Filtros
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ABA: CADERNO DE ERROS & METACOGNIÇÃO */}
          {activeTab === 'caderno_erros' && (
            <CadernoDeErros
              userAnswers={userAnswers}
              onUpdateAnswerMeta={handleUpdateAnswerMeta}
              onAnswerQuestion={handleAnswer}
              onStartTreinoErros={handleStartTreinoErros}
              onNavigateToBanco={handleNavigateToBancoFromCaderno}
            />
          )}

          {/* ABA 3: LISTAS DE QUESTÕES & PASTAS */}
          {activeTab === 'listas' && (
            <ListManager
              folders={folders}
              lists={lists}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onCreateListWithFilters={handleCreateListWithFilters}
              onEditList={handleEditList}
              onDeleteList={handleDeleteList}
              onContinueList={handleContinueList}
            />
          )}

          {/* ABA 4: PROVAS OFICIAIS NA ÍNTEGRA */}
          {activeTab === 'provas' && (
            <OfficialExams onStartExam={handleStartOfficialExam} />
          )}

          {/* ABA 5: SIMULADOS */}
          {activeTab === 'simulados' && (
            <MockExams
              onStartExam={() => {
                setActiveTab('banco');
              }}
            />
          )}

          {/* ABA 5: MEU DESEMPENHO */}
          {activeTab === 'stats' && (
            <StatsDashboard
              stats={stats}
              filters={performanceFilters}
              userAnswers={userAnswers}
              onFilterChange={setPerformanceFilters}
              onResetFilters={handleResetPerformanceFilters}
              onSimulateDemoQuestions={handleSimulateDemoQuestions}
              onNavigateToBancoWithSubfoco={handleNavigateToBancoWithSubfoco}
              onNavigateToCadernoErros={() => {
                setActiveTab('caderno_erros');
              }}
              onNavigateToRanking={() => setActiveTab('ranking')}
            />
          )}

          {/* ABA 6: RANKING */}
          {activeTab === 'ranking' && (
            <div className="space-y-6">
              <OfficialRanking
                ranking={displayedRanking}
                filters={performanceFilters}
                userQuestions={stats.totalAnswered}
                userPercentile={simulatedTestPercentile ?? stats.percentileInfo.percentile ?? 78}
                userCorrect={stats.totalCorrect}
                userName={studentName}
                onSimulateDemoQuestions={handleSimulateDemoQuestions}
              />
            </div>
          )}

          {/* ABA 7: CONFIGURAÇÕES E PERFIL DO ALUNO */}
          {activeTab === 'configuracoes' && (
            <StudentProfileSettings
              fontSize={fontSize}
              onChangeFontSize={handleFontSizeChange}
              onLogout={logout}
            />
          )}

          {/* ABA 8: CURADORIA DE GABARITOS (PAINEL ADMINISTRATIVO) */}
          {activeTab === 'curadoria' && isAdmin && (
            <AdminCuradoriaGabaritos />
          )}

          {/* ABA 9: AUDITORIA DE QUESTÕES REPORTADAS (PAINEL ADMINISTRATIVO) */}
          {activeTab === 'reportes' && isAdmin && (
            <AdminReportedQuestions />
          )}
        </main>

        {/* Rodapé Moderno */}
        {!(activeTab === 'banco' && bancoMode === 'filtros') && (
          <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[var(--bg-card)] py-6 text-center text-xs text-zinc-500 dark:text-zinc-400 transition-colors">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Banco Residência Médica 2026</span>
                <span>•</span>
                <span>Alta Performance & Raciocínio Clínico</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Score Bayesiano • Diamante & Elite Calibrados • Modos Claro e Escuro
              </p>
            </div>
          </footer>
        )}
      </div>

      {/* Modal Avançado de Criação de Caderno Personalizado com Cotas e Pastas em 3 Níveis */}
      <CreateCadernoModal
        isOpen={isCreateCadernoModalOpen}
        onClose={() => setIsCreateCadernoModalOpen(false)}
        filters={advancedFilters}
        folders={folders}
        onCreateFolder={handleCreateFolder}
        onConfirmCreate={handleConfirmCreateCaderno}
        availableQuestionsCount={totalSupabaseCount}
        isGenerating={isCreatingListLoading}
      />

      {/* Modal de Planos & Assinatura */}
      <SubscriptionModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlan={plan}
      />

      {/* Modal de Autenticação (Login / Cadastro) */}
      {authModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md max-h-[95vh] overflow-y-auto">
            <AuthScreen
              initialMode={authModal.mode}
              selectedPlanTitle={authModal.planTitle}
              onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
              onSuccess={() => setAuthModal({ isOpen: false, mode: 'login' })}
            />
          </div>
        </div>
      )}

      {/* Modal de Atalhos do Teclado (Imagem 3) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Drawer Lateral de Apontamento e Reporte de Erro em Questão */}
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
          success('Apontamento enviado com sucesso para auditoria da banca médica!', 'Denúncia Registrada');
        }}
      />
    </div>
  );
}
