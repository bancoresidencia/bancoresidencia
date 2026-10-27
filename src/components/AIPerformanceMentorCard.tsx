'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Stethoscope
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { UserStats, UserAnswerItem } from '@/types';

interface AIPerformanceMentorCardProps {
  stats: UserStats;
  userAnswers: Record<string, UserAnswerItem>;
  criticalSubfocos: {
    subfoco: string;
    tema: string;
    specialty: string;
    errors: number;
    accuracy: number;
  }[];
  targetExam?: string;
  initialExpanded?: boolean;
  onStartRecoverySession?: (specialty: string, tema: string, subfoco: string) => void;
}

interface DiagnosisData {
  diagnosticoPontos?: string[];
  diagnosticoResumo?: string;
  alertaTRIPontos?: string[];
  alertaTRI?: string;
  padraoErrosPontos?: string[];
  padraoDeDistracao?: string;
  planoDeAcaoImediato: string[];
  recomendacaoPratica: {
    specialty: string;
    tema: string;
    subfoco: string;
    questoesSugeridas: number;
    motivo: string;
  };
}

export const AIPerformanceMentorCard: React.FC<AIPerformanceMentorCardProps> = ({
  stats,
  userAnswers,
  criticalSubfocos,
  targetExam = 'ENARE 2026',
  initialExpanded = false,
  onStartRecoverySession
}) => {
  const { accentConfig } = useTheme();
  const [data, setData] = useState<DiagnosisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Por padrão começa com a aba fechada (recolhida) conforme solicitado
  const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded);
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);

  const fetchDiagnosis = async (isManualRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const recentMistakesSample = Object.values(userAnswers)
        .filter((a) => !a.isCorrect)
        .slice(-15)
        .map((a) => ({
          specialty: a.specialty,
          tema: a.tema,
          subfoco: a.subfoco,
          difficulty: a.difficulty,
          errorReason: a.errorReason
        }));

      const res = await fetch('/api/ai/performance-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetExam,
          totalAnswered: stats.totalAnswered || 0,
          totalCorrect: stats.totalCorrect || 0,
          accuracyRate: stats.accuracyRate || 0,
          percentil: stats.percentileInfo?.formattedPercentile || 'P75.0',
          theta: stats.percentileInfo?.theta || 1.0,
          bySpecialty: (stats.bySpecialty || []).slice(0, 6),
          criticalSubfocos: criticalSubfocos.slice(0, 5),
          recentMistakesSample,
          refresh: isManualRefresh
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Não foi possível gerar a auditoria com IA.');
      }

      setData(json);
    } catch (err: unknown) {
      console.error('Erro ao buscar auditoria de performance:', err);
      const msg = err instanceof Error ? err.message : 'Falha ao conectar com o Mentor Clínico IA.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Se houver questões respondidas, busca em background para estar pronto quando o aluno expandir
  useEffect(() => {
    if (!data && !isLoading && (stats.totalAnswered || 0) > 0) {
      fetchDiagnosis(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.totalAnswered]);

  const handleStartRecovery = async () => {
    if (!data?.recomendacaoPratica || !onStartRecoverySession) return;
    setIsStartingSession(true);
    try {
      await onStartRecoverySession(
        data.recomendacaoPratica.specialty,
        data.recomendacaoPratica.tema,
        data.recomendacaoPratica.subfoco
      );
    } finally {
      setIsStartingSession(false);
    }
  };

  // Normaliza pontos do diagnóstico (array de tópicos objetivos)
  const diagnosticoList: string[] = data?.diagnosticoPontos && data.diagnosticoPontos.length > 0
    ? data.diagnosticoPontos
    : data?.diagnosticoResumo
      ? [data.diagnosticoResumo]
      : [];

  // Normaliza alertas TRI
  const alertaTRIList: string[] = data?.alertaTRIPontos && data.alertaTRIPontos.length > 0
    ? data.alertaTRIPontos
    : data?.alertaTRI
      ? [data.alertaTRI]
      : [];

  // Normaliza padrões de erro
  const padraoErrosList: string[] = data?.padraoErrosPontos && data.padraoErrosPontos.length > 0
    ? data.padraoErrosPontos
    : data?.padraoDeDistracao
      ? [data.padraoDeDistracao]
      : [];

  // Helper para renderizar texto didático com marcações **negrito**
  const renderBulletText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <span className="leading-relaxed">
        {parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const content = part.slice(2, -2);
            return (
              <strong key={idx} className="font-bold text-slate-900 dark:text-white mr-1">
                {content}
              </strong>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
      {/* Header do Card (clicável para expandir/recolher - Fechado por padrão no Raio-X) */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-3.5 sm:p-4.5 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-zinc-900/60 cursor-pointer select-none hover:bg-slate-100/70 dark:hover:bg-zinc-800/50 transition-colors ${
          isExpanded ? 'border-b border-[var(--card-border)]' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
            style={{
              backgroundColor: accentConfig.primaryHex + '18',
              color: accentConfig.primaryHex
            }}
          >
            <Sparkles className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Mentor IA
              </h3>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data && isExpanded && (
            <button
              type="button"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                fetchDiagnosis(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <RotateCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} style={{ color: accentConfig.primaryHex }} />
              <span>Atualizar</span>
            </button>
          )}

          <div
            className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-2xs hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
            title={isExpanded ? 'Recolher Mentor' : 'Expandir Mentor'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" style={{ color: accentConfig.primaryHex }} />
            )}
          </div>
        </div>
      </div>

      {/* Corpo da Análise (visível APENAS quando expandido pelo usuário) */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-200 text-xs">
          {isLoading && !data && (
            <div className="py-8 text-center space-y-2.5">
              <Loader2 className="w-7 h-7 animate-spin mx-auto" style={{ color: accentConfig.primaryHex }} />
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Auditando métricas psicométricas e gerando tópicos didáticos...
              </p>
            </div>
          )}

          {error && !data && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => fetchDiagnosis(true)}
                className="font-bold underline cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!isLoading && !data && !error && (
            <div className="py-6 text-center space-y-3">
              <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
                Gere uma auditoria pedagógica em tópicos verticais sobre seus pontos fracos e perda na nota TRI.
              </p>
              <button
                type="button"
                onClick={() => fetchDiagnosis(true)}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm transition-all cursor-pointer hover:opacity-90 inline-flex items-center gap-1.5"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gerar Auditoria em Tópicos</span>
              </button>
            </div>
          )}

          {data && (
            <div className="space-y-4">
              {/* 1. Diagnóstico Clínico do Preceptor (Tópicos verticais um em cima do outro) */}
              <div
                className="p-3.5 sm:p-4 rounded-xl border space-y-3"
                style={{
                  backgroundColor: accentConfig.primaryHex + '08',
                  borderColor: accentConfig.primaryHex + '25'
                }}
              >
                <div className="flex items-center gap-2 font-bold text-xs" style={{ color: accentConfig.primaryHex }}>
                  <Stethoscope className="w-4 h-4 shrink-0" />
                  <span className="uppercase tracking-wider text-[11px]">Diagnóstico Direto do Preceptor</span>
                </div>
                <div className="space-y-2">
                  {diagnosticoList.map((ponto, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/80 flex items-start gap-2.5 text-slate-800 dark:text-zinc-200 text-xs shadow-2xs"
                    >
                      <span className="font-bold text-sm leading-none mt-0.5" style={{ color: accentConfig.primaryHex }}>•</span>
                      <div className="flex-1">{renderBulletText(ponto)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Risco na Nota TRI (Tópicos verticais um em cima do outro) */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="uppercase tracking-wider text-[11px]">Impacto na Nota da TRI</span>
                </div>
                <div className="space-y-2">
                  {alertaTRIList.map((ponto, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-rose-500/15 flex items-start gap-2.5 text-slate-800 dark:text-zinc-200 text-xs shadow-2xs"
                    >
                      <span className="text-rose-500 font-bold text-sm leading-none mt-0.5">•</span>
                      <div className="flex-1">{renderBulletText(ponto)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Padrão de Erro & Falhas Cognitivas (Tópicos verticais um em cima do outro) */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <Brain className="w-4 h-4 shrink-0" />
                  <span className="uppercase tracking-wider text-[11px]">Padrões de Falha & Armadilhas da Banca</span>
                </div>
                <div className="space-y-2">
                  {padraoErrosList.map((ponto, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-amber-500/15 flex items-start gap-2.5 text-slate-800 dark:text-zinc-200 text-xs shadow-2xs"
                    >
                      <span className="text-amber-500 font-bold text-sm leading-none mt-0.5">•</span>
                      <div className="flex-1">{renderBulletText(ponto)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Prescrição Direta para Hoje (Tópicos sequenciais um em cima do outro) */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="uppercase tracking-wider text-[11px]">Prescrição Direta para Hoje</span>
                </div>
                <div className="space-y-2">
                  {data.planoDeAcaoImediato.map((action, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-emerald-500/15 flex items-start gap-2.5 text-slate-800 dark:text-zinc-200 text-xs shadow-2xs"
                    >
                      <span className="font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] shrink-0">
                        Passo {i + 1}
                      </span>
                      <div className="flex-1">{renderBulletText(action)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Caderno de Resgate Cirúrgico Recomendado */}
              {data.recomendacaoPratica && onStartRecoverySession && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-rose-500/10 via-[var(--bg-card)] to-[var(--bg-card)] border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        Resgate Cirúrgico Recomendado
                      </span>
                      <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 font-mono">
                        {data.recomendacaoPratica.questoesSugeridas} questões
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {data.recomendacaoPratica.specialty} • {data.recomendacaoPratica.tema} —{' '}
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {data.recomendacaoPratica.subfoco}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {data.recomendacaoPratica.motivo}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isStartingSession}
                    onClick={handleStartRecovery}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-md shadow-rose-600/25 bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer shrink-0 disabled:opacity-75 disabled:cursor-wait"
                  >
                    {isStartingSession ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Abrindo Simulado...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Iniciar Resgate Recomendado</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
