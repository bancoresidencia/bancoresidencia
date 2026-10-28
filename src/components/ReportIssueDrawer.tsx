'use client';

import React, { useState } from 'react';
import { Flag, X, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Question, ReportReason } from '@/types';
import { reportQuestionIssue } from '@/services/questionService';
import { useTheme } from '@/context/ThemeContext';

interface ReportIssueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    user_metadata?: { full_name?: string };
  } | null;
  onReportSuccess?: (questionId: string) => void;
}

const REPORT_REASONS: { label: ReportReason; description: string }[] = [
  {
    label: 'Gabarito divergente / incorreto',
    description: 'A alternativa considerada correta pela banca discorda do gabarito oficial ou das diretrizes.'
  },
  {
    label: 'Erro no enunciado ou texto',
    description: 'Enunciado truncado, texto incompleto ou erro grave de digitação.'
  },
  {
    label: 'Alternativa com erro ou duplicada',
    description: 'Alternativas repetidas, cortadas ou com opções trocadas.'
  },
  {
    label: 'Imagem ilegível ou ausente',
    description: 'A questão cita uma imagem, ECG, raio-X ou tabela que não está visível.'
  },
  {
    label: 'Diretriz desatualizada',
    description: 'A questão aborda conduta médica que foi atualizada por diretriz recente.'
  },
  {
    label: 'Outro',
    description: 'Outro apontamento pertinente para auditoria médica.'
  }
];

export const ReportIssueDrawer: React.FC<ReportIssueDrawerProps> = ({
  isOpen,
  onClose,
  question,
  user,
  onReportSuccess
}) => {
  const { accentConfig } = useTheme();

  const [selectedReason, setSelectedReason] = useState<ReportReason>('Gabarito divergente / incorreto');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !question) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim() || details.trim().length < 5) {
      setErrorMsg('Por favor, adicione uma breve explicação detalhando o erro encontrado.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const studentName = user?.name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Estudante');
      const userMeta = {
        id: user?.id,
        email: user?.email,
        name: studentName
      };

      const result = await reportQuestionIssue(
        question.id,
        selectedReason,
        details.trim(),
        userMeta
      );

      if (result.success) {
        setIsSubmitted(true);
        onReportSuccess?.(question.id);
        setTimeout(() => {
          setIsSubmitted(false);
          setDetails('');
          onClose();
        }, 1600);
      } else {
        setErrorMsg(result.message || 'Erro ao enviar apontamento.');
      }
    } catch {
      setErrorMsg('Falha de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-zinc-900 dark:text-zinc-100"
        style={{ boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)' }}
      >
        {/* Header do Drawer */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Flag className="w-5 h-5 fill-amber-500/20 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                Reportar Erro na Questão
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {question.institution || question.banca} {question.year} • {question.especialidade}
                {question.code ? ` • Cód: #${question.code}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário / Conteúdo */}
        {isSubmitted ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-in zoom-in-75 duration-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">
              Apontamento Enviado!
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              Nossa equipe médica especializada irá auditar a questão e homologar a correção no banco de dados. Obrigado pela contribuição!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
            {/* Aviso breve */}
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Identificou discordância com gabarito oficial, diretriz recente ou erro no enunciado? Explique abaixo para auditoria da banca médica.
              </span>
            </div>

            {/* Seleção de Motivo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Qual é a natureza do problema?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REPORT_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason.label;
                  return (
                    <button
                      key={reason.label}
                      type="button"
                      onClick={() => setSelectedReason(reason.label)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-bold shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{reason.label}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comentário explicativo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Explicação do erro para a banca médica:
                </label>
                <span className="text-[10px] text-zinc-400">
                  {details.length}/1000
                </span>
              </div>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 1000))}
                rows={4}
                required
                placeholder="Exemplo: O gabarito oficial da banca indica alternativa B, mas de acordo com o protocolo do Ministério da Saúde / Diretriz 2024, a conduta de escolha é a alternativa C..."
                className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all resize-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-500 font-medium">
                {errorMsg}
              </p>
            )}

            {/* Rodapé / Ações */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || details.trim().length < 5}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95"
                style={{
                  backgroundColor: accentConfig.primaryHex
                }}
              >
                {isSubmitting ? (
                  <span>Enviando...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Apontamento</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
