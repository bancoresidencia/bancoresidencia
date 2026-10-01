'use client';

import React, { useState, useMemo } from 'react';
import { mockQuestions } from '@/data/mockQuestions';
import { QuestionFilters } from '@/components/QuestionFilters';
import { QuestionCard } from '@/components/QuestionCard';
import { StatsDashboard } from '@/components/StatsDashboard';
import { FilterState, UserStats } from '@/types';
import { GraduationCap, BarChart2, BookOpenCheck } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'practice' | 'stats'>('practice');
  const [userAnswers, setUserAnswers] = useState<Record<string, { letter: 'A' | 'B' | 'C' | 'D' | 'E'; isCorrect: boolean }>>({});

  const [filters, setFilters] = useState<FilterState>({
    specialty: 'Todas',
    institution: 'Todas',
    year: 'Todos',
    difficulty: 'Todas',
    search: ''
  });

  const handleResetFilters = () => {
    setFilters({
      specialty: 'Todas',
      institution: 'Todas',
      year: 'Todos',
      difficulty: 'Todas',
      search: ''
    });
  };

  const filteredQuestions = useMemo(() => {
    return mockQuestions.filter((q) => {
      if (filters.specialty !== 'Todas' && q.specialty !== filters.specialty) return false;
      if (filters.institution !== 'Todas' && q.institution !== filters.institution) return false;
      if (filters.year !== 'Todos' && q.year.toString() !== filters.year) return false;
      if (filters.difficulty !== 'Todas' && q.difficulty !== filters.difficulty) return false;
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesStatement = q.statement.toLowerCase().includes(query);
        const matchesSubtheme = q.subtheme.toLowerCase().includes(query);
        const matchesCode = q.code.toLowerCase().includes(query);
        if (!matchesStatement && !matchesSubtheme && !matchesCode) return false;
      }
      return true;
    });
  }, [filters]);

  const handleAnswer = (questionId: string, selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E', isCorrect: boolean) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: { letter: selectedLetter, isCorrect }
    }));
  };

  // Cálculo das estatísticas em tempo real
  const stats: UserStats = useMemo(() => {
    const totalAnswered = Object.keys(userAnswers).length;
    const totalCorrect = Object.values(userAnswers).filter((a) => a.isCorrect).length;
    const totalIncorrect = totalAnswered - totalCorrect;
    const accuracyRate = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

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

    const bySpecialty = Object.entries(specialtyMap).map(([specialty, val]) => ({
      specialty,
      total: val.total,
      correct: val.correct,
      accuracy: val.total > 0 ? (val.correct / val.total) * 100 : 0
    }));

    return {
      totalAnswered,
      totalCorrect,
      totalIncorrect,
      accuracyRate,
      streakDays: totalAnswered > 0 ? 3 : 0,
      studyTimeMinutes: totalAnswered * 2,
      historyByDay: [
        { date: 'Seg', answered: 12, correct: 9 },
        { date: 'Ter', answered: 18, correct: 14 },
        { date: 'Qua', answered: 15, correct: 11 },
        { date: 'Hoje', answered: totalAnswered, correct: totalCorrect }
      ],
      bySpecialty
    };
  }, [userAnswers]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Barra de Navegação Superior */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none text-white tracking-tight">Banco Residência</h1>
              <p className="text-xs text-slate-400 mt-0.5">Preparatório Médico de Alta Performance</p>
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
              <span>Estatísticas & Gráficos</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
        {activeTab === 'practice' ? (
          <>
            {/* Filtros */}
            <QuestionFilters
              filters={filters}
              onFilterChange={setFilters}
              onReset={handleResetFilters}
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
                    onClick={handleResetFilters}
                    className="mt-3 text-xs font-medium text-blue-400 hover:text-blue-300 underline"
                  >
                    Redefinir filtros
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <StatsDashboard stats={stats} />
        )}
      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <p>© 2026 Banco Residência • Plataforma Otimizada para Estudantes e Médicos</p>
      </footer>
    </div>
  );
}
