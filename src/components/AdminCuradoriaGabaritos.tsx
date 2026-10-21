'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  updateQuestionAnswer,
  fetchPriorityExams,
  fetchExamQuestions
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
  Zap,
  Check,
  Ban,
  BookOpen,
  Flame,
  Award,
  Filter,
  ArrowRight,
  Sparkles,
  Database
} from 'lucide-react';

interface PriorityExam {
  id: string;
  instituicao: string;
  banca: string;
  ano: number;
  tipo_prova: string;
  total_questoes: number;
  com_gabarito: number;
  anuladas: number;
  discursivas: number;
  auditadas: number;
  faltam: number;
  percentual: number;
  priorityTier: 'ouro' | 'prata' | 'bronze' | 'critica' | 'blindada';
}

export const AdminCuradoriaGabaritos: React.FC = () => {
  const { accentConfig } = useTheme();
  const { user, isAdmin } = useAuth();

  // Permissão de Curador (suporta admin oficial ou modo demo liberado)
  const [devCuratorBypass, setDevCuratorBypass] = useState<boolean>(false);
  const isCuratorAuthorized = isAdmin || devCuratorBypass;

  // Estados de Fila de Provas Prioritárias
  const [priorityTier, setPriorityTier] = useState<'ouro' | 'prata' | 'bronze' | 'critica' | 'blindada' | 'todas'>('ouro');
  const [examSearch, setExamSearch] = useState<string>('');
  const [examYearFilter, setExamYearFilter] = useState<string>('todos');
  const [priorityExams, setPriorityExams] = useState<PriorityExam[]>([]);
  const [tierCounts, setTierCounts] = useState<{ todas: number; ouro: number; prata: number; bronze: number; critica: number; blindada: number }>({
    todas: 0,
    ouro: 0,
    prata: 0,
    bronze: 0,
    critica: 0,
    blindada: 0
  });
  const [isLoadingExams, setIsLoadingExams] = useState<boolean>(true);

  // Prova Selecionada no Momento
  const [selectedExam, setSelectedExam] = useState<PriorityExam | null>(null);
  const [onlyMissingInExam, setOnlyMissingInExam] = useState<boolean>(false);

  // Questões da Prova Selecionada (Carregadas diretamente do Supabase)
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [sessionCuratedCount, setSessionCuratedCount] = useState<number>(0);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Configuração de fluxo de trabalho
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  // Carregar Provas Prioritárias
  const loadPriorityExamsList = useCallback(async () => {
    setIsLoadingExams(true);
    try {
      const data = await fetchPriorityExams(priorityTier, examSearch, examYearFilter);
      if (data && data.success) {
        setPriorityExams(data.exams || []);
        if (data.counts) {
          setTierCounts(data.counts);
        }
        // Se nenhuma prova selecionada e houver provas, pré-seleciona a primeira da fila ouro
        if (!selectedExam && data.exams && data.exams.length > 0) {
          setSelectedExam(data.exams[0]);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar provas prioritárias:', e);
    } finally {
      setIsLoadingExams(false);
    }
  }, [priorityTier, examSearch, examYearFilter, selectedExam]);

  // Carregar Provas ao inicializar ou mudar filtros
  useEffect(() => {
    if (!isCuratorAuthorized) return;
    loadPriorityExamsList();
  }, [isCuratorAuthorized, loadPriorityExamsList]);

  // Carregar Questões da Prova Selecionada Diretamente do Supabase
  const loadExamQuestionsData = useCallback(async (exam: PriorityExam, onlyMissing: boolean = false) => {
    setIsLoadingQuestions(true);
    try {
      const examKey = [exam.instituicao, exam.banca, exam.ano, exam.tipo_prova].join(' | ');
      const data = await fetchExamQuestions(examKey, onlyMissing);

      if (data && data.success) {
        setQuestions(data.questions || []);
        setCurrentIndex(0);
      } else {
        setQuestions([]);
      }
    } catch (e) {
      console.error('Erro ao carregar questões da prova:', e);
      setQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  }, []);

  // Recarregar questões quando mudar a prova ou o filtro de "apenas faltantes"
  useEffect(() => {
    if (!selectedExam || !isCuratorAuthorized) return;
    loadExamQuestionsData(selectedExam, onlyMissingInExam);
  }, [selectedExam, onlyMissingInExam, isCuratorAuthorized, loadExamQuestionsData]);

  // Questão Atual em Análise
  const currentQuestion = useMemo(() => {
    return questions[currentIndex] || null;
  }, [questions, currentIndex]);

  // Estatísticas da Prova Atual
  const currentExamStats = useMemo(() => {
    if (!questions || questions.length === 0) {
      return { total: 0, withAnswer: 0, anuladas: 0, missing: 0, percentual: 0 };
    }
    let withAns = 0;
    let anul = 0;
    let miss = 0;
    for (const q of questions) {
      if (q.isAnulada) anul++;
      else if (q.correctAnswer && ['A', 'B', 'C', 'D', 'E'].includes(q.correctAnswer)) withAns++;
      else miss++;
    }
    const resolved = withAns + anul;
    const pct = questions.length > 0 ? Number(((resolved / questions.length) * 100).toFixed(1)) : 0;
    return {
      total: questions.length,
      withAnswer: withAns,
      anuladas: anul,
      missing: miss,
      percentual: pct
    };
  }, [questions]);

  // Toast de feedback
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2800);
  };

  // Atribuir / Salvar Gabarito no Supabase (Direto e Atômico via Service Role)
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
            ? `Questão ${currentQuestion.code || currentQuestion.id.slice(0, 8)} marcada como ANULADA no Supabase!`
            : `Gabarito [${letter}] salvo com sucesso no Supabase para a questão ${currentQuestion.code || currentQuestion.id.slice(0, 8)}!`,
          'success'
        );

        // Atualiza a questão localmente na lista da prova
        setQuestions((prev) =>
          prev.map((q, idx) =>
            idx === currentIndex
              ? { ...q, correctAnswer: letter, isAnulada: isAnulada }
              : q
          )
        );

        setSessionCuratedCount((prev) => prev + 1);

        // Atualiza a contagem de faltantes da prova selecionada
        if (selectedExam) {
          const newFaltam = Math.max(0, selectedExam.faltam - 1);
          const newComGab = isAnulada ? selectedExam.com_gabarito : selectedExam.com_gabarito + 1;
          const newAnul = isAnulada ? selectedExam.anuladas + 1 : selectedExam.anuladas;
          const newPct = Number((((newComGab + newAnul) / selectedExam.total_questoes) * 100).toFixed(1));

          const updatedExam: PriorityExam = {
            ...selectedExam,
            faltam: newFaltam,
            com_gabarito: newComGab,
            anuladas: newAnul,
            auditadas: newComGab + newAnul,
            percentual: newPct,
            priorityTier: newFaltam === 0 ? 'blindada' : newFaltam <= 5 ? 'ouro' : newFaltam <= 10 ? 'prata' : 'bronze'
          };
          setSelectedExam(updatedExam);

          // Atualiza também na lista de provas prioritárias
          setPriorityExams((prev) =>
            prev.map((e) => (e.id === selectedExam.id ? updatedExam : e))
          );
        }

        // Se autoAdvance estiver ativo, avança para a próxima questão
        if (autoAdvance) {
          if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
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
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Atalhos de Teclado (A, B, C, D, E, X para Anulada, Setas para Navegação)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Se não for admin oficial e não tiver o bypass ativado, exibe opção para ativar modo de curadoria
  if (!isCuratorAuthorized) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Painel de Curadoria de Gabaritos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Você está navegando com usuário padrão ({user?.email || 'Demo'}). Para homologar gabaritos diretamente no banco Supabase, habilite o acesso de curador:
          </p>
          <button
            type="button"
            onClick={() => setDevCuratorBypass(true)}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Liberar Acesso de Curador (Supabase Direto)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. Header do Painel com Status de Conexão Supabase */}
      <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-7 shadow-sm">
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
                  Curadoria Inteligente de Gabaritos
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Supabase Conectado
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Operador: <strong className="text-slate-700 dark:text-slate-300">{user?.name || 'Curador Oficial'}</strong> • Priorização por Proximidade de Completude (100% Blindadas)
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
                Gravadas no Banco Nesta Sessão
              </span>
              <span className="font-heading font-black text-lg text-emerald-600 dark:text-emerald-400 leading-tight block">
                {sessionCuratedCount} gabaritos
              </span>
            </div>
          </div>
        </div>

        {/* ================= SELEÇÃO DE PRIORIDADE DE PROVAS ================= */}
        <div className="pt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Fila de Prioridade Estratégica:
            </span>

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
                Auto-avançar questão ao marcar
              </span>
            </label>
          </div>

          {/* Botões das Faixas de Prioridade */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {/* Ouro: 1 a 5 faltantes */}
            <button
              type="button"
              onClick={() => setPriorityTier('ouro')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                priorityTier === 'ouro'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Meta Imediata
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  {tierCounts.ouro}
                </span>
              </div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">
                1 a 5 Faltando
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Fechamento rápido
              </div>
            </button>

            {/* Prata: 6 a 10 faltantes */}
            <button
              type="button"
              onClick={() => setPriorityTier('prata')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                priorityTier === 'prata'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
                  Prioridade Média
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                  {tierCounts.prata}
                </span>
              </div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">
                6 a 10 Faltando
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Alta conversão
              </div>
            </button>

            {/* Bronze: 11 a 20 faltantes */}
            <button
              type="button"
              onClick={() => setPriorityTier('bronze')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                priorityTier === 'bronze'
                  ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 ring-2 ring-sky-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400">
                  Prioridade Normal
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                  {tierCounts.bronze}
                </span>
              </div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">
                11 a 20 Faltando
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Lotes médios
              </div>
            </button>

            {/* Crítica: > 20 faltantes */}
            <button
              type="button"
              onClick={() => setPriorityTier('critica')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                priorityTier === 'critica'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 ring-2 ring-rose-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400">
                  Grandes Bancas
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                  {tierCounts.critica}
                </span>
              </div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">
                Mais de 20
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Gargalos volumosos
              </div>
            </button>

            {/* Blindadas: 0 faltantes */}
            <button
              type="button"
              onClick={() => setPriorityTier('blindada')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                priorityTier === 'blindada'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Blindadas
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  {tierCounts.blindada}
                </span>
              </div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">
                100% Completas
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Revisão e auditoria
              </div>
            </button>

            {/* Todas as Provas */}
            <button
              type="button"
              onClick={() => setPriorityTier('todas')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                priorityTier === 'todas'
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 ring-2 ring-slate-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Catálogo Todo
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  {tierCounts.todas}
                </span>
              </div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">
                Todas as Provas
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Visão universal
              </div>
            </button>
          </div>

          {/* Barra de Filtros e Busca de Prova */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="sm:col-span-2 relative">
              <input
                type="text"
                placeholder="Buscar instituição ou banca da prova (ex: USP, ENARE, UNICAMP, SUS-SP)..."
                value={examSearch}
                onChange={(e) => setExamSearch(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-8 py-2.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden"
              />
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div>
              <select
                value={examYearFilter}
                onChange={(e) => setExamYearFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="todos">Todos os Anos</option>
                {[2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Carrossel / Grade de Provas Disponíveis na Faixa */}
          <div className="pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Selecione a Prova para Homologar Gabaritos:
            </span>

            {isLoadingExams ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                Carregando catálogo de provas prioritárias...
              </div>
            ) : priorityExams.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                Nenhuma prova encontrada com os filtros selecionados.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
                {priorityExams.map((exam) => {
                  const isSelected = selectedExam?.id === exam.id;
                  return (
                    <div
                      key={exam.id}
                      onClick={() => {
                        setSelectedExam(exam);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/20 shadow-sm'
                          : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {exam.instituicao}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{exam.ano}</span>
                          <span>•</span>
                          <span className="truncate">{exam.banca}</span>
                          <span>•</span>
                          <span>{exam.total_questoes}q</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {exam.faltam === 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                            100% Blindada
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            exam.faltam <= 5
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 animate-pulse'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}>
                            Faltam {exam.faltam}
                          </span>
                        )}
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {exam.percentual}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Cabeçalho e Régua Numérica da Prova Selecionada */}
      {selectedExam && (
        <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-indigo-600 text-white">
                  {selectedExam.ano}
                </span>
                <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  {selectedExam.instituicao}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Banca: <strong className="text-slate-700 dark:text-slate-300">{selectedExam.banca}</strong> • Caderno: {selectedExam.tipo_prova} • Total na Prova: <strong className="text-slate-700 dark:text-slate-300">{currentExamStats.total} questões</strong>
              </p>
            </div>

            {/* Barra de Progresso da Prova */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status da Prova</span>
                <span className="font-heading font-black text-sm text-emerald-600 dark:text-emerald-400">
                  {currentExamStats.percentual}% ({currentExamStats.withAnswer + currentExamStats.anuladas}/{currentExamStats.total})
                </span>
              </div>

              {/* Botão de Toggle: Ver Todas vs Apenas Faltantes */}
              <button
                type="button"
                onClick={() => setOnlyMissingInExam(!onlyMissingInExam)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  onlyMissingInExam
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{onlyMissingInExam ? 'Exibindo Apenas Faltantes' : 'Filtrar Apenas Faltantes'}</span>
              </button>
            </div>
          </div>

          {/* ================= RÉGUA NUMÉRICA DA PROVA (1 a 100) ================= */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="uppercase tracking-wider text-[10px]">
                Navegador da Prova (Clique para Pular Diretamente para a Questão):
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Gabaritada
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Anulada
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block animate-pulse" /> Pendente
                </span>
              </div>
            </div>

            {/* Grid dos Números das Questões */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-850">
              {questions.map((q, idx) => {
                const isSelected = idx === currentIndex;
                const hasAnswer = q.correctAnswer && ['A', 'B', 'C', 'D', 'E'].includes(q.correctAnswer);
                const isAnulada = q.isAnulada;

                let badgeColor = 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 animate-pulse';
                if (isAnulada) {
                  badgeColor = 'bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300';
                } else if (hasAnswer) {
                  badgeColor = 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    title={`Questão ${idx + 1}: ${hasAnswer ? 'Gabarito [' + q.correctAnswer + ']' : isAnulada ? 'Anulada' : 'Sem Gabarito'}`}
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer flex items-center justify-center ${badgeColor} ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[var(--bg-card)] font-black scale-105'
                        : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Área Principal: Visualização da Questão & Painel de Atribuição de Gabarito */}
      {isLoadingQuestions ? (
        <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-12 text-center shadow-sm">
          <div className="inline-block animate-spin text-indigo-600 dark:text-indigo-400 mb-3">
            <RotateCcw className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Buscando questões da prova diretamente do Supabase...
          </p>
        </div>
      ) : !currentQuestion ? (
        <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-12 text-center shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
            Nenhuma questão encontrada nesta prova!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Se você ativou o filtro de apenas faltantes, todas as questões desta prova já estão 100% blindadas com gabarito homologado.
          </p>
          {onlyMissingInExam && (
            <button
              type="button"
              onClick={() => setOnlyMissingInExam(false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Exibir Todas as Questões da Prova
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda (2 colunas): Enunciado e Classificações da Questão */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm space-y-4">
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
                      Gabarito no Supabase: <strong>[{currentQuestion.correctAnswer}]</strong>
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
                  <span>
                    Questão <strong>{currentIndex + 1}</strong> de <strong>{questions.length}</strong>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                    title="Questão Anterior (Seta Esquerda)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentIndex === questions.length - 1}
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                    title="Próxima Questão (Seta Direita / Enter)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid de Classificações Taxonômicas da Questão */}
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
            <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm sticky top-24 space-y-5">
              <div>
                <h3 className="font-heading font-extrabold text-base text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Atribuir / Gravar no Supabase
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Clique na letra ou pressione no teclado para gravar:
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
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[var(--bg-card)]'
                          : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-[var(--bg-input)] dark:hover:bg-zinc-800 text-zinc-800 dark:text-white'
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
                  disabled={currentIndex === 0}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior [←]</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === questions.length - 1}
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
