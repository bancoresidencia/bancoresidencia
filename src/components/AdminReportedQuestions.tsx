'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Eye,
  Edit3,
  X
} from 'lucide-react';
import { QuestionReport, ReportStatus, QuestionOption, Question } from '@/types';
import {
  fetchReportedQuestionsForAdmin,
  updateQuestionReportStatus
} from '@/services/questionService';
import { useTheme } from '@/context/ThemeContext';

interface StagingState {
  reportId: string;
  questionId: string;
  newLetter: string;
  commentary: string;
  options: QuestionOption[];
  isGenerating: boolean;
  isAiGenerated?: boolean;
  activeTab: 'preview' | 'edit';
  error?: string | null;
}

const renderFormattedText = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-zinc-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export const AdminReportedQuestions: React.FC = () => {
  const { accentConfig } = useTheme();

  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Estado de Curadoria e Homologação de Gabarito com Prévia
  const [staging, setStaging] = useState<StagingState | null>(null);
  const [isSavingStaging, setIsSavingStaging] = useState<boolean>(false);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await fetchReportedQuestionsForAdmin('all');
      setReports(data);
    } catch (err) {
      console.error('Erro ao buscar reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Contadores para KPIs
  const counts = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === 'pending').length;
    const inProgress = reports.filter((r) => r.status === 'in_progress').length;
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    const dismissed = reports.filter((r) => r.status === 'dismissed').length;
    return { total, pending, inProgress, resolved, dismissed };
  }, [reports]);

  // Filtro por tab de status e busca textual
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      if (selectedStatusTab !== 'all' && rep.status !== selectedStatusTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = rep.question?.code?.toLowerCase().includes(q);
        const matchBanca = rep.question?.banca?.toLowerCase().includes(q) || rep.question?.institution?.toLowerCase().includes(q);
        const matchDetails = rep.details.toLowerCase().includes(q);
        const matchReason = rep.reason.toLowerCase().includes(q);
        const matchStudent = (rep.userName || '').toLowerCase().includes(q) || (rep.userEmail || '').toLowerCase().includes(q);
        if (!matchCode && !matchBanca && !matchDetails && !matchReason && !matchStudent) {
          return false;
        }
      }
      return true;
    });
  }, [reports, selectedStatusTab, searchQuery]);

  const handleUpdateStatus = async (reportId: string, status: ReportStatus, note?: string) => {
    const res = await updateQuestionReportStatus(reportId, status, note);
    if (res.success) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status, adminNotes: note || r.adminNotes, resolvedAt: status === 'resolved' ? new Date().toISOString() : r.resolvedAt }
            : r
        )
      );
      setActionSuccessMsg(`Report marcado como "${status}".`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    }
  };

  // Inicia o processo de homologação: seleciona a nova alternativa e gera o comentário clínico
  const handleStartGabaritoStaging = async (report: QuestionReport, newLetter: string) => {
    const q = report.question;
    const initialOptions = q?.options && q.options.length > 0 ? q.options.map((o) => ({ ...o })) : [];

    setExpandedQuestionId(report.id);
    setStaging({
      reportId: report.id,
      questionId: report.questionId,
      newLetter,
      commentary: q?.commentary || '',
      options: initialOptions,
      isGenerating: true,
      activeTab: 'preview',
      error: null
    });

    try {
      const res = await fetch('/api/admin/curadoria/generate-commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: report.questionId,
          statement: q?.statement || '',
          options: initialOptions,
          newCorrectAnswer: newLetter,
          institution: q?.institution || q?.banca,
          banca: q?.banca,
          year: q?.year,
          especialidade: q?.especialidade,
          tema: q?.tema,
          studentNotes: report.details,
          currentCommentary: q?.commentary || ''
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStaging((prev) =>
          prev && prev.reportId === report.id
            ? {
                ...prev,
                commentary: data.commentary || prev.commentary,
                options: data.options || prev.options,
                isGenerating: false,
                isAiGenerated: data.isAiGenerated
              }
            : prev
        );
      } else {
        setStaging((prev) =>
          prev && prev.reportId === report.id
            ? { ...prev, isGenerating: false, error: data.error || 'Erro ao gerar comentário.' }
            : prev
        );
      }
    } catch (err: unknown) {
      console.error('Erro ao gerar comentário:', err);
      setStaging((prev) =>
        prev && prev.reportId === report.id
          ? { ...prev, isGenerating: false, error: 'Erro de conexão com o motor de comentário.' }
          : prev
      );
    }
  };

  // Confirma e salva o novo gabarito, alternativas e comentário no Supabase
  const handleConfirmAndSaveToSupabase = async () => {
    if (!staging) return;
    setIsSavingStaging(true);

    try {
      const res = await fetch('/api/admin/curadoria/update-gabarito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: staging.questionId,
          correctAnswer: staging.newLetter,
          isAnulada: staging.newLetter === 'ANULADA',
          commentary: staging.commentary,
          options: staging.options,
          reportId: staging.reportId
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setReports((prev) =>
          prev.map((r) => {
            if (r.id === staging.reportId) {
              return {
                ...r,
                status: 'resolved',
                adminNotes: `Gabarito retificado para [${staging.newLetter}] e comentário padrão-ouro homologado pelo administrador.`,
                resolvedAt: new Date().toISOString(),
                question: {
                  ...r.question,
                  correctAnswer: staging.newLetter as Question['correctAnswer'],
                  commentary: staging.commentary,
                  options: staging.options,
                  isAnulada: staging.newLetter === 'ANULADA'
                }
              };
            }
            return r;
          })
        );

        // Sincroniza em tempo real com a aba "Banco de Questões" na mesma sessão
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('bancoresidencia_question_updated', {
              detail: {
                questionId: staging.questionId,
                correctAnswer: staging.newLetter,
                commentary: staging.commentary,
                options: staging.options,
                isAnulada: staging.newLetter === 'ANULADA'
              }
            })
          );
        }

        setActionSuccessMsg(`Gabarito da questão atualizado para "${staging.newLetter}" e novo comentário salvo com sucesso no Supabase!`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        setStaging(null);
      } else {
        alert(data.error || 'Erro ao salvar gabarito e comentário no Supabase.');
      }
    } catch {
      alert('Erro de conexão ao salvar gabarito no Supabase.');
    } finally {
      setIsSavingStaging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Header do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Auditoria de Questões Reportadas
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Acesso Restrito Admin
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Gerencie apontamentos de gabarito divergente, enunciados e erros enviados pelos estudantes durante a resolução.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadReports}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Grid de KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setSelectedStatusTab('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatusTab === 'all'
              ? 'border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800/80 shadow-xs'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
          }`}
        >
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">Total Geral</span>
          <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white mt-1 block">
            {counts.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('pending')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatusTab === 'pending'
              ? 'border-amber-500 bg-amber-500/10 shadow-xs'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
          }`}
        >
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Pendentes</span>
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
            {counts.pending}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('in_progress')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatusTab === 'in_progress'
              ? 'border-blue-500 bg-blue-500/10 shadow-xs'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
          }`}
        >
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Em Análise</span>
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block">
            {counts.inProgress}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('resolved')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatusTab === 'resolved'
              ? 'border-emerald-500 bg-emerald-500/10 shadow-xs'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
          }`}
        >
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Resolvidos</span>
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {counts.resolved}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('dismissed')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatusTab === 'dismissed'
              ? 'border-zinc-500 bg-zinc-500/10 shadow-xs'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
          }`}
        >
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <XCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Descartados</span>
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-zinc-700 dark:text-zinc-300 mt-1 block">
            {counts.dismissed}
          </span>
        </button>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800">
        <Search className="w-4 h-4 text-zinc-400 shrink-0 ml-1.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filtrar por código da questão, banca, aluno ou palavra-chave no comentário..."
          className="w-full bg-transparent text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer pr-1"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Lista de Reports */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-400" />
          <span>Carregando denúncias e apontamentos...</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Nenhum report pendente nesta categoria</h4>
          <p className="text-xs max-w-md mx-auto">
            Todas as questões reportadas pelos alunos para o filtro selecionado foram auditadas ou não há novos apontamentos.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const isExpanded = expandedQuestionId === report.id;
            const q = report.question;

            return (
              <div
                key={report.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 transition-all"
              >
                {/* Linha Superior: Cabeçalho do Card */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">
                        {q?.institution || q?.banca || 'Questão'} {q?.year || ''}
                      </span>
                      {q?.code && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                          #{q.code}
                        </span>
                      )}
                      {q?.especialidade && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {q.especialidade}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Reportado por <strong className="text-zinc-700 dark:text-zinc-300">{report.userName || 'Estudante'}</strong>
                      {report.userEmail ? ` (${report.userEmail})` : ''} em {new Date(report.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  {/* Badges de Status e Categoria */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {report.reason}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        report.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : report.status === 'in_progress'
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                          : report.status === 'dismissed'
                          ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}
                    >
                      {report.status === 'resolved'
                        ? 'Resolvido'
                        : report.status === 'in_progress'
                        ? 'Em Análise'
                        : report.status === 'dismissed'
                        ? 'Descartado'
                        : 'Pendente'}
                    </span>
                  </div>
                </div>

                {/* Comentário e Apontamento do Estudante */}
                <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Apontamento do Aluno:</span>
                  </div>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                    &ldquo;{report.details}&rdquo;
                  </p>
                </div>

                {/* Gabarito atual registrado no sistema */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-zinc-500 dark:text-zinc-400">Gabarito Atual no Banco:</span>
                  <span className="w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs">
                    {q?.correctAnswer || 'N/D'}
                  </span>

                  <button
                    type="button"
                    onClick={() => setExpandedQuestionId(isExpanded ? null : report.id)}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer ml-auto"
                  >
                    <span>{isExpanded ? 'Ocultar Questão' : 'Ver Enunciado Completo'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Visualizador do Enunciado e Alternativas Colapsável */}
                {isExpanded && q && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs animate-in slide-in-from-top-2 duration-150">
                    <div>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Enunciado:</span>
                      <p className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                        {q.statement}
                      </p>
                    </div>

                    {q.options && q.options.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 block">Alternativas:</span>
                        {q.options.map((opt) => (
                          <div
                            key={opt.letter}
                            className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                              opt.letter === q.correctAnswer
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-semibold'
                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 shrink-0">
                              {opt.letter}
                            </span>
                            <span className="flex-1">{opt.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Ações Administrativas de Auditoria */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                  {/* Seletor de Nova Alternativa Correta para Homologação */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mr-1">
                      Corrigir Gabarito:
                    </span>
                    {(['A', 'B', 'C', 'D', 'E', 'ANULADA'] as const).map((letra) => {
                      const isStaged = staging && staging.reportId === report.id && staging.newLetter === letra;
                      const isCurrentDb = q?.correctAnswer === letra;

                      return (
                        <button
                          key={letra}
                          type="button"
                          onClick={() => handleStartGabaritoStaging(report, letra)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isStaged
                              ? 'bg-amber-500 text-white ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-zinc-900 shadow-sm'
                              : isCurrentDb
                              ? 'bg-emerald-500 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                          }`}
                          title={`Selecionar [${letra}], recriar comentário e visualizar prévia antes de salvar`}
                        >
                          {isStaged && <Sparkles className="w-3 h-3 animate-pulse" />}
                          <span>{letra}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Botões de Transição de Status */}
                  <div className="flex items-center gap-2">
                    {report.status !== 'in_progress' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(report.id, 'in_progress')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer"
                      >
                        Em Análise
                      </button>
                    )}
                    {report.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(report.id, 'resolved')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer shadow-xs"
                      >
                        Marcar Resolvido
                      </button>
                    )}
                    {report.status !== 'dismissed' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                      >
                        Descartar
                      </button>
                    )}
                  </div>
                </div>

                {/* PAINEL DE CURADORIA, PRÉVIA DA QUESTÃO E HOMOLOGAÇÃO */}
                {staging && staging.reportId === report.id && (
                  <div className="mt-4 p-5 rounded-3xl bg-amber-500/5 dark:bg-[#18181b] border-2 border-amber-500/30 space-y-4 shadow-lg animate-in slide-in-from-top-3 duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span>Prévia de Homologação: Novo Gabarito</span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-mono text-xs font-extrabold shadow-xs">
                              [{staging.newLetter}]
                            </span>
                          </h4>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {staging.isGenerating
                              ? 'Reconstruindo raciocínio clínico e justificativas padrão-ouro...'
                              : staging.isAiGenerated
                              ? 'Comentário médico reconstruído automaticamente com base no novo gabarito'
                              : 'Estrutura padrão-ouro formatada para o novo gabarito (pronta para revisão)'}
                          </p>
                        </div>
                      </div>

                      {/* Alternador de Abas de Prévia / Edição */}
                      {!staging.isGenerating && (
                        <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-800 p-1 rounded-xl self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setStaging({ ...staging, activeTab: 'preview' })}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              staging.activeTab === 'preview'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Prévia da Questão</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStaging({ ...staging, activeTab: 'edit' })}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              staging.activeTab === 'edit'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar Comentário</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {staging.error && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{staging.error}</span>
                      </div>
                    )}

                    {staging.isGenerating ? (
                      <div className="py-8 px-4 text-center space-y-3 bg-white/60 dark:bg-zinc-900/40 rounded-2xl border border-amber-500/20">
                        <RotateCcw className="w-7 h-7 animate-spin mx-auto text-amber-500" />
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          Processando justificativas das alternativas e síntese clínica para a Alternativa [{staging.newLetter}]...
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                          Destacando trechos incorretos nos distratores e fundamentando a nova conduta correta de acordo com as diretrizes oficiais.
                        </p>
                      </div>
                    ) : staging.activeTab === 'preview' ? (
                      <div className="space-y-4">
                        {/* Enunciado da Questão */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs shadow-xs">
                          <span className="font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5 uppercase text-[10px] tracking-wider">
                            Enunciado Oficial
                          </span>
                          <p className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                            {q?.statement}
                          </p>
                        </div>

                        {/* Alternativas com Destaque do Novo Gabarito e Justificativas */}
                        <div className="space-y-2">
                          <span className="font-bold text-zinc-500 dark:text-zinc-400 block text-[10px] uppercase tracking-wider">
                            Alternativas & Justificativas Retificadas:
                          </span>
                          {staging.options.map((opt) => {
                            const isTarget = opt.letter.toUpperCase() === staging.newLetter.toUpperCase();

                            return (
                              <div
                                key={opt.letter}
                                className={`p-3.5 rounded-2xl border transition-all ${
                                  isTarget
                                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 shadow-xs'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200'
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <span
                                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                      isTarget
                                        ? 'bg-emerald-600 text-white font-mono shadow-xs'
                                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono'
                                    }`}
                                  >
                                    {opt.letter}
                                  </span>
                                  <div className="flex-1 space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-medium leading-relaxed">{opt.text}</span>
                                      <span
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                                          isTarget
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                                        }`}
                                      >
                                        {isTarget ? 'NOVO GABARITO HOMOLOGADO' : 'DISTRATOR / INCORRETA'}
                                      </span>
                                    </div>

                                    {opt.explanation && (
                                      <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-[11.5px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                                        {renderFormattedText(opt.explanation)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Síntese Clínica & Comentário Unificado */}
                        {staging.commentary && (
                          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs shadow-xs">
                            <span className="font-bold text-zinc-500 dark:text-zinc-400 block uppercase text-[10px] tracking-wider">
                              Comentário Clínico Padrão-Ouro (Visão do Estudante)
                            </span>
                            <div className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                              {renderFormattedText(staging.commentary)}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Aba de Edição Manual do Comentário */
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Comentário Geral e Síntese Clínica (Editável):
                          </label>
                          <textarea
                            rows={8}
                            value={staging.commentary}
                            onChange={(e) => setStaging({ ...staging, commentary: e.target.value })}
                            className="w-full p-3.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                            placeholder="Escreva ou ajuste a fundamentação clínica..."
                          />
                        </div>

                        <div className="space-y-2.5 pt-2 border-t border-amber-500/20">
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            Explicação Específica por Alternativa:
                          </label>
                          {staging.options.map((opt, oIdx) => (
                            <div key={opt.letter} className="flex items-start gap-2.5">
                              <span
                                className={`w-6 h-6 mt-1 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                                  opt.letter.toUpperCase() === staging.newLetter.toUpperCase()
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                                }`}
                              >
                                {opt.letter}
                              </span>
                              <input
                                type="text"
                                value={opt.explanation || ''}
                                onChange={(e) => {
                                  const newOpts = [...staging.options];
                                  newOpts[oIdx] = { ...newOpts[oIdx], explanation: e.target.value };
                                  setStaging({ ...staging, options: newOpts });
                                }}
                                placeholder={`Justificativa para alternativa ${opt.letter}...`}
                                className="flex-1 p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Barra de Ações Inferior de Homologação */}
                    <div className="pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartGabaritoStaging(report, staging.newLetter)}
                          disabled={staging.isGenerating || isSavingStaging}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${staging.isGenerating ? 'animate-spin' : ''}`} />
                          <span>Regenerar Comentário</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStaging(null)}
                          disabled={isSavingStaging}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancelar</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmAndSaveToSupabase}
                        disabled={staging.isGenerating || isSavingStaging}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSavingStaging ? (
                          <>
                            <RotateCcw className="w-4 h-4 animate-spin" />
                            <span>Salvando no Supabase...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirmar e Salvar no Supabase</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
