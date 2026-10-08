'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { mockQuestions } from '@/data/mockQuestions';
import { initialFolders, initialLists } from '@/data/mockLists';
import { AdvancedQuestionFilters } from '@/components/AdvancedQuestionFilters';
import { QuestionCard } from '@/components/QuestionCard';
import { StatsDashboard } from '@/components/StatsDashboard';
import { StudentHomeDashboard } from '@/components/StudentHomeDashboard';
import { ListManager } from '@/components/ListManager';
import { MockExams } from '@/components/MockExams';
import { OfficialExams } from '@/components/OfficialExams';
import { OfficialRanking } from '@/components/OfficialRanking';
import { Sidebar } from '@/components/Sidebar';
import { GlobalSearchBar } from '@/components/GlobalSearchBar';
import { PercentileColorTester } from '@/components/PercentileColorTester';
import { ThemeSelector } from '@/components/ThemeSelector';
import { AuthScreen } from '@/components/AuthScreen';
import { StudentProfileSettings } from '@/components/StudentProfileSettings';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  UserStats,
  PerformanceFilterState,
  AdvancedFilterState,
  ActiveTab,
  Folder,
  QuestionList,
  UserAttempt,
  Question
} from '@/types';
import { fetchQuestionsFromSupabase, fetchTotalQuestionsCount } from '@/services/questionService';
import { calculatePercentile, getOfficialRanking } from '@/utils/percentile';
import { matchesStudyModalidades } from '@/utils/modalidades';
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
  Clock
} from 'lucide-react';

export default function Home() {
  const { accentConfig } = useTheme();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bancoresidencia_sidebar_collapsed');
      if (saved !== null) return saved === 'true';
    }
    return true; // Padrão: recolhido (apenas ícones), com expansão para nomes
  });

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
  const [customDailyGoal, setCustomDailyGoal] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bancoresidencia_custom_daily_goal');
      if (saved) return Number(saved);
    }
    return null;
  });
  const dailyGoal = customDailyGoal ?? user?.dailyGoal ?? 30;

  // Pastas e Listas de Questões com persistência local
  const [folders, setFolders] = useState<Folder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bancoresidencia_folders');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialFolders;
  });

  const [lists, setLists] = useState<QuestionList[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bancoresidencia_lists');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialLists;
  });

  // Salvar pastas e cadernos no localStorage ao alterar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bancoresidencia_folders', JSON.stringify(folders));
    }
  }, [folders]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bancoresidencia_lists', JSON.stringify(lists));
    }
  }, [lists]);

  const [activeListId, setActiveListId] = useState<string | null>(null);

  // Tamanho de Fonte das Questões (Padrão 'base' para máxima legibilidade clínica)
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bancoresidencia_question_font_size');
      if (saved === 'sm' || saved === 'base' || saved === 'lg') return saved;
    }
    return 'base';
  });

  const handleFontSizeChange = (size: 'sm' | 'base' | 'lg') => {
    setFontSize(size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bancoresidencia_question_font_size', size);
    }
  };

  // Respostas do Usuário com metadados do item e persistência real
  const [userAnswers, setUserAnswers] = useState<
    Record<
      string,
      {
        letter: 'A' | 'B' | 'C' | 'D' | 'E';
        isCorrect: boolean;
        timestamp: number;
        difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Desconhecido';
        isAnulada: boolean;
        specialty?: string;
        tema?: string;
        foco?: string;
        subfoco?: string;
      }
    >
  >(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bancoresidencia_user_answers');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler respostas salvas:', e);
      }
    }
    return {};
  });

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
    ultimos5Anos: false
  });

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
  const [bancoMode, setBancoMode] = useState<'resolucao' | 'filtros' | 'resultado'>('resolucao');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questionTimer, setQuestionTimer] = useState<number>(0);
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<Record<string, boolean>>({});
  const [reportedQuestionIds, setReportedQuestionIds] = useState<Record<string, boolean>>({});
  // Padrão: não criar caderno ao resolver (aluno precisa marcar explicitamente para criar)
  const [shouldCreateCadernoOnSolve, setShouldCreateCadernoOnSolve] = useState<boolean>(false);

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
        if (activeListId) {
          const currentList = lists.find((l) => l.id === activeListId);
          if (currentList) {
            questionIds = currentList.questionIds;
          }
        }

        const res = await fetchQuestionsFromSupabase(
          advancedFilters,
          questionsPage,
          50,
          questionIds
        );
        if (!isCancelled) {
          if (questionsPage === 1) {
            setSupabaseQuestions(res.questions);
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
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [advancedFilters, activeListId, lists, questionsPage]);


  // Filtragem local complementar para status (resolvidas/não vistas) e fallback
  const filteredQuestions = useMemo(() => {
    const list = hasLoadedSupabaseOnce
      ? supabaseQuestions
      : supabaseQuestions.length > 0
      ? supabaseQuestions
      : mockQuestions;
    if (advancedFilters.status === 'Todas') return list;

    return list.filter((q) => {
      const answer = userAnswers[q.id];
      const isResolved = !!answer;
      const isCorrect = answer?.isCorrect === true;
      const isWrong = isResolved && !isCorrect;

      if (advancedFilters.status === 'Não vistas' && isResolved) return false;
      if (advancedFilters.status === 'Resolvidas' && !isResolved) return false;
      if (advancedFilters.status === 'Acertadas' && !isCorrect) return false;
      if (advancedFilters.status === 'Erradas' && !isWrong) return false;
      if (advancedFilters.status === 'Ainda não acertadas' && isCorrect) return false;
      return true;
    });
  }, [supabaseQuestions, hasLoadedSupabaseOnce, advancedFilters.status, userAnswers]);

  // Janela dinâmica de 50 questões: exibe 50 questões inicialmente. A cada questão resolvida, adiciona +1 ao final.
  const visibleQuestions = useMemo(() => {
    const solvedInSession = filteredQuestions.filter((q) => !!userAnswers[q.id]).length;
    // Janela deslizante: 50 questões base + 1 para cada questão resolvida pelo aluno
    const targetCount = Math.min(
      filteredQuestions.length,
      Math.max(50 + solvedInSession, currentQuestionIndex + 1)
    );
    return filteredQuestions.slice(0, targetCount);
  }, [filteredQuestions, userAnswers, currentQuestionIndex]);

  const handleAnswer = (questionId: string, selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E', isCorrect: boolean) => {
    const q = supabaseQuestions.find((item) => item.id === questionId) || mockQuestions.find((item) => item.id === questionId);
    setUserAnswers((prev) => {
      const nextAnswers = {
        ...prev,
        [questionId]: {
          letter: selectedLetter,
          isCorrect,
          timestamp: Date.now(),
          difficulty: q?.difficulty || 'Médio',
          isAnulada: q?.isAnulada || false,
          specialty: q?.especialidade,
          tema: q?.tema,
          foco: q?.foco,
          subfoco: q?.subfoco
        }
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bancoresidencia_user_answers', JSON.stringify(nextAnswers));
        } catch (e) {
          console.error(e);
        }
      }
      return nextAnswers;
    });

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

  // Criar nova lista diretamente a partir do filtro configurado
  const handleCreateListFromFilter = () => {
    const title = advancedFilters.temas[0] || advancedFilters.especialidades[0] || 'Caderno Personalizado de Estudos';
    const newList: QuestionList = {
      id: `list-${Date.now()}`,
      title: `${title} (${filteredQuestions.length} questões)`,
      folderId: undefined,
      questionIds: filteredQuestions.map((q) => q.id),
      totalQuestions: Math.max(filteredQuestions.length, 10),
      completedQuestions: 0,
      lastStudiedAt: 'Criada agora',
      inProgress: false,
      progressPercentage: 0
    };
    setLists((prev) => [newList, ...prev]);
    setActiveListId(newList.id);
    setActiveTab('listas');
  };

  const handleCreateFolder = (name: string, parentId: string | null) => {
    const newFolder: Folder = {
      id: `f-${Date.now()}`,
      name,
      parentId,
      color: parentId ? '#10b981' : '#3b82f6'
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, name: newName } : f))
    );
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId && f.parentId !== folderId));
    setLists((prev) =>
      prev.map((l) => (l.folderId === folderId ? { ...l, folderId: undefined } : l))
    );
  };

  const handleEditList = (listId: string, newTitle: string, newFolderId?: string | null) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              title: newTitle,
              folderId: newFolderId !== undefined ? (newFolderId || undefined) : l.folderId
            }
          : l
      )
    );
  };

  const handleDeleteList = (listId: string) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
    if (activeListId === listId) {
      setActiveListId(null);
    }
  };

  const handleCreateListWithFilters = (
    title: string,
    folderId: string | null,
    totalQuestions: number,
    appliedFilters: AdvancedFilterState
  ) => {
    const matched = mockQuestions.filter((q) => {
      if (appliedFilters.modalidades?.length > 0 && !matchesStudyModalidades(q, appliedFilters.modalidades)) return false;
      if (appliedFilters.especialidades?.length > 0) {
        const matchesSpec = appliedFilters.especialidades.some((spec: string) => {
          if (spec === q.especialidade) return true;
          if (
            (spec === 'Ginecologia' || spec === 'Obstetrícia' || spec === 'Ginecologia e Obstetrícia') &&
            (q.especialidade === 'Ginecologia' || q.especialidade === 'Obstetrícia' || q.especialidade === 'Ginecologia e Obstetrícia')
          ) {
            return true;
          }
          return false;
        });
        if (!matchesSpec) return false;
      }
      if (appliedFilters.temas?.length > 0 && !appliedFilters.temas.includes(q.tema)) return false;
      if (appliedFilters.focos?.length > 0 && !appliedFilters.focos.includes(q.foco)) return false;
      if (appliedFilters.subfocos?.length > 0 && !appliedFilters.subfocos.includes(q.subfoco)) return false;
      if (appliedFilters.instituicoes?.length > 0 && !appliedFilters.instituicoes.includes(q.institution)) return false;
      if (appliedFilters.anos?.length > 0 && !appliedFilters.anos.includes(q.year)) return false;
      if (appliedFilters.dificuldade !== 'Todas' && q.difficulty !== appliedFilters.dificuldade) return false;
      if (appliedFilters.tipoQuestao !== 'Todas' && q.type !== appliedFilters.tipoQuestao) return false;
      if (appliedFilters.ocultarAnuladasErro && q.isAnulada) return false;
      if (appliedFilters.ultimos5Anos && q.year < 2020) return false;
      return true;
    });

    const chosenIds = matched.length > 0
      ? matched.slice(0, totalQuestions).map((q) => q.id)
      : mockQuestions.slice(0, Math.min(totalQuestions, mockQuestions.length)).map((q) => q.id);

    const newList: QuestionList = {
      id: `list-${Date.now()}`,
      title,
      folderId: folderId || undefined,
      questionIds: chosenIds,
      totalQuestions: Math.max(totalQuestions, chosenIds.length),
      completedQuestions: 0,
      lastStudiedAt: 'Criada recentemente',
      inProgress: false,
      progressPercentage: 0
    };
    setLists((prev) => [newList, ...prev]);
  };

  const handleContinueList = (list: QuestionList) => {
    setActiveListId(list.id);
    setActiveTab('banco');
    setBancoMode('resolucao');
    setCurrentQuestionIndex(0);
    setQuestionTimer(0);
  };

  const handleStartOfficialExam = (institution: string, year: number) => {
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

    // Mapa de grandes áreas com especialidades médicas padrão
    const specialtyMap: Record<string, { total: number; correct: number }> = {
      'Clínica Médica': { total: 0, correct: 0 },
      'Cirurgia Geral': { total: 0, correct: 0 },
      'Pediatria': { total: 0, correct: 0 },
      'Ginecologia e Obstetrícia': { total: 0, correct: 0 },
      'Medicina Preventiva e Social': { total: 0, correct: 0 }
    };

    // Mapeamento dinâmico baseado nas questões resolvidas pelo usuário
    Object.entries(userAnswers).forEach(([qid, ans]) => {
      let spec = ans.specialty;
      if (!spec) {
        const q = supabaseQuestions.find((item) => item.id === qid) || mockQuestions.find((item) => item.id === qid);
        spec = q?.especialidade;
      }
      if (spec) {
        if (!specialtyMap[spec]) {
          specialtyMap[spec] = { total: 0, correct: 0 };
        }
        specialtyMap[spec].total += 1;
        if (ans.isCorrect) {
          specialtyMap[spec].correct += 1;
        }
      }
    });

    if (simulatedExtraAnswers.total > 0) {
      const specs = [
        'Clínica Médica',
        'Cirurgia Geral',
        'Pediatria',
        'Obstetrícia',
        'Ginecologia e Obstetrícia',
        'Medicina Preventiva e Social'
      ];
      const perSpec = Math.floor(simulatedExtraAnswers.total / specs.length);
      specs.forEach((sp) => {
        if (!specialtyMap[sp]) {
          specialtyMap[sp] = { total: 0, correct: 0 };
        }
        specialtyMap[sp].total += perSpec;
        specialtyMap[sp].correct += Math.round(perSpec * 0.78);
      });
    }

    const bySpecialty = Object.entries(specialtyMap).map(([specialty, val]) => ({
      specialty,
      total: val.total,
      correct: val.correct,
      accuracy: val.total > 0 ? (val.correct / val.total) * 100 : 0
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

    // Sequência de dias (streak) e dias na plataforma
    const streakDays = totalAnswered > 0 ? 1 : 0;
    const daysOnPlatform = 1;
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
      bySpecialty
    };
  }, [userAnswers, simulatedExtraAnswers, performanceFilters, simulatedTestPercentile, supabaseQuestions]);

  const recentList = lists.find((l) => l.inProgress && l.completedQuestions < l.totalQuestions) || lists[0];

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14]">
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
      <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col justify-center">
        <AuthScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* 1. Barra Lateral de Navegação Retrátil (Sidebar) */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        modalidade={performanceFilters.modalidade}
        streakDays={stats.streakDays}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Conteúdo Principal à Direita da Sidebar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior Mobile e Header Geral com Glassmorphism */}
        <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#070b14]/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
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
                const q = mockQuestions.find((item) => item.id === questionId);
                if (q) {
                  setAdvancedFilters((prev) => ({
                    ...prev,
                    search: q.code
                  }));
                }
              }}
              lists={lists}
            />

            {/* Controles da Borda Superior: Tema + Perfil do Aluno com Dropdown (Modelo Imagem 3) */}
            <div className="flex items-center gap-2.5 shrink-0">
              <ThemeSelector compact={true} />

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
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#0c1424] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center gap-3 p-2 border-b border-slate-100 dark:border-slate-800/80">
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
            <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b14] px-4 py-3 space-y-1.5 shadow-lg">
              {[
                { id: 'home', label: 'Início' },
                { id: 'banco', label: 'Banco de Questões' },
                { id: 'listas', label: 'Cadernos & Pastas' },
                { id: 'provas', label: 'Provas na Íntegra' },
                { id: 'simulados', label: 'Simulados' },
                { id: 'stats', label: 'Meu Desempenho' },
                { id: 'ranking', label: 'Ranking Oficial' },
                { id: 'configuracoes', label: 'Meu Perfil & Ajustes' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as ActiveTab);
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
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-9 sm:py-10 flex-1 space-y-9 sm:space-y-11">
          {/* ABA 1: INÍCIO (TELA INICIAL DO ALUNO BENTO) */}
          {activeTab === 'home' && (
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
              onNavigate={setActiveTab}
              onContinueList={handleContinueList}
              modalidade={performanceFilters.modalidade}
              onSimulatePercentile={(p) => setSimulatedTestPercentile(p)}
            />
          )}

          {/* ABA 2: BANCO DE QUESTÕES (RESOLUÇÃO SEQUENCIAL INSPIRADA NA IMAGEM 2 OU FILTROS SEPARADOS) */}
          {activeTab === 'banco' && (
            <div className="space-y-6">
              {/* Caderno Ativo (se houver) */}
              {activeListId && (
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/40 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-300 shadow-sm">
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
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Cabeçalho do Painel de Filtros */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                          Filtros Avançados do Banco
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Defina suas especialidades, temas, bancas e dificuldades. Ao salvar, as questões serão resolvidas em sequência.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      {/* Botão / Toggle estilizado para Criar Caderno */}
                      <button
                        type="button"
                        onClick={() => setShouldCreateCadernoOnSolve(!shouldCreateCadernoOnSolve)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
                          shouldCreateCadernoOnSolve
                            ? 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20 shadow-blue-500/10'
                            : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                          shouldCreateCadernoOnSolve ? 'bg-blue-600 text-white' : 'border border-slate-400 dark:border-slate-600'
                        }`}>
                          {shouldCreateCadernoOnSolve && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>Criar Caderno</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (shouldCreateCadernoOnSolve) {
                            handleCreateListFromFilter();
                          } else {
                            setActiveListId(null);
                            setBancoMode('resolucao');
                            setCurrentQuestionIndex(0);
                            setQuestionTimer(0);
                          }
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white shadow-md transition-all hover:scale-102 cursor-pointer"
                        style={{ backgroundColor: accentConfig.primaryHex }}
                      >
                        {shouldCreateCadernoOnSolve ? (
                          <BookOpenCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                        <span>
                          {shouldCreateCadernoOnSolve
                            ? `Criar Caderno e Resolver (${totalSupabaseCount.toLocaleString('pt-BR')})`
                            : isLoadingSupabase
                            ? 'Carregando questões...'
                            : `Resolver Questões (${totalSupabaseCount.toLocaleString('pt-BR')})`}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Componente Completo de Filtros Avançados */}
                  <AdvancedQuestionFilters
                    filters={advancedFilters}
                    onChange={(newFilters) => {
                      setAdvancedFilters(newFilters);
                      setQuestionsPage(1);
                      setCurrentQuestionIndex(0);
                    }}
                    onReset={() => {
                      handleResetAdvancedFilters();
                      setQuestionsPage(1);
                      setCurrentQuestionIndex(0);
                    }}
                    totalAvailable={totalGlobalQuestions}
                    totalFiltered={totalSupabaseCount}
                    onCreateListFromFilter={handleCreateListFromFilter}
                    onSelectDirectQuestion={(questionId) => {
                      const idx = filteredQuestions.findIndex((q) => q.id === questionId);
                      if (idx !== -1) {
                        setCurrentQuestionIndex(idx);
                      } else {
                        const targetQ = supabaseQuestions.find((q) => q.id === questionId) || mockQuestions.find((q) => q.id === questionId);
                        if (targetQ) {
                          setAdvancedFilters((prev) => ({
                            ...prev,
                            search: targetQ.code
                          }));
                        }
                        setCurrentQuestionIndex(0);
                      }
                      setActiveListId(null);
                      setQuestionTimer(0);
                      setBancoMode('resolucao');
                    }}
                    onStartSequentialSolving={() => {
                      setActiveListId(null);
                      setBancoMode('resolucao');
                      setCurrentQuestionIndex(0);
                      setQuestionTimer(0);
                    }}
                  />

                  {/* Botão de Rodapé para Iniciar Resolução */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShouldCreateCadernoOnSolve(!shouldCreateCadernoOnSolve)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
                        shouldCreateCadernoOnSolve
                          ? 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20 shadow-blue-500/10'
                          : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                        shouldCreateCadernoOnSolve ? 'bg-blue-600 text-white' : 'border border-slate-400 dark:border-slate-600'
                      }`}>
                        {shouldCreateCadernoOnSolve && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <FolderPlus className="w-4 h-4" />
                      <span>Criar Caderno de Questões</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (shouldCreateCadernoOnSolve) {
                          handleCreateListFromFilter();
                        } else {
                          setActiveListId(null);
                          setBancoMode('resolucao');
                          setCurrentQuestionIndex(0);
                          setQuestionTimer(0);
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-white shadow-lg transition-all hover:scale-102 cursor-pointer"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      {shouldCreateCadernoOnSolve ? (
                        <BookOpenCheck className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                      <span>
                        {shouldCreateCadernoOnSolve
                          ? `Criar Caderno e Iniciar (${totalSupabaseCount.toLocaleString('pt-BR')} questões) →`
                          : `Iniciar Resolução (${totalSupabaseCount.toLocaleString('pt-BR')} questões) →`}
                      </span>
                    </button>
                  </div>
                </div>
              ) : bancoMode === 'resultado' ? (
                /* MODO 3: TELA DE RESULTADOS E PRINCIPAIS PONTOS A SEREM MELHOR ESTUDADOS */
                <div className="space-y-6 animate-in fade-in duration-200">
                  {(() => {
                    const sessionQuestions = filteredQuestions;
                    const sessionAnswered = sessionQuestions.filter((q) => userAnswers[q.id]);
                    const sessionCorrect = sessionAnswered.filter((q) => userAnswers[q.id]?.isCorrect);
                    const sessionIncorrect = sessionAnswered.filter((q) => !userAnswers[q.id]?.isCorrect);
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
                        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-6">
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
                        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-5">
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
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
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
                      {/* BARRA SUPERIOR SEQUENCIAL (MODELO DA IMAGEM 2) */}
                      <div className="bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        {/* Esquerda: Setas e Numeração das Questões em Sequência */}
                        <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                          {/* Seta Anterior */}
                          <button
                            type="button"
                            disabled={Math.min(currentQuestionIndex, visibleQuestions.length - 1) === 0}
                            onClick={() => {
                              setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                              setQuestionTimer(0);
                            }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 transition-colors cursor-pointer"
                            title="Questão anterior"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          {/* Pílulas de Questão (1, 2, 3...) com indicador de acerto/erro e acompanhamento suave */}
                          <div
                            ref={questionScrollContainerRef}
                            className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-0.5 scroll-smooth"
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
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition-all cursor-pointer ${
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
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-400 hover:text-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs ml-0.5"
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
                            title="Próxima questão"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Direita: Cronômetro + Ferramentas + Botão Filtros/Finalizar */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100 dark:border-slate-800">
                          {/* Cronômetro com fonte Inter e tamanho ampliado */}
                          <div
                            className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs"
                            title="Tempo dedicado a esta questão (cronômetro)"
                          >
                            <Clock className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 animate-pulse" />
                            <span className="font-sans font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 tracking-tight tabular-nums">
                              {formatTimer(questionTimer)}
                            </span>
                          </div>

                          {/* Ações Rápidas (Favoritar, Reportar, Fonte) */}
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            {/* Favoritar */}
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
                                    ? 'text-rose-500 fill-rose-500'
                                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                                title="Favoritar questão"
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    bookmarkedQuestionIds[filteredQuestions[Math.min(currentQuestionIndex, filteredQuestions.length - 1)].id]
                                      ? 'fill-rose-500'
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
                                  const qId = filteredQuestions[Math.min(currentQuestionIndex, filteredQuestions.length - 1)].id;
                                  setReportedQuestionIds((prev) => ({
                                    ...prev,
                                    [qId]: true
                                  }));
                                  alert('Questão enviada para auditoria da banca médica.');
                                }}
                                className={`p-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                                  reportedQuestionIds[filteredQuestions[Math.min(currentQuestionIndex, filteredQuestions.length - 1)].id]
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-slate-400 hover:text-amber-500'
                                }`}
                                title="Reportar erro na questão"
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

                            {/* Seletor de Tamanho de Fonte */}
                            <button
                              type="button"
                              onClick={() => {
                                const nextSize: 'sm' | 'base' | 'lg' = fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'sm';
                                handleFontSizeChange(nextSize);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-xs"
                              title="Alternar tamanho da fonte"
                            >
                              <Type className="w-3.5 h-3.5" />
                              <span>{fontSize === 'sm' ? 'Compacto' : fontSize === 'base' ? 'Normal' : 'Grande'}</span>
                            </button>
                          </div>

                          {/* Botão de Filtros (Adicionar Questões pelo Filtro) */}
                          <button
                            type="button"
                            onClick={() => setBancoMode('filtros')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                            title="Adicionar questão pelo filtro"
                          >
                            <Plus className="w-3.5 h-3.5 text-blue-500" />
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Adicionar / Filtros</span>
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
                          Questão <strong className="text-slate-900 dark:text-white font-mono">{Math.min(currentQuestionIndex, visibleQuestions.length - 1) + 1}</strong> de <strong className="text-slate-900 dark:text-white font-mono">{visibleQuestions.length}</strong>
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
                    <div className="text-center py-20 bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4 shadow-sm">
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
              onFilterChange={setPerformanceFilters}
              onResetFilters={handleResetPerformanceFilters}
              onSimulateDemoQuestions={handleSimulateDemoQuestions}
              onNavigateToBancoWithSubfoco={handleNavigateToBancoWithSubfoco}
            />
          )}

          {/* ABA 6: RANKING */}
          {activeTab === 'ranking' && (
            <div className="space-y-6">
              {/* Testador Integrado de Cores */}
              <PercentileColorTester
                currentPercentile={simulatedTestPercentile ?? 78}
                onSelectTestPercentile={(p) => setSimulatedTestPercentile(p)}
              />

              <OfficialRanking
                ranking={displayedRanking}
                filters={performanceFilters}
                userQuestions={stats.totalAnswered}
                userPercentile={simulatedTestPercentile ?? stats.percentileInfo.percentile ?? 78}
              />
            </div>
          )}

          {/* ABA 7: CONFIGURAÇÕES E PERFIL DO ALUNO */}
          {activeTab === 'configuracoes' && (
            <StudentProfileSettings
              fontSize={fontSize}
              onChangeFontSize={handleFontSizeChange}
              onLogout={logout}
              simulatedPercentile={simulatedTestPercentile ?? stats.percentileInfo.percentile ?? 78}
              onSimulatePercentile={(p) => setSimulatedTestPercentile(p)}
            />
          )}
        </main>

        {/* Rodapé Moderno */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070d18] py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
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
      </div>
    </div>
  );
}
