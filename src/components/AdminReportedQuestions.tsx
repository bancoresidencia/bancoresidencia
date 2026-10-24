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
  ShieldCheck
} from 'lucide-react';
import { QuestionReport, ReportStatus } from '@/types';
import {
  fetchReportedQuestionsForAdmin,
  updateQuestionReportStatus
} from '@/services/questionService';
import { useTheme } from '@/context/ThemeContext';

export const AdminReportedQuestions: React.FC = () => {
  const { accentConfig } = useTheme();

  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

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

  const handleApplyGabaritoFix = async (report: QuestionReport, newLetter: string) => {
    try {
      const res = await fetch('/api/admin/curadoria/update-gabarito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: report.questionId,
          newCorrectAnswer: newLetter,
          justificativa: `Homologação médica de reporte do aluno: ${report.details}`
        })
      });

      if (res.ok) {
        // Marca o report como resolvido automaticamente
        await handleUpdateStatus(report.id, 'resolved');
        setActionSuccessMsg(`Gabarito da questão atualizado para "${newLetter}" e report resolvido!`);
        setTimeout(() => setActionSuccessMsg(null), 3500);
      } else {
        alert('Erro ao atualizar gabarito oficial no banco.');
      }
    } catch {
      alert('Erro de conexão ao salvar gabarito.');
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
                  {/* Atalho para Alterar Gabarito Instantâneo */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mr-1">
                      Corrigir Gabarito:
                    </span>
                    {(['A', 'B', 'C', 'D', 'E', 'ANULADA'] as const).map((letra) => (
                      <button
                        key={letra}
                        type="button"
                        onClick={() => handleApplyGabaritoFix(report, letra)}
                        className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                          q?.correctAnswer === letra
                            ? 'bg-emerald-500 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                        }`}
                        title={`Corrigir gabarito oficial para letra ${letra}`}
                      >
                        {letra}
                      </button>
                    ))}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
