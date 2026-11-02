'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Plus,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  FileCheck2,
  Highlighter,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Flag,
  Loader2
} from 'lucide-react';
import {
  Question,
  AdvancedFilterState,
  UserAnswerItem
} from '@/types';
import { AdvancedQuestionFilters } from '@/components/AdvancedQuestionFilters';
import { QuestionCard, HighlighterColor } from '@/components/QuestionCard';
import { SessionPerformanceView } from '@/components/SessionPerformanceView';
import { CreateCadernoModal } from '@/components/CreateCadernoModal';
import { ReportIssueDrawer } from '@/components/ReportIssueDrawer';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useStudentData } from '@/context/StudentDataContext';
import {
  fetchQuestionsFromSupabase,
  fetchTotalQuestionsCount,
  fetchQuestionIdsForListCriteria
} from '@/services/questionService';

export const QuestoesView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { accentConfig } = useTheme();
  const {
    canSolveQuestion,
    incrementDailyCount,
    openUpgradeModal
  } = useSubscription();

  const {
    userAnswers,
    sessionAnswers,
    recordAnswer,
    lists,
    activeListId,
    setActiveListId,
    folders,
    createFolder,
    createListWithFilters,
    addQuestionToFolder,
    fontSize,
    setFontSize
  } = useStudentData();

  // Modo do Banco: 'filtros' | 'resolucao' | 'resultado'
  const initialMode = searchParams.get('mode') === 'resolucao' ? 'resolucao' : 'filtros';
  const [bancoMode, setBancoMode] = useState<'resolucao' | 'filtros' | 'resultado'>(initialMode);

  // Inicializa filtros a partir de query params (se houver)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>(() => {
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const espParam = searchParams.get('especialidade');
    const temaParam = searchParams.get('tema');
    const instParam = searchParams.get('instituicao');
    const anoParam = searchParams.get('ano');

    return {
      search,
      modalidades: ['Residência Médica'],
      especialidades: espParam ? [espParam] : [],
      temas: temaParam ? [temaParam] : [],
      focos: [],
      subfocos: [],
      instituicoes: instParam ? [instParam] : [],
      anos: anoParam ? [parseInt(anoParam, 10)] : [],
      tipoProva: [],
      status: 'Todas',
      dificuldade: 'Todas',
      tipoQuestao: 'Todas',
      ocultarAnuladasErro: false,
      ocultarRevisadas: false,
      ultimos5Anos: false,
      aleatorizar: false
    };
  });

  const [sessionQuestionIds, setSessionQuestionIds] = useState<string[] | null>(null);
  const [sessionQuestionLimit, setSessionQuestionLimit] = useState<number | null>(null);
  const [questionsPage, setQuestionsPage] = useState<number>(1);
  const [supabaseQuestions, setSupabaseQuestions] = useState<Question[]>([]);
  const [totalSupabaseCount, setTotalSupabaseCount] = useState<number>(0);
  const [totalGlobalQuestions, setTotalGlobalQuestions] = useState<number>(133280);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState<boolean>(true);

  // Lê lista ativa dos parâmetros se houver
  useEffect(() => {
    const listIdParam = searchParams.get('listId');
    if (listIdParam) {
      setActiveListId(listIdParam);
      setBancoMode('resolucao');
    }
  }, [searchParams, setActiveListId]);

  // Carrega total global
  useEffect(() => {
    fetchTotalQuestionsCount()
      .then((count) => {
        if (count > 0) setTotalGlobalQuestions(count);
      })
      .catch(() => {});
  }, []);

  // Índice da questão atual
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Temporizadores
  const [questionTimer, setQuestionTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (bancoMode === 'resolucao' && isTimerRunning) {
      interval = setInterval(() => {
        setQuestionTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bancoMode, isTimerRunning]);

  // Ferramentas de leitura
  const [activeHighlighterColor, setActiveHighlighterColor] = useState<HighlighterColor>('yellow');
  const [isStrikethroughActive, setIsStrikethroughActive] = useState<boolean>(false);
  const [isQuestionSequenceOpen, setIsQuestionSequenceOpen] = useState<boolean>(false);

  // Reporte de questões
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);
  const [questionToReport, setQuestionToReport] = useState<Question | null>(null);

  // Modal de Criação de Caderno
  const [isCreateCadernoModalOpen, setIsCreateCadernoModalOpen] = useState(false);
  const [isCreatingListLoading, setIsCreatingListLoading] = useState(false);

  // Busca questões do Supabase com base nos filtros
  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setIsLoadingSupabase(true);
      try {
        let questionIds: string[] | undefined;
        let effectivePageSize = sessionQuestionLimit ? Math.min(200, sessionQuestionLimit) : 50;

        if (activeListId) {
          const currentList = lists.find((l) => l.id === activeListId);
          if (currentList && currentList.questionIds.length > 0) {
            questionIds = currentList.questionIds;
            effectivePageSize = Math.min(200, currentList.questionIds.length);
          }
        } else if (sessionQuestionIds && sessionQuestionIds.length > 0) {
          questionIds = sessionQuestionIds;
          effectivePageSize = Math.min(200, sessionQuestionIds.length);
        }

        const answeredIds = Object.keys(userAnswers);
        const correctIds = Object.entries(userAnswers)
          .filter(([, a]) => a.isCorrect)
          .map(([id]) => id);
        const wrongIds = Object.entries(userAnswers)
          .filter(([, a]) => !a.isCorrect)
          .map(([id]) => id);

        const res = await fetchQuestionsFromSupabase(
          activeListId
            ? {}
            : {
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
          } else {
            setSupabaseQuestions((prev) => {
              const existing = new Set(prev.map((q) => q.id));
              const additions = res.questions.filter((q) => !existing.has(q.id));
              return [...prev, ...additions];
            });
          }
          setTotalSupabaseCount(res.total);
        }
      } catch (err) {
        console.error('Erro ao buscar questões:', err);
      } finally {
        if (!isCancelled) setIsLoadingSupabase(false);
      }
    };

    const timer = setTimeout(load, 350);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    advancedFilters,
    activeListId,
    lists,
    questionsPage,
    sessionQuestionLimit,
    sessionQuestionIds,
    userAnswers
  ]);

  const visibleQuestions = useMemo(() => {
    return supabaseQuestions;
  }, [supabaseQuestions]);

  const currentQuestion = visibleQuestions[Math.min(currentQuestionIndex, visibleQuestions.length - 1)];

  // Resposta da questão com verificação de limites
  const handleAnswer = (questionId: string, selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E', isCorrect: boolean) => {
    if (!canSolveQuestion()) {
      openUpgradeModal(null, true);
      return;
    }
    incrementDailyCount();

    const q = supabaseQuestions.find((item) => item.id === questionId);
    const isAnulada = Boolean(q?.isAnulada || q?.correctAnswer === 'ANULADA');
    const finalIsCorrect = isAnulada ? true : isCorrect;

    recordAnswer(questionId, selectedLetter, finalIsCorrect, {
      difficulty: q?.difficulty || 'Médio',
      specialty: q?.especialidade,
      tema: q?.tema,
      foco: q?.foco,
      subfoco: q?.subfoco,
      banca: q?.banca,
      year: q?.year,
      code: q?.code
    });
  };

  const handleResetFilters = () => {
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
      ultimos5Anos: false,
      aleatorizar: false
    });
    setSessionQuestionIds(null);
    setQuestionsPage(1);
    setCurrentQuestionIndex(0);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Caderno Ativo (se houver) */}
      {activeListId && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/40 p-4 sm:p-5 rounded-3xl flex items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-300 shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-blue-700 dark:text-blue-400">Resolvendo Caderno:</span>
            <strong className="text-slate-900 dark:text-white font-heading text-sm">
              {lists.find((l) => l.id === activeListId)?.title || 'Caderno de Questões'}
            </strong>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveListId(null);
              setBancoMode('filtros');
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/40 font-bold transition-colors cursor-pointer"
          >
            Sair do Caderno
          </button>
        </div>
      )}

      {/* MODO 1: FILTROS SEPARADOS DAS QUESTÕES */}
      {bancoMode === 'filtros' ? (
        <div className="space-y-6">
          <AdvancedQuestionFilters
            filters={advancedFilters}
            onChange={(newFilters) => {
              setAdvancedFilters(newFilters);
              setSessionQuestionIds(null);
              setQuestionsPage(1);
              setCurrentQuestionIndex(0);
            }}
            onReset={handleResetFilters}
            totalAvailable={totalGlobalQuestions}
            totalFiltered={totalSupabaseCount}
            isLoading={isLoadingSupabase}
            onCreateListFromFilter={() => setIsCreateCadernoModalOpen(true)}
            onSelectDirectQuestion={(questionId) => {
              const idx = visibleQuestions.findIndex((q) => q.id === questionId);
              if (idx !== -1) {
                setCurrentQuestionIndex(idx);
              }
              setBancoMode('resolucao');
            }}
            onStartSequentialSolving={async (limit, quotas, explicitFilters) => {
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
                  const fullRes = await fetchQuestionsFromSupabase(
                    activeFilters,
                    1,
                    finalLimit,
                    balancedIds
                  );
                  if (fullRes.questions?.length > 0) {
                    setSupabaseQuestions(fullRes.questions);
                  }
                }
              } catch (e) {
                console.error(e);
              } finally {
                setIsLoadingSupabase(false);
              }

              setBancoMode('resolucao');
            }}
          />
        </div>
      ) : bancoMode === 'resultado' ? (
        /* MODO 3: TELA DE RESULTADOS */
        <SessionPerformanceView
          questions={visibleQuestions}
          userAnswers={userAnswers}
          onReturnToFilters={() => setBancoMode('filtros')}
          onReviewAll={() => {
            setBancoMode('resolucao');
            setCurrentQuestionIndex(0);
            setQuestionTimer(0);
          }}
          onNavigateToQuestion={(questionId) => {
            const qIdx = visibleQuestions.findIndex((itemQ) => itemQ.id === questionId);
            if (qIdx !== -1) {
              setCurrentQuestionIndex(qIdx);
              setBancoMode('resolucao');
              setQuestionTimer(0);
            }
          }}
        />
      ) : (
        /* MODO 2: RESOLUÇÃO SEQUENCIAL QUESTÃO A QUESTÃO */
        <div className="space-y-5 animate-in fade-in duration-200">
          {visibleQuestions.length > 0 ? (
            <>
              {/* BARRA SUPERIOR SEQUENCIAL */}
              <div className="sticky top-[4.5rem] z-20 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/80 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm flex flex-col gap-2.5 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Esquerda: Voltar para Filtros + Temporizador */}
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setBancoMode('filtros')}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
                      title="Voltar aos Filtros"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    {/* Temporizador */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTimer(questionTimer)}</span>
                      <button
                        type="button"
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white ml-1 cursor-pointer"
                      >
                        {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* Régua retrátil toggle */}
                    <button
                      type="button"
                      onClick={() => setIsQuestionSequenceOpen(!isQuestionSequenceOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{isQuestionSequenceOpen ? 'Ocultar Régua' : 'Ver Régua'}</span>
                    </button>
                  </div>

                  {/* Direita: Finalizar Sessão */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBancoMode('resultado')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-transform hover:scale-102 cursor-pointer flex items-center gap-1.5"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Finalizar Treino</span>
                    </button>
                  </div>
                </div>

                {/* Régua expansível de navegação direta */}
                {isQuestionSequenceOpen && (
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto py-1">
                    {visibleQuestions.map((q, idx) => {
                      const isCur = idx === currentQuestionIndex;
                      const hasAns = sessionAnswers[q.id];
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => {
                            setCurrentQuestionIndex(idx);
                            setQuestionTimer(0);
                          }}
                          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold shrink-0 transition-colors cursor-pointer ${
                            isCur
                              ? 'text-white'
                              : hasAns
                              ? hasAns.isCorrect
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                          }`}
                          style={isCur ? { backgroundColor: accentConfig.primaryHex } : undefined}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CARD DA QUESTÃO ATUAL */}
              {currentQuestion && (
                <QuestionCard
                  key={currentQuestion.id}
                  question={currentQuestion}
                  index={currentQuestionIndex}
                  total={visibleQuestions.length}
                  onAnswer={handleAnswer}
                  userAnswer={sessionAnswers[currentQuestion.id]?.letter}
                  historicalAnswer={
                    userAnswers[currentQuestion.id]
                      ? {
                          letter: userAnswers[currentQuestion.id].letter,
                          isCorrect: userAnswers[currentQuestion.id].isCorrect,
                          timestamp: userAnswers[currentQuestion.id].timestamp
                        }
                      : undefined
                  }
                  fontSize={fontSize}
                  onChangeFontSize={setFontSize}
                  folders={folders}
                  onCreateFolder={createFolder}
                  onSaveToFolder={async (qId, fId) => {
                    const f = folders.find((item) => item.id === fId);
                    if (f) await addQuestionToFolder(qId, fId, f.name);
                  }}
                  activeHighlighterColor={activeHighlighterColor}
                  onSelectHighlighterColor={setActiveHighlighterColor}
                  isStrikethroughActive={isStrikethroughActive}
                  onToggleStrikethrough={() => setIsStrikethroughActive((prev) => !prev)}
                />
              )}

              {/* BARRA INFERIOR DE NAVEGAÇÃO ENTRE QUESTÕES */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => {
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                    setQuestionTimer(0);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold text-center">
                  Questão <strong className="text-slate-900 dark:text-white font-black text-sm">{currentQuestionIndex + 1}</strong> de <strong className="text-slate-900 dark:text-white font-black text-sm">{visibleQuestions.length}</strong>
                </div>

                {currentQuestionIndex >= visibleQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setBancoMode('resultado')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white shadow-md hover:scale-102 transition-transform cursor-pointer"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    <span>Ver Resultado</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQuestionIndex((prev) => Math.min(visibleQuestions.length - 1, prev + 1));
                      setQuestionTimer(0);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white shadow-md hover:scale-102 transition-transform cursor-pointer"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    <span>Próxima</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-3">
              {isLoadingSupabase ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-xs font-bold text-slate-500">Carregando questões do banco...</p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-10 h-10 mx-auto text-amber-500" />
                  <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                    Nenhuma questão encontrada
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Não encontramos questões para a combinação de filtros selecionada. Tente ampliar as bancas ou especialidades.
                  </p>
                  <button
                    type="button"
                    onClick={() => setBancoMode('filtros')}
                    className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Ajustar Filtros
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação de Caderno */}
      <CreateCadernoModal
        isOpen={isCreateCadernoModalOpen}
        onClose={() => setIsCreateCadernoModalOpen(false)}
        filters={advancedFilters}
        folders={folders}
        onCreateFolder={createFolder}
        onConfirmCreate={async (config) => {
          setIsCreatingListLoading(true);
          try {
            const newList = await createListWithFilters(
              config.title,
              config.folderId,
              config.totalQuestions,
              advancedFilters
            );
            setIsCreateCadernoModalOpen(false);
            if (config.startSolvingImmediately && newList) {
              setActiveListId(newList.id);
              setBancoMode('resolucao');
            }
          } finally {
            setIsCreatingListLoading(false);
          }
        }}
        availableQuestionsCount={totalSupabaseCount}
        isGenerating={isCreatingListLoading}
      />

      {/* Drawer de Reporte de Problemas */}
      {questionToReport && (
        <ReportIssueDrawer
          isOpen={isReportDrawerOpen}
          onClose={() => {
            setIsReportDrawerOpen(false);
            setQuestionToReport(null);
          }}
          question={questionToReport}
          user={user}
        />
      )}
    </div>
  );
};

