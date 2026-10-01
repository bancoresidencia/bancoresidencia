'use client';

import React, { useState, useMemo } from 'react';
import { mockQuestions } from '@/data/mockQuestions';
import { QuestionFilters } from '@/components/QuestionFilters';
import { QuestionCard } from '@/components/QuestionCard';
import { StatsDashboard } from '@/components/StatsDashboard';
import { FilterState, UserStats, PerformanceFilterState } from '@/types';
import { calculatePercentile } from '@/utils/percentile';
import { GraduationCap, BarChart2, BookOpenCheck, Stethoscope } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'practice' | 'stats'>('practice');
  const [userAnswers, setUserAnswers] = useState<Record<string, { letter: 'A' | 'B' | 'C' | 'D' | 'E'; isCorrect: boolean }>>({});

  // Simulação de questões extras para testes práticos de percentil (100+ ou 500+)
  const [simulatedExtraAnswers, setSimulatedExtraAnswers] = useState<{ total: number; correct: number; unique: number; reviews: number; repeated: number }>({
    total: 0,
    correct: 0,
    unique: 0,
    reviews: 0,
    repeated: 0
  });

  // Filtros de Questões para Prática
  const [practiceFilters, setPracticeFilters] = useState<FilterState>({
    specialty: 'Todas',
    institution: 'Todas',
    year: 'Todos',
    difficulty: 'Todas',
    search: ''
  });

  // Filtros de Desempenho e Ranking (Padrão: últimos 6 meses e modalidade Residência)
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
  };

  // Botão de simulação rápida para testar percentil aproximado (100+) e oficial (500+)
  const handleSimulateDemoQuestions = (amount: number) => {
    setSimulatedExtraAnswers((prev) => {
      const nextTotal = prev.total + amount;
      // Taxa simulada de ~78% de acertos para ilustrar com fidelidade o exemplo do usuário
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

  // Cálculo das estatísticas em tempo real
  const stats: UserStats = useMemo(() => {
    const rawAnswered = Object.keys(userAnswers).length;
    const rawCorrect = Object.values(userAnswers).filter((a) => a.isCorrect).length;
    const rawIncorrect = rawAnswered - rawCorrect;

    const totalAnswered = rawAnswered + simulatedExtraAnswers.total;
    const totalCorrect = rawCorrect + simulatedExtraAnswers.correct;
    const totalIncorrect = rawIncorrect + (simulatedExtraAnswers.total - simulatedExtraAnswers.correct);

    const accuracyRate = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

    // Métricas de Únicas, Revisões e Repetidas
    const uniqueAnswered = Math.max(rawAnswered, 0) + simulatedExtraAnswers.unique;
    const reviews = simulatedExtraAnswers.reviews;
    const repeated = simulatedExtraAnswers.repeated;

    // Cálculo do Percentil com a fórmula ajustada solicitada
    const percentileInfo = calculatePercentile({
      totalAnswered,
      totalCorrect,
      filters: performanceFilters
    });

    // Estatísticas por especialidade
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

    // Adiciona volume proporcional caso haja simulação
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
      daysOnPlatform: 42, // Exemplo de usuário ativo há 42 dias na plataforma
      streakDays: totalAnswered > 0 ? 7 : 0,
      studyTimeMinutes: Math.round(totalAnswered * 1.8),
      percentileInfo,
      historyByDay: [
        { date: 'Seg', answered: 25, correct: 20 },
        { date: 'Ter', answered: 32, correct: 26 },
        { date: 'Qua', answered: 28, correct: 22 },
        { date: 'Qui', answered: 35, correct: 28 },
        { date: 'Sex', answered: 40, correct: 33 },
        { date: 'Sáb', answered: 18, correct: 14 },
        { date: 'Hoje', answered: Math.max(12, rawAnswered), correct: Math.max(9, rawCorrect) }
      ],
      bySpecialty
    };
  }, [userAnswers, simulatedExtraAnswers, performanceFilters]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Barra de Navegação Superior */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold leading-none text-white tracking-tight">Banco Residência</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  {performanceFilters.modalidade}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Estatísticas, Percentil & Ranking Semestral</p>
            </div>
          </div>

          {/* Alternador de Modos */}
          <nav className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'practice'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpenCheck className="w-4 h-4" />
              <span>Questões</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Meu Desempenho</span>
              {stats.percentileInfo.status !== 'locked' && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-[10px] text-slate-950 font-bold">
                  P{stats.percentileInfo.percentile}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
        {activeTab === 'practice' ? (
          <>
            {/* Filtros de Prática */}
            <QuestionFilters
              filters={practiceFilters}
              onFilterChange={setPracticeFilters}
              onReset={handleResetPracticeFilters}
              totalFiltered={filteredQuestions.length}
            />

            {/* Lista de Questões */}
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
          </>
        ) : (
          <StatsDashboard
            stats={stats}
            filters={performanceFilters}
            onFilterChange={setPerformanceFilters}
            onResetFilters={handleResetPerformanceFilters}
            onSimulateDemoQuestions={handleSimulateDemoQuestions}
          />
        )}
      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <p>© 2026 Banco Residência • Semestre 2026.1 / 2026.2 • Estatísticas com Score Ajustado</p>
      </footer>
    </div>
  );
}
