'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchQuestionsFromSupabase,
  updateQuestionAnswer,
  fetchAdminCurationStats,
  AdminCurationStats
} from '@/services/questionService';
import { Question } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  RotateCcw,
  Layers,
  Zap,
  Check,
  Ban,
  BookOpen,
  Flame
} from 'lucide-react';

const ESPECIALIDADES_LIST = [
  'Todas as Especialidades',
  'Cirurgia',
  'Cirurgia Geral',
  'Clínica Médica',
  'Pediatria',
  'Ginecologia e Obstetrícia',
  'Medicina Preventiva e Social'
];

const ANOS_LIST = [
  'Todos os Anos',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2019',
  '2018'
];

export const AdminCuradoriaGabaritos: React.FC = () => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();

  // Filtros de Curadoria
  const [statusFilter, setStatusFilter] = useState<'sem_gabarito' | 'com_gabarito' | 'todas'>('sem_gabarito');
  const [selectedEspecialidade, setSelectedEspecialidade] = useState<string>('Todas as Especialidades');
  const [selectedAno, setSelectedAno] = useState<string>('Todos os Anos');
  const [bancaSearch, setBancaSearch] = useState<string>('');
  const [querySearch, setQuerySearch] = useState<string>('');

  // Configuração de fluxo de trabalho
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  // Estados de dados
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [sessionCuratedCount, setSessionCuratedCount] = useState<number>(0);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Estatísticas Globais e da Área
  const [stats, setStats] = useState<AdminCurationStats>({
    globalTotal: 132965,
    globalWithAnswer: 34820,
    globalPercentage: 26.2,
    areaTotal: 0,
    areaWithAnswer: 0,
    areaPercentage: 0,
    areaName: 'Todas as Áreas'
  });
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);

  // Questão Atual em Análise
  const currentQuestion = useMemo(() => {
    return questions[currentIndex] || null;
  }, [questions, currentIndex]);

  // Carregar Estatísticas em Tempo Real
  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const esp = selectedEspecialidade !== 'Todas as Especialidades' ? selectedEspecialidade : undefined;
      const ano = selectedAno !== 'Todos os Anos' ? Number(selectedAno) : undefined;
      const bnc = bancaSearch.trim() || undefined;

      const data = await fetchAdminCurationStats(esp, ano, bnc);
      setStats(data);
    } catch (e) {
      console.error('Erro ao carregar estatísticas:', e);
    } finally {
      setIsLoadingStats(false);
    }
  }, [selectedEspecialidade, selectedAno, bancaSearch]);

  // Carregar Questões do Supabase com base nos filtros
  const loadQuestions = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const esp = selectedEspecialidade !== 'Todas as Especialidades' ? [selectedEspecialidade] : undefined;
      const ano = selectedAno !== 'Todos os Anos' ? [Number(selectedAno)] : undefined;
      const inst = bancaSearch.trim() ? [bancaSearch.trim()] : undefined;

      const result = await fetchQuestionsFromSupabase(
        {
          gabaritoStatus: statusFilter,
          especialidades: esp,
          anos: ano,
          instituicoes: inst,
          search: querySearch.trim() || undefined
        },
        page,
        30
      );

      setQuestions(result.questions);
      setTotalQuestions(result.total);
      setCurrentIndex(0);
      setCurrentPage(page);
    } catch (e) {
      console.error('Erro ao carregar questões para curadoria:', e);
      setQuestions([]);
      setTotalQuestions(0);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, selectedEspecialidade, selectedAno, bancaSearch, querySearch]);

  // Carregar questões e métricas ao alterar filtros
  useEffect(() => {
    loadQuestions(1);
    loadStats();
  }, [loadQuestions, loadStats]);

  // Toast de feedback
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2800);
  };

  // Atribuir / Salvar Gabarito
  const handleAssignAnswer = async (letter: 'A' | 'B' | 'C' | 'D' | 'E' | '', isAnulada: boolean = false) => {
    if (!currentQuestion) return;

    setIsSaving(true);
    try {
      const result = await updateQuestionAnswer(currentQuestion.id, {
        correctAnswer: letter,
        isAnulada: isAnulada
      });

      if (result.success) {
        showToast(
          isAnulada
            ? `Questão ${currentQuestion.code || currentQuestion.id.slice(0, 8)} marcada como ANULADA!`
            : `Gabarito [${letter}] salvo com sucesso para a questão ${currentQuestion.code || currentQuestion.id.slice(0, 8)}!`,
          'success'
        );

        // Atualiza a questão localmente na lista
        setQuestions((prev) =>
          prev.map((q, idx) =>
            idx === currentIndex
              ? { ...q, correctAnswer: letter, isAnulada: isAnulada }
              : q
          )
        );

        setSessionCuratedCount((prev) => prev + 1);

        // Atualiza contadores locais
        setStats((prev) => ({
          ...prev,
          globalWithAnswer: prev.globalWithAnswer + 1,
          areaWithAnswer: prev.areaWithAnswer + 1,
          globalPercentage: Number((((prev.globalWithAnswer + 1) / prev.globalTotal) * 100).toFixed(1)),
          areaPercentage: prev.areaTotal > 0 ? Number((((prev.areaWithAnswer + 1) / prev.areaTotal) * 100).toFixed(1)) : 0
        }));

        // Se autoAdvance estiver ativo, avança para a próxima questão
        if (autoAdvance) {
          if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else if (currentPage * 30 < totalQuestions) {
            // Se chegou ao fim do lote e há mais páginas, carrega a próxima
            loadQuestions(currentPage + 1);
          }
        }
      } else {
        showToast(result.error || 'Erro ao salvar gabarito no banco de dados.', 'error');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha ao salvar gabarito.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Navegação
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else if (currentPage > 1) {
      loadQuestions(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (currentPage * 30 < totalQuestions) {
      loadQuestions(currentPage + 1);
    }
  };

  // Atalhos de Teclado (A, B, C, D, E, X para Anulada, Setas para Navegação)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora atalhos se o foco estiver em um input de texto
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
        e.preventDefault();
        handleAssignAnswer(key as 'A' | 'B' | 'C' | 'D' | 'E', false);
      } else if (key === 'X') {
        e.preventDefault();
        handleAssignAnswer('', true);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions, autoAdvance]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. Header do Painel com Identificação de Admin e Métricas de Progresso */}
      <div className="bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
              style={{
                backgroundColor: accentConfig.primaryHex,
                boxShadow: `0 4px 16px -2px ${accentConfig.bgRgba}`
              }}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                  Painel de Curadoria Manual de Gabaritos
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Acesso Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Operador: <strong className="text-slate-700 dark:text-slate-300">{user?.name || 'Administrador MedEvo'}</strong> • Curadoria em tempo real simultânea à coleta automatizada
              </p>
            </div>
          </div>

          {/* Contador de Gabaritos Salvos nesta Sessão */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-2xl shrink-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-4 h-4 font-bold" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Feitas nesta Sessão
              </span>
              <span className="font-heading font-black text-lg text-emerald-600 dark:text-emerald-400 leading-tight block">
                {sessionCuratedCount} gabaritos
              </span>
            </div>
          </div>
        </div>

        {/* ================= BARRA DE PROGRESSO & PORCENTAGENS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
          {/* Card Porcentagem Global do Banco */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900/40 dark:to-indigo-950/20 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                Progresso Global do Banco
              </span>
              <span className="font-heading font-black text-sm text-indigo-600 dark:text-indigo-400">
                {stats.globalPercentage}%
              </span>
            </div>
            {/* Barra de Progresso Global */}
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(stats.globalPercentage, 100)}%`,
                  backgroundColor: accentConfig.primaryHex
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              <span>Homologadas: <strong className="text-slate-800 dark:text-slate-200 font-bold">{stats.globalWithAnswer.toLocaleString('pt-BR')}</strong></span>
              <span>Total do Banco: <strong className="text-slate-800 dark:text-slate-200 font-bold">{stats.globalTotal.toLocaleString('pt-BR')}</strong></span>
            </div>
          </div>

          {/* Card Porcentagem da Área em Questão */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-900/40 dark:to-emerald-950/20 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 truncate pr-2">
                <Layers className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Área em Análise: <strong className="text-slate-800 dark:text-slate-200">{stats.areaName}</strong></span>
              </span>
              <span className="font-heading font-black text-sm text-emerald-600 dark:text-emerald-400 shrink-0">
                {isLoadingStats ? '...' : `${stats.areaPercentage}%`}
              </span>
            </div>
            {/* Barra de Progresso da Área */}
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(stats.areaPercentage, 100)}%`
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              <span>Com Gabarito: <strong className="text-slate-800 dark:text-slate-200 font-bold">{stats.areaWithAnswer.toLocaleString('pt-BR')}</strong></span>
              <span>Total na Área: <strong className="text-slate-800 dark:text-slate-200 font-bold">{stats.areaTotal.toLocaleString('pt-BR')}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra de Filtros Dinâmicos */}
      <div className="bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4">
        {/* Seletor de Status: Sem Gabarito vs Com Gabarito vs Todas */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Status do Gabarito:
            </span>
            <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStatusFilter('sem_gabarito')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'sem_gabarito'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Sem Gabarito</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('com_gabarito')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'com_gabarito'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Com Gabarito (Revisar)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('todas')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'todas'
                    ? 'bg-slate-800 text-white dark:bg-slate-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Todas</span>
              </button>
            </div>
          </div>

          {/* Toggle de Auto-Avanço */}
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Auto-avançar ao marcar
            </span>
          </label>
        </div>

        {/* Linha de Filtros: Especialidade, Ano, Banca e Busca Textual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Especialidade */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Especialidade / Área
            </label>
            <select
              value={selectedEspecialidade}
              onChange={(e) => setSelectedEspecialidade(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {ESPECIALIDADES_LIST.map((esp) => (
                <option key={esp} value={esp}>
                  {esp}
                </option>
              ))}
            </select>
          </div>

          {/* Ano */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Ano do Exame
            </label>
            <select
              value={selectedAno}
              onChange={(e) => setSelectedAno(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {ANOS_LIST.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          {/* Banca / Instituição */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Banca / Instituição
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: USP, UNIFESP, SUS-SP..."
                value={bancaSearch}
                onChange={(e) => setBancaSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    loadQuestions(1);
                    loadStats();
                  }
                }}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-8 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => {
                  loadQuestions(1);
                  loadStats();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Busca por Enunciado ou Código */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Código / Palavra-chave
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: torção, apendicite, código..."
                value={querySearch}
                onChange={(e) => setQuerySearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    loadQuestions(1);
                  }
                }}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-8 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => loadQuestions(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Área Principal: Visualização da Questão & Painel de Atribuição de Gabarito */}
      {isLoading ? (
        <div className="bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-12 text-center shadow-sm">
          <div className="inline-block animate-spin text-indigo-600 dark:text-indigo-400 mb-3">
            <RotateCcw className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Carregando lote de questões para curadoria...
          </p>
        </div>
      ) : !currentQuestion ? (
        <div className="bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-12 text-center shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
            Nenhuma questão pendente com os filtros selecionados!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Todas as questões deste filtro já possuem gabarito homologado, ou nenhum resultado foi encontrado com os termos de busca.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('todas');
              setSelectedEspecialidade('Todas as Especialidades');
              setSelectedAno('Todos os Anos');
              setBancaSearch('');
              setQuerySearch('');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Resetar Todos os Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda (2 colunas): Enunciado e Todas as Classificações da Questão */}
          <div className="lg:col-span-2 space-y-5">
            {/* Card com Todas as Classificações da Questão em Análise */}
            <div className="bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
              {/* Barra Superior: Código, Status Atual e Navegação Sequencial */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {currentQuestion.code || `ID: ${currentQuestion.id.slice(0, 8)}`}
                  </span>

                  {/* Badge de Status Atual */}
                  {currentQuestion.isAnulada ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                      <Ban className="w-3 h-3" />
                      Anulada Oficialmente
                    </span>
                  ) : currentQuestion.correctAnswer ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Gabarito Atual: <strong>[{currentQuestion.correctAnswer}]</strong>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1 animate-pulse">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      Pendente de Gabarito
                    </span>
                  )}
                </div>

                {/* Paginação Sequencial */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span>Questão <strong>{currentIndex + 1}</strong> de <strong>{questions.length}</strong></span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0 && currentPage === 1}
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                    title="Questão Anterior (Seta Esquerda)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentIndex === questions.length - 1 && currentPage * 30 >= totalQuestions}
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                    title="Próxima Questão (Seta Direita / Enter)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid Completo de Classificações Taxonômicas da Questão */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Instituição</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block" title={currentQuestion.institution}>
                    {currentQuestion.institution || 'Não especificada'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Banca / Prova</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {currentQuestion.banca || 'Banca Própria'} • {currentQuestion.year}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Grande Área</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate block">
                    {currentQuestion.especialidade || currentQuestion.specialty || 'Geral'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Dificuldade</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {currentQuestion.difficulty || 'Médio'}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tema Médico</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {currentQuestion.tema || 'Tema Geral'}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Foco & Subfoco</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block" title={`${currentQuestion.foco} - ${currentQuestion.subfoco}`}>
                    {currentQuestion.foco || 'Geral'} {currentQuestion.subfoco ? `• ${currentQuestion.subfoco}` : ''}
                  </span>
                </div>
              </div>

              {/* Enunciado da Questão */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Enunciado:
                </h4>
                <div className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-serif whitespace-pre-line bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                  {currentQuestion.statement}
                </div>

                {/* Imagens anexas (se houver) */}
                {Array.isArray(currentQuestion.images) && currentQuestion.images.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentQuestion.images.map((img, i) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={i}
                        src={img}
                        alt={`Imagem ${i + 1} da questão`}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 max-h-64 object-contain mx-auto"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Alternativas A, B, C, D, E */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Alternativas:
                </h4>
                <div className="space-y-2.5">
                  {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((opt) => {
                      const isCurrentCorrect = currentQuestion.correctAnswer === opt.letter && !currentQuestion.isAnulada;
                      return (
                        <div
                          key={opt.letter}
                          onClick={() => handleAssignAnswer(opt.letter, false)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isCurrentCorrect
                              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 shadow-sm'
                              : 'bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              isCurrentCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {opt.letter}
                          </div>
                          <div className="flex-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200 pt-0.5 leading-relaxed">
                            {opt.text}
                          </div>
                          {isCurrentCorrect && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase shrink-0">
                              Correta
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-400 p-4 border border-dashed border-slate-300 rounded-xl">
                      Nenhuma alternativa cadastrada para esta questão.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita (1 coluna): Painel Rápido de Atribuição de Gabarito & Atalhos */}
          <div className="space-y-5">
            {/* Painel de Ação de Gabarito */}
            <div className="bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm sticky top-24 space-y-5">
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Atribuir / Alterar Gabarito
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Clique na letra correspondente ou pressione no teclado:
                </p>
              </div>

              {/* Botões de A, B, C, D, E */}
              <div className="grid grid-cols-5 gap-2">
                {(['A', 'B', 'C', 'D', 'E'] as const).map((letter) => {
                  const isSelected = currentQuestion.correctAnswer === letter && !currentQuestion.isAnulada;
                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleAssignAnswer(letter, false)}
                      className={`h-14 rounded-2xl font-heading font-black text-xl flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm ${
                        isSelected
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#0c1424]'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-white'
                      }`}
                    >
                      <span>{letter}</span>
                      <span className="text-[9px] font-mono opacity-60 font-normal">[{letter}]</span>
                    </button>
                  );
                })}
              </div>

              {/* Botão de Questão Anulada */}
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleAssignAnswer('', true)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  currentQuestion.isAnulada
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                    : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                }`}
              >
                <Ban className="w-4 h-4" />
                <span>Marcar Questão como Anulada [X]</span>
              </button>

              {/* Barra de Navegação Rápida Próxima / Anterior */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0 && currentPage === 1}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior [←]</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === questions.length - 1 && currentPage * 30 >= totalQuestions}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-sm"
                >
                  <span>Próxima [→]</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Guia Rápido de Teclado */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
                <span className="font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                  Atalhos de Alta Velocidade:
                </span>
                <div className="flex items-center justify-between">
                  <span>Atribuir Gabarito:</span>
                  <kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">A, B, C, D, E</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Marcar Anulada:</span>
                  <kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">X</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avançar Questão:</span>
                  <kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">Seta Direita / Enter</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Voltar Questão:</span>
                  <kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">Seta Esquerda</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Flutuante de Sucesso / Feedback */}
      {feedbackToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold animate-slideUp ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
              : 'bg-rose-600 text-white border-rose-500 shadow-rose-500/20'
          }`}
        >
          {feedbackToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{feedbackToast.message}</span>
        </div>
      )}
    </div>
  );
};
