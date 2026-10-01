'use client';

import React, { useState, useMemo } from 'react';
import { mockQuestions } from '@/data/mockQuestions';
import { initialFolders, initialLists } from '@/data/mockLists';
import { QuestionFilters } from '@/components/QuestionFilters';
import { QuestionCard } from '@/components/QuestionCard';
import { StatsDashboard } from '@/components/StatsDashboard';
import { StudentHomeDashboard } from '@/components/StudentHomeDashboard';
import { ListManager } from '@/components/ListManager';
import { MockExams } from '@/components/MockExams';
import { OfficialRanking } from '@/components/OfficialRanking';
import { Sidebar } from '@/components/Sidebar';
import {
  FilterState,
  UserStats,
  PerformanceFilterState,
  ActiveTab,
  Folder,
  QuestionList,
  Modalidade
} from '@/types';
import { calculatePercentile, getOfficialRanking } from '@/utils/percentile';
import { Stethoscope, Menu, X, ArrowLeft } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Perfil do Aluno e Metas
  const studentName = 'Dr. Lucas Rocha';
  const [dailyGoal, setDailyGoal] = useState<number>(30);

  // Pastas e Listas de Questões
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [lists, setLists] = useState<QuestionList[]>(initialLists);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  // Respostas do Usuário
  const [userAnswers, setUserAnswers] = useState<Record<string, { letter: 'A' | 'B' | 'C' | 'D' | 'E'; isCorrect: boolean }>>({});

  // Simulação de questões extras
  const [simulatedExtraAnswers, setSimulatedExtraAnswers] = useState<{ total: number; correct: number; unique: number; reviews: number; repeated: number }>({
    total: 0,
    correct: 0,
    unique: 0,
    reviews: 0,
    repeated: 0
  });

  // Filtros de Prática do Banco de Questões
  const [practiceFilters, setPracticeFilters] = useState<FilterState>({
    specialty: 'Todas',
    institution: 'Todas',
    year: 'Todos',
    difficulty: 'Todas',
    search: ''
  });

  // Filtros de Desempenho e Ranking (Padrão: 6 meses e Residência)
  const [performanceFilters, setPerformanceFilters] = useState<PerformanceFilterState>({
    modalidade: 'Residência',
    period: '6m',
    institutions: [],
    banca: 'Todas'
  });

  const handleResetPracticeFilters = () => {
    setPracticeFilters({
      specialty: 'Todas',
      institution: 'Todas',
      year: 'Todos',
      difficulty: 'Todas',
      search: ''
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

  const filteredQuestions = useMemo(() => {
    return mockQuestions.filter((q) => {
      if (practiceFilters.specialty !== 'Todas' && q.specialty !== practiceFilters.specialty) return false;
      if (practiceFilters.institution !== 'Todas' && q.institution !== practiceFilters.institution) return false;
      if (practiceFilters.year !== 'Todos' && q.year.toString() !== practiceFilters.year) return false;
      if (practiceFilters.difficulty !== 'Todas' && q.difficulty !== practiceFilters.difficulty) return false;
      if (practiceFilters.search.trim()) {
        const query = practiceFilters.search.toLowerCase();
        const matchesStatement = q.statement.toLowerCase().includes(query);
        const matchesSubtheme = q.subtheme.toLowerCase().includes(query);
        const matchesCode = q.code.toLowerCase().includes(query);
        if (!matchesStatement && !matchesSubtheme && !matchesCode) return false;
      }
      return true;
    });
  }, [practiceFilters]);

  const handleAnswer = (questionId: string, selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E', isCorrect: boolean) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: { letter: selectedLetter, isCorrect }
    }));

    // Se estiver respondendo dentro de uma lista ativa, atualiza progresso
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

  // Gerenciamento de Pastas e Listas
  const handleCreateFolder = (name: string, parentId: string | null) => {
    const newFolder: Folder = {
      id: `f-${Date.now()}`,
      name,
      parentId,
      color: parentId ? '#10b981' : '#3b82f6'
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleCreateList = (title: string, folderId: string | null, totalQuestions: number) => {
    const newList: QuestionList = {
      id: `list-${Date.now()}`,
      title,
      folderId: folderId || undefined,
      questionIds: ['q-1', 'q-2'],
      totalQuestions,
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

    const percentileInfo = calculatePercentile({
      totalAnswered,
      totalCorrect,
      filters: performanceFilters
    });

    const specialtyMap: Record<string, { total: number; correct: number }> = {};
    mockQuestions.forEach((q) => {
      if (userAnswers[q.id]) {
        if (!specialtyMap[q.specialty]) {
          specialtyMap[q.specialty] = { total: 0, correct: 0 };
        }
        specialtyMap[q.specialty].total += 1;
        if (userAnswers[q.id].isCorrect) {
          specialtyMap[q.specialty].correct += 1;
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
      totalAnswered,
      uniqueAnswered,
      reviews,
      repeated,
      totalCorrect,
      totalIncorrect,
      accuracyRate,
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
  }, [userAnswers, simulatedExtraAnswers, performanceFilters]);

  // Lista recente em andamento para continuar na home
  const recentList = lists.find((l) => l.inProgress && l.completedQuestions < l.totalQuestions) || lists[0];

  // Ranking para a aba dedicada de Ranking
  const officialRanking = getOfficialRanking(performanceFilters, {
    answered: stats.totalAnswered,
    correct: stats.totalCorrect,
    name: studentName
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
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
        {/* Barra Superior Mobile e Header Geral */}
        <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo e Botão Mobile */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg border border-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2">
                <div className="md:hidden w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h1 className="text-base font-bold text-white tracking-tight">Banco Residência</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 hidden sm:inline">
                  {performanceFilters.modalidade}
                </span>
              </div>
            </div>

            {/* Abas Superiores no Desktop */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              {[
                { id: 'home', label: 'Início' },
                { id: 'banco', label: 'Banco de Questões' },
                { id: 'listas', label: 'Listas' },
                { id: 'simulados', label: 'Simulados' },
                { id: 'stats', label: 'Meu Desempenho' },
                { id: 'ranking', label: 'Ranking' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Menu Mobile Expandido */}
          {mobileMenuOpen && (
            <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 py-3 space-y-1">
              {[
                { id: 'home', label: 'Início' },
                { id: 'banco', label: 'Banco de Questões' },
                { id: 'listas', label: 'Listas & Pastas' },
                { id: 'simulados', label: 'Simulados' },
                { id: 'stats', label: 'Meu Desempenho' },
                { id: 'ranking', label: 'Ranking Oficial' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as ActiveTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                    activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Corpo Principal da Aplicação */}
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
          {/* ABA 1: INÍCIO (TELA INICIAL DO ALUNO) */}
          {activeTab === 'home' && (
            <StudentHomeDashboard
              studentName={studentName}
              stats={stats}
              dailyGoal={dailyGoal}
              onUpdateDailyGoal={setDailyGoal}
              recentList={recentList}
              allLists={lists}
              onNavigate={setActiveTab}
              onContinueList={handleContinueList}
              modalidade={performanceFilters.modalidade}
            />
          )}

          {/* ABA 2: BANCO DE QUESTÕES */}
          {activeTab === 'banco' && (
            <div className="space-y-4">
              {activeListId && (
                <div className="bg-blue-950/40 border border-blue-500/40 p-3 rounded-xl flex items-center justify-between text-xs text-blue-300">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Resolvendo Lista:</span>
                    <span>{lists.find((l) => l.id === activeListId)?.title}</span>
                  </div>
                  <button
                    onClick={() => setActiveListId(null)}
                    className="flex items-center gap-1 text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Voltar para o Banco Geral
                  </button>
                </div>
              )}

              <QuestionFilters
                filters={practiceFilters}
                onFilterChange={setPracticeFilters}
                onReset={handleResetPracticeFilters}
                totalFiltered={filteredQuestions.length}
              />

              <div className="space-y-4">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question, idx) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      index={idx}
                      total={filteredQuestions.length}
                      onAnswer={handleAnswer}
                      userAnswer={userAnswers[question.id]?.letter}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <p className="text-slate-400 text-sm">Nenhuma questão encontrada com os filtros selecionados.</p>
                    <button
                      onClick={handleResetPracticeFilters}
                      className="mt-3 text-xs font-medium text-blue-400 hover:text-blue-300 underline cursor-pointer"
                    >
                      Redefinir filtros
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
              onCreateList={handleCreateList}
              onContinueList={handleContinueList}
            />
          )}

          {/* ABA 4: SIMULADOS */}
          {activeTab === 'simulados' && (
            <MockExams
              onStartExam={(title) => {
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
            />
          )}

          {/* ABA 6: RANKING */}
          {activeTab === 'ranking' && (
            <div className="space-y-6">
              <OfficialRanking
                ranking={officialRanking}
                filters={performanceFilters}
                userQuestions={stats.totalAnswered}
              />
            </div>
          )}
        </main>

        {/* Rodapé */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-400">
          <p>© 2026 Banco Residência • Semestre 2026.1 / 2026.2 • Plataforma Completa de Residência Médica</p>
        </footer>
      </div>
    </div>
  );
}
