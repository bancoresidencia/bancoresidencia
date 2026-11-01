'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertOctagon,
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  RotateCcw,
  FileText,
  ChevronDown,
  ChevronUp,
  Brain,
  X,
  Check,
  Send,
  Zap,
  Shuffle,
  Bookmark,
  Layers,
  TrendingUp,
  Play
} from 'lucide-react';
import {
  UserAnswerItem,
  ErrorReasonType,
  Question,
  ActiveReviewSessionState,
  ReviewSessionMode
} from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { fetchQuestionsFromSupabase } from '@/services/questionService';
import { CadernoErrosReviewSession } from './CadernoErrosReviewSession';
import { ERROR_REASON_CONFIG } from '@/utils/errorReasons';
import {
  getActiveReviewSession,
  clearActiveReviewSession,
  calculateReviewCycleMetrics
} from '@/services/reviewSessionService';

export { ERROR_REASON_CONFIG };

const SIX_SPECIALTIES = [
  'Todas',
  'Clínica Médica',
  'Cirurgia Geral',
  'Pediatria',
  'Ginecologia',
  'Obstetrícia',
  'Medicina Preventiva e Social'
];

interface CadernoDeErrosProps {
  userAnswers: Record<string, UserAnswerItem>;
  bookmarkedQuestionIds?: Record<string, boolean>;
  onUpdateAnswerMeta: (
    questionId: string,
    meta: {
      errorReason?: ErrorReasonType;
      studentNotes?: string;
      statusRetrial?: 'pendente' | 'recuperado';
    }
  ) => void;
  onAnswerQuestion: (
    questionId: string,
    selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E',
    isCorrect: boolean
  ) => void;
  onStartTreinoErros: (questionIds: string[]) => void;
  onNavigateToBanco: (specialty?: string, tema?: string, subfoco?: string) => void;
}

export const CadernoDeErros: React.FC<CadernoDeErrosProps> = ({
  userAnswers,
  bookmarkedQuestionIds = {},
  onUpdateAnswerMeta,
  onAnswerQuestion,
  onStartTreinoErros,
  onNavigateToBanco
}) => {
  const { accentConfig } = useTheme();

  // Modo Dual: "Erros (apenas erros pendentes)" vs "Lista completa (Erros e Favoritos)"
  const [reviewModeTab, setReviewModeTab] = useState<ReviewSessionMode>('erros');

  // Sessão de Revisão Ativa Resiliente (Recuperada de LocalStorage)
  const [activeSession, setActiveSession] = useState<ActiveReviewSessionState | null>(null);
  const [restoredSessionToRun, setRestoredSessionToRun] = useState<ActiveReviewSessionState | null>(null);

  // Estados de Filtros do Caderno
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<'todos' | 'pendente' | 'recuperado'>('pendente');
  const [selectedReason, setSelectedReason] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recentes' | 'antigas' | 'especialidade'>('recentes');

  // Cache de questões completas do Supabase (para exibir enunciados e comentários)
  const [questionsMap, setQuestionsMap] = useState<Record<string, Question>>({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);

  // Estados de UI de cada card
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  const [savedNotesAlert, setSavedNotesAlert] = useState<Record<string, boolean>>({});
  const [retryingQuestionId, setRetryingQuestionId] = useState<string | null>(null);
  const [selectedRetryOption, setSelectedRetryOption] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>({});

  // Sessão Ativa às Cegas
  const [reviewSessionQuestionIds, setReviewSessionQuestionIds] = useState<string[] | null>(null);

  // 1. Verifica no carregamento se há sessão ativa salva
  useEffect(() => {
    const saved = getActiveReviewSession();
    if (saved) {
      setActiveSession(saved);
    }
  }, []);

  // 2. Coleta todas as entradas de respostas erradas
  const errorEntries = useMemo(() => {
    return Object.entries(userAnswers)
      .filter(([, ans]) => !ans.isCorrect || ans.statusRetrial === 'recuperado')
      .map(([qid, ans]) => ({
        questionId: qid,
        answer: ans,
        isFavorite: Boolean(bookmarkedQuestionIds[qid])
      }));
  }, [userAnswers, bookmarkedQuestionIds]);

  // Lista unificada para a aba "Lista completa" (Erros + Favoritos)
  const allReviewEntries = useMemo(() => {
    if (reviewModeTab === 'erros') {
      return errorEntries;
    }

    // Modo "Lista completa": reúne erros + favoritos
    const map = new Map<string, { questionId: string; answer: UserAnswerItem; isFavorite: boolean }>();

    // Adiciona erros
    errorEntries.forEach((e) => {
      map.set(e.questionId, e);
    });

    // Adiciona favoritos que ainda não estavam na lista de erros
    Object.entries(bookmarkedQuestionIds).forEach(([qid, isFav]) => {
      if (isFav && !map.has(qid)) {
        map.set(qid, {
          questionId: qid,
          answer: userAnswers[qid] || {
            letter: 'A',
            isCorrect: false,
            timestamp: 0,
            difficulty: 'Médio',
            isAnulada: false,
            statusRetrial: 'pendente'
          },
          isFavorite: true
        });
      }
    });

    return Array.from(map.values());
  }, [errorEntries, bookmarkedQuestionIds, reviewModeTab, userAnswers]);

  // Carrega as questões completas em lote a partir dos IDs que ainda não estão em cache
  useEffect(() => {
    const missingIds = allReviewEntries
      .map((e) => e.questionId)
      .filter((id) => !questionsMap[id]);

    if (missingIds.length === 0) return;

    let isMounted = true;
    setIsLoadingQuestions(true);

    const batch = missingIds.slice(0, 100);
    fetchQuestionsFromSupabase({}, 1, batch.length, batch)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.questions) {
          setQuestionsMap((prev) => {
            const next = { ...prev };
            res.questions.forEach((q) => {
              next[q.id] = q;
            });
            return next;
          });
        }
      })
      .catch((err) => console.error('Erro ao carregar detalhes das questões para revisão:', err))
      .finally(() => {
        if (isMounted) setIsLoadingQuestions(false);
      });

    return () => {
      isMounted = false;
    };
  }, [allReviewEntries, questionsMap]);

  // 3. Métricas do Ciclo de Revisão e Topografia Clínica
  const reviewCycleMetrics = useMemo(() => {
    return calculateReviewCycleMetrics(userAnswers, questionsMap);
  }, [userAnswers, questionsMap]);

  // 4. Estatísticas Consolidadas do Caderno de Erros
  const statsSummary = useMemo(() => {
    const total = errorEntries.length;
    const pendentes = errorEntries.filter((e) => (e.answer.statusRetrial || 'pendente') === 'pendente').length;
    const recuperadas = errorEntries.filter((e) => e.answer.statusRetrial === 'recuperado').length;
    const taxaRecuperacao = total > 0 ? (recuperadas / total) * 100 : 0;

    // Distribuição por Grande Área
    const bySpec: Record<string, number> = {};
    SIX_SPECIALTIES.filter((s) => s !== 'Todas').forEach((s) => {
      bySpec[s] = 0;
    });

    // Distribuição por Motivo do Erro
    const byReason: Record<string, number> = {
      sem_classificacao: 0
    };
    Object.keys(ERROR_REASON_CONFIG).forEach((k) => {
      byReason[k] = 0;
    });

    errorEntries.forEach((e) => {
      let spec = e.answer.specialty || questionsMap[e.questionId]?.especialidade || '';
      if (spec === 'Cirurgia') spec = 'Cirurgia Geral';
      if (spec === 'Ginecologia e Obstetrícia') spec = 'Ginecologia';

      if (bySpec[spec] !== undefined) {
        bySpec[spec]++;
      }

      const r = e.answer.errorReason;
      if (r && byReason[r] !== undefined) {
        byReason[r]++;
      } else {
        byReason.sem_classificacao++;
      }
    });

    return {
      total,
      pendentes,
      recuperadas,
      taxaRecuperacao,
      bySpec,
      byReason
    };
  }, [errorEntries, questionsMap]);

  // 5. Filtragem e Ordenação da Lista Exibida
  const filteredEntries = useMemo(() => {
    const result = allReviewEntries.filter((e) => {
      const q = questionsMap[e.questionId];
      const ans = e.answer;

      // Status (pendente vs recuperado)
      const currentStatus = ans.statusRetrial || 'pendente';
      if (selectedStatus !== 'todos' && currentStatus !== selectedStatus) {
        return false;
      }

      // Especialidade
      if (selectedSpecialty !== 'Todas') {
        let spec = ans.specialty || q?.especialidade || '';
        if (spec === 'Cirurgia') spec = 'Cirurgia Geral';
        if (spec === 'Ginecologia e Obstetrícia') spec = 'Ginecologia';
        if (spec !== selectedSpecialty) return false;
      }

      // Motivo do Erro
      if (selectedReason !== 'todos') {
        if (selectedReason === 'sem_classificacao') {
          if (ans.errorReason) return false;
        } else if (ans.errorReason !== selectedReason) {
          return false;
        }
      }

      // Busca Textual
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textToMatch = [
          q?.code,
          q?.banca,
          q?.institution,
          q?.tema,
          q?.subfoco,
          q?.statement,
          ans.specialty,
          ans.tema,
          ans.subfoco,
          ans.studentNotes
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!textToMatch.includes(query)) return false;
      }

      return true;
    });

    // Ordenação
    result.sort((a, b) => {
      if (sortBy === 'recentes') {
        return (b.answer.timestamp || 0) - (a.answer.timestamp || 0);
      }
      if (sortBy === 'antigas') {
        return (a.answer.timestamp || 0) - (b.answer.timestamp || 0);
      }
      if (sortBy === 'especialidade') {
        const specA = a.answer.specialty || questionsMap[a.questionId]?.especialidade || '';
        const specB = b.answer.specialty || questionsMap[b.questionId]?.especialidade || '';
        return specA.localeCompare(specB);
      }
      return 0;
    });

    return result;
  }, [
    allReviewEntries,
    questionsMap,
    selectedStatus,
    selectedSpecialty,
    selectedReason,
    searchQuery,
    sortBy
  ]);

  // Manipulador de salvar anotação pessoal no card
  const handleSaveNotes = (qId: string) => {
    const text = localNotes[qId];
    if (text === undefined) return;
    onUpdateAnswerMeta(qId, { studentNotes: text.trim() });
    setSavedNotesAlert((prev) => ({ ...prev, [qId]: true }));
    setTimeout(() => {
      setSavedNotesAlert((prev) => ({ ...prev, [qId]: false }));
    }, 2000);
  };

  // Submissão rápida no card da questão
  const handleQuickRetryAnswer = (questionId: string) => {
    const q = questionsMap[questionId];
    const letter = selectedRetryOption[questionId];
    if (!q || !letter) return;

    const isAnulada = Boolean(q.isAnulada || q.correctAnswer === 'ANULADA');
    const isCorrect = isAnulada || letter === q.correctAnswer;

    onAnswerQuestion(questionId, letter, isCorrect);

    if (isCorrect) {
      onUpdateAnswerMeta(questionId, { statusRetrial: 'recuperado' });
      setRetryingQuestionId(null);
    }
  };

  // Retomada da sessão ativa salva
  const handleResumeActiveSession = () => {
    if (!activeSession) return;
    setRestoredSessionToRun(activeSession);
    setReviewSessionQuestionIds(activeSession.questionIds);
  };

  // Descarte da sessão ativa salva
  const handleDiscardActiveSession = () => {
    clearActiveReviewSession();
    setActiveSession(null);
  };

  // Iniciar nova sessão ativa
  const handleStartNewSession = (questionIds: string[]) => {
    setRestoredSessionToRun(null);
    setReviewSessionQuestionIds(questionIds);
  };

  // Se o aluno está em uma Sessão de Revisão Ativa, exibe a interface focada de teste
  if (reviewSessionQuestionIds && reviewSessionQuestionIds.length > 0) {
    return (
      <CadernoErrosReviewSession
        questionIds={reviewSessionQuestionIds}
        questionsMap={questionsMap}
        userAnswers={userAnswers}
        initialState={restoredSessionToRun}
        sessionMode={reviewModeTab}
        filterSummary={{
          specialty: selectedSpecialty !== 'Todas' ? selectedSpecialty : undefined,
          reason: selectedReason !== 'todos' ? selectedReason : undefined,
          totalAvailable: filteredEntries.length
        }}
        onAnswerQuestion={onAnswerQuestion}
        onUpdateAnswerMeta={onUpdateAnswerMeta}
        onClose={() => {
          setReviewSessionQuestionIds(null);
          setRestoredSessionToRun(null);
          // Atualiza status da sessão ativa
          const current = getActiveReviewSession();
          setActiveSession(current);
        }}
        onNavigateToBanco={onNavigateToBanco}
      />
    );
  }

  const totalFavoritosCount = Object.values(bookmarkedQuestionIds).filter(Boolean).length;
  const totalCompletaCount = allReviewEntries.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header do Caderno com Abas Dual Mode (Erros vs Lista Completa) */}
      <div className="bg-white dark:bg-[var(--bg-card)] border border-slate-200 dark:border-zinc-800/80 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">
        {/* Toggle de Modo: "Erros" vs "Lista Completa" */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReviewModeTab('erros')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                reviewModeTab === 'erros'
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:text-slate-900'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Erros: {statsSummary.pendentes} para revisar</span>
            </button>

            <button
              type="button"
              onClick={() => setReviewModeTab('completa')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                reviewModeTab === 'completa'
                  ? 'text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:text-slate-900'
              }`}
              style={
                reviewModeTab === 'completa' ? { backgroundColor: accentConfig.primaryHex } : undefined
              }
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lista completa ({totalCompletaCount} itens • {statsSummary.pendentes} erros, {totalFavoritosCount} favoritos)</span>
            </button>
          </div>

          {/* Botão de Iniciar Sessão Imediata com Embaralhamento */}
          {filteredEntries.length > 0 && (
            <button
              type="button"
              onClick={() => handleStartNewSession(filteredEntries.map((e) => e.questionId))}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
              style={{
                backgroundColor: accentConfig.primaryHex,
                boxShadow: `0 6px 16px -4px ${accentConfig.bgRgba}`
              }}
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Iniciar Revisão às Cegas ({filteredEntries.length})</span>
            </button>
          )}
        </div>

        {/* Título Principal & Descrição */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
              style={{
                backgroundColor: accentConfig.bgRgba,
                color: accentConfig.primaryHex,
                border: `1px solid ${accentConfig.borderRgba}`
              }}
            >
              {reviewModeTab === 'completa' ? (
                <Sparkles className="w-6 h-6 stroke-[2]" />
              ) : (
                <AlertOctagon className="w-6 h-6 stroke-[2]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                  {reviewModeTab === 'completa'
                    ? 'Caderno de Revisão Completa'
                    : 'Caderno de Erros'}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                  Recuperação Ativa
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase tracking-wider flex items-center gap-1">
                  <Shuffle className="w-3 h-3" />
                  Anti-Vício
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {reviewModeTab === 'completa'
                  ? 'Revisão integrada unindo questões erradas e marcadas com estrela para consolidação clínica pré-prova.'
                  : 'Avalie cada questão errada, classifique a causa do erro e domine seus pontos fracos para não errar na prova.'}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Banner de Retomada Resiliente de Sessão Ativa */}
        {activeSession && (
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Continuar revisão em andamento</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold uppercase">
                    Em aberto
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  {Object.keys(activeSession.sessionAnswers || {}).length} / {activeSession.questionIds.length} questões respondidas • modo {activeSession.sessionMode === 'completa' ? 'Lista Completa' : 'Apenas Erros'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResumeActiveSession}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Continuar Revisão</span>
              </button>
              <button
                type="button"
                onClick={handleDiscardActiveSession}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                Descartar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Tríade do Ciclo de Revisão e Topografia Clínica de Erros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Coluna 1 & 2: Resumo do Ciclo e Temas com Mais Erros */}
        <div className="lg:col-span-2 bg-white dark:bg-[var(--bg-card)] border border-slate-200 dark:border-zinc-800/80 p-5 rounded-3xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              Resumo das Revisões & Ciclo Ativo
            </h3>
            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
              {reviewCycleMetrics.totalNoCaderno} no caderno
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                Para Revisar
              </span>
              <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                {reviewCycleMetrics.paraRevisar}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">pendentes de superação</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                Agendadas
              </span>
              <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {reviewCycleMetrics.agendadas}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">em ciclo futuro</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Fora do Ciclo
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {reviewCycleMetrics.foraDoCiclo}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">erros recuperados</span>
            </div>
          </div>

          {/* Temas com Mais Erros (Foco Clínico Direto) */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80">
            <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                Temas com Mais Erros (Vulnerabilidades Clínicas):
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">Clique para filtrar</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {reviewCycleMetrics.topTemas.length > 0 ? (
                reviewCycleMetrics.topTemas.map((t) => {
                  const isFiltered = searchQuery === t.tema;
                  return (
                    <button
                      key={t.tema}
                      type="button"
                      onClick={() => setSearchQuery(isFiltered ? '' : t.tema)}
                      className={`px-3 py-1.5 rounded-xl text-xs border transition-colors cursor-pointer flex items-center gap-2 ${
                        isFiltered
                          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-800 dark:text-zinc-200'
                      }`}
                    >
                      <span>{t.tema}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold font-mono ${
                          isFiltered
                            ? 'bg-white/20 text-white'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {t.count}
                      </span>
                    </button>
                  );
                })
              ) : (
                <span className="text-xs text-slate-400 dark:text-zinc-500">
                  Nenhum erro registrado ainda.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 3: Especialidades com Mais Erros */}
        <div className="bg-white dark:bg-[var(--bg-card)] border border-slate-200 dark:border-zinc-800/80 p-5 rounded-3xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-500" />
              Especialidades com Mais Erros
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">Top áreas</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {reviewCycleMetrics.topEspecialidades.slice(0, 5).map((e) => {
              const maxCount = reviewCycleMetrics.topEspecialidades[0]?.count || 1;
              const percent = Math.min(100, Math.max(10, Math.round((e.count / maxCount) * 100)));
              const isSelected = selectedSpecialty === e.especialidade;

              return (
                <div
                  key={e.especialidade}
                  onClick={() => setSelectedSpecialty(isSelected ? 'Todas' : e.especialidade)}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-200 shadow-2xs'
                      : 'bg-slate-50 dark:bg-zinc-900/50 border-slate-200/60 dark:border-zinc-800/60 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      {e.especialidade}
                    </span>
                    <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
                      {e.count} {e.count === 1 ? 'erro' : 'erros'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Barra de Filtros: Especialidades, Status, Motivo e Busca */}
      <div className="bg-white dark:bg-[var(--bg-card)] border border-slate-200 dark:border-zinc-800/80 p-4 rounded-3xl space-y-3 shadow-xs">
        {/* Pílulas de Especialidades */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {SIX_SPECIALTIES.map((spec) => {
            const count = spec === 'Todas' ? statsSummary.total : statsSummary.bySpec[spec] || 0;
            const isSelected = selectedSpecialty === spec;
            return (
              <button
                key={spec}
                type="button"
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-900/80 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-slate-200/80 dark:border-zinc-800'
                }`}
                style={isSelected ? { backgroundColor: accentConfig.primaryHex } : undefined}
              >
                <span>{spec === 'Medicina Preventiva e Social' ? 'Preventiva' : spec}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Linha Secundária: Filtros por Status, Motivo, Busca e Ordenação */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Status (Pendentes vs Recuperadas) */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedStatus('pendente')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === 'pendente'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold shadow-xs border border-rose-500/30'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Pendentes ({statsSummary.pendentes})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('recuperado')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === 'recuperado'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs border border-emerald-500/30'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Recuperadas ({statsSummary.recuperadas})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('todos')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedStatus === 'todos'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                Todas ({statsSummary.total})
              </button>
            </div>

            {/* Filtro por Motivo do Erro */}
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-hidden cursor-pointer"
            >
              <option value="todos">Todos os Motivos do Erro</option>
              <option value="sem_classificacao">Sem Classificação ({statsSummary.byReason.sem_classificacao || 0})</option>
              {Object.entries(ERROR_REASON_CONFIG).map(([k, cfg]) => (
                <option key={k} value={k}>
                  {cfg.label} ({statsSummary.byReason[k] || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Campo de Busca Textual */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tema, código, anotação..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Ordenação */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recentes' | 'antigas' | 'especialidade')}
              className="text-xs font-medium px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-hidden cursor-pointer"
            >
              <option value="recentes">Mais recentes</option>
              <option value="antigas">Mais antigas</option>
              <option value="especialidade">Por Especialidade</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Lista de Cards das Questões */}
      {filteredEntries.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[var(--bg-card)] border border-slate-200 dark:border-zinc-800/80 rounded-3xl space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
            Nenhuma questão encontrada com estes filtros
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            {selectedStatus === 'pendente'
              ? 'Excelente! Você não possui erros pendentes com os critérios selecionados.'
              : 'Tente alterar os filtros de especialidade, status ou motivo para visualizar mais itens.'}
          </p>
          {(selectedSpecialty !== 'Todas' || selectedStatus !== 'pendente' || selectedReason !== 'todos' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedSpecialty('Todas');
                setSelectedStatus('pendente');
                setSelectedReason('todos');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 px-1 font-mono">
            <span>
              Exibindo <strong>{filteredEntries.length}</strong> de {statsSummary.total} questões registradas
            </span>
            {isLoadingQuestions && (
              <span className="text-[11px] text-amber-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Carregando detalhes do banco...
              </span>
            )}
          </div>

          {filteredEntries.map(({ questionId, answer, isFavorite }) => {
            const q = questionsMap[questionId];
            const isRecuperada = (answer.statusRetrial || 'pendente') === 'recuperado';
            const isCommentOpen = !!expandedComments[questionId];
            const isNotesOpen = !!expandedNotes[questionId];
            const isRetrying = retryingQuestionId === questionId;
            const currentReasonKey = answer.errorReason;
            const reasonConfig = currentReasonKey ? ERROR_REASON_CONFIG[currentReasonKey] : null;

            return (
              <div
                key={questionId}
                className={`bg-white dark:bg-[var(--bg-card)] border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition-all ${
                  isRecuperada
                    ? 'border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/5'
                    : 'border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Linha Superior: Cabeçalho do Card */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800/80 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Código / ID */}
                    <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                      #{q?.code || questionId.slice(0, 8)}
                    </span>

                    <span className="text-slate-300 dark:text-zinc-700">•</span>

                    {/* Banca & Ano */}
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">
                      {q?.banca || answer.banca || 'Banca Oficial'}
                    </span>
                    <span className="text-slate-500 dark:text-zinc-400">
                      {q?.year || answer.year || '2025'}
                    </span>

                    {/* Especialidade & Tema */}
                    {(q?.especialidade || answer.specialty) && (
                      <>
                        <span className="text-slate-300 dark:text-zinc-700">•</span>
                        <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                          {q?.especialidade || answer.specialty}
                        </span>
                      </>
                    )}
                    {(q?.tema || answer.tema) && (
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        {q?.tema || answer.tema}
                      </span>
                    )}

                    {isFavorite && (
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Bookmark className="w-3 h-3 fill-amber-500" />
                        Favorita
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Retrial */}
                    {isRecuperada ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Recuperada
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        Pendente
                      </span>
                    )}

                    {/* Data em que errou */}
                    {answer.timestamp && (
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 hidden sm:inline">
                        {new Date(answer.timestamp).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Linha Metacognitiva: Diagnóstico do Erro & Letra Marcada */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 text-xs">
                  {/* Alternativa marcada pelo aluno */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-zinc-400">Você errou marcando:</span>
                    <span className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 font-mono font-bold flex items-center justify-center text-xs border border-rose-500/30">
                      {answer.letter || '?'}
                    </span>
                    <span className="text-slate-400 dark:text-zinc-500 text-[11px]">
                      (Gabarito Oficial: <strong>{q?.correctAnswer || '?'}</strong>)
                    </span>
                  </div>

                  {/* Seletor do Motivo do Erro */}
                  <div className="flex items-center gap-2 justify-start sm:justify-end">
                    <span className="text-slate-500 dark:text-zinc-400 shrink-0">Motivo:</span>
                    <select
                      value={currentReasonKey || 'sem_classificacao'}
                      onChange={(e) => {
                        const val = e.target.value === 'sem_classificacao' ? undefined : (e.target.value as ErrorReasonType);
                        onUpdateAnswerMeta(questionId, { errorReason: val });
                      }}
                      className={`text-xs font-medium px-2.5 py-1 rounded-xl border focus:outline-hidden cursor-pointer ${
                        reasonConfig
                          ? `${reasonConfig.bg} ${reasonConfig.text} ${reasonConfig.border} font-bold`
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200'
                      }`}
                    >
                      <option value="sem_classificacao">Classificar motivo do erro...</option>
                      {Object.entries(ERROR_REASON_CONFIG).map(([k, cfg]) => (
                        <option key={k} value={k}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Enunciado da Questão */}
                <div className="text-slate-900 dark:text-zinc-100 text-xs sm:text-sm leading-relaxed line-clamp-4 font-normal">
                  {q?.statement || 'Carregando enunciado da questão...'}
                </div>

                {/* Treino de Retrial Embutido no Card (Se o usuário clicou em "Refazer") */}
                {isRetrying && q && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        Refazer Questão (Treino Imediato):
                      </span>
                      <button
                        type="button"
                        onClick={() => setRetryingQuestionId(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {q.options?.map((opt) => {
                        const isSelected = selectedRetryOption[questionId] === opt.letter;
                        return (
                          <div
                            key={opt.letter}
                            onClick={() =>
                              setSelectedRetryOption((prev) => ({
                                ...prev,
                                [questionId]: opt.letter
                              }))
                            }
                            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-semibold border-transparent shadow-xs'
                                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-md font-mono font-bold flex items-center justify-center shrink-0 text-[11px] bg-slate-200/50 dark:bg-zinc-800">
                              {opt.letter}
                            </span>
                            <span className="flex-1 leading-relaxed">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setRetryingQuestionId(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={!selectedRetryOption[questionId]}
                        onClick={() => handleQuickRetryAnswer(questionId)}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs disabled:opacity-40"
                        style={{ backgroundColor: accentConfig.primaryHex }}
                      >
                        Confirmar Gabarito
                      </button>
                    </div>
                  </div>
                )}

                {/* Comentário Padrão-Ouro da Banca (Expansível) */}
                {isCommentOpen && q?.commentary && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Comentário Padrão-Ouro & Take-Home Message:
                    </div>
                    <p className="text-xs leading-relaxed text-slate-800 dark:text-zinc-200 whitespace-pre-line font-normal">
                      {q.commentary}
                    </p>
                    {q.takeHomeMessage && (
                      <div className="mt-2 p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-emerald-300/60 dark:border-emerald-700/40 text-xs font-medium text-emerald-950 dark:text-emerald-200">
                        <span className="font-bold">Take-Home Message: </span>
                        {q.takeHomeMessage}
                      </div>
                    )}
                  </div>
                )}

                {/* Bloco de Anotações Pessoais do Aluno (Expansível) */}
                {isNotesOpen && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        Minha Lição Aprendida / Flashcard Mental:
                      </span>
                      {savedNotesAlert[questionId] && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                          ✓ Salvo na sua conta!
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={localNotes[questionId] !== undefined ? localNotes[questionId] : (answer.studentNotes || '')}
                      onChange={(e) =>
                        setLocalNotes((prev) => ({
                          ...prev,
                          [questionId]: e.target.value
                        }))
                      }
                      placeholder="Escreva aqui por que não esquecer esse critério, dosagem, conduta ou armadilha..."
                      className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-amber-300/80 dark:border-amber-700/60 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveNotes(questionId)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer transition-all shadow-xs flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Salvar Nota</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Barra de Ações Rápidas no Rodapé do Card */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botão Ver Comentário */}
                    {q?.commentary && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedComments((prev) => ({
                            ...prev,
                            [questionId]: !prev[questionId]
                          }))
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{isCommentOpen ? 'Recolher Comentário' : 'Ver Comentário da Banca'}</span>
                        {isCommentOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {/* Botão Anotações Pessoais */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedNotes((prev) => ({
                          ...prev,
                          [questionId]: !prev[questionId]
                        }))
                      }
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                        answer.studentNotes
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{answer.studentNotes ? 'Ver Minha Nota' : 'Adicionar Anotação'}</span>
                      {isNotesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botão Revisar às Cegas (Sessão Dedicada com Embaralhamento) */}
                    <button
                      type="button"
                      onClick={() => handleStartNewSession([questionId])}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs hover:scale-102"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Revisar às Cegas</span>
                    </button>

                    {/* Botão Refazer Questão no Card */}
                    {!isRecuperada && (
                      <button
                        type="button"
                        onClick={() => setRetryingQuestionId(isRetrying ? null : questionId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isRetrying ? 'Fechar Treino' : 'Refazer no Card'}</span>
                      </button>
                    )}

                    {/* Toggle Manual de Status (Pendente / Recuperado) */}
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateAnswerMeta(questionId, {
                          statusRetrial: isRecuperada ? 'pendente' : 'recuperado'
                        })
                      }
                      title={isRecuperada ? 'Marcar como pendente novamente' : 'Marcar como dominada/recuperada'}
                      className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                        isRecuperada
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
