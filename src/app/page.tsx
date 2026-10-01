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
import {
  UserStats,
  PerformanceFilterState,
  AdvancedFilterState,
  ActiveTab,
  Folder,
  QuestionList,
  Modalidade
} from '@/types';
import { calculatePercentile, getOfficialRanking } from '@/utils/percentile';
import { Stethoscope, Menu, X, ArrowLeft, BookOpen, Layers } from 'lucide-react';

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

  // Filtros Avançados extraídos do MedEvo
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

  // Filtragem completa com todas as regras do MedEvo
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

      // 7. Status da Questão (Todas, Não vistas, Resolvidas, Acertadas, Erradas, Ainda não acertadas)
      const answer = userAnswers[q.id];
      const isResolved = !!answer;
      const isCorrect = answer?.isCorrect === true;
      const isWrong = isResolved && !isCorrect;

      if (advancedFilters.status === 'Não vistas' && isResolved) return false;
      if (advancedFilters.status === 'Resolvidas' && !isResolved) return false;
      if (advancedFilters.status === 'Acertadas' && !isCorrect) return false;
      if (advancedFilters.status === 'Erradas' && !isWrong) return false;
      if (advancedFilters.status === 'Ainda não acertadas' && isCorrect) return false; // Inclui não vistas e erradas

      // 8. Nível de Dificuldade (Fácil, Médio, Difícil, Desconhecido)
      if (advancedFilters.dificuldade !== 'Todas' && q.difficulty !== advancedFilters.dificuldade) {
        return false;
      }

      // 9. Tipo de Questão (Múltipla escolha, Discursiva, Verdadeiro ou falso)
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
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: { letter: selectedLetter, isCorrect }
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
    const title = advancedFilters.temas[0] || advancedFilters.especialidades[0] || 'Lista Personalizada de Estudos';
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
    // Filtrar questões no mock com base nos filtros selecionados na criação da lista
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

  const recentList = lists.find((l) => l.inProgress && l.completedQuestions < l.totalQuestions) || lists[0];

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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg border border-slate-800 cursor-pointer"
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

          {/* ABA 2: BANCO DE QUESTÕES (RESOLUÇÃO AVULSA OU EM LISTA COM FILTROS MEDEVO) */}
          {activeTab === 'banco' && (
            <div className="space-y-5">
              {activeListId && (
                <div className="bg-blue-950/40 border border-blue-500/40 p-4 rounded-xl flex items-center justify-between text-xs text-blue-300">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Resolvendo Lista Personalizada:</span>
                    <strong className="text-white">{lists.find((l) => l.id === activeListId)?.title}</strong>
                  </div>
                  <button
                    onClick={() => setActiveListId(null)}
                    className="flex items-center gap-1 text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Voltar para Questões Avulsas
                  </button>
                </div>
              )}

              {/* Filtros Avançados Completos Extraídos do MedEvo */}
              <AdvancedQuestionFilters
                filters={advancedFilters}
                onChange={setAdvancedFilters}
                onReset={handleResetAdvancedFilters}
                totalAvailable={mockQuestions.length}
                totalFiltered={filteredQuestions.length}
                onCreateListFromFilter={handleCreateListFromFilter}
              />

              {/* Lista de Questões Filtradas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Exibindo {filteredQuestions.length} {filteredQuestions.length === 1 ? 'questão' : 'questões'}</span>
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
                    />
                  ))
                ) : (
                  <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
                    <p className="text-slate-300 text-sm font-semibold">Nenhuma questão encontrada com os filtros selecionados.</p>
                    <p className="text-slate-500 text-xs max-w-md mx-auto">
                      Experimente desmarcar alguns filtros de tema/subfoco ou alterar o status da questão para visualizar mais questões.
                    </p>
                    <button
                      onClick={handleResetAdvancedFilters}
                      className="mt-2 text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                    >
                      Redefinir Filtros Padrões
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
