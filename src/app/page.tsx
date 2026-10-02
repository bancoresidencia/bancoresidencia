'use client';

import React, { useState, useMemo } from 'react';
import { mockQuestions } from '@/data/mockQuestions';
import { initialFolders, initialLists } from '@/data/mockLists';
import { AdvancedQuestionFilters } from '@/components/AdvancedQuestionFilters';
import { QuestionCard } from '@/components/QuestionCard';
import { StatsDashboard } from '@/components/StatsDashboard';
import { StudentHomeDashboard } from '@/components/StudentHomeDashboard';
import { ListManager } from '@/components/ListManager';
import { MockExams } from '@/components/MockExams';
import { OfficialRanking } from '@/components/OfficialRanking';
import { Sidebar } from '@/components/Sidebar';
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
  UserAttempt
} from '@/types';
import { calculatePercentile, getOfficialRanking } from '@/utils/percentile';
import { Stethoscope, Menu, X, ArrowLeft, HelpCircle } from 'lucide-react';

export default function Home() {
  const { accentConfig } = useTheme();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Perfil do Aluno e Metas dinâmicas
  const studentName = user?.name || 'Dr. Lucas Rocha';
  const [customDailyGoal, setCustomDailyGoal] = useState<number | null>(null);
  const dailyGoal = customDailyGoal ?? user?.dailyGoal ?? 30;

  // Pastas e Listas de Questões
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [lists, setLists] = useState<QuestionList[]>(initialLists);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  // Tamanho de Fonte das Questões (Menor 'sm' por padrão para maior densidade médica)
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bancoresidencia_question_font_size');
      if (saved === 'sm' || saved === 'base' || saved === 'lg') return saved;
    }
    return 'sm';
  });

  const handleFontSizeChange = (size: 'sm' | 'base' | 'lg') => {
    setFontSize(size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bancoresidencia_question_font_size', size);
    }
  };

  // Respostas do Usuário com metadados do item
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
  >({});

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

  // Filtragem completa com todas as regras
  const filteredQuestions = useMemo(() => {
    return mockQuestions.filter((q) => {
      // 1. Busca textual
      if (advancedFilters.search.trim()) {
        const query = advancedFilters.search.toLowerCase();
        const matchesStatement = q.statement.toLowerCase().includes(query);
        const matchesSubfoco = q.subfoco?.toLowerCase().includes(query);
        const matchesFoco = q.foco?.toLowerCase().includes(query);
        const matchesTema = q.tema?.toLowerCase().includes(query);
        const matchesCode = q.code.toLowerCase().includes(query);
        if (!matchesStatement && !matchesSubfoco && !matchesFoco && !matchesTema && !matchesCode) {
          return false;
        }
      }

      // 2. Modalidades de Estudo
      if (advancedFilters.modalidades.length > 0 && !advancedFilters.modalidades.includes(q.modalidade)) {
        return false;
      }

      // 3. Hierarquia Clínica: Especialidades, Temas, Focos e Subfocos
      if (advancedFilters.especialidades.length > 0 && !advancedFilters.especialidades.includes(q.especialidade)) {
        return false;
      }
      if (advancedFilters.temas.length > 0 && !advancedFilters.temas.includes(q.tema)) {
        return false;
      }
      if (advancedFilters.focos.length > 0 && !advancedFilters.focos.includes(q.foco)) {
        return false;
      }
      if (advancedFilters.subfocos.length > 0 && !advancedFilters.subfocos.includes(q.subfoco)) {
        return false;
      }

      // 4. Instituições
      if (advancedFilters.instituicoes.length > 0 && !advancedFilters.instituicoes.includes(q.institution)) {
        return false;
      }

      // 5. Anos de Aplicação
      if (advancedFilters.anos.length > 0 && !advancedFilters.anos.includes(q.year)) {
        return false;
      }

      // 6. Tipo de Prova
      if (advancedFilters.tipoProva.length > 0 && (!q.tipoProva || !advancedFilters.tipoProva.includes(q.tipoProva))) {
        return false;
      }

      // 7. Status da Questão
      const answer = userAnswers[q.id];
      const isResolved = !!answer;
      const isCorrect = answer?.isCorrect === true;
      const isWrong = isResolved && !isCorrect;

      if (advancedFilters.status === 'Não vistas' && isResolved) return false;
      if (advancedFilters.status === 'Resolvidas' && !isResolved) return false;
      if (advancedFilters.status === 'Acertadas' && !isCorrect) return false;
      if (advancedFilters.status === 'Erradas' && !isWrong) return false;
      if (advancedFilters.status === 'Ainda não acertadas' && isCorrect) return false;

      // 8. Nível de Dificuldade
      if (advancedFilters.dificuldade !== 'Todas' && q.difficulty !== advancedFilters.dificuldade) {
        return false;
      }

      // 9. Tipo de Questão
      if (advancedFilters.tipoQuestao !== 'Todas' && q.type !== advancedFilters.tipoQuestao) {
        return false;
      }

      // 10. Switches adicionais
      if (advancedFilters.ocultarAnuladasErro && q.isAnulada) {
        return false;
      }
      if (advancedFilters.ultimos5Anos && q.year < 2020) {
        return false;
      }

      return true;
    });
  }, [advancedFilters, userAnswers]);

  const handleAnswer = (questionId: string, selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E', isCorrect: boolean) => {
    const q = mockQuestions.find((item) => item.id === questionId);
    setUserAnswers((prev) => ({
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
    }));

    if (activeListId) {
      setLists((prev) =>
        prev.map((l) => {
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
        })
      );
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

  const handleCreateListWithFilters = (
    title: string,
    folderId: string | null,
    totalQuestions: number,
    appliedFilters: AdvancedFilterState
  ) => {
    const matched = mockQuestions.filter((q) => {
      if (appliedFilters.modalidades?.length > 0 && !appliedFilters.modalidades.includes(q.modalidade)) return false;
      if (appliedFilters.especialidades?.length > 0 && !appliedFilters.especialidades.includes(q.especialidade)) return false;
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

  // Simulação / Teste de Percentil
  const [simulatedTestPercentile, setSimulatedTestPercentile] = useState<number | null>(78);

  // Cálculo das estatísticas em tempo real
  const stats: UserStats = useMemo(() => {
    const rawAnswered = Object.keys(userAnswers).length;
    const rawCorrect = Object.values(userAnswers).filter((a) => a.isCorrect).length;
    const rawIncorrect = rawAnswered - rawCorrect;

    const totalAnswered = rawAnswered + simulatedExtraAnswers.total;
    const totalCorrect = rawCorrect + simulatedExtraAnswers.correct;
    const totalIncorrect = rawIncorrect + (simulatedExtraAnswers.total - simulatedExtraAnswers.correct);

    const accuracyRate = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

    const uniqueAnswered = Math.max(rawAnswered, 0) + simulatedExtraAnswers.unique;
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

    const specialtyMap: Record<string, { total: number; correct: number }> = {};
    mockQuestions.forEach((q) => {
      if (userAnswers[q.id]) {
        if (!specialtyMap[q.especialidade]) {
          specialtyMap[q.especialidade] = { total: 0, correct: 0 };
        }
        specialtyMap[q.especialidade].total += 1;
        if (userAnswers[q.id].isCorrect) {
          specialtyMap[q.especialidade].correct += 1;
        }
      }
    });

    if (simulatedExtraAnswers.total > 0) {
      const specs = [
        'Clínica Médica',
        'Cirurgia Geral',
        'Pediatria',
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

    return {
      totalAnswered: simulatedTestPercentile !== null ? Math.max(totalAnswered, 520) : totalAnswered,
      uniqueAnswered,
      reviews,
      repeated,
      totalCorrect: simulatedTestPercentile !== null ? Math.max(totalCorrect, 415) : totalCorrect,
      totalIncorrect,
      accuracyRate: simulatedTestPercentile !== null ? 79.8 : accuracyRate,
      daysOnPlatform: 42,
      streakDays: 7,
      studyTimeMinutes: Math.round(totalAnswered * 1.8),
      percentileInfo,
      historyByDay: [
        { date: 'Seg', answered: 25, correct: 20 },
        { date: 'Ter', answered: 32, correct: 26 },
        { date: 'Qua', answered: 28, correct: 22 },
        { date: 'Qui', answered: 35, correct: 28 },
        { date: 'Sex', answered: 40, correct: 33 },
        { date: 'Sáb', answered: 18, correct: 14 },
        { date: 'Hoje', answered: Math.max(16, rawAnswered), correct: Math.max(13, rawCorrect) }
      ],
      bySpecialty
    };
  }, [userAnswers, simulatedExtraAnswers, performanceFilters, simulatedTestPercentile]);

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
      {/* 1. Barra Lateral de Navegação (Sidebar) */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        modalidade={performanceFilters.modalidade}
        streakDays={stats.streakDays}
      />

      {/* Conteúdo Principal à Direita da Sidebar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior Mobile e Header Geral com Glassmorphism */}
        <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#070b14]/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
                aria-label="Abrir menu de navegação"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2.5">
                <div
                  className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  <Stethoscope className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h1 className="font-heading text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Banco Residência
                  </h1>
                </div>
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-bold border hidden sm:inline"
                  style={{
                    backgroundColor: accentConfig.bgRgba,
                    borderColor: accentConfig.borderRgba,
                    color: accentConfig.primaryHex
                  }}
                >
                  {performanceFilters.modalidade}
                </span>
              </div>
            </div>

            {/* Abas Superiores no Desktop com Fontes Legíveis e Pílulas Modernas */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl">
              {[
                { id: 'home', label: 'Início' },
                { id: 'banco', label: 'Banco de Questões' },
                { id: 'listas', label: 'Cadernos' },
                { id: 'simulados', label: 'Simulados' },
                { id: 'stats', label: 'Meu Desempenho' },
                { id: 'ranking', label: 'Ranking Oficial' },
                { id: 'configuracoes', label: 'Meu Perfil' }
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as ActiveTab)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800'
                    }`}
                    style={{
                      backgroundColor: isActive ? accentConfig.primaryHex : undefined,
                      boxShadow: isActive ? `0 4px 12px -2px ${accentConfig.bgRgba}` : undefined
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Controles do Topo: Tema + Avatar do Usuário */}
            <div className="flex items-center gap-2.5">
              <ThemeSelector compact={true} />

              {/* Botão de Perfil do Aluno */}
              <button
                type="button"
                onClick={() => setActiveTab('configuracoes')}
                title="Meu Perfil e Configurações"
                className={`flex items-center gap-2 p-1.5 pr-3 rounded-2xl border transition-all cursor-pointer ${
                  activeTab === 'configuracoes'
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-xl object-cover border"
                    style={{ borderColor: accentConfig.primaryHex }}
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-[11px] text-white shadow-xs"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold hidden sm:inline max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            </div>
          </div>

          {/* Menu Mobile Expandido */}
          {mobileMenuOpen && (
            <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b14] px-4 py-3 space-y-1.5 shadow-lg">
              {[
                { id: 'home', label: 'Início' },
                { id: 'banco', label: 'Banco de Questões' },
                { id: 'listas', label: 'Cadernos & Pastas' },
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
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-7">
          {/* ABA 1: INÍCIO (TELA INICIAL DO ALUNO BENTO) */}
          {activeTab === 'home' && (
            <StudentHomeDashboard
              studentName={studentName}
              stats={stats}
              dailyGoal={dailyGoal}
              onUpdateDailyGoal={(goal) => setCustomDailyGoal(goal)}
              recentList={recentList}
              allLists={lists}
              onNavigate={setActiveTab}
              onContinueList={handleContinueList}
              modalidade={performanceFilters.modalidade}
              onSimulatePercentile={(p) => setSimulatedTestPercentile(p)}
            />
          )}

          {/* ABA 2: BANCO DE QUESTÕES (RESOLUÇÃO AVULSA OU EM CADERNO) */}
          {activeTab === 'banco' && (
            <div className="space-y-6">
              {activeListId && (
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/40 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-300 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-blue-700 dark:text-blue-400">Resolvendo Caderno:</span>
                    <strong className="text-slate-900 dark:text-white font-heading text-sm">
                      {lists.find((l) => l.id === activeListId)?.title}
                    </strong>
                  </div>
                  <button
                    onClick={() => setActiveListId(null)}
                    className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar para Questões Avulsas</span>
                  </button>
                </div>
              )}

              {/* Filtros Avançados Completos */}
              <AdvancedQuestionFilters
                filters={advancedFilters}
                onChange={setAdvancedFilters}
                onReset={handleResetAdvancedFilters}
                totalAvailable={mockQuestions.length}
                totalFiltered={filteredQuestions.length}
                onCreateListFromFilter={handleCreateListFromFilter}
              />

              {/* Lista de Questões Filtradas */}
              <div className="space-y-5">
                {/* Barra de Controle de Fonte e Contagem */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 px-4 sm:px-5 py-3 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      Exibindo <strong className="text-slate-900 dark:text-white font-mono">{filteredQuestions.length}</strong> {filteredQuestions.length === 1 ? 'questão' : 'questões'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Acervo: {mockQuestions.length}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Tamanho da Fonte:</span>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-xs">
                      <button
                        type="button"
                        onClick={() => handleFontSizeChange('sm')}
                        title="Fonte Compacta (Padrão para provas de residência)"
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          fontSize === 'sm'
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        A- Compacta
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFontSizeChange('base')}
                        title="Fonte Média"
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          fontSize === 'base'
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        A Média
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFontSizeChange('lg')}
                        title="Fonte Grande"
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          fontSize === 'lg'
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        A+ Grande
                      </button>
                    </div>
                  </div>
                </div>

                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question, idx) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      index={idx}
                      total={filteredQuestions.length}
                      onAnswer={handleAnswer}
                      userAnswer={userAnswers[question.id]?.letter}
                      fontSize={fontSize}
                      onChangeFontSize={handleFontSizeChange}
                    />
                  ))
                ) : (
                  <div className="text-center py-20 bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <p className="text-slate-900 dark:text-white text-base font-bold">Nenhuma questão encontrada com os filtros selecionados.</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                      Experimente desmarcar alguns filtros de especialidade, foco ou status de resolução para visualizar mais questões do banco.
                    </p>
                    <button
                      onClick={handleResetAdvancedFilters}
                      className="mt-2 text-xs font-bold px-5 py-2.5 rounded-xl text-white transition-all cursor-pointer shadow-sm hover:scale-102"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      Redefinir Filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA 3: LISTAS DE QUESTÕES & PASTAS */}
          {activeTab === 'listas' && (
            <ListManager
              folders={folders}
              lists={lists}
              onCreateFolder={handleCreateFolder}
              onCreateListWithFilters={handleCreateListWithFilters}
              onContinueList={handleContinueList}
            />
          )}

          {/* ABA 4: SIMULADOS */}
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
