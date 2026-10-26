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
  Zap
} from 'lucide-react';
import { UserAnswerItem, ErrorReasonType, Question } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { fetchQuestionsFromSupabase } from '@/services/questionService';

const SIX_SPECIALTIES = [
  'Todas',
  'Clínica Médica',
  'Cirurgia Geral',
  'Pediatria',
  'Ginecologia',
  'Obstetrícia',
  'Medicina Preventiva e Social'
];

import { CadernoErrosReviewSession } from './CadernoErrosReviewSession';
import { ERROR_REASON_CONFIG } from '@/utils/errorReasons';
export { ERROR_REASON_CONFIG };

interface CadernoDeErrosProps {
  userAnswers: Record<string, UserAnswerItem>;
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
  onUpdateAnswerMeta,
  onAnswerQuestion,
  onStartTreinoErros,
  onNavigateToBanco
}) => {
  const { accentConfig } = useTheme();

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
  const [reviewSessionQuestionIds, setReviewSessionQuestionIds] = useState<string[] | null>(null);

  // 1. Coleta todas as entradas de respostas que foram erradas (ou marcadas no caderno de erros)
  const errorEntries = useMemo(() => {
    return Object.entries(userAnswers)
      .filter(([, ans]) => !ans.isCorrect || ans.statusRetrial === 'recuperado')
      .map(([qid, ans]) => ({
        questionId: qid,
        answer: ans
      }));
  }, [userAnswers]);

  // Carrega as questões completas em lote a partir dos IDs errados que ainda não estão em cache
  useEffect(() => {
    const missingIds = errorEntries
      .map((e) => e.questionId)
      .filter((id) => !questionsMap[id]);

    if (missingIds.length === 0) return;

    let isMounted = true;
    setIsLoadingQuestions(true);

    // Carrega em lotes de até 100 para evitar queries gigantes
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
      .catch((err) => console.error('Erro ao carregar detalhes das questões erradas:', err))
      .finally(() => {
        if (isMounted) setIsLoadingQuestions(false);
      });

    return () => {
      isMounted = false;
    };
  }, [errorEntries, questionsMap]);

  // 2. Estatísticas Consolidadas do Caderno de Erros
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

  // 3. Filtragem e Ordenação da Lista
  const filteredEntries = useMemo(() => {
    const result = errorEntries.filter((e) => {
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
  }, [errorEntries, questionsMap, selectedStatus, selectedSpecialty, selectedReason, searchQuery, sortBy]);

  // Manipulador de salvar anotação pessoal do aluno
  const handleSaveNotes = (questionId: string) => {
    const text = localNotes[questionId];
    if (text === undefined) return;
    onUpdateAnswerMeta(questionId, { studentNotes: text.trim() });
    setSavedNotesAlert((prev) => ({ ...prev, [questionId]: true }));
    setTimeout(() => {
      setSavedNotesAlert((prev) => ({ ...prev, [questionId]: false }));
    }, 2000);
  };

  // Re-responder a questão diretamente no card para recuperação ativa
  const handleConfirmRetry = (questionId: string) => {
    const q = questionsMap[questionId];
    const selected = selectedRetryOption[questionId];
    if (!q || !selected) return;

    const isCorrect = q.correctAnswer === selected || q.correctAnswer === 'ANULADA';
    onAnswerQuestion(questionId, selected, isCorrect);

    if (isCorrect) {
      onUpdateAnswerMeta(questionId, { statusRetrial: 'recuperado' });
    }

    setRetryingQuestionId(null);
  };

  // Se o aluno iniciou uma Sessão de Revisão Ativa às Cegas, exibe a interface focada de teste
  if (reviewSessionQuestionIds && reviewSessionQuestionIds.length > 0) {
    return (
      <CadernoErrosReviewSession
        questionIds={reviewSessionQuestionIds}
        questionsMap={questionsMap}
        userAnswers={userAnswers}
        onAnswerQuestion={onAnswerQuestion}
        onUpdateAnswerMeta={onUpdateAnswerMeta}
        onClose={() => setReviewSessionQuestionIds(null)}
        onNavigateToBanco={onNavigateToBanco}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header do Caderno de Erros com Visual de Excelência Médica */}
      <div className="bg-white dark:bg-[var(--bg-card)] border border-slate-200 dark:border-zinc-800/80 p-5 sm:p-6 rounded-3xl shadow-xs">
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
              <AlertOctagon className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                  Caderno de Erros
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                  Recuperação Ativa
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Avalie cada questão errada, classifique a causa do erro e domine seus pontos fracos para não errar na prova.
              </p>
            </div>
          </div>

          {/* Botão de Ação Rápida: Iniciar Lista de Revisão Ativa às Cegas */}
          {filteredEntries.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setReviewSessionQuestionIds(filteredEntries.map((e) => e.questionId))}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  boxShadow: `0 6px 16px -4px ${accentConfig.bgRgba}`
                }}
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Iniciar Revisão às Cegas ({filteredEntries.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Mini-KPIs em Cards de Alta Densidade */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
              Erros Mapeados
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-zinc-100 mt-0.5">
              {statsSummary.total}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">questões registradas na conta</span>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Pendentes de Acerto
            </span>
            <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5">
              {statsSummary.pendentes}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">precisam ser refeitas</span>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Já Recuperadas
            </span>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {statsSummary.recuperadas}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">acertadas em re-tentativa</span>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
              Taxa de Superação
            </span>
            <div
              className="text-2xl font-black font-mono mt-0.5"
              style={{ color: accentConfig.primaryHex }}
            >
              {statsSummary.taxaRecuperacao.toFixed(0)}%
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">dos erros já foram dominados</span>
          </div>
        </div>
      </div>

      {/* 3. Barra de Filtros: Especialidades, Status, Motivo e Busca */}
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
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                Todas ({statsSummary.total})
              </button>
            </div>

            {/* Dropdown Filtro por Motivo do Erro */}
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 focus:outline-hidden cursor-pointer"
            >
              <option value="todos">Todos os Motivos</option>
              <option value="sem_classificacao">Sem Classificação ({statsSummary.byReason.sem_classificacao})</option>
              {Object.entries(ERROR_REASON_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label} ({statsSummary.byReason[key] || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Campo de Busca Rápida */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar banca, tema, código..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Ordenação */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recentes' | 'antigas' | 'especialidade')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 focus:outline-hidden cursor-pointer"
            >
              <option value="recentes">Mais recentes</option>
              <option value="antigas">Mais antigas</option>
              <option value="especialidade">Por Especialidade</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Lista dos Cards de Erro */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white dark:bg-[var(--bg-card)] border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {errorEntries.length === 0
              ? 'Nenhum erro registrado na sua conta ainda!'
              : 'Nenhuma questão encontrada com os filtros selecionados.'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            {errorEntries.length === 0
              ? 'Conforme você resolver questões no Banco de Questões, qualquer erro cometido será salvo aqui automaticamente para você diagnosticar e revisar.'
              : 'Experimente limpar os filtros de especialidade, status ou busca para visualizar outras questões erradas.'}
          </p>
          {errorEntries.length === 0 ? (
            <button
              type="button"
              onClick={() => onNavigateToBanco()}
              className="mt-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-102"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              Ir para o Banco de Questões
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSelectedSpecialty('Todas');
                setSelectedStatus('todos');
                setSelectedReason('todos');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const { questionId, answer } = entry;
            const q = questionsMap[questionId];
            const isRecuperada = answer.statusRetrial === 'recuperado';
            const isCommentOpen = !!expandedComments[questionId];
            const isNotesOpen = !!expandedNotes[questionId];
            const isRetrying = retryingQuestionId === questionId;
            const currentRetryOption = selectedRetryOption[questionId];

            const currentReasonKey = answer.errorReason;
            const currentReason = currentReasonKey ? ERROR_REASON_CONFIG[currentReasonKey] : null;

            const dateStr = answer.timestamp
              ? new Date(answer.timestamp).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
              : 'Data recente';

            return (
              <div
                key={questionId}
                className={`bg-white dark:bg-[var(--bg-card)] border rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-xs space-y-4 ${
                  isRecuperada
                    ? 'border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/[0.02]'
                    : 'border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Cabeçalho do Card */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Badge Status do Erro */}
                    {isRecuperada ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Recuperada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Pendente de Acerto
                      </span>
                    )}

                    {/* Badge da Banca & Ano */}
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800/60 px-2.5 py-0.5 rounded-md border border-slate-200/60 dark:border-zinc-700/60">
                      {q?.banca || answer.banca || 'Banca Oficial'} • {q?.year || answer.year || '2025'}
                    </span>

                    {/* Código da Questão */}
                    {(q?.code || answer.code) && (
                      <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 font-semibold">
                        #{q?.code || answer.code}
                      </span>
                    )}

                    {/* Especialidade / Tema / Subfoco */}
                    <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                      {answer.specialty || q?.especialidade}
                      {(answer.tema || q?.tema) && ` • ${answer.tema || q?.tema}`}
                      {(answer.subfoco || q?.subfoco) && ` > ${answer.subfoco || q?.subfoco}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{dateStr}</span>
                  </div>
                </div>

                {/* Enunciado da Questão */}
                <div className="text-slate-900 dark:text-zinc-100 text-xs sm:text-sm leading-relaxed font-normal">
                  {q?.statement ? (
                    <p className="whitespace-pre-line line-clamp-4 hover:line-clamp-none transition-all">
                      {q.statement}
                    </p>
                  ) : (
                    <p className="text-slate-400 dark:text-zinc-500 italic">
                      {isLoadingQuestions ? 'Carregando enunciado da questão...' : 'Enunciado disponível na resolução.'}
                    </p>
                  )}
                </div>

                {/* Bloco Comparativo Visual: Resposta do Aluno vs Gabarito Oficial */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/60 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold font-mono flex items-center justify-center shrink-0">
                      {answer.previousLetter || answer.letter}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                        {answer.previousLetter ? 'Você Havia Marcado Antes' : 'Você Marcou'}
                      </span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        Alternativa {answer.previousLetter || answer.letter} (Incorreta)
                      </span>
                      {answer.previousLetter && isRecuperada && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold mt-0.5">
                          ✓ Superada na revisão (Alternativa {answer.letter})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold font-mono flex items-center justify-center shrink-0">
                      {q?.correctAnswer || '?'}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                        Gabarito Oficial
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Alternativa {q?.correctAnswer || 'Oficial da Banca'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seletor Metacognitivo: Motivo do Erro */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-slate-400" />
                      Classificação Metacognitiva (Por que você errou?):
                    </span>
                    {currentReason && (
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 italic">
                        {currentReason.desc}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {Object.entries(ERROR_REASON_CONFIG).map(([reasonKey, config]) => {
                      const isSelected = currentReasonKey === reasonKey;
                      return (
                        <button
                          key={reasonKey}
                          type="button"
                          onClick={() => {
                            const next = isSelected ? undefined : (reasonKey as ErrorReasonType);
                            onUpdateAnswerMeta(questionId, { errorReason: next });
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                            isSelected
                              ? `${config.bg} ${config.text} ${config.border} shadow-xs font-bold scale-102`
                              : 'bg-slate-100/70 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400 border-slate-200/70 dark:border-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200'
                          }`}
                        >
                          <span>{config.icon}</span>
                          <span>{config.label}</span>
                          {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Área de Re-tentativa Interativa no Próprio Card */}
                {isRetrying && q?.options && q.options.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                        Tente responder novamente agora:
                      </span>
                      <button
                        type="button"
                        onClick={() => setRetryingQuestionId(null)}
                        className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Fechar
                      </button>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isChosen = currentRetryOption === opt.letter;
                        return (
                          <div
                            key={opt.letter}
                            onClick={() =>
                              setSelectedRetryOption((prev) => ({
                                ...prev,
                                [questionId]: opt.letter
                              }))
                            }
                            className={`p-3 rounded-xl border text-xs flex items-start gap-3 cursor-pointer transition-all ${
                              isChosen
                                ? 'bg-white dark:bg-zinc-800 border-slate-900 dark:border-white shadow-xs font-medium'
                                : 'bg-white/60 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-md font-mono font-bold flex items-center justify-center shrink-0 text-xs ${
                                isChosen
                                  ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
                                  : 'bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200'
                              }`}
                            >
                              {opt.letter}
                            </span>
                            <span className="leading-relaxed pt-0.5">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setRetryingQuestionId(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={!currentRetryOption}
                        onClick={() => handleConfirmRetry(questionId)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                          currentRetryOption
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                            : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Confirmar Nova Resposta
                      </button>
                    </div>
                  </div>
                )}

                {/* Comentário do Professor & Justificativa Completa (Expansível) */}
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
                    {/* Botão Revisar às Cegas (Sessão Dedicada sem Spoilers) */}
                    <button
                      type="button"
                      onClick={() => setReviewSessionQuestionIds([questionId])}
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
