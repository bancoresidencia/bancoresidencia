'use client';

import React from 'react';
import {
  X,
  Clock,
  BookOpen,
  CalendarDays,
  Trash2,
  CheckCircle2,
  FileQuestion,
  Brain,
  RotateCcw,
  Trophy,
  Sparkles,
  ExternalLink,
  FileText
} from 'lucide-react';
import { StudySession, StudyType } from '@/types/studyTimer';
import { DailyScheduleSlot } from './scheduleTypes';
import { CORE_SPECIALTIES } from '@/services/taxonomySearchService';
import { formatSecondsToShort } from '@/context/StudyTimerContext';

interface DayStudyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string; // "YYYY-MM-DD"
  sessions: StudySession[];
  googleEvents?: DailyScheduleSlot[];
  onDeleteSession?: (sessionId: string) => void;
  onNavigateToDayView?: (dateStr: string) => void;
}

const TYPE_ICONS: Record<StudyType, React.ReactNode> = {
  questoes: <FileQuestion className="w-3.5 h-3.5" />,
  teoria: <BookOpen className="w-3.5 h-3.5" />,
  resumo: <FileText className="w-3.5 h-3.5" />,
  flashcards: <Brain className="w-3.5 h-3.5" />,
  revisao: <RotateCcw className="w-3.5 h-3.5" />,
  simulado: <Trophy className="w-3.5 h-3.5" />,
  outro: <Sparkles className="w-3.5 h-3.5" />
};

const TYPE_LABELS: Record<StudyType, string> = {
  questoes: 'Questões',
  teoria: 'Teoria / Leitura',
  resumo: 'Resumo Clínico',
  flashcards: 'Flashcards',
  revisao: 'Revisão',
  simulado: 'Simulado',
  outro: 'Estudo Geral'
};

export const DayStudyDetailsModal: React.FC<DayStudyDetailsModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  sessions,
  googleEvents = [],
  onDeleteSession,
  onNavigateToDayView
}) => {
  if (!isOpen) return null;

  // Formatação amigável da data (ex: "Sábado, 7 de Novembro de 2026")
  let dateTitle = dateStr;
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateTitle = dateObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    dateTitle = dateTitle.charAt(0).toUpperCase() + dateTitle.slice(1);
  } catch {}

  const totalSeconds = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const totalFormatted = formatSecondsToShort(totalSeconds);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <CalendarDays className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {dateTitle}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Histórico de sessões de estudo realizadas e plantões do dia
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo Rápido do Dia */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
              Tempo Líquido do Dia
            </span>
            <div className="text-xl font-black font-[var(--font-inter)] tabular-nums tracking-tight text-emerald-700 dark:text-emerald-300">
              {totalFormatted}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
              Sessões Realizadas
            </span>
            <div className="text-xl font-black font-[var(--font-inter)] tabular-nums tracking-tight text-blue-700 dark:text-blue-300">
              {sessions.length} {sessions.length === 1 ? 'sessão' : 'sessões'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-0.5">
              Google Agenda
            </span>
            <div className="text-xl font-black font-[var(--font-inter)] tabular-nums tracking-tight text-zinc-800 dark:text-zinc-200">
              {googleEvents.length} {googleEvents.length === 1 ? 'evento' : 'eventos'}
            </div>
          </div>
        </div>

        {/* Corpo Rolável */}
        <div className="overflow-y-auto space-y-5 pr-1 flex-1">
          {/* Seção 1: Sessões Realizadas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sessões de Estudo Concluídas ({sessions.length})</span>
              </span>
            </div>

            {sessions.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
                Nenhuma sessão de estudo cronometrada gravada neste dia.
              </div>
            ) : (
              <div className="space-y-2.5">
                {sessions.map((sess) => {
                  const specColor =
                    CORE_SPECIALTIES.find(
                      (c) => c.name.toLowerCase() === (sess.taxonomy.especialidade || '').toLowerCase()
                    )?.color || '#3b82f6';

                  const topicTitle =
                    sess.taxonomy.subfoco ||
                    sess.taxonomy.foco ||
                    sess.taxonomy.tema ||
                    sess.taxonomy.especialidade ||
                    'Estudo Livre';

                  let startFormatted = '';
                  let endFormatted = '';
                  try {
                    const sDate = new Date(sess.startTime);
                    const eDate = new Date(sess.endTime);
                    startFormatted = sDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    endFormatted = eDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  } catch {}

                  return (
                    <div
                      key={sess.id}
                      className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col gap-2 relative overflow-hidden"
                    >
                      {/* Faixa lateral colorida com a cor da especialidade */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: specColor }}
                      />

                      <div className="flex items-start justify-between gap-3 pl-1">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                              {topicTitle}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 inline-flex items-center gap-1">
                              {TYPE_ICONS[sess.studyType]}
                              <span>{TYPE_LABELS[sess.studyType]}</span>
                            </span>
                          </div>
                          {sess.taxonomy.rawLabel && (
                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block truncate mt-0.5">
                              {sess.taxonomy.rawLabel}
                            </span>
                          )}
                        </div>

                        {/* Duração & Ações */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400 block">
                              {sess.durationFormatted}
                            </span>
                            {startFormatted && (
                              <span className="text-[10px] text-zinc-400 block font-mono">
                                {startFormatted} {endFormatted ? `– ${endFormatted}` : ''}
                              </span>
                            )}
                          </div>
                          {onDeleteSession && (
                            <button
                              type="button"
                              onClick={() => onDeleteSession(sess.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Excluir registro desta sessão"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dados adicionais: Questões / Acertos / Erros / Aproveitamento / Anotações */}
                      {(Boolean(sess.questionsCount && sess.questionsCount > 0) || sess.notes) && (
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pl-1 gap-2 flex-wrap">
                          {sess.questionsCount && sess.questionsCount > 0 ? (
                            <div className="flex items-center gap-2 font-mono text-[11px] font-semibold flex-wrap">
                              <span className="text-blue-600 dark:text-blue-400">
                                {sess.questionsCount} questões resolvidas
                              </span>
                              <span className="text-zinc-300 dark:text-zinc-700">•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {sess.correctCount || 0} acertos
                              </span>
                              <span className="text-zinc-300 dark:text-zinc-700">•</span>
                              <span className="text-rose-500 font-bold">
                                {sess.incorrectCount !== undefined
                                  ? sess.incorrectCount
                                  : Math.max(0, sess.questionsCount - (sess.correctCount || 0))} erros
                              </span>
                              <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300 font-bold">
                                {sess.accuracy !== undefined
                                  ? `${sess.accuracy}%`
                                  : `${Math.round(((sess.correctCount || 0) / sess.questionsCount) * 100)}%`}
                              </span>
                            </div>
                          ) : null}
                          {sess.notes && (
                            <div className="text-[11px] italic text-zinc-500 dark:text-zinc-400 truncate max-w-full">
                              &ldquo;{sess.notes}&rdquo;
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seção 2: Compromissos Sincronizados (Google Agenda) */}
          {googleEvents.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                  <span>Google Agenda & Plantões Sincronizados ({googleEvents.length})</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">Preservados sem conflito</span>
              </div>

              <div className="space-y-2">
                {googleEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-950/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                        {evt.title}
                      </span>
                      {evt.description && (
                        <span className="text-[11px] text-zinc-500 truncate block">
                          {evt.description}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 shrink-0">
                      {evt.startTime} – {evt.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com botões */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0 gap-2">
          {onNavigateToDayView ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToDayView(dateStr);
              }}
              className="px-4 py-2 rounded-xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Ver no Cronograma Diário</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
